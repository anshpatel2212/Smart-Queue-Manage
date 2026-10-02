import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Users, Clock, Monitor, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getService } from '../../services/serviceService';
import { joinQueue, getUserActiveToken } from '../../services/tokenService';
import { getEstimatedWaitDisplay } from '../../utils/queueCalculations';

const JoinQueuePage = () => {
  const { serviceId } = useParams();
  const { user, ensureAnonymousUser } = useAuth();

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [joining, setJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [existingToken, setExistingToken] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoadingService(true);
      try {
        const srv = await getService(serviceId);
        if (isMounted) setService(srv);

        let targetUid = user?.uid;
        if (!targetUid && ensureAnonymousUser) {
          try {
            const anon = await ensureAnonymousUser();
            targetUid = anon?.uid;
          } catch (e) {
            console.warn('Anonymous user setup deferred:', e);
          }
        }

        if (targetUid) {
          const active = await getUserActiveToken(targetUid);
          if (isMounted && active) {
            setExistingToken(active);
            if (active.serviceId === serviceId) {
              setGeneratedToken(active);
            }
          }
        }
      } catch (err) {
        console.error('Service load error:', err);
        if (isMounted) setErrorMessage('Unable to load service details. Please try again.');
      } finally {
        if (isMounted) setLoadingService(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [serviceId, user?.uid, ensureAnonymousUser]);

  const handleJoin = async () => {
    setErrorMessage('');
    setJoining(true);

    try {
      let activeUser = user;
      if (!activeUser || !activeUser.uid) {
        const anon = await ensureAnonymousUser();
        activeUser = {
          uid: anon.uid,
          displayName: 'Guest Student',
          name: 'Guest Student',
          role: 'guest',
          isAnonymous: true
        };
      }

      const token = await joinQueue({ user: activeUser, serviceId });
      setGeneratedToken(token);
    } catch (err) {
      console.error('Join queue error:', err);
      setErrorMessage(err.message || 'Unable to join the queue. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loadingService) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#168C82] mb-3" />
        <p className="text-sm text-[#667085]">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white rounded-2xl border border-[#E5E9E7]">
        <h2 className="text-xl font-bold text-[#111827] mb-2">Service Not Found</h2>
        <p className="text-sm text-[#667085] mb-6">The campus service you requested does not exist or has been retired.</p>
        <Link to="/student/services" className="px-5 py-2.5 bg-[#168C82] text-white rounded-xl text-sm font-semibold">
          Back to Services
        </Link>
      </div>
    );
  }

  const isServiceOpen = (service.status || '').toLowerCase() === 'open';

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <Link to="/student/services" className="inline-flex items-center text-sm font-medium text-[#667085] hover:text-[#168C82] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E5E9E7] shadow-sm overflow-hidden"
      >
        {!generatedToken ? (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#EEF9F7] text-[#168C82] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-[#111827] mb-1">Join Queue</h1>
              <p className="text-[#667085] text-sm">You are about to generate a digital token for</p>
              <p className="text-xl font-bold text-[#168C82] mt-1">{service.name}</p>
              <p className="text-xs text-[#667085] mt-0.5">{service.departmentName || service.departmentId}</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#D95C5C] text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {existingToken && existingToken.serviceId !== serviceId && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-[#172033] text-xs sm:text-sm rounded-xl">
                <p className="font-semibold text-[#E7A93B] mb-1">Active Ticket Notice</p>
                <p className="text-[#667085]">
                  You already hold active token <strong>{existingToken.tokenNumber}</strong> for {existingToken.serviceName}. You cannot join multiple lines at once.
                </p>
                <Link to="/student/my-token" className="text-[#168C82] font-semibold underline mt-2 inline-block">
                  View your current token &rarr;
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F8FBFA] p-4 rounded-xl text-center border border-[#E5E9E7]">
                <Users className="w-5 h-5 text-[#168C82] mx-auto mb-2" />
                <p className="text-xs text-[#667085] mb-1">Active Counters</p>
                <p className="text-lg font-bold text-[#111827]">{service.activeCounters || 1}</p>
              </div>
              <div className="bg-[#F8FBFA] p-4 rounded-xl text-center border border-[#E5E9E7]">
                <Clock className="w-5 h-5 text-[#168C82] mx-auto mb-2" />
                <p className="text-xs text-[#667085] mb-1">Average Service</p>
                <p className="text-lg font-bold text-[#111827]">~{service.averageServiceTime || 5} min</p>
              </div>
              <div className="bg-[#F8FBFA] p-4 rounded-xl text-center col-span-2 md:col-span-1 border border-[#E5E9E7]">
                <Monitor className="w-5 h-5 text-[#168C82] mx-auto mb-2" />
                <p className="text-xs text-[#667085] mb-1">Desk Status</p>
                <p className={`text-lg font-bold ${isServiceOpen ? 'text-[#1B9A72]' : 'text-[#D95C5C]'}`}>
                  {isServiceOpen ? 'Open & Ready' : 'Closed'}
                </p>
              </div>
            </div>

            <button 
              onClick={handleJoin}
              disabled={joining || !isServiceOpen || !!existingToken}
              className={`w-full py-3.5 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${
                !isServiceOpen || !!existingToken
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#168C82] hover:bg-[#127A71] text-white'
              }`}
            >
              {joining && <Loader2 size={18} className="animate-spin" />}
              <span>
                {!isServiceOpen 
                  ? 'Counter is Currently Closed' 
                  : existingToken 
                  ? 'Active Queue Token Already Exists' 
                  : 'Confirm & Generate Digital Token'}
              </span>
            </button>
          </div>
        ) : (
          /* Success Confirmation State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-10 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-[#EEF9F7] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-[#1B9A72]" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-[#111827] mb-1">You're in the queue!</h2>
            <p className="text-sm text-[#667085] mb-6">Your digital token has been recorded in the live campus system.</p>

            <div className="inline-block bg-[#EEF9F7] rounded-2xl p-6 border-2 border-[#168C82]/20 mb-8 min-w-[220px]">
              <span className="text-xs font-bold text-[#168C82] uppercase tracking-wider block mb-2">Your Verified Token</span>
              <span className="text-5xl sm:text-6xl font-black text-[#168C82] tracking-tight">{generatedToken.tokenNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto mb-8 text-left">
              <div className="border border-[#E5E9E7] rounded-xl p-3 bg-[#F8FBFA]">
                <p className="text-xs text-[#667085] mb-0.5">Position in Queue</p>
                <p className="font-bold text-[#111827] text-base">#{generatedToken.position || 1}</p>
              </div>
              <div className="border border-[#E5E9E7] rounded-xl p-3 bg-[#F8FBFA]">
                <p className="text-xs text-[#667085] mb-0.5">People Ahead</p>
                <p className="font-bold text-[#111827] text-base">{generatedToken.peopleAhead ?? 0}</p>
              </div>
              <div className="border border-[#E5E9E7] rounded-xl p-3 bg-[#F8FBFA]">
                <p className="text-xs text-[#667085] mb-0.5">Estimated Wait</p>
                <p className="font-bold text-[#168C82] text-base">
                  {getEstimatedWaitDisplay(generatedToken.status || 'waiting', generatedToken.peopleAhead ?? 0, generatedToken.estimatedWait ?? 0)}
                </p>
              </div>
              <div className="border border-[#E5E9E7] rounded-xl p-3 bg-[#F8FBFA]">
                <p className="text-xs text-[#667085] mb-0.5">Service Counter</p>
                <p className="font-bold text-[#111827] text-base">{generatedToken.counterNumber ? `Counter ${generatedToken.counterNumber}` : 'Assigned at call'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/student/my-token" className="px-6 py-3 bg-[#168C82] text-white rounded-xl font-semibold text-sm hover:bg-[#127A71] transition-colors shadow-sm">
                View My Token Live
              </Link>
              <Link to="/student" className="px-6 py-3 border border-[#E5E9E7] text-[#111827] rounded-xl font-semibold text-sm hover:bg-[#F8FBFA] transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JoinQueuePage;
