import React from 'react';

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">{title}</h1>
        {subtitle && <p className="text-sm text-[#667085] mt-1">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center space-x-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
