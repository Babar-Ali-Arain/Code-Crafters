import { useState, useEffect } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { NAV_LINKS, COMPANY_NAME } from '../../lib/constants';
import { motion } from 'motion/react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-navy/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <a href="#home" className="flex items-center gap-3 group">
          <img src="/logo.jpeg" alt={COMPANY_NAME} className="w-10 h-10 object-contain rounded-lg border border-white/10 group-hover:border-electric transition-colors" />
          <span className="font-display font-bold text-xl tracking-tight">{COMPANY_NAME}</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="bg-electric text-navy font-medium px-5 py-2.5 rounded-lg hover:bg-electric-dark transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Book Consultation
          </a>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-navy-light border-b border-white/10 p-4 md:hidden flex flex-col gap-4 shadow-xl"
        >
          {NAV_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="text-gray-300 hover:text-white py-2 block border-b border-white/5"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setIsOpen(false)} className="bg-electric text-navy font-medium px-5 py-3 rounded-lg text-center mt-2">
            Book Consultation
          </a>
        </motion.div>
      )}
    </nav>
  );
}
