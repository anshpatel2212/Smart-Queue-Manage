import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Ticket, Users, Clock, Activity, Split, Bell, 
  History, BarChart3, LayoutDashboard, UserCheck, 
  LineChart, Bot, Sparkles,
  Shield, Laptop, Zap
} from 'lucide-react';
import Button from '@/components/shared/Button';

const FeaturesPage = () => {
  const featuresList = [
    {
      id: 1,
      icon: Ticket,
      title: 'Digital Tokens',
      desc: 'Instant, unique electronic tokens issued straight to student mobile devices. Eliminates messy paper tickets, lost numbers, and physical crowding.',
      badge: 'Student Experience',
      mockUI: (
        <div className="bg-[#EEF9F7] p-3 rounded-xl border border-[#168C82]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#168C82]"></span>
            <span className="text-xs font-bold text-[#111827]">Exam Hall Ticket</span>
          </div>
          <span className="text-sm font-extrabold text-[#168C82] tracking-wider px-2 py-0.5 bg-white rounded-md shadow-xs">
            E-047
          </span>
        </div>
      )
    },
    {
      id: 2,
      icon: Users,
      title: 'Live Queue Position',
      desc: 'Real-time countdown of people ahead in line. Students can comfortably study in the campus library or relax in the cafeteria while monitoring their rank.',
      badge: 'Live Tracking',
      mockUI: (
        <div className="bg-white p-3 rounded-xl border border-[#E5E9E7] flex items-center justify-between text-xs">
          <span className="text-[#667085]">Currently in front:</span>
          <span className="font-bold text-[#111827] bg-[#EEF9F7] text-[#168C82] px-2.5 py-1 rounded-full">
            4 People Ahead
          </span>
        </div>
      )
    },
    {
      id: 3,
      icon: Clock,
      title: 'Estimated Waiting Time',
      desc: 'Dynamic, algorithmic wait-time predictions derived from historical service durations and active counter throughput so students can plan their hours.',
      badge: 'Smart Calculation',
      mockUI: (
        <div className="bg-[#F8FBFA] p-3 rounded-xl border border-[#E5E9E7] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#667085]">
            <Clock size={14} className="text-[#168C82]" />
            <span>Est. Arrival</span>
          </div>
          <span className="font-bold text-[#168C82] text-sm">~12 Minutes</span>
        </div>
      )
    },
    {
      id: 4,
      icon: Activity,
      title: 'Real-Time Service Status',
      desc: 'Instant visual cues showing operational counters, staff availability, and peak surge alerts across all registered university departments.',
      badge: 'Operational Visibility',
      mockUI: (
        <div className="bg-white p-3 rounded-xl border border-[#E5E9E7] flex items-center justify-between text-xs">
          <span className="font-medium text-[#111827]">Counter 02 (Finance)</span>
          <span className="flex items-center gap-1 text-[#1B9A72] font-semibold bg-[#EEF9F7] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A72] animate-pulse"></span>
            Serving Now
          </span>
        </div>
      )
    },
    {
      id: 5,
      icon: Split,
      title: 'Multiple Service Counters',
      desc: 'Intelligent multi-counter load allocation. High-demand services automatically route across parallel staff desks to clear long lines rapidly.',
      badge: 'Throughput',
      mockUI: (
        <div className="flex gap-2 text-xs">
          <div className="flex-1 p-2 bg-[#EEF9F7] border border-[#168C82]/20 rounded-lg text-center font-semibold text-[#168C82]">
            Counter 1: Active
          </div>
          <div className="flex-1 p-2 bg-[#EEF9F7] border border-[#168C82]/20 rounded-lg text-center font-semibold text-[#168C82]">
            Counter 2: Active
          </div>
        </div>
      )
    },
    {
      id: 6,
      icon: Bell,
      title: 'Queue Notifications',
      desc: 'Proactive alerts when your turn is 3 positions away. Ensures students never miss their counter call even when away from the administration desk.',
      badge: 'Alerts',
      mockUI: (
        <div className="bg-[#EEF9F7] p-2.5 rounded-xl border border-[#168C82]/20 flex items-center gap-2 text-xs">
          <Bell size={14} className="text-[#168C82] shrink-0" />
          <span className="text-[#172033] font-medium">Your turn is approaching! Move to Counter 2</span>
        </div>
      )
    },
    {
      id: 7,
      icon: History,
      title: 'Queue History',
      desc: 'Comprehensive records of past ticket requests, service completion timestamps, and counter verification details for student transcripts and records.',
      badge: 'Audit Trail',
      mockUI: (
        <div className="bg-white p-2.5 rounded-xl border border-[#E5E9E7] flex justify-between items-center text-xs">
          <span className="text-[#667085]">Token E-032 (Completed)</span>
          <span className="text-[#1B9A72] font-semibold">Served in 5m</span>
        </div>
      )
    },
    {
      id: 8,
      icon: BarChart3,
      title: 'Campus Analytics',
      desc: 'Aggregated analytics tracking daily student footfall, peak rush periods, and department service speed to optimize university staffing.',
      badge: 'Insights',
      mockUI: (
        <div className="flex items-end gap-1.5 h-10 px-2 pt-2 bg-[#F8FBFA] rounded-xl border border-[#E5E9E7]">
          <div className="w-1/6 bg-[#168C82]/30 h-4 rounded-t"></div>
          <div className="w-1/6 bg-[#168C82]/60 h-6 rounded-t"></div>
          <div className="w-1/6 bg-[#168C82] h-9 rounded-t"></div>
          <div className="w-1/6 bg-[#168C82] h-7 rounded-t"></div>
          <div className="w-1/6 bg-[#168C82]/70 h-5 rounded-t"></div>
          <div className="w-1/6 bg-[#168C82]/40 h-3 rounded-t"></div>
        </div>
      )
    },
    {
      id: 9,
      icon: LayoutDashboard,
      title: 'Student Dashboard',
      desc: 'A unified single-view portal displaying your active token, estimated wait time, queue progress bar, and 1-click access to all university counters.',
      badge: 'Student Portal',
      mockUI: (
        <div className="bg-white p-3 rounded-xl border border-[#E5E9E7] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#111827]">Active Ticket: E-047</span>
          <span className="text-[#E7A93B] font-bold bg-amber-50 px-2 py-0.5 rounded">Waiting</span>
        </div>
      )
    },
    {
      id: 10,
      icon: UserCheck,
      title: 'Staff Queue Management',
      desc: 'Dedicated operator panel equipped with rapid Call Next, Start Service, Skip, and Complete triggers for frictionless counter throughput.',
      badge: 'Staff Tools',
      mockUI: (
        <div className="flex gap-2">
          <span className="flex-1 text-center py-1 bg-[#168C82] text-white rounded text-[11px] font-bold">
            Call Next
          </span>
          <span className="flex-1 text-center py-1 bg-[#1B9A72] text-white rounded text-[11px] font-bold">
            Complete
          </span>
        </div>
      )
    },
    {
      id: 11,
      icon: LineChart,
      title: 'Admin Analytics',
      desc: 'University-wide management interface to supervise department counters, configure service windows, and audit queue bottlenecks with visual charts.',
      badge: 'Administration',
      mockUI: (
        <div className="bg-[#EEF9F7] p-2.5 rounded-xl border border-[#168C82]/20 flex justify-between items-center text-xs">
          <span className="text-[#172033] font-medium">Daily Tokens Processed</span>
          <span className="font-extrabold text-[#168C82]">156 Total</span>
        </div>
      )
    },
    {
      id: 12,
      icon: Bot,
      title: 'AI Campus Assistant UI',
      desc: 'A friendly virtual campus assistant providing interactive instant responses to queue position inquiries, counter locations, and service advice.',
      badge: 'Frontend Demo UI',
      mockUI: (
        <div className="bg-white p-2.5 rounded-xl border border-[#E5E9E7] space-y-1.5 text-xs">
          <div className="text-[11px] text-[#667085]">Q: "What is my queue position?"</div>
          <div className="text-[11px] font-medium text-[#168C82] bg-[#EEF9F7] p-1.5 rounded">
            "Your token E-047 is #4 in line (~12 min wait)."
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFA] text-[#172033]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-white border-b border-[#E5E9E7]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#EEF9F7]/70 to-transparent -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF9F7] text-[#168C82] text-xs sm:text-sm font-semibold mb-6"
          >
            <Zap size={16} />
            <span>Complete Feature Suite</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Everything You Need for <span className="text-[#168C82]">Smarter Queue Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[#667085] max-w-3xl mx-auto leading-relaxed"
          >
            From digital student tokens to staff operations dashboards and campus-wide analytics, SmartQueue delivers an integrated ecosystem engineered for zero waiting fatigue.
          </motion.p>
        </div>
      </section>

      {/* 12 Features Grid Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#111827]">Built for High-Volume Campus Operations</h2>
          <p className="mt-3 text-base text-[#667085]">
            Explore the twelve core capabilities powering a paperless, transparent waiting experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
                className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="bg-[#EEF9F7] text-[#168C82] p-3 rounded-xl">
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] bg-[#F8FBFA] px-2.5 py-1 rounded-md border border-[#E5E9E7]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111827] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#667085] leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                </div>

                <div>
                  <div className="pt-4 border-t border-[#E5E9E7]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block mb-2">
                      Live Preview
                    </span>
                    {feat.mockUI}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dark Navy Feature Section */}
      <section className="py-24 bg-[#111827] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#168C82_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#159A8C] bg-[#159A8C]/10 px-3.5 py-1.5 rounded-full inline-block mb-4">
              Institutional Scale
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Designed for Enterprise Campus Reliability
            </h2>
            <p className="mt-4 text-gray-400 text-base sm:text-lg">
              SmartQueue is architected for frictionless deployment across universities of any scale without cumbersome hardware installations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 border border-gray-700/60 p-8 rounded-2xl">
              <div className="bg-[#159A8C]/20 text-[#159A8C] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Laptop size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Zero App Installation</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Accessible instantly on any mobile browser or desktop workstation. No app stores, no updates, zero storage footprint for students.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/60 p-8 rounded-2xl">
              <div className="bg-[#159A8C]/20 text-[#159A8C] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Institutional Security</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Role-based access controls isolating Student, Staff, and Administrator portals with strict token validity and audit traceability.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/60 p-8 rounded-2xl">
              <div className="bg-[#159A8C]/20 text-[#159A8C] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Future-Proof Ecosystem</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Engineered with modern frontend components ready for seamless plug-and-play connection to cloud datastores and AI prediction APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
            Experience Smart Campus Queuing Today
          </h2>
          <p className="mt-4 text-lg text-[#667085] max-w-2xl mx-auto">
            Test the live student, staff, and admin dashboards with realistic mock data.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Get Started (No Account)
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Staff &amp; Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
