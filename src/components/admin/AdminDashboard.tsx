import { useState, useEffect, useRef, ReactNode, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Users, FolderGit2, Sparkles, Terminal, LogOut, 
  Menu, X, Bell, Search, Globe, ChevronDown, Award, Calendar, FolderOpen,
  MessageSquare, Sliders, Activity, Mail, Lock, AlertCircle, RefreshCw, FileSpreadsheet,
  ShieldAlert, Star, Layout, Settings
} from 'lucide-react';
import { useAuth } from '../layout/FirebaseProvider';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

// Submodules
import Overview from './modules/Overview';
import TeamManagement from './modules/TeamManagement';
import ProjectManagement from './modules/ProjectManagement';
import ServicesManagement from './modules/ServicesManagement';
import AdminPanels from './modules/AdminPanels';
import ProfileManagement from './modules/ProfileManagement';
import { ActivityLog } from './types';

export default function AdminDashboard() {
  const { user, profile, isAdmin, isTeam, signInWithEmail, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  // Sidebar toggler & current active UI tab
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'projects' | 'services' | 'clients' | 'blogs' | 'media' | 'testimonials' | 'appointments' | 'cms' | 'settings' | 'logs' | 'profile'>('overview');

  // Login form configurations for Console Access
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Notifications toggle & data
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'New Consultation Lead', text: 'Sarah Connor requested a meeting.', date: '10 mins ago', read: false },
    { id: '2', title: 'Task Approved', text: 'Completed sprint deployed in live production.', date: '2 hrs ago', read: true }
  ]);

  // Global search strings & suggestion data
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [searchPool, setSearchPool] = useState<any[]>([]);

  // System security activity logs
  const [systemLogs, setSystemLogs] = useState<ActivityLog[]>([]);

  // 1. Initial listener for real-time security events
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const list: ActivityLog[] = [];
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as ActivityLog));
      setSystemLogs(list);
    }, (err) => console.log('Read logs authorization failed or incomplete.'));
  }, [user]);

  // 2. Platform Audit logging method
  const logSystemActivity = async (action: string, details: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        userEmail: user.email || 'anonymous@codecrafers.co',
        userName: profile?.name || 'Administrator Console',
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Network or permission delay writing audit logs locally.', err);
    }
  };

  // 3. Dynamic Global Querying indexing pool
  useEffect(() => {
    if (!user) return;
    const collections = ['projects', 'users', 'blogs'];
    if (isAdmin) {
      collections.push('clients');
    }
    Promise.all(collections.map(col => 
      getDocs(collection(db, col))
        .catch(err => {
          console.warn(`Search index load failed for ${col}:`, err);
          return null;
        })
    ))
      .then(snapList => {
        const tempPool: any[] = [];
        snapList.forEach((snap, idx) => {
          if (!snap) return;
          const colName = collections[idx];
          snap.forEach(docSnap => {
            const data = docSnap.data();
            tempPool.push({
              id: docSnap.id,
              col: colName,
              title: data.projectName || data.name || data.title || data.clientName || 'Unnamed Record',
              desc: data.description || data.email || data.content || data.company || 'Direct database index.'
            });
          });
        });
        setSearchPool(tempPool);
      })
      .catch(err => console.log('Searching pool fetch failed recursively', err));
  }, [user, activeTab, isAdmin]);

  // Expand Filter suggestion matching search query
  const handleQuerySearchChange = (val: string) => {
    setSearchString(val);
    if (!val.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const matches = searchPool.filter(item => 
      item.title.toLowerCase().includes(val.toLowerCase()) ||
      item.desc.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setSearchSuggestions(matches);
  };

  // 4. Client-side authentication handlers
  const handleConsoleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Credentials rejected by security cluster.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleConsoleGoogleLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Google Auth refused or closed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 5. Excel/CSV Dynamic Data Exports Database download
  const handleCSVExport = async () => {
    try {
      const snap = await getDocs(collection(db, 'clients'));
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Client Name,Company,Email,Phone,Status,Notes\n";

      snap.forEach((docSnap) => {
        const c = docSnap.data();
        const row = [
          `"${c.clientName || ''}"`,
          `"${c.company || ''}"`,
          `"${c.email || ''}"`,
          `"${c.phone || ''}"`,
          `"${c.status || ''}"`,
          `"${(c.notes || '').replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `code_crafters_clients_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logSystemActivity('Database Export Triggered', 'Exported Client Relations DB into CSV schema payload.');
    } catch (err) {
      console.error(err);
      alert('Export failed due to database query authorization.');
    }
  };

  // Sidebar auto-responsiveness hook
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize(); // Initial trigger
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Conditional Workspace view rendering based on active levels
  // Lock workspace is unauthenticated or lack Admin / Team permissions
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow ambient panels */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[160px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-3xl border border-slate-150 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] relative z-10"
        >
          {/* Logo header */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
            <div className="w-14 h-14 overflow-hidden rounded-full border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <img src="/logo.jpeg" alt="Code Crafters Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#0FA484] uppercase">CODE CRAFTERS COMPANY</span>
              <h1 className="text-xl font-display font-semibold text-slate-800 tracking-wide mt-1">Platform Administrative Portal</h1>
              <p className="text-slate-400 text-xs mt-1.5 font-sans font-normal">Authenticating admin nodes onto cluster databases.</p>
            </div>
          </div>

          {loginError && (
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleConsoleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">EMAIL CONSOLE NODE</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@codecrafters.co" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-[#0FA484] focus:bg-white transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">SECURE CRYPTO PASSKEY</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-[#0FA484] focus:bg-white transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-[#0FA484] text-white font-bold rounded-xl tracking-widest text-[10px] uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{loginLoading ? 'DECRYPTING ACCESS...' : 'DECRYPT SYSTEM GATEWAYS'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3.5 text-[10px] text-slate-400 font-mono uppercase tracking-widest">or single sign-on</span>
          </div>

          <button 
            type="button" 
            onClick={handleConsoleGoogleLogin}
            disabled={loginLoading}
            className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-sans text-[10px] uppercase font-bold rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.58-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11c-2.074-1.933-4.947-3.11-8.274-3.11-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.534-4.87 11.534-11.74 0-.788-.085-1.39-.19-1.885h-11.344z"/>
            </svg>
            <span>Google Administrative SSO</span>
          </button>
          
          <div className="text-center mt-6">
            <Link to="/" className="text-slate-400 hover:text-slate-700 transition-colors text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>← Return to Public Workspace</span>
            </Link>
          </div>

        </motion.div>
      </div>
    );
  }

  // Deny system workspace accesses if role checks fail
  if (!isAdmin && !isTeam) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative font-sans">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[160px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl relative z-10"
        >
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-slate-800">Console Authorization Denied</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-normal">
              Your logged-in account profile <strong className="text-slate-800">{user.email}</strong> possesses no authorized security credentials (<strong className="text-slate-800">Admin / Team</strong> tags) for this console space.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => signOut().then(() => navigate('/'))}
              className="py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Sign Out & Clear Session
            </button>
            <button 
              onClick={() => navigate('/')}
              className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-150 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex select-none font-sans overflow-x-hidden relative">
      
      {/* Mobile Drawer dim backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 block lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          DYNAMIC SIDEBAR NAVIGATION
      ========================================== */}
      <aside 
        className={`bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-40
          fixed top-0 bottom-0 left-0 h-screen shadow-2xl lg:shadow-none lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden
          ${sidebarOpen 
            ? 'w-64 translate-x-0' 
            : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
          }
        `}
      >
        <div className="flex-1 flex flex-col pt-6 min-h-0">
          {/* Sidebar Brand header */}
          <div className={`px-5 pb-6 border-b border-slate-50 flex items-center justify-between ${sidebarOpen ? '' : 'justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="leading-tight">
                  <h2 className="font-display font-semibold text-sm tracking-wide text-slate-850">Code Crafters</h2>
                  <span className="text-[9px] font-mono text-[#0FA484] font-bold uppercase tracking-wider">{profile?.role || 'operator'} panel</span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto min-h-0">
            
            {/* Nav 1: Overview */}
            <SidebarLink 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Overview Controls" 
              active={activeTab === 'overview'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('overview');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 2: Team */}
            <SidebarLink 
              icon={<Users className="w-4 h-4" />} 
              label="Staff Directory" 
              active={activeTab === 'team'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('team');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 3: Projects */}
            <SidebarLink 
              icon={<FolderGit2 className="w-4 h-4" />} 
              label="Sprints Portfolio" 
              active={activeTab === 'projects'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('projects');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 4: Services */}
            <SidebarLink 
              icon={<Terminal className="w-4 h-4" />} 
              label="Pricing Offerings" 
              active={activeTab === 'services'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('services');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 5: Clients Relations */}
            <SidebarLink 
              icon={<Award className="w-4 h-4" />} 
              label="Client Database" 
              active={activeTab === 'clients'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('clients');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 6: Blogs */}
            <SidebarLink 
              icon={<MessageSquare className="w-4 h-4" />} 
              label="Technical Articles" 
              active={activeTab === 'blogs'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('blogs');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 7: Media CDN */}
            <SidebarLink 
              icon={<FolderOpen className="w-4 h-4" />} 
              label="Media Library" 
              active={activeTab === 'media'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('media');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 8: Testimonials */}
            <SidebarLink 
              icon={<Star className="w-4 h-4" />} 
              label="Testimonials Audit" 
              active={activeTab === 'testimonials'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('testimonials');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 9: Calendar Appointments */}
            <SidebarLink 
              icon={<Calendar className="w-4 h-4" />} 
              label="Meetings Schedule" 
              active={activeTab === 'appointments'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('appointments');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 10: Landing CMS */}
            <SidebarLink 
              icon={<Layout className="w-4 h-4" />} 
              label="Landing CMS Content" 
              active={activeTab === 'cms'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('cms');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 11: Global Settings */}
            <SidebarLink 
              icon={<Settings className="w-4 h-4" />} 
              label="Brand Settings" 
              active={activeTab === 'settings'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('settings');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

            {/* Nav 12: Activity Logs */}
            <SidebarLink 
              icon={<Activity className="w-4 h-4" />} 
              label="Audit Logs Timeline" 
              active={activeTab === 'logs'} 
              open={sidebarOpen}
              onClick={() => {
                setActiveTab('logs');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }} 
            />

          </nav>
        </div>

        {/* Sidebar Footer elements */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          {/* Quick collapse button for desktop */}
          <button 
            type="button" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all items-center justify-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer"
          >
            <span>{sidebarOpen ? 'Collapse Nav Menu' : 'Expand'}</span>
          </button>

          {/* User Signout info */}
          <div className={`flex items-center gap-2.5 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-2.5 max-w-[155px] truncate">
                <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=Dev`} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-100" />
                <div className="leading-tight truncate">
                  <h4 className="text-xs font-bold text-slate-700 truncate">{profile?.name || 'Administrator'}</h4>
                  <span className="text-[9px] text-slate-400 font-mono truncate">{user.email}</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => {
                logSystemActivity('Session Logged Out', `Admin user logged out manually: ${user.email}`);
                signOut();
              }}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all cursor-pointer shrink-0"
              title="Terminate Operational Console Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ==========================================
          MAIN OPERATIONS CONSOLE
      ========================================== */}
      <main className="flex-1 flex flex-col relative z-10 min-h-screen overflow-x-hidden">
        
        {/* TOP STATUS NAVIGATION BAR */}
        <header className="h-16 md:h-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 md:px-8 flex justify-between items-center relative z-30 shrink-0 sticky top-0 transition-all duration-300">
          
          <div className="flex items-center gap-3 sm:gap-4 flex-none">
            {/* Mobile Hamburger menu toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#0FA484]/50 active:scale-95"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Logo for mobile view when sidebar might be closed */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm block lg:hidden shrink-0 bg-white">
               <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 hidden sm:block px-2">Operations <span className="text-[#0FA484]">Console</span></h1>
          </div>

          {/* Operations row: Global search suggestion engine, Database export click, bell notifications panel */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 justify-end ml-4">
            
            {/* Dynamic Global suggestion search engine */}
            <div className="relative w-full max-w-[150px] xs:max-w-[190px] sm:max-w-[240px] md:max-w-md lg:w-[360px] group">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-[#0FA484] transition-colors duration-300" />
                <input 
                  type="text" 
                  value={searchString}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onChange={(e) => handleQuerySearchChange(e.target.value)}
                  placeholder="Search globally..." 
                  className="bg-slate-100/50 hover:bg-slate-100 border border-transparent focus:border-slate-200 text-xs sm:text-sm rounded-full pl-11 pr-4 py-2 sm:py-2.5 w-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0FA484]/10 focus:bg-white transition-all shadow-sm" 
                />
                {searchString && (
                  <button onClick={() => setSearchString('')} className="absolute right-3 p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Flyout portal */}
              <AnimatePresence>
                {searchFocused && searchString.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="absolute top-[calc(100%+0.75rem)] right-0 left-[-60px] sm:left-0 md:-left-12 md:w-[420px] bg-white border border-slate-200 rounded-3xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] z-[100] max-h-96 overflow-y-auto"
                  >
                    <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase block mb-2 px-2 pt-1">Search Results</span>
                    {searchSuggestions.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-medium">No matches found for "{searchString}"</div>
                    ) : (
                      <div className="space-y-1">
                        {searchSuggestions.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (item.col === 'projects') setActiveTab('projects');
                              if (item.col === 'users') setActiveTab('team');
                              if (item.col === 'blogs') setActiveTab('blogs');
                              if (item.col === 'clients') setActiveTab('clients');
                            }}
                            className="p-3 rounded-2xl hover:bg-[#F0FDF4] cursor-pointer transition-all flex items-start gap-3 text-slate-700 group/item"
                          >
                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#0FA484] flex items-center justify-center shrink-0 border border-emerald-100/50">
                               {item.col === 'projects' ? <FolderGit2 className="w-4 h-4" /> : 
                                item.col === 'users' ? <Users className="w-4 h-4" /> : 
                                item.col === 'clients' ? <Award className="w-4 h-4" /> : 
                                <MessageSquare className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-sm text-slate-800 font-semibold truncate group-hover/item:text-[#0FA484] transition-colors">{item.title}</strong>
                                <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded-full bg-slate-100 text-slate-500 shrink-0 group-hover/item:bg-emerald-100 group-hover/item:text-emerald-700 transition-colors">{item.col}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{item.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instant Excel/CSV Client DB download */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={handleCSVExport}
                className="p-2.5 bg-slate-50 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-full transition-all shadow-sm group/btn focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Export database to CSV"
              >
                <FileSpreadsheet className="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>

            {/* Notification system triggers bell */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2.5 rounded-full transition-all relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm border ${notifOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white absolute top-[-2px] right-[-2px] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-[calc(100%+1rem)] right-0 bg-white border border-slate-200 rounded-3xl p-5 w-80 sm:w-96 shadow-[0_20px_60px_rgba(0,0,0,0.08)] z-50 text-xs space-y-4"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="font-bold uppercase tracking-wider text-slate-800 text-xs font-display">Notifications</span>
                      <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[10px] text-[#0FA484] hover:text-[#0c856a] font-bold uppercase transition-colors">Mark all read</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.read ? 'border-slate-100 bg-white' : 'border-[#0FA484]/20 bg-[#F0FDF4] shadow-sm'} space-y-1.5`}>
                          <div className="flex items-start justify-between gap-2">
                             <h5 className={`font-bold font-sans text-sm ${notif.read ? 'text-slate-700' : 'text-[#0FA484]'}`}>{notif.title}</h5>
                             {!notif.read && <span className="w-2 h-2 rounded-full bg-[#0FA484] shrink-0 mt-1.5" />}
                          </div>
                          <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-600'}`}>{notif.text}</p>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block pt-1">{notif.date}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Picture & User Info in Top Nav */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-slate-200/80 ml-1 sm:ml-2 cursor-pointer hover:bg-slate-50 rounded-2xl p-1.5 pr-3 transition-colors group focus-within:ring-2 focus-within:ring-[#0FA484]/20"
              role="button"
              tabIndex={0}
            >
               <div className="hidden lg:block text-right leading-tight min-w-[100px]">
                  <h4 className="text-[12px] font-bold text-slate-800 truncate group-hover:text-[#0FA484] transition-colors">{profile?.name || user?.displayName || 'Administrator'}</h4>
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">{isAdmin ? 'Super Admin' : 'Team Member'}</span>
               </div>
               <div className="relative">
                 <img 
                   src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                   alt="Avatar" 
                   className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm shrink-0 group-hover:border-[#0FA484]/20 object-cover bg-slate-100 transition-all duration-300" 
                 />
                 <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#0FA484] border-2 border-white rounded-full"></span>
               </div>
               <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#0FA484] transition-colors hidden sm:block" />
            </div>
          </div>

        </header>

        {/* CENTRAL DYNAMIC SUB-VIEWPORT */}
        <section className="flex-grow p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
          <div className="w-full max-w-6xl mx-auto h-full">

            {activeTab === 'overview' && <Overview logs={systemLogs} isAdmin={isAdmin} />}
            {activeTab === 'team' && <TeamManagement onLogActivity={logSystemActivity} />}
            {activeTab === 'projects' && <ProjectManagement onLogActivity={logSystemActivity} />}
            {activeTab === 'services' && <ServicesManagement onLogActivity={logSystemActivity} />}
            {activeTab === 'profile' && <ProfileManagement onLogActivity={logSystemActivity} />}
            
            {/* Core administrative panels combined tab subview switcher */}
            {(['clients', 'blogs', 'media', 'testimonials', 'appointments', 'cms', 'settings', 'logs'] as any).includes(activeTab) && (
               <AdminPanels 
                activePanel={activeTab as any} 
                logs={systemLogs} 
                onLogActivity={logSystemActivity} 
              />
            )}

          </div>
        </section>

      </main>

    </div>
  );
}

// Sidebar modular button layout
interface SidebarLinkProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
}
function SidebarLink({ icon, label, active, open, onClick }: SidebarLinkProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all text-xs font-semibold tracking-wide cursor-pointer ${
        active 
          ? 'bg-[#E6F9F6] text-[#0FA484] font-bold shadow-2xs scale-[1.01]' 
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
      } ${open ? '' : 'justify-center px-0'}`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#0FA484]' : 'text-slate-400 group-hover:text-slate-700'}>{icon}</span>
        {open && <span className="font-sans leading-none">{label}</span>}
      </div>
      {open && active && (
        <motion.span 
          layoutId="activeArrow" 
          className="text-[#0FA484] h-4 flex items-center"
          initial={{ x: -2, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.span>
      )}
    </button>
  );
}
