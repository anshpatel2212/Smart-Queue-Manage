import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Clock, Layers, Ticket, Users, ArrowRight, X, Loader2, Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useQueue } from '../../hooks/useQueue';
import { useServices } from '../../hooks/useServices';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard = () => {
  const greeting = getGreeting();
  const { user } = useAuth();
  const { computedData, cancelQueue, actionLoading } = useQueue();
  const { services, loading: servicesLoading } = useServices();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleCancel = async () => {
    try {
      setCancelError('');
      await cancelQueue();
      setConfirmCancel(false);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel token');
    }
  };

  const studentFirstName = user?.isAnonymous || user?.role === 'guest'
    ? 'Student'
    : (user?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Student');

  return (
    <motion.div 
      className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
          {greeting}, {studentFirstName} 👋
        </h1>
        <p className="text-[#667085] mt-1 text-sm sm:text-base">Here's your live queue status for today</p>
      </motion.div>

      {/* Active Queue Card */}
      {computedData ? (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B9A72] animate-pulse"></span>
              <span className="font-semibold text-[#172033]">Active Queue Ticket</span>
            </div>
            <span className="text-xs text-[#667085]">Joined at {computedData.joinedAt}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="flex-1 space-y-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-[#111827]">{computedData.service}</h3>
              <p className="text-sm text-[#667085]">{computedData.department}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="border-4 border-[#168C82]/20 rounded-2xl px-8 py-4 mb-3 bg-[#EEF9F7]">
                <span className="text-5xl font-black text-[#168C82] tracking-tight">{computedData.tokenNumber}</span>
              </div>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                computedData.status === 'called' 
                  ? 'bg-[#1B9A72] text-white animate-bounce' 
                  : computedData.status === 'in_service'
                  ? 'bg-[#168C82] text-white'
                  : 'bg-amber-100 text-[#E7A93B]'
              }`}>
                {computedData.status === 'in_service' ? 'In Service' : computedData.status}
              </span>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 gap-3 sm:gap-4 text-center sm:text-left">
              <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#E5E9E7]">
                <p className="text-xs text-[#667085] mb-1">Currently Serving</p>
                <p className="text-lg font-bold text-[#111827]">{computedData.currentlyServing}</p>
              </div>
              <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#E5E9E7]">
                <p className="text-xs text-[#667085] mb-1">People Ahead</p>
                <p className="text-lg font-bold text-[#111827]">{computedData.peopleAhead}</p>
              </div>
              <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#E5E9E7]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#667085]">Estimated Wait</p>
                  <span className="text-[9px] font-bold text-[#168C82] bg-[#EEF9F7] px-1 py-0.5 rounded border border-[#168C82]/20">
                    {computedData.predictionSource === 'ml' ? 'AI/ML' : 'ETA'}
                  </span>
                </div>
                <p className={`font-bold text-[#168C82] leading-tight ${computedData.estimatedWaitDisplay && computedData.estimatedWaitDisplay.length > 10 ? 'text-sm sm:text-base' : 'text-lg'}`}>
                  {computedData.estimatedWaitDisplay}
                </p>
              </div>
              <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#E5E9E7]">
                <p className="text-xs text-[#667085] mb-1">Assigned Counter</p>
                <p className="text-lg font-bold text-[#111827]">{computedData.counter}</p>
              </div>
            </div>
          </div>

          {cancelError && (
            <div className="mt-4 p-2.5 bg-red-50 text-red-600 text-xs rounded-lg">
              {cancelError}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E5E9E7] flex flex-wrap justify-end gap-3">
            {confirmCancel ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#667085]">Confirm cancel?</span>
                <button 
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-[#D95C5C] hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Yes, Cancel
                </button>
                <button 
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 border border-[#E5E9E7] text-xs font-semibold rounded-lg hover:bg-gray-50"
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirmCancel(true)}
                className="px-4 py-2 border border-[#D95C5C] text-[#D95C5C] hover:bg-red-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel Queue
              </button>
            )}

            <Link to="/student/my-token" className="px-5 py-2 bg-[#168C82] text-white rounded-xl hover:bg-[#127A71] transition-colors font-semibold text-sm flex items-center gap-2 shadow-xs">
              View Live Token <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#E5E9E7] p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF9F7] text-[#168C82] flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#111827] mb-2">No Active Queue</h3>
          <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
            You do not currently have a waiting ticket. Browse available campus services to join an instant digital queue.
          </p>
          <Link 
            to="/student/services"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#168C82] hover:bg-[#127A71] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <Sparkles size={16} /> Browse Services
          </Link>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: '4', icon: BarChart3, color: 'text-[#168C82]', bg: 'bg-[#EEF9F7]' },
          { label: 'Avg Wait Time', value: '12m', icon: Clock, color: 'text-[#E7A93B]', bg: 'bg-amber-50' },
          { label: 'Campus Services', value: services.length || '6', icon: Layers, color: 'text-[#1B9A72]', bg: 'bg-emerald-50' },
          { label: 'Active Tokens', value: computedData ? '1' : '0', icon: Ticket, color: 'text-[#111827]', bg: 'bg-gray-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E9E7] p-5 flex flex-col shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold text-[#111827]">{stat.value}</span>
            <span className="text-xs sm:text-sm text-[#667085] mt-0.5">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Available Services */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Available Campus Services</h2>
            <p className="text-xs text-[#667085]">Live services available for digital token generation</p>
          </div>
          <Link to="/student/services" className="text-[#168C82] text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {servicesLoading ? (
          <div className="p-8 text-center text-[#667085]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#168C82] mb-2" />
            <p className="text-sm">Loading campus services...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((service) => {
              const isOpen = service.status === 'open' || service.status === 'Open';
              return (
                <div key={service.id} className="bg-white border border-[#E5E9E7] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF9F7] flex items-center justify-center text-[#168C82]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isOpen 
                          ? 'bg-[#EEF9F7] text-[#1B9A72] border border-[#1B9A72]/20' 
                          : 'bg-gray-100 text-[#667085] border border-gray-200'
                      }`}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#111827] mb-1 line-clamp-1">{service.name}</h3>
                    <p className="text-xs text-[#667085] mb-3 line-clamp-1">{service.departmentName || service.departmentId}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-[#667085] mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#168C82]" />
                        <span>{service.activeCounters || 1} Counters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#168C82]" />
                        <span>~{service.averageServiceTime || 5}m avg</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/student/join-queue/${service.id}`}
                    className={`block w-full py-2 text-center rounded-xl text-sm font-semibold transition-colors ${
                      isOpen 
                        ? 'bg-[#168C82] hover:bg-[#127A71] text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    Join Queue
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
