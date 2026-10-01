import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Activity, Edit2, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';

const StudentProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || '',
    phone: user?.phone || '+91 98765 43210',
    studentId: user?.studentId || 'STU001',
    departmentId: user?.departmentId || 'examination'
  });

  const getInitials = (name = 'User') => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
      });
      await refreshProfile();
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.name || user?.displayName || 'Student User';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Student Profile</h1>
        {successMsg && (
          <span className="text-xs text-[#1B9A72] flex items-center gap-1 font-semibold bg-[#EEF9F7] px-3 py-1 rounded-full border border-[#1B9A72]/20">
            <CheckCircle2 size={14} /> {successMsg}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#168C82] text-white flex items-center justify-center text-3xl font-extrabold mb-4 shadow-sm">
              {getInitials(displayName)}
            </div>
            <h2 className="text-xl font-bold text-[#111827]">{displayName}</h2>
            <p className="text-xs text-[#667085] mt-0.5">{user?.studentId || 'Verified Campus ID'}</p>
            <span className="mt-3 px-3 py-1 bg-[#EEF9F7] text-[#168C82] text-xs font-semibold rounded-full border border-[#168C82]/20">
              Role: Student
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm">
            <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-[#168C82]" /> Queue Account Status
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[#667085]">Account Status</p>
                <p className="text-sm font-bold text-[#1B9A72]">Active & Verified</p>
              </div>
              <div className="h-px bg-[#E5E9E7]"></div>
              <div>
                <p className="text-[#667085]">Registered Email</p>
                <p className="text-xs font-mono text-[#111827] mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details and Edit Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E9E7]">
              <div>
                <h3 className="font-bold text-lg text-[#111827]">Personal Information</h3>
                <p className="text-xs text-[#667085]">Protected Firebase profile credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168C82] hover:text-[#127A71] bg-[#EEF9F7] px-3 py-1.5 rounded-xl border border-[#168C82]/20"
              >
                <Edit2 size={13} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E9E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168C82] disabled:bg-[#F8FBFA] disabled:text-[#667085]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Student ID</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E9E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168C82] disabled:bg-[#F8FBFA] disabled:text-[#667085]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Campus Email (Locked)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                    <input 
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E9E7] rounded-xl bg-[#F8FBFA] text-[#667085] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E9E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168C82] disabled:bg-[#F8FBFA] disabled:text-[#667085]"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-[#E5E9E7] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#168C82] hover:bg-[#127A71] text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
