import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Clock, CheckCircle, Ticket } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { subscribeAllTokens } from '../../services/tokenService';
import { subscribeCampusHistory, calculateAdminMetrics } from '../../services/adminService';
import { subscribeServices, subscribeDepartments } from '../../services/serviceService';
import { analyticsData } from '@/data/mockData';

const QueueAnalytics = () => {
  const [tokens, setTokens] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const unsubTokens = subscribeAllTokens((allTokens) => setTokens(allTokens));
    const unsubHistory = subscribeCampusHistory((history) => setHistoryItems(history));
    const unsubServices = subscribeServices((srv) => setServices(srv));
    const unsubDepts = subscribeDepartments((depts) => setDepartments(depts));

    return () => {
      unsubTokens();
      unsubHistory();
      unsubServices();
      unsubDepts();
    };
  }, []);

  const metrics = calculateAdminMetrics(tokens, historyItems, services, departments);

  // Compute daily volume from history + today's tokens
  const daysMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  tokens.forEach(t => {
    if (t.createdAt) {
      const d = t.createdAt.toDate ? t.createdAt.toDate() : (t.createdAt.seconds ? new Date(t.createdAt.seconds * 1000) : null);
      if (d) {
        const name = dayNames[d.getDay()];
        if (daysMap[name] !== undefined) daysMap[name]++;
      }
    }
  });

  const dailyVolumeData = Object.entries(daysMap).map(([day, count]) => {
    const fallback = analyticsData.dailyVolume.find(d => d.day === day)?.tokens || 0;
    return {
      day,
      tokens: count > 0 ? count : fallback
    };
  });

  const handleExport = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTokens: metrics.totalTokens,
        waiting: metrics.waitingCount,
        called: metrics.calledCount,
        inService: metrics.inServiceCount,
        completed: metrics.completedCount,
        cancelled: metrics.cancelledCount,
        avgWaitTimeMinutes: metrics.avgWaitTime,
        avgServiceTimeMinutes: metrics.avgServiceTime,
        activeServices: metrics.activeServicesCount,
        activeCounters: metrics.activeCountersCount,
      },
      activeTokens: metrics.activeTokens,
      historyRecords: historyItems
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-queue-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Queue Analytics</h1>
          <p className="text-[#667085] mt-1">Deep dive into campus queue wait times, volume, and trends in real time</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-[#667085] font-medium">Total Tokens</p>
            <Ticket className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-3xl font-bold text-[#172033]">{metrics.totalTokens.toLocaleString()}</h3>
          <p className="text-xs text-[#667085] mt-1">Live Firestore records</p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-[#667085] font-medium">Completed</p>
            <CheckCircle className="w-4 h-4 text-[#1B9A72]" />
          </div>
          <h3 className="text-3xl font-bold text-[#172033]">{metrics.completedCount}</h3>
          <p className="text-xs text-[#1B9A72] mt-1">Service fulfilled</p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-[#667085] font-medium">Avg Wait Time</p>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-3xl font-bold text-[#172033]">{metrics.avgWaitTime} min</h3>
          <p className="text-xs text-[#667085] mt-1">Target &lt; 20 min</p>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-[#667085] font-medium">Avg Service Time</p>
            <Clock className="w-4 h-4 text-[#168C82]" />
          </div>
          <h3 className="text-3xl font-bold text-[#172033]">{metrics.avgServiceTime} min</h3>
          <p className="text-xs text-[#667085] mt-1">Per served token</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#172033] mb-6">Weekly Volume & Wait Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.weeklyTrend || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E7" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E5E9E7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="tokens" name="Tokens" stroke="#168C82" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="avgWait" name="Avg Wait (min)" stroke="#E7A93B" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution Area Chart */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#172033] mb-6">Hourly Distribution (Queue Flow)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.hourlyDistribution || []} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTokensHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168C82" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#168C82" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E7" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E5E9E7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#168C82" strokeWidth={3} fillOpacity={1} fill="url(#colorTokensHour)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Volume Bar Chart */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-[#172033] mb-6">Daily Ticket Volume by Weekday</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E5E9E7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="tokens" fill="#168C82" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QueueAnalytics;
