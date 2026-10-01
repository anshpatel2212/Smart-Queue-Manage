import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const location = useLocation();

  const handleHowItWorksClick = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-[#111827] text-gray-300 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#168C82] p-2 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Smart<span className="text-[#159A8C]">Queue</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            A next-generation digital queue management system designed for modern university campuses. Streamlining campus operations and eliminating physical waiting lines.
          </p>
          <div className="flex items-center gap-3">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#159A8C] hover:text-white bg-[#159A8C]/10 hover:bg-[#159A8C]/20 px-3.5 py-2 rounded-lg transition-colors"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/#how-it-works" 
                onClick={handleHowItWorksClick}
                className="text-gray-400 hover:text-white transition-colors"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link to="/features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Campus Services */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Campus Services</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Examination Section
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Finance & Accounts
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Central Library
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Student Certificates
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                IT Support & WiFi
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Campus Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Campus Support</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5 text-gray-400">
              <Mail className="w-4 h-4 text-[#159A8C] shrink-0 mt-0.5" />
              <span>queue@smartcampus.edu</span>
            </li>
            <li className="flex items-start gap-2.5 text-gray-400">
              <Phone className="w-4 h-4 text-[#159A8C] shrink-0 mt-0.5" />
              <span>+1 (555) 234-5678</span>
            </li>
            <li className="flex items-start gap-2.5 text-gray-400">
              <MapPin className="w-4 h-4 text-[#159A8C] shrink-0 mt-0.5" />
              <span>Admin Block, Floor 1, Smart Campus</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {currentYear} Smart Campus University. All rights reserved.</p>
        <p className="flex items-center gap-4">
          <span className="text-[#159A8C]">Digital Queue Management System</span>
          <span>•</span>
          <span>Frontend Architecture</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
