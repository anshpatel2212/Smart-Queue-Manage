import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut, signInAnonymously } from '../firebase/auth';
import { getUserProfile } from '../services/userService';
import { 
  loginUser, 
  logoutUser, 
  loginWithGoogle, 
  resetPassword as authResetPassword 
} from '../services/authService';

export const AuthContext = createContext(null);
const STAFF_ADMIN_ROLES = ['staff', 'admin'];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      // If staff registration is currently in progress, do not interfere or trigger premature signOut
      if (typeof window !== 'undefined' && window.__isStaffRegistering) {
        return;
      }

      if (firebaseUser) {
        // CASE A: Anonymous Student User
        if (firebaseUser.isAnonymous) {
          // Requirement 4 & 5: Students authenticate anonymously in the background.
          // DO NOT query or create users/{uid} for anonymous students.
          setCurrentUser(firebaseUser);
          setUserProfile({
            uid: firebaseUser.uid,
            name: 'Guest Student',
            role: 'guest',
            isAnonymous: true,
            status: 'active'
          });
          setAuthError(null);
          setLoading(false);
          return;
        }

        // CASE B: Permanent Staff or Admin User
        try {
          setLoading(true);
          let profile = await getUserProfile(firebaseUser.uid, firebaseUser.email);
          if (!profile) {
            // Short grace period in case Firestore write is completing
            await new Promise((res) => setTimeout(res, 350));
            profile = await getUserProfile(firebaseUser.uid, firebaseUser.email);
          }
          
          if (!profile) {
            console.warn('[AuthContext] Staff/Admin profile not found for UID:', firebaseUser.uid);
            await signOut(auth);
            if (isMounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError('User profile not found. Access is restricted to Staff and Admin accounts.');
              setLoading(false);
            }
            return;
          }

          const rawRole = (profile.role || '').toString().toLowerCase().trim();
          if (!rawRole || !STAFF_ADMIN_ROLES.includes(rawRole)) {
            console.warn('[AuthContext] Access denied: non-staff/admin account tried to sign in. Role:', profile.role);
            await signOut(auth);
            if (isMounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError('Access denied. Only Staff and Admin accounts can sign in here.');
              setLoading(false);
            }
            return;
          }
          profile.role = rawRole;

          if (profile.status === 'pending') {
            await signOut(auth);
            if (isMounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError('Your staff account is pending administrator approval.');
              setLoading(false);
            }
            return;
          }

          if (profile.status === 'inactive') {
            await signOut(auth);
            if (isMounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError('Your account is inactive. Please contact the administrator.');
              setLoading(false);
            }
            return;
          }

          if (isMounted) {
            setCurrentUser(firebaseUser);
            setUserProfile({ ...profile, role: rawRole, isAnonymous: false });
            setAuthError(null);
            setLoading(false);
          }
        } catch (err) {
          console.warn('[AuthContext] Error fetching profile:', err);
          if (isMounted) {
            setCurrentUser(null);
            setUserProfile(null);
            setAuthError(err.message || 'Authentication error');
            setLoading(false);
          }
        }
      } else {
        // CASE C: No user logged in -> Automatically sign in anonymously in the background
        try {
          await signInAnonymously(auth);
          // onAuthStateChanged will re-trigger with the new anonymous user
        } catch (anonErr) {
          console.warn('[AuthContext] Silent anonymous authentication error:', anonErr);
          if (isMounted) {
            setCurrentUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const ensureAnonymousUser = async () => {
    if (auth.currentUser) return auth.currentUser;
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error('[AuthContext] Failed to ensure anonymous user:', err);
      throw err;
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { user, profile, role } = await loginUser(email, password);
      setCurrentUser(user);
      setUserProfile(profile);
      return { user, profile, role };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const { user, profile, role } = await loginWithGoogle();
      setCurrentUser(user);
      setUserProfile(profile);
      return { user, profile, role };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await logoutUser();
      // onAuthStateChanged will fire with null and automatically re-create an anonymous student session
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

  const setAuthSession = (firebaseUser, profile) => {
    if (profile && profile.role) {
      profile.role = profile.role.toString().toLowerCase().trim();
    }
    setCurrentUser(firebaseUser);
    setUserProfile(profile);
    setLoading(false);
    setAuthError(null);
  };

  const refreshProfile = async (explicitUid = null, explicitProfile = null) => {
    if (explicitProfile) {
      if (explicitProfile.role) {
        explicitProfile.role = explicitProfile.role.toString().toLowerCase().trim();
      }
      setUserProfile(explicitProfile);
      return;
    }
    const targetUid = explicitUid || currentUser?.uid || auth.currentUser?.uid;
    if (targetUid && !currentUser?.isAnonymous) {
      const p = await getUserProfile(targetUid, auth.currentUser?.email);
      if (p) {
        if (p.role) p.role = p.role.toString().toLowerCase().trim();
        setUserProfile(p);
      }
    }
  };

  const isAnonymous = Boolean(currentUser?.isAnonymous);
  const normalizedRole = isAnonymous 
    ? 'guest' 
    : (userProfile?.role ? userProfile.role.toString().toLowerCase().trim() : null);

  // Consolidated user object
  let user = null;
  if (currentUser) {
    if (isAnonymous) {
      user = {
        uid: currentUser.uid,
        email: '',
        displayName: 'Guest Student',
        name: 'Guest Student',
        role: 'guest',
        isAnonymous: true,
        status: 'active'
      };
    } else {
      user = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: userProfile?.name || currentUser.displayName || 'Staff Member',
        name: userProfile?.name || currentUser.displayName || 'Staff Member',
        photoURL: userProfile?.photoURL || currentUser.photoURL,
        role: normalizedRole,
        departmentId: userProfile?.departmentId || null,
        counter: userProfile?.counter || 1,
        status: userProfile?.status || 'active',
        isAnonymous: false,
        ...userProfile,
        role: normalizedRole
      };
    }
  }

  const role = normalizedRole;
  const isAuthenticated = Boolean(currentUser);

  const resetAnonymousSession = async () => {
    try {
      await signOut(auth);
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error('[AuthContext] Reset anonymous session error:', err);
      throw err;
    }
  };

  const value = {
    user,
    currentUser,
    profile: userProfile,
    userProfile,
    role,
    loading,
    isAuthenticated,
    isAnonymous,
    authError,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    refreshProfile,
    setAuthSession,
    ensureAnonymousUser,
    resetAnonymousSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
