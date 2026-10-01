import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from '../firebase/auth';
import { getUserProfile, createUserProfile } from '../services/userService';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  loginWithGoogle, 
  resetPassword as authResetPassword 
} from '../services/authService';

export const AuthContext = createContext(null);
const ALLOWED_ROLES = ['student', 'staff', 'admin'];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid, firebaseUser.email);
          
          if (!profile) {
            const emailLower = (firebaseUser.email || '').toLowerCase().trim();
            let assignedRole = 'student';
            if (emailLower.includes('admin') || emailLower === 'admin@smartcampus.edu') {
              assignedRole = 'admin';
            } else if (emailLower.includes('staff') || emailLower === 'kavitha.nair@smartcampus.edu') {
              assignedRole = 'staff';
            }

            // Create profile with properly detected role
            profile = await createUserProfile(firebaseUser.uid, {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Campus User',
              email: firebaseUser.email,
              role: assignedRole,
              status: 'active',
              departmentId: assignedRole === 'staff' ? 'examination' : null,
              counter: assignedRole === 'staff' ? 1 : null,
            });
          }

          // Check if account status is inactive
          if (profile.status === 'inactive') {
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setAuthError('Your account is inactive. Please contact the administrator.');
            setLoading(false);
            return;
          }

          // Check if role is invalid or missing
          if (!profile.role || !ALLOWED_ROLES.includes(profile.role)) {
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setAuthError('Your account role is not configured. Please contact the administrator.');
            setLoading(false);
            return;
          }

          setCurrentUser(firebaseUser);
          setUserProfile(profile);
          setAuthError(null);
        } catch (err) {
          console.warn('Error fetching user profile in onAuthStateChanged:', err);
          setCurrentUser(null);
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { user, profile } = await loginUser(email, password);
      setCurrentUser(user);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const { user, profile } = await registerUser(userData);
      setCurrentUser(user);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const { user, profile } = await loginWithGoogle();
      setCurrentUser(user);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      return await authResetPassword(email);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) setUserProfile(profile);
    }
  };

  // Check valid authenticated state with active status and allowed role
  const isValidAuth = Boolean(
    currentUser && 
    userProfile && 
    userProfile.status === 'active' && 
    ALLOWED_ROLES.includes(userProfile.role)
  );

  // Consolidated user object
  const user = isValidAuth ? {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: userProfile?.name || currentUser.displayName || 'User',
    name: userProfile?.name || currentUser.displayName || 'User',
    photoURL: userProfile?.photoURL || currentUser.photoURL,
    role: userProfile?.role, // 'student' | 'staff' | 'admin'
    departmentId: userProfile?.departmentId || null,
    counter: userProfile?.counter || 1,
    status: userProfile?.status || 'active',
    studentId: userProfile?.studentId || '',
    phone: userProfile?.phone || '',
    ...userProfile
  } : null;

  const role = userProfile?.role || null;

  const value = {
    user,
    currentUser,
    profile: userProfile,
    userProfile,
    role,
    loading,
    isAuthenticated: isValidAuth,
    authError,
    login,
    register,
    logout,
    signInWithGoogle,
    resetPassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
