import {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from '../firebase/firestore';
import { auth } from '../firebase/config';
import { getUserProfile } from './userService';
import { getService } from './serviceService';
import { calculateEstimatedWaitTime } from '../utils/queueCalculations';
import { predictWaitingTime } from './mlService';
import { createNotification } from './notificationService';
import { createHistoryRecord } from './historyService';

/**
 * Service to manage Tokens and Queue state transitions: tokens/{tokenId}
 */

export const getActiveTokensForService = async (serviceId) => {
  if (!serviceId) return [];
  const q = query(
    collection(db, 'tokens'),
    where('serviceId', '==', serviceId),
    where('status', 'in', ['waiting', 'called', 'in_service'])
  );
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.tokenSequence || 0) - (b.tokenSequence || 0));
  return items;
};

export const getUserActiveToken = async (userId) => {
  if (!userId) return null;
  const q = query(
    collection(db, 'tokens'),
    where('userId', '==', userId),
    where('status', 'in', ['waiting', 'called', 'in_service']),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const subscribeUserActiveToken = (userId, callback) => {
  if (!userId) {
    callback(null);
    return () => {};
  }
  const q = query(
    collection(db, 'tokens'),
    where('userId', '==', userId),
    where('status', 'in', ['waiting', 'called', 'in_service']),
    limit(1)
  );

  return onSnapshot(
    q,
    (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Active token snapshot error:', err);
      callback(null);
    }
  );
};

export const subscribeServiceTokens = (serviceId, callback) => {
  if (!serviceId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'tokens'),
    where('serviceId', '==', serviceId),
    where('status', 'in', ['waiting', 'called', 'in_service'])
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (a.tokenSequence || 0) - (b.tokenSequence || 0));
      callback(items);
    },
    (err) => {
      console.warn(`Tokens snapshot error for service ${serviceId}:`, err);
      callback([]);
    }
  );
};

export const subscribeServiceAllTokens = (serviceId, callback) => {
  if (!serviceId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'tokens'),
    where('serviceId', '==', serviceId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (a.tokenSequence || 0) - (b.tokenSequence || 0));
      callback(items);
    },
    (err) => {
      console.warn(`All tokens snapshot error for service ${serviceId}:`, err);
      callback([]);
    }
  );
};

export const subscribeAllActiveTokens = (callback) => {
  const q = query(
    collection(db, 'tokens'),
    where('status', 'in', ['waiting', 'called', 'in_service']),
    limit(150)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      callback(items);
    },
    (err) => {
      console.warn('All active tokens snapshot error:', err);
      callback([]);
    }
  );
};

export const subscribeAllTokens = (callback, limitCount = 200) => {
  const q = query(
    collection(db, 'tokens'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      callback(items);
    },
    (err) => {
      console.warn('All tokens snapshot error:', err);
      callback([]);
    }
  );
};

/**
 * Atomic token generation via Firestore Transaction to prevent race conditions & duplicate tokens
 */
