import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from '../firebase/firestore';
import { INITIAL_DEPARTMENTS, INITIAL_SERVICES } from './seedService';

/**
 * Service to manage Campus Departments & Services in Firestore
 */

export {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  subscribeDepartments,
  toggleDepartmentStatus
} from './departmentService';

export const getServices = async (departmentId = null) => {
  try {
    let q;
    if (departmentId) {
      q = query(collection(db, 'services'), where('departmentId', '==', departmentId));
    } else {
      q = collection(db, 'services');
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return departmentId 
      ? INITIAL_SERVICES.filter(s => s.departmentId === departmentId)
      : INITIAL_SERVICES;
  } catch (error) {
    console.warn('Error fetching services, using fallback:', error);
    return departmentId 
      ? INITIAL_SERVICES.filter(s => s.departmentId === departmentId)
      : INITIAL_SERVICES;
  }
};

export const getService = async (id) => {
  try {
    const docRef = doc(db, 'services', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return INITIAL_SERVICES.find(s => s.id === id) || null;
  } catch {
    return INITIAL_SERVICES.find(s => s.id === id) || null;
  }
};

export const createService = async (data) => {
  const id = (data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim();
  const srvRef = doc(db, 'services', id);
  const existing = await getDoc(srvRef);
  if (existing.exists()) {
    throw new Error('A service with this identifier already exists.');
  }

  const newService = {
    id,
    name: data.name.trim(),
    departmentId: data.departmentId,
    departmentName: data.departmentName || '',
    description: data.description || '',
    averageServiceTime: parseInt(data.averageServiceTime, 10) || 5,
    activeCounters: parseInt(data.activeCounters, 10) || 1,
    status: data.status || 'open',
    prefix: data.prefix?.toUpperCase() || 'Q',
    icon: data.icon || 'Layers',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(srvRef, newService);

  // Initialize corresponding queue document
  const queueRef = doc(db, 'queues', id);
  await setDoc(queueRef, {
    serviceId: id,
    departmentId: data.departmentId,
    prefix: newService.prefix,
    currentTokenNumber: null,
    currentTokenSequence: 0,
    nextTokenSequence: 1,
    activeCounters: newService.activeCounters,
    status: newService.status,
    waitingCount: 0,
    updatedAt: serverTimestamp(),
  });

  return newService;
};

export const updateService = async (id, updateData) => {
  const srvRef = doc(db, 'services', id);
  const safeData = { ...updateData };
  delete safeData.id;
  delete safeData.createdAt;
  safeData.updatedAt = serverTimestamp();

  await updateDoc(srvRef, safeData);

  // If status or counters changed, sync with queue document
  const queueRef = doc(db, 'queues', id);
  const queueUpdate = {};
  if (updateData.status) queueUpdate.status = updateData.status;
  if (updateData.activeCounters !== undefined) queueUpdate.activeCounters = updateData.activeCounters;
  if (Object.keys(queueUpdate).length > 0) {
    queueUpdate.updatedAt = serverTimestamp();
    await updateDoc(queueRef, queueUpdate).catch(() => {});
  }

  return getService(id);
};

export const deleteService = async (id) => {
  const srvRef = doc(db, 'services', id);
  const queueRef = doc(db, 'queues', id);
  await deleteDoc(srvRef);
  await deleteDoc(queueRef).catch(() => {});
  return true;
};

export const subscribeServices = (callback) => {
  return onSnapshot(
    collection(db, 'services'),
    (snap) => {
      const services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(services.length > 0 ? services : INITIAL_SERVICES);
    },
    (err) => {
      console.warn('Realtime services subscription error:', err);
      callback(INITIAL_SERVICES);
    }
  );
};
