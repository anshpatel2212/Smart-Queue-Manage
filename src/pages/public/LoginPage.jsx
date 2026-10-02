import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword, signOut } from '../../firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from '../../firebase/firestore';
import { formatAuthError } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, resetPassword, refreshProfile, setAuthSession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.error || '');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      // 1. Firebase Authentication: signInWithEmailAndPassword
      const credential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const firebaseUser = credential.user;

      // 1. Get authenticated Firebase user UID
      const uid = firebaseUser.uid;

      // 2. Fetch users/{firebaseUser.uid} from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData = null;

      if (userDocSnap.exists()) {
        profileData = userDocSnap.data();
      } else {
        // Fallback: check query by email if profile document was stored with non-uid ID
        const qEmail = query(
          collection(db, 'users'),
          where('email', '==', (firebaseUser.email || '').toLowerCase().trim())
        );
        const emailSnap = await getDocs(qEmail);

        if (!emailSnap.empty) {
          profileData = emailSnap.docs[0].data();
          await setDoc(userDocRef, { ...profileData, uid }, { merge: true }).catch(() => {});
        }
      }

      // If the Firestore user document does not exist, show "User profile not found"
      if (!profileData) {
        await signOut(auth);
        setErrorMessage('User profile not found');
        setLoading(false);
        return;
      }

      // Check account status: only active accounts permitted
      if (profileData.status === 'inactive') {
        await signOut(auth);
        setErrorMessage('Your account is inactive. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // 3. Read profile.role (normalized, Staff & Admin ONLY)
      const rawRole = profileData.role;
      const normalizedRole = String(profileData.role || '').trim().toLowerCase();

      console.log("AUTH UID:", firebaseUser.uid);
      console.log("PROFILE:", profileData);
      console.log("RAW ROLE:", rawRole);
      console.log("NORMALIZED ROLE:", normalizedRole);
      console.log("STATUS:", profileData.status);

      if (!normalizedRole || !['staff', 'admin'].includes(normalizedRole)) {
        await signOut(auth);
        setErrorMessage('Access denied. This login portal is strictly for Staff and Admin accounts. Students do not require an account to use the queue.');
        setLoading(false);
        return;
      }
      profileData.role = normalizedRole;

      // 4. Store the actual Firestore role in AuthContext
      if (setAuthSession) {
        setAuthSession(firebaseUser, profileData);
      } else if (refreshProfile) {
        await refreshProfile(uid, profileData);
      }

      // 7. Route strictly according to the Firestore role:
      let destinationRoute = '';
      if (normalizedRole === 'staff') {
        destinationRoute = '/staff';
      } else if (normalizedRole === 'admin') {
        destinationRoute = '/admin';
      } else {
        await signOut(auth);
        setErrorMessage('Invalid user role');
        setLoading(false);
        return;
      }

      navigate(destinationRoute, { replace: true });
    } catch (err) {
      if (err.message === 'User profile not found' || err.message === 'Invalid user role') {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setGoogleLoading(true);
    try {
      const { user: firebaseUser, profile: profileData } = await signInWithGoogle();
      
      const detectedRole = (profileData.role || '').toString().toLowerCase().trim();
      if (!detectedRole || !['staff', 'admin'].includes(detectedRole)) {
        await signOut(auth);
        setErrorMessage('Access denied. This login portal is strictly for Staff and Admin accounts. Students do not require an account.');
        setGoogleLoading(false);
        return;
      }
      profileData.role = detectedRole;

      if (setAuthSession) {
        setAuthSession(firebaseUser, profileData);
      }

      let destinationRoute = '';
      if (detectedRole === 'staff') {
        destinationRoute = '/staff';
      } else if (detectedRole === 'admin') {
        destinationRoute = '/admin';
      } else {
        await signOut(auth);
        setErrorMessage('Invalid user role');
        setGoogleLoading(false);
        return;
      }

      console.log('Firebase UID:', firebaseUser.uid);
      console.log('Firestore profile:', profileData);
      console.log('Detected role:', detectedRole);
      console.log('Redirect destination:', destinationRoute);

      navigate(destinationRoute, { replace: true });
    } catch (err) {
      if (err.message === 'User profile not found' || err.message === 'Invalid user role') {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage('Please enter your email address to reset password.');
      return;
    }
    setErrorMessage('');
    try {
      await resetPassword(formData.email);
      setInfoMessage('Password reset instructions sent to your campus email.');
      setTimeout(() => setInfoMessage(''), 6000);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] flex items-center justify-center p-4 py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E5E9E7] p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EEF9F7] rounded-xl mb-4 text-[#168C82]">
            <LayoutDashboard size={28} />
          </div>
          <h2 className="text-3xl font-bold text-[#111827] mb-2">Staff &amp; Admin Login</h2>
          <p className="text-[#667085]">Sign in to access your operational console</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-[#D95C5C] text-sm rounded-xl flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-3 bg-[#EEF9F7] border border-[#168C82]/30 text-[#168C82] text-xs rounded-xl text-center font-medium animate-fadeIn">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="user@campus.edu"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-[#111827]" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#168C82] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033] pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111827] p-1 rounded-md"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-[#168C82] hover:bg-[#127a71] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#E5E9E7]"></div>
          <span className="px-3 text-xs text-[#667085] font-medium uppercase tracking-wider">or continue with</span>
          <div className="flex-1 border-t border-[#E5E9E7]"></div>
        </div>

        <button
          type="button"
          disabled={loading || googleLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 border border-[#E5E9E7] bg-white hover:bg-[#F8FBFA] text-[#172033] font-medium rounded-xl transition-colors flex items-center justify-center gap-3 text-sm"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin text-[#168C82]" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm text-[#667085]">
          Students do not need an account.{' '}
          <Link to="/student" className="text-[#168C82] hover:underline font-semibold">
            Use Queue as Student &rarr;
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
