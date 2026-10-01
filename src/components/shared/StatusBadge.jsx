import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const statusStyles = {
    active: 'bg-[#EEF9F7] text-[#1B9A72]',
    open: 'bg-[#EEF9F7] text-[#1B9A72]',
    completed: 'bg-[#EEF9F7] text-[#1B9A72]',
    waiting: 'bg-amber-50 text-[#E7A93B]',
    'in-service': 'bg-teal-50 text-[#168C82]',
    cancelled: 'bg-red-50 text-[#D95C5C]',
    closed: 'bg-red-50 text-[#D95C5C]',
    skipped: 'bg-gray-100 text-gray-600',
    break: 'bg-amber-50 text-[#E7A93B]',
    offline: 'bg-gray-100 text-gray-500',
  };

  const currentStyle = statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${currentStyle} ${className}`}>
      {status?.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
