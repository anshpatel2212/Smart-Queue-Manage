import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Briefcase, Award, Star, Clock, Edit2, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import { getStaffHistory } from '../../services/historyService';

const StaffProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [historyCount, setHistoryCount] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || 'Staff Member',
    email: user?.email || '',
    phone: user?.phone || '',
    departmentId: user?.departmentId || 'Examination',
    counter: user?.counter || 1,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.displayName || 'Staff Member',
        email: user.email || '',
        phone: user.phone || '',
        departmentId: user.departmentId || 'Examination',
        counter: user.counter || 1,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      getStaffHistory(user.uid, 50).then(items => {
        setHistoryCount(items.length);
      }).catch(() => {});
    }
  }, [user?.uid]);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        phone: formData.phone,
      });
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Staff Profile</h1>
          <p className="text-[#667085] text-sm mt-0.5">Manage your operator account details</p>
        </div>
        
        {isEditing ? (
          <button 
            disabled={loading}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg transition-colors shadow-sm font-medium text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E9E7] rounded-lg text-[#172033] hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-[#168C82] to-[#127a71]"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-[#F8FBFA] flex items-center justify-center text-4xl font-bold text-[#168C82] shadow-sm">
              {getInitials(formData.name)}
            </div>
            <div className="text-center sm:text-left flex-1 mb-2">
              <h2 className="text-3xl font-bold text-[#172033]">{formData.name}</h2>
              <p className="text-[#667085] font-medium mt-1">Campus Counter Staff</p>
            </div>
            <div className="mb-2">
              <span className="px-3 py-1 bg-[#EEF9F7] text-[#168C82] rounded-full text-sm font-semibold border border-[#168C82]/20">
                Active Staff
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#172033] border-b border-[#E5E9E7] pb-2">Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-[#667085]">Full Name</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 w-full p-2 border border-[#E5E9E7] rounded-md text-sm focus:border-[#168C82] focus:outline-none" 
                      />
                    ) : (
                      <p className="font-medium text-[#172033]">{formData.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-[#667085]">Email Address</p>
                    <p className="font-medium text-[#172033]">{formData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-[#667085]">Department</p>
                    <p className="font-medium text-[#172033] capitalize">{formData.departmentId}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-[#667085]">Assigned Counter</p>
                    <p className="font-medium text-[#172033]">Counter {formData.counter}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#172033] border-b border-[#E5E9E7] pb-2">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#E5E9E7]">
                  <div className="flex items-center gap-2 mb-2 text-[#667085]">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Tokens Served</span>
                  </div>
                  <p className="text-2xl font-bold text-[#172033]">{historyCount}</p>
                </div>
                <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#E5E9E7]">
                  <div className="flex items-center gap-2 mb-2 text-[#667085]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Avg Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-[#172033]">5 min</p>
                </div>
                <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#E5E9E7]">
                  <div className="flex items-center gap-2 mb-2 text-[#667085]">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-[#172033]">4.9 / 5</p>
                </div>
                <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#E5E9E7]">
                  <div className="flex items-center gap-2 mb-2 text-[#667085]">
                    <Award className="w-4 h-4 text-[#168C82]" />
                    <span className="text-sm">Reliability</span>
                  </div>
                  <p className="text-2xl font-bold text-[#172033]">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffProfile;
