import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from '../firebase/firestore';

/**
 * Service to manage User Notifications: notifications/{notificationId}
 */

export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  if (!userId) return null;
  try {
    const notifRef = collection(db, 'notifications');
    const docSnap = await addDoc(notifRef, {
      userId,
      title: title || 'Queue Alert',
      message: message || '',
      type, // 'queue' | 'alert' | 'info' | 'success'
      read: false,
      createdAt: serverTimestamp(),
    });
    return docSnap.id;
  } catch (error) {
    console.warn('Failed to create notification:', error);
    return null;
  }
};

export const getUserNotifications = async (userId) => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching notifications:', error);
    return [];
  }
};

export const subscribeUserNotifications = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn('Notification snapshot error:', err);
      callback([]);
    }
  );
};

export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return;
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, {
    read: true,
    readAt: serverTimestamp(),
  });
};

export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) return;
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true, readAt: serverTimestamp() });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Error marking all notifications as read:', error);
  }
};
