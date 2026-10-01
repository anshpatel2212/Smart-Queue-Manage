import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const styles = {
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  };

  const currentStyle = styles[type] || styles.info;
  const Icon = currentStyle.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-50 flex items-center w-full max-w-sm p-4 text-gray-800 bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${currentStyle.bg} ${currentStyle.color}`}>
            <Icon size={20} />
          </div>
          <div className="ml-3 text-sm font-medium pr-6">{message}</div>
          <button
            onClick={onClose}
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
