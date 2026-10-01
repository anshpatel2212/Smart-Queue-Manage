import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from '../firebase/firestore';
import { staffMembers as fallbackStaff } from '@/data/mockData';

/**
 * Service to manage Staff Accounts in Firestore: users/{uid} where role == 'staff'
 */

export const subscribeStaffMembers = (callback) => {
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['staff', 'admin'])
  );

  return onSnapshot(
    q,
    (snap) => {
      const staffList = snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
      callback(staffList.length > 0 ? staffList : fallbackStaff);
    },
    (err) => {
      console.warn('Staff subscription error, falling back:', err);
      callback(fallbackStaff);
    }
  );
};

export const getStaffMembers = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['staff', 'admin'])
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
    }
    return fallbackStaff;
  } catch (error) {
    console.warn('Error fetching staff members:', error);
    return fallbackStaff;
  }
};

export const updateStaffMember = async (uid, updateData) => {
  if (!uid) throw new Error('Staff User ID (uid) is required.');

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('Staff record does not exist in Firestore.');
  }

  // Sanitize fields: Admin must NOT be able to change uid or createdAt
  const safeData = { ...updateData };
  delete safeData.uid;
  delete safeData.createdAt;

  // Protect role: only 'staff' or 'admin' permitted here, never assign invalid roles
  if (safeData.role && !['staff', 'admin'].includes(safeData.role)) {
    safeData.role = 'staff';
  }

  if (safeData.counter !== undefined) {
    safeData.counter = Math.max(1, parseInt(safeData.counter, 10) || 1);
  }

  safeData.updatedAt = serverTimestamp();

  await updateDoc(userRef, safeData);
  const updated = await getDoc(userRef);
  return { id: uid, uid, ...updated.data() };
};

export const toggleStaffStatus = async (uid, currentStatus) => {
  if (!uid) throw new Error('Staff User ID is required.');
  const newStatus = (currentStatus === 'active' || currentStatus === 'Active') ? 'offline' : 'active';
  return updateStaffMember(uid, { status: newStatus });
};

export const assignStaffDepartment = async (uid, departmentId, counter = 1) => {
  if (!uid) throw new Error('Staff User ID is required.');
  return updateStaffMember(uid, {
    departmentId,
    counter: Math.max(1, parseInt(counter, 10) || 1),
  });
};
