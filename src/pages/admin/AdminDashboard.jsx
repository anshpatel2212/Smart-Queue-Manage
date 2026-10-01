import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  CheckCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Layers, 
  XCircle, 
  PhoneCall, 
  Play, 
  Activity, 
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useAdminQueues } from '../../hooks/useAdminQueues';

const AdminDashboard = () => {
  const { stats, departmentRows, recentActivities, chartData } = useAdminDashboard();
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');
  const { tokens: activeTokens, allActiveTokens } = useAdminQueues(selectedServiceFilter);

  // Extract unique services from active tokens for filter
  const availableServices = Array.from(
    new Set(allActiveTokens.map(t => JSON.stringify({ id: t.serviceId, name: t.serviceName })))
  ).map(s => JSON.parse(s));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Campus Queue Overview</h1>
          <p className="text-[#667085] mt-1">Live real-time queue analytics and operational metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center text-xs font-semibold text-[#1B9A72] bg-[#EEF9F7] px-3 py-1.5 rounded-full border border-[#1B9A72]/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1B9A72] mr-2 animate-pulse"></span>
            Real-Time Firestore Sync
          </span>
        </div>
      </div>

      {/* Top Stats Grid (Primary Operational Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tokens */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Total Tokens Today</p>
            <h3 className="text-3xl font-bold text-[#172033]">{stats.totalTokens}</h3>
          </div>
        </div>

        {/* Waiting Tokens */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-[#E7A93B] rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            {stats.waitingCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-[#E7A93B] rounded-full">
                {stats.waitingCount} in line
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Currently Waiting</p>
            <h3 className="text-3xl font-bold text-[#172033]">{stats.waitingCount}</h3>
          </div>
        </div>

        {/* Active In-Service & Called */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#EEF9F7] text-[#168C82] rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              {stats.calledCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> {stats.calledCount} called
                </span>
              )}
              {stats.inServiceCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-[#EEF9F7] text-[#168C82] rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3" /> {stats.inServiceCount} serving
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Called & At Counters</p>
            <h3 className="text-3xl font-bold text-[#172033]">{stats.calledCount + stats.inServiceCount}</h3>
          </div>
        </div>

        {/* Completed Tokens */}
        <div className="bg-white border border-[#E5E9E7] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-[#1B9A72] rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +8%
            </span>
          </div>
          <div>
            <p className="text-sm text-[#667085] mb-1 font-medium">Completed Tokens</p>
            <h3 className="text-3xl font-bold text-[#172033]">{stats.completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E9E7] p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#667085] font-medium">Avg Waiting Time</p>
            <p className="text-lg font-bold text-[#172033]">{stats.avgWaitTime} min</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-[#168C82] rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#667085] font-medium">Avg Service Time</p>
            <p className="text-lg font-bold text-[#172033]">{stats.avgServiceTime} min</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#667085] font-medium">Active Services</p>
            <p className="text-lg font-bold text-[#172033]">{stats.activeServicesCount} Open</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E9E7] p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-[#D95C5C] rounded-lg">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#667085] font-medium">Cancelled Tokens</p>
            <p className="text-lg font-bold text-[#172033]">{stats.cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* REAL-TIME LIVE QUEUE MONITORING SECTION */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E5E9E7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8FBFA]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#172033]">Live Queue Monitor</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-[#168C82] animate-ping"></span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">Real-time status of all active tokens in line or currently being served</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#667085]" />
            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E5E9E7] rounded-lg text-[#172033] text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Services ({allActiveTokens.length})</option>
              {availableServices.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FBFA] text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#E5E9E7]">
                <th className="p-4">Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Service</th>
                <th className="p-4">Position</th>
                <th className="p-4">Est. Wait</th>
                <th className="p-4">Counter</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9E7] text-sm">
              {activeTokens.map((token) => {
                let badgeBg = 'bg-amber-100 text-[#E7A93B]';
                let label = 'WAITING';
                if (token.status === 'called') {
                  badgeBg = 'bg-blue-100 text-blue-700 font-bold';
                  label = 'CALLED';
                } else if (token.status === 'in_service') {
                  badgeBg = 'bg-[#EEF9F7] text-[#168C82] font-bold';
                  label = 'IN SERVICE';
                }

                const createdTimeStr = token.createdAt?.toDate 
                  ? token.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : (token.createdAt?.seconds ? new Date(token.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');

                return (
                  <tr key={token.id || token.tokenId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-base text-[#168C82] bg-[#EEF9F7] px-2.5 py-1 rounded-md border border-[#168C82]/20">
                        {token.tokenNumber}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#172033]">
                      <div>{token.userName || 'Student'}</div>
                      {token.studentId && <div className="text-xs text-[#667085]">{token.studentId}</div>}
                    </td>
                    <td className="p-4 text-[#667085]">{token.serviceName || 'General Service'}</td>
                    <td className="p-4 font-semibold text-[#172033]">#{token.position || 1}</td>
                    <td className="p-4 text-[#667085]">{token.estimatedWait !== undefined ? `${token.estimatedWait} min` : '~10 min'}</td>
                    <td className="p-4 font-medium text-[#172033]">
                      {token.counterNumber ? `Counter ${token.counterNumber}` : <span className="text-[#667085] text-xs">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-wider inline-flex items-center gap-1 ${badgeBg}`}>
                        {token.status === 'in_service' && <span className="w-1.5 h-1.5 rounded-full bg-[#168C82] animate-pulse"></span>}
                        {label}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-[#667085] font-mono">
                      {createdTimeStr}
                    </td>
                  </tr>
                );
              })}

              {activeTokens.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#667085]">
                    No students currently waiting or in service. All counters are caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              <BarChart data={chartData?.dailyVolume || []}>
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
              <AreaChart data={chartData?.hourlyDistribution || []}>
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

      {/* Tables Row: Department Performance + Activity Feed */}
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
                  <th className="p-4 font-medium">Waiting</th>
                  <th className="p-4 font-medium">In Service</th>
                  <th className="p-4 font-medium">Completed</th>
                  <th className="p-4 font-medium">Counters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7]">
                {departmentRows.map((dept, index) => (
                  <tr key={dept.id || index} className="hover:bg-gray-50 text-sm">
                    <td className="p-4 font-medium text-[#172033]">{dept.name || dept.department}</td>
                    <td className="p-4 text-[#667085]">
                      <span className="font-semibold text-amber-600">{dept.waiting || 0}</span>
                    </td>
                    <td className="p-4 text-[#667085]">
                      <span className="font-semibold text-[#168C82]">{dept.inService || 0}</span>
                    </td>
                    <td className="p-4 text-[#667085]">{dept.completed || 0}</td>
                    <td className="p-4 text-[#667085]">
                      {dept.activeCounters || 1} / {dept.totalCounters || 2}
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
              {recentActivities.slice(0, 6).map((activity, index) => {
                let dotColor = 'bg-blue-500';
                if (activity.type === 'success') dotColor = 'bg-[#1B9A72]';
                if (activity.type === 'warning') dotColor = 'bg-[#E7A93B]';
                if (activity.type === 'error') dotColor = 'bg-[#D95C5C]';
                
                return (
                  <div key={index} className="flex gap-4 relative">
                    {index !== recentActivities.length - 1 && (
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
