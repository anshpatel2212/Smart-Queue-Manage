import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Code2, Database, Cpu, 
  GraduationCap, UserCheck, BarChart4, Compass
} from 'lucide-react';
import Button from '@/components/shared/Button';

const AboutPage = () => {
  const workflowSteps = [
    { step: '1', title: 'Student', desc: 'Opens SmartQueue portal on any browser' },
    { step: '2', title: 'Select Service', desc: 'Chooses department & specific service needed' },
    { step: '3', title: 'Get Token', desc: 'Generates instant verified digital ticket' },
    { step: '4', title: 'Track Queue', desc: 'Live position updates and smart wait countdown' },
    { step: '5', title: 'Visit Counter', desc: 'Approaches desk only when turn is called' },
    { step: '6', title: 'Complete Service', desc: 'Rapid 1-on-1 assistance with zero standing time' }
  ];

  const pillars = [
    {
      title: 'Students',
      icon: GraduationCap,
      description: 'Reclaim productive campus hours without line-standing anxiety.',
      points: [
        'Study or relax while keeping your spot in line',
        'Transparent estimated wait times updated in real time',
        'Instant alerts when your turn is approaching',
        'Full digital history of past campus requests'
      ]
    },
    {
      title: 'Staff Members',
      icon: UserCheck,
      description: 'Enjoy a calm, organized counter environment without crowded desks.',
      points: [
        'Single-click Next Token call and service timer',
        'Automatic routing to prevent counter overload',
        'Options to put on hold or skip absent attendees',
        'Personal daily throughput and service statistics'
      ]
    },
    {
      title: 'Campus Administrators',
      icon: BarChart4,
      description: 'Gain holistic visibility into campus service health and student satisfaction.',
      points: [
        'Live footfall metrics and department comparisons',
        'Identify peak rush hours and operational bottlenecks',
        'Dynamically re-assign counters during exam periods',
        'Exportable queue analytics for accreditation reports'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFA] text-[#172033]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-white border-b border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF9F7] text-[#168C82] text-xs sm:text-sm font-semibold mb-6"
          >
            <Compass size={16} />
            <span>Our Campus Mission</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Making Campus Services <span className="text-[#168C82]">Simpler & Smarter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[#667085] max-w-3xl mx-auto leading-relaxed"
          >
            SmartQueue was created to replace chaotic physical queues in university campuses with transparent, predictable, and dignified digital queuing for every student, faculty, and administrator.
          </motion.p>
        </div>
      </section>

      {/* Purpose / Core Concept Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#111827]">Why Modern Campuses Need SmartQueue</h2>
          <p className="mt-3 text-base text-[#667085]">
            Physical waiting lines waste thousands of academic hours each semester. We solve this problem through automated, transparent token management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: 'Reduce Physical Queues',
              desc: 'Empty overcrowded corridors, administration halls, and payment windows by shifting waiting queues to digital devices.'
            },
            {
              title: 'Reduce Waiting Times',
              desc: 'Algorithmic counter balancing and accurate pacing shave off up to 60% of idle time per student inquiry.'
            },
            {
              title: 'Improve Service Quality',
              desc: 'Provide staff with a dignified, orderly desk environment so they can dedicate focused attention to each student.'
            },
            {
              title: 'Real-Time Visibility',
              desc: 'Give students continuous awareness of their exact position, avoiding unnecessary inquiries and desk crowding.'
            },
            {
              title: 'Efficient Staff Operations',
              desc: 'Equip university officers with intuitive call buttons, hold states, and workload monitoring directly on their screens.'
            },
            {
              title: 'Actionable Campus Analytics',
              desc: 'Empower deans and department heads with verifiable records of service times, peak rush periods, and demand trends.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-7 rounded-2xl border border-[#E5E9E7] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EEF9F7] text-[#168C82] flex items-center justify-center font-bold mb-5">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">{item.title}</h3>
              <p className="text-sm text-[#667085] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How SmartQueue Works Section */}
      <section className="py-20 bg-[#EEF9F7]/70 border-y border-[#E5E9E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#168C82] bg-white px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#E5E9E7]">
              Step-by-Step Flow
            </span>
            <h2 className="text-3xl font-extrabold text-[#111827]">How SmartQueue Works</h2>
            <p className="mt-3 text-base text-[#667085]">
              A continuous, frictionless loop connecting students directly to active service counters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((ws, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E9E7] shadow-sm flex flex-col justify-between relative group hover:border-[#168C82] transition-colors">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#168C82] text-white flex items-center justify-center text-xs font-bold mb-3">
                    {ws.step}
                  </div>
                  <h3 className="text-base font-bold text-[#111827] mb-1">{ws.title}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">{ws.desc}</p>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white p-1 rounded-full border border-[#E5E9E7] text-[#168C82]">
                    <ArrowRight size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Smart Campuses (Students, Staff, Admin) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#111827]">Built for the Entire Campus Community</h2>
          <p className="mt-3 text-base text-[#667085]">
            Custom tailored experiences designed around the daily workflows of every university stakeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E9E7] p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#EEF9F7] text-[#168C82] flex items-center justify-center mb-6">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-3">{pillar.title}</h3>
                  <p className="text-sm text-[#667085] mb-6 leading-relaxed">{pillar.description}</p>
                  
                  <ul className="space-y-3">
                    {pillar.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#172033]">
                        <CheckCircle2 size={16} className="text-[#168C82] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E5E9E7]">
                  <Link 
                    to="/login"
                    className="text-sm font-semibold text-[#168C82] hover:text-[#127A71] flex items-center gap-1.5"
                  >
                    <span>View {pillar.title} View</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology Section (Current Frontend vs Future Backend/AI) */}
      <section className="py-20 bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#159A8C] bg-[#159A8C]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Architecture & Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Technology Stack & Future Integrations
            </h2>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">
              A transparent view of our current production frontend and the planned cloud backend integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Current Frontend */}
            <div className="bg-gray-800/60 border border-[#168C82]/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#168C82] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Active Frontend
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#168C82]/20 text-[#159A8C] flex items-center justify-center mb-6">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Frontend Application</h3>
              <div className="text-xs font-mono text-[#159A8C] mb-4">React 19 • Vite • Tailwind v4</div>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Full production-grade UI with client-side routing, Framer Motion animations, Recharts analytical dashboards, and realistic local mock state.
              </p>
              <div className="text-[11px] text-gray-400 bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                Status: <strong>Completed & Ready</strong> (Frontend-only build)
              </div>
            </div>

            {/* Future Backend */}
            <div className="bg-gray-800/40 border border-gray-700 p-8 rounded-2xl relative">
              <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Future Integration
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Backend & Database</h3>
              <div className="text-xs font-mono text-amber-400 mb-4">Firebase / Firestore / Auth</div>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Planned future integration for real-time WebSocket ticket updates, institutional Google OAuth, and persistent queue audit trails.
              </p>
              <div className="text-[11px] text-gray-500 bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                Notice: <strong>Not implemented in current release</strong>. Zero backend dependencies required.
              </div>
            </div>

            {/* Future AI */}
            <div className="bg-gray-800/40 border border-gray-700 p-8 rounded-2xl relative">
              <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Future Integration
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Campus AI Intelligence</h3>
              <div className="text-xs font-mono text-purple-400 mb-4">Google Gemini API</div>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Planned future integration for intelligent queue congestion forecasting, natural speech queries, and smart counter allocation.
              </p>
              <div className="text-[11px] text-gray-500 bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                Notice: Current AI Assistant utilizes <strong>client-side mock conversational state</strong> only.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
            Join the Smarter Campus Movement
          </h2>
          <p className="mt-4 text-lg text-[#667085] max-w-2xl mx-auto">
            Experience the complete frontend with interactive student, staff, and admin workflows.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Get Started
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
