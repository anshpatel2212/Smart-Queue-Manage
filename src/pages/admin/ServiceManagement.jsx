import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Search, Filter, Loader2, Power } from 'lucide-react';
import { useAdminServices } from '../../hooks/useAdminServices';

const ServiceManagement = () => {
  const { 
    services, 
    departments, 
    loading: fetching, 
    addService, 
    editService, 
    removeService, 
    toggleServiceStatus 
  } = useAdminServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    departmentName: '',
    description: '',
    averageServiceTime: 5,
    activeCounters: 1,
    prefix: 'Q',
    status: 'open',
  });

  const showMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        departmentId: service.departmentId || (departments[0]?.id || ''),
        departmentName: service.departmentName || '',
        description: service.description || '',
        averageServiceTime: service.averageServiceTime || 5,
        activeCounters: service.activeCounters || 1,
        prefix: service.prefix || 'Q',
        status: service.status || 'open',
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        departmentId: departments[0]?.id || '',
        departmentName: departments[0]?.name || '',
        description: '',
        averageServiceTime: 5,
        activeCounters: 1,
        prefix: 'Q',
        status: 'open',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Service name is required');
      return;
    }

    const dept = departments.find(d => d.id === formData.departmentId);
    const payload = {
      ...formData,
      departmentName: dept?.name || formData.departmentName || 'General',
    };

    setLoading(true);
    try {
      if (editingService) {
        await editService(editingService.id, payload);
        showMsg(`Service "${formData.name}" updated successfully.`);
      } else {
        await addService(payload);
        showMsg(`Service "${formData.name}" created successfully.`);
      }
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to save service. You don't have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;
    try {
      await removeService(id);
      showMsg(`Service "${name}" deleted.`);
    } catch (err) {
      alert(err.message || "Failed to delete service. You don't have permission.");
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      await toggleServiceStatus(service.id, service.status);
      showMsg(`Service "${service.name}" status updated.`);
    } catch (err) {
      alert(err.message || 'Failed to update service status.');
    }
  };

  const filteredServices = services.filter(srv => {
    if (selectedDeptFilter !== 'ALL' && srv.departmentId !== selectedDeptFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = srv.name?.toLowerCase().includes(q);
      const matchDept = srv.departmentName?.toLowerCase().includes(q);
      if (!matchName && !matchDept) return false;
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
          <h1 className="text-2xl font-bold text-[#172033]">Service Management</h1>
          <p className="text-[#667085] mt-1">Configure campus services, wait parameters, and prefix routing in real time</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Service
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
              placeholder="Search services..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E9E7] text-sm focus:outline-none focus:border-[#168C82] bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#667085]" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E5E9E7] rounded-lg text-[#172033] text-sm font-medium focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {fetching && services.length === 0 ? (
          <div className="p-12 text-center text-[#667085] flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#168C82] mb-2" />
            <p>Loading services from Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white text-sm text-[#667085] border-b border-[#E5E9E7]">
                  <th className="p-4 font-medium">Service Name</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Prefix</th>
                  <th className="p-4 font-medium">Est. Service Time</th>
                  <th className="p-4 font-medium">Counters</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {filteredServices.map((service) => {
                  const isOpen = service.status === 'open' || service.status === 'Active';
                  return (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="p-4 font-bold text-[#172033]">{service.name}</td>
                      <td className="p-4 text-[#667085]">{service.departmentName || service.departmentId}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-gray-100 font-mono font-bold text-xs rounded text-[#172033]">
                          {service.prefix || 'Q'}
                        </span>
                      </td>
                      <td className="p-4 text-[#667085]">{service.averageServiceTime || 5} min</td>
                      <td className="p-4 text-[#667085]">{service.activeCounters || 1}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isOpen ? 'bg-[#EEF9F7] text-[#1B9A72]' : 'bg-gray-100 text-[#667085]'}`}>
                          {(service.status || 'open').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleToggleStatus(service)}
                            className="p-1.5 text-[#667085] hover:text-[#172033] hover:bg-gray-100 rounded-md transition-colors"
                            title={isOpen ? 'Close Service' : 'Open Service'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openModal(service)}
                            className="p-1.5 text-[#667085] hover:text-[#168C82] hover:bg-[#EEF9F7] rounded-md transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(service.id, service.name)}
                            className="p-1.5 text-[#667085] hover:text-[#D95C5C] hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#667085]">
                      No campus services found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E5E9E7] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#172033]">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={closeModal} className="text-[#667085] hover:text-[#172033]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Service Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Exam Hall Ticket" 
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

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service requirements and details..." 
                  className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Avg Time (min)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.averageServiceTime}
                    onChange={(e) => setFormData({ ...formData, averageServiceTime: parseInt(e.target.value, 10) || 5 })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Counters</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.activeCounters}
                    onChange={(e) => setFormData({ ...formData, activeCounters: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">Prefix</label>
                  <input 
                    type="text" 
                    maxLength="3"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-[#E5E9E7] rounded-lg text-sm font-mono uppercase focus:border-[#168C82] focus:outline-none"
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
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
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
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ServiceManagement;
