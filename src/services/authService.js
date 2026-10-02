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

import {
  getUserProfile,
  createUserProfile,
} from './userService';

const ALLOWED_ROLES = ['student', 'staff', 'admin'];

/**
 * Convert Firebase errors into user-friendly messages
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
      return 'Network connection issue.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';

    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};


/**
 * Register STUDENT
 */
export const registerUser = async ({
  email,
  password,
  name,
  departmentId = null,
  studentId = '',
}) => {
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = cred.user;

    if (name) {
      await updateProfile(user, {
        displayName: name.trim(),
      });
    }

    const profile = await createUserProfile(user.uid, {
      uid: user.uid,
      name: name.trim(),
      email: user.email,
      role: 'student',
      departmentId: departmentId || null,
      studentId: studentId.trim(),
      status: 'active',
    });

    return {
      user,
      profile,
      role: 'student',
    };

  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};


/**
 * LOGIN
 *
 * Role is ALWAYS taken from:
 *
 * users/{Firebase Authentication UID}
 */
export const loginUser = async (email, password) => {
  try {

    // 1. Firebase Authentication
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = credential.user;

    console.log('LOGIN UID:', user.uid);
    console.log('LOGIN EMAIL:', user.email);


    // 2. Get Firestore user profile
    const profile = await getUserProfile(user.uid, user.email);

    // 3. Profile must exist
    if (!profile) {
      await signOut(auth);
      throw new Error('User profile not found');
    }

    // 4. Normalize role
    const rawRole = profile.role;
    const normalizedRole = String(profile.role || '')
      .trim()
      .toLowerCase();

    console.log("AUTH UID:", user.uid);
    console.log("PROFILE:", profile);
    console.log("RAW ROLE:", rawRole);
    console.log("NORMALIZED ROLE:", normalizedRole);
    console.log("STATUS:", profile.status);

    const role = normalizedRole;

    // 5. Validate role
    if (!ALLOWED_ROLES.includes(role)) {

      console.error(
        'INVALID ROLE:',
        profile.role
      );

      await signOut(auth);

      throw new Error(
        `Invalid user role. Firestore role is: ${profile.role || 'missing'}`
      );
    }


    // 6. Check status
    const status = String(profile.status || 'active')
      .trim()
      .toLowerCase();

    if (status === 'inactive') {
      await signOut(auth);

      throw new Error(
        'Your account is inactive. Please contact the administrator.'
      );
    }


    // 7. Return everything
    return {
      user,
      profile: {
        ...profile,
        role,
        status,
      },
      role,
    };

  } catch (error) {

    console.error('LOGIN ERROR:', error);

    if (
      error.message?.startsWith('User profile not found') ||
      error.message?.startsWith('Invalid user role') ||
      error.message?.startsWith('Your account is inactive')
    ) {
      throw error;
    }

    throw new Error(formatAuthError(error));
  }
};


/**
 * GOOGLE LOGIN
 */
export const loginWithGoogle = async () => {
  try {

    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    const user = result.user;

    console.log('GOOGLE UID:', user.uid);


    const profile = await getUserProfile(user.uid);

    console.log('GOOGLE PROFILE:', profile);


    if (!profile) {
      await signOut(auth);

      throw new Error('User profile not found');
    }


    const role = String(profile.role || '')
      .trim()
      .toLowerCase();


    console.log('GOOGLE ROLE:', role);


    if (!ALLOWED_ROLES.includes(role)) {
      await signOut(auth);

      throw new Error(
        `Invalid user role. Firestore role is: ${profile.role || 'missing'}`
      );
    }


    const status = String(profile.status || 'active')
      .trim()
      .toLowerCase();


    if (status === 'inactive') {
      await signOut(auth);

      throw new Error(
        'Your account is inactive. Please contact the administrator.'
      );
    }


    return {
      user,
      profile: {
        ...profile,
        role,
        status,
      },
      role,
    };

  } catch (error) {

    console.error('GOOGLE LOGIN ERROR:', error);

    if (
      error.message?.startsWith('User profile not found') ||
      error.message?.startsWith('Invalid user role') ||
      error.message?.startsWith('Your account is inactive')
    ) {
      throw error;
    }

    throw new Error(formatAuthError(error));
  }
};


/**
 * LOGOUT
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};


/**
 * CURRENT FIREBASE USER
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};


/**
 * RESET PASSWORD
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(
      auth,
      email.trim()
    );

    return true;

  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};