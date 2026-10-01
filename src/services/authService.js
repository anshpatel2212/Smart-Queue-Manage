import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from '../firebase/auth';
import { getUserProfile, createUserProfile } from './userService';

/**
 * Human-friendly error translation for Firebase Auth error codes
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

const ALLOWED_ROLES = ['student', 'staff', 'admin'];

/**
 * Register a new student account.
 * Regular public registration is ALWAYS locked to role "student".
 */
export const registerUser = async ({ email, password, name, departmentId = null, studentId = '' }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    // Update Auth displayName
    if (name) {
      await updateProfile(user, { displayName: name.trim() });
    }

    // Create user profile in Firestore — strictly 'student' and 'active'
    const profile = await createUserProfile(user.uid, {
      name: name.trim(),
      email: user.email,
      role: 'student',
      departmentId: departmentId || null,
      studentId: studentId.trim(),
      status: 'active',
    });

    return { user, profile, role: 'student' };
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Authenticates user via Firebase Auth, then fetches role and status from Firestore users/{uid}.
 * Validates that role is allowed and account is active.
 */
export const loginUser = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    // Fetch Firestore profile using uid and email
    let profile = await getUserProfile(user.uid, user.email);
    if (!profile) {
      const emailLower = (user.email || '').toLowerCase().trim();
      let assignedRole = 'student';
      if (emailLower.includes('admin') || emailLower === 'admin@smartcampus.edu') {
        assignedRole = 'admin';
      } else if (emailLower.includes('staff') || emailLower === 'kavitha.nair@smartcampus.edu') {
        assignedRole = 'staff';
      }

      // Create initial profile with detected role
      profile = await createUserProfile(user.uid, {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: assignedRole,
        status: 'active',
        departmentId: assignedRole === 'staff' ? 'examination' : null,
        counter: assignedRole === 'staff' ? 1 : null,
      });
    }

    // Verify account status
    if (profile.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your account is inactive. Please contact the administrator.');
    }

    // Verify account role
    if (!profile.role || !ALLOWED_ROLES.includes(profile.role)) {
      await signOut(auth);
      throw new Error('Your account role is not configured. Please contact the administrator.');
    }

    return { user, profile, role: profile.role };
  } catch (error) {
    if (
      error.message === 'Your account is inactive. Please contact the administrator.' ||
      error.message === 'Your account role is not configured. Please contact the administrator.'
    ) {
      throw error;
    }
    throw new Error(formatAuthError(error));
  }
};

/**
 * Authenticates user via Google Sign-In, then fetches Firestore role.
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    let profile = await getUserProfile(user.uid, user.email);
    if (!profile) {
      const emailLower = (user.email || '').toLowerCase().trim();
      let assignedRole = 'student';
      if (emailLower.includes('admin') || emailLower === 'admin@smartcampus.edu') {
        assignedRole = 'admin';
      } else if (emailLower.includes('staff') || emailLower === 'kavitha.nair@smartcampus.edu') {
        assignedRole = 'staff';
      }

      profile = await createUserProfile(user.uid, {
        name: user.displayName || 'Campus User',
        email: user.email,
        role: assignedRole,
        status: 'active',
        photoURL: user.photoURL || null,
        departmentId: assignedRole === 'staff' ? 'examination' : null,
        counter: assignedRole === 'staff' ? 1 : null,
      });
    }

    if (profile.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your account is inactive. Please contact the administrator.');
    }

    if (!profile.role || !ALLOWED_ROLES.includes(profile.role)) {
      await signOut(auth);
      throw new Error('Your account role is not configured. Please contact the administrator.');
    }

    return { user, profile, role: profile.role };
  } catch (error) {
    if (
      error.message === 'Your account is inactive. Please contact the administrator.' ||
      error.message === 'Your account role is not configured. Please contact the administrator.'
    ) {
      throw error;
    }
    throw new Error(formatAuthError(error));
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};
