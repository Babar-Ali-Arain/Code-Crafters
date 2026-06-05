import { motion } from 'motion/react';
import { 
  Users, CalendarCheck, CreditCard, Award, FileText, UserPlus, FileBarChart, PieChart 
} from 'lucide-react';

const CORE_FEATURES = [
  { title: "User / Student Records", icon: Users, desc: "Comprehensive profiles with history, info, and documents." },
  { title: "Attendance Tracking", icon: CalendarCheck, desc: "Daily biometric, QR, or manual attendance with automated alerts." },
  { title: "Financial Management", icon: CreditCard, desc: "Automated vouchers, online payment gateways, and ledger tracking." },
  { title: "Performance Management", icon: Award, desc: "Dynamic grading structures, weighted metrics, and term aggregation." },
  { title: "Report Generation", icon: FileText, desc: "Beautiful, printable reports/marksheets customized to your brand." },
  { title: "Staff Management", icon: UserPlus, desc: "Staff attendance, payroll integrations, and role allocations." },
  { title: "Online Onboarding", icon: Globe, desc: "Web portals for prospective users to apply and submit documents." },
  { title: "Reports & Analytics", icon: PieChart, desc: "Visual dashboards showing financial health and overall performance." },
];

// Resolving import for Globe used above. Add to standard lucide-react import.
import { Globe } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Core Modules</h2>
           <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Features Showcase</h3>
           <p className="text-gray-400 text-lg">
             Everything you need to successfully run and manage your organization in one unified platform.
           </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
           {CORE_FEATURES.map((feature, idx) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white/5 border border-white/5 rounded-2xl p-6 group hover:bg-white/10 transition-colors"
             >
               <feature.icon className="w-8 h-8 text-blue-400 mb-4 group-hover:text-electric transition-colors" />
               <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
               <p className="text-sm text-gray-400">{feature.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Interactive UI Mockup Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-navy-light border border-white/10 shadow-2xl overflow-hidden p-1 lg:p-4 max-w-5xl mx-auto"
        >
           {/* Mock Window Controls */}
           <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-t-2xl mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 text-xs text-gray-400 font-mono">admin.codecrafters.edu</div>
           </div>

           {/* Dashboard Content Mock */}
           <div className="grid md:grid-cols-3 gap-4 lg:gap-6 px-4 pb-4">
              {/* Card 1 */}
              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h5 className="font-bold text-white">Fee Collection Trends</h5>
                       <p className="text-xs text-gray-400">Current Academic Year</p>
                    </div>
                    <div className="px-3 py-1 bg-electric/10 text-electric text-xs font-bold rounded">Monthly</div>
                 </div>
                 {/* CSS Bar Chart */}
                 <div className="flex items-end h-40 gap-2 sm:gap-4">
                    {[40, 60, 30, 80, 50, 90, 75, 100].map((height, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-electric/40 rounded-t-sm relative transition-colors group" style={{ height: `${height}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-navy text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {height}k
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <h5 className="font-bold text-white mb-4">Recent Admissions</h5>
                 <div className="space-y-4">
                    {['Aisha Khan', 'Ali Ahmed', 'Sara Tariq', 'Zainab Noor'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-electric flex items-center justify-center text-xs font-bold text-navy">
                            {name.charAt(0)}
                         </div>
                         <div>
                            <div className="text-sm font-medium text-gray-200">{name}</div>
                            <div className="text-[10px] text-gray-400">Class {8 - i} • Just now</div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded transition-colors text-white">
                    View All
                 </button>
              </div>
           </div>
        </motion.div>

      </div>
    </section>
  );
}
