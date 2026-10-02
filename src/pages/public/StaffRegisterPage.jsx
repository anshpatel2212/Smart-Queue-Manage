import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { registerStaffUser } from '../../services/authService';
import { getDepartments } from '../../services/departmentService';

const DEFAULT_DEPARTMENTS = [
  { id: 'examination', name: 'Examination' },
  { id: 'finance', name: 'Finance' },
  { id: 'library', name: 'Library' },
  { id: 'student_admin', name: 'Student Administration' },
  { id: 'it_support', name: 'IT Support' },
];

const StaffRegisterPage = () => {
  const { loading: authLoading, ensureAnonymousUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    staffId: '',
    departmentId: '',
    password: '',
    confirmPassword: '',
  });

  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Requirement 25: Do not execute Firestore queries while authLoading === true
    if (authLoading) return;

    const initAuthAndDepartments = async () => {
      try {
        // Requirement 1 & 2: Ensure Firebase Authentication has an authenticated session before querying
        if (!auth.currentUser && ensureAnonymousUser) {
          console.log("[StaffRegister] Establishing temporary anonymous session for registration...");
          await ensureAnonymousUser();
        }

        // Requirement 3: Load departments only after authentication is ready
        const depts = await getDepartments();
        if (isMounted && Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
        }
      } catch (err) {
        console.warn("[StaffRegister] Departments loading fallback to defaults:", err);
      }
    };

    initAuthAndDepartments();

    return () => {
      isMounted = false;
    };
  }, [authLoading, ensureAnonymousUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!formData.staffId.trim()) {
      setErrorMessage('Staff ID is required.');
      return;
    }

    if (!formData.departmentId) {
      setErrorMessage('Please select your department.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Requirement 23: Debugging logs
    console.log("AUTH USER:", auth.currentUser);
    console.log("STAFF REGISTRATION UID:", auth.currentUser?.uid);
    console.log("SELECTED DEPARTMENT:", formData.departmentId);

    setLoading(true);

    try {
      await registerStaffUser({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        staffId: formData.staffId.trim(),
        departmentId: formData.departmentId,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("[StaffRegister] Registration error:", err);
      setErrorMessage(err.message || 'Staff access request failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] flex items-center justify-center p-4 py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-[#E5E9E7] p-8"
      >
        {submitted ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EEF9F7] text-[#1B9A72] rounded-2xl mb-5">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Request Submitted</h2>
            <div className="p-4 bg-[#EEF9F7] border border-[#168C82]/20 rounded-xl mb-4 text-[#168C82] text-sm font-semibold leading-relaxed">
              Staff access request submitted successfully.
              <br />
              <span className="font-normal text-[#172033]">
                Your account is waiting for administrator approval.
              </span>
            </div>
            <p className="text-sm text-[#667085] max-w-md mx-auto mb-6 leading-relaxed">
              Once an administrator activates your account, you will be able to sign in with your email and password to access the Staff Operations Console.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#168C82] hover:bg-[#127a71] text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
            >
              Return to Login &rarr;
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EEF9F7] rounded-xl mb-4 text-[#168C82]">
                <UserPlus size={28} />
              </div>
              <h2 className="text-3xl font-bold text-[#111827] mb-2">Request Staff Access</h2>
              <p className="text-[#667085]">Register a new staff account for campus queue management</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-[#D95C5C] text-sm rounded-xl flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Dr. Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="email">
                  Staff Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="jane.doe@campus.edu"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="staffId">
                    Staff ID
                  </label>
                  <input
                    id="staffId"
                    type="text"
                    required
                    placeholder="STF-1042"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="departmentId">
                    Department
                  </label>
                  <select
                    id="departmentId"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033] bg-white"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033] pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111827]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033] pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111827]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                <strong>Notice:</strong> Staff access requests are created with <strong>pending approval</strong> status. An administrator must verify and activate your account before you can log in.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#168C82] hover:bg-[#127a71] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Staff Access Request'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#667085]">
              Already have an approved account?{' '}
              <Link to="/login" className="text-[#168C82] hover:underline font-semibold">
                Sign In &rarr;
              </Link>
            </p>

            <p className="mt-3 text-center text-sm text-[#667085]">
              Students do not need an account.{' '}
              <Link to="/student" className="text-[#168C82] hover:underline font-semibold">
                Use Queue as Student &rarr;
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default StaffRegisterPage;
