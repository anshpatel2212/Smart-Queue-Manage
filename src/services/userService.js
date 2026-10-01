import { db, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from '../firebase/firestore';

/**
 * Service to manage User Profiles in Firestore: users/{uid}
 */

export const getUserProfile = async (uid, email = null) => {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { uid, ...snap.data() };
    }

    // Fallback: check query by uid field
    const qUid = query(collection(db, 'users'), where('uid', '==', uid));
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      const data = snapUid.docs[0].data();
      await setDoc(userRef, { ...data, uid }, { merge: true }).catch(() => {});
      return { uid, id: snapUid.docs[0].id, ...data };
    }

    // Fallback: check query by email if provided
    if (email) {
      const qEmail = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const data = snapEmail.docs[0].data();
        await setDoc(userRef, { ...data, uid }, { merge: true }).catch(() => {});
        return { uid, id: snapEmail.docs[0].id, ...data };
      }
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }
  return null;
};

export const createUserProfile = async (uid, data = {}) => {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    return { uid, ...existing.data() };
  }

  const profile = {
    uid,
    name: data.name || data.fullName || 'Campus User',
    email: data.email || '',
    role: data.role || 'student', // student, staff, admin
    departmentId: data.departmentId || null,
    status: data.status || 'active',
    phone: data.phone || '',
    studentId: data.studentId || '',
    photoURL: data.photoURL || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);
  return profile;
};

export const updateUserProfile = async (uid, updateData) => {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  
  // Strip out fields that client should never modify directly
  const safeData = { ...updateData };
  delete safeData.role;
  delete safeData.status;
  delete safeData.uid;
  delete safeData.createdAt;

  safeData.updatedAt = serverTimestamp();
  await updateDoc(userRef, safeData);
  return getUserProfile(uid);
};

export const getStaffMembers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'staff'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const updateUserByAdmin = async (uid, updateData) => {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  const data = { ...updateData };
  delete data.uid;
  delete data.createdAt;
  data.updatedAt = serverTimestamp();
  await updateDoc(userRef, data);
  return getUserProfile(uid);
};

export const deleteUser = async (uid) => {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
  return true;
};
