import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('All');
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'queue': return <Bell className="w-5 h-5 text-[#168C82]" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-[#E7A93B]" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#1B9A72]" />;
      default: return <Info className="w-5 h-5 text-[#168C82]" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'queue': return 'border-l-[#168C82]';
      case 'alert': return 'border-l-[#E7A93B]';
      case 'success': return 'border-l-[#1B9A72]';
      default: return 'border-l-[#168C82]';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Queue Updates') return n.type === 'queue';
    if (filter === 'Alerts') return n.type === 'alert';
    if (filter === 'Info') return n.type === 'info' || n.type === 'success';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Notifications</h1>
          <p className="text-sm text-[#667085] mt-1">Stay updated on your live queues and campus alerts.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={markAllRead}
            className="text-[#168C82] text-xs sm:text-sm font-semibold hover:underline px-3.5 py-2 bg-[#EEF9F7] rounded-xl transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {['All', 'Queue Updates', 'Alerts', 'Info'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-[#168C82] text-white shadow-xs' 
                : 'bg-white text-[#667085] border border-[#E5E9E7] hover:bg-[#F8FBFA]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#168C82] mb-3" />
          <p className="text-sm text-[#667085]">Fetching your notifications...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const timeStr = n.createdAt?.toDate 
              ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent';

            return (
              <motion.div 
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`p-4 sm:p-5 rounded-2xl border border-[#E5E9E7] border-l-4 ${getBorderColor(n.type)} shadow-xs flex items-start gap-4 transition-all ${
                  n.read ? 'bg-white opacity-85' : 'bg-[#EEF9F7]/40 font-medium cursor-pointer'
                }`}
              >
                <div className="mt-1 shrink-0 p-2 bg-white rounded-xl shadow-xs border border-[#E5E9E7]">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#111827]">{n.title}</h3>
                    <span className="text-[11px] text-[#667085] shrink-0">{timeStr}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">{n.message}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#168C82] mt-2 shrink-0"></span>
                )}
              </motion.div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E9E7] p-12 text-center">
              <Sparkles className="w-10 h-10 text-[#667085]/40 mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#111827]">No notifications</h3>
              <p className="text-xs text-[#667085] mt-1">You are completely up to date.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default NotificationsPage;
