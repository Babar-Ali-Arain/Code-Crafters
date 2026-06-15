import { useState, useEffect, SVGProps } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Code, 
  Target, 
  Eye, 
  Cpu, 
  Trophy, 
  Users, 
  Activity, 
  Compass,
  ArrowUpRight
} from 'lucide-react';

// Counter component for key metrics
function AboutCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * numericValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericValue, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const VALUES = [
  {
    title: "Innovation",
    desc: "Continuously exploring new technologies and creative solutions.",
    icon: Sparkles,
    gradient: "from-blue-500/10 to-electric/20",
    border: "group-hover:border-electric/30"
  },
  {
    title: "Excellence",
    desc: "Delivering high-quality work with attention to every detail.",
    icon: Award,
    gradient: "from-amber-500/10 to-golden/20",
    border: "group-hover:border-golden/30"
  },
  {
    title: "Integrity",
    desc: "Building trust through honesty, transparency, and reliability.",
    icon: ShieldCheck,
    gradient: "from-emerald-500/10 to-green-500/20",
    border: "group-hover:border-emerald-500/30"
  },
  {
    title: "Growth",
    desc: "Helping clients and communities achieve sustainable success.",
    icon: TrendingUp,
    gradient: "from-purple-500/10 to-indigo-500/20",
    border: "group-hover:border-indigo-500/30"
  }
];

const TIMELINE = [
  {
    year: "2025",
    title: "Code Crafters Founded",
    desc: "💡 Established with a bold vision to bridge the gap between creative code craft and scalable engineering, with a primary focus on custom enterprise software and elite educational platforms.",
    tag: "Launch"
  },
  {
    year: "2025",
    title: "First Professional Website Launched",
    desc: "🌐 Deployed robust modular responsive portals for our debut clients, setting a high standards in digital footprint execution and local design excellence.",
    tag: "Milestone"
  },
  {
    year: "2026",
    title: "Expanded Services & Team Growth",
    desc: "🚀 Onboarded top-stack engineers, content writers, and community managers to scale output and deliver elite digital transformation services to diverse industries.",
    tag: "Growth"
  },
  {
    year: "Future",
    title: "Global Digital Innovation Company",
    desc: "🌎 Expanding our reach globally, pioneering headless architecture, modern AI integrations, and cloud infrastructure modules that elevate user productivity.",
    tag: "Vision"
  }
];

const METRICS = [
  { label: "Projects Completed", value: "50+", suffix: "Elite Deliveries", icon: Trophy, color: "text-[#00E5FF]", glow: "rgba(0, 229, 255, 0.15)" },
  { label: "Happy Clients", value: "25+", suffix: "Global Partnerships", icon: Users, color: "text-amber-400", glow: "rgba(251, 191, 36, 0.15)" },
  { label: "Lines of Code Written", value: "100000+", suffix: "Clean TypeScript", icon: Code, color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.15)" },
  { label: "Client Satisfaction", value: "98%", suffix: "NPS Rating Score", icon: Activity, color: "text-emerald-400", glow: "rgba(52, 211, 153, 0.15)" },
];

