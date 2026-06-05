import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Mr. Zulfiqar Ali Dahot",
    role: "Principal, GIBCE Khairpur Mir's",
    content: "Code Crafters entirely transformed how we run our campus at GIBCE. Their management system is highly efficient, robust, and the team provides excellent ongoing support.",
    rating: 5
  },
  {
    name: "Zeshan Ali",
    role: "Owner, Luxury Car Showroom",
    content: "We needed a premium custom digital solution for our luxury car showroom. Code Crafters delivered a stunning, high-performing platform that perfectly matches our brand requirements.",
    rating: 5
  },
  {
    name: "Ayesha Khan",
    role: "Director, Apex Grammar School",
    content: "The software provided by Code Crafters is phenomenal. The automated fee generation and attendance tracking have saved our administrative staff countless hours of manual work.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-navy-light/30 border-y border-white/5 relative overflow-hidden">
      <div className="absolute -left-1/4 top-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-electric/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Success Stories</h2>
           <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Trusted by Leading Clients</h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {TESTIMONIALS.map((t, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="bg-navy border border-white/10 rounded-3xl p-8 relative"
             >
               <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5" />
               <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
               </div>
               <p className="text-gray-300 italic mb-8 relative z-10 leading-relaxed text-sm lg:text-base">
                 "{t.content}"
               </p>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-electric flex items-center justify-center font-bold text-navy text-lg shadow-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{t.name}</h5>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
}
