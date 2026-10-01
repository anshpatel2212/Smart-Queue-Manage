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
export const joinQueue = async ({ user, serviceId }) => {
  if (!user || !user.uid) {
    throw new Error('Please sign in to join a queue.');
  }
  if (!serviceId) {
    throw new Error('Service ID is required.');
  }

  // 1. Verify student doesn't already have an active token
  const existingActive = await getUserActiveToken(user.uid);
  if (existingActive) {
    throw new Error(
      `You already have an active token (${existingActive.tokenNumber}) for ${existingActive.serviceName || 'a campus service'}. Please complete or cancel it first.`
    );
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

export const callNextToken = async (serviceId, staffUser, counterNumber = 1) => {
  if (!serviceId) throw new Error('Service ID required.');

  // Find next waiting token
  const q = query(
    collection(db, 'tokens'),
    where('serviceId', '==', serviceId),
    where('status', '==', 'waiting')
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }

  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => (a.tokenSequence || 0) - (b.tokenSequence || 0));
  const nextToken = docs[0];
  const tokenRef = doc(db, 'tokens', nextToken.id);

  await updateDoc(tokenRef, {
    status: 'called',
    calledAt: serverTimestamp(),
    counterNumber: parseInt(counterNumber, 10) || 1,
    calledByStaffId: staffUser?.uid || null,
    updatedAt: serverTimestamp(),
  });

  // Update currentTokenNumber on queue document
  const queueRef = doc(db, 'queues', serviceId);
  await updateDoc(queueRef, {
    currentTokenNumber: nextToken.tokenNumber,
    updatedAt: serverTimestamp(),
  }).catch(() => {});

  // Notify student
  await createNotification({
    userId: nextToken.userId,
    title: 'Token Called!',
    message: `Token ${nextToken.tokenNumber} is now being called! Please proceed immediately to Counter ${counterNumber}.`,
    type: 'alert',
  });

  // Recalculate ML predictions for remaining waiting tokens asynchronously
  recalculateQueuePredictions(serviceId).catch(err => 
    console.warn('Queue recalculation failed:', err)
  );

  return { id: nextToken.id, ...nextToken, status: 'called', counterNumber };
};

export const startService = async (tokenId, staffUser, counterNumber = 1) => {
  if (!tokenId) throw new Error('Token ID is required.');
  const tokenRef = doc(db, 'tokens', tokenId);
  const snap = await getDoc(tokenRef);
  if (!snap.exists()) throw new Error('Token not found.');

  const tokenData = snap.data();

  await updateDoc(tokenRef, {
    status: 'in_service',
    serviceStartedAt: serverTimestamp(),
    counterNumber: parseInt(counterNumber, 10) || tokenData.counterNumber || 1,
    calledByStaffId: staffUser?.uid || tokenData.calledByStaffId,
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: tokenData.userId,
    title: 'Service Started',
    message: `Your appointment for ${tokenData.serviceName} has started at Counter ${counterNumber}.`,
    type: 'info',
  });

  return { id: tokenId, ...tokenData, status: 'in_service' };
};

export const completeService = async (tokenId, staffUser) => {
  if (!tokenId) throw new Error('Token ID is required.');
  const tokenRef = doc(db, 'tokens', tokenId);
  const snap = await getDoc(tokenRef);
  if (!snap.exists()) throw new Error('Token not found.');

  const tokenData = snap.data();
  const now = new Date();

  // Calculate waiting time & service time in minutes
  const createdAtDate = tokenData.createdAt?.toDate ? tokenData.createdAt.toDate() : new Date();
  const startedDate = tokenData.serviceStartedAt?.toDate ? tokenData.serviceStartedAt.toDate() : createdAtDate;
  
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
    calledByStaffId: staffUser?.uid || tokenData.calledByStaffId,
  });

  // Notify student
  await createNotification({
    userId: tokenData.userId,
    title: 'Service Completed',
    message: `Your service for ${tokenData.serviceName} has been marked completed. Thank you!`,
    type: 'success',
  });

  // Recalculate waiting tokens ML predictions
  if (tokenData.serviceId) {
    recalculateQueuePredictions(tokenData.serviceId).catch(err => 
      console.warn('Queue recalculation failed:', err)
    );
  }

  return true;
};

export const skipToken = async (tokenId, staffUser, reason = 'No show') => {
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
  });

  await createNotification({
    userId: tokenData.userId,
    title: 'Token Skipped',
    message: `Your token ${tokenData.tokenNumber} was skipped (${reason}). Please visit counter staff if you are present.`,
    type: 'alert',
  });

  if (tokenData.serviceId) {
    recalculateQueuePredictions(tokenData.serviceId).catch(err => 
      console.warn('Queue recalculation failed:', err)
    );
  }

  return true;
};

export const staffCancelToken = async (tokenId, staffUser, reason = 'Cancelled by staff') => {
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
    calledByStaffId: staffUser?.uid || null,
  });

  await createNotification({
    userId: tokenData.userId,
    title: 'Queue Cancelled by Staff',
    message: `Your token ${tokenData.tokenNumber} for ${tokenData.serviceName} was cancelled by staff (${reason}).`,
    type: 'alert',
  });

  if (tokenData.serviceId) {
    recalculateQueuePredictions(tokenData.serviceId).catch(err => 
      console.warn('Queue recalculation failed:', err)
    );
  }

  return true;
};
