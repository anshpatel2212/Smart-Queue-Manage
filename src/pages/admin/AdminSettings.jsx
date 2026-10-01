import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Monitor, Settings, Loader2, Check } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '../../services/settingsService';

const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-[#E5E9E7] last:border-0">
    <div>
      <p className="text-sm font-medium text-[#172033]">{label}</p>
      {description && <p className="text-xs text-[#667085] mt-0.5">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B9A72]"></div>
    </label>
  </div>
);

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [feedback, setFeedback] = useState('');

  const [settings, setSettings] = useState({
    institutionName: 'Smart Campus University',
    queueStartTime: '09:00',
    queueEndTime: '16:30',
    maxTokensPerService: 50,
    tokenPrefix: true,
    autoResetDaily: true,
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    notifyBefore: 3,
    welcomeMessage: true,
    showEstimatedTime: true,
    showPeopleAhead: true,
    showCounterNumber: true,
    showServiceDescription: true,
    soundAlert: false,
  });

  useEffect(() => {
    getSystemSettings().then((data) => {
      setSettings(data);
      setFetching(false);
    }).catch(() => {
      setFetching(false);
    });
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSystemSettings(settings);
      setFeedback('System settings saved successfully to Firestore!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">System Settings</h1>
        <p className="text-[#667085] mt-1">Configure global application preferences and queue parameters</p>
      </div>

      {feedback && (
        <div className="p-3 bg-[#EEF9F7] text-[#168C82] border border-[#168C82]/20 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#168C82]" />
          {feedback}
        </div>
      )}

      <div className="bg-white border border-[#E5E9E7] rounded-xl shadow-sm flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-[#E5E9E7] flex flex-row md:flex-col">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-white text-[#168C82] border-l-4 border-[#168C82]' : 'text-[#667085] hover:bg-white hover:text-[#172033] border-l-4 border-transparent'}`}
          >
            <Settings className="w-5 h-5" /> General
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-white text-[#168C82] border-l-4 border-[#168C82]' : 'text-[#667085] hover:bg-white hover:text-[#172033] border-l-4 border-transparent'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('display')}
            className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'display' ? 'bg-white text-[#168C82] border-l-4 border-[#168C82]' : 'text-[#667085] hover:bg-white hover:text-[#172033] border-l-4 border-transparent'}`}
          >
            <Monitor className="w-5 h-5" /> Display
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {fetching ? (
            <div className="p-8 text-center text-[#667085] flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#168C82] mb-2" />
              <p>Loading settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-lg font-bold text-[#172033] border-b border-[#E5E9E7] pb-2">General Configuration</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1">Campus / Institution Name</label>
                    <input 
                      type="text" 
                      name="institutionName" 
                      value={settings.institutionName || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1">Queue Opens</label>
                      <input 
                        type="time" 
                        name="queueStartTime" 
                        value={settings.queueStartTime || '09:00'} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1">Queue Closes</label>
                      <input 
                        type="time" 
                        name="queueEndTime" 
                        value={settings.queueEndTime || '16:30'} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1">Max Daily Tokens Per Service</label>
                    <input 
                      type="number" 
                      name="maxTokensPerService" 
                      value={settings.maxTokensPerService || 50} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <ToggleSwitch 
                      label="Service Prefix Routing" 
                      description="Prefix tokens with service code (e.g. E-047 for Exam Hall Ticket)" 
                      checked={!!settings.tokenPrefix} 
                      onChange={() => handleToggle('tokenPrefix')} 
                    />
                    <ToggleSwitch 
                      label="Auto Daily Reset" 
                      description="Reset daily sequence numbers at midnight automatically" 
                      checked={!!settings.autoResetDaily} 
                      onChange={() => handleToggle('autoResetDaily')} 
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-lg font-bold text-[#172033] border-b border-[#E5E9E7] pb-2">Notification Channels</h2>
                  
                  <div>
                    <ToggleSwitch 
                      label="SMS Notifications" 
                      description="Send SMS alerts when student queue turn is approaching" 
                      checked={!!settings.smsEnabled} 
                      onChange={() => handleToggle('smsEnabled')} 
                    />
                    <ToggleSwitch 
                      label="Email Notifications" 
                      description="Send digital receipt and service confirmations via email" 
                      checked={!!settings.emailEnabled} 
                      onChange={() => handleToggle('emailEnabled')} 
                    />
                    <ToggleSwitch 
                      label="In-App Push Alerts" 
                      description="Real-time web notifications when token status changes" 
                      checked={!!settings.pushEnabled} 
                      onChange={() => handleToggle('pushEnabled')} 
                    />
                    <ToggleSwitch 
                      label="Welcome Message" 
                      description="Send welcome message upon joining the queue" 
                      checked={!!settings.welcomeMessage} 
                      onChange={() => handleToggle('welcomeMessage')} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1">Advance Alert Trigger (Positions Ahead)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      name="notifyBefore" 
                      value={settings.notifyBefore || 3} 
                      onChange={handleChange} 
                      className="w-full max-w-xs px-4 py-2 border border-[#E5E9E7] rounded-lg text-sm focus:border-[#168C82] focus:outline-none"
                    />
                    <p className="text-xs text-[#667085] mt-1">Alerts student when they are within this many people of the counter.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'display' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-lg font-bold text-[#172033] border-b border-[#E5E9E7] pb-2">Student Display Features</h2>
                  
                  <div>
                    <ToggleSwitch 
                      label="Show Estimated Wait Time" 
                      description="Display calculated wait time based on active counters" 
                      checked={!!settings.showEstimatedTime} 
                      onChange={() => handleToggle('showEstimatedTime')} 
                    />
                    <ToggleSwitch 
                      label="Show People Ahead Counter" 
                      description="Display exact number of students waiting ahead in line" 
                      checked={!!settings.showPeopleAhead} 
                      onChange={() => handleToggle('showPeopleAhead')} 
                    />
                    <ToggleSwitch 
                      label="Show Counter Assignments" 
                      description="Show which counter is serving the student" 
                      checked={!!settings.showCounterNumber} 
                      onChange={() => handleToggle('showCounterNumber')} 
                    />
                    <ToggleSwitch 
                      label="Audible Call Bell" 
                      description="Play chime sound when token is called" 
                      checked={!!settings.soundAlert} 
                      onChange={() => handleToggle('soundAlert')} 
                    />
                  </div>
                </motion.div>
              )}

              <div className="pt-6 border-t border-[#E5E9E7] flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#168C82] hover:bg-[#127a71] text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
