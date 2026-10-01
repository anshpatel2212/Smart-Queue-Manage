import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, UserX, X, Loader2 } from 'lucide-react';
import { getAllUsers, updateUserByAdmin } from '../../services/userService';
import { getDepartments } from '../../services/serviceService';
import { staffMembers as fallbackStaff } from '@/data/mockData';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    departmentId: '',
    role: 'staff',
    counter: 1,
    status: 'active',
  });

  const loadData = async () => {
    try {
      const [allUsers, depts] = await Promise.all([
        getAllUsers(),
        getDepartments(),
      ]);
      setDepartments(depts);
      // Filter staff or admin or fallback
      const staffList = allUsers.filter(u => u.role === 'staff' || u.role === 'admin');
      if (staffList.length > 0) {
        setUsers(staffList);
      } else {
        setUsers(fallbackStaff);
      }
    } catch (err) {
      console.warn('Error loading staff list:', err);
      setUsers(fallbackStaff);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const openModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name || staff.displayName || '',
        email: staff.email || '',
        departmentId: staff.departmentId || staff.department || (departments[0]?.id || 'examination'),
        role: staff.role || 'staff',
        counter: staff.counter || 1,
        status: staff.status || 'active',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        departmentId: departments[0]?.id || 'examination',
        role: 'staff',
        counter: 1,
        status: 'active',
      });
    }
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
    setLoading(true);
    try {
      if (editingStaff && editingStaff.uid) {
        await updateUserByAdmin(editingStaff.uid, {
          name: formData.name,
          departmentId: formData.departmentId,
          role: formData.role,
          counter: parseInt(formData.counter, 10) || 1,
          status: formData.status,
        });
        showMsg(`Staff member ${formData.name} updated.`);
      } else {
        // Local update or mock fallback
        setUsers(prev => {
          const id = editingStaff ? editingStaff.id : `STF${Date.now()}`;
          const updated = { id, ...formData };
          return editingStaff 
            ? prev.map(u => (u.id === editingStaff.id ? updated : u))
            : [updated, ...prev];
        });
        showMsg(`Staff member ${formData.name} saved.`);
      }
      closeModal();
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    const newStatus = staff.status === 'active' || staff.status === 'Active' ? 'offline' : 'active';
    try {
      if (staff.uid) {
        await updateUserByAdmin(staff.uid, { status: newStatus });
      }
      setUsers(prev => prev.map(u => (u.id === staff.id || u.uid === staff.uid ? { ...u, status: newStatus } : u)));
      showMsg(`Status updated to ${newStatus}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredStaff = users.filter(staff => {
    if (selectedDeptFilter !== 'ALL') {
      const matchDept = (staff.departmentId || staff.department || '').toLowerCase() === selectedDeptFilter.toLowerCase();
      if (!matchDept) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = staff.name?.toLowerCase().includes(q);
      const matchEmail = staff.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
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
          <p className="text-[#667085] mt-1">Manage counter staff accounts, roles, and assignments</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-semibold">
          {feedback}
        </div>
      )}

      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E5E9E7] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FBFA]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E9E7] text-sm focus:outline-none focus:border-[#168C82] bg-white"
            />
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white text-sm text-[#667085] border-b border-[#E5E9E7]">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Assigned Counter</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E7]">
              {filteredStaff.map((staff) => (
                <tr key={staff.id || staff.uid} className="hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 font-medium text-[#172033]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#168C82]/10 text-[#168C82] flex items-center justify-center font-bold text-xs">
                        {staff.name ? staff.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'S'}
                      </div>
                      {staff.name}
                    </div>
                  </td>
                  <td className="p-4 text-[#667085]">{staff.email}</td>
                  <td className="p-4 text-[#667085] capitalize">{staff.departmentId || staff.department || 'Examination'}</td>
                  <td className="p-4 text-[#667085] capitalize">{staff.role || 'Staff'}</td>
                  <td className="p-4 text-[#667085]">Counter {staff.counter || '1'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      staff.status === 'active' || staff.status === 'Active' 
                        ? 'bg-[#EEF9F7] text-[#1B9A72]' 
                        : 'bg-gray-100 text-[#667085]'
                    }`}>
                      {(staff.status || 'active').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(staff)}
                        className="p-1.5 text-[#667085] hover:text-[#168C82] hover:bg-[#EEF9F7] rounded-md transition-colors"
                        title="Edit Staff"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(staff)}
                        className="p-1.5 text-[#667085] hover:text-[#E7A93B] hover:bg-amber-50 rounded-md transition-colors"
                        title="Toggle Status"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E5E9E7] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#172033]">{editingStaff ? 'Edit Staff Account' : 'Add Staff Member'}</h2>
              <button onClick={closeModal} className="text-[#667085] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar" 
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@smartcampus.edu" 
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
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
                  <label className="block text-sm font-medium text-[#172033] mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
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
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
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
