import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Play,
  CheckCircle,
  SkipForward,
  Users,
  Clock,
  Activity,
  Layers,
  Loader2,
  Sparkles,
  AlertTriangle,
  CalendarCheck,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import {
  subscribeServiceAllTokens,
  subscribeAllTokens,
  callNextToken,
  startService,
  completeService,
  skipToken,
} from '../../services/tokenService';
import LoadingScreen from '../../components/shared/LoadingScreen';

const StaffDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { services, loading: servicesLoading } = useServices();

  // Section 5 & 17: Default selection is 'all' (All Campus Services)
  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState({ text: '', isError: false });
  const [serviceTimerSeconds, setServiceTimerSeconds] = useState(0);

  // Requirement 14: Verify role ('staff' or 'admin' counter supervisor) before loading
  const normalizedRole = (role || user?.role || '').toString().toLowerCase().trim();
  const isAuthorized = normalizedRole === 'staff' || normalizedRole === 'admin';

  useEffect(() => {
    if (!authLoading && (!user || !isAuthorized)) {
      navigate('/login', { replace: true });
    }
  }, [user, isAuthorized, authLoading, navigate]);

  const counterNumber = user?.counter || 1;

  // Requirement 4 & 5: Real-time Firestore onSnapshot for all services or specific service
  useEffect(() => {
    setTokensLoading(true);
    let unsub;
    if (selectedServiceId === 'all') {
      unsub = subscribeAllTokens(tokenList => {
        setTokens(tokenList);
        setTokensLoading(false);
      }, 300);
    } else {
      unsub = subscribeServiceAllTokens(selectedServiceId, tokenList => {
        setTokens(tokenList);
        setTokensLoading(false);
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [selectedServiceId]);

  // Section 3: Retrieve waiting tokens across all services (or selected service), sorted by createdAt ascending (oldest first)
  const waitingTokens = useMemo(() => {
    const list = tokens.filter(t => {
      if (t.status !== 'waiting') return false;
      if (selectedServiceId && selectedServiceId !== 'all') {
        return t.serviceId === selectedServiceId;
      }
      return true;
    });

    list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
      const timeB = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;
      if (timeA !== timeB) return timeA - timeB;
      return (a.tokenSequence || 0) - (b.tokenSequence || 0);
    });

    return list;
  }, [tokens, selectedServiceId]);

  const calledTokens = useMemo(() => {
    return tokens.filter(t => {
      if (t.status !== 'called') return false;
      if (selectedServiceId && selectedServiceId !== 'all') {
        return t.serviceId === selectedServiceId;
      }
      return true;
    });
  }, [tokens, selectedServiceId]);

  const inServiceTokens = useMemo(() => {
    return tokens.filter(t => {
      if (t.status !== 'in_service') return false;
      if (selectedServiceId && selectedServiceId !== 'all') {
        return t.serviceId === selectedServiceId;
      }
      return true;
    });
  }, [tokens, selectedServiceId]);

  const completedTokens = useMemo(() => {
    return tokens.filter(t => {
      if (t.status !== 'completed') return false;
      if (selectedServiceId && selectedServiceId !== 'all') {
        return t.serviceId === selectedServiceId;
      }
      return true;
    });
  }, [tokens, selectedServiceId]);

  // Requirement 2: Current active token at this counter
  const currentActiveToken = useMemo(
    () =>
      inServiceTokens.find(t => t.counterNumber === counterNumber || t.calledByStaffId === user?.uid) ||
      calledTokens.find(t => t.counterNumber === counterNumber || t.calledByStaffId === user?.uid) ||
      inServiceTokens.find(t => t.counterNumber === counterNumber) ||
      calledTokens.find(t => t.counterNumber === counterNumber) ||
      inServiceTokens[0] ||
      calledTokens[0] ||
      null,
    [inServiceTokens, calledTokens, counterNumber, user?.uid]
  );

  const currentServiceName = useMemo(() => {
    if (selectedServiceId === 'all') return 'All Campus Services';
    const match = services.find(s => s.id === selectedServiceId);
    return match?.name || 'Campus Queue';
  }, [services, selectedServiceId]);

  // Live service timer
  useEffect(() => {
    if (!currentActiveToken || currentActiveToken.status !== 'in_service') {
      setServiceTimerSeconds(0);
      return;
    }
    const startTimestamp = currentActiveToken.serviceStartedAt?.toDate
      ? currentActiveToken.serviceStartedAt.toDate().getTime()
      : currentActiveToken.serviceStartedAt?.seconds
      ? currentActiveToken.serviceStartedAt.seconds * 1000
      : Date.now();
    const tick = () => setServiceTimerSeconds(Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentActiveToken]);

  const formatTimer = totalSec => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showFeedback = (text, isError = false) => {
    setActionMsg({ text, isError });
    setTimeout(() => setActionMsg({ text: '', isError: false }), 4500);
  };

  // Section 6 & 7: CALL NEXT respects selected service (or specific token for Quick Call)
  const handleCallNext = async (specificTokenId = null, serviceIdForToken = null) => {
    setActionLoading(true);
    try {
      const targetServiceId = serviceIdForToken || selectedServiceId;
      const called = await callNextToken(targetServiceId, user, counterNumber, specificTokenId);
      if (called) {
        showFeedback(`Called token ${called.tokenNumber} to Counter ${counterNumber}`);
      } else {
        showFeedback('No waiting students in this queue.', true);
      }
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // Requirement 4: START SERVICE
  const handleStartService = async () => {
    const target = currentActiveToken || calledTokens[0];
    if (!target) { showFeedback('No called token to start.', true); return; }
    setActionLoading(true);
    try {
      await startService(target.id || target.tokenId, user, counterNumber);
      showFeedback('Service started for token ' + target.tokenNumber);
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // Requirement 5: COMPLETE
  const handleComplete = async () => {
    const target = inServiceTokens[0] || currentActiveToken;
    if (!target) { showFeedback('No token in service to complete.', true); return; }
    setActionLoading(true);
    try {
      await completeService(target.id || target.tokenId, user);
      showFeedback('Completed token ' + target.tokenNumber);
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // Requirement 6: SKIP
  const handleSkip = async () => {
    const target = currentActiveToken || waitingTokens[0];
    if (!target) { showFeedback('No active token to skip.', true); return; }
    setActionLoading(true);
    try {
      await skipToken(target.id || target.tokenId, user, 'Student not present at counter');
      showFeedback('Token ' + target.tokenNumber + ' marked as skipped (no-show)');
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !isAuthorized) {
    return <LoadingScreen />;
  }

  const stats = [
    { label: 'Waiting',    value: waitingTokens.length,   sub: 'Students in line',   icon: Users,         color: 'text-[#E7A93B]', bg: 'bg-amber-50'   },
    { label: 'Called',     value: calledTokens.length,    sub: 'Proceeding to desk', icon: Phone,         color: 'text-blue-600',  bg: 'bg-blue-50'    },
    { label: 'In Service', value: inServiceTokens.length, sub: 'Currently serving',  icon: Activity,      color: 'text-[#168C82]', bg: 'bg-[#EEF9F7]' },
    { label: 'Completed',  value: completedTokens.length, sub: 'Served today',       icon: CalendarCheck, color: 'text-[#1B9A72]', bg: 'bg-emerald-50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              Staff Queue Operations
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#EEF9F7] text-[#168C82] rounded-full border border-[#168C82]/20">
              Counter {counterNumber}
            </span>
          </div>
          <p className="text-[#667085] mt-1 text-sm">
            Officer: <strong>{user?.name || user?.displayName || 'Staff Member'}</strong>
            {' '}•{' '}Dept: <strong>{user?.departmentId || user?.department || 'General Services'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E5E9E7] shadow-sm text-xs font-medium w-full sm:w-auto">
            <Layers size={16} className="text-[#168C82] shrink-0" />
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              disabled={servicesLoading}
              className="bg-transparent font-semibold text-[#111827] focus:outline-none cursor-pointer w-full"
            >
              <option value="all">All Campus Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback toast */}
      {actionMsg.text && (
        <div className={`p-3 text-xs sm:text-sm font-semibold rounded-xl border flex items-center gap-2 ${
          actionMsg.isError
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-[#EEF9F7] text-[#168C82] border-[#168C82]/20'
        }`}>
          {actionMsg.isError
            ? <AlertTriangle size={16} className="shrink-0" />
            : <Sparkles size={16} className="shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Requirement 1: Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-[#E5E9E7] p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
              <p className="text-[11px] text-[#667085] mt-0.5">{stat.sub}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Requirements 2-6: Current token panel + action buttons */}
      <div className="bg-white rounded-2xl border border-[#E5E9E7] shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#E5E9E7]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-[#EEF9F7] border-2 border-[#168C82]/30 rounded-2xl flex items-center justify-center text-[#168C82] shadow-sm">
              <span className="text-3xl font-black">{currentActiveToken?.tokenNumber || '—'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">Current Token</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  currentActiveToken?.status === 'in_service'
                    ? 'bg-[#EEF9F7] text-[#168C82]'
                    : currentActiveToken?.status === 'called'
                    ? 'bg-blue-100 text-blue-700 animate-pulse'
                    : 'bg-gray-100 text-[#667085]'
                }`}>
                  {currentActiveToken ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {currentActiveToken.status === 'in_service' ? 'In Service' : 'Called to Desk'}
                    </>
                  ) : 'Standby'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#111827]">
                {currentActiveToken
                  ? (currentActiveToken.userName || currentActiveToken.studentName || 'Student')
                  : 'No Active Appointment'}
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                {currentActiveToken ? (
                  <>Student ID: <strong>{currentActiveToken.studentId || 'N/A'}</strong>{' '}•{' '}Counter: <strong>{currentActiveToken.counterNumber || counterNumber}</strong></>
                ) : (
                  'Counter is ready — click CALL NEXT to serve the next student.'
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto pt-2 md:pt-0">
            <p className="text-xs text-[#667085] font-semibold mb-0.5">Service Duration</p>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#168C82] flex items-center gap-1.5">
              <Clock size={20} />
              <span>{formatTimer(serviceTimerSeconds)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {/* Requirement 3: CALL NEXT */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCallNext()}
            disabled={actionLoading || waitingTokens.length === 0}
            className="bg-[#168C82] hover:bg-[#127A71] disabled:opacity-50 text-white rounded-2xl py-5 sm:py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            {actionLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Phone className="w-7 h-7" />}
            <span>CALL NEXT</span>
            <span className="text-[10px] opacity-80 font-normal">
              {waitingTokens.length > 0 ? `${waitingTokens.length} waiting` : 'Queue empty'}
            </span>
          </motion.button>

          {/* Requirement 4: START SERVICE */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartService}
            disabled={actionLoading || !currentActiveToken || currentActiveToken.status === 'in_service'}
            className="bg-[#1B9A72] hover:bg-[#147a59] disabled:opacity-50 text-white rounded-2xl py-5 sm:py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <Play className="w-7 h-7" />
            <span>START SERVICE</span>
            <span className="text-[10px] opacity-80 font-normal">Begin appointment</span>
          </motion.button>

          {/* Requirement 5: COMPLETE */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            disabled={actionLoading || !currentActiveToken || currentActiveToken.status !== 'in_service'}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl py-5 sm:py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <CheckCircle className="w-7 h-7" />
            <span>COMPLETE</span>
            <span className="text-[10px] opacity-80 font-normal">Finish &amp; mark done</span>
          </motion.button>

          {/* Requirement 6: SKIP */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSkip}
            disabled={actionLoading || !currentActiveToken}
            className="bg-[#E7A93B] hover:bg-[#c9902c] disabled:opacity-50 text-white rounded-2xl py-5 sm:py-6 flex flex-col items-center justify-center gap-2 shadow-sm font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <SkipForward className="w-7 h-7" />
            <span>SKIP / NO-SHOW</span>
            <span className="text-[10px] opacity-80 font-normal">Student absent</span>
          </motion.button>
        </div>
      </div>

      {/* Requirement 7: Real-time waiting queue table */}
      <div className="bg-white border border-[#E5E9E7] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E9E7] bg-[#F8FBFA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#111827]">Waiting Queue • {currentServiceName}</h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#168C82] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#168C82]" />
            </span>
          </div>
          <span className="text-xs text-[#667085] font-semibold bg-white px-3 py-1 rounded-full border border-[#E5E9E7]">
            {waitingTokens.length} student{waitingTokens.length !== 1 ? 's' : ''} in line
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-white border-b border-[#E5E9E7] text-xs uppercase text-[#667085] font-bold tracking-wider">
                <th className="p-4">Position</th>
                <th className="p-4">Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Service</th>
                <th className="p-4">Est. Wait</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E7] text-sm">
              {waitingTokens.map((item, index) => (
                <tr key={item.id || item.tokenId} className="hover:bg-[#F8FBFA] transition-colors">
                  <td className="p-4 font-bold text-[#111827]">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold">#{index + 1}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#168C82]">
                    <span className="bg-[#EEF9F7] px-2.5 py-1 rounded-lg border border-[#168C82]/20">{item.tokenNumber}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-[#111827]">{item.userName || item.studentName || 'Student'}</p>
                    {item.studentId && <p className="text-xs text-[#667085] font-mono">{item.studentId}</p>}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#111827]">{item.serviceName || item.service || 'Campus Service'}</p>
                    {item.departmentName && <p className="text-xs text-[#667085]">{item.departmentName}</p>}
                  </td>
                  <td className="p-4 text-[#667085]">
                    {index === 0 ? (
                      <span className="font-semibold text-[#168C82]">~0 min</span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium">
                        ~{item.estimatedWait !== undefined ? item.estimatedWait : Math.max(1, index * 5)} min
                        {item.predictionSource === 'ml' && (
                          <span className="text-[9px] font-bold text-[#168C82] bg-[#EEF9F7] px-1 py-0.5 rounded border border-[#168C82]/20">ML</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-[#E7A93B] border border-amber-200/50">
                      WAITING
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleCallNext(item.id || item.tokenId, item.serviceId)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 bg-[#EEF9F7] text-[#168C82] hover:bg-[#168C82] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Quick Call this Token"
                    >
                      <Phone size={12} /> Call
                    </button>
                  </td>
                </tr>
              ))}
              {waitingTokens.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-[#667085] text-sm">
                    {tokensLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#168C82]" />
                        <span>Syncing live queue from Firestore...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <CheckCircle className="w-8 h-8 text-[#1B9A72] mb-1 opacity-70" />
                        <span className="font-semibold text-[#111827]">Queue is caught up!</span>
                        <span className="text-xs">
                          {selectedServiceId === 'all'
                            ? 'No students are currently waiting in any campus service queue.'
                            : 'No students are currently waiting in this service queue.'}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Called & In-Service overview panels */}
      {(calledTokens.length > 0 || inServiceTokens.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {calledTokens.length > 0 && (
            <div className="bg-white border border-[#E5E9E7] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5E9E7] bg-blue-50 flex items-center gap-2">
                <Hash size={15} className="text-blue-600" />
                <h3 className="text-sm font-bold text-blue-700">Called to Desk ({calledTokens.length})</h3>
              </div>
              <ul className="divide-y divide-[#E5E9E7]">
                {calledTokens.map(t => (
                  <li key={t.id} className="px-4 py-3 flex items-center justify-between text-sm">
                    <span className="font-mono font-bold text-blue-600">{t.tokenNumber}</span>
                    <span className="text-[#111827] font-medium">{t.userName || 'Student'}</span>
                    <span className="text-xs text-[#667085]">Counter {t.counterNumber || counterNumber}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {inServiceTokens.length > 0 && (
            <div className="bg-white border border-[#E5E9E7] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5E9E7] bg-[#EEF9F7] flex items-center gap-2">
                <Activity size={15} className="text-[#168C82]" />
                <h3 className="text-sm font-bold text-[#168C82]">In Service ({inServiceTokens.length})</h3>
              </div>
              <ul className="divide-y divide-[#E5E9E7]">
                {inServiceTokens.map(t => (
                  <li key={t.id} className="px-4 py-3 flex items-center justify-between text-sm">
                    <span className="font-mono font-bold text-[#168C82]">{t.tokenNumber}</span>
                    <span className="text-[#111827] font-medium">{t.userName || 'Student'}</span>
                    <span className="text-xs text-[#667085]">Counter {t.counterNumber || counterNumber}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StaffDashboard;
