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
    <div className="space-y-8 text-white">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Team & Account Management</h2>
          <p className="text-gray-400 text-xs text-sans">Configure platform administrators, core engineering crafters, or client accessibility tiers.</p>
        </div>

        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-electric hover:bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(0,240,255,0.2)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts, roles or titles..."
            className="w-full bg-[#050b14]/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric font-sans"
          />
        </div>

        <div className="text-xs text-gray-400 font-mono">
          TOTAL ACCOUNTS: <strong className="text-white">{filtered.length}</strong>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-24 text-gray-500 text-xs">
            Querying Firebase Auth-tied account profiles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-24 border border-dashed border-white/5 rounded-3xl text-gray-500 text-xs">
            No matching registered accounts found. Add a team member or clear search filters.
          </div>
        ) : (
          filtered.map((u) => {
            const hasBio = !!(u as any).bio;
            const skills: string[] = (u as any).skills || [];

            return (
              <div 
                key={u.uid} 
                className="p-5 rounded-2xl border border-white/5 bg-[#050b14]/40 hover:bg-[#071324] hover:border-white/10 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Diagonal color flash */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none ${
                  u.role === 'admin' 
                    ? 'bg-rose-500/10' 
                    : u.role === 'team' 
                    ? 'bg-[#00E5FF]/10' 
                    : 'bg-emerald-500/10'
                }`} />

                <div className="space-y-4">
                  
                  {/* Top Line */}
                  <div className="flex justify-between items-start">
                    <img 
                      src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || '')}`} 
                      alt={u.name} 
                      className="w-12 h-12 rounded-full border border-white/10 object-cover"
                    />

                    <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      u.role === 'admin' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                        : u.role === 'team' 
                        ? 'bg-[#00E5FF]/10 text-electric border-[#00E5FF]/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  {/* Profile info */}
                  <div>
                    <h3 className="text-sm font-bold text-white font-display leading-tight">{u.name || 'Anonymous User'}</h3>
                    <p className="text-[11px] font-mono text-[#00E5FF] font-medium leading-none mt-1">
                      {(u as any).designation || (u.role === 'client' ? 'Subscribed Client' : 'Code Crafter Engineer')}
                    </p>
                    {hasBio && (
                      <p className="text-gray-400 text-xs line-clamp-2 mt-3 text-sans font-normal leading-relaxed">
                        {(u as any).bio}
                      </p>
                    )}
                  </div>

                  {/* Skills array */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skills.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="bg-white/[0.03] border border-white/5 text-gray-400 text-[9px] px-2 py-0.5 rounded font-mono">
                          {sk}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[9px] text-gray-500 font-mono flex items-center pl-1">+{skills.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs text-gray-400 font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                      <span className="truncate max-w-[190px]">{u.email}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                      title="View Profile Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openEditForm(u)}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                      title="Edit Account Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all opacity-80 group-hover:opacity-100"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#080d1a] p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-5 right-5 p-1 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <img 
                  src={selectedUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.name || '')}`} 
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full border border-electric"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold font-display text-white">{selectedUser.name}</h3>
                  <p className="text-xs font-mono text-cyan-400 font-medium">
                    {(selectedUser as any).designation || 'Engineering Lead'}
                  </p>
                  <span className="text-[9px] font-mono uppercase bg-white/5 px-2.5 py-0.5 rounded border border-white/10 text-gray-400 inline-block mt-1">
                    Clearance: {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-500 block">EMAIL ADDRESS</span>
                  <p className="text-white font-medium break-all">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-500 block">CONTACT TELEPHONE</span>
                  <p className="text-white font-medium">{(selectedUser as any).phone || 'N/A'}</p>
                </div>
              </div>

              {(selectedUser as any).bio && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 block">BIOGRAPHY</span>
                  <p className="text-gray-300 leading-relaxed">{(selectedUser as any).bio}</p>
                </div>
              )}

              {((selectedUser as any).skills || []).length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-500 block mb-1">CAPABILITIES & SKILLS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {((selectedUser as any).skills || []).map((sk: string, idx: number) => (
                      <span key={idx} className="bg-[#00E5FF]/5 border border-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-mono px-2.5 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-white/5 shrink-0">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 block">LINKEDIN URL</span>
                  <a href={(selectedUser as any).linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>View LinkedIn profile</span>
                  </a>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 block">GITHUB CHANNEL</span>
                  <a href={(selectedUser as any).github} target="_blank" rel="noreferrer" className="text-gray-300 hover:underline flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    <span>Browse repos</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#030712]/85 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#080d1a] p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-electric" />
                  <span>{editingId ? 'Edit Team Member' : 'Add Team Member'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                
                {/* Photo Seed */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                  <img src={formImage} alt="Preview" className="w-14 h-14 rounded-full border border-white/10" />
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[10px] font-mono text-gray-500 block">AVATAR IMAGE SEED URL</label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Dicebear or public resource url"
                      className="w-full bg-[#03060f] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">FULL LEGAL NAME</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="jane@codecrafers.co"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">DESIGNATION POSITION</label>
                    <input
                      type="text"
                      required
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      placeholder="Solutions Consultant"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">CONTACT PHONE</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+1 (555) 0124"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'team', 'client'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`py-2 rounded-xl border font-mono font-bold uppercase transition-all tracking-wide ${
                        formRole === role
                          ? 'bg-electric/15 border-electric text-electric shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                          : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {role} Role
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block">BIO PARAGRAPH</label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Brief architectural expertise summary..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block">SKILLS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="Java, Python, Spark, Jenkins"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">LINKEDIN PROFILE</label>
                    <input
                      type="text"
                      value={formLinkedin}
                      onChange={(e) => setFormLinkedin(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">GITHUB PROFILE</label>
                    <input
                      type="text"
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white hover:bg-electric text-navy font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(255,255,255,0.1)] active:scale-95"
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
