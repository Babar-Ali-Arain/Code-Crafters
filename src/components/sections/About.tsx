import { motion } from 'motion/react';
import { Target, Users, Zap, CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: "50+", label: "Projects Completed", icon: Zap },
  { value: "30+", label: "Clients Served", icon: Target },
  { value: "25k+", label: "Users Managed", icon: Users },
  { value: "99%", label: "Client Satisfaction", icon: CheckCircle2 },
];

export default function About() {
  return (
    <section id="about" className="py-24 relative border-t border-white/5 bg-navy-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-sm font-bold tracking-widest text-electric uppercase">Who We Are</h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold">Empowering Businesses & Education Through Technology</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Code Crafters is a software development company providing custom web applications, management systems, websites, mobile applications, graphic design, and digital transformation solutions. 
              <br/><br/>
              We successfully help businesses and educational institutions modernize their operations through secure, scalable, and intuitive technology.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STATS.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/10 transition-colors"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-electric/10 rounded-full blur-2xl group-hover:bg-electric/20 transition-colors" />
                <stat.icon className="w-8 h-8 text-electric mb-4" />
                <h4 className="text-3xl font-display font-bold text-white mb-1">{stat.value}</h4>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
