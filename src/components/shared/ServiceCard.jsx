import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const Icon = LucideIcons[service.icon] || LucideIcons.FileText;
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-xl border border-[#E5E9E7] p-6 shadow-sm transition-all flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#EEF9F7] rounded-lg">
          <Icon className="w-6 h-6 text-[#168C82]" />
        </div>
        <StatusBadge status={service.status} />
      </div>
      
      <h3 className="text-lg font-bold text-[#172033] mb-1">{service.name}</h3>
      <p className="text-sm text-[#168C82] font-medium mb-3">{service.department}</p>
      <p className="text-sm text-[#667085] mb-6 flex-grow">{service.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-[#667085] mb-1">Queue</p>
          <p className="text-lg font-bold text-[#172033]">{service.currentQueue}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-[#667085] mb-1">Wait Time</p>
          <p className="text-lg font-bold text-[#172033]">{service.estimatedWait}m</p>
        </div>
      </div>
      
      <Button 
        variant="primary" 
        className="w-full"
        disabled={service.status === 'closed'}
        onClick={() => navigate(`/student/join-queue/${service.id}`)}
      >
        {service.status === 'closed' ? 'Currently Closed' : 'Join Queue'}
      </Button>
    </motion.div>
  );
};

export default ServiceCard;
