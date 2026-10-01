import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, Layers, Loader2 } from 'lucide-react';
import { useServices } from '../../hooks/useServices';

const ServicesPage = () => {
  const { services, loading } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const departmentNames = ['All', ...new Set(services.map(s => s.departmentName || s.departmentId || 'General'))];

  const filteredServices = services.filter(service => {
    const sName = service.name || '';
    const dName = service.departmentName || service.departmentId || '';
    const status = (service.status || '').toLowerCase();

    const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || dName === deptFilter || service.departmentId === deptFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Open' && status === 'open') || 
                          (statusFilter === 'Closed' && status === 'closed');
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Campus Services</h1>
        <p className="text-[#667085] mt-1 text-sm sm:text-base">Browse and join available campus queues in real time</p>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-2xl border border-[#E5E9E7] shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
          <input 
            type="text" 
            placeholder="Search services or departments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E9E7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168C82]/50 text-[#172033]"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-[#E5E9E7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#168C82]/50 text-[#172033]"
          >
            {departmentNames.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-[#E5E9E7] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#168C82]/50 text-[#172033]"
          >
            <option value="All">All Status</option>
            <option value="Open">Open Only</option>
            <option value="Closed">Closed Only</option>
          </select>
        </div>
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#168C82] mb-3" />
          <p className="text-sm text-[#667085]">Loading available campus services...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredServices.map((service) => {
            const isOpen = (service.status || '').toLowerCase() === 'open';
            return (
              <motion.div key={service.id} variants={itemVariants} className="bg-white border border-[#E5E9E7] rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF9F7] flex items-center justify-center text-[#168C82] shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      isOpen 
                        ? 'bg-[#EEF9F7] text-[#1B9A72] border border-[#1B9A72]/20' 
                        : 'bg-gray-100 text-[#667085] border border-gray-200'
                    }`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-[#111827] leading-snug">{service.name}</h3>
                    <p className="text-xs text-[#667085] mt-1">{service.departmentName || service.departmentId}</p>
                    <p className="text-sm text-[#667085] mt-3 line-clamp-2 leading-relaxed">
                      {service.description || 'Access university departmental and academic services online.'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="h-px bg-[#E5E9E7] w-full my-4"></div>
                  
                  <div className="flex items-center justify-between text-xs text-[#667085] mb-5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#168C82]" />
                      <span><strong>{service.activeCounters || 1}</strong> Counters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#168C82]" />
                      <span>~<strong>{service.averageServiceTime || 5}m</strong> wait</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/student/join-queue/${service.id}`}
                    className={`block w-full py-2.5 text-center rounded-xl text-sm font-semibold transition-colors ${
                      isOpen 
                        ? 'bg-[#168C82] text-white hover:bg-[#127A71] shadow-xs' 
                        : 'bg-[#F8FBFA] text-[#667085] cursor-not-allowed pointer-events-none border border-[#E5E9E7]'
                    }`}
                  >
                    {isOpen ? 'Join Queue' : 'Currently Closed'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#667085] bg-white rounded-2xl border border-[#E5E9E7]">
              No campus services found matching your filters.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ServicesPage;
