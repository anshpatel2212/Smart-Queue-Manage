import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, SkipForward, XCircle, Search, Layers, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import { 
  subscribeAllActiveTokens, 
  subscribeServiceTokens, 
  callNextToken,
  startService, 
  completeService,
  skipToken, 
  staffCancelToken 
} from '../../services/tokenService';

const LiveQueuePage = () => {
  const { user } = useAuth();
  const { services } = useServices();

  const [selectedServiceId, setSelectedServiceId] = useState('ALL');
  const [tokens, setTokens] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Subscribe to real-time tokens
  useEffect(() => {
    let unsub;
    if (selectedServiceId === 'ALL') {
      unsub = subscribeAllActiveTokens((items) => setTokens(items));
    } else {
      unsub = subscribeServiceTokens(selectedServiceId, (items) => setTokens(items));
    }
    return () => {
      if (unsub) unsub();
    };
  }, [selectedServiceId]);

  // Currently in-service token
  const currentlyServingToken = tokens.find(t => t.status === 'in_service') || tokens.find(t => t.status === 'called') || null;

  // Real-time duration counter for the currently served ticket
  useEffect(() => {
    if (!currentlyServingToken || currentlyServingToken.status !== 'in_service') {
      return;
    }

    const startTime = currentlyServingToken.serviceStartedAt?.toDate 
      ? currentlyServingToken.serviceStartedAt.toDate().getTime()
      : Date.now();

    const interval = setInterval(() => {
      const diffSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setTimerSeconds(diffSec);
    }, 1000);

    return () => {
      clearInterval(interval);
      setTimerSeconds(0);
    };
  }, [currentlyServingToken]);

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showFeedback = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleCallNext = async (tokenId, serviceId) => {
    setActionLoading(true);
    try {
      await callNextToken(serviceId, user, user?.counter || 1, tokenId);
      showFeedback(`Token called at Counter ${user?.counter || 1}.`);
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async (tokenId) => {
    setActionLoading(true);
    try {
      await startService(tokenId, user, user?.counter || 1);
      showFeedback('Token moved to in-service.');
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (tokenId) => {
    setActionLoading(true);
    try {
      await completeService(tokenId, user);
      showFeedback('Token marked as completed.');
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async (tokenId, item) => {
    if (item?.status === 'waiting') {
      return handleCallNext(tokenId, item.serviceId);
    }
    return handleStartService(tokenId);
  };

  const handleSkip = async (tokenId) => {
    setActionLoading(true);
    try {
      await skipToken(tokenId, user, 'Student not present at counter');
      showFeedback('Token marked as skipped.');
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this token from the queue?')) return;
    setActionLoading(true);
    try {
      await staffCancelToken(tokenId, user, 'Cancelled by counter operator');
      showFeedback('Token cancelled from queue.');
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and search logic
  const filteredItems = tokens.filter(item => {
    // Status filter
    if (filter !== 'All') {
      const itemStatus = item.status === 'in_service' ? 'in-service' : item.status;
      if (itemStatus.toLowerCase() !== filter.toLowerCase()) return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchToken = item.tokenNumber?.toLowerCase().includes(q);
      const matchStudent = item.userName?.toLowerCase().includes(q) || item.studentId?.toLowerCase().includes(q);
      const matchService = item.serviceName?.toLowerCase().includes(q);
      if (!matchToken && !matchStudent && !matchService) return false;
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
          <h1 className="text-2xl font-bold text-[#172033]">Live Queue Overview</h1>
          <p className="text-[#667085] mt-1">Real-time queue monitoring and token status</p>
        </div>
        
        {/* Service Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#E5E9E7] rounded-lg px-3 py-2 text-sm shadow-sm">
            <Layers className="w-4 h-4 text-[#168C82]" />
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="bg-transparent text-[#172033] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Campus Services</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-medium">
          {actionMsg}
        </div>
      )}

      {/* Current Serving Highlight */}
      <div className="bg-[#168C82] rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Play className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-4 h-4 bg-[#1B9A72] rounded-full animate-pulse shadow-[0_0_10px_#1B9A72]"></div>
            <div>
              <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">
                {currentlyServingToken?.status === 'in_service' ? 'Currently Serving' : currentlyServingToken?.status === 'called' ? 'Called to Counter' : 'Queue Standby'}
              </p>
              <h2 className="text-4xl font-bold">
                {currentlyServingToken?.tokenNumber || 'No Active Ticket'}
              </h2>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12">
            <div>
              <p className="text-sm opacity-80 mb-1">Student</p>
              <p className="font-semibold text-lg">{currentlyServingToken?.userName || '—'}</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Service</p>
              <p className="font-semibold text-lg">{currentlyServingToken?.serviceName || '—'}</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Duration</p>
              <p className="font-semibold text-lg font-mono">{currentlyServingToken ? formatTimer(timerSeconds) : '00:00'}</p>
            </div>
            {currentlyServingToken && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                {currentlyServingToken.status === 'called' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStartService(currentlyServingToken.id)}
                    className="px-4 py-2 bg-white text-[#168C82] font-semibold text-sm rounded-lg hover:bg-[#EEF9F7] transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" /> Start Service
                  </button>
                )}
                {currentlyServingToken.status === 'in_service' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleComplete(currentlyServingToken.id)}
                    className="px-4 py-2 bg-[#1B9A72] text-white font-semibold text-sm rounded-lg hover:bg-[#147959] transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-white/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Complete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E5E9E7] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FBFA]">
          <div className="flex flex-wrap gap-2">
            {['All', 'Waiting', 'In-Service', 'Called'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-[#168C82] text-white shadow-sm' 
                    : 'bg-white text-[#667085] border border-[#E5E9E7] hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, student, service..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg border border-[#E5E9E7] text-sm focus:outline-none focus:border-[#168C82] focus:ring-1 focus:ring-[#168C82] bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-sm text-[#667085] border-b border-[#E5E9E7]">
                <th className="p-4 font-medium">Token</th>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Est. Wait</th>
                <th className="p-4 font-medium">Counter</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E7]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FBFA] transition-colors text-sm">
                  <td className="p-4 font-bold text-[#172033]">{item.tokenNumber}</td>
                  <td className="p-4">
                    <p className="font-medium text-[#172033]">{item.userName || 'Student'}</p>
                    {item.studentId && <p className="text-xs text-[#667085]">{item.studentId}</p>}
                  </td>
                  <td className="p-4 text-[#667085]">{item.serviceName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5
                      ${item.status === 'in_service' ? 'bg-[#EEF9F7] text-[#168C82]' : 
                        item.status === 'called' ? 'bg-blue-50 text-blue-600' :
                        item.status === 'waiting' ? 'bg-amber-50 text-[#E7A93B]' : 
                        item.status === 'completed' ? 'bg-[#EEF9F7] text-[#1B9A72]' :
                        'bg-gray-100 text-[#667085]'}`}>
                      {(item.status === 'in_service' || item.status === 'called') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      )}
                      {item.status === 'in_service' ? 'IN SERVICE' : item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-[#667085]">
                    {item.status === 'waiting' ? (
                      <span className="flex items-center gap-1.5">
                        <span>~{item.estimatedWait !== undefined ? item.estimatedWait : 5} min</span>
                        {item.predictionSource === 'ml' && (
                          <span className="text-[9px] font-semibold text-[#168C82] bg-[#EEF9F7] px-1 py-0.5 rounded border border-[#168C82]/20">
                            ML
                          </span>
                        )}
                      </span>
                    ) : 'Now'}
                  </td>
                  <td className="p-4 text-[#667085]">
                    {item.counterNumber ? `Counter ${item.counterNumber}` : '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {item.status === 'waiting' && (
                        <>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleCallNext(item.id, item.serviceId)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF9F7] text-[#168C82] hover:bg-[#168C82] hover:text-white rounded-lg transition-colors font-medium text-xs shadow-sm cursor-pointer disabled:opacity-50"
                            title="Call Next Token"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call Next
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleSkip(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#E5E9E7] text-[#E7A93B] hover:bg-amber-50 rounded-lg transition-colors font-medium text-xs cursor-pointer disabled:opacity-50"
                            title="Skip Token"
                          >
                            <SkipForward className="w-3.5 h-3.5" /> Skip
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleCancel(item.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E5E9E7] text-[#D95C5C] hover:bg-red-50 rounded-lg transition-colors text-xs cursor-pointer disabled:opacity-50"
                            title="Cancel Token"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {item.status === 'called' && (
                        <>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleStartService(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#168C82] text-white hover:bg-[#127a71] rounded-lg transition-colors font-medium text-xs shadow-sm cursor-pointer disabled:opacity-50"
                            title="Start Service"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Service
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleSkip(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#E5E9E7] text-[#E7A93B] hover:bg-amber-50 rounded-lg transition-colors font-medium text-xs cursor-pointer disabled:opacity-50"
                            title="Skip Token"
                          >
                            <SkipForward className="w-3.5 h-3.5" /> Skip
                          </button>
                        </>
                      )}
                      {item.status === 'in_service' && (
                        <>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleComplete(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#1B9A72] text-white hover:bg-[#147959] rounded-lg transition-colors font-medium text-xs shadow-sm cursor-pointer disabled:opacity-50"
                            title="Complete Service"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleSkip(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#E5E9E7] text-[#E7A93B] hover:bg-amber-50 rounded-lg transition-colors font-medium text-xs cursor-pointer disabled:opacity-50"
                            title="Skip Token"
                          >
                            <SkipForward className="w-3.5 h-3.5" /> Skip
                          </button>
                        </>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-[#1B9A72] font-medium text-xs bg-[#EEF9F7] px-2.5 py-1 rounded-md">
                          Completed
                        </span>
                      )}
                      {item.status === 'skipped' && (
                        <span className="text-[#E7A93B] font-medium text-xs bg-amber-50 px-2.5 py-1 rounded-md">
                          Skipped
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="text-[#D95C5C] font-medium text-xs bg-red-50 px-2.5 py-1 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#667085]">
                    No tokens found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveQueuePage;
