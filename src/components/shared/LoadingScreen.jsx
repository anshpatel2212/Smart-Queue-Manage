import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F8FBFA] z-[100]">
      <div className="flex items-center mb-4 text-3xl font-black text-[#172033] tracking-tight">
        Smart<span className="text-[#168C82]">Queue</span>
      </div>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-[#168C82] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-[#168C82] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-[#168C82] rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
