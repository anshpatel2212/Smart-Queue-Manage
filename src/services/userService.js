import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/config';


export const getUserProfile = async (uid, email = null) => {
  if (!uid) {
    return null;
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      role: (data.role || '').toString().toLowerCase().trim(),
      status: (data.status || 'active').toString().toLowerCase().trim(),
    };
  }

  // Fallback: look up by email in users collection if doc ID was not UID
  if (email) {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase().trim()),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const foundData = snap.docs[0].data();
        const role = String(foundData.role || '').trim().toLowerCase();
        const fullData = {
          ...foundData,
          uid,
          role,
          status: String(foundData.status || 'active').trim().toLowerCase(),
          updatedAt: serverTimestamp(),
        };
        // Mirror to users/{uid} so rules and future lookups work smoothly
        await setDoc(userRef, fullData, { merge: true }).catch((err) => {
          console.warn('Could not mirror user doc to users/{uid}:', err);
        });
        return {
          id: uid,
          ...fullData,
        };
      }
    } catch (err) {
      console.warn('Failed email fallback lookup for user profile:', err);
    }
  }

  console.error('User document does not exist:', uid);
  return null;
};


export const createUserProfile = async (uid, profileData) => {
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    uid,
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(userRef);

  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const updateUserProfile = async (uid, updateData) => {
  if (!uid) throw new Error('User ID is required');
  const userRef = doc(db, 'users', uid);
  const safeData = { ...updateData };
  delete safeData.uid;
  delete safeData.id;
  delete safeData.role; // Prevent unauthorized role elevation from user-facing profile update
  safeData.updatedAt = serverTimestamp();
  await setDoc(userRef, safeData, { merge: true });
  const snap = await getDoc(userRef);
  return {
    id: snap.id,
    ...snap.data(),
  };
};

/**
 * Admin-only repair utility to fix malformed user roles (e.g. trailing whitespace/newlines).
 * Can only be executed by an authenticated administrator.
 */
export const repairUserProfileRole = async (targetUid, adminUser) => {
  if (!targetUid) throw new Error('Target UID is required for role repair.');

  const adminRole = String(adminUser?.role || '').trim().toLowerCase();
  if (adminRole !== 'admin') {
    throw new Error('Unauthorized: Only administrators can execute user role repair.');
  }

  const targetRef = doc(db, 'users', targetUid);
  const snap = await getDoc(targetRef);
  if (!snap.exists()) {
    throw new Error(`User profile document not found for UID: ${targetUid}`);
  }

  const data = snap.data();
  const normalizedRole = String(data.role || '').trim().toLowerCase();

  if (normalizedRole !== data.role) {
    console.log(`[Admin Repair] Repairing user role for ${targetUid} from "${data.role}" to "${normalizedRole}"`);
    await setDoc(
      targetRef,
      {
        ...data,
        role: normalizedRole,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { repaired: true, previousRole: data.role, newRole: normalizedRole };
  }

  return { repaired: false, role: data.role };
};