export const joinQueue = async ({ user, serviceId, studentName = 'Guest Student' }) => {
  if (!user || !user.uid) {
    throw new Error('A valid queue session is required.');
  }
  if (!serviceId) {
    throw new Error('Service ID is required.');
  }

  // 1. Check whether student already has an active token
  const existingActive = await getUserActiveToken(user.uid);
  if (existingActive) {
    // Requirement 6: If an active token already exists, return existing token instead of throwing an error
    return { ...existingActive, isExisting: true };
  }

  // 2. Verify service availability
  const service = await getService(serviceId);
  if (!service) {
    throw new Error('Requested campus service could not be found.');
  }
  if (service.status !== 'open') {
    throw new Error('This service counter is currently closed.');
  }

  const queueRef = doc(db, 'queues', serviceId);
  const tokenDocRef = doc(collection(db, 'tokens'));

  // 3. Read current waiting tokens to calculate position & ML ETA accurately
  const tokensSnapshot = await getDocs(
    query(
      collection(db, 'tokens'),
      where('serviceId', '==', serviceId),
      where('status', '==', 'waiting')
    )
  );
  const peopleAhead = tokensSnapshot.size;

  // 4. ML wait-time prediction using trained model with deterministic fallback
  const mlResult = await predictWaitingTime({
    peopleAhead,
    queueLength: peopleAhead + 1,
    activeCounters: service.activeCounters || 1,
    averageServiceTime: service.averageServiceTime || 5,
    serviceType: service.departmentName || service.departmentId || service.name,
    serviceName: service.name,
  });

  const estimatedWait = mlResult.estimatedWait;
  const predictionSource = mlResult.predictionSource || 'ml';

  let generatedTokenData = null;

  await runTransaction(db, async (transaction) => {
    const queueDoc = await transaction.get(queueRef);

    let nextSequence = 1;
    let prefix = service.prefix || 'Q';
    let activeCounters = service.activeCounters || 1;

    if (queueDoc.exists()) {
      const qData = queueDoc.data();
      nextSequence = (qData.nextTokenSequence || 1);
      prefix = qData.prefix || service.prefix || 'Q';
      activeCounters = qData.activeCounters || service.activeCounters || 1;
    }

    const tokenNumber = `${prefix}-${String(nextSequence).padStart(3, '0')}`;

    const tokenPayload = {
      tokenId: tokenDocRef.id,
      tokenNumber,
      tokenSequence: nextSequence,
      prefix,
      userId: user.uid,
      userName: user.displayName || user.name || 'Student',
      userEmail: user.email || '',
      studentId: user.studentId || '',
      serviceId: service.id,
      serviceName: service.name,
      departmentId: service.departmentId || '',
      departmentName: service.departmentName || '',
      status: 'waiting',
      position: peopleAhead + 1,
      peopleAhead,
      estimatedWait,
      predictionSource, // 'ml' | 'fallback'
      counterNumber: null,
      calledByStaffId: null,
      createdAt: serverTimestamp(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      updatedAt: serverTimestamp(),
    };

    // Update queue doc with incremented sequence
    transaction.set(
      queueRef,
      {
        serviceId: service.id,
        departmentId: service.departmentId || '',
        prefix,
        nextTokenSequence: nextSequence + 1,
        activeCounters,
        status: 'open',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Save token
    transaction.set(tokenDocRef, tokenPayload);
    generatedTokenData = { id: tokenDocRef.id, ...tokenPayload };
  });

  // Create initial notification for student
  if (generatedTokenData) {
    await createNotification({
      userId: user.uid,
      title: 'Token Generated',
      message: `Token ${generatedTokenData.tokenNumber} created for ${service.name}. You are #${generatedTokenData.position} in line.`,
      type: 'queue',
    });
  }

  return generatedTokenData;
};

export const cancelToken = async (tokenId, userId) => {
  if (!tokenId || !userId) throw new Error('Token ID and User ID are required.');
  
  const tokenRef = doc(db, 'tokens', tokenId);
  const snap = await getDoc(tokenRef);
  if (!snap.exists()) {
    throw new Error('Token not found.');
  }

  const tokenData = snap.data();
  if (tokenData.userId !== userId) {
    throw new Error('Unauthorized: You can only cancel your own token.');
  }
  if (tokenData.status === 'completed' || tokenData.status === 'cancelled') {
    throw new Error(`Token is already ${tokenData.status}.`);
  }

  await updateDoc(tokenRef, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Record into history
  await createHistoryRecord({
    ...tokenData,
    id: tokenId,
    status: 'cancelled',
  });

  // Notify student
  await createNotification({
    userId,
    title: 'Queue Cancelled',
    message: `Your token ${tokenData.tokenNumber} for ${tokenData.serviceName} has been cancelled.`,
    type: 'alert',
  });

  // Recalculate ML wait times for remaining waiting tokens
  if (tokenData.serviceId) {
    recalculateQueuePredictions(tokenData.serviceId).catch(err =>
      console.warn('Queue recalculation failed:', err)
    );
  }

  return true;
};

/**
 * Recalculates position, people ahead, and ML estimated wait time for all waiting tokens in a service.
 */
export const recalculateQueuePredictions = async (serviceId) => {
  if (!serviceId) return;
  try {
    const service = await getService(serviceId);
    if (!service) return;

    // Fetch all currently waiting tokens for this service
    const q = query(
      collection(db, 'tokens'),
      where('serviceId', '==', serviceId),
      where('status', '==', 'waiting')
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const waitingTokens = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in memory to avoid composite index requirement
    waitingTokens.sort((a, b) => (a.tokenSequence || 0) - (b.tokenSequence || 0));

    const totalWaiting = waitingTokens.length;

    await Promise.all(
      waitingTokens.map(async (token, i) => {
        const peopleAhead = i;
        const position = i + 1;

        const mlResult = await predictWaitingTime({
          peopleAhead,
          queueLength: totalWaiting,
          activeCounters: service.activeCounters || 1,
          averageServiceTime: service.averageServiceTime || 5,
          serviceType: service.departmentName || service.departmentId || service.name,
          serviceName: service.name,
        });

        const tokenRef = doc(db, 'tokens', token.id);
        return updateDoc(tokenRef, {
          position,
          peopleAhead,
          estimatedWait: mlResult.estimatedWait,
          predictionSource: mlResult.predictionSource || 'ml',
          updatedAt: serverTimestamp(),
        });
      })
    );
  } catch (err) {
    console.warn(`Error recalculating queue predictions for service ${serviceId}:`, err);
  }
};

/**
 * Validates staff authentication and authorization before performing queue operations.
 */
export const verifyStaffAuth = async (staffUser = null) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    const err = new Error('Missing or insufficient permissions: No authenticated user session found.');
    err.code = 'permission-denied';
    throw err;
  }

  const uid = staffUser?.uid || currentUser.uid;
  const profile = await getUserProfile(uid, currentUser.email);
  if (!profile) {
    const err = new Error(`Missing or insufficient permissions: Profile not found for UID: ${uid}`);
    err.code = 'permission-denied';
    throw err;
  }

  const role = String(profile?.role || '').trim().toLowerCase();
  const status = String(profile?.status || 'active').trim().toLowerCase();

  if (role !== 'staff' && role !== 'admin') {
    const err = new Error(`Missing or insufficient permissions: Detected role "${role}" is not authorized for staff operations.`);
    err.code = 'permission-denied';
    throw err;
  }

  if (status === 'inactive') {
    const err = new Error('Staff account is inactive. Please contact administrator.');
    err.code = 'permission-denied';
    throw err;
  }

  return { uid, profile, role, status };
};

export const callNextToken = async (serviceId, staffUser, counterNumber = 1, specificTokenId = null) => {
  try {
    await verifyStaffAuth(staffUser);

    let nextToken = null;

    if (specificTokenId) {
      const tRef = doc(db, 'tokens', specificTokenId);
      const snap = await getDoc(tRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'waiting' || data.status === 'called') {
          nextToken = { id: snap.id, ...data };
        }
      }
    }

    if (!nextToken) {
      // Find next waiting token: if serviceId is provided and not 'all', query for that service; otherwise query across all services
      let q;
      if (serviceId && serviceId !== 'all') {
        q = query(
          collection(db, 'tokens'),
          where('serviceId', '==', serviceId),
          where('status', '==', 'waiting')
        );
      } else {
        q = query(
          collection(db, 'tokens'),
          where('status', '==', 'waiting')
        );
      }

      const snap = await getDocs(q);
      if (snap.empty) {
        return null;
      }

      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt ascending (oldest waiting token first)
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.tokenSequence || 0) - (b.tokenSequence || 0);
      });
      nextToken = docs[0];
    }

    const tokenRef = doc(db, 'tokens', nextToken.id);
    const assignedCounter = parseInt(counterNumber, 10) || staffUser?.counter || 1;

    await updateDoc(tokenRef, {
      status: 'called',
      calledAt: serverTimestamp(),
      counterNumber: assignedCounter,
      calledByStaffId: staffUser?.uid || auth.currentUser?.uid || null,
      updatedAt: serverTimestamp(),
    });

    // Update currentTokenNumber on queue document
    const targetServiceId = nextToken.serviceId || serviceId;
    if (targetServiceId) {
      const queueRef = doc(db, 'queues', targetServiceId);
      await updateDoc(queueRef, {
        currentTokenNumber: nextToken.tokenNumber,
        updatedAt: serverTimestamp(),
      }).catch((err) => {
        console.warn('Queue doc update warning:', err);
      });
    }

    // Notify student
    if (nextToken.userId) {
      await createNotification({
        userId: nextToken.userId,
        title: 'Token Called!',
        message: `Token ${nextToken.tokenNumber} is now being called! Please proceed immediately to Counter ${assignedCounter}.`,
        type: 'alert',
      }).catch((err) => console.warn('Notification warning:', err));
    }

    // Recalculate ML predictions for remaining waiting tokens asynchronously
    if (targetServiceId) {
      recalculateQueuePredictions(targetServiceId).catch(err => 
        console.warn('Queue recalculation failed:', err)
      );
    }

    return { id: nextToken.id, ...nextToken, status: 'called', counterNumber: assignedCounter };
  } catch (error) {
    console.error("STAFF QUEUE ERROR:", error);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR MESSAGE:", error?.message);
    throw error;
  }
};

