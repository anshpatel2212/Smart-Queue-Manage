import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const closeSidebar = () => setSidebarOpen(false);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || (role === 'admin' ? 'A' : role === 'staff' ? 'S' : 'U');

  return (
    <div className="flex h-screen bg-[#F8FBFA] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-white lg:translate-x-0 lg:static shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <Sidebar role={role} currentPath={location.pathname} onNavigate={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="shrink-0 h-16 bg-white border-b border-[#E5E9E7] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button 
              className="lg:hidden p-2 text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168C82] min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
              aria-expanded={sidebarOpen}
            >
              <Menu size={22} />
            </button>
            
            <div className="hidden md:flex relative items-center">
              <Search className="absolute left-3 text-[#667085]" size={16} />
              <input 
                type="text" 
                placeholder="Search queues, services, or tokens..." 
                className="pl-9 pr-4 py-2 bg-[#F8FBFA] border border-[#E5E9E7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#168C82] focus:bg-white w-64 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to={`/${role}/notifications`}
              className="relative p-2 text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D95C5C] rounded-full ring-2 ring-white"></span>
              )}
            </Link>
            <Link
              to={`/${role}/profile`}
              className="flex items-center gap-2 group"
              aria-label="View profile"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name || 'User'} className="w-9 h-9 rounded-full object-cover border border-[#E5E9E7]" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#168C82] flex items-center justify-center text-white font-bold text-sm shadow-xs select-none group-hover:bg-[#127A71] transition-colors">
                  {userInitial}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
