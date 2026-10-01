import React from 'react';

const QueueProgress = ({ tokens = [], currentIndex = 0 }) => {
  return (
    <div className="py-6 flex items-center justify-center w-full overflow-x-auto">
      {tokens.map((token, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === tokens.length - 1;
        
        return (
          <React.Fragment key={token}>
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isCurrent ? 'bg-[#168C82] border-[#168C82] text-white' :
                  isPast ? 'bg-gray-100 border-gray-300 text-gray-400' :
                  'bg-white border-[#168C82] text-[#168C82]'
                }`}
              >
                {token.split('-')[1] || token}
              </div>
              <span className={`absolute -bottom-6 text-xs whitespace-nowrap ${isCurrent ? 'font-bold text-[#168C82]' : 'text-gray-500'}`}>
                {isCurrent ? 'Serving' : ''}
              </span>
            </div>
            
            {!isLast && (
              <div className={`w-8 sm:w-12 h-1 ${isPast ? 'bg-gray-300' : 'bg-[#E5E9E7]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default QueueProgress;
