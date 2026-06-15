import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, COMPANY_NAME } from '../../lib/constants';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active section to highlight navigation links
      const scrollPosition = window.scrollY + 120;
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      
      let currentSection = '#home';
      for (const sectionId of sections) {
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

    window.addEventListener('scroll', handleScroll);
    // Initial call
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-4 md:p-6">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-out relative ${
          isScrolled 
            ? 'py-3 px-6 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),_0_0_20px_rgba(0,240,255,0.05)]' 
            : 'py-4 px-6 md:px-8 rounded-3xl border border-white/5'
        }`}
        style={{
          background: isScrolled 
            ? 'rgba(5, 11, 20, 0.75)' 
            : 'rgba(5, 11, 20, 0.35)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(12px)',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'blur(12px)'
        }}
      >
        <div className="flex justify-between items-center w-full">
          {/* Logo & Brand */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden rounded-full border border-white/10 group-hover:border-electric/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300">
              <img 
                src="/logo.jpeg" 
                alt={COMPANY_NAME} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-medium text-lg tracking-wider bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-electric transition-all duration-300">
              {COMPANY_NAME}
            </span>
          </a>

          {/* New Smooth Desktop Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <ul className="flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1 px-1.5 gap-0.5 backdrop-blur-md">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <li key={link.label} className="relative">
                    <a 
                      href={link.href} 
                      className={`relative z-10 block px-3 py-1.5 xl:px-4 xl:py-1.5 rounded-full text-[10px] xl:text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                        isActive ? 'text-navy font-bold' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </a>
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-electric rounded-full z-0 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Premium CTA Button */}
            <a 
              href="#contact" 
              className="relative text-[10px] xl:text-xs font-bold tracking-widest text-navy uppercase px-4 py-2.5 xl:px-6 xl:py-3 bg-electric hover:bg-white rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.55)] hover:scale-[1.03] active:scale-[0.98] overflow-hidden whitespace-nowrap"
            >
              Consultation
            </a>
          </div>

          {/* Responsive Mobile Nav Trigger Button */}
          <button 
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-electric/40 bg-white/[0.04] text-white active:scale-95 transition-all duration-200" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5 text-electric" /> : <Menu className="w-5 h-5 hover:text-electric transition-colors" />}
          </button>
        </div>

        {/* Floating Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-[calc(100%+0.75rem)] left-0 right-0 p-5 rounded-3xl border border-white/10 bg-navy/95 backdrop-blur-2xl flex flex-col gap-3 shadow-2xl lg:hidden overflow-hidden"
              style={{
                background: 'rgba(5, 11, 20, 0.93)',
              }}
            >
              {/* Subtle background ambient light elements inside the menu dropdown */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-electric/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-golden/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => {
                  const isActive = activeSection === link.href;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className={`px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold tracking-wide uppercase flex justify-between items-center ${
                        isActive
                          ? 'bg-electric/10 text-electric border-l-2 border-electric pl-3'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.label}</span>
                      {isActive && <div className="w-2 h-2 rounded-full bg-electric shadow-[0_0_8px_rgba(0,240,255,1)]" />}
                    </a>
                  );
                })}
                
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-electric to-electric-dark hover:from-white hover:to-white text-navy font-bold py-3.5 rounded-2xl text-center text-xs tracking-wider uppercase mt-4 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 active:scale-95"
                >
                  Book Consultation
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
