import React from 'react';
import StatusBadge from './StatusBadge';
import { getEstimatedWaitDisplay } from '../../utils/queueCalculations';

const TokenCard = ({ tokenNumber, status, currentlyServing, peopleAhead, estimatedWait, counter }) => {
  const waitDisplay = getEstimatedWaitDisplay(status, peopleAhead, estimatedWait);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E9E7] p-8 max-w-md mx-auto text-center">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#172033]">Your Token</h2>
        <StatusBadge status={status} />
      </div>
      
      <div className="w-32 h-32 mx-auto bg-[#EEF9F7] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-md">
        <span className="text-3xl font-bold text-[#168C82]">{tokenNumber}</span>
      </div>
      
      {counter && (
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            Proceed to Counter <strong className="text-lg ml-1">{counter}</strong>
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 border-t border-[#E5E9E7] pt-6">
        <div>
          <p className="text-xs text-[#667085] mb-1">People Ahead</p>
          <p className="text-xl font-bold text-[#172033]">{peopleAhead}</p>
        </div>
        <div>
          <p className="text-xs text-[#667085] mb-1">Estimated Wait</p>
          <p className={`font-bold text-[#172033] ${waitDisplay.length > 10 ? 'text-sm sm:text-base' : 'text-xl'}`}>{waitDisplay}</p>
        </div>
        <div className="col-span-2 mt-2">
          <p className="text-xs text-[#667085] mb-1">Currently Serving</p>
          <p className="text-lg font-semibold text-[#168C82]">{currentlyServing}</p>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
