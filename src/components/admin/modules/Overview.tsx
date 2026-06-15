import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  CheckSquare, Layers, Users, PhoneCall, PieChartIcon, Activity, ShieldAlert,
  Briefcase, Star, Database, FileText, Calendar as CalendarIcon, Server, Hexagon
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 24 } }
};

interface OverviewProps {
  logs: any[];
  isAdmin: boolean;
}

export default function Overview({ logs, isAdmin }: OverviewProps) {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0, techStacks: {} as Record<string, number> },
    clients: 0,
    team: 0,
    inquiries: { total: 0, unread: 0 },
    blogs: 0,
    services: 0,
    testimonials: 0,
    meetings: 0,
    tasks: 0
  });

  useEffect(() => {
    // Dynamically track realtime collections based on user authorization scope
    const collectionsToTrack = ['projects', 'users', 'tasks'];
    if (isAdmin) {
      collectionsToTrack.push('clients', 'inquiries', 'blogs', 'services', 'testimonials', 'meetings');
    }

    const unsubs = collectionsToTrack.map(colName => {
      return onSnapshot(collection(db, colName), (snap) => {
        const total = snap.size;
        
        setStats(prev => {
          const next = { ...prev };
          if (colName === 'projects') {
            let active = 0, completed = 0;
            const tech: Record<string, number> = {};
            snap.forEach(docSnap => {
              const data = docSnap.data();
              if (data.projectStatus === 'in_progress' || data.projectStatus === 'pending') active++;
              if (data.projectStatus === 'completed') completed++;
              if (Array.isArray(data.technologies)) {
                data.technologies.forEach((t: string) => {
                   tech[t] = (tech[t] || 0) + 1;
                });
              }
            });
            next.projects = { total, active, completed, techStacks: tech };
          } else if (colName === 'clients') next.clients = total;
          else if (colName === 'users') next.team = total;
          else if (colName === 'inquiries') {
            let unread = 0;
            snap.forEach(docSnap => {
               if (docSnap.data().status === 'unread') unread++;
            });
            next.inquiries = { total, unread };
          }
          else if (colName === 'blogs') next.blogs = total;
          else if (colName === 'services') next.services = total;
          else if (colName === 'testimonials') next.testimonials = total;
          else if (colName === 'meetings') next.meetings = total;
          else if (colName === 'tasks') next.tasks = total;
          return next;
        });
      }, (err) => console.log(`Reading counts error for ${colName}`, err));
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [isAdmin]);

  // Derived Analytics Data
  const projectStatusData = [
    { name: 'Active & Pending', value: stats.projects.active, color: '#0FA484' },
    { name: 'Completed & Live', value: stats.projects.completed, color: '#0ea5e9' },
  ].filter(d => d.value > 0);

  if (projectStatusData.length === 0) {
    projectStatusData.push({ name: 'System Idle', value: 1, color: '#e2e8f0' });
  }

  // Parse highest frequency technologies from Firebase project entries
  const techStackData = Object.entries(stats.projects.techStacks)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 4)
    .map(([name, count]) => ({ name, Executions: count }));

  // Aggregate Firestore live Audit Logs for system activity trends chart
  const activityData = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    const past7Days = Array.from({length: 8}).map((_, i) => {
       const d = new Date();
       d.setDate(d.getDate() - (7 - i));
       return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    past7Days.forEach(d => countsByDate[d] = 0);

    logs.forEach(log => {
      if (log.timestamp?.seconds) {
         const d = new Date(log.timestamp.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         if (countsByDate[d] !== undefined) {
            countsByDate[d]++;
         }
      }
    });
    return past7Days.map(date => ({ date, Events: countsByDate[date] }));
  }, [logs]);

  const recentLogs = logs.slice(0, 6);

  // Dynamic Metrics mapped safely avoiding string-interpolated partial tailwind classes
  const metrics = [
    {
       title: "TOTAL PORTFOLIO", icon: <Briefcase className="w-4 h-4"/>, value: stats.projects.total,
       subtext: "Lifetime integrated ventures", textClass: "text-blue-500", bgClass: "bg-blue-50", glowClass: "bg-blue-400/20", borderClass: "hover:border-blue-200"
    },
    {
       title: "ACTIVE SPRINTS", icon: <Activity className="w-4 h-4"/>, value: stats.projects.active,
       subtext: "Currently under engineering", textClass: "text-emerald-600", bgClass: "bg-emerald-50", glowClass: "bg-emerald-400/20", borderClass: "hover:border-emerald-200"
    },
    {
       title: "CLIENT ROSTER", icon: <Users className="w-4 h-4"/>, value: stats.clients,
       subtext: "Registered distinct partners", textClass: "text-indigo-500", bgClass: "bg-indigo-50", glowClass: "bg-indigo-400/20", borderClass: "hover:border-indigo-200"
    },
    {
       title: "INQUIRIES DETECTED", icon: <PhoneCall className="w-4 h-4"/>, value: stats.inquiries.total,
       subtext: `${stats.inquiries.unread} await immediate responses`, textClass: "text-rose-500", bgClass: "bg-rose-50", glowClass: "bg-rose-400/20", borderClass: "hover:border-rose-200"
    },
    {
       title: "CALENDAR MEETINGS", icon: <CalendarIcon className="w-4 h-4"/>, value: stats.meetings,
       subtext: "Future bookings and calls", textClass: "text-amber-500", bgClass: "bg-amber-50", glowClass: "bg-amber-400/20", borderClass: "hover:border-amber-200"
    },
    {
       title: "TEAM DELEGATES", icon: <ShieldAlert className="w-4 h-4"/>, value: stats.team,
       subtext: "Authenticated user nodes", textClass: "text-slate-600", bgClass: "bg-slate-100", glowClass: "bg-slate-400/20", borderClass: "hover:border-slate-300"
    },
    {
       title: "ARTICLES & CMS", icon: <FileText className="w-4 h-4"/>, value: stats.blogs,
       subtext: "Published network resources", textClass: "text-cyan-500", bgClass: "bg-cyan-50", glowClass: "bg-cyan-400/20", borderClass: "hover:border-cyan-200"
    },
    {
       title: "CATALOG SERVICES", icon: <Layers className="w-4 h-4"/>, value: stats.services,
       subtext: "Listed operational blueprints", textClass: "text-fuchsia-500", bgClass: "bg-fuchsia-50", glowClass: "bg-fuchsia-400/20", borderClass: "hover:border-fuchsia-200"
    },
    {
       title: "ACTIVE TESTIMONIALS", icon: <Star className="w-4 h-4"/>, value: stats.testimonials,
       subtext: "Deployed client verdicts", textClass: "text-yellow-500", bgClass: "bg-yellow-50", glowClass: "bg-yellow-400/20", borderClass: "hover:border-yellow-200"
    },
    {
       title: "DATABASE AUDITS", icon: <Database className="w-4 h-4"/>, value: logs.length,
       subtext: "Recorded execution traces", textClass: "text-purple-500", bgClass: "bg-purple-50", glowClass: "bg-purple-400/20", borderClass: "hover:border-purple-200"
    }
  ];

  return (
    <div className="space-y-8 text-slate-800 font-sans min-h-screen pb-10">
      
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1"
      >
        <div>
          <h2 className="text-2xl font-display font-semibold tracking-wide text-slate-900">Live Infrastructure Analytics</h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-2xl">
            A comprehensive, fully synchronized operational perspective directly mapping the core Firebase database instances in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-mono text-emerald-700 shadow-sm shrink-0">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wider text-[10px]">ALL INSTANCES SYNCED</span>
        </div>
      </motion.div>

      {/* Modern Grid of Live Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        {metrics.map((m, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`p-4 sm:p-5 rounded-2xl border border-slate-150 bg-white ${m.borderClass} shadow-xs hover:shadow-xl hover:shadow-${m.textClass.split('text-')[1]}/10 transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer`}
          >
            {/* Ambient Radial Hover Glow */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${m.glowClass}`} />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-slate-400 text-[9px] sm:text-[10px] font-mono tracking-widest font-bold uppercase truncate pr-2">{m.title}</span>
              <div className={`w-8 h-8 shrink-0 rounded-full ${m.bgClass} flex items-center justify-center ${m.textClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {m.icon}
              </div>
            </div>
            
            <div className="space-y-1 relative z-10">
              <motion.h4 
                key={m.value} // Trigger animation on value change
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`text-2xl sm:text-3xl font-bold font-display leading-none tracking-tight ${m.textClass}`}
              >
                {m.value}
              </motion.h4>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] mt-1 pt-1 opacity-80">
                <span className="text-slate-500 truncate">{m.subtext}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Visual Analytics Sections */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        
        {/* Left Area Chart of Audit Activity Timeline */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl border border-slate-150 bg-white shadow-xs h-[380px] flex flex-col justify-between group hover:border-[#0FA484]/30 transition-colors">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0FA484]/10 rounded-lg text-[#0FA484]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">System Activity Velocity</h3>
                <p className="text-slate-500 text-[11px] mt-0.5 max-w-sm">Aggregated event volume strictly captured from Firestore Logs over the preceding week.</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0FA484" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0FA484" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f1f5f9', 
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                    color: '#1e293b'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Events" 
                  stroke="#0FA484" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Status Chart */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl border border-slate-150 bg-white shadow-xs h-[380px] flex flex-col justify-between group hover:border-slate-200 transition-colors">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Sprint Health</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Projects separated by phase.</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
               <PieChartIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-grow w-full flex items-center justify-center py-4 relative">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    borderColor: '#f1f5f9', 
                    color: '#1e293b',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Absolute Center Labels */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest pl-1">Total</span>
              <p className="text-3xl font-bold font-display text-slate-800 leading-none">{stats.projects.total}</p>
            </div>
          </div>

          {/* Dynamic Color Keys */}
          <div className="flex flex-col gap-2.5 pt-2">
            {projectStatusData.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-bold">{d.name}</span>
                </div>
                <span className="font-mono text-slate-500">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Insights Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        
        {/* Technologies Breakdown */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl border border-slate-150 bg-white shadow-xs flex flex-col justify-between min-h-[340px] group hover:border-[#0ea5e9]/30 transition-colors">
          <div className="pb-4 border-b border-slate-50 flex justify-between items-center">
            <div>
               <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Stack Utilization</h3>
               <p className="text-slate-500 text-[11px] mt-0.5">Most recurrent tech in deployed blueprints.</p>
            </div>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-500">
               <Hexagon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 w-full pt-4">
            {techStackData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={techStackData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px', 
                      borderColor: '#f1f5f9',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      color: '#1e293b'
                    }} 
                  />
                  <Bar dataKey="Executions" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                 <Hexagon className="w-10 h-10 mb-3" />
                 <span className="text-xs font-medium">No stack data identified</span>
               </div>
             )}
          </div>
        </div>

        {/* Realtime Action Audit logs */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl border border-slate-150 bg-white shadow-xs min-h-[340px] flex flex-col justify-between group hover:border-[#8b5cf6]/30 transition-colors">
          <div className="pb-4 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Immutable Audit Frame</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Database modification feed originating from authorized operators.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>LIVE FEED</span>
            </span>
          </div>

          <div className="flex-1 py-4 space-y-2.5">
            {recentLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-60 py-10">
                <ShieldAlert className="w-10 h-10 mb-3" />
                <p className="text-xs max-w-[200px]">No administrative actions recorded during this period.</p>
              </div>
            ) : (
              recentLogs.map((log, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={log.id} 
                  className="p-3.5 rounded-xl border border-slate-100 bg-[#f8fafc] hover:bg-white hover:shadow-xs hover:border-slate-200 transition-all flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-none mb-1">{log.action}</h5>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-xs">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold font-mono tracking-wider">{log.userEmail.split('@')[0]}</span>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium font-sans uppercase tracking-widest mt-0.5">
                      {log.timestamp?.seconds 
                        ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                        : 'Just now'}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </motion.div>

    </div>
  );
}