export default function About() {
  const [activeMilestone, setActiveMilestone] = useState(0);

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#030712] border-t border-white/5">
      {/* Abstract Grid + Ambient Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-electric/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-golden/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        
        {/* ==================== 1. HEADER ==================== */}
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/10 border border-electric/20 text-electric text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Code Crafters</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-none">
              Turning Vision Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-golden font-semibold">
                Digital Reality
              </span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed font-light font-sans max-w-2xl">
              Code Crafters is a modern software company dedicated to building innovative digital solutions that help businesses, schools, startups, and organizations succeed in the digital world. We engineer with clean code and design with human connection.
            </p>
          </motion.div>
        </div>

        {/* ==================== 2. COMPANY STORY & MISSION/VISION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Main Story Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-white/10 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-electric/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <span className="text-xs font-bold text-golden uppercase tracking-widest block">Our Narrative Story</span>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">Who We Are</h3>
              <p className="text-gray-300 text-base leading-relaxed font-light font-sans">
                Code Crafters is a passionate team of developers, designers, and digital innovators committed to transforming complex ideas into powerful, streamlined digital products. 
              </p>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                We combine creative artistry, highly scalable target endpoints, and long-term strategic execution to build custom systems that solve real-world operational bottlenecks. From interactive customer-facing interfaces to complex cloud database backends, we elevate how modern institutes manage and communicate their core metrics.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-gray-500 relative z-10">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-electric" /> Agile Methodologies</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-electric" /> Strict Scalability</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-electric" /> Human Experience</span>
            </div>
          </motion.div>

          {/* Mission & Vision Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-electric/20 backdrop-blur-md relative overflow-hidden group flex-1 flex flex-col justify-between transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric/5 rounded-full blur-2xl group-hover:bg-electric/15 transition-all" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-electric/10 flex items-center justify-center text-electric">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-white font-display">Our Mission</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  To empower businesses and organizations through innovative technology solutions that improve operational efficiency, accelerate enterprise growth, and deliver flawless user experiences.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-golden/20 backdrop-blur-md relative overflow-hidden group flex-1 flex flex-col justify-between transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-golden/[0.02] rounded-full blur-2xl group-hover:bg-golden/10 transition-all" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-golden/10 flex items-center justify-center text-golden">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-white font-display">Our Vision</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  To become a globally recognized software company celebrated for software delivery excellence, continuous interface innovation, and engineering transformative cloud-native digital ecosystems.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ==================== 3. ANIME METRICS GRID ==================== */}
        <div className="p-1 rounded-3xl bg-gradient-to-r from-white/5 via-white/[0.02] to-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[#070d1e] mix-blend-multiply" />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5 bg-navy-light/40 backdrop-blur-2xl">
            {METRICS.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] text-gray-400 group-hover:text-white transition-colors">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">0{i+1}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight flex items-baseline gap-1">
                    <AboutCounter value={metric.value} />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-300 font-sans tracking-wide">
                    {metric.label}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-sans">
                    {metric.suffix}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==================== 4. CORE VALUES ==================== */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xs font-bold text-electric uppercase tracking-widest">Our Execution Pillars</h3>
            <h4 className="text-2xl sm:text-3xl font-display font-medium text-white">Values That Guide Our Craft</h4>
            <p className="text-sm text-gray-400">These core operating principles guide our strategies, coding style, and collaborative client partnerships.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent group-hover:${val.border.replace('group-hover:border', 'from')} hover:to-[#00f5ff]/20 transition-all`} />

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-white flex items-center justify-center relative overflow-hidden group-hover:text-electric transition-colors">
                    <div className={`absolute inset-0 bg-gradient-to-br ${val.gradient} opacity-50`} />
                    <val.icon className="w-4.5 h-4.5 relative z-10" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-base font-display">{val.title}</h5>
                    <p className="text-gray-400 text-xs mt-1.5 leading-relaxed font-sans font-light">
                      {val.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase group-hover:text-white transition-colors">
                  <span>Commitment</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==================== 5. INTERACTIVE TIMELINE ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-golden uppercase tracking-widest block">Company Timeline</span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-white leading-tight">Our Pathway</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-sans font-light">
                Explore the chronological milestones of Code Crafters. From humble beginnings to our forward-looking global perspective, track our velocity in technology execution.
              </p>
            </div>

            {/* Quick Interactive Timeline Tabs Selector */}
            <div className="flex flex-col gap-2">
              {TIMELINE.map((step, idx) => (
                <button
                  key={step.title}
                  onClick={() => setActiveMilestone(idx)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between text-xs font-semibold ${
                    activeMilestone === idx
                      ? 'bg-electric/10 border-electric text-electric shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : 'bg-white/[0.01] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <span>{step.year} — {step.title}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                    activeMilestone === idx ? 'bg-electric/20 text-electric' : 'bg-white/5 text-gray-500'
                  }`}>{step.tag}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 p-1.5 rounded-3xl border border-white/10 bg-[#080e1b] relative overflow-hidden aspect-[1.8] flex flex-col justify-between">
            {/* Top Bar Decoration */}
            <div className="flex items-center justify-between border-b border-white/5 p-4 bg-navy-light/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                <span className="text-[10px] text-gray-500 font-mono ml-2">milestone-terminal.sh</span>
              </div>
              <Compass className="w-4 h-4 text-gray-600 animate-spin-slow" />
            </div>

            {/* Card Content display with transitions */}
            <div className="flex-grow p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMilestone}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-5xl font-bold font-display text-electric">
                      {TIMELINE[activeMilestone].year}
                    </span>
                    <div className="h-6 w-px bg-white/20 mx-1" />
                    <span className="text-xs font-bold text-golden uppercase tracking-wider px-2 py-0.5 bg-golden/10 rounded">
                      {TIMELINE[activeMilestone].tag}
                    </span>
                  </div>

                  <h4 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {TIMELINE[activeMilestone].title}
                  </h4>

                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans font-light">
                    {TIMELINE[activeMilestone].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Grid indicators */}
            <div className="border-t border-white/5 p-4 bg-navy-light/30 flex justify-between items-center text-xs text-gray-500">
              <span>ACTIVE RECORD: {activeMilestone + 1} OF {TIMELINE.length}</span>
              <div className="flex gap-1.5">
                {TIMELINE.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMilestone(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeMilestone === idx ? 'bg-electric w-7 shadow-[0_0_8px_rgba(0,240,255,1)]' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ==================== 6. WHY WE EXIST STATEMENT BLOCK ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] border border-white/10 overflow-hidden"
        >
          {/* Neon side accent glows */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-electric via-green-400 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-electric/5 via-transparent to-golden/[0.03] pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="p-8 sm:p-12 lg:p-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-navy-light/25">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-electric uppercase tracking-widest block">Designed with Intention</span>
              <h4 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white leading-tight">
                Technology Should Empower, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white font-semibold">
                  Not Complicate
                </span>
              </h4>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans font-light">
                At Code Crafters, we believe technology should simplify workflows, solve operational friction, and unlock new growth opportunities. Every program we compile, design block we test, and module we deploy is designed with purpose, performance, and real people in mind.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <a
                href="#contact"
                className="relative group overflow-hidden bg-white text-navy font-bold px-8 py-4 rounded-full transition-all duration-300 hover:bg-electric hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2 text-xs uppercase tracking-widest"
              >
                <span>Initiate Consult</span>
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function CheckCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