export const startService = async (tokenId, staffUser, counterNumber = 1) => {
  try {
    await verifyStaffAuth(staffUser);

    if (!tokenId) throw new Error('Token ID is required.');
    const tokenRef = doc(db, 'tokens', tokenId);
    const snap = await getDoc(tokenRef);
    if (!snap.exists()) throw new Error('Token not found.');

    const tokenData = snap.data();

    if (tokenData.status === 'in_service') {
      return { id: tokenId, ...tokenData };
    }
    if (tokenData.status === 'completed') {
      throw new Error('Token has already been completed.');
    }
    if (tokenData.status === 'cancelled') {
      throw new Error('Token has already been cancelled.');
    }

    const assignedCounter = parseInt(counterNumber, 10) || tokenData.counterNumber || staffUser?.counter || 1;

    const updatePayload = {
      status: 'in_service',
      serviceStartedAt: tokenData.serviceStartedAt || serverTimestamp(),
      counterNumber: assignedCounter,
      calledByStaffId: staffUser?.uid || auth.currentUser?.uid || tokenData.calledByStaffId || null,
      updatedAt: serverTimestamp(),
    };

    if (!tokenData.calledAt) {
      updatePayload.calledAt = serverTimestamp();
    }

    await updateDoc(tokenRef, updatePayload);

    if (tokenData.userId) {
      await createNotification({
        userId: tokenData.userId,
        title: 'Service Started',
        message: `Your appointment for ${tokenData.serviceName || 'service'} has started at Counter ${assignedCounter}.`,
        type: 'info',
      }).catch((err) => console.warn('Notification warning:', err));
    }

    return { id: tokenId, ...tokenData, ...updatePayload, status: 'in_service' };
  } catch (error) {
    console.error("STAFF QUEUE ERROR:", error);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR MESSAGE:", error?.message);
    throw error;
  }
};

