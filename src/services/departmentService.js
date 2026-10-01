import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from '../firebase/firestore';
import { INITIAL_DEPARTMENTS } from './seedService';

/**
 * Service to manage Campus Departments: departments/{departmentId}
 */

export const getDepartments = async () => {
  try {
    const snap = await getDocs(collection(db, 'departments'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return INITIAL_DEPARTMENTS;
  } catch (error) {
    console.warn('Error fetching departments, using fallback:', error);
    return INITIAL_DEPARTMENTS;
  }
};

export const getDepartment = async (id) => {
  if (!id) return null;
  const docRef = doc(db, 'departments', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return INITIAL_DEPARTMENTS.find(d => d.id === id) || null;
};

export const createDepartment = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error('Department name is required.');
  }

  // Prevent duplicate names
  const allDepts = await getDepartments();
  const nameExists = allDepts.some(
    d => d.name.trim().toLowerCase() === data.name.trim().toLowerCase()
  );
  if (nameExists) {
    throw new Error(`A department with the name "${data.name.trim()}" already exists.`);
  }

  const id = (data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim();
  const deptRef = doc(db, 'departments', id);
  const existing = await getDoc(deptRef);
  if (existing.exists()) {
    throw new Error(`Department with ID "${id}" already exists.`);
  }

  const newDept = {
    id,
    name: data.name.trim(),
    description: data.description || '',
    status: data.status || 'active',
    activeCounters: Math.max(1, parseInt(data.activeCounters, 10) || 1),
    totalCounters: Math.max(1, parseInt(data.totalCounters, 10) || 1),
    icon: data.icon || 'Building',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(deptRef, newDept);
  return newDept;
};

export const updateDepartment = async (id, updateData) => {
  if (!id) throw new Error('Department ID is required.');
  const deptRef = doc(db, 'departments', id);
  
  // If name is being changed, check for duplicate name
  if (updateData.name) {
    const allDepts = await getDepartments();
    const nameExists = allDepts.some(
      d => d.id !== id && d.name.trim().toLowerCase() === updateData.name.trim().toLowerCase()
    );
    if (nameExists) {
      throw new Error(`A department with the name "${updateData.name.trim()}" already exists.`);
    }
  }

  const safeData = { ...updateData };
  delete safeData.id;
  delete safeData.createdAt;
  if (safeData.activeCounters !== undefined) {
    safeData.activeCounters = Math.max(1, parseInt(safeData.activeCounters, 10) || 1);
  }
  if (safeData.totalCounters !== undefined) {
    safeData.totalCounters = Math.max(1, parseInt(safeData.totalCounters, 10) || 1);
  }
  safeData.updatedAt = serverTimestamp();

  await updateDoc(deptRef, safeData);
  return getDepartment(id);
};

export const toggleDepartmentStatus = async (id, currentStatus) => {
  const newStatus = (currentStatus === 'active' || currentStatus === 'Active') ? 'closed' : 'active';
  return updateDepartment(id, { status: newStatus });
};

export const deleteDepartment = async (id) => {
  if (!id) throw new Error('Department ID is required.');
  const deptRef = doc(db, 'departments', id);
  await deleteDoc(deptRef);
  return true;
};

export const subscribeDepartments = (callback) => {
  return onSnapshot(
    collection(db, 'departments'),
    (snap) => {
      const depts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(depts.length > 0 ? depts : INITIAL_DEPARTMENTS);
    },
    (err) => {
      console.warn('Realtime departments subscription error:', err);
      callback(INITIAL_DEPARTMENTS);
    }
  );
};
