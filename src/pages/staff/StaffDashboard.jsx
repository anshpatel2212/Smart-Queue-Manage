import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Play, CheckCircle, SkipForward, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import { 
  subscribeServiceTokens, 
  callNextToken, 
  startService, 
  completeService, 
  skipToken 
} from '../../services/tokenService';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { services, loading: servicesLoading } = useServices();

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [counterNumber, setCounterNumber] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Default to staff's assigned department service or first available service
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      const match = user?.departmentId 
        ? services.find(s => s.departmentId === user.departmentId)
        : services[0];
      setSelectedServiceId(match ? match.id : services[0].id);
    }
  }, [services, selectedServiceId, user?.departmentId]);

  // Subscribe to real-time tokens for selected service
  useEffect(() => {
    if (!selectedServiceId) return;
    const unsub = subscribeServiceTokens(selectedServiceId, (tokenList) => {
      setTokens(tokenList);
    });
    return () => unsub();
  }, [selectedServiceId]);

  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const calledTokens = tokens.filter(t => t.status === 'called');
  const inServiceTokens = tokens.filter(t => t.status === 'in_service');

  // Currently active token at staff counter
  const currentActiveToken = inServiceTokens[0] || calledTokens[0] || null;
  const nextWaitingToken = waitingTokens[0] || null;

  const currentServiceName = services.find(s => s.id === selectedServiceId)?.name || 'Campus Queue';

  const showFeedback = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleCallNext = async () => {
    if (!selectedServiceId) return;
    setActionLoading(true);
    try {
      const called = await callNextToken(selectedServiceId, user, counterNumber);
      if (called) {
        showFeedback(`Called token ${called.tokenNumber} to Counter ${counterNumber}`);
      } else {
        showFeedback('No waiting tokens in this service queue.');
      }
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async () => {
    const target = currentActiveToken || calledTokens[0];
    if (!target) {
      showFeedback('No called token available to start.');
      return;
    }
    setActionLoading(true);
    try {
      await startService(target.id || target.tokenId, user, counterNumber);
      showFeedback(`Started service for ${target.tokenNumber}`);
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    const target = inServiceTokens[0] || currentActiveToken;
    if (!target) {
      showFeedback('No token currently in service to complete.');
      return;
    }
    setActionLoading(true);
    try {
      await completeService(target.id || target.tokenId, user);
      showFeedback(`Completed token ${target.tokenNumber}`);
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    const target = currentActiveToken;
    if (!target) {
      showFeedback('No token currently called/serving to skip.');
      return;
    }
    setActionLoading(true);
    try {
      await skipToken(target.id || target.tokenId, user, 'Student absent at desk');
      showFeedback(`Marked token ${target.tokenNumber} as skipped/no-show`);
    } catch (err) {
      showFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Staff Operations: {user?.name || 'Officer'}
          </h1>
          <p className="text-[#667085] mt-1 text-sm">
            Managing: <strong>{currentServiceName}</strong> | Desk: Counter {counterNumber}
          </p>
        </div>

        {/* Counter and Service Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E9E7] text-xs">
            <span className="text-[#667085] font-semibold">Desk:</span>
            <select
              value={counterNumber}
              onChange={(e) => setCounterNumber(Number(e.target.value))}
              className="bg-transparent font-bold text-[#111827] focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>Counter {n}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            disabled={servicesLoading}
            className="bg-white border border-[#E5E9E7] text-[#111827] text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168C82]/40"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] text-xs sm:text-sm font-semibold rounded-xl border border-[#168C82]/20 flex items-center gap-2 animate-fadeIn">
          <Sparkles size={16} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#168C82] text-white p-6 rounded-2xl shadow-sm sm:col-span-2 flex flex-col justify-center">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-85 mb-1">
            Current Token ({currentActiveToken?.status === 'in_service' ? 'In Service' : currentActiveToken?.status || 'Idle'})
          </h3>
          <div className="text-4xl sm:text-5xl font-black tracking-tight">
            {currentActiveToken?.tokenNumber || 'None'}
          </div>
          <p className="text-xs opacity-80 mt-1 truncate">
            {currentActiveToken ? `${currentActiveToken.userName || 'Student'} • Counter ${currentActiveToken.counterNumber || counterNumber}` : 'Waiting for next call'}
          </p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Next in Line</h3>
          <div className="text-3xl font-black text-[#111827]">{nextWaitingToken?.tokenNumber || 'None'}</div>
          <p className="text-xs text-[#667085] truncate mt-0.5">{nextWaitingToken?.userName || 'Line empty'}</p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Waiting Total</h3>
          <div className="text-3xl font-black text-[#E7A93B]">{waitingTokens.length}</div>
          <p className="text-xs text-[#667085] mt-0.5">Students queued</p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-5 rounded-2xl shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Active Desk</h3>
          <div className="text-3xl font-black text-[#1B9A72]">Counter {counterNumber}</div>
          <p className="text-xs text-[#667085] mt-0.5">Desk operational</p>
        </div>
      </div>

      {/* Main Staff Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleCallNext}
          disabled={actionLoading || waitingTokens.length === 0}
          className="bg-[#168C82] hover:bg-[#127A71] disabled:opacity-50 text-white rounded-2xl py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-base sm:text-lg transition-colors cursor-pointer"
        >
          {actionLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Phone className="w-8 h-8" />}
          <span>CALL NEXT</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleStartService}
          disabled={actionLoading || !currentActiveToken || currentActiveToken.status === 'in_service'}
          className="bg-[#1B9A72] hover:bg-[#147a59] disabled:opacity-50 text-white rounded-2xl py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-base sm:text-lg transition-colors cursor-pointer"
        >
          <Play className="w-8 h-8" />
          <span>START SERVICE</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleComplete}
          disabled={actionLoading || !currentActiveToken}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-base sm:text-lg transition-colors cursor-pointer"
        >
          <CheckCircle className="w-8 h-8" />
          <span>COMPLETE</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleSkip}
          disabled={actionLoading || !currentActiveToken}
          className="bg-[#E7A93B] hover:bg-[#c9902c] disabled:opacity-50 text-white rounded-2xl py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-base sm:text-lg transition-colors cursor-pointer"
        >
          <SkipForward className="w-8 h-8" />
          <span>SKIP / NO-SHOW</span>
        </motion.button>
      </div>

      {/* Live Queue Table */}
      <div className="bg-white border border-[#E5E9E7] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E9E7] bg-[#F8FBFA] flex justify-between items-center">
          <h2 className="text-base font-bold text-[#111827]">Live Queue • {currentServiceName}</h2>
          <span className="text-xs text-[#667085] font-semibold">{tokens.length} total active tickets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E5E9E7] text-xs uppercase text-[#667085] font-bold tracking-wider">
                <th className="p-4">Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Service</th>
                <th className="p-4">Status</th>
                <th className="p-4">Counter</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E7] text-sm">
              {tokens.map((item) => {
                const isWaiting = item.status === 'waiting';
                const isCalled = item.status === 'called';
                const isInService = item.status === 'in_service';

                return (
                  <tr key={item.id} className="hover:bg-[#F8FBFA] transition-colors">
                    <td className="p-4 font-bold text-[#168C82]">{item.tokenNumber}</td>
                    <td className="p-4 font-semibold text-[#111827]">{item.userName || item.studentName || 'Student'}</td>
                    <td className="p-4 text-[#667085] text-xs">{item.serviceName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isInService 
                          ? 'bg-[#168C82] text-white' 
                          : isCalled 
                          ? 'bg-[#1B9A72] text-white animate-pulse' 
                          : 'bg-amber-100 text-[#E7A93B]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#667085] text-xs font-medium">
                      {item.counterNumber ? `Counter ${item.counterNumber}` : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {isWaiting && (
                        <button 
                          onClick={() => callNextToken(selectedServiceId, user, counterNumber)}
                          className="px-3 py-1 bg-[#EEF9F7] text-[#168C82] hover:bg-[#168C82] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Call
                        </button>
                      )}
                      {isCalled && (
                        <button 
                          onClick={() => startService(item.id, user, counterNumber)}
                          className="px-3 py-1 bg-[#1B9A72] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {isInService && (
                        <button 
                          onClick={() => completeService(item.id, user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#667085] text-sm">
                    No active tokens in this service queue.
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

export default StaffDashboard;
