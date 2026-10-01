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
    where('status', 'in', ['waiting', 'called', 'in_service']),
    orderBy('tokenSequence', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    where('status', 'in', ['waiting', 'called', 'in_service']),
    orderBy('tokenSequence', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn('All active tokens snapshot error:', err);
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

    // Read waiting tokens to calculate position & ETA accurately
    const tokensSnapshot = await getDocs(
      query(
        collection(db, 'tokens'),
        where('serviceId', '==', serviceId),
        where('status', '==', 'waiting')
      )
    );
    const peopleAhead = tokensSnapshot.size;
    const estimatedWait = calculateEstimatedWaitTime(
      peopleAhead,
      service.averageServiceTime || 5,
      activeCounters
    );

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

  return true;
};

export const callNextToken = async (serviceId, staffUser, counterNumber = 1) => {
  if (!serviceId) throw new Error('Service ID required.');

  // Find next waiting token
  const q = query(
    collection(db, 'tokens'),
    where('serviceId', '==', serviceId),
    where('status', '==', 'waiting'),
    orderBy('tokenSequence', 'asc'),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }

  const nextDoc = snap.docs[0];
  const nextToken = nextDoc.data();
  const tokenRef = doc(db, 'tokens', nextDoc.id);

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

  return { id: nextDoc.id, ...nextToken, status: 'called', counterNumber };
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

  return true;
};
