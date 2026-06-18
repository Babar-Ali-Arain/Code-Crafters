import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ShieldAlert, Sparkles, User, LayoutDashboard, LogIn,
  Home, Info, Briefcase, Layers, Users, Workflow, Mail, ArrowRight,
  ShieldCheck, HelpCircle, PhoneCall, ChevronDown, Cpu, Globe, Smartphone, Cloud
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, COMPANY_NAME } from '../../lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './FirebaseProvider';

// Map of navigation items to beautiful corresponding icons for clean visual cues
const LINK_ICONS: Record<string, React.ReactNode> = {
  '#home': <Home className="w-3.5 h-3.5" />,
  '#about': <Info className="w-3.5 h-3.5" />,
  '/services': <Briefcase className="w-3.5 h-3.5" />,
  '#features': <Sparkles className="w-3.5 h-3.5" />,
  '#packages': <Layers className="w-3.5 h-3.5" />,
  '/team': <Users className="w-3.5 h-3.5" />,
  '#process': <Workflow className="w-3.5 h-3.5" />,
  '#contact': <Mail className="w-3.5 h-3.5" />,
};

const LINK_SUBTITLES: Record<string, string> = {
  '#home': 'Main Entrance',
  '#about': 'Our DNA & Story',
  '/services': 'Interactive Estimator',
  '#features': 'Premium Tech Capabilities',
  '#packages': 'Affordable Pricing Models',
  '/team': 'Meet the Engineers',
  '#process': 'How We Orchestrate',
  '#contact': 'Connect with Us Now',
};