export const completeService = async (tokenId, staffUser) => {
  try {
    await verifyStaffAuth(staffUser);

    if (!tokenId) throw new Error('Token ID is required.');
    const tokenRef = doc(db, 'tokens', tokenId);
    const snap = await getDoc(tokenRef);
    if (!snap.exists()) throw new Error('Token not found.');

    const tokenData = snap.data();
    if (tokenData.status === 'completed') {
      return true;
    }

    const now = new Date();

    // Calculate waiting time & service time in minutes
    const createdAtDate = tokenData.createdAt?.toDate ? tokenData.createdAt.toDate() : new Date();
    const startedDate = tokenData.serviceStartedAt?.toDate ? tokenData.serviceStartedAt.toDate() : (tokenData.calledAt?.toDate ? tokenData.calledAt.toDate() : createdAtDate);
    
    const waitingMinutes = Math.max(1, Math.round((startedDate.getTime() - createdAtDate.getTime()) / 60000));
    const serviceMinutes = Math.max(1, Math.round((now.getTime() - startedDate.getTime()) / 60000));

    await updateDoc(tokenRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      waitingTime: waitingMinutes,
      serviceTime: serviceMinutes,
      updatedAt: serverTimestamp(),
    });

    // Archive in history
    await createHistoryRecord({
      ...tokenData,
      id: tokenId,
      status: 'completed',
      waitingTime: waitingMinutes,
      serviceTime: serviceMinutes,
      calledByStaffId: staffUser?.uid || auth.currentUser?.uid || tokenData.calledByStaffId,
    }).catch(err => console.warn('History creation warning:', err));

    // Notify student
    if (tokenData.userId) {
      await createNotification({
        userId: tokenData.userId,
        title: 'Service Completed',
        message: `Your service for ${tokenData.serviceName || 'campus service'} has been marked completed. Thank you!`,
        type: 'success',
      }).catch(err => console.warn('Notification warning:', err));
    }

    // Recalculate waiting tokens ML predictions
    if (tokenData.serviceId) {
      recalculateQueuePredictions(tokenData.serviceId).catch(err => 
        console.warn('Queue recalculation failed:', err)
      );
    }

    return true;
  } catch (error) {
    console.error("STAFF QUEUE ERROR:", error);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR MESSAGE:", error?.message);
    throw error;
  }
};

