import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Award, Plus, Trash2, Edit, Check, Eye, EyeOff, Search, Calendar, 
  MapPin, Phone, Mail, FolderOpen, Image as ImageIcon, Send, Sparkles, 
  Globe, Star, Lock, Settings, Activity, ShieldAlert, CheckCircle, XCircle, 
  Trash, ArrowRight, Save, Layout, Sliders, Type, FileText, FileSpreadsheet,
  FileImage, Clock
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../../lib/firebase';
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, setDoc, query, orderBy, limit 
} from 'firebase/firestore';
import { Client, Blog, Testimonial, Meeting, ActivityLog, WebsiteContent } from '../types';

interface AdminPanelsProps {
  activePanel: 'clients' | 'blogs' | 'media' | 'testimonials' | 'appointments' | 'cms' | 'settings' | 'logs';
  logs: ActivityLog[];
  onLogActivity: (action: string, details: string) => void;
}

export default function AdminPanels({ activePanel, logs, onLogActivity }: AdminPanelsProps) {
  return (
    <div className="space-y-6 text-white font-sans">
      {activePanel === 'clients' && <ClientManager onLogActivity={onLogActivity} />}
      {activePanel === 'blogs' && <BlogManager onLogActivity={onLogActivity} />}
      {activePanel === 'media' && <MediaLibrary onLogActivity={onLogActivity} />}
      {activePanel === 'testimonials' && <TestimonialManager onLogActivity={onLogActivity} />}
      {activePanel === 'appointments' && <AppointmentSystem onLogActivity={onLogActivity} />}
      {activePanel === 'cms' && <CmsManager onLogActivity={onLogActivity} />}
      {activePanel === 'settings' && <SettingsPanel onLogActivity={onLogActivity} />}
      {activePanel === 'logs' && <ActivityLogList logs={logs} />}
    </div>
  );
}

