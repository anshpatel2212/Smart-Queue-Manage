import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Settings, X, Edit2, Trash2, Loader2, Power } from 'lucide-react';
import { useAdminDepartments } from '../../hooks/useAdminDepartments';

const DepartmentManagement = () => {
  const { 
    departments, 
    loading: fetching, 
    addDepartment, 
    editDepartment, 
    removeDepartment, 
    toggleStatus 
  } = useAdminDepartments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activeCounters: 1,
    totalCounters: 2,
    status: 'active',
  });

  const showMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name || '',
        description: dept.description || '',
        activeCounters: dept.activeCounters || 1,
        totalCounters: dept.totalCounters || 2,
        status: dept.status || 'active',
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        description: '',
        activeCounters: 1,
        totalCounters: 2,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingDept(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Department name is required');
      return;
    }
    setLoading(true);
    try {
      if (editingDept) {
        await editDepartment(editingDept.id, formData);
        showMsg(`Department "${formData.name}" updated successfully.`);
      } else {
        await addDepartment(formData);
        showMsg(`Department "${formData.name}" created successfully.`);
      }
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save department. You don't have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the department "${name}"?`)) return;
    try {
      await removeDepartment(id);
      showMsg(`Department "${name}" deleted.`);
    } catch (err) {
      alert(err.message || "Failed to delete department. You don't have permission.");
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      await toggleStatus(dept.id, dept.status);
      showMsg(`Department status updated.`);
    } catch (err) {
      alert(err.message || 'Failed to update department status.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Management</h1>
          <p className="text-[#667085] mt-1">Configure campus departments, counters, and capacity in real time</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-semibold">
          {feedback}
        </div>
      )}

      {fetching && departments.length === 0 ? (
        <div className="p-12 text-center text-[#667085] flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#168C82] mb-2" />
          <p>Loading departments from Firestore...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const isActive = dept.status === 'active' || dept.status === 'Active';
            return (
              <div key={dept.id} className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-[#168C82]/50 transition-colors">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#172033]">{dept.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-[#EEF9F7] text-[#1B9A72]' : 'bg-gray-100 text-[#667085]'}`}>
                      {(dept.status || 'active').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#667085] text-sm mb-6 line-clamp-2">{dept.description || 'General university department services'}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FBFA] p-3 rounded-lg border border-[#E5E9E7]">
                      <div className="flex items-center gap-2 text-[#667085] mb-1">
                        <Settings className="w-4 h-4 text-[#168C82]" />
                        <span className="text-xs font-medium uppercase tracking-wider">Counters</span>
                      </div>
                      <p className="font-bold text-[#172033] text-lg">
                        {dept.activeCounters || 1} <span className="text-sm font-normal text-[#667085]">/ {dept.totalCounters || 2}</span>
                      </p>
                    </div>
                    <div className="bg-[#F8FBFA] p-3 rounded-lg border border-[#E5E9E7]">
                      <div className="flex items-center gap-2 text-[#667085] mb-1">
                        <Users className="w-4 h-4 text-[#168C82]" />
                        <span className="text-xs font-medium uppercase tracking-wider">Queue</span>
                      </div>
                      <p className="font-bold text-[#172033] text-lg">{dept.currentQueue || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-[#E5E9E7] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="text-[#D95C5C] hover:text-red-700 font-medium text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(dept)}
                      className="text-[#667085] hover:text-[#172033] font-medium text-xs flex items-center gap-1"
                      title={isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-3.5 h-3.5" /> {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <button 
                    onClick={() => openModal(dept)}
                    className="text-[#168C82] hover:text-[#127a71] font-semibold text-sm flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E5E9E7] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#172033]">{editingDept ? 'Edit Department' : 'Add New Department'}</h2>
              <button onClick={closeModal} className="text-[#667085] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Department Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Examinations" 
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of department scope..." 
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1">Active Counters</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.activeCounters}
                    onChange={(e) => setFormData({ ...formData, activeCounters: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1">Total Counters</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.totalCounters}
                    onChange={(e) => setFormData({ ...formData, totalCounters: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed / Inactive</option>
                </select>
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DepartmentManagement;
