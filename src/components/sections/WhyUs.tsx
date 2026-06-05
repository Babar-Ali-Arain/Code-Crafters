import { motion } from 'motion/react';
import { ShieldCheck, Zap, Laptop, Smartphone, Maximize, DollarSign, Headset, Code } from 'lucide-react';

const REASONS = [
  { icon: ShieldCheck, title: 'Secure Firebase Backend', desc: 'Google-grade security protecting sensitive student and financial data.' },
  { icon: Zap, title: 'Fast Performance', desc: 'Optimized React single-page applications providing instant load times.' },
  { icon: Laptop, title: 'Modern User Experience', desc: 'Microsoft Store inspired clean glassmorphism UI for ease of use.' },
  { icon: Smartphone, title: 'Mobile Friendly', desc: 'Fully responsive designs covering desktop, tablet, and mobile displays.' },
  { icon: Maximize, title: 'Scalable Architecture', desc: 'Systems built to handle 100 to 100,000+ students effortlessly.' },
  { icon: DollarSign, title: 'Affordable Pricing', desc: 'High-end corporate software without the enterprise price tag.' },
  { icon: Headset, title: 'Professional Support', desc: 'Dedicated account managers providing rapid issue resolution.' },
  { icon: Code, title: 'Custom Development', desc: 'Tailored features specifically built to match your unique school workflows.' },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-navy-light/50 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">The Code Crafters Advantage</h2>
           <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Why Choose Us</h3>
           <p className="text-gray-400 text-lg">
             We don't just build software. We engineer scalable operational success for your school.
           </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-navy border border-white/10 p-6 rounded-2xl hover:border-electric/40 hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:text-electric transition-colors">
                <reason.icon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{reason.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
