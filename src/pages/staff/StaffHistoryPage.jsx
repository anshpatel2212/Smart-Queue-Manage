import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffHistory } from '../../services/historyService';

const StaffHistoryPage = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (user?.uid) {
          const data = await getStaffHistory(user.uid, 50);
          setHistoryItems(data);
        }
      } catch (err) {
        console.warn('Error loading staff history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.uid]);

  // Filter items by date
  const filteredItems = historyItems.filter((item) => {
    if (dateFilter === 'All') return true;
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'Today') {
      return item.dateString === today;
    }
    return true;
  });

  const totalServed = historyItems.filter(h => h.status === 'completed').length;
  const totalSkipped = historyItems.filter(h => h.status === 'skipped').length;
  const completionRate = (totalServed + totalSkipped) > 0 
    ? Math.round((totalServed / (totalServed + totalSkipped)) * 100)
    : 100;

  const totalDuration = historyItems
    .filter(h => h.status === 'completed')
    .reduce((acc, curr) => acc + (curr.serviceTime || 5), 0);
  const avgDuration = totalServed > 0 ? Math.round(totalDuration / totalServed) : 5;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Service History</h1>
          <p className="text-[#667085] mt-1">Review your past completed services and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-[#E5E9E7] rounded-lg text-sm text-[#172033] focus:outline-none focus:border-[#168C82] cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm p-6 flex items-start gap-4">
          <div className="p-3 bg-[#EEF9F7] rounded-lg">
            <CheckCircle className="w-6 h-6 text-[#168C82]" />
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1">Total Served</p>
            <h3 className="text-3xl font-bold text-[#172033]">{totalServed}</h3>
            <p className="text-xs text-[#1B9A72] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Recorded in database
            </p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm p-6 flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1">Avg Service Duration</p>
            <h3 className="text-3xl font-bold text-[#172033]">{avgDuration} min</h3>
            <p className="text-xs text-[#1B9A72] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Average service speed
            </p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm p-6 flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-[#E7A93B]" />
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1">Completion Rate</p>
            <h3 className="text-3xl font-bold text-[#172033]">{completionRate}%</h3>
            <p className="text-xs text-[#667085] mt-1">{totalSkipped} tokens skipped</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#667085] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#168C82] mb-2" />
            <p>Loading service history...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F8FBFA] text-sm text-[#667085] border-b border-[#E5E9E7]">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Token</th>
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Wait Time</th>
                  <th className="p-4 font-medium">Service Duration</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 text-[#667085]">{item.dateString || 'Today'}</td>
                    <td className="p-4 font-bold text-[#172033]">{item.tokenNumber}</td>
                    <td className="p-4 text-[#172033]">
                      <div>
                        <p className="font-medium">{item.userName || 'Student'}</p>
                        {item.studentId && <p className="text-xs text-[#667085]">{item.studentId}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-[#667085]">{item.serviceName}</td>
                    <td className="p-4 text-[#667085]">{item.waitingTime ? `${item.waitingTime} min` : '—'}</td>
                    <td className="p-4 text-[#667085]">{item.serviceTime ? `${item.serviceTime} min` : '5 min'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${item.status === 'completed' ? 'bg-[#EEF9F7] text-[#1B9A72]' : 
                          item.status === 'skipped' ? 'bg-amber-50 text-[#E7A93B]' : 
                          'bg-red-50 text-[#D95C5C]'}`}>
                        {item.status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[#667085]">
                      No service records found in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StaffHistoryPage;
