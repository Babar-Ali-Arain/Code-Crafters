import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Linkedin, 
  Twitter, 
  Github, 
  Mail, 
  Award,
  ChevronRight
} from 'lucide-react';
import { TEAM_MEMBERS, TeamMember } from '../../lib/team-data';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ThreeBackground from '../layout/ThreeBackground';

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Leadership' | 'Engineering' | 'Design' | 'Strategy'>('All');
  
  // Smooth scroll to top when page is mounted
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredMembers = TEAM_MEMBERS.filter((m) => {
    if (activeTab === 'All') return true;
    return m.department === activeTab;
  });

  // Calculate statistics
  const totalSpecialists = TEAM_MEMBERS.length;
  const leadCount = TEAM_MEMBERS.filter(m => m.department === 'Leadership').length;
  const devCount = TEAM_MEMBERS.filter(m => m.department === 'Engineering').length;

  return (
    <div className="min-h-screen text-white font-sans selection:bg-electric/30 selection:text-white overflow-x-hidden relative bg-[#020617]">
      {/* Dynamic particles visual layer */}
      <ThreeBackground />
      <Navbar />

      {/* Atmospheric ambient lighting */}
      <div className="absolute top-20 left-1/4 w-[30rem] h-[30rem] bg-electric/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40rem] right-1/4 w-[30rem] h-[30rem] bg-golden/[0.012] rounded-full blur-[140px] pointer-events-none" />

      <main className="pt-32 pb-24 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 group text-xs font-mono tracking-widest text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO LANDING</span>
          </Link>
        </div>

        {/* Hero Segment */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/[0.04] pb-16">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-[10px] pb-1 font-mono uppercase tracking-[0.25em] text-electric">
              Roster & Architecture
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-white leading-none">
              The Architecture of <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent font-semibold">Success</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl pt-2">
              Meet our comprehensive roster of engineers, cloud operators, content designers, and public strategists syncing perfectly to author and scale high-availability digital solutions.
            </p>
          </div>

          {/* Quick stats panel */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-2 bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 backdrop-blur-md">
            <div className="text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.02]">
              <span className="block text-lg font-bold text-electric font-display">{totalSpecialists}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Members</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.02]">
              <span className="block text-lg font-bold text-golden font-display">{leadCount}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Officers</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.02]">
              <span className="block text-lg font-bold text-white font-display">{devCount}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Engineers</span>
            </div>
          </div>
        </div>

        {/* Category Filtering Tab Bar */}
        <div className="flex justify-center mb-16 select-none">
          <div className="flex flex-wrap justify-center gap-1.5 p-1 bg-white/[0.01] border border-white/[0.04] rounded-xl max-w-3xl backdrop-blur-md">
            {(['All', 'Leadership', 'Engineering', 'Design', 'Strategy'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 sm:px-5 py-2 rounded-lg text-[10px] sm:text-[11px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'text-navy font-bold shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{tab === 'All' ? 'ALL EXPERTS' : tab.toUpperCase()}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPillFull"
                      className="absolute inset-0 bg-electric rounded-lg z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Grid with filter support */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, idx) => (
              <motion.div
                layout
                key={member.name}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.35 }}
                className="bg-[#0b1329]/30 border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between relative group hover:border-white/15 hover:bg-[#0b1329]/60 transition-all duration-300"
              >
                <div>
                  {/* Image viewport */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-[#030712] relative border border-white/[0.04] mb-5">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-500 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=020617,0f172a&fontSize=33`;
                      }}
                    />
                    <div className="absolute top-3 right-3 text-[8px] font-mono tracking-widest text-[#cbd5e1] bg-white/[0.04] border border-white/[0.05] px-2.5 py-0.5 rounded uppercase backdrop-blur-md">
                      {member.department}
                    </div>
                  </div>

                  {/* Profile Identification */}
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-electric transition-colors duration-250 font-display">
                      {member.name}
                    </h3>
                    <p className="text-[10px] font-mono text-golden/80 uppercase tracking-wider mt-1">
                      {member.role}
                    </p>
                    
                    {/* Optional experience badge */}
                    {member.experience && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-gray-500 mt-2">
                        <Award className="w-3 h-3 text-electric/70" />
                        <span>Tenure: {member.experience}</span>
                      </span>
                    )}

                    {/* Bio */}
                    <p className="text-[#94a3b8] text-xs leading-relaxed mt-4 mb-4">
                      {member.bio}
                    </p>
                  </div>

                  {/* Skills Tag Line */}
                  <div className="mb-6 pt-3 border-t border-white/[0.03]">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="text-[9px] font-mono text-gray-400 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card footer block */}
                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between mt-auto">
                  <div className="flex gap-4">
                    {member.socials.linkedin && (
                      <a 
                        href={member.socials.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors duration-200"
                        title="LinkedIn ID"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.socials.twitter && (
                      <a 
                        href={member.socials.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors duration-200"
                        title="Twitter ID"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.socials.github && (
                      <a 
                        href={member.socials.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors duration-200"
                        title="Github ID"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.socials.email && (
                      <a 
                        href={`mailto:${member.socials.email}`} 
                        className="text-gray-500 hover:text-white transition-colors duration-200"
                        title="Direct Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">Verified • CC Profile</span>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Footer Navigation Back Option */}
        <div className="text-center pt-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.02] hover:bg-white hover:text-navy border border-white/10 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Office Entrance</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
