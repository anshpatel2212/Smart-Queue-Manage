import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, UserX, UserCheck, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAdminStaff } from '../../hooks/useAdminStaff';

const StaffManagement = () => {
  const { 
    staffMembers, 
    departments, 
    loading: fetching, 
    updateStaff, 
    toggleStatus,
    approveStaff
  } = useAdminStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    departmentId: '',
    role: 'staff',
    counter: 1,
    status: 'active',
  });

  const showMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const openModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || staff.displayName || '',
      email: staff.email || '',
      departmentId: staff.departmentId || staff.department || (departments[0]?.id || 'examination'),
      role: staff.role || 'staff',
      counter: staff.counter || 1,
      status: staff.status || 'active',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Staff name is required.');
      return;
    }
    if (!editingStaff?.uid && !editingStaff?.id) {
      alert('Cannot update a staff member without a valid account ID.');
      return;
    }

    setLoading(true);
    try {
      const targetUid = editingStaff.uid || editingStaff.id;
      await updateStaff(targetUid, {
        name: formData.name.trim(),
        departmentId: formData.departmentId,
        role: formData.role === 'admin' ? 'admin' : 'staff', // Protect role elevation
        counter: parseInt(formData.counter, 10) || 1,
        status: formData.status,
      });
      showMsg(`Staff member "${formData.name}" updated successfully.`);
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to update staff member. You don't have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (staff) => {
    const targetUid = staff.uid || staff.id;
    try {
      await approveStaff(targetUid);
      showMsg(`Staff account for "${staff.name || 'Staff'}" approved and activated!`);
    } catch (err) {
      alert(err.message || 'Failed to approve staff account.');
    }
  };

  const handleToggleStatus = async (staff) => {
    const targetUid = staff.uid || staff.id;
    try {
      await toggleStatus(targetUid, staff.status);
      showMsg(`Status for ${staff.name || 'staff'} updated.`);
    } catch (err) {
      alert(err.message || 'Failed to update staff status.');
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const currentStatus = String(staff.status || 'active').toLowerCase().trim();
    if (selectedStatusFilter !== 'ALL') {
      if (selectedStatusFilter === 'pending' && currentStatus !== 'pending') return false;
      if (selectedStatusFilter === 'active' && currentStatus !== 'active') return false;
      if (selectedStatusFilter === 'offline' && currentStatus !== 'offline' && currentStatus !== 'inactive') return false;
    }
    if (selectedDeptFilter !== 'ALL') {
      const matchDept = (staff.departmentId || staff.department || '').toLowerCase() === selectedDeptFilter.toLowerCase();
      if (!matchDept) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = staff.name?.toLowerCase().includes(q);
      const matchEmail = staff.email?.toLowerCase().includes(q);
      const matchId = staff.staffId?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Staff Management</h1>
          <p className="text-[#667085] mt-1">Review staff access requests, approve pending accounts, and manage counters</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#168C82]" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E5E9E7] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#F8FBFA]">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or staff ID..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E9E7] text-sm focus:outline-none focus:border-[#168C82] bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-[#E5E9E7] rounded-lg text-sm text-[#172033] focus:outline-none focus:border-[#168C82]"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="offline">Offline / Inactive</option>
            </select>
            <select 
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-[#E5E9E7] rounded-lg text-sm text-[#172033] focus:outline-none focus:border-[#168C82]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {fetching && staffMembers.length === 0 ? (
          <div className="p-12 text-center text-[#667085] flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#168C82] mb-2" />
            <p>Loading staff members from Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white text-sm text-[#667085] border-b border-[#E5E9E7]">
                  <th className="p-4 font-medium">Name &amp; ID</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Assigned Counter</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {filteredStaff.map((staff) => {
                  const normStatus = String(staff.status || 'active').toLowerCase().trim();
                  const isActive = normStatus === 'active';
                  const isPending = normStatus === 'pending';
                  const initials = staff.name ? staff.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'S';

                  return (
                    <tr key={staff.uid || staff.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="p-4 font-medium text-[#172033]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isPending 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-[#168C82]/10 text-[#168C82]'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div>{staff.name || 'Staff Member'}</div>
                            <div className="text-xs text-[#667085]">
                              {staff.staffId ? `ID: ${staff.staffId}` : (staff.uid ? staff.uid.substring(0, 10) + '...' : '')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#667085]">{staff.email}</td>
                      <td className="p-4 text-[#667085] capitalize">{staff.departmentId || staff.department || 'Examination'}</td>
                      <td className="p-4 text-[#667085] capitalize font-medium">{staff.role || 'Staff'}</td>
                      <td className="p-4 text-[#667085]">Counter {staff.counter || '1'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive 
                            ? 'bg-[#EEF9F7] text-[#1B9A72]' 
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-[#667085]'
                        }`}>
                          {isPending ? 'PENDING APPROVAL' : (staff.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end items-center gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleApprove(staff)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF9F7] text-[#168C82] hover:bg-[#168C82] hover:text-white rounded-lg text-xs font-semibold transition-colors border border-[#168C82]/30 shadow-xs"
                              title="Approve Staff Request"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => openModal(staff)}
                            className="p-1.5 text-[#667085] hover:text-[#168C82] hover:bg-[#EEF9F7] rounded-md transition-colors"
                            title="Edit Staff Account"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(staff)}
                            className="p-1.5 text-[#667085] hover:text-[#E7A93B] hover:bg-amber-50 rounded-md transition-colors"
                            title={isActive ? 'Deactivate Staff' : 'Activate Staff'}
                          >
                            {isActive ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#667085]">
                      No staff members found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E5E9E7] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#172033]">Edit Staff Account</h2>
              <button onClick={closeModal} className="text-[#667085] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Email (Read Only)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm bg-gray-50 text-[#667085]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Department</label>
                <select 
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1">Counter Number</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.counter}
                    onChange={(e) => setFormData({ ...formData, counter: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="offline">Offline / Inactive</option>
                    <option value="break">On Break</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E9E7]">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm text-[#667085] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StaffManagement;
