import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'text-[#168C82]', bgColor = 'bg-[#EEF9F7]' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#E5E9E7] shadow-sm flex items-start">
      <div className={`p-3 rounded-lg ${bgColor} mr-4`}>
        {Icon && <Icon className={`w-6 h-6 ${color}`} />}
      </div>
      <div>
        <p className="text-sm font-medium text-[#667085]">{title}</p>
        <div className="flex items-baseline mt-1">
          <h3 className="text-2xl font-bold text-[#172033]">{value}</h3>
          {trend && (
            <span className={`ml-2 text-xs font-medium flex items-center ${trend.startsWith('+') ? 'text-[#1B9A72]' : 'text-[#D95C5C]'}`}>
              {trend.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
              {Math.abs(parseFloat(trend))}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-[#667085] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
