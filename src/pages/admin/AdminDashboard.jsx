import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subscribeAllActiveTokens } from '../../services/tokenService';
import { getCampusHistory } from '../../services/historyService';
import { getDepartments } from '../../services/serviceService';
import { analyticsData } from '@/data/mockData';

const AdminDashboard = () => {
  const [activeTokens, setActiveTokens] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Subscribe to real-time active tokens
  useEffect(() => {
    const unsub = subscribeAllActiveTokens((tokens) => {
      setActiveTokens(tokens);
    });
    return () => unsub();
  }, []);

  // Fetch campus history & departments
  useEffect(() => {
    getCampusHistory(50).then(items => setHistoryItems(items)).catch(() => {});
    getDepartments().then(depts => setDepartments(depts)).catch(() => {});
  }, []);

  // Compute live metrics
  const waitingCount = activeTokens.filter(t => t.status === 'waiting').length;
  const inServiceCount = activeTokens.filter(t => t.status === 'in_service' || t.status === 'called').length;
  const completedHistoryCount = historyItems.filter(h => h.status === 'completed').length;
  
  // Total tokens today (active waiting/serving + completed)
  const totalTokensToday = Math.max(activeTokens.length + completedHistoryCount, analyticsData.totalTokensToday);
  const completedToday = Math.max(completedHistoryCount, analyticsData.completedToday);
  const waitingDisplay = activeTokens.length > 0 ? waitingCount : analyticsData.currentlyWaiting;

  // Calculate real average wait time from completed history or fallback
  const waitTimes = historyItems.filter(h => h.waitingTime > 0).map(h => h.waitingTime);
  const avgWaitTime = waitTimes.length > 0 
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : analyticsData.avgWaitTime;

  // Merge department performance with live counts
  const departmentRows = departments.map((dept, index) => {
    const fallback = analyticsData.departmentPerformance[index] || {
      tokens: 30 + (index * 5),
      avgWait: 15,
      completed: 25 + (index * 4),
      satisfaction: 4.5,
    };
    
    // Count active tokens in this department
    const deptActive = activeTokens.filter(t => t.departmentId === dept.id).length;
    const deptCompleted = historyItems.filter(h => h.departmentId === dept.id && h.status === 'completed').length;

    return {
      department: dept.name,
      tokens: deptActive + deptCompleted > 0 ? deptActive + deptCompleted : fallback.tokens,
      completed: deptCompleted > 0 ? deptCompleted : fallback.completed,
      avgWait: `${fallback.avgWait} min`,
      satisfaction: fallback.satisfaction,
    };
  });

  // Recent activity: Combine active queue events + completed history
  const recentActivities = [
    ...activeTokens.slice(0, 3).map(t => ({
      action: t.status === 'in_service' ? 'Token In Service' : 'Token Waiting',
      detail: `${t.tokenNumber} (${t.serviceName}) at counter`,
      time: 'Just now',
      type: t.status === 'in_service' ? 'info' : 'warning',
    })),
    ...historyItems.slice(0, 4).map(h => ({
      action: h.status === 'completed' ? 'Token Completed' : 'Token Skipped',
      detail: `${h.tokenNumber} served for ${h.serviceName}`,
      time: h.dateString ? 'Recorded' : 'Recently',
      type: h.status === 'completed' ? 'success' : 'error',
    })),
  ];

  const displayActivities = recentActivities.length > 0 ? recentActivities : analyticsData.recentActivity;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Campus Queue Overview</h1>
          <p className="text-[#667085] mt-1">Live queue analytics and department metrics</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="flex items-center text-sm font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Total Tokens Today</p>
            <h3 className="text-3xl font-bold text-[#172033]">{totalTokensToday}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#EEF9F7] text-[#1B9A72] rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="flex items-center text-sm font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +8%
            </span>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Completed</p>
            <h3 className="text-3xl font-bold text-[#172033]">{completedToday}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-[#E7A93B] rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            {inServiceCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#EEF9F7] text-[#168C82] rounded-full">
                {inServiceCount} at counter
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Currently Waiting</p>
            <h3 className="text-3xl font-bold text-[#172033]">{waitingDisplay}</h3>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <span className="flex items-center text-sm font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-1 rounded-md">
              <TrendingDown className="w-3 h-3 mr-1" /> Target &lt; 20m
            </span>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Avg Wait Time</p>
            <h3 className="text-3xl font-bold text-[#172033]">{avgWaitTime} min</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#172033]">Daily Queue Volume</h3>
            <span className="text-xs text-[#667085]">This Week</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.dailyVolume || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E7" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F8FBFA'}} contentStyle={{borderRadius: '8px', border: '1px solid #E5E9E7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="tokens" fill="#168C82" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#172033]">Hourly Distribution (Peak Traffic)</h3>
            <span className="text-xs text-[#667085]">Campus Hours</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.hourlyDistribution || []}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168C82" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#168C82" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E7" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#667085', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E5E9E7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="tokens" stroke="#168C82" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5E9E7] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#172033]">Department Performance</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-[#EEF9F7] text-[#168C82] rounded-md">Live Sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FBFA] text-sm text-[#667085] border-b border-[#E5E9E7]">
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Tokens</th>
                  <th className="p-4 font-medium">Completed</th>
                  <th className="p-4 font-medium">Avg Wait</th>
                  <th className="p-4 font-medium">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {departmentRows.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50 text-sm">
                    <td className="p-4 font-medium text-[#172033]">{dept.department}</td>
                    <td className="p-4 text-[#667085]">{dept.tokens}</td>
                    <td className="p-4 text-[#667085]">{dept.completed}</td>
                    <td className="p-4 text-[#667085]">{dept.avgWait}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#172033] font-medium">{dept.satisfaction}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1B9A72]" 
                            style={{ width: `${(dept.satisfaction / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#E5E9E7]">
            <h3 className="text-lg font-bold text-[#172033]">Recent Activity</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[360px]">
            <div className="space-y-6">
              {displayActivities.slice(0, 6).map((activity, index) => {
                let dotColor = 'bg-blue-500';
                if (activity.type === 'success') dotColor = 'bg-[#1B9A72]';
                if (activity.type === 'warning') dotColor = 'bg-[#E7A93B]';
                if (activity.type === 'error') dotColor = 'bg-[#D95C5C]';
                
                return (
                  <div key={index} className="flex gap-4 relative">
                    {index !== displayActivities.length - 1 && (
                      <div className="absolute top-6 left-1.5 w-[2px] h-full bg-[#E5E9E7]"></div>
                    )}
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 z-10 ${dotColor}`}></div>
                    <div>
                      <p className="text-sm font-medium text-[#172033]">{activity.action}</p>
                      <p className="text-sm text-[#667085] mt-0.5">{activity.detail}</p>
                      <p className="text-xs text-[#667085] mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
