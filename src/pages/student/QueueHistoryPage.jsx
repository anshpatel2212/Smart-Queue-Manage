import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserHistory } from '../../services/historyService';

const QueueHistoryPage = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (user?.uid) {
          const data = await getUserHistory(user.uid);
          if (isMounted) setHistoryItems(data);
        }
      } catch (err) {
        console.warn('Error loading history:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [user?.uid]);

  const filteredHistory = historyItems.filter(item => {
    if (statusFilter === 'All') return true;
    return (item.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Queue History</h1>
        <p className="text-sm text-[#667085] mt-1">Review your verified past campus queue visits and service records.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5E9E7] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Calendar className="w-5 h-5 text-[#168C82]" />
          <span className="text-sm font-semibold text-[#111827]">Campus Audit Records</span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#667085]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[#E5E9E7] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#168C82]/50 text-[#172033]"
          >
            <option value="All">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#168C82] mb-3" />
          <p className="text-sm text-[#667085]">Retrieving historical queue records...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-[#E5E9E7] rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FBFA] border-b border-[#E5E9E7] text-xs uppercase text-[#667085] font-bold tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Token</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Desk</th>
                  <th className="p-4">Wait Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {filteredHistory.map((item, idx) => {
                  const dateStr = item.completedAt?.toDate 
                    ? item.completedAt.toDate().toLocaleDateString()
                    : item.dateString || 'Today';

                  const isCompleted = item.status === 'completed';
                  const isCancelled = item.status === 'cancelled';

                  return (
                    <motion.tr 
                      key={item.id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-[#F8FBFA] transition-colors text-sm"
                    >
                      <td className="p-4 text-[#667085]">{dateStr}</td>
                      <td className="p-4 font-bold text-[#168C82]">{item.tokenNumber}</td>
                      <td className="p-4 font-semibold text-[#111827]">{item.serviceName}</td>
                      <td className="p-4 text-[#667085]">{item.counterNumber ? `Counter ${item.counterNumber}` : '-'}</td>
                      <td className="p-4 text-[#667085]">{item.waitingTime ? `${item.waitingTime}m` : '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          isCompleted
                            ? 'bg-[#EEF9F7] text-[#1B9A72] border border-[#1B9A72]/20'
                            : isCancelled
                            ? 'bg-red-50 text-[#D95C5C] border border-red-200'
                            : 'bg-amber-50 text-[#E7A93B] border border-amber-200'
                        }`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredHistory.map((item, idx) => (
              <div key={item.id || idx} className="bg-white p-4 rounded-2xl border border-[#E5E9E7] shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-[#168C82]">{item.tokenNumber}</span>
                  <span className="text-xs text-[#667085]">{item.dateString || 'Recent'}</span>
                </div>
                <div className="text-sm font-bold text-[#111827]">{item.serviceName}</div>
                <div className="flex justify-between items-center text-xs text-[#667085] pt-1">
                  <span>Wait: {item.waitingTime ? `${item.waitingTime}m` : '-'}</span>
                  <span className="font-bold uppercase text-[11px] text-[#168C82]">{item.status}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E9E7] p-12 text-center">
              <Sparkles className="w-10 h-10 text-[#667085]/40 mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#111827]">No Queue History</h3>
              <p className="text-xs text-[#667085] mt-1">Past completed and resolved tokens will show up here.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default QueueHistoryPage;