export const skipToken = async (tokenId, staffUser, reason = 'No show') => {
  try {
    await verifyStaffAuth(staffUser);

    if (!tokenId) throw new Error('Token ID is required.');
    const tokenRef = doc(db, 'tokens', tokenId);
    const snap = await getDoc(tokenRef);
    if (!snap.exists()) throw new Error('Token not found.');

    const tokenData = snap.data();

    await updateDoc(tokenRef, {
      status: 'skipped',
      skipReason: reason,
      updatedAt: serverTimestamp(),
    });

    await createHistoryRecord({
      ...tokenData,
      id: tokenId,
      status: 'skipped',
      skipReason: reason,
      calledByStaffId: staffUser?.uid || auth.currentUser?.uid || tokenData.calledByStaffId,
    }).catch(err => console.warn('History creation warning:', err));

    if (tokenData.userId) {
      await createNotification({
        userId: tokenData.userId,
        title: 'Token Skipped',
        message: `Your token ${tokenData.tokenNumber} was marked skipped (${reason}). Please visit counter staff if you are present.`,
        type: 'alert',
      }).catch(err => console.warn('Notification warning:', err));
    }

    if (tokenData.serviceId) {
      recalculateQueuePredictions(tokenData.serviceId).catch(err => 
        console.warn('Queue recalculation failed:', err)
      );
    }

    return true;
  } catch (error) {
    console.error("STAFF QUEUE ERROR:", error);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR MESSAGE:", error?.message);
    throw error;
  }
};

export const staffCancelToken = async (tokenId, staffUser, reason = 'Cancelled by counter operator') => {
  try {
    await verifyStaffAuth(staffUser);

    if (!tokenId) throw new Error('Token ID is required.');
    const tokenRef = doc(db, 'tokens', tokenId);
    const snap = await getDoc(tokenRef);
    if (!snap.exists()) throw new Error('Token not found.');

    const tokenData = snap.data();

    await updateDoc(tokenRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelReason: reason,
      updatedAt: serverTimestamp(),
    });

    await createHistoryRecord({
      ...tokenData,
      id: tokenId,
      status: 'cancelled',
      cancelReason: reason,
      calledByStaffId: staffUser?.uid || auth.currentUser?.uid || tokenData.calledByStaffId,
    }).catch(err => console.warn('History creation warning:', err));

    if (tokenData.userId) {
      await createNotification({
        userId: tokenData.userId,
        title: 'Queue Cancelled by Staff',
        message: `Your token ${tokenData.tokenNumber} for ${tokenData.serviceName || 'service'} was cancelled by staff (${reason}).`,
        type: 'alert',
      }).catch(err => console.warn('Notification warning:', err));
    }

    if (tokenData.serviceId) {
      recalculateQueuePredictions(tokenData.serviceId).catch(err => 
        console.warn('Queue recalculation failed:', err)
      );
    }

    return true;
  } catch (error) {
    console.error("STAFF QUEUE ERROR:", error);
    console.error("ERROR CODE:", error?.code);
    console.error("ERROR MESSAGE:", error?.message);
    throw error;
  }
};
