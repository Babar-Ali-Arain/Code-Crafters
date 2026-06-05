import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Globe, 
  Smartphone, 
  Layout, 
  Palette, 
  PenTool, 
  Database, 
  Cloud 
} from 'lucide-react';

const SERVICES = [
  { icon: GraduationCap, title: 'Management Systems', desc: 'End-to-end management software tailored for modern organizations & schools.' },
  { icon: Globe, title: 'Website Development', desc: 'Premium, high-converting websites for your brand or institution.' },
  { icon: Smartphone, title: 'Mobile App Development', desc: 'Cross-platform mobile applications serving your key users efficiently.' },
  { icon: Layout, title: 'Admin Dashboards', desc: 'Centralized admin controls with deep analytics.' },
  { icon: Palette, title: 'UI/UX Design', desc: 'Beautiful, intuitive user interfaces for maximum usability.' },
  { icon: PenTool, title: 'Graphic Design', desc: 'Branding, ID cards, and marketing materials.' },
  { icon: Database, title: 'Firebase Integration', desc: 'Secure, real-time database architecture and auth.' },
  { icon: Cloud, title: 'Cloud Solutions', desc: 'Scalable infrastructure ensuring 99.9% uptime.' },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Our Services</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Comprehensive Digital Solutions</h3>
          <p className="text-gray-400 text-lg">
            We provide everything your organization needs to thrive in the digital age.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-navy-light/50 border border-white/5 hover:border-electric/50 p-6 rounded-2xl group transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-electric/10 group-hover:text-electric transition-colors">
                <service.icon className="w-6 h-6 text-gray-300 group-hover:text-electric" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
