import React from 'react';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl border border-[#E5E9E7] shadow-sm flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#172033]">{title}</h3>
        {subtitle && <p className="text-sm text-[#667085] mt-1">{subtitle}</p>}
      </div>
      <div className="flex-grow flex items-center justify-center w-full min-h-[250px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
