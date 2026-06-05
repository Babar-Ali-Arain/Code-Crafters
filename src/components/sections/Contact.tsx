import { Phone, Mail, MapPin } from 'lucide-react';
import { EMAIL, PHONE } from '../../lib/constants';

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative bg-navy-light/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Get In Touch</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Let's Digitize Your Organization</h3>
              <p className="text-gray-400 text-lg mb-8">
                Ready to upgrade your organization's management? Reach out for a free consultation and personalized proposal.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 text-left">
               <div className="flex flex-col items-center gap-4 text-center">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <Phone className="w-5 h-5 text-electric" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-400 mb-1">Call Us Directly</div>
                   <div className="text-white font-medium">{PHONE}</div>
                 </div>
               </div>
               
               <div className="flex flex-col items-center gap-4 text-center">
                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <Mail className="w-5 h-5 text-electric" />
                 </div>
                 <div>
                   <div className="text-xs text-gray-400 mb-1">Email Support</div>
                   <div className="text-white font-medium">{EMAIL}</div>
                 </div>
               </div>

               <div className="flex flex-col items-center gap-4 text-center">
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

        </div>
      </div>
    </section>
  );
}