export default function Navbar() {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const isHomepage = pathname === '/';

  // Smooth scroll support for router cross-navigation
  useEffect(() => {
    if (isHomepage && window.location.hash) {
      // Defer slightly to ensure page components are fully mounted
      const timer = setTimeout(() => {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, isHomepage]);

  // Handle active scroll highlighting & compact bar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      // Scroll highlighting is active ONLY on the homepage for local hash sections
      if (!isHomepage) return;

      const scrollPosition = window.scrollY + 140;
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      
      let currentSection = '#home';
      for (const sectionId of sections) {
        // Skip team and services hash since they have dedicated pages
        if (sectionId === 'services' || sectionId === 'team') continue;

        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = `#${sectionId}`;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Dedicated helper to check active visual states for both pages and scrolling sections
  const isLinkActive = (linkHref: string, label: string) => {
    if (label === 'Services') {
      return pathname === '/services';
    }
    if (label === 'Team') {
      return pathname === '/team';
    }
    return isHomepage && activeSection === linkHref;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-4 md:p-5 lg:p-6 opacity-100 transition-all duration-300">
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          className={`w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-out relative ${
            isScrolled 
              ? 'py-2.5 px-5 rounded-full border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),_0_0_30px_rgba(0,240,255,0.06)]' 
              : 'py-4 px-6 md:px-8 rounded-3xl border border-white/5 shadow-lg'
          }`}
          style={{
            background: isScrolled 
              ? 'linear-gradient(135deg, rgba(5, 11, 20, 0.82) 0%, rgba(3, 8, 16, 0.92) 100%)' 
              : 'linear-gradient(135deg, rgba(6, 13, 25, 0.45) 0%, rgba(5, 11, 20, 0.3) 100%)',
            backdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            WebkitBackdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)'
          }}
        >
          {/* Subtle neon glowing accent stripe across the top of scrolled navigation bar */}
          <div className={`absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent transition-opacity duration-500 pointer-events-none ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`} />

          <div className="flex justify-between items-center w-full bg-transparent">
            {/* Logo & Brand Identity */}
            <Link 
              to="/" 
              onClick={() => {
                if (isHomepage) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-full border border-white/10 bg-navy/80 group-hover:border-[#00F0FF]/50 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.35)] active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0">
                <img 
                  src="/logo.png" 
                  alt={COMPANY_NAME} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback visual signal in case local file logo is missing
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-[14px] font-display font-black text-electric select-none group-hover:animate-pulse">CC</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-medium text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-electric transition-all duration-300">
                  {COMPANY_NAME}
                </span>
                <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-mono tracking-widest text-[#00F0FF]/60 group-hover:text-white/60 transition-colors uppercase">
                  Digital Engineers
                </span>
              </div>
            </Link>

            {/* Premium Floating Center Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              <ul className="flex items-center bg-white/[0.02] border border-white/5 rounded-full p-1 gap-0.5 backdrop-blur-md">
                {NAV_LINKS.map((link) => {
                  const isServices = link.label === 'Services';
                  const isTeam = link.label === 'Team';
                  const linkPath = isServices ? '/services' : isTeam ? '/team' : link.href;
                  const isActive = isLinkActive(link.href, link.label);

                  return (
                    <li 
                      key={link.label} 
                      className="relative block"
                      onMouseEnter={() => {
                        if (isServices) setIsServicesDropdownOpen(true);
                      }}
                      onMouseLeave={() => {
                        if (isServices) setIsServicesDropdownOpen(false);
                      }}
                    >
                      {isServices || isTeam ? (
                        <Link 
                          to={linkPath} 
                          className={`relative z-10 flex items-center gap-1 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-[10px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? 'text-navy font-extrabold' 
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          <span>{link.label}</span>
                          {isServices && (
                            <motion.span
                              animate={{ rotate: isServicesDropdownOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block"
                            >
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </motion.span>
                          )}
                        </Link>
                      ) : isHomepage ? (
                        <a 
                          href={linkPath} 
                          className={`relative z-10 block px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-[10px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? 'text-navy font-extrabold' 
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link 
                          to={`/${linkPath}`} 
                          className="relative z-10 block px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-[10px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:text-white hover:bg-white/[0.03] text-slate-300"
                        >
                          {link.label}
                        </Link>
                      )}
                      
                      {/* Smooth Spring Active Indicator Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 bg-electric rounded-full z-0 shadow-[0_0_15px_rgba(0,240,255,0.45)]"
                          style={{ backgroundColor: '#00F0FF' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        />
                      )}

                      {/* Micro interaction Hover Dropdown Portal */}
                      {isServices && (
                        <AnimatePresence>
                          {isServicesDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 15, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[490px] bg-[#030712] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-3xl z-50 text-left pointer-events-auto"
                              style={{
                                background: 'linear-gradient(135deg, rgba(8, 15, 30, 0.97) 0%, rgba(3, 7, 18, 0.99) 100%)',
                              }}
                            >
                              <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
                              
                              <p className="text-[9px] font-mono tracking-widest text-[#00F0FF]/80 font-bold uppercase mb-3 mr-2 border-b border-white/[0.05] pb-1.5">
                                Featured Digital Capabilities
                              </p>

                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <Link
                                  to="/services"
                                  className="p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-2.5 group cursor-pointer"
                                  onClick={() => setIsServicesDropdownOpen(false)}
                                >
                                  <div className="p-1.5 rounded-lg bg-[#00F0FF]/15 text-electric shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                    <Cpu className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-100 group-hover:text-electric transition-colors">Portals & ERPs</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Advanced management portals with custom dashboards.</span>
                                  </div>
                                </Link>

                                <Link
                                  to="/services"
                                  className="p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-2.5 group cursor-pointer"
                                  onClick={() => setIsServicesDropdownOpen(false)}
                                >
                                  <div className="p-1.5 rounded-lg bg-[#00F0FF]/15 text-electric shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                    <Globe className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-100 group-hover:text-electric transition-colors">Website Engineering</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Hyper-optimized React and SEO custom layouts.</span>
                                  </div>
                                </Link>

                                <Link
                                  to="/services"
                                  className="p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-2.5 group cursor-pointer"
                                  onClick={() => setIsServicesDropdownOpen(false)}
                                >
                                  <div className="p-1.5 rounded-lg bg-[#00F0FF]/15 text-electric shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                    <Smartphone className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-100 group-hover:text-electric transition-colors">Mobile Applications</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Stateful native systems for iOS and Android.</span>
                                  </div>
                                </Link>

                                <Link
                                  to="/services"
                                  className="p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-2.5 group cursor-pointer"
                                  onClick={() => setIsServicesDropdownOpen(false)}
                                >
                                  <div className="p-1.5 rounded-lg bg-[#00F0FF]/15 text-electric shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                    <Cloud className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-100 group-hover:text-electric transition-colors">Cloud Deployments</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Secure serverless infrastructure with real-time Firestore.</span>
                                  </div>
                                </Link>
                              </div>

                              {/* Interactive Dropdown footer banner */}
                              <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                                <span className="text-slate-500">Fully Automated Timeline</span>
                                <Link
                                  to="/services"
                                  className="text-electric hover:text-white flex items-center gap-1 transition-colors font-bold"
                                  onClick={() => setIsServicesDropdownOpen(false)}
                                >
                                  Try Budget Configurator Tool
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>

                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Dynamic Authentication Session Gates with personalized details */}
              {user ? (
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full pl-3.5 pr-1 py-1 backdrop-blur-md">
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 font-semibold leading-none">Welcome back,</span>
                    <span className="text-[10px] text-white font-bold tracking-wide mt-0.5 max-w-[80px] truncate">
                      {profile?.name || user.email?.split('@')[0]}
                    </span>
                  </div>

                  {/* Dashboard Route Button */}
                  <Link 
                    to="/dashboard"
                    className="relative text-[10px] font-bold tracking-widest text-navy uppercase px-4 py-2 bg-[#00F0FF] hover:bg-white rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_22px_rgba(0,240,255,0.6)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden whitespace-nowrap flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Portal</span>
                  </Link>

                  {/* High fidelity round Avatar with state signal */}
                  <div 
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-8 h-8 rounded-full border border-white/20 hover:border-[#00F0FF]/55 overflow-hidden relative cursor-pointer active:scale-90 transition-all shadow-inner shrink-0"
                    title="Open administrative dashboard"
                  >
                    <img 
                      src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'Dev')}`} 
                      alt="User profile avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-navy shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="relative text-[10px] font-bold tracking-widest text-white uppercase px-5 py-2.5 bg-white/5 hover:bg-white hover:text-navy rounded-full border border-white/10 hover:border-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] overflow-hidden whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Touch & Trigger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {user && (
                <Link 
                  to="/dashboard"
                  className="w-9 h-9 rounded-full border-2 border-electric/40 overflow-hidden active:scale-90 transition-all flex items-center justify-center relative cursor-pointer shrink-0"
                  title="Administrative Console"
                >
                  <img 
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'Dev')}`} 
                    alt="Touch Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-navy rounded-full" />
                </Link>
              )}

              <button 
                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-electric/40 bg-white/[0.04] text-white active:scale-95 transition-all duration-200 cursor-pointer shrink-0" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-5 h-5 text-electric animate-[spin_0.3s_ease]" /> : <Menu className="w-5 h-5 hover:text-electric transition-colors" />}
              </button>
            </div>
          </div>

          {/* Elevated Glassmorphic Mobile Flyout Navigation Panel */}
          <AnimatePresence>
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 top-[100px] left-0 right-0 bottom-0 bg-transparent pointer-events-auto z-40"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute top-[calc(100%+0.65rem)] left-0 right-0 p-5 rounded-[28px] border border-white/10 bg-navy/98 backdrop-blur-3xl flex flex-col gap-3 shadow-2xl lg:hidden overflow-hidden pointer-events-auto z-50 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(3, 7, 18, 0.97) 0%, rgba(8, 15, 28, 0.99) 100%)',
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-1.5 font-sans">
                    <p className="text-[9px] font-mono tracking-widest text-[#00F0FF]/60 font-bold uppercase px-3 pb-1 border-b border-white/5 mb-1.5 text-left">
                      Main Navigation Directory
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                      {NAV_LINKS.map((link) => {
                        const isServices = link.label === 'Services';
                        const isTeam = link.label === 'Team';
                        const linkPath = isServices ? '/services' : isTeam ? '/team' : link.href;
                        const isActive = isLinkActive(link.href, link.label);

                        const linkIcon = LINK_ICONS[isServices ? '/services' : isTeam ? '/team' : link.href] || <HelpCircle className="w-3.5 h-3.5" />;
                        const linkSubtitle = LINK_SUBTITLES[isServices ? '/services' : isTeam ? '/team' : link.href] || 'Navigate here';

                        return isServices || isTeam ? (
                          <Link
                            key={link.label}
                            to={linkPath}
                            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-[#00F0FF]/10 border-electric/30 text-white shadow-[0_4px_15px_rgba(0,240,255,0.06)]'
                                : 'bg-white/[0.01] border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.03] hover:border-white/10'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl transition-all ${
                                isActive 
                                  ? 'bg-[#00F0FF]/15 text-electric' 
                                  : 'bg-white/[0.04] text-slate-400 group-hover:text-white'
                              }`}>
                                {linkIcon}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className={`text-xs font-bold ${isActive ? 'text-electric' : 'text-slate-200'}`}>
                                  {link.label}
                                </span>
                                <span className="text-[9px] text-slate-400 leading-none mt-1">
                                  {linkSubtitle}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isActive ? 'text-electric translate-x-px' : 'text-slate-600 group-hover:text-slate-400'
                            }`} />
                          </Link>
                        ) : isHomepage ? (
                          <a
                            key={link.label}
                            href={linkPath}
                            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-250 cursor-pointer ${
                              isActive
                                ? 'bg-electric/10 border-electric/30 text-white shadow-[0_4px_15px_rgba(0,240,255,0.06)]'
                                : 'bg-white/[0.01] border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.03] hover:border-white/10'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl transition-all ${
                                isActive 
                                  ? 'bg-[#00F0FF]/15 text-electric' 
                                  : 'bg-white/[0.04] text-slate-400 group-hover:text-white'
                              }`}>
                                {linkIcon}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className={`text-xs font-bold ${isActive ? 'text-electric' : 'text-slate-200'}`}>
                                  {link.label}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                                  {linkSubtitle}
                                </span>
                              </div>
                            </div>
                            
                            <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${
                              isActive ? 'text-electric translate-x-px opacity-100' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 opacity-50'
                            }`} />
                          </a>
                        ) : (
                          <Link
                            key={link.label}
                            to={`/${linkPath}`}
                            className="group flex items-center justify-between p-3 rounded-2xl border bg-white/[0.01] border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.03] hover:border-white/10 transition-all duration-200 cursor-pointer"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-white/[0.04] text-slate-400 group-hover:text-white transition-all">
                                {linkIcon}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                                  {link.label}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {linkSubtitle}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform duration-200" />
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* User profile details with CTA */}
                    {user ? (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3.5">
                        <div className="flex items-center gap-3 px-3">
                          <img 
                            src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || 'Dev')}`} 
                            alt="Mobile user card avatar" 
                            className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col text-left">
                            <span className="text-slate-400 text-[10px] font-medium leading-none">Logged In Account:</span>
                            <span className="text-xs font-bold text-white mt-1.5">{profile?.name || user.email}</span>
                          </div>
                          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="w-full bg-gradient-to-r from-[#00F0FF] to-cyan-500 hover:shadow-[0_4px_20px_rgba(0,240,255,0.4)] text-navy font-extrabold py-3.5 px-4 rounded-xl text-center text-xs tracking-widest uppercase transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Administrative portal</span>
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-white/10 hover:bg-white text-white hover:text-navy font-bold py-3.5 px-4 rounded-xl text-center text-xs tracking-widest uppercase mt-4 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Portal login panel</span>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>
    </>
  );
}
