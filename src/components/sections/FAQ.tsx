import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: "How long does development take?", a: "A standard setup takes 1-2 weeks. Custom features or the Premium Package may take 3-4 weeks depending on specific requirement complexity." },
  { q: "Can the system manage thousands of users?", a: "Yes. Our architecture utilizes React and Firebase making it hyper-scalable. It effortlessly supports 10,000+ active users with no performance hit." },
  { q: "Is Firebase secure?", a: "Absolutely. Firebase is structurally backed by Google Cloud infrastructure. We employ rigid security rules protecting financial and user records." },
  { q: "Can documents and reports be customized?", a: "Yes! Any reports, invoices, or marksheets are fully customized matching your brand logo, specific logic, and brand colors before printing." },
  { q: "Is training provided?", a: "Yes, comprehensive training sessions for admins and staff are included in all packages." },
  { q: "Can we add new features later?", a: "Definitely. The software is modular. You can start with basic functionality and we can scale/add modules like QR tracking later." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
           <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Clarifications</h2>
           <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
           {FAQS.map((faq, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
             >
               <button
                 onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                 className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors focus:outline-none"
               >
                 <span className="font-medium text-white">{faq.q}</span>
                 <ChevronDown className={`w-5 h-5 text-electric transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
               </button>
               
               <AnimatePresence>
                 {openIndex === idx && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3 }}
                   >
                     <div className="px-6 pb-4 text-sm text-gray-400">
                       {faq.a}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
}
