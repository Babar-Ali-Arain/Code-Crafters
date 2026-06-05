import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_NAME, EMAIL, PHONE } from '../../lib/constants';

export default function Contact() {
  const [formState, setFormState] = useState('idle'); // idle, submitting, success

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 relative bg-navy-light/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Get In Touch</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Let's Digitize Your Institution</h3>
              <p className="text-gray-400 text-lg mb-8">
                Ready to upgrade your school's management? Reach out for a free consultation and personalized proposal.
              </p>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <Phone className="w-5 h-5 text-electric" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-400 mb-1">Call Us Directly</div>
                   <div className="text-white font-medium">{PHONE}</div>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <Mail className="w-5 h-5 text-electric" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-400 mb-1">Email Support</div>
                   <div className="text-white font-medium">{EMAIL}</div>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <MapPin className="w-5 h-5 text-electric" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-400 mb-1">Company Headquarters</div>
                   <div className="text-white font-medium">Khairpur Mir's</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-navy border border-white/10 rounded-3xl p-8 relative overflow-hidden"
          >
            {formState === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">Message Sent!</h4>
                <p className="text-gray-400">Thank you for reaching out. A {COMPANY_NAME} representative will contact you within 24 hours.</p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="mt-6 text-electric hover:underline text-sm font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Your Name</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">School Name</label>
                    <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" placeholder="Apex School" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Email Address</label>
                    <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Phone Number</label>
                    <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" placeholder="+92 300..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Package Selection</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors appearance-none">
                    <option className="bg-navy text-white">Undecided / Need Advice</option>
                    <option className="bg-navy text-white">Basic Package</option>
                    <option className="bg-navy text-white">Standard Package</option>
                    <option className="bg-navy text-white">Premium Package</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Project Requirements</label>
                  <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors resize-none" placeholder="Tell us about your current challenges..." />
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="submit" 
                    disabled={formState === 'submitting'}
                    className="w-full bg-electric text-navy font-bold rounded-lg py-4 hover:bg-electric-dark shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all flex justify-center items-center gap-2"
                  >
                    {formState === 'submitting' ? 'Sending...' : 'Request Proposal'}
                  </button>
                  <button 
                    type="button" 
                    className="w-full bg-white/5 text-white font-medium rounded-lg py-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    Book Consultation
                  </button>
                </div>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
