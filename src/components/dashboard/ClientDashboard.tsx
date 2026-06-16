import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, UserProfile } from '../layout/FirebaseProvider';
import { db } from '../../lib/firebase';
import ProfileManagement from '../admin/modules/ProfileManagement';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Bell, 
  Inbox, 
  X, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Zap, 
  ArrowUpRight, 
  Search,
  MessageSquare,
  Sparkles,
  User
} from 'lucide-react';

interface DashboardPortalProps {
  isOpen: boolean;
  }

export interface Task {
  taskId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedByName: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'replied' | 'archived';
  createdAt?: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt?: any;
}

export default function ClientDashboard() {
  const { user, profile, isAdmin, isTeam, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'users' | 'inquiries' | 'announcements' | 'profile'>('overview');

  // Firestore Real-time Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Task creation state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Announcement creation state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [notifyMsg, setNotifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotifyMsg({ text, type });
    setTimeout(() => setNotifyMsg(null), 4000);
  };

  // 1. Real-time Listeners with cleanups
  useEffect(() => {
    if (!user) return;

    // Listen to Announcements
    const qAnn = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubAnn = onSnapshot(qAnn, (snap) => {
      const list: Announcement[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
      });
      setAnnouncements(list);
    }, (err) => console.error("Error reading announcements:", err));

    // Listen to Tasks (visible to Admin + Team if matches, or all to Admin)
    let unsubTasks = () => {};
    if (isTeam || isAdmin) {
      const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      unsubTasks = onSnapshot(qTasks, (snap) => {
        const list: Task[] = [];
        snap.forEach((docSnap) => {
          list.push({ taskId: docSnap.id, ...docSnap.data() } as Task);
        });
        setTasks(list);
      }, (err) => console.error("Error reading tasks:", err));
    }

    // Listen to Users (Admin only)
    let unsubUsers = () => {};
    if (isAdmin) {
      const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsubUsers = onSnapshot(qUsers, (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as UserProfile);
        });
        setUsersList(list);
      }, (err) => console.error("Error reading users:", err));
    }

    // Listen to Inquiries (Admin only)
    let unsubInquiries = () => {};
    if (isAdmin) {
      const qInquiries = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      unsubInquiries = onSnapshot(qInquiries, (snap) => {
        const list: Inquiry[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Inquiry);
        });
        setInquiries(list);
      }, (err) => console.error("Error reading inquiries:", err));
    }

    return () => {
      unsubAnn();
      unsubTasks();
      unsubUsers();
      unsubInquiries();
    };
  }, [user, isAdmin, isTeam]);

  // Adjust active tab if permissions change
  useEffect(() => {
    if (!isTeam && activeTab !== 'overview' && activeTab !== 'announcements') {
      setActiveTab('overview');
    }
  }, [isTeam]);

  // 2. Action Handlers

  // Change user role (Admin only)
  const handleRoleChange = async (targetUid: string, newRole: 'admin' | 'team' | 'client') => {
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, { 
        role: newRole,
        updatedAt: serverTimestamp()
      });
      showNotification(`Successfully updated user's role to ${newRole}`);
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to change user role. Inadequate permission level.', 'error');
    }
  };

  // Create Task (Admin only)
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDesc.trim() || !taskAssignedTo) {
      showNotification('Please fill out all task creation fields.', 'error');
      return;
    }

    const assignedUser = usersList.find(u => u.uid === taskAssignedTo);
    const assignedName = assignedUser ? assignedUser.name : 'Unknown Dev';

    try {
      const taskRef = collection(db, 'tasks');
      await addDoc(taskRef, {
        taskId: '', // will let firebase assign or set locally
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedTo: taskAssignedTo,
        assignedToName: assignedName,
        assignedByName: profile?.name || 'Code Crafters Admin',
        status: 'pending',
        priority: taskPriority,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignedTo('');
      setTaskPriority('medium');
      showNotification(`Task "${taskTitle.substring(0, 15)}..." assigned successfully to ${assignedName}!`);
    } catch (err: any) {
      console.error(err);
      showNotification('Task creation failed.', 'error');
    }
  };

  // Update Task Status (Admin or Team if assigned)
  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showNotification(`Task marked as ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      showNotification('Inadequate credentials to modify this task.', 'error');
    }
  };

  // Delete Task (Admin only)
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this sprint task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      showNotification('Task successfully removed.');
    } catch (err: any) {
      console.error(err);
      showNotification('Unauthorized to delete task.', 'error');
    }
  };

  // Create Announcement (Admin only)
  const handleCreateAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    try {
      const annRef = collection(db, 'announcements');
      await addDoc(annRef, {
        id: '',
        title: annTitle.trim(),
        content: annContent.trim(),
        createdBy: user?.uid,
        createdByName: profile?.name || 'Administrator',
        createdAt: serverTimestamp()
      });

      setAnnTitle('');
      setAnnContent('');
      showNotification('Global company broadcast announcement deployed successfully!');
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to publish announcement.', 'error');
    }
  };

  // Update Inquiry Status (Admin only)
  const handleInquiryStatusChange = async (inqId: string, newStatus: 'unread' | 'replied' | 'archived') => {
    try {
      const inqRef = doc(db, 'inquiries', inqId);
      await updateDoc(inqRef, { status: newStatus });
      showNotification(`Inquiry marked as ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to change inquiry status.', 'error');
    }
  };

  const handleLogoutClick = async () => {
    await signOut();
    window.location.href = '/';
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex bg-[#030712] text-white">
          
          {/* ==================== SIDEBAR ==================== */}
          <aside className="w-64 border-r border-white/5 bg-[#050b14] flex flex-col justify-between p-6 shrink-0 relative overflow-hidden hidden md:flex">
            <div className="absolute inset-0 bg-gradient-to-b from-electric/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            
            <div className="space-y-8 relative z-10">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-electric/10 flex items-center justify-center border border-electric/25">
                  <LayoutDashboard className="w-4.5 h-4.5 text-electric animate-pulse" />
                </div>
                <div>
                  <h1 className="font-display font-medium text-sm leading-none">Code Crafters</h1>
                  <span className="text-[10px] font-mono text-gray-400 capitalize">{profile?.role || 'client'} Portal</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 block px-2 mb-3">WORKSPACE</span>
                
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === 'overview'
                      ? 'bg-electric/15 text-electric border border-electric/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all justify-between ${
                    activeTab === 'announcements'
                      ? 'bg-electric/15 text-electric border border-electric/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Broadcasts</span>
                  </div>
                  {announcements.length > 0 && (
                    <span className="bg-electric text-navy font-bold text-[9px] px-1.5 py-0.5 rounded-md">
                      {announcements.length}
                    </span>
                  )}
                </button>

                {isTeam && (
                  <>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 block px-2 pt-6 mb-3">TEAM SPRINT</span>
                    
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all justify-between ${
                        activeTab === 'tasks'
                          ? 'bg-electric/15 text-electric border border-electric/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4" />
                        <span>Sprint Tasks</span>
                      </div>
                      {tasks.length > 0 && (
                        <span className="bg-gray-800 text-gray-300 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                          {tasks.length}
                        </span>
                      )}
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 block px-2 pt-6 mb-3">ADMIN CONTROL</span>

                    <button
                      onClick={() => setActiveTab('users')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all justify-between ${
                        activeTab === 'users'
                          ? 'bg-electric/15 text-electric border border-electric/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4" />
                        <span>User Accounts</span>
                      </div>
                      {usersList.length > 0 && (
                        <span className="bg-electric/25 text-electric font-mono text-[9px] px-1.5 py-0.5 rounded-md">
                          {usersList.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all justify-between ${
                        activeTab === 'inquiries'
                          ? 'bg-electric/15 text-electric border border-electric/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Inbox className="w-4 h-4" />
                        <span>Client Inquiries</span>
                      </div>
                      {inquiries.filter(i => i.status === 'unread').length > 0 && (
                        <span className="bg-amber-500 text-navy font-bold text-[9px] px-1.5 py-0.5 rounded-md animation-pulse">
                          {inquiries.filter(i => i.status === 'unread').length}
                        </span>
                      )}
                    </button>
                  </>
                )}

                <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 block px-2 pt-6 mb-3">SETTINGS</span>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === 'profile'
                      ? 'bg-electric/15 text-electric border border-electric/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
              </nav>
            </div>

            {/* User Card inside Sidebar */}
            <div className="border-t border-white/5 pt-4 space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <img 
                  src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || '')}`} 
                  alt={profile?.name} 
                  className="w-10 h-10 rounded-full border border-white/10"
                />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate leading-none mb-1">{profile?.name}</h3>
                  <p className="text-[10px] font-mono text-gray-500 truncate">{profile?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>TERMINATE EXCURSION</span>
              </button>
            </div>
          </aside>

          {/* ==================== MAIN CONTENT STAGE ==================== */}
          <main className="flex-1 flex flex-col relative overflow-hidden bg-[#03060f]">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric/[0.02] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-golden/[0.01] rounded-full blur-[120px] pointer-events-none" />

            {/* Global Header Bar */}
            <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-navy-light/10 backdrop-blur-md relative z-20">
              <div className="flex items-center gap-3">
                {/* Mobile Portal indicator (Logo) */}
                <div className="w-8 h-8 rounded-full bg-electric/15 md:hidden flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-electric" />
                </div>
                
                <h2 className="text-sm font-semibold tracking-widest uppercase font-mono text-gray-400 flex items-center gap-2">
                  <span className="hidden md:block">STAGE:</span>
                  <span className="text-white hover:text-electric transition-colors">{activeTab}</span>
                </h2>
              </div>

              {/* Action items on right header */}
              <div className="flex items-center gap-3">
                {notifyMsg && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-[10px] px-3.5 py-1.5 rounded-full border font-mono tracking-wide ${
                      notifyMsg.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    STATUS: {notifyMsg.text}
                  </motion.div>
                )}

                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 rounded-full border border-white/10 hover:border-white/20 bg-white/5 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Close Portal</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Mobile View Navbar Tabs */}
            <div className="flex gap-1.5 p-3 overflow-x-auto border-b border-white/5 md:hidden bg-[#050b14]/50">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                  activeTab === 'overview' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                  activeTab === 'announcements' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                }`}
              >
                Broadcasts
              </button>
              {isTeam && (
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                    activeTab === 'tasks' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                  }`}
                >
                  Sprint Tasks
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                      activeTab === 'users' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                      activeTab === 'inquiries' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                    }`}
                  >
                    Inquiries
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold shrink-0 ${
                  activeTab === 'profile' ? 'bg-electric text-navy' : 'text-gray-400 bg-white/5'
                }`}
              >
                Profile
              </button>
              <button
                onClick={handleLogoutClick}
                className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold text-red-400 bg-red-500/10 shrink-0"
              >
                Sign Out
              </button>
            </div>

            {/* Inner scroll container of tabs */}
            <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-8 relative z-10">
              
              {/* ==================== TAB 1: OVERVIEW ==================== */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-electric to-golden" />
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-electric/10 rounded-full border border-electric/20 text-electric text-[10px] uppercase tracking-wider font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Security Level: Active</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                        Welcome to Code Crafters, <span className="text-electric">{profile?.name || user?.email}</span>
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        You have logged in with <strong className="text-white capitalize">{profile?.role || 'client'}</strong> clearance level. Manage your operational credentials below.
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Sprint tasks */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">Company Tasks</span>
                        <p className="text-3xl font-bold text-white font-display">{tasks.length}</p>
                        <p className="text-[10px] text-gray-500">Live active sprints</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-electric/10 text-electric flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>

                    {/* Pending ones */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">Pending Tasks</span>
                        <p className="text-3xl font-bold text-amber-400 font-display">
                          {tasks.filter(t => t.status === 'pending').length}
                        </p>
                        <p className="text-[10px] text-gray-500">Awaiting engineering</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Active Engineers */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">Company Accounts</span>
                        <p className="text-3xl font-bold text-white font-display">
                          {isAdmin ? usersList.length : '1+ Secured'}
                        </p>
                        <p className="text-[10px] text-gray-500">Synchronized accounts</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Inquiries */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-sm flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">Client Requests</span>
                        <p className="text-3xl font-bold text-emerald-400 font-display">
                          {isAdmin ? inquiries.length : 'Verified'}
                        </p>
                        <p className="text-[10px] text-gray-500">Web submit tracking</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Inbox className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Core layout for overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Latest announcements */}
                    <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-sm space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Bell className="text-electric w-4 h-4" />
                          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-white">Broadcasts & Activities</h4>
                        </div>
                        <span className="text-[10px] text-gray-500">REALTIME DISPATCH</span>
                      </div>

                      <div className="space-y-4">
                        {announcements.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs">
                            No announcements posted yet. Admins can broadcast company activities in the broadcasts tab.
                          </div>
                        ) : (
                          announcements.slice(0, 3).map((ann) => (
                            <div key={ann.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-xs font-bold text-white font-display">{ann.title}</h5>
                                <span className="text-[9px] font-mono text-gray-500">By {ann.createdByName}</span>
                              </div>
                              <p className="text-gray-300 text-xs leading-relaxed font-sans">{ann.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Developer profile badge information */}
                    <div className="lg:col-span-4 p-6 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-sm space-y-6">
                      <div className="text-center space-y-4 pb-4 border-b border-white/5">
                        <img 
                          src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || '')}`} 
                          alt="avatar" 
                          className="w-16 h-16 rounded-full border border-electric/40 mx-auto"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{profile?.name}</h4>
                          <span className="text-[10px] font-mono text-[#00E5FF] uppercase bg-electric/10 border border-electric/25 px-2.5 py-0.5 rounded-full inline-block mt-1">
                            {profile?.role || 'Guest'}
                          </span>
                        </div>
                      </div>

                      {profile?.role === 'client' && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-electric/5 to-white/[0.01] border border-electric/10 space-y-3">
                          <span className="text-[10px] font-bold text-electric tracking-widest block uppercase">Interested in consulting?</span>
                          <p className="text-[11px] text-gray-400">
                            Our team of elite developers and system architects are ready to transform your operational workflows. Submit a message in our Contact form and an administrator will respond directly within your credentials.
                          </p>
                          <a 
                            href="#contact" 
                            onClick={() => window.location.href = '/'} 
                            className="text-[11px] font-mono font-bold text-white hover:text-electric flex items-center gap-1"
                          >
                            <span>Reach out to engineering</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {isTeam && (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                          <span className="text-[10px] font-bold text-golden tracking-widest block uppercase">Sprint Guidelines</span>
                          <p className="text-[11px] text-gray-400">
                            Check tasks corresponding to your name in the Sprints tab and transition statuses linearly to promote clean delivery tracking.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 2: TASKS (TEAM SPRINTS) ==================== */}
              {activeTab === 'tasks' && isTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-display font-medium text-white">Active Engineering Sprint Tasks</h3>
                      <p className="text-gray-400 text-xs">Verify your goals, transition statuses, or assign new issues if you possess Administrator clearance.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Filter project tasks..."
                          className="w-full sm:w-64 bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-electric text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Tasks List */}
                    <div className="lg:col-span-8 space-y-4">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs text-sans">
                          No active sprint tasks found matching your filters.
                        </div>
                      ) : (
                        filteredTasks.map((task) => (
                          <div 
                            key={task.taskId} 
                            className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all space-y-4 relative overflow-hidden group"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                    task.priority === 'high' 
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                      : task.priority === 'medium' 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' 
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-500">Assigned by {task.assignedByName}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white font-display mt-1">{task.title}</h4>
                                <p className="text-gray-300 text-xs leading-relaxed font-sans">{task.description}</p>
                              </div>

                              {/* Task delete for Admin */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteTask(task.taskId)}
                                  className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs">
                              <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-[10px] font-mono">ASSIGNEE:</span>
                                <span className="font-bold text-white text-[11px] bg-white/5 px-2 py-0.5 rounded">
                                  {task.assignedToName} {task.assignedTo === user?.uid && '(You)'}
                                </span>
                              </div>

                              {/* Interactive State Segment selector */}
                              <div className="flex gap-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
                                {(['pending', 'in_progress', 'completed'] as const).map((st) => {
                                  const isActive = task.status === st;
                                  const isUserAssigneeOrAdmin = task.assignedTo === user?.uid || isAdmin;

                                  return (
                                    <button
                                      key={st}
                                      disabled={!isUserAssigneeOrAdmin}
                                      onClick={() => handleUpdateTaskStatus(task.taskId, st)}
                                      className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wide font-bold transition-all ${
                                        isActive
                                          ? st === 'completed'
                                            ? 'bg-emerald-500 text-navy font-bold'
                                            : st === 'in_progress'
                                            ? 'bg-[#00E5FF] text-navy font-bold'
                                            : 'bg-amber-500 text-navy font-bold'
                                          : 'text-gray-400 hover:text-white disabled:opacity-30'
                                      }`}
                                    >
                                      {st.replace('_', ' ')}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Task Creator Panel on Right (Admin Only) */}
                    <div className="lg:col-span-4">
                      {isAdmin ? (
                        <div className="p-6 rounded-3xl border border-white/10 bg-[#080e1a] space-y-6">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                              <Plus className="w-4 h-4 text-electric" />
                              <span>Create Sprint Task</span>
                            </h4>
                            <p className="text-[11px] text-gray-400">Assign software packages or tickets to team accounts.</p>
                          </div>

                          <form onSubmit={handleCreateTask} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Task Title</label>
                              <input
                                type="text"
                                required
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="Refactor main landing modules"
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-electric text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Description</label>
                              <textarea
                                required
                                rows={3}
                                value={taskDesc}
                                onChange={(e) => setTaskDesc(e.target.value)}
                                placeholder="Analyze security layers and align typescript models with target schema."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-electric text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Assign Dev Account</label>
                              <select
                                required
                                value={taskAssignedTo}
                                onChange={(e) => setTaskAssignedTo(e.target.value)}
                                className="w-full bg-[#03060f] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-electric text-white"
                              >
                                <option value="">-- Select Team Member --</option>
                                {usersList.filter(u => u.role === 'team' || u.role === 'admin').map((u) => (
                                  <option key={u.uid} value={u.uid}>
                                    {u.name} ({u.role})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Severity Priority</label>
                              <div className="grid grid-cols-3 gap-2">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setTaskPriority(p)}
                                    className={`py-1.5 rounded-lg text-[9px] uppercase tracking-wide font-bold border transition-all ${
                                      taskPriority === p
                                        ? 'bg-electric/15 border-electric text-electric font-semibold'
                                        : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-white hover:bg-electric text-navy font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all"
                            >
                              Dispatch Sprint Goal
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
                          <AlertCircle className="w-8 h-8 text-golden" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Permission Barrier</h4>
                          <p className="text-[11px] text-gray-400">
                            Only authenticated Administrators are authorized to initialize project sprint issues. Contact babaraliarain2211@gmail.com for elevated accounts.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 3: USER ACCOUNTS (ADMIN ONLY) ==================== */}
              {activeTab === 'users' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-medium text-white">Workspace User Register</h3>
                    <p className="text-gray-400 text-xs">Verify current member logins, assign team access levels, and provision resources.</p>
                  </div>

                  <div className="border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01] backdrop-blur-md">
                    <div className="min-w-full overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/5 text-left text-xs text-gray-300">
                        <thead className="bg-[#050b14] text-gray-400 uppercase tracking-widest text-[9px] font-mono">
                          <tr>
                            <th className="px-6 py-4">Account Profile</th>
                            <th className="px-6 py-4">Email Address</th>
                            <th className="px-6 py-4">Authorized Access Role</th>
                            <th className="px-6 py-4">Actions / Promotion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-navy-light/1 gap-2">
                          {usersList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-gray-500">Currently loading registered users...</td>
                            </tr>
                          ) : (
                            usersList.map((usr) => (
                              <tr key={usr.uid} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3 font-semibold text-white">
                                  <img 
                                    src={usr.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(usr.name)}`} 
                                    alt={usr.name} 
                                    className="w-8 h-8 rounded-full border border-white/10"
                                  />
                                  <span>{usr.name}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-400">{usr.email}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                    usr.role === 'admin'
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      : usr.role === 'team'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                      : 'bg-gray-800 text-gray-300'
                                  }`}>
                                    {usr.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 flex gap-1.5">
                                  {(['admin', 'team', 'client'] as const).map((r) => (
                                    <button
                                      key={r}
                                      disabled={usr.role === r || usr.email.toLowerCase() === 'babaraliarain2211@gmail.com'}
                                      onClick={() => handleRoleChange(usr.uid, r)}
                                      className={`px-2 py-1 rounded text-[9px] uppercase tracking-wide font-bold transition-all disabled:opacity-40 select-none ${
                                        usr.role === r
                                          ? 'bg-electric text-navy font-bold'
                                          : 'text-gray-400 bg-white/5 hover:text-white hover:bg-white/10'
                                      }`}
                                    >
                                      to {r}
                                    </button>
                                  ))}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 4: CLIENT INQUIRIES (ADMIN ONLY) ==================== */}
              {activeTab === 'inquiries' && isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-medium text-white">Client Project Consult Inquiries</h3>
                    <p className="text-gray-400 text-xs">Verify inquiries dispatching from the public Contact portal and direct response loops.</p>
                  </div>

                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs text-sans">
                        No contact inquiries submitted to the system yet.
                      </div>
                    ) : (
                      inquiries.map((inq) => (
                        <div key={inq.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-[13px]">{inq.name}</span>
                                <span className="text-gray-500 font-mono text-[10px]">&lt;{inq.email}&gt;</span>
                              </div>
                              <h4 className="text-xs font-bold text-electric uppercase tracking-wider font-mono mt-1">SUBJECT: {inq.subject}</h4>
                            </div>

                            {/* Inquiry segment status badges updates */}
                            <div className="flex gap-1.5 bg-black/40 p-0.5 border border-white/5 rounded-xl">
                              {(['unread', 'replied', 'archived'] as const).map((stat) => (
                                <button
                                  key={stat}
                                  onClick={() => handleInquiryStatusChange(inq.id, stat)}
                                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all ${
                                    inq.status === stat
                                      ? stat === 'replied'
                                        ? 'bg-emerald-500 text-navy font-bold'
                                        : stat === 'unread'
                                        ? 'bg-red-500 text-white font-bold animate-pulse'
                                        : 'bg-gray-700 text-gray-300'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {stat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-300 text-xs leading-relaxed font-sans bg-white/[0.01] p-4 rounded-xl border border-white/5 italic">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 5: BROADCASTS & ANNOUNCEMENTS ==================== */}
              {activeTab === 'announcements' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-medium text-white">Global Company Broadcast Updates</h3>
                    <p className="text-gray-400 text-xs">Verify internal announcements, release schedules, or configure company highlights.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Announcement Feed */}
                    <div className="lg:col-span-8 space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs text-sans">
                          No company announcements broadcasted yet.
                        </div>
                      ) : (
                        announcements.map((ann) => (
                          <div 
                            key={ann.id} 
                            className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-white font-display">{ann.title}</h4>
                                <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                                  Broadcasted by {ann.createdByName}
                                </span>
                              </div>

                              {/* Delete for Admin */}
                              {isAdmin && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Delete this broadcast announce?')) {
                                      await deleteDoc(doc(db, 'announcements', ann.id));
                                      showNotification('Removed announcement.');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed font-sans">{ann.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Announcement Creator (Admin only) */}
                    <div className="lg:col-span-4">
                      {isAdmin ? (
                        <div className="p-6 rounded-3xl border border-white/10 bg-[#080e1a] space-y-6">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                              <Bell className="w-4 h-4 text-electric" />
                              <span>Publish Broadcast</span>
                            </h4>
                            <p className="text-[11px] text-gray-400">Post news or updates read by all team members in their portals.</p>
                          </div>

                          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Title</label>
                              <input
                                type="text"
                                required
                                value={annTitle}
                                onChange={(e) => setAnnTitle(e.target.value)}
                                placeholder="v1.4.0 Engine Update Live"
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-electric text-white font-sans"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Message details</label>
                              <textarea
                                required
                                rows={4}
                                value={annContent}
                                onChange={(e) => setAnnContent(e.target.value)}
                                placeholder="Please evaluate the target models and update typescript interfaces according to rules."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-electric text-white font-sans"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-white hover:bg-electric text-navy font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all"
                            >
                              Dispatch Broadcast
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
                          <AlertCircle className="w-8 h-8 text-golden" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Permission Barrier</h4>
                          <p className="text-[11px] text-gray-400">
                            Only premium Administrators are authorized to broadcast company announcements.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ==================== TAB 6: PROFILE SETTINGS ==================== */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProfileManagement />
                </motion.div>
              )}

            </div>
          </main>

        </div>
  );
}
