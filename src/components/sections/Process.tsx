import { motion } from 'motion/react';

const PROCESS_STEPS = [
  { step: '01', title: 'Requirement Discussion', desc: 'We analyze your school\'s specific needs and operational blockers.' },
  { step: '02', title: 'UI/UX Design', desc: 'Creating intuitive layouts ensuring staff and parents enjoy using the system.' },
  { step: '03', title: 'Development', desc: 'Secure coding using React, Next.js, and Firebase scalable architecture.' },
  { step: '04', title: 'Testing', desc: 'Rigorous security, speed, and usability testing before hand-off.' },
  { step: '05', title: 'Deployment', desc: 'Smooth launching to live servers with zero downtime for your operations.' },
  { step: '06', title: 'Support & Maintenance', desc: 'Continuous updates, staff training, and technical assistance.' },
];

export default function Process() {
  return (
    <section id="process" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">How We Work</h2>
           <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Our Client Process</h3>
           <p className="text-gray-400 text-lg">
             A streamlined, transparent development cycle to turn your vision into reality.
           </p>
        </div>

        <div className="relative">
          {/* Main timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent -translate-y-1/2" />

          <div className="grid lg:grid-cols-6 gap-8">
             {PROCESS_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex lg:flex-col items-start lg:items-center gap-6 lg:gap-4 lg:text-center"
                >
                  <div className="bg-navy border-2 border-electric text-electric w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10 shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                     {step.step}
                  </div>
                  
                  {/* Vertical line for mobile */}
                  {idx !== PROCESS_STEPS.length - 1 && (
                     <div className="lg:hidden absolute left-6 top-12 bottom-[-2rem] w-px bg-white/10" />
                  )}

                  <div>
                     <h4 className="text-white font-bold mb-2">{step.title}</h4>
                     <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>

      </div>
    </section>
  );
}
