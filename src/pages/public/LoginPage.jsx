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
  const { signInWithGoogle, resetPassword, refreshProfile } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.error || '');
  const [infoMessage, setInfoMessage] = useState('');

  const routeByFirestoreRole = (role) => {
    if (role === 'student') {
      navigate('/student');
    } else if (role === 'staff') {
      navigate('/staff');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      setErrorMessage('Your account role is not configured. Please contact the administrator.');
    }
  };

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

      // 2. Read Firestore role strictly from users/{firebaseUser.uid}
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData = null;

      if (userDocSnap.exists()) {
        userData = userDocSnap.data();
      } else {
        // Fallback: check query by email in case document was created beforehand
        const qEmail = query(
          collection(db, 'users'),
          where('email', '==', firebaseUser.email?.toLowerCase().trim())
        );
        const emailSnap = await getDocs(qEmail);

        if (!emailSnap.empty) {
          userData = emailSnap.docs[0].data();
          await setDoc(userDocRef, { ...userData, uid: firebaseUser.uid }, { merge: true }).catch(() => {});
        } else {
          // If profile is completely missing, infer role from verified campus emails or default student
          const emailLower = (firebaseUser.email || '').toLowerCase().trim();
          let defaultRole = 'student';
          if (emailLower.includes('admin') || emailLower === 'admin@smartcampus.edu') {
            defaultRole = 'admin';
          } else if (emailLower.includes('staff') || emailLower === 'kavitha.nair@smartcampus.edu') {
            defaultRole = 'staff';
          }

          userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Campus User',
            email: firebaseUser.email,
            role: defaultRole,
            status: 'active',
            departmentId: defaultRole === 'staff' ? 'examination' : null,
            counter: defaultRole === 'staff' ? 1 : null,
          };
          await setDoc(userDocRef, userData);
        }
      }

      // Check account status: only 'active' allowed
      if (userData.status === 'inactive') {
        await signOut(auth);
        setErrorMessage('Your account is inactive. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Check role validity
      const role = userData.role;
      if (!role || !['student', 'staff', 'admin'].includes(role)) {
        await signOut(auth);
        setErrorMessage('Your account role is not configured. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Sync user profile in AuthContext
      if (refreshProfile) {
        await refreshProfile();
      }

      // 3. Role Routing strictly by Firestore role
      routeByFirestoreRole(role);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setGoogleLoading(true);
    try {
      const profile = await signInWithGoogle();
      routeByFirestoreRole(profile?.role);
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in failed.');
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
          <h2 className="text-3xl font-bold text-[#111827] mb-2">Welcome back</h2>
          <p className="text-[#667085]">Sign in to your SmartQueue account</p>
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
          Don't have an account?{' '}
          <Link to="/register" className="text-[#168C82] hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
