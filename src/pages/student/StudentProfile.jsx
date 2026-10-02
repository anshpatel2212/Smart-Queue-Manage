import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Ticket, Layers, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StudentProfile = () => {
  const { user, isAnonymous, role, resetAnonymousSession } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  const isGuest = isAnonymous || role === 'guest' || !user?.email;

  const handleResetSession = async () => {
    if (window.confirm('Resetting your session will start a new anonymous guest ID. Any active tokens associated with your current session will no longer be tracked. Continue?')) {
      setResetting(true);
      try {
        if (resetAnonymousSession) {
          await resetAnonymousSession();
        } else {
          window.location.reload();
        }
        setMessage('Guest session reset successfully.');
        setTimeout(() => setMessage(''), 4000);
      } catch (err) {
        console.error(err);
      } finally {
        setResetting(false);
      }
    }
  };

  const displayName = isGuest ? 'Guest Student' : (user?.name || user?.displayName || 'Student User');
  const sessionId = user?.uid ? `${user.uid.substring(0, 10)}...${user.uid.substring(user.uid.length - 4)}` : 'Active Session';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Student Profile</h1>
          <p className="text-sm text-[#667085] mt-0.5">Campus queue access and session status</p>
        </div>
        {message && (
          <span className="text-xs text-[#1B9A72] flex items-center gap-1 font-semibold bg-[#EEF9F7] px-3 py-1.5 rounded-full border border-[#1B9A72]/20">
            <CheckCircle2 size={14} /> {message}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#168C82] text-white flex items-center justify-center text-2xl font-extrabold mb-4 shadow-sm">
              <User size={36} />
            </div>
            <h2 className="text-xl font-bold text-[#111827]">{displayName}</h2>
            <p className="text-xs text-[#667085] mt-1 font-mono">{sessionId}</p>
            <span className="mt-3 px-3 py-1 bg-[#EEF9F7] text-[#168C82] text-xs font-semibold rounded-full border border-[#168C82]/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1B9A72] animate-pulse"></span>
              {isGuest ? 'Anonymous Student' : 'Registered Student'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm">
            <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-[#168C82]" /> Account Policy
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              SmartQueue is designed for instant accessibility. Students do not need an account, password, or verification to join queues.
            </p>
          </div>
        </div>

        {/* Details & Session Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E9E7]">
              <div>
                <h3 className="font-bold text-lg text-[#111827]">Queue Session Details</h3>
                <p className="text-xs text-[#667085]">Your anonymous guest credentials for this device</p>
              </div>
              <span className="text-xs font-semibold text-[#1B9A72] bg-[#EEF9F7] px-3 py-1 rounded-full border border-[#1B9A72]/20">
                No Login Required
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
                <p className="text-xs font-semibold text-[#667085] mb-1">Anonymous Student UID</p>
                <p className="font-mono text-xs text-[#111827] break-all">{user?.uid || 'Initializing anonymous session...'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
                  <p className="text-xs font-semibold text-[#667085] mb-1">Access Role</p>
                  <p className="font-bold text-[#168C82]">Guest / Student</p>
                </div>

                <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
                  <p className="text-xs font-semibold text-[#667085] mb-1">Queue Status</p>
                  <p className="font-bold text-[#1B9A72]">Authorized to Join Any Queue</p>
                </div>
              </div>

              <div className="p-4 bg-[#EEF9F7]/70 rounded-xl border border-[#168C82]/20 flex items-start gap-3">
                <Sparkles size={18} className="text-[#168C82] shrink-0 mt-0.5" />
                <p className="text-xs text-[#172033] leading-relaxed">
                  Your queue tokens and live position updates are automatically synchronized to this browser. When you visit any campus service, you can generate a digital token immediately.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E9E7] flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Link 
                    to="/student/my-token" 
                    className="px-4 py-2 bg-[#168C82] hover:bg-[#127A71] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Ticket size={14} /> My Token
                  </Link>
                  <Link 
                    to="/student/services" 
                    className="px-4 py-2 border border-[#E5E9E7] hover:bg-[#F8FBFA] text-[#111827] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Layers size={14} /> Browse Services
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleResetSession}
                  disabled={resetting}
                  className="px-3.5 py-2 text-[#667085] hover:text-[#D95C5C] hover:bg-red-50 border border-[#E5E9E7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={13} className={resetting ? 'animate-spin' : ''} />
                  <span>Reset Guest Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
