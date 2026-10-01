import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, SkipForward, PauseCircle, Clock, User, Hash, Phone, Loader2, Coffee } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import { 
  subscribeServiceTokens, 
  callNextToken, 
  startService, 
  completeService, 
  skipToken 
} from '../../services/tokenService';
import { getStaffHistory } from '../../services/historyService';

const CounterPage = () => {
  const { user } = useAuth();
  const { services } = useServices();

  const counterNumber = user?.counter || 1;
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [todayStats, setTodayStats] = useState({ served: 0, avgTime: '5 min', skipped: 0 });

  // Default service selection to staff's assigned department
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      const match = user?.departmentId 
        ? services.find(s => s.departmentId === user.departmentId)
        : services[0];
      setSelectedServiceId(match ? match.id : services[0].id);
    }
  }, [services, selectedServiceId, user?.departmentId]);

  // Subscribe to real tokens
  useEffect(() => {
    if (!selectedServiceId) return;
    const unsub = subscribeServiceTokens(selectedServiceId, (tokenList) => {
      setTokens(tokenList);
    });
    return () => unsub();
  }, [selectedServiceId]);

  // Load staff history stats for today
  useEffect(() => {
    if (!user?.uid) return;
    const loadStats = async () => {
      try {
        const history = await getStaffHistory(user.uid, 50);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayItems = history.filter(h => h.dateString === todayStr || !h.dateString);
        const servedItems = todayItems.filter(h => h.status === 'completed');
        const skippedItems = todayItems.filter(h => h.status === 'skipped');
        
        const totalDuration = servedItems.reduce((acc, curr) => acc + (curr.serviceTime || 5), 0);
        const avg = servedItems.length > 0 ? Math.round(totalDuration / servedItems.length) : 5;

        setTodayStats({
          served: servedItems.length,
          avgTime: `${avg} min`,
          skipped: skippedItems.length,
        });
      } catch (err) {
        console.warn('Error loading counter stats:', err);
      }
    };
    loadStats();
  }, [user?.uid, tokens]);

  // Token currently assigned to this counter or staff
  const currentToken = tokens.find(t => 
    (t.status === 'in_service' || t.status === 'called') && 
    (t.counterNumber === counterNumber || t.calledByStaffId === user?.uid)
  ) || tokens.find(t => t.status === 'in_service') || null;

  // Next waiting tokens
  const waitingTokens = tokens.filter(t => t.status === 'waiting');

  // Elapsed service timer
  useEffect(() => {
    if (!currentToken || currentToken.status !== 'in_service' || isPaused || isOnBreak) {
      if (!currentToken) setDuration(0);
      return;
    }

    const startTs = currentToken.serviceStartedAt?.toDate 
      ? currentToken.serviceStartedAt.toDate().getTime()
      : Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentToken, isPaused, isOnBreak]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showMsg = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleCallNext = async () => {
    if (!selectedServiceId) return;
    setActionLoading(true);
    try {
      const called = await callNextToken(selectedServiceId, user, counterNumber);
      if (called) {
        showMsg(`Token ${called.tokenNumber} called to Counter ${counterNumber}!`);
      } else {
        showMsg('No waiting tokens in this queue.');
      }
    } catch (err) {
      showMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async () => {
    if (!currentToken) return;
    setActionLoading(true);
    try {
      await startService(currentToken.id, user, counterNumber);
      showMsg(`Service started for ${currentToken.tokenNumber}`);
    } catch (err) {
      showMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentToken) return;
    setActionLoading(true);
    try {
      await completeService(currentToken.id, user);
      showMsg(`Token ${currentToken.tokenNumber} marked completed.`);
    } catch (err) {
      showMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentToken) return;
    setActionLoading(true);
    try {
      await skipToken(currentToken.id, user, 'Student not present at counter');
      showMsg(`Token ${currentToken.tokenNumber} skipped.`);
    } catch (err) {
      showMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#172033]">Counter {counterNumber}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${isOnBreak ? 'bg-[#E7A93B]' : 'bg-[#1B9A72] animate-pulse'}`}></span>
            <span className="text-[#667085] font-medium">{isOnBreak ? 'On Break' : 'Active & Serving'}</span>
            <span className="text-xs text-[#667085]">• Service: {services.find(s => s.id === selectedServiceId)?.name || 'General Queue'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOnBreak(!isOnBreak)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors border flex items-center gap-2 ${
              isOnBreak 
                ? 'bg-[#1B9A72] text-white border-transparent' 
                : 'bg-white text-[#172033] border-[#E5E9E7] hover:bg-gray-50'
            }`}
          >
            <Coffee className="w-4 h-4" />
            {isOnBreak ? 'Resume Service' : 'Go on Break'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-semibold">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Serving Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#168C82] p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider opacity-90 mb-1">
                  {currentToken?.status === 'in_service' ? 'Currently Serving' : currentToken?.status === 'called' ? 'Token Called' : 'Counter Standby'}
                </p>
                <h2 className="text-5xl font-bold">
                  {currentToken?.tokenNumber || 'No Active Ticket'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Duration</p>
                <div className="text-4xl font-mono font-bold tracking-tight">
                  {currentToken?.status === 'in_service' ? formatTime(duration) : '00:00'}
                </div>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#667085] mb-0.5">Student Name</p>
                    <p className="font-semibold text-lg text-[#172033]">
                      {currentToken?.userName || '—'}
                    </p>
                    {currentToken?.studentId && (
                      <p className="text-xs text-[#667085]">ID: {currentToken.studentId}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#667085] mb-0.5">Service Requested</p>
                    <p className="font-semibold text-lg text-[#172033]">
                      {currentToken?.serviceName || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#667085] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#667085] mb-0.5">Queue Status</p>
                    <p className="font-semibold text-lg text-[#172033] capitalize">
                      {currentToken ? (currentToken.status === 'in_service' ? 'In Service' : 'Called to Counter') : 'Available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="p-6 bg-[#F8FBFA] border-t border-[#E5E9E7] flex flex-wrap gap-4">
              {currentToken?.status === 'called' && (
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  disabled={actionLoading}
                  onClick={handleStartService}
                  className="flex-1 bg-[#168C82] hover:bg-[#127a71] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-colors shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                  START SERVICE
                </motion.button>
              )}

              {currentToken?.status === 'in_service' && (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    disabled={actionLoading}
                    onClick={handleComplete}
                    className="flex-1 bg-[#1B9A72] hover:bg-[#147a59] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-colors shadow-sm"
                  >
                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                    COMPLETE
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex-1 bg-white border border-[#E5E9E7] hover:bg-gray-50 text-[#172033] py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors"
                  >
                    <PauseCircle className="w-5 h-5" /> 
                    {isPaused ? 'RESUME TICKET' : 'PUT ON HOLD'}
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    disabled={actionLoading}
                    onClick={handleSkip}
                    className="flex-none bg-[#E7A93B] hover:bg-[#c9902c] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors"
                  >
                    <SkipForward className="w-5 h-5" /> SKIP
                  </motion.button>
                </>
              )}

              {!currentToken && (
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={actionLoading || waitingTokens.length === 0}
                  onClick={handleCallNext}
                  className="flex-1 bg-[#168C82] hover:bg-[#127a71] disabled:opacity-50 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-colors shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Phone className="w-6 h-6" />}
                  CALL NEXT TICKET ({waitingTokens.length} waiting)
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#172033] text-lg mb-4">Next in Queue</h3>
            <div className="space-y-3">
              {waitingTokens.slice(0, 3).map((item, idx) => (
                <div key={item.id} className="p-3 bg-[#F8FBFA] rounded-lg border border-[#E5E9E7] flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#172033] text-md">{item.tokenNumber}</h4>
                    <p className="text-xs text-[#667085]">{item.userName || 'Student'}</p>
                  </div>
                  {idx === 0 && !currentToken && (
                    <button 
                      onClick={handleCallNext}
                      className="text-[#168C82] bg-[#EEF9F7] p-2 rounded-lg hover:bg-[#168C82] hover:text-white transition-colors"
                      title="Call this ticket"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {waitingTokens.length === 0 && (
                <p className="text-sm text-[#667085] italic py-2">No students waiting in queue.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-[#172033] text-lg mb-4">Counter Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E5E9E7]">
                <span className="text-[#667085]">Tokens Served</span>
                <span className="font-bold text-[#172033]">{todayStats.served}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#E5E9E7]">
                <span className="text-[#667085]">Avg Service Time</span>
                <span className="font-bold text-[#172033]">{todayStats.avgTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085]">Tokens Skipped</span>
                <span className="font-bold text-[#172033]">{todayStats.skipped}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CounterPage;
