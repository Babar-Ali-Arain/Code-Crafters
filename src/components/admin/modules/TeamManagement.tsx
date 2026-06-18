import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Trash2, Edit, Check, X, Search, Globe, Mail, Phone, 
  Linkedin, Github, Layout, Image as ImageIcon, Sparkles, Eye, UserCheck,
  Award, Briefcase, Twitter, FolderSync
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, setDoc, writeBatch 
} from 'firebase/firestore';
import { UserProfile } from '../../layout/FirebaseProvider';
import { TEAM_MEMBERS, TeamMember } from '../../../lib/team-data';
import ImageEditor from './ImageEditor';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';

interface TeamManagementProps {
  onLogActivity: (action: string, details: string) => void;
}

export default function TeamManagement({ onLogActivity }: TeamManagementProps) {
  // Navigation Tabs
  const [subTab, setSubTab] = useState<'public-team' | 'accounts'>('public-team');

  // Firebase Collections States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');

  // Selected User or Team Member for Details view Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<any | null>(null);

  // General Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'account' | 'public-team'>('public-team');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State variables
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'team' | 'client'>('team');
  const [formDesignation, setFormDesignation] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formImage, setFormImage] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  
  // Public Team specific fields
  const [formDepartment, setFormDepartment] = useState<'Leadership' | 'Engineering' | 'Design' | 'Strategy'>('Engineering');
  const [formFocus, setFormFocus] = useState('');
  const [formExperience, setFormExperience] = useState('');

  // 1. Fetch Platform Accounts ('users' collection)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as any);
      });
      list.sort((a, b) => {
        const order = { admin: 1, team: 2, client: 3 };
        return (order[a.role] || 3) - (order[b.role] || 3);
      });
      setUsers(list);
      setLoadingUsers(false);
    }, (err) => {
      console.error('Error fetching users:', err);
      setLoadingUsers(false);
    });

    return () => unsub();
  }, []);

  // 2. Fetch Public Team Members ('team' collection)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'team'), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTeamMembers(list);
      setLoadingTeam(false);
    }, (err) => {
      console.error('Error fetching dynamic team:', err);
      setLoadingTeam(false);
    });

    return () => unsub();
  }, []);

  // 3. Automated First-Time Seeding of Public Team
  const seedDefaultTeam = async () => {
    if (teamMembers.length > 0) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      TEAM_MEMBERS.forEach((m, idx) => {
        const docId = `seeded_${idx}_` + m.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const docRef = doc(db, 'team', docId);
        
        batch.set(docRef, {
          name: m.name,
          role: m.role,
          department: m.department,
          bio: m.bio,
          image: m.image,
          socials: {
            linkedin: m.socials?.linkedin || '',
            twitter: m.socials?.twitter || '',
            github: m.socials?.github || '',
            email: m.socials?.email || ''
          },
          skills: m.skills || [],
          focus: m.focus || '',
          experience: m.experience || '',
          createdAt: new Date(),
          order: idx
        });
      });

      await batch.commit();
      onLogActivity('Seeded Core Team', 'Admin seeded the default 10 core specialists into database.');
    } catch (err) {
      console.error('Seeding core team database failed: ', err);
      alert('Failed to pre-populate database from defaults. You may add team members manually.');
    } finally {
      setSeeding(false);
    }
  };

  // Form Operations
  const openAddForm = (type: 'account' | 'public-team') => {
    setFormType(type);
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
    setFormTwitter('https://twitter.com/');
    setFormDepartment('Engineering');
    setFormFocus('Cloud Architectures & Dynamic Client Solutions');
    setFormExperience('5+ Years');
    
    // Auto-generate some fancy initial avatar seed
    const seed = Math.random().toString(36).substring(7);
    setFormImage(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0f172a,1e293b&textColor=38bdf8`);
    setImageMode('url');
    setIsFormOpen(true);
  };

  const openEditForm = (item: any, type: 'account' | 'public-team') => {
    setFormType(type);
    setEditingId(type === 'account' ? item.uid : item.id);
    setFormName(item.name || '');
    setFormEmail(item.email || item.socials?.email || '');
    setFormBio(item.bio || '');
    setFormSkills(Array.isArray(item.skills) ? item.skills.join(', ') : (item.skills || ''));
    setFormLinkedin(item.linkedin || item.socials?.linkedin || '');
    setFormGithub(item.github || item.socials?.github || '');
    setFormTwitter(item.twitter || item.socials?.twitter || '');

    if (type === 'account') {
      setFormRole(item.role || 'team');
      setFormDesignation(item.designation || 'Senior Software Engineer');
      setFormPhone(item.phone || '');
      const img = item.photoURL || '';
      setFormImage(img);
      setImageMode(img.startsWith('data:image/') ? 'upload' : 'url');
    } else {
      setFormDepartment(item.department || 'Engineering');
      setFormDesignation(item.role || 'Senior Software Engineer'); // Role is Designation
      setFormFocus(item.focus || '');
      setFormExperience(item.experience || '');
      const img = item.image || '';
      setFormImage(img);
      setImageMode(img.startsWith('data:image/') ? 'upload' : 'url');
    }
    
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const parsedSkills = formSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      if (formType === 'account') {
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
          photoURL: formImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formName)}`,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, 'users', editingId), payload);
          onLogActivity('Updated User/Team Member', `${formName} (${formRole}) - UID: ${editingId}`);
        } else {
          const customUid = 'team_' + Math.random().toString(36).substring(2, 9);
          payload.uid = customUid;
          payload.createdAt = serverTimestamp();
          await setDoc(doc(db, 'users', customUid), payload);
          onLogActivity('Added User/Team Member', `Created ${formName} as ${formRole}`);
        }
      } else {
        // Public dynamic team profile
        const payload: any = {
          name: formName.trim(),
          role: formDesignation.trim() || 'Software Specialist', // Public Team calls designation 'role'
          department: formDepartment,
          bio: formBio,
          image: formImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formName)}`,
          socials: {
            linkedin: formLinkedin,
            github: formGithub,
            twitter: formTwitter,
            email: formEmail
          },
          skills: parsedSkills,
          focus: formFocus,
          experience: formExperience,
          updatedAt: serverTimestamp()
        };

        if (editingId) {
          await updateDoc(doc(db, 'team', editingId), payload);
          onLogActivity('Modified Public Team Space', `Edited team profile details for ${formName}`);
        } else {
          payload.createdAt = serverTimestamp();
          payload.order = teamMembers.length;
          await addDoc(collection(db, 'team'), payload);
          onLogActivity('Created Public Team Profile', `Added ${formName} (${formDepartment}) to dynamic directory.`);
        }
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to edit team member credentials: ' + err.message);
    }
  };

  const handleDeleteItem = async (id: string, name: string, type: 'account' | 'public-team') => {
    if (!window.confirm(`Are you absolutely sure you want to remove ${name} from ${type === 'account' ? 'Registered User accounts' : 'Public dynamic team workspace'}?`)) return;

    try {
      if (type === 'account') {
        await deleteDoc(doc(db, 'users', id));
        onLogActivity('Deleted User Profile', `Removed user registration index ${name} (UID: ${id})`);
      } else {
        await deleteDoc(doc(db, 'team', id));
        onLogActivity('Deleted Public Team Profile', `Removed ${name} from public roster list (ID: ${id})`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Delete operation unauthorized or server connectivity lost: ' + err.message);
    }
  };

  // Searching Lists Logic
  const filteredAccounts = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u as any).designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeamMembers = teamMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.skills || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'All' || m.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 text-slate-800 font-sans pb-10">
      
      {/* 1. Upper Header with dynamic control panel switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Team, Rosters & Accounts</h2>
          <p className="text-slate-500 text-xs mt-1">Configure both the public-facing specialist roster (Main Website) and internal portal access credentials.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {subTab === 'public-team' && teamMembers.length === 0 && (
            <button
              onClick={seedDefaultTeam}
              disabled={seeding}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <FolderSync className="w-4 h-4 animate-spin-slow" />
              <span>{seeding ? 'Seeding...' : 'Seed Default 10 Specialists'}</span>
            </button>
          )}

          <button
            onClick={() => openAddForm(subTab === 'accounts' ? 'account' : 'public-team')}
            className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {subTab === 'accounts' ? 'Access Account' : 'Core Specialist'}</span>
          </button>
        </div>
      </div>

      {/* Roster Controls Switch tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-1.5 bg-slate-100/80 border border-slate-200/50 rounded-2xl max-w-xl">
        <button
          onClick={() => { setSubTab('public-team'); setSearchTerm(''); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
            subTab === 'public-team'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          💻 Public Team Directory
        </button>
        <button
          onClick={() => { setSubTab('accounts'); setSearchTerm(''); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
            subTab === 'accounts'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🔐 Portal Accounts ({users.length})
        </button>
      </div>

      {/* 2. Global search inputs & filter buttons Row */}
      <div className="flex flex-col gap-4 items-center justify-between sm:flex-row bg-white p-5 rounded-[24px] border border-slate-100/60 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={subTab === 'accounts' ? "Search account name, emails..." : "Search specialists, skills..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#4f46e5] font-sans transition-colors"
          />
        </div>

        {subTab === 'public-team' && (
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {['All', 'Leadership', 'Engineering', 'Design', 'Strategy'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer border ${
                  selectedDeptFilter === dept
                    ? 'bg-slate-900 border-slate-900 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-950'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}

        <div className="text-xs text-slate-400 font-mono self-end sm:self-auto shrink-0">
          FILTERED: <strong className="text-slate-800">{subTab === 'accounts' ? filteredAccounts.length : filteredTeamMembers.length}</strong>
        </div>
      </div>

      {/* ====================================================
          TAB A: PUBLIC TEAM DIRECTORY VIEW
          ==================================================== */}
      {subTab === 'public-team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingTeam ? (
            <div className="col-span-full text-center py-24 text-slate-400 text-xs">
              Contacting Cloud Firestore... Querying Dynamic Team Profiles
            </div>
          ) : filteredTeamMembers.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-slate-200 bg-slate-50 rounded-3xl text-slate-500 text-xs shadow-xs">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 mb-1">No Team Specialists Found</p>
              <p className="text-slate-400 max-w-md mx-auto px-5 mb-5">
                The Firestore 'team' collection is currently empty. Seed from core high-fidelity developers or create customized profiles.
              </p>
              {teamMembers.length === 0 && (
                <button
                  onClick={seedDefaultTeam}
                  disabled={seeding}
                  className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <FolderSync className="w-4 h-4" />
                  <span>Seed Default 10 Specialists Now</span>
                </button>
              )}
            </div>
          ) : (
            filteredTeamMembers.map((member) => {
              const skills: string[] = member.skills || [];

              return (
                <div 
                  key={member.id} 
                  className="p-6 rounded-[32px] border border-slate-100/60 bg-white hover:border-[#4f46e5]/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] pointer-events-none transition-colors duration-500 bg-indigo-50/40 group-hover:bg-indigo-100/30" />

                  <div className="space-y-5 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-[16px] overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                          }}
                        />
                      </div>

                      <span className="text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 shadow-xs">
                        {member.department}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 font-display leading-tight">{member.name}</h3>
                      <p className="text-[11px] font-mono text-emerald-600 font-bold leading-none mt-1.5">
                        {member.role}
                      </p>
                      
                      {member.experience && (
                        <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-2">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Exp: {member.experience}</span>
                        </div>
                      )}

                      <p className="text-slate-500 text-xs line-clamp-3 mt-3 text-sans font-normal leading-relaxed">
                        {member.bio}
                      </p>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-50">
                        {skills.map((sk, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded-lg font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-5 relative z-10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTeamMember(member)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-xs cursor-pointer"
                        title="View Detailed Workspace Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditForm(member, 'public-team')}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-xs cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(member.id, member.name, 'public-team')}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all shadow-xs cursor-pointer"
                      title="Remove Member from Directory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ====================================================
          TAB B: PORTAL ACCOUNTS VIEW
          ==================================================== */}
      {subTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingUsers ? (
            <div className="col-span-full text-center py-24 text-slate-400 text-xs">
              Querying Firebase Auth-tied account profiles...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-slate-50 rounded-3xl text-slate-500 text-xs shadow-sm">
              No matching registered accounts found. Add a team member or clear search filters.
            </div>
          ) : (
            filteredAccounts.map((u) => {
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
                        src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || '')}`} 
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
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm cursor-pointer"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditForm(u, 'account')}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm cursor-pointer"
                        title="Edit Account Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(u.uid, u.name || 'Anonymous', 'account')}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all shadow-sm cursor-pointer"
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
      )}

      {/* Details Modals (Public Team Member) */}
      <AnimatePresence>
        {selectedTeamMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedTeamMember(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <button 
                onClick={() => setSelectedTeamMember(null)}
                className="absolute top-5 right-5 p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                  <img 
                    src={selectedTeamMember.image} 
                    alt={selectedTeamMember.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-800">{selectedTeamMember.name}</h3>
                  <p className="text-xs font-mono text-indigo-700 font-bold mt-1">
                    {selectedTeamMember.role}
                  </p>
                  <span className="text-[9px] font-mono uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-emerald-700 inline-block mt-2 font-bold shadow-xs">
                    {selectedTeamMember.department} Section
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">FOCUS EXPERTISE</span>
                  <p className="text-slate-700 font-semibold">{selectedTeamMember.focus || 'N/A'}</p>
                </div>
                <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">ROSTER TENURE</span>
                  <p className="text-slate-700 font-semibold">{selectedTeamMember.experience || 'N/A'}</p>
                </div>
              </div>

              {selectedTeamMember.bio && (
                <div className="space-y-2 text-xs border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">OFFICIAL BIOGRAPHY</span>
                  <p className="text-slate-600 leading-relaxed font-medium">{selectedTeamMember.bio}</p>
                </div>
              )}

              {(selectedTeamMember.skills || []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block mb-2 px-1">VERIFIED CAPABILITIES</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeamMember.skills.map((sk: string, idx: number) => (
                      <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-3 py-1 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono pt-5 border-t border-slate-100 shrink-0">
                {selectedTeamMember.socials?.linkedin && (
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-bold block uppercase">LinkedIn</span>
                    <a href={selectedTeamMember.socials.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-bold">
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </a>
                  </div>
                )}
                {selectedTeamMember.socials?.github && (
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Github</span>
                    <a href={selectedTeamMember.socials.github} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline flex items-center gap-1 font-bold">
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  </div>
                )}
                {selectedTeamMember.socials?.email && (
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-bold block uppercase">Direct eMail</span>
                    <a href={`mailto:${selectedTeamMember.socials.email}`} className="text-indigo-600 hover:underline flex items-center gap-1 font-bold truncate max-w-[150px]">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Mailto</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modals (Registered Users) */}
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
                className="absolute top-5 right-5 p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                <img 
                  src={selectedUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser.name || '')}`} 
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

      {/* CREATE / EDIT FORM MODAL CONTAINER */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-850 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                  <span>
                    {editingId 
                      ? `Edit ${formType === 'account' ? 'Portal Operator Account' : 'Core Public Roster Profile'}` 
                      : `Create ${formType === 'account' ? 'New Portal Account' : 'New Specialist Directory Profile'}`}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-sm font-sans">
                
                {/* Image Input Selection */}
                <div id="image-setting bg-card-panel" className="space-y-3.5 p-5 rounded-3xl border border-slate-200 bg-slate-50/30">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#4f46e5]" />
                      <span className="text-xs font-bold text-slate-700 font-display">Staff & Team Photo Directory Setup</span>
                    </div>

                    {formImage && formImage.startsWith('data:image/') && (
                      <span className="text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 shadow-xs flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Custom Crop Loaded
                      </span>
                    )}
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex p-1 bg-slate-100/80 rounded-xl max-w-sm gap-1 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        imageMode === 'upload'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Local Picture Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        imageMode === 'url'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Dynamic Placeholder URL
                    </button>
                  </div>

                  {/* Content Switcher */}
                  {imageMode === 'upload' ? (
                    <div className="space-y-4 p-1 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                      <ImageEditor 
                        initialImageUrl={formImage}
                        onImageCropped={(base64) => {
                          setFormImage(base64);
                        }}
                      />
                      {formImage && (
                        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 mt-2">
                          <img 
                            src={formImage} 
                            alt="Cropped Preview" 
                            className="w-11 h-11 rounded-xl object-cover border border-slate-300 shadow-xs" 
                          />
                          <div>
                            <p className="text-[10px] font-semibold text-indigo-950">Cropped Output Final Preview</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Will be uploaded to database document</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs flex items-center justify-center shrink-0">
                        {formImage ? (
                          <img 
                            src={formImage} 
                            alt="URL Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formName || 'R')}`;
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Network Location / Avatar Seed String</label>
                        <input
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="https://example.com/avatar.png or Dicebear seed code"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Shared Identity Fields */}
                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Display Full Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Business / Personal Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="specialist@codecrafters.co"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {formType === 'public-team' ? (
                  /* Public Dynamic Team Specific Inputs */
                  <>
                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Roster Role (Designation)</label>
                        <input
                          type="text"
                          required
                          value={formDesignation}
                          onChange={(e) => setFormDesignation(e.target.value)}
                          placeholder="Lead Devops Architect"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Roster Seniority (Tenure) </label>
                        <input
                          type="text"
                          value={formExperience}
                          onChange={(e) => setFormExperience(e.target.value)}
                          placeholder="6+ Years"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Core Technical Focus</label>
                        <input
                          type="text"
                          value={formFocus}
                          onChange={(e) => setFormFocus(e.target.value)}
                          placeholder="Database normalization & containerization"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Corporate Department</label>
                        <select
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-850 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        >
                          <option value="Leadership">Leadership</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Design">Design</option>
                          <option value="Strategy">Strategy</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Internal Platform Accounts Specific Inputs */
                  <>
                    <div className="grid grid-cols-2 gap-5 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Internal Position</label>
                        <input
                          type="text"
                          required
                          value={formDesignation}
                          onChange={(e) => setFormDesignation(e.target.value)}
                          placeholder="Corporate Solutions Engineer"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Internal Phone Line</label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="+1 (555) 0184"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Access Credentials (Role Clearence)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['admin', 'team', 'client'] as const).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setFormRole(role)}
                            className={`py-3 rounded-xl border font-mono font-bold uppercase transition-all tracking-wide text-[10px] shadow-sm cursor-pointer ${
                              formRole === role
                                ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            {role} clearance
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Shared Experience, Bio, Skills and Social Media blocks */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Specialist Biography (Public Summary)</label>
                  <textarea
                    rows={3}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Brief description of specialized expertise, past performance, and corporate responsibilities..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Technical Skills & Capabilities (Comma Separated)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="Python, React, GCP, BigQuery, Docker"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formLinkedin}
                      onChange={(e) => setFormLinkedin(e.target.value)}
                      placeholder="https://linkedin.com..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">GitHub URL</label>
                    <input
                      type="text"
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      placeholder="https://github.com..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">Twitter URL/handle</label>
                    <input
                      type="text"
                      value={formTwitter}
                      onChange={(e) => setFormTwitter(e.target.value)}
                      placeholder="https://twitter.com..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#4f46e5] transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-600 transition-all shadow-xs text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    Deploy Profile Changes
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
