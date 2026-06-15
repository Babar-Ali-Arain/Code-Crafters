import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Trash2, Edit, Check, X, Search, Globe, Mail, Phone, 
  Linkedin, Github, Layout, Image as ImageIcon, Sparkles, Eye, UserCheck
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, setDoc 
} from 'firebase/firestore';
import { UserProfile } from '../../layout/FirebaseProvider';

interface TeamManagementProps {
  onLogActivity: (action: string, details: string) => void;
}

export default function TeamManagement({ onLogActivity }: TeamManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'team' | 'client'>('team');
  const [formDesignation, setFormDesignation] = useState('Senior Software Engineer');
  const [formBio, setFormBio] = useState('Full stack specialist crafter.');
  const [formSkills, setFormSkills] = useState('React, TypeScript, Node.js, Firebase');
  const [formPhone, setFormPhone] = useState('+1 (555) 0192');
  const [formLinkedin, setFormLinkedin] = useState('https://linkedin.com/in/');
  const [formGithub, setFormGithub] = useState('https://github.com/');
  const [formImage, setFormImage] = useState('');

  // Loaded Team
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as any);
      });
      // Sort: Admin first, then team, then client
      list.sort((a, b) => {
        const order = { admin: 1, team: 2, client: 3 };
        return (order[a.role] || 3) - (order[b.role] || 3);
      });
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('team');
    setFormDesignation('Senior Software Engineer');
    setFormBio('');
    setFormSkills('');
    setFormPhone('');
    setFormLinkedin('https://linkedin.com/in/');
    setFormGithub('https://github.com/');
    // Auto design random cool seed
    const seed = Math.random().toString(36).substring(7);
    setFormImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    setIsFormOpen(true);
  };

  const openEditForm = (u: any) => {
    setEditingId(u.uid);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormRole(u.role || 'team');
    setFormDesignation(u.designation || 'Senior Software Engineer');
    setFormBio(u.bio || '');
    // Handle list if saved as array vs string
    setFormSkills(Array.isArray(u.skills) ? u.skills.join(', ') : (u.skills || ''));
    setFormPhone(u.phone || '');
    setFormLinkedin(u.linkedin || 'https://linkedin.com/in/');
    setFormGithub(u.github || 'https://github.com/');
    setFormImage(u.photoURL || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    try {
      const parsedSkills = formSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const payload: any = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        designation: formDesignation,
        bio: formBio,
        skills: parsedSkills,
        phone: formPhone,
        linkedin: formLinkedin,
        github: formGithub,
        photoURL: formImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formName)}`,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        // Edit existing user
        const ref = doc(db, 'users', editingId);
        await updateDoc(ref, payload);
        onLogActivity('Updated User/Team Member', `${formName} (${formRole}) - UID: ${editingId}`);
      } else {
        // Create new user record
        // Create unique ID
        const customUid = 'team_' + Math.random().toString(36).substring(2, 9);
        payload.uid = customUid;
        payload.createdAt = serverTimestamp();
        
        await setDoc(doc(db, 'users', customUid), payload);
        onLogActivity('Added User/Team Member', `Created ${formName} as ${formRole}`);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save team member details.');
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${u.name}?`)) return;

    try {
      await deleteDoc(doc(db, 'users', u.uid));
      onLogActivity('Deleted User/Team Member', `Deleted user account ${u.name} (UID: ${u.uid})`);
    } catch (err) {
      console.error(err);
      alert('Unauthorized or database error during delete.');
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u as any).designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-slate-800 font-sans pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Team & Account Management</h2>
          <p className="text-slate-500 text-xs">Configure platform administrators, core engineering crafters, or client accessibility tiers.</p>
        </div>

        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[24px] border border-slate-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts, roles or titles..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#4f46e5] font-sans transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          TOTAL ACCOUNTS: <strong className="text-slate-800">{filtered.length}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-24 text-slate-400 text-xs">
            Querying Firebase Auth-tied account profiles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-slate-50 rounded-3xl text-slate-500 text-xs shadow-sm">
            No matching registered accounts found. Add a team member or clear search filters.
          </div>
        ) : (
          filtered.map((u) => {
            const hasBio = !!(u as any).bio;
            const skills: string[] = (u as any).skills || [];

            return (
              <div 
                key={u.uid} 
                className="p-6 rounded-[32px] border border-slate-100/60 bg-white hover:border-[#4f46e5]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] pointer-events-none transition-colors duration-500 ${
                  u.role === 'admin' 
                    ? 'bg-rose-50 group-hover:bg-rose-100/50' 
                    : u.role === 'team' 
                    ? 'bg-blue-50 group-hover:bg-blue-100/50' 
                    : 'bg-emerald-50 group-hover:bg-emerald-100/50'
                }`} />

                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-start">
                    <img 
                      src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || '')}`} 
                      alt={u.name} 
                      className="w-14 h-14 rounded-[16px] border border-slate-200 object-cover shadow-sm bg-white p-0.5"
                    />

                    <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      u.role === 'admin' 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm transition-colors' 
                        : u.role === 'team' 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm transition-colors' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm transition-colors'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-display leading-tight">{u.name || 'Anonymous User'}</h3>
                    <p className="text-[11px] font-mono text-[#4f46e5] font-semibold leading-none mt-1.5">
                      {(u as any).designation || (u.role === 'client' ? 'Subscribed Client' : 'Code Crafter Engineer')}
                    </p>
                    {hasBio && (
                      <p className="text-slate-500 text-xs line-clamp-2 mt-3 text-sans font-normal leading-relaxed">
                        {(u as any).bio}
                      </p>
                    )}
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded-lg font-mono">
                          {sk}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-mono flex items-center pl-1 bg-white border border-transparent">+{skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="border-t border-slate-50 pt-4 space-y-2 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[190px]">{u.email}</span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-5 relative z-10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm"
                      title="View Profile Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEditForm(u)}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm"
                      title="Edit Account Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all shadow-sm"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                <img 
                  src={selectedUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.name || '')}`} 
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-[20px] border border-slate-200 bg-white p-0.5 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-800">{selectedUser.name}</h3>
                  <p className="text-xs font-mono text-[#4f46e5] font-semibold mt-1">
                    {(selectedUser as any).designation || 'Engineering Lead'}
                  </p>
                  <span className="text-[9px] font-mono uppercase bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 text-slate-500 inline-block mt-2 font-bold shadow-sm">
                    Clearance: {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 text-xs font-sans">
                <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">EMAIL ADDRESS</span>
                  <p className="text-slate-700 font-semibold break-all">{selectedUser.email}</p>
                </div>
                <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">CONTACT TELEPHONE</span>
                  <p className="text-slate-700 font-semibold">{(selectedUser as any).phone || 'N/A'}</p>
                </div>
              </div>

              {(selectedUser as any).bio && (
                <div className="space-y-2 text-xs border border-slate-100 rounded-2xl p-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">BIOGRAPHY</span>
                  <p className="text-slate-600 leading-relaxed font-medium">{(selectedUser as any).bio}</p>
                </div>
              )}

              {((selectedUser as any).skills || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block mb-2 px-1">CAPABILITIES & SKILLS</span>
                  <div className="flex flex-wrap gap-2">
                    {((selectedUser as any).skills || []).map((sk: string, idx: number) => (
                      <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-5 border-t border-slate-100 shrink-0">
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">LinkedIn URL</span>
                  <a href={(selectedUser as any).linkedin} target="_blank" rel="noreferrer" className="text-[#4f46e5] hover:text-[#4338ca] hover:underline flex items-center gap-1.5 font-bold p-2 bg-indigo-50/50 rounded-xl w-fit">
                    <Linkedin className="w-4 h-4" />
                    <span>View profile</span>
                  </a>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Github Channel</span>
                  <a href={(selectedUser as any).github} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1.5 font-bold p-2 bg-slate-50 rounded-xl w-fit">
                    <Github className="w-4 h-4" />
                    <span>Browse repos</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                  <span>{editingId ? 'Edit Team Member' : 'Add Team Member'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-sm font-sans">
                
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  <img src={formImage} alt="Preview" className="w-16 h-16 rounded-[18px] border border-slate-200 bg-white p-0.5 object-cover" />
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Avatar Image Seed URL</label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Dicebear or public resource url"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all font-mono shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="jane@codecrafers.co"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Designation Position</label>
                    <input
                      type="text"
                      required
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      placeholder="Solutions Consultant"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Contact Phone</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+1 (555) 0124"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['admin', 'team', 'client'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`py-3 rounded-xl border font-mono font-bold uppercase transition-all tracking-wide text-[10px] shadow-sm ${
                        formRole === role
                          ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {role} Role
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Bio Paragraph</label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Brief architectural expertise summary..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="Java, Python, Spark, Jenkins"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={formLinkedin}
                      onChange={(e) => setFormLinkedin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">GitHub Profile</label>
                    <input
                      type="text"
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-600 transition-all shadow-sm text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    Save Details
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
