import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from '../firebase/firestore';

/**
 * Service to record and query Queue History: queueHistory/{historyId}
 */

export const createHistoryRecord = async (tokenData = {}) => {
  try {
    const historyRef = collection(db, 'queueHistory');
    const record = {
      tokenId: tokenData.id || tokenData.tokenId || '',
      tokenNumber: tokenData.tokenNumber || 'N/A',
      userId: tokenData.userId || '',
      userName: tokenData.userName || 'Student',
      userEmail: tokenData.userEmail || '',
      studentId: tokenData.studentId || '',
      serviceId: tokenData.serviceId || '',
      serviceName: tokenData.serviceName || 'Campus Service',
      departmentId: tokenData.departmentId || '',
      departmentName: tokenData.departmentName || '',
      status: tokenData.status || 'completed',
      waitingTime: tokenData.waitingTime || 0,
      serviceTime: tokenData.serviceTime || 0,
      counterNumber: tokenData.counterNumber || null,
      staffId: tokenData.calledByStaffId || null,
      createdAt: tokenData.createdAt || serverTimestamp(),
      completedAt: serverTimestamp(),
      dateString: new Date().toISOString().split('T')[0],
    };

    const docSnap = await addDoc(historyRef, record);
    return docSnap.id;
  } catch (error) {
    console.warn('Failed to record queue history:', error);
    return null;
  }
};

export const getUserHistory = async (userId) => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'queueHistory'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching user queue history:', error);
    return [];
  }
};

export const getCampusHistory = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, 'queueHistory'),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching campus queue history:', error);
    return [];
  }
};

export const getStaffHistory = async (staffId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'queueHistory'),
      where('staffId', '==', staffId),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Error fetching staff queue history:', error);
    return [];
  }
};
