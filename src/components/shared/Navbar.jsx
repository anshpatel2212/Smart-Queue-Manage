import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleHowItWorksClick = () => {
    closeMenu();
    if (location.pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works', onClick: handleHowItWorksClick },
    { name: 'Services', path: '/services' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];

  const isLinkActive = (path) => {
    if (path.includes('#')) {
      return location.pathname === '/' && location.hash === '#how-it-works';
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E9E7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              onClick={closeMenu}
              className="flex items-center gap-2 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168C82]"
              aria-label="SmartQueue Homepage"
            >
              <div className="bg-[#168C82] p-2 rounded-xl group-hover:bg-[#127A71] transition-colors shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#172033] tracking-tight">
                Smart<span className="text-[#168C82]">Queue</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={link.onClick || undefined}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168C82] ${
                    active 
                      ? 'text-[#168C82] bg-[#EEF9F7] font-semibold' 
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-[#172033] hover:text-[#168C82] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168C82]"
            >
              Staff Login
            </Link>
            <Link to="/student" tabIndex={-1}>
              <Button variant="primary" size="sm" className="shadow-sm">
                Join Queue
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168C82] min-h-[44px] min-w-[44px]"
              aria-label={isOpen ? "Close main navigation menu" : "Open main navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6 text-[#172033]" /> : <Menu className="h-6 w-6 text-[#172033]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white border-b border-[#E5E9E7] shadow-lg overflow-hidden w-full"
          >
            <div className="px-4 pt-3 pb-4 space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={link.onClick ? () => { link.onClick(); closeMenu(); } : closeMenu}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium min-h-[44px] transition-colors ${
                      active
                        ? 'bg-[#EEF9F7] text-[#168C82] font-semibold'
                        : 'text-[#172033] hover:bg-[#F8FBFA] hover:text-[#168C82]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-[#E5E9E7] bg-[#F8FBFA]/50 space-y-2.5">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center justify-center w-full px-4 py-3 border border-[#E5E9E7] shadow-sm text-base font-medium rounded-xl text-[#172033] bg-white hover:bg-[#F8FBFA] min-h-[44px] transition-colors"
              >
                Staff Login
              </Link>
              <Link
                to="/student"
                onClick={closeMenu}
                className="flex items-center justify-center w-full px-4 py-3 bg-[#168C82] hover:bg-[#127A71] text-white shadow-sm text-base font-medium rounded-xl min-h-[44px] transition-colors"
              >
                Join Queue
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