// ==========================================
// 1. CLIENT MANAGER SUBCOMPONENT
// ==========================================
function ClientManager({ onLogActivity }: { onLogActivity: any }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<Client['status']>('lead');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'clients'), (snap) => {
      const list: Client[] = [];
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Client));
      setClients(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'clients');
    });
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('lead');
    setFormNotes('');
    setIsFormOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditingId(c.id || null);
    setFormName(c.clientName);
    setFormCompany(c.company || '');
    setFormEmail(c.email);
    setFormPhone(c.phone || '');
    setFormStatus(c.status);
    setFormNotes(c.notes || '');
    setIsFormOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    try {
      const payload: any = {
        clientName: formName.trim(),
        company: formCompany.trim() || 'Independent Client',
        email: formEmail.trim(),
        phone: formPhone.trim(),
        status: formStatus,
        notes: formNotes.trim(),
        projects: []
      };

      if (editingId) {
        await updateDoc(doc(db, 'clients', editingId), payload);
        onLogActivity('Updated Client Account', `Modified account for "${formName}"`);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'clients'), payload);
        onLogActivity('Created Client Account', `Registered new corporate client "${formName}"`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (c: Client) => {
    if (!window.confirm(`Are you sure you want to remove client: ${c.clientName}?`)) return;
    try {
      await deleteDoc(doc(db, 'clients', c.id!));
      onLogActivity('Removed Client Account', `Deleted client profile: ${c.clientName}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = clients.filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-semibold">Client Relations Database</h2>
          <p className="text-gray-400 text-xs">Track enterprise corporate clients, communication logs, and associated project lists.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-electric hover:bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Add Client Record</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search accounts, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050b14]/55 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <span className="text-xs text-gray-500 font-mono">ACTIVE CLIENTS: {filtered.length}</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#050b14]/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-gray-400 uppercase tracking-wider text-[10px] font-mono">
              <th className="p-4 font-normal">Client details</th>
              <th className="p-4 font-normal">Contact info</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Company Notes</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Retrieving operational channels...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active clients registered.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{c.clientName}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{c.company}</div>
                  </td>
                  <td className="p-4 space-y-0.5 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-600" /><span>{c.email}</span></div>
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-600" /><span>{c.phone}</span></div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${
                      c.status === 'active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : c.status === 'inactive' 
                        ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{c.notes || 'No historical client logs recorded.'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(c)} className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-550 hover:text-red-400" title="Delete"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative bg-[#080d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md z-12 space-y-4">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-electric" /><span>{editingId ? 'EDIT CLIENT DETAILS' : 'ADD NEW CLIENT'}</span></h3>
              <form onSubmit={onSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">CLIENT NAME</label><input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">COMPANY NAME</label><input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">EMAIL ADDRESS</label><input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">PHONE NUMBER</label><input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-mono">ACCOUNT STATUS</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full bg-navy border border-white/5 rounded-lg p-2.5 text-white">
                    <option value="lead">Lead / Proposal</option>
                    <option value="active">Active Relationship</option>
                    <option value="inactive">Inactive / Archive</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-gray-400 block font-mono">ACCOUNT LOG NOTES</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white resize-none" /></div>
                <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-3.5 py-2 border border-white/5 rounded-lg text-gray-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-white text-navy font-bold rounded-lg uppercase tracking-wider">Save Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. BLOG MANAGER (CMS BLOGS)
// ==========================================
function BlogManager({ onLogActivity }: { onLogActivity: any }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  
  // SEO Meta fields (Pillar details!)
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  useEffect(() => {
    return onSnapshot(collection(db, 'blogs'), (snap) => {
      const list: Blog[] = [];
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Blog));
      setBlogs(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'blogs');
    });
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormSlug('');
    setFormImage('https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600');
    setFormContent('');
    setFormTags('Tech, Software Engineering');
    setFormPublished(true);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setIsFormOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditingId(b.id || null);
    setFormTitle(b.title);
    setFormSlug(b.slug);
    setFormImage(b.featuredImage || '');
    setFormContent(b.content);
    setFormTags(Array.isArray(b.tags) ? b.tags.join(', ') : b.tags || '');
    setFormPublished(b.published);
    setFormSeoTitle(b.seoTitle || '');
    setFormSeoDesc(b.seoDescription || '');
    setFormSeoKeywords(b.seoKeywords || '');
    setIsFormOpen(true);
  };

  // Helper autocomplete slug
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingId) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const parsedTags = formTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const payload: any = {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        featuredImage: formImage.trim(),
        content: formContent.trim(),
        tags: parsedTags,
        published: formPublished,
        seoTitle: formSeoTitle.trim() || formTitle.trim(),
        seoDescription: formSeoDesc.trim() || formContent.substring(0, 150).trim(),
        seoKeywords: formSeoKeywords.trim()
      };

      if (editingId) {
        await updateDoc(doc(db, 'blogs', editingId), payload);
        onLogActivity('Updated Blog Post', `Modified article: "${formTitle}"`);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'blogs'), payload);
        onLogActivity('Created Blog Post', `Published new article: "${formTitle}"`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (b: Blog) => {
    if (!window.confirm(`Are you sure you want to delete blog: ${b.title}?`)) return;
    try {
      await deleteDoc(doc(db, 'blogs', b.id!));
      onLogActivity('Removed Article', `Deleted blogs post: "${b.title}"`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-semibold">Technical Press & CMS Logs</h2>
          <p className="text-gray-400 text-xs text-sans font-normal">Draft editorial documentation, engineering case studies, or search engine structured cards (SEO).</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-electric hover:bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search articles by title, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050b14]/55 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
          />
        </div>
        <span className="text-xs text-gray-500 font-mono">COMPLIED BLOGS: {blogs.length}</span>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Querying technical literature...</div>
        ) : blogs.length === 0 ? (
          <div className="col-span-full text-center py-24 border border-dashed border-white/5 rounded-2xl text-gray-500">No blog articles recorded. Start documenting your sprints!</div>
        ) : (
          blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map(b => (
            <div key={b.id} className="rounded-2xl border border-white/5 bg-[#050b14]/40 overflow-hidden flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="h-40 relative">
                <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] to-transparent" />
                <span className={`absolute bottom-3 right-3 text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  b.published 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/15 border border-rose-500/25 text-rose-450'
                }`}>
                  {b.published ? 'Live Publication' : 'Draft Copy'}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <h4 className="font-bold text-white font-display text-sm line-clamp-2 leading-tight">{b.title}</h4>
                <p className="text-gray-400 text-xs line-clamp-2">{b.content}</p>
                <div className="flex flex-wrap gap-1 font-mono text-[9px] text-[#00E5FF]">
                  {b.tags.slice(0,3).map((tg, i) => <span key={i}>#{tg}</span>)}
                </div>
              </div>
              <div className="p-4 border-t border-white/5 flex justify-between items-center text-right bg-white/[0.01]">
                <span className="text-[9px] font-mono text-gray-500 truncate max-w-[120px]">{b.slug}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-1 px-2 border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white rounded-lg text-[9px] uppercase font-bold font-mono">Configure</button>
                  <button onClick={() => onDelete(b)} className="p-1 px-2 border border-white/5 hover:border-red-500/15 text-gray-500 hover:text-red-400 rounded-lg text-[9px] uppercase font-bold font-mono">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative bg-[#080d1a] border border-[#ffffff15] rounded-3xl p-6 sm:p-8 w-full max-w-2xl z-12 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-electric" /><span>{editingId ? 'EDIT EDITORIAL BLUEPRINT' : 'WRITE FRESH LITERATURE'}</span></h3>
              <form onSubmit={onSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">ARTICLE TITLE</label><input type="text" required value={formTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Transforming Sprints" className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">ARTICLE SLUG URL</label><input type="text" required value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="transforming-sprints" className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">FEATURED BANNER IMAGE URL</label><input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                  <div className="space-y-1"><label className="text-gray-400 block font-mono">TAGS (COMMA SEPARATED)</label><input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="SaaS, UX Design" className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white" /></div>
                </div>

                <div className="space-y-1"><label className="text-gray-400 block font-mono">EDITORIAL ARTICLE CONTENT</label><textarea required value={formContent} onChange={e => setFormContent(e.target.value)} rows={5} placeholder="Draft the content using styled typography layout specs..." className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-white resize-none" /></div>

                {/* SEO Configurations Expansion Panels */}
                <div className="p-4 border border-white/5 bg-white/[0.01] rounded-2xl space-y-3">
                  <span className="text-[9px] font-bold font-mono uppercase text-gray-500 tracking-wider block">SEARCH ENGINE OPTIMIZATION (SEO) PARAMETERS</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-gray-500 block font-mono">METADATA TITLE</label><input type="text" value={formSeoTitle} onChange={e => setFormSeoTitle(e.target.value)} className="w-full bg-[#03060f]/60 border border-white/5 rounded-lg p-2 text-white" /></div>
                    <div className="space-y-1"><label className="text-gray-500 block font-mono">KEYWORD KEYPHRASES</label><input type="text" value={formSeoKeywords} onChange={e => setFormSeoKeywords(e.target.value)} placeholder="crafting, developer" className="w-full bg-[#03060f]/60 border border-white/5 rounded-lg p-2 text-white" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-gray-500 block font-mono">METADATA DESCRIPTION EXCERPT</label><input type="text" value={formSeoDesc} onChange={e => setFormSeoDesc(e.target.value)} className="w-full bg-[#03060f]/60 border border-white/5 rounded-lg p-2 text-white" /></div>
                </div>

                <div className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.01] rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-white">Live Publication Toggle</span>
                    <p className="text-[10px] text-gray-500">Determine if visible to indexing bots and readers.</p>
                  </div>
                  <button type="button" onClick={() => setFormPublished(!formPublished)} className={`px-4 py-1.5 rounded-lg border font-mono text-[9px] uppercase font-bold ${
                    formPublished ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                  }`}>{formPublished ? 'Live Publication' : 'Draft Stage'}</button>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-white/5 animate-pulse">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-3.5 py-2 border border-white/5 rounded-lg text-gray-400">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-white text-navy font-bold rounded-lg uppercase tracking-wider">Commit Publication</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 3. MEDIA LIBRARY (MOCK/SIMULATED CLOUD ENGINE)
// ==========================================
function MediaLibrary({ onLogActivity }: { onLogActivity: any }) {
  const [mediaList, setMediaList] = useState<any[]>([
    { id: '1', name: 'corporate_hq.webp', type: 'image', size: '240 KB', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' },
    { id: '2', name: 'sprint_architecture_map.png', type: 'image', size: '1.2 MB', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c' },
    { id: '3', name: 'client_legal_nda_v2.pdf', type: 'doc', size: '144 KB', url: '#' },
    { id: '4', name: 'weekly_sales_growth.csv', type: 'data', size: '42 KB', url: '#' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeUrl = URL.createObjectURL(file);
    const newFile = {
      id: String(Date.now()),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : file.name.endsWith('.csv') || file.name.endsWith('.xlsx') ? 'data' : 'doc',
      size: `${(file.size / 1024).toFixed(0)} KB`,
      url: fakeUrl
    };

    setMediaList(prev => [newFile, ...prev]);
    onLogActivity('Uploaded Document to Media', `Successfully synchronized document file "${file.name}" to Cloud Storage CDN.`);
  };

  const handleRemove = (id: string, name: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
    onLogActivity('Deleted Asset', `Terminated document resource: "${name}"`);
  };

  const filtered = mediaList.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Media Library CDN</h2>
        <p className="text-gray-400 text-xs">Upload system banners, client templates, and general PDFs. Dynamic drag-and-drop synchronized.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#050b14]/40 p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5"><ImageIcon className="w-5 h-5 text-electric" /><span className="text-xs font-mono font-bold">DRAG AND DROP ENGINES ACTIVE</span></div>
        <input type="file" id="media-upload" className="hidden" onChange={handleFileUpload} />
        <label htmlFor="media-upload" className="px-4 py-2 bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer hover:bg-electric hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">Upload File Resource</label>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#050b14]/55 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map(media => (
          <div key={media.id} className="p-4 rounded-xl border border-white/5 bg-[#050b14]/25 hover:border-[#ffffff15] transition-all relative group flex flex-col justify-between h-44">
            
            <div className="h-24 bg-white/[0.01] rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
              {media.type === 'image' ? (
                <img src={media.url} alt="asset" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : media.type === 'data' ? (
                <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
              ) : (
                <FileText className="w-10 h-10 text-blue-400" />
              )}
            </div>

            <div className="pt-2 text-center">
              <h5 className="text-[11px] font-mono font-bold text-white truncate">{media.name}</h5>
              <span className="text-[9px] font-mono text-gray-500">{media.size}</span>
            </div>

            <button onClick={() => handleRemove(media.id, media.name)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. TESTIMONIAL MANAGER
// ==========================================
function TestimonialManager({ onLogActivity }: { onLogActivity: any }) {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(collection(db, 'testimonials'), (snap) => {
      const list: Testimonial[] = [];
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Testimonial));
      setReviews(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'testimonials');
    });
  }, []);

  const handleApprove = async (id: string, name: string, oldStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { approved: !oldStatus });
      onLogActivity('Toggled Review Approves', `Review from "${name}" configured as ${!oldStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm('Delete this testimonial rating?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      onLogActivity('Removed Review', `Removed testimonial item: "${name}"`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Testimonial Reviews Validation</h2>
        <p className="text-gray-400 text-xs text-sans">Audit and approve testimonials submitted by client accounts before public display rendering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-6 text-gray-500">Querying accolades...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed border-white/5 rounded-2xl text-gray-500">No testimonials submitted yet.</div>
        ) : (
          reviews.map(rev => (
            <div key={rev.id} className="p-5 rounded-2xl border border-white/5 bg-[#050b14]/40 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex gap-1">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <p className="text-gray-300 text-xs italic leading-relaxed">"{rev.review}"</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs text-mono bg-white/[0.01] p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <img src={rev.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.clientName)}`} alt={rev.clientName} className="w-8 h-8 rounded-full" />
                  <div>
                    <h5 className="font-bold text-white leading-none">{rev.clientName}</h5>
                    <span className="text-[9px] text-gray-500 tracking-wider block mt-0.5">{rev.position} @ {rev.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove(rev.id!, rev.clientName, rev.approved)} className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all border ${
                    rev.approved 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>{rev.approved ? 'Approved' : 'Pending'}</button>
                  <button onClick={() => handleRemove(rev.id!, rev.clientName)} className="p-1 rounded bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400"><Trash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. APPOINTMENT SYSTEM (CALENDAR & REQUESTS)
// ==========================================
function AppointmentSystem({ onLogActivity }: { onLogActivity: any }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(collection(db, 'meetings'), (snap) => {
      const list: Meeting[] = [];
      snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Meeting));
      // Sort: Next meetings first
      setMeetings(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'meetings');
    });
  }, []);

  const handleUpdateStatus = async (id: string, clientName: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'meetings', id), { status });
      onLogActivity('Updated Meeting Schedule', `Consultation booking with "${clientName}" marked: ${status.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Consultation Scheduling & Calendar</h2>
        <p className="text-gray-400 text-xs text-sans">Review inbound software consultations requested from prospective client accounts.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#050b14]/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-gray-500 text-[10px] uppercase font-mono">
              <th className="p-4 font-normal">Sponsor details</th>
              <th className="p-4 font-normal">Topic agenda</th>
              <th className="p-4 font-normal">Scheduled slot</th>
              <th className="p-4 font-normal">System Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Evaluating date parameters...</td></tr>
            ) : meetings.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No meeting bookings submitted.</td></tr>
            ) : (
              meetings.map(m => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{m.clientName}</div>
                    <div className="font-mono text-[10px] text-gray-500 mt-0.5">{m.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-300 block">{m.topic}</span>
                    <span className="text-[11px] text-gray-400 line-clamp-1 block mt-0.5">{m.message}</span>
                  </td>
                  <td className="p-4 space-y-0.5 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-600" /><span>{m.date}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-600" /><span>{m.time} ({m.duration} mins)</span></div>
                  </td>
                  <td className="p-4">
                    {m.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleUpdateStatus(m.id!, m.clientName, 'accepted')} className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono font-bold uppercase rounded border border-emerald-500/20 text-[9px]">Confirm</button>
                        <button onClick={() => handleUpdateStatus(m.id!, m.clientName, 'rejected')} className="px-2 py-1 bg-rose-500/15 text-rose-400 font-mono font-bold uppercase rounded border border-rose-500/20 text-[9px]">Decline</button>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 font-mono text-[9px] uppercase font-bold rounded border ${
                        m.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' : 'bg-gray-500/10 border-gray-550/15 text-gray-400'
                      }`}>{m.status}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 6. WEBSITE CONTENT CMS (SECTIONS CONTENT MANAGER)
// ==========================================
function CmsManager({ onLogActivity }: { onLogActivity: any }) {
  const [heroHeading, setHeroHeading] = useState('Transforming Ideas Into Powerful Digital Solutions');
  const [heroSub, setHeroSub] = useState('We help businesses, schools, startups, and organizations build modern websites, web applications, management systems, and digital experiences that drive growth and success.');
  const [aboutHeading, setAboutHeading] = useState('Turning Vision Into Digital Reality');
  const [aboutDesc, setAboutDesc] = useState('Code Crafters is a modern software company dedicated to building innovative digital solutions that help businesses, schools, startups, and organizations succeed in the digital world.');

  const handleSave = async (section: string) => {
    try {
      const payload = {
        section,
        title: section === 'hero' ? heroHeading : aboutHeading,
        description: section === 'hero' ? heroSub : aboutDesc,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'cms', section), payload);
      onLogActivity('Updated Landing Section CMS', `Synchronized customized texts for landing page ${section.toUpperCase()} portfolio layout.`);
      alert('CMS updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Landing Page CMS</h2>
        <p className="text-gray-400 text-xs">Dynamically configure headers, badges, and descriptors displayed on the public landing page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        
        {/* Hero settings */}
        <div className="p-6 rounded-2xl border border-white/5 bg-[#050b14]/40 space-y-4">
          <div className="pb-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase">HERO SECTION COPY</span>
            <Save className="w-4 h-4 text-electric cursor-pointer" onClick={() => handleSave('hero')} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">MAIN HEADLINE Title</label>
            <input type="text" value={heroHeading} onChange={e => setHeroHeading(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">SUBHEADLINE Description</label>
            <textarea rows={3} value={heroSub} onChange={e => setHeroSub(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white resize-none" />
          </div>
          <button onClick={() => handleSave('hero')} className="w-full py-2 bg-white text-navy font-bold rounded-lg text-[10px] uppercase tracking-wider">Save Hero Content</button>
        </div>

        {/* About section settings */}
        <div className="p-6 rounded-2xl border border-white/5 bg-[#050b14]/40 space-y-4">
          <div className="pb-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase">ABOUT US SECTION COPY</span>
            <Save className="w-4 h-4 text-electric cursor-pointer" onClick={() => handleSave('about')} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">MAIN STORY TITLE</label>
            <input type="text" value={aboutHeading} onChange={e => setAboutHeading(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">CORPORATE DESCRIPTION STORY</label>
            <textarea rows={3} value={aboutDesc} onChange={e => setAboutDesc(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white resize-none" />
          </div>
          <button onClick={() => handleSave('about')} className="w-full py-2 bg-white text-navy font-bold rounded-lg text-[10px] uppercase tracking-wider">Save About Content</button>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 7. GLOBAL SETTINGS PANEL
// ==========================================
function SettingsPanel({ onLogActivity }: { onLogActivity: any }) {
  const [compName, setCompName] = useState('Code Crafters');
  const [seoKey, setSeoKey] = useState('software engineering, digital solutions');
  const [appearanceColor, setAppearanceColor] = useState('#00E5FF');

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        companyName: compName,
        seoKeywords: seoKey,
        brandColor: appearanceColor,
        updatedAt: serverTimestamp()
      });
      onLogActivity('Configured Settings metadata', 'Finished adjusting global company tags & metadata properties.');
      alert('Global configurations deployed.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Branding Settings & Infrastructure</h2>
        <p className="text-gray-400 text-xs">Configure meta tagging keys, corporate signatures, client login paths, and general identity properties.</p>
      </div>

      <div className="p-6 rounded-2xl border border-white/5 bg-[#050b14]/40 max-w-lg space-y-4 font-sans">
        
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-500">COMPANY BRANDING SIGNATURE</label>
          <input type="text" value={compName} onChange={e => setCompName(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-500">SYSTEM GLOBAL META KEYPHRASES</label>
          <input type="text" value={seoKey} onChange={e => setSeoKey(e.target.value)} className="w-full bg-[#03060f] border border-white/5 rounded-lg p-2.5 text-xs text-white" />
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-mono text-gray-500">SYSTEM PRIMARY COLOR ACCENT</label>
          <div className="flex gap-2">
            {['#00E5FF', '#10B981', '#6366F1', '#EC4899', '#F59E0B'].map(clr => (
              <button 
                key={clr} 
                type="button" 
                onClick={() => setAppearanceColor(clr)} 
                className="w-10 h-10 rounded-full border border-white/20 relative cursor-pointer" 
                style={{ backgroundColor: clr }}
              >
                {appearanceColor === clr && <Check className="w-4 h-4 text-navy absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSaveSettings} className="w-full py-3 bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-electric">Save Identity Credentials</button>

      </div>
    </div>
  );
}

// ==========================================
// 8. SECURITY ACTIVITY LOGS LIST
// ==========================================
function ActivityLogList({ logs }: { logs: ActivityLog[] }) {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold">Security Activities Log</h2>
        <p className="text-gray-400 text-xs">Independent platform access logs. Synchronized from Firestore Security triggers.</p>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter security events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#050b14]/55 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs">No transactions tracked during this session.</div>
        ) : (
          filtered.map(log => (
            <div key={log.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{log.action}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 break-all">{log.details}</p>
                </div>
              </div>
              <div className="text-right font-mono text-[9px] text-gray-400">
                <span className="font-bold text-gray-300 block">{log.userEmail}</span>
                <span className="text-gray-500 block mt-0.5">
                  {log.timestamp?.seconds 
                    ? new Date(log.timestamp.seconds * 1000).toLocaleString() 
                    : 'just now'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
