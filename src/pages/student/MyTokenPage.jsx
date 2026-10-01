import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, X, Loader2, Sparkles } from 'lucide-react';
import { useQueue } from '../../hooks/useQueue';

const MyTokenPage = () => {
  const { computedData, cancelQueue, loading, actionLoading } = useQueue();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleConfirmCancel = async () => {
    try {
      setCancelError('');
      await cancelQueue();
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel token');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#168C82] mb-3" />
        <p className="text-[#667085] text-sm">Syncing with live campus queue...</p>
      </div>
    );
  }

  if (!computedData) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-white rounded-3xl border border-[#E5E9E7] p-10 shadow-sm">
          <div className="w-16 h-16 bg-[#EEF9F7] text-[#168C82] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2">No Active Token</h2>
          <p className="text-sm text-[#667085] max-w-md mx-auto mb-8">
            You do not currently have a waiting ticket in any campus queue.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/student/services" className="px-6 py-3 bg-[#168C82] hover:bg-[#127A71] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
              Browse Services
            </Link>
            <Link to="/student" className="px-6 py-3 border border-[#E5E9E7] text-[#111827] rounded-xl font-semibold text-sm hover:bg-[#F8FBFA]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    tokenNumber,
    service,
    department,
    status,
    currentlyServing,
    peopleAhead,
    estimatedWait,
    predictionSource,
    counter,
    joinedAt,
    progressQueue = []
  } = computedData;

  const isYourTurn = status === 'called';
  const isInService = status === 'in_service';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Link to="/student" className="inline-flex items-center text-sm font-medium text-[#667085] hover:text-[#168C82] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <span className="text-xs font-semibold text-[#1B9A72] flex items-center gap-1.5 bg-[#EEF9F7] px-3 py-1 rounded-full border border-[#1B9A72]/20">
          <span className="w-2 h-2 rounded-full bg-[#1B9A72] animate-pulse"></span>
          <span>Live Firestore Listener</span>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E9E7] shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Token Display Left Side */}
        <div className="md:w-1/2 p-8 sm:p-10 bg-[#EEF9F7]/60 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E5E9E7] relative">
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">Service</p>
              <p className="font-bold text-[#111827] text-base leading-tight mt-0.5">{service}</p>
              <p className="text-xs text-[#667085]">{department}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#667085] mb-0.5">Joined at</p>
              <p className="font-semibold text-xs text-[#111827]">{joinedAt}</p>
            </div>
          </div>

          <div className="mt-20 mb-8 text-center w-full">
            <p className="text-xs font-bold text-[#168C82] uppercase tracking-widest mb-3">Your Digital Token</p>
            <div className="bg-white px-8 py-6 rounded-3xl shadow-sm border border-[#168C82]/20 mb-5 max-w-[260px] mx-auto">
              <span className="text-6xl font-black text-[#168C82] tracking-tight">{tokenNumber}</span>
            </div>
            <span className={`inline-block px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full ${
              isYourTurn
                ? 'bg-[#1B9A72] text-white animate-bounce'
                : isInService
                ? 'bg-[#168C82] text-white'
                : 'bg-amber-100 text-[#E7A93B]'
            }`}>
              {isYourTurn ? 'NOW CALLED • PROCEED TO DESK' : isInService ? 'IN SERVICE' : 'WAITING IN LINE'}
            </span>
          </div>
        </div>

        {/* Info Right Side */}
        <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
              <p className="text-xs text-[#667085] mb-1">Currently Serving</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#111827]">{currentlyServing}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B9A72] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B9A72]"></span>
                </span>
              </div>
            </div>
            
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
              <p className="text-xs text-[#667085] mb-1 flex items-center gap-1">
                <Users size={14} className="text-[#168C82]" /> People Ahead
              </p>
              <span className="text-2xl font-bold text-[#111827]">{peopleAhead}</span>
            </div>
            
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#667085] flex items-center gap-1">
                  <Clock size={14} className="text-[#168C82]" /> Est. Wait
                </p>
                <span className="text-[10px] font-bold text-[#168C82] bg-[#EEF9F7] px-1.5 py-0.5 rounded border border-[#168C82]/20">
                  {predictionSource === 'ml' ? 'AI/ML' : 'ETA'}
                </span>
              </div>
              <span className="text-2xl font-bold text-[#168C82]">
                {status === 'called' || status === 'in_service' ? 'Now' : `${estimatedWait} min`}
              </span>
            </div>
            
            <div className="bg-[#F8FBFA] p-4 rounded-xl border border-[#E5E9E7]">
              <p className="text-xs text-[#667085] mb-1">Assigned Desk</p>
              <span className="text-xl font-bold text-[#111827]">{counter}</span>
            </div>
          </div>

          {/* Queue Visualization */}
          <div className="mb-8">
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-3">Live Line Progression</p>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
              {progressQueue.slice(0, 5).map((t) => {
                const isServingNow = t === currentlyServing;
                const isUserToken = t === tokenNumber;

                return (
                  <div 
                    key={t}
                    className={`flex-1 py-2 text-center rounded-xl text-xs font-bold border transition-all ${
                      isServingNow 
                        ? 'bg-[#168C82] text-white border-[#168C82] shadow-sm' 
                        : isUserToken 
                        ? 'bg-[#EEF9F7] text-[#168C82] border-[#168C82]' 
                        : 'bg-[#F8FBFA] text-[#667085] border-[#E5E9E7]'
                    }`}
                  >
                    {t}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E9E7]">
            <button 
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="w-full py-3 border border-[#D95C5C] text-[#D95C5C] rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel Waiting Queue
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#E5E9E7]">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Cancel Your Queue Position?</h3>
            <p className="text-xs text-[#667085] leading-relaxed mb-6">
              Are you sure you want to cancel token <strong>{tokenNumber}</strong>? Your current rank in line will be forfeited.
            </p>
            {cancelError && (
              <p className="text-xs text-red-600 mb-4">{cancelError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#D95C5C] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoading && <Loader2 size={12} className="animate-spin" />}
                Yes, Cancel Ticket
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 border border-[#E5E9E7] text-xs font-semibold rounded-xl hover:bg-gray-50"
              >
                Keep My Place
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MyTokenPage;
