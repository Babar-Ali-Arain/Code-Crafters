import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  CheckSquare, Layers, Users, PhoneCall, PieChartIcon, Activity, ShieldAlert,
  Briefcase, Star, Database, FileText, Calendar as CalendarIcon, Server, Hexagon,
  Clock, TrendingUp, Minus
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
  const [time, setTime] = useState('');
  
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
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    return () => clearInterval(timer);
  }, []);

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

  // Group metrics conceptually
  const primaryMetrics = [
    {
       title: "TOTAL USERS", icon: <Users className="w-5 h-5"/>, value: stats.team,
       subtext: `+ ${stats.clients} Partners`, textClass: "text-[#3B82F6]", bgClass: "bg-blue-50", 
       trend: "+12%", trendColor: "text-emerald-600 bg-emerald-50", trendIcon: <TrendingUp className="w-3 h-3"/>
    },
    {
       title: "ACTIVE USERS", icon: <Activity className="w-5 h-5"/>, value: stats.projects.active,
       subtext: "Presently engaging", textClass: "text-emerald-500", bgClass: "bg-emerald-50", 
       trend: "+5%", trendColor: "text-emerald-600 bg-emerald-50", trendIcon: <TrendingUp className="w-3 h-3"/>
    },
    {
       title: "TOTAL COURSES", icon: <FileText className="w-5 h-5"/>, value: stats.blogs,
       subtext: "Published network lessons", textClass: "text-[#a855f7]", bgClass: "bg-purple-50", 
       trend: "0%", trendColor: "text-slate-500 bg-slate-50", trendIcon: <Minus className="w-3 h-3"/>
    },
    {
       title: "ANNOUNCEMENTS", icon: <FileText className="w-5 h-5"/>, value: stats.inquiries.total,
       subtext: `${stats.inquiries.unread} unread remaining`, textClass: "text-orange-500", bgClass: "bg-orange-50",
       trend: "+3%", trendColor: "text-emerald-600 bg-emerald-50", trendIcon: <TrendingUp className="w-3 h-3"/>
    }
  ];

  const secondaryMetrics = [
    { title: "ENROLLMENTS", icon: <CheckSquare className="w-6 h-6"/>, value: stats.projects.completed, colorClass: "text-emerald-500", bgClass: "bg-emerald-50" },
    { title: "MARKSHEET", icon: <FileText className="w-6 h-6"/>, value: stats.testimonials, colorClass: "text-blue-500", bgClass: "bg-blue-50" },
    { title: "ANNOUNCEMENTS", icon: <PhoneCall className="w-6 h-6"/>, value: stats.inquiries.total, colorClass: "text-orange-500", bgClass: "bg-orange-50" },
    { title: "USERS", icon: <Users className="w-6 h-6"/>, value: stats.team, colorClass: "text-rose-500", bgClass: "bg-rose-50" },
    { title: "TIMETABLE", icon: <Clock className="w-6 h-6"/>, value: stats.meetings, colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
    { title: "REPORTS", icon: <Database className="w-6 h-6"/>, value: logs.length, colorClass: "text-red-500", bgClass: "bg-red-50" }
  ];

  return (
    <div className="space-y-6 text-slate-800 font-sans min-h-screen pb-10">
      
      {/* Dynamic Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#151a2d] rounded-[36px] p-8 md:p-14 relative overflow-hidden flex flex-col justify-between"
      >
        {/* Subtle gradient blob right side */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#2a3044]/50 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-10">
          <div className="flex-1">
            <div className="px-3.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/70 uppercase font-semibold inline-flex items-center gap-2 mb-8 shadow-sm">
              <div className="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              System Operational
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Welcome back,<br/>
              <span className="text-[#6366f1]">Administrator</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-5 max-w-sm leading-relaxed">
              Monitor your platform's growth, manage users, and oversee content all from one centralized hub. Everything is running smoothly today.
            </p>
          </div>
          
          <div className="flex flex-shrink-0 flex-col sm:flex-row gap-4">
            {/* Server Time card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-[14px] bg-[#312e81]/40 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SERVER TIME</p>
                <p className="text-white font-mono font-bold text-lg tracking-tight">
                  {time}
                </p>
              </div>
            </div>
            
            {/* Security Status card */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-[14px] bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SECURITY STATUS</p>
                <p className="text-emerald-400 font-bold text-sm tracking-wide">Protected</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Grid of Primary Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        {primaryMetrics.map((m, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className={`bg-white rounded-[32px] p-6 sm:p-7 pt-8 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/60 flex flex-col justify-between h-[210px] group transition-all duration-300`}
          >
            {/* Top right decorative quarter circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8fafc] rounded-bl-[100px] pointer-events-none z-0 transition-colors duration-500 group-hover:bg-slate-100/50" />
            
            <div className="flex justify-between items-start relative z-10 w-full mb-6">
              <div className={`w-12 h-12 rounded-2xl ${m.bgClass} flex items-center justify-center ${m.textClass} shadow-sm group-hover:scale-105 transition-transform`}>
                {m.icon}
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 ${m.trendColor} rounded-full text-[10px] font-bold shadow-sm`}>
                 {m.trendIcon}
                 {m.trend}
              </div>
            </div>

            <div className="relative z-10 w-full flex-grow flex flex-col justify-end pb-1 text-left">
              <h3 className="text-[38px] font-bold font-display text-[#1e293b] leading-none tracking-tight">{m.value}</h3>
              <p className="text-[10px] font-bold text-[#94a3b8] mt-2 tracking-widest uppercase">{m.title}</p>
            </div>

            <div className="relative z-10 w-full mt-2 lg:mt-3 border-t border-slate-50 pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
               <p className={`text-[11px] font-semibold ${m.textClass}`}>{m.subtext}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modern Grid of Secondary Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8"
      >
        {secondaryMetrics.map((m, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="bg-white rounded-3xl p-5 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/60 flex flex-col items-center justify-center gap-4 group hover:border-[#6366f1]/20 transition-all duration-300 h-[150px] cursor-pointer hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-2xl ${m.bgClass} flex items-center justify-center ${m.colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
               {m.icon}
            </div>
            <div className="text-center">
              <h3 className="text-[22px] font-bold font-display text-slate-800 leading-none">{m.value}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{m.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Visual Analytics Sections */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8"
      >
        
        {/* Left Area Chart of Audit Activity Timeline */}
        <div className="lg:col-span-8 p-5 sm:p-7 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-[400px] flex flex-col justify-between group hover:border-[#0FA484]/30 transition-colors">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 shadow-sm">
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
                    borderRadius: '16px',
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
        <div className="lg:col-span-4 p-5 sm:p-7 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-[400px] flex flex-col justify-between group hover:border-slate-200 transition-colors">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-50 rounded-2xl text-slate-500 shadow-sm">
                 <PieChartIcon className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Sprint Health</h3>
                 <p className="text-slate-500 text-[11px] mt-0.5">Projects separated by phase.</p>
               </div>
            </div>
          </div>

          <div className="flex-grow w-full flex items-center justify-center py-4 relative">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
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
                    borderRadius: '12px', 
                    borderColor: '#f1f5f9', 
                    color: '#1e293b',
                    fontSize: '11px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Absolute Center Labels */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Total</span>
              <p className="text-[32px] font-bold font-display text-slate-800 leading-none">{stats.projects.total}</p>
            </div>
          </div>

          {/* Dynamic Color Keys */}
          <div className="flex flex-col gap-2.5 pt-2">
            {projectStatusData.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-bold">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-500">{d.value}</span>
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
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6"
      >
        
        {/* Technologies Breakdown */}
        <div className="lg:col-span-5 p-5 sm:p-7 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[360px] group hover:border-[#0ea5e9]/30 transition-colors">
          <div className="pb-4 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-50 rounded-2xl text-sky-500 shadow-sm">
                 <Hexagon className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Stack Utilization</h3>
                 <p className="text-slate-500 text-[11px] mt-0.5">Most recurrent tech in deployed blueprints.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full pt-4">
            {techStackData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={techStackData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      borderColor: '#f1f5f9',
                      fontSize: '11px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
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
        <div className="lg:col-span-7 p-5 sm:p-7 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] min-h-[360px] flex flex-col justify-between group hover:border-[#8b5cf6]/30 transition-colors">
          <div className="pb-4 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider font-display text-slate-800">Immutable Audit Frame</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Database modification feed originating from authorized operators.</p>
               </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>LIVE FEED</span>
            </span>
          </div>

          <div className="flex-1 py-4 space-y-3">
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
                  className="p-4 rounded-[20px] border border-slate-100 bg-[#f8fafc] hover:bg-white hover:shadow-sm hover:border-[#8b5cf6]/20 transition-all flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] sm:text-[13px] font-bold text-slate-800 leading-none mb-1">{log.action}</h5>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-xs">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold font-mono tracking-wider">{log.userEmail.split('@')[0]}</span>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium font-sans uppercase tracking-widest mt-1">
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
