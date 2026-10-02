import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, Banknote, BookOpen, FileCheck, CreditCard, 
  Monitor, Clock, Users, ArrowRight, CheckCircle2, 
  Sparkles
} from 'lucide-react';
import Button from '@/components/shared/Button';

const ServicesPage = () => {
  const [filter, setFilter] = useState('all');

  const servicesData = [
    {
      id: 'exam',
      category: 'academic',
      icon: FileText,
      name: 'Examination Section',
      description: 'Handling official grade reviews, transcript issuance, hall tickets, and student examination inquiries.',
      items: ['Result verification & grade review', 'Official transcript requests', 'Exam timetable & hall ticket queries'],
      queueCount: 7,
      estWait: '18 min',
      status: 'Open',
      statusType: 'active',
      counter: 'Counters 1 & 2 Active'
    },
    {
      id: 'finance',
      category: 'admin',
      icon: Banknote,
      name: 'Finance & Accounts',
      description: 'Streamlined semester fee settlements, clearance certificates, scholarship distribution, and refund processing.',
      items: ['Tuition & hostel fee payments', 'No-dues clearance verification', 'Scholarship stipend disbursement'],
      queueCount: 8,
      estWait: '20 min',
      status: 'Open',
      statusType: 'active',
      counter: 'Counter 2 Active'
    },
    {
      id: 'library',
      category: 'academic',
      icon: BookOpen,
      name: 'Central Campus Library',
      description: 'Digital catalog assistance, circulation book returns, card registrations, and clearance certificates.',
      items: ['Book returns & fine clearance', 'Digital resource access & cards', 'Graduation library clearance'],
      queueCount: 4,
      estWait: '8 min',
      status: 'Open',
      statusType: 'active',
      counter: 'Counter 1 Active'
    },
    {
      id: 'certificates',
      category: 'admin',
      icon: FileCheck,
      name: 'Certificates & Documents',
      description: 'Issuance of official bonafide credentials, study certificates, transfer papers, and degree certificates.',
      items: ['Bonafide & study certificates', 'Degree & provisional collection', 'No-Objection Certificates (NOC)'],
      queueCount: 11,
      estWait: '25 min',
      status: 'Open',
      statusType: 'active',
      counter: 'Counter 3 Active'
    },
    {
      id: 'idcard',
      category: 'admin',
      icon: CreditCard,
      name: 'ID Card Management',
      description: 'Student identification issuance, RFID campus access re-programming, and rapid replacement for lost cards.',
      items: ['New enrollee smart ID cards', 'Lost or damaged card reissue', 'RFID gate access encoding'],
      queueCount: 0,
      estWait: 'N/A',
      status: 'Closed for Inventory',
      statusType: 'closed',
      counter: 'Opens 2:00 PM'
    },
    {
      id: 'itsupport',
      category: 'tech',
      icon: Monitor,
      name: 'Campus IT Support',
      description: 'On-site technical support for student portals, campus Wi-Fi onboarding, institutional mail, and software access.',
      items: ['Campus Wi-Fi authentication', 'Student portal & email recovery', 'Academic software licensing'],
      queueCount: 3,
      estWait: '10 min',
      status: 'Open',
      statusType: 'active',
      counter: 'Desk 1 Active'
    }
  ];

  const filteredServices = servicesData.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="min-h-screen bg-[#F8FBFA] text-[#172033]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#E5E9E7] bg-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#EEF9F7] -z-10 blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF9F7] text-[#168C82] text-xs sm:text-sm font-semibold mb-6"
          >
            <Sparkles size={16} />
            <span>Digital Queue Concierge</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Campus Services, <span className="text-[#168C82]">Without the Wait</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[#667085] max-w-2xl mx-auto leading-relaxed"
          >
            Skip physical waiting crowds completely. Join digital queues for university administration, finance, examination, and support directly from your laptop or phone.
          </motion.p>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <div className="bg-[#F8FBFA] border border-[#E5E9E7] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#111827]">6</div>
              <div className="text-xs text-[#667085] font-medium mt-0.5">Departments</div>
            </div>
            <div className="bg-[#F8FBFA] border border-[#E5E9E7] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#168C82]">14 min</div>
              <div className="text-xs text-[#667085] font-medium mt-0.5">Avg Campus Wait</div>
            </div>
            <div className="bg-[#F8FBFA] border border-[#E5E9E7] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#111827]">100%</div>
              <div className="text-xs text-[#667085] font-medium mt-0.5">Paperless Tokens</div>
            </div>
            <div className="bg-[#F8FBFA] border border-[#E5E9E7] p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#1B9A72]">Live</div>
              <div className="text-xs text-[#667085] font-medium mt-0.5">Position Tracker</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-[#E5E9E7]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">Available Campus Queues</h2>
            <p className="text-sm text-[#667085] mt-1">Select a campus department to view live wait status and join the line.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E9E7] rounded-xl self-stretch sm:self-auto overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-[#168C82] text-white shadow-sm' 
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA]'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setFilter('academic')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'academic' 
                  ? 'bg-[#168C82] text-white shadow-sm' 
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA]'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'admin' 
                  ? 'bg-[#168C82] text-white shadow-sm' 
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA]'
              }`}
            >
              Administration
            </button>
            <button
              onClick={() => setFilter('tech')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'tech' 
                  ? 'bg-[#168C82] text-white shadow-sm' 
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F8FBFA]'
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, index) => {
            const Icon = service.icon;
            const isOpen = service.statusType === 'active';

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-[#E5E9E7] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="bg-[#EEF9F7] text-[#168C82] p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <Icon size={24} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isOpen 
                        ? 'bg-[#EEF9F7] text-[#1B9A72] border border-[#1B9A72]/20' 
                        : 'bg-gray-100 text-[#667085] border border-gray-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-[#1B9A72] animate-pulse' : 'bg-gray-400'}`}></span>
                      {service.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#168C82] transition-colors mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-[#667085] leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Items handled */}
                  <div className="mb-6 space-y-1.5 bg-[#F8FBFA] p-3.5 rounded-xl border border-[#E5E9E7]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Common Requests:</span>
                    {service.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#172033]">
                        <CheckCircle2 size={13} className="text-[#168C82] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Queue Meta & Action */}
                <div>
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-[#E5E9E7] mb-5 text-xs text-[#667085]">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#168C82]" />
                      <span><strong>{service.queueCount}</strong> waiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#168C82]" />
                      <span>Est. <strong>{service.estWait}</strong></span>
                    </div>
                  </div>

                  <Link 
                    to={`/student/join-queue/${service.id}`}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      isOpen
                        ? 'bg-[#168C82] hover:bg-[#127A71] text-white shadow-sm hover:shadow'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <span>{isOpen ? 'Join Queue' : 'Queue Unavailable'}</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p className="text-center text-[11px] text-[#667085] mt-2">
                    No account required • Instant access
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How Campus Services Work Section */}
      <section className="py-20 bg-[#EEF9F7]/60 border-y border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#111827]">How Services Work with SmartQueue</h2>
            <p className="mt-3 text-base text-[#667085]">
              Seamless four-step digital workflow keeping you productive while waiting for campus services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Service',
                desc: 'Browse active departments and view real-time line sizes and wait estimates.'
              },
              {
                step: '02',
                title: 'Get Digital Token',
                desc: 'Receive an instant alphanumeric token with live order confirmation on your screen.'
              },
              {
                step: '03',
                title: 'Track From Anywhere',
                desc: 'Study in the library or grab coffee while monitoring your dynamic position.'
              },
              {
                step: '04',
                title: 'Counter Notification',
                desc: 'Head directly to the counter as soon as your token is announced and called.'
              }
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E9E7] shadow-sm relative">
                <span className="text-3xl font-black text-[#168C82]/20 mb-2 block">{step.step}</span>
                <h3 className="text-lg font-bold text-[#111827] mb-2">{step.title}</h3>
                <p className="text-sm text-[#667085] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
            Ready to Skip the Campus Lines?
          </h2>
          <p className="mt-4 text-lg text-[#667085] max-w-2xl mx-auto">
            Join queues instantly from any device — no login or account creation required for students.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/services">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Browse Campus Services
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

export default ServicesPage;
