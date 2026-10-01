import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [termsModal, setTermsModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!formData.agreeToTerms) {
      setErrorMessage('Please accept the Campus Terms of Service.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        studentId: formData.studentId,
        departmentId: formData.department || null,
        role: 'student'
      });
      navigate('/student');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EEF9F7] rounded-xl mb-4 text-[#168C82]">
            <LayoutDashboard size={28} />
          </div>
          <h2 className="text-3xl font-bold text-[#111827] mb-2">Create your account</h2>
          <p className="text-[#667085]">Join SmartQueue to manage your campus queues</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-[#D95C5C] text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="e.g. Arjun Mehta"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="email">
                Campus Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="student@campus.edu"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="studentId">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                required
                placeholder="e.g. STU001"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="department">
              Academic Department
            </label>
            <select
              id="department"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033] bg-white"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="" disabled>Select your department</option>
              <option value="examination">Examination Division</option>
              <option value="finance">Finance & Accounts</option>
              <option value="library">Library Services</option>
              <option value="student_admin">Student Administration</option>
              <option value="it_support">Computer Science & IT</option>
              <option value="general">General Campus Department</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E9E7] focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:border-transparent transition-shadow text-[#172033]"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                required
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                className="mt-1 w-4 h-4 rounded border-[#E5E9E7] text-[#168C82] focus:ring-[#168C82] accent-[#168C82]" 
              />
              <span className="text-sm text-[#667085] leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal(true)}
                  className="text-[#168C82] font-semibold hover:underline bg-transparent border-none p-0 inline"
                >
                  Campus Terms of Service
                </button>
                {' '}and Privacy Policy
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 bg-[#168C82] hover:bg-[#127A71] disabled:opacity-70 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            <span>Create Student Account</span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#667085]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#168C82] hover:text-[#127A71]">
            Sign in
          </Link>
        </p>

        {termsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5E9E7]">
              <h3 className="text-lg font-bold text-[#111827] mb-3">Campus Queue Policy</h3>
              <p className="text-xs text-[#667085] leading-relaxed mb-4">
                SmartQueue digital tokens are assigned on a fair-use basis per student ID. Misuse, duplicate queue hoarding, or abusive ticketing may result in temporary suspension of digital queue privileges.
              </p>
              <button
                type="button"
                onClick={() => setTermsModal(false)}
                className="w-full py-2 bg-[#168C82] text-white rounded-xl text-sm font-semibold hover:bg-[#127A71]"
              >
                Understood & Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RegisterPage;
