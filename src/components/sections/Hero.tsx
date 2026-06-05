import { motion } from 'motion/react';
import { ArrowRight, MonitorSmartphone, LayoutDashboard } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Modern SaaS for Business & Education</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-tight">
            Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-golden">Business & School</span> with Smart Digital Solutions
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            Code Crafters develops modern Custom Software, Management Systems, and Digital Solutions that simplify administration, operations, workflow, and communication.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
            <a href="#contact" className="w-full sm:w-auto justify-center bg-electric text-navy px-8 py-4 rounded-xl font-medium hover:bg-electric-dark hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
              Get Free Consultation
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#contact" className="w-full sm:w-auto text-center justify-center bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors">
              Request a Demo
            </a>
          </div>
        </motion.div>

        {/* Dashboard Mockup SVG/CSS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl bg-navy-light border border-white/10 shadow-2xl p-2 z-10 overflow-hidden group">
            {/* Mockup Header */}
            <div className="flex items-center gap-2 p-2 border-b border-white/5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            
            {/* Mockup Content */}
            <div className="grid grid-cols-4 gap-4 p-4">
               {/* Sidebar */}
               <div className="col-span-1 border-r border-white/5 pr-4 space-y-4 hidden sm:block">
                  <div className="h-4 w-20 bg-white/10 rounded" />
                  <div className="h-8 bg-blue-500/20 border border-blue-500/30 rounded flex items-center px-2 gap-2">
                    <LayoutDashboard className="w-4 h-4 text-electric" />
                    <div className="h-2 w-12 bg-white/20 rounded" />
                  </div>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-8 bg-white/5 rounded flex items-center px-2 gap-2">
                      <div className="w-4 h-4 rounded bg-white/10" />
                      <div className="h-2 w-16 bg-white/10 rounded" />
                    </div>
                  ))}
               </div>

               {/* Main Content Area */}
               <div className="col-span-4 sm:col-span-3 space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { l: 'Total Active Users', v: '12,240', c: 'from-blue-500/20 to-blue-500/5' },
                      { l: 'Engagement', v: '94%', c: 'from-electric/20 to-electric/5' },
                      { l: 'Revenue Processed', v: 'PKR 24M', c: 'from-purple-500/20 to-purple-500/5' }
                    ].map((stat, i) => (
                      <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${stat.c} border border-white/5`}>
                        <div className="text-[10px] sm:text-xs text-gray-400 mb-1">{stat.l}</div>
                        <div className="text-lg sm:text-xl font-bold text-white">{stat.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="h-32 sm:h-40 rounded-xl bg-white/5 border border-white/5 p-4 relative overflow-hidden">
                     <div className="h-2 w-24 bg-white/10 rounded mb-4" />
                     {/* Fake graph lines */}
                     <svg className="w-full h-full absolute bottom-0 left-0 preserve-3d" viewBox="0 0 100 40" preserveAspectRatio="none">
                       <path d="M0,40 Q10,30 20,35 T40,25 T60,20 T80,10 T100,5 L100,40 Z" fill="rgba(0, 240, 255, 0.1)" />
                       <path d="M0,40 Q10,30 20,35 T40,25 T60,20 T80,10 T100,5" fill="none" stroke="#00F0FF" strokeWidth="1" />
                     </svg>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 top-1/4 bg-navy/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-xl z-20 flex items-center gap-3"
          >
            <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
               <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Status</div>
              <div className="text-sm font-bold text-white">Fully Responsive</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
