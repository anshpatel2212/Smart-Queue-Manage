import {
  db,
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from '../firebase/firestore';

/**
 * Service to manage Queue metadata & Real-Time Listeners: queues/{serviceId}
 */

export const getQueue = async (serviceId) => {
  if (!serviceId) return null;
  try {
    const queueRef = doc(db, 'queues', serviceId);
    const snap = await getDoc(queueRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.warn('Error fetching queue:', error);
    return null;
  }
};

export const subscribeQueue = (serviceId, callback) => {
  if (!serviceId) {
    callback(null);
    return () => {};
  }
  const queueRef = doc(db, 'queues', serviceId);
  return onSnapshot(
    queueRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn(`Queue subscription error for ${serviceId}:`, err);
      callback(null);
    }
  );
};

export const subscribeAllQueues = (callback) => {
  return onSnapshot(
    collection(db, 'queues'),
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn('All queues subscription error:', err);
      callback([]);
    }
  );
};

export const updateQueueCounters = async (serviceId, activeCounters) => {
  const queueRef = doc(db, 'queues', serviceId);
  await updateDoc(queueRef, {
    activeCounters: Math.max(1, parseInt(activeCounters, 10) || 1),
    updatedAt: serverTimestamp(),
  });
};

export const updateQueueStatus = async (serviceId, status) => {
  const queueRef = doc(db, 'queues', serviceId);
  await updateDoc(queueRef, {
    status, // 'open' | 'closed'
    updatedAt: serverTimestamp(),
  });
};
