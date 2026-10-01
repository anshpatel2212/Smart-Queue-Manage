import React from 'react';
import * as LucideIcons from 'lucide-react';

const NotificationCard = ({ notification }) => {
  const Icon = LucideIcons[notification.icon] || LucideIcons.Bell;
  
  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-[#1B9A72]',
    warning: 'bg-[#E7A93B]',
    error: 'bg-[#D95C5C]',
    queue: 'bg-[#168C82]',
    alert: 'bg-purple-500'
  };

  const stripeColor = typeColors[notification.type] || 'bg-gray-500';

  return (
    <div className={`relative flex items-start p-4 rounded-xl border overflow-hidden transition-colors ${notification.read ? 'bg-white border-[#E5E9E7]' : 'bg-[#F8FBFA] border-[#168C82]/30'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`} />
      
      <div className="flex-shrink-0 mr-4 mt-1">
        <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100 text-gray-500' : 'bg-white text-[#168C82] shadow-sm'}`}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-sm font-semibold ${notification.read ? 'text-[#172033]' : 'text-[#168C82]'}`}>{notification.title}</h4>
          <span className="text-xs text-gray-500">{notification.time}</span>
        </div>
        <p className="text-sm text-gray-600">{notification.message}</p>
      </div>
      
      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#168C82]" />
      )}
    </div>
  );
};

export default NotificationCard;
