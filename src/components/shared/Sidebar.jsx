import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ role = 'student', currentPath, onNavigate }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const navConfig = {
    student: [
      { name: 'Dashboard', path: '/student', icon: 'LayoutDashboard' },
      { name: 'Services', path: '/student/services', icon: 'Layers' },
      { name: 'My Token', path: '/student/my-token', icon: 'Ticket' },
      { name: 'Notifications', path: '/student/notifications', icon: 'Bell' },
      { name: 'History', path: '/student/history', icon: 'History' },
      { name: 'AI Assistant', path: '/student/ai-assistant', icon: 'Bot' },
      { name: 'Profile', path: '/student/profile', icon: 'User' },
    ],
    staff: [
      { name: 'Dashboard', path: '/staff', icon: 'LayoutDashboard' },
      { name: 'Live Queue', path: '/staff/live-queue', icon: 'ListOrdered' },
      { name: 'Counter', path: '/staff/counter', icon: 'Monitor' },
      { name: 'History', path: '/staff/history', icon: 'History' },
      { name: 'Notifications', path: '/staff/notifications', icon: 'Bell' },
      { name: 'AI Assistant', path: '/staff/ai-assistant', icon: 'Bot' },
      { name: 'Profile', path: '/staff/profile', icon: 'User' },
      ...(user?.role === 'admin' ? [{ name: 'Admin Overview', path: '/admin', icon: 'ShieldCheck' }] : [])
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
      { name: 'Departments', path: '/admin/departments', icon: 'Building' },
      { name: 'Services', path: '/admin/services', icon: 'Layers' },
      { name: 'Staff Management', path: '/admin/staff', icon: 'Users' },
      { name: 'Staff Counter View', path: '/staff', icon: 'PhoneCall' },
      { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart2' },
      { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
    ]
  };

  const links = navConfig[role] || navConfig.student;

  return (
    <div className="flex flex-col h-full bg-white text-[#172033] border-r border-[#E5E9E7]">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E9E7]">
        <Link 
          to={`/${role}`} 
          onClick={onNavigate}
          className="flex items-center gap-2 group"
          aria-label="SmartQueue Dashboard"
        >
          <div className="bg-[#168C82] p-1.5 rounded-lg group-hover:bg-[#127A71] transition-colors">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#172033]">
            Smart<span className="text-[#168C82]">Queue</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = LucideIcons[link.icon] || LucideIcons.Circle;
          const isActive = currentPath === link.path || (link.path !== `/${role}` && currentPath.startsWith(`${link.path}/`));
          
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onNavigate}
              className={`flex items-center px-3 py-2.5 rounded-xl transition-colors min-h-[44px] group ${
                isActive 
                  ? 'bg-[#168C82] text-white font-semibold shadow-xs' 
                  : 'text-[#667085] hover:bg-[#F8FBFA] hover:text-[#172033]'
              }`}
            >
              <Icon size={20} className={`mr-3 shrink-0 ${isActive ? 'text-white' : 'text-[#667085] group-hover:text-[#172033]'}`} />
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#E5E9E7]">
        {role === 'student' ? (
          <Link
            to="/login"
            onClick={onNavigate}
            className="flex items-center px-3 py-2.5 rounded-xl text-[#168C82] hover:bg-[#EEF9F7] transition-colors w-full min-h-[44px]"
          >
            <LucideIcons.ShieldCheck size={20} className="mr-3 shrink-0 text-[#168C82]" />
            <span className="font-semibold text-sm">Staff Login</span>
          </Link>
        ) : (
          <button 
            type="button"
            onClick={async () => {
              if (onNavigate) onNavigate();
              try {
                await logout();
              } catch (e) {
                console.error(e);
              }
              navigate('/login');
            }}
            className="flex items-center px-3 py-2.5 rounded-xl text-[#D95C5C] hover:bg-red-50 transition-colors w-full min-h-[44px] cursor-pointer"
          >
            <LogOut size={20} className="mr-3 shrink-0" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
