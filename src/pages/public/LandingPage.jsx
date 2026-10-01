import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Ticket, Users, Clock, Activity, Search, QrCode, MapPin, 
  CheckCircle, FileText, Banknote, BookOpen, FileCheck, 
  CreditCard, Monitor, ArrowRight, Sparkles, GraduationCap,
  UserCheck, BarChart4
} from 'lucide-react';
import Button from '@/components/shared/Button';

const LandingPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-[#172033] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div 
              className="lg:w-1/2 flex flex-col items-start text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 text-[#168C82] text-xs sm:text-sm font-bold tracking-widest uppercase bg-[#EEF9F7] px-4 py-2 rounded-full border border-[#168C82]/20">
                  <Sparkles size={14} />
                  Smart Campus • Digital Queue
                </span>
              </motion.div>
              <motion.h1 
                variants={fadeUp} 
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-[#111827] tracking-tight"
              >
                A smarter way to manage <span className="text-[#168C82]">campus queues</span>
              </motion.h1>
              <motion.p 
                variants={fadeUp} 
                className="text-base sm:text-lg text-[#667085] max-w-2xl mb-8 leading-relaxed"
              >
                Skip the physical line. Get digital tokens, check live queue positions, and view estimated waiting times right from your personal device anywhere on campus.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Join a Queue <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            {/* Live Queue Preview Card */}
            <motion.div 
              className="lg:w-1/2 w-full max-w-xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-[#E5E9E7] p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#EEF9F7] rounded-bl-full -z-10"></div>
                
                <div className="flex justify-between items-start border-b border-[#E5E9E7] pb-5 mb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Live Campus Desk</span>
                    <h3 className="text-[#111827] font-extrabold text-xl sm:text-2xl mt-0.5">Finance Department</h3>
                    <p className="text-[#667085] text-xs">Counter 2 • Tuition Fee Settlement</p>
                  </div>
                  <div className="bg-[#EEF9F7] text-[#1B9A72] border border-[#1B9A72]/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#1B9A72] animate-pulse"></span> Active
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#F8FBFA] border border-[#E5E9E7] rounded-2xl p-4 text-center">
                    <p className="text-[#667085] text-xs font-medium mb-1">Now Serving</p>
                    <p className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">E-043</p>
                  </div>
                  <div className="bg-[#EEF9F7] border border-[#168C82]/20 rounded-2xl p-4 text-center">
                    <p className="text-[#168C82] text-xs font-medium mb-1">Your Token</p>
                    <p className="text-3xl sm:text-4xl font-black text-[#168C82] tracking-tight">E-047</p>
                  </div>
                </div>

                <div className="bg-[#F8FBFA] rounded-2xl p-4 border border-[#E5E9E7] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#168C82]" />
                      <span className="font-semibold text-[#111827]">4 People Ahead</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#667085]">
                      <Clock size={16} className="text-[#168C82]" />
                      <span>Est. Wait: <strong className="text-[#111827]">12 min</strong></span>
                    </div>
                  </div>

                  {/* Horizontal mini queue visual */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {['E-043', 'E-044', 'E-045', 'E-046', 'E-047'].map((t, idx) => (
                      <div 
                        key={t}
                        className={`flex-1 py-1 text-center rounded text-[10px] font-bold ${
                          idx === 0 
                            ? 'bg-[#168C82] text-white shadow-xs' 
                            : idx === 4 
                            ? 'bg-[#EEF9F7] text-[#168C82] border border-[#168C82]' 
                            : 'bg-white border border-[#E5E9E7] text-[#667085]'
                        }`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-white border-y border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#168C82] bg-[#EEF9F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
              Core Capabilities
            </span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight"
            >
              Everything you need for smart queue management
            </motion.h2>
            <p className="mt-4 text-base sm:text-lg text-[#667085]">
              Designed from the ground up to eliminate physical waiting and give every student peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Ticket, title: 'Digital Tokens', desc: 'Get instant digital tokens from your phone. No more paper tickets or physical lines.' },
              { icon: Users, title: 'Live Queue Position', desc: 'Track your real-time position in the queue from anywhere on campus.' },
              { icon: Clock, title: 'Smart Wait Estimate', desc: 'AI-powered waiting time predictions so you can plan your day.' },
              { icon: Activity, title: 'Real-Time Status', desc: 'Live updates on service counters, queue speed, and availability.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F8FBFA] rounded-2xl border border-[#E5E9E7] p-6 hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-[#EEF9F7] w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#168C82]">
                    <feat.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-[#168C82] hover:text-[#127A71] group">
              <span>Explore all 12 platform features</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-[#EEF9F7]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#168C82] bg-white px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#E5E9E7]">
              Four-Step Process
            </span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight"
            >
              How it works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-base sm:text-lg text-[#667085]"
            >
              Four simple steps to skip the wait completely.
            </motion.p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-[#168C82]/30 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: Search, title: 'Choose a Service', desc: 'Browse available campus services and pick the one you need.' },
                { icon: QrCode, title: 'Get Your Token', desc: 'Receive a digital token instantly on your mobile device.' },
                { icon: MapPin, title: 'Track Remotely', desc: 'Monitor your queue position in real-time from anywhere.' },
                { icon: CheckCircle, title: 'Get Served', desc: 'Visit the counter only when your turn approaches.' }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E5E9E7]"
                >
                  <div className="w-16 h-16 bg-[#168C82] text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-4 shadow-md relative">
                    <span className="absolute -top-2 -right-2 bg-[#111827] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-bold">
                      {i + 1}
                    </span>
                    <step.icon size={26} />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Campus Services Section */}
      <section id="services" className="py-20 sm:py-24 bg-white border-b border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#168C82] bg-[#EEF9F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
                Live Departments
              </span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight"
              >
                Campus services available
              </motion.h2>
              <p className="text-[#667085] text-sm sm:text-base mt-2">
                Join queues digitally across all major administrative and academic counters.
              </p>
            </div>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#168C82] hover:text-[#127A71] bg-[#EEF9F7] px-4 py-2 rounded-xl border border-[#168C82]/20 shrink-0"
            >
              <span>View All Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Examination', desc: 'Result verification, transcript requests, and exam queries.' },
              { icon: Banknote, title: 'Finance', desc: 'Fee payments, dues clearance, and scholarship processing.' },
              { icon: BookOpen, title: 'Library', desc: 'Book returns, fine payments, and membership issues.' },
              { icon: FileCheck, title: 'Certificates', desc: 'Bonafide certificates, degree collection, and NOCs.' },
              { icon: CreditCard, title: 'ID Card', desc: 'New ID card issuance and lost card replacements.' },
              { icon: Monitor, title: 'IT Support', desc: 'Campus Wi-Fi issues, email access, and software help.' }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#F8FBFA] border border-[#E5E9E7] rounded-2xl p-6 hover:shadow-md hover:border-[#168C82]/40 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="bg-[#EEF9F7] p-3 rounded-xl text-[#168C82] group-hover:bg-[#168C82] group-hover:text-white transition-colors duration-200">
                      <service.icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">{service.title}</h3>
                  </div>
                  <p className="text-sm text-[#667085] leading-relaxed mb-6">{service.desc}</p>
                </div>
                
                <div className="pt-4 border-t border-[#E5E9E7] flex items-center justify-between">
                  <Link 
                    to="/services" 
                    className="text-[#168C82] font-semibold hover:text-[#127A71] flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <span>View Service</span>
                    <ArrowRight size={14} />
                  </Link>
                  <span className="text-[11px] font-medium text-[#1B9A72] bg-[#EEF9F7] px-2 py-0.5 rounded-full">
                    Queue Ready
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Navy Stats Section */}
      <section className="py-20 sm:py-24 bg-[#111827] text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Built for modern campuses
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Scaling efficiently to serve thousands of university students daily with zero queue chaos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            {[
              { stat: '5000+', label: 'Students served daily' },
              { stat: '12', label: 'Campus departments' },
              { stat: '< 15 min', label: 'Average wait time' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center bg-gray-800/40 border border-gray-700/60 p-6 rounded-2xl"
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-[#159A8C] mb-2">{item.stat}</div>
                <div className="text-gray-300 text-sm sm:text-base font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section on Landing Page (Requirement 11) */}
      <section id="about" className="py-20 sm:py-24 bg-white border-b border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content Column */}
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#168C82] bg-[#EEF9F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
                About the Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-6 leading-tight">
                Built for the Modern Campus
              </h2>
              <p className="text-base text-[#667085] leading-relaxed mb-6">
                SmartQueue transforms the traditional, stressful campus line into an organized, digital waiting room. We connect students, staff officers, and university administrators through a unified real-time system.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF9F7] text-[#168C82] flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">For Students</h4>
                    <p className="text-xs sm:text-sm text-[#667085]">Spend waiting time studying or relaxing instead of standing in crowded hallways.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF9F7] text-[#168C82] flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">For Staff Officers</h4>
                    <p className="text-xs sm:text-sm text-[#667085]">1-click token call buttons, counter management, and predictable throughput.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF9F7] text-[#168C82] flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart4 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">For Administrators</h4>
                    <p className="text-xs sm:text-sm text-[#667085]">Comprehensive queue volume analytics, department benchmarking, and bottleneck alerts.</p>
                  </div>
                </div>
              </div>

              <Link to="/about">
                <Button variant="primary" size="md" className="shadow-sm">
                  Learn More About SmartQueue <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Right Mockup Column */}
            <motion.div 
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#F8FBFA] border border-[#E5E9E7] rounded-3xl p-6 sm:p-8 shadow-sm relative">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E9E7]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-mono text-[#667085]">smartqueue.campus.edu</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E5E9E7] flex justify-between items-center">
                    <div>
                      <p className="text-xs text-[#667085]">Examination Desk</p>
                      <p className="text-base font-bold text-[#111827]">Hall Ticket Revaluation</p>
                    </div>
                    <span className="text-xs font-bold text-[#1B9A72] bg-[#EEF9F7] px-2.5 py-1 rounded-full">
                      Counter 1 • Ready
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E5E9E7] flex justify-between items-center">
                    <div>
                      <p className="text-xs text-[#667085]">Finance Office</p>
                      <p className="text-base font-bold text-[#111827]">Scholarship Clearance</p>
                    </div>
                    <span className="text-xs font-bold text-[#168C82] bg-[#EEF9F7] px-2.5 py-1 rounded-full">
                      Counter 2 • 3 waiting
                    </span>
                  </div>

                  <div className="bg-[#EEF9F7] p-4 rounded-xl border border-[#168C82]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#168C82] text-white flex items-center justify-center font-bold text-sm">
                        E-47
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Your Digital Token</p>
                        <p className="text-xs text-[#168C82]">Arjun Mehta • STU001</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#111827]">~12 min wait</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-[#F8FBFA] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] mb-6 tracking-tight"
          >
            Ready to skip the queue?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-[#667085] mb-10 max-w-2xl mx-auto"
          >
            Join thousands of university students and staff already using SmartQueue.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Get Started Free
              </Button>
            </Link>
            <Link to="/services" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
