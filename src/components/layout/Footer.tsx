import { Code2, Linkedin, MessageCircle } from 'lucide-react';
import { COMPANY_NAME, COMPANY_TAGLINE, NAV_LINKS } from '../../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-6">
                <img src="/logo.jpeg" alt={COMPANY_NAME} className="w-10 h-10 object-contain rounded-lg border border-white/10" />
                <span className="font-display font-bold text-xl">{COMPANY_NAME}</span>
             </div>
             <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
               {COMPANY_TAGLINE} Providing state-of-the-art custom software, management systems and scalable digital platforms.
             </p>
          </div>

          <div>
             <h4 className="font-bold text-white mb-6">Quick Links</h4>
             <ul className="space-y-3">
               {NAV_LINKS.filter(l => l.label !== 'Home').map((link) => (
                 <li key={link.label}>
                   <a href={link.href} className="text-sm text-gray-400 hover:text-electric transition-colors">
                     {link.label}
                   </a>
                 </li>
               ))}
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-white mb-6">Socials</h4>
             <div className="flex gap-4">
                <a href="https://www.linkedin.com/company/126184214/admin/dashboard/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/50 transition-colors">
                   <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://whatsapp.com/channel/0029Vb7KDHS30LKWA4IM8N0c" target="_blank" rel="noopener noreferrer" title="WhatsApp Channel" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/50 transition-colors">
                   <MessageCircle className="w-4 h-4" />
                </a>
             </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs text-gray-500">
             &copy; {new Date().getFullYear()} {COMPANY_NAME} Technologies. All rights reserved.
           </p>
           <div className="flex gap-6 text-xs text-gray-500">
             <a href="#" className="hover:text-gray-300">Privacy Policy</a>
             <a href="#" className="hover:text-gray-300">Terms of Service</a>
           </div>
        </div>

      </div>
    </footer>
  );
}
