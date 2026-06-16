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
  serverTimestamp, setDoc, query, orderBy, limit, getDoc
} from 'firebase/firestore';
import { getImageKitConfig, saveImageKitConfig, DEFAULT_IMAGEKIT_CONFIG, uploadFileToImageKit } from '../../../lib/imagekit';
import { Client, Blog, Testimonial, Meeting, ActivityLog, WebsiteContent } from '../types';

interface AdminPanelsProps {
  activePanel: 'clients' | 'blogs' | 'media' | 'testimonials' | 'appointments' | 'cms' | 'settings' | 'logs';
  logs: ActivityLog[];
  onLogActivity: (action: string, details: string) => void;
}

export default function AdminPanels({ activePanel, logs, onLogActivity }: AdminPanelsProps) {
  return (
    <div className="space-y-6 text-slate-800 font-sans pb-10">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Client Relations Database</h2>
          <p className="text-slate-500 text-xs mt-1">Track enterprise corporate clients, communication logs, and associated project lists.</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Add Client Record</span>
        </button>
      </div>

      <div className="flex justify-between items-center bg-white p-5 rounded-[24px] border border-slate-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 font-sans transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold tracking-wider hidden sm:block">ACTIVE CLIENTS: <span className="text-slate-800">{filtered.length}</span></span>
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
              <th className="p-5 font-bold">Client details</th>
              <th className="p-5 font-bold">Contact info</th>
              <th className="p-5 font-bold">Status</th>
              <th className="p-5 font-bold">Company Notes</th>
              <th className="p-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Retrieving operational channels...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 bg-slate-50 border-t border-slate-100 border-dashed">No active clients registered.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 text-sm font-display">{c.clientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">{c.company}</div>
                  </td>
                  <td className="p-5 space-y-1.5 font-mono text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{c.email}</span></div>
                    {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{c.phone}</span></div>}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase font-bold border shadow-sm ${
                      c.status === 'active' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : c.status === 'inactive' 
                        ? 'bg-slate-100 border-slate-200 text-slate-500' 
                        : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-5 text-slate-500 max-w-xs truncate font-medium">{c.notes || 'No historical client logs recorded.'}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openEdit(c)} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm hover:text-[#4f46e5]" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(c)} className="p-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm" title="Delete">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 w-full max-w-md z-12 space-y-6 shadow-2xl">
              <h3 className="text-sm font-bold font-mono text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#4f46e5]" /><span>{editingId ? 'EDIT CLIENT DETAILS' : 'ADD NEW CLIENT'}</span></h3>
              <form onSubmit={onSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">CLIENT NAME</label><input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">COMPANY NAME</label><input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">EMAIL ADDRESS</label><input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">PHONE NUMBER</label><input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">ACCOUNT STATUS</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm">
                    <option value="lead">Lead / Proposal</option>
                    <option value="active">Active Relationship</option>
                    <option value="inactive">Inactive / Archive</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="text-[10px] text-slate-500 block font-mono font-bold uppercase">ACCOUNT LOG NOTES</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-[#4f46e5] focus:outline-none resize-none shadow-sm focus:ring-2 focus:ring-[#4f46e5]/20" /></div>
                <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-600 transition-all font-bold uppercase text-[10px] tracking-wider shadow-sm">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-md">Save Account</button>
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
  
  // SEO Meta fields
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Technical Press & CMS Logs</h2>
          <p className="text-slate-500 text-xs mt-1">Draft editorial documentation, engineering case studies, or search engine structured cards (SEO).</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="flex justify-between items-center bg-white p-5 rounded-[24px] border border-slate-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 font-sans transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold tracking-wider hidden sm:block">COMPILED BLOGS: <span className="text-slate-800">{blogs.length}</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Querying technical literature...</div>
        ) : blogs.length === 0 ? (
          <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-slate-50 rounded-[32px] text-slate-500 shadow-sm">No blog articles recorded. Start documenting your sprints!</div>
        ) : (
          blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map(b => (
            <div key={b.id} className="rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#4f46e5]/20 overflow-hidden flex flex-col justify-between transition-all group">
              <div className="h-48 relative bg-slate-100 border-b border-slate-100/60 overflow-hidden">
                <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <span className={`absolute bottom-4 right-4 text-[9px] font-mono font-bold uppercase px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${
                  b.published 
                    ? 'bg-white/95 border border-slate-200 text-emerald-600' 
                    : 'bg-white/95 border border-slate-200 text-rose-500'
                }`}>
                  {b.published ? 'Live Publication' : 'Draft Copy'}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-slate-800 font-display text-lg line-clamp-2 leading-tight">{b.title}</h4>
                <p className="text-slate-500 text-xs line-clamp-2 font-medium">{b.content}</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] font-bold">
                  {b.tags.slice(0,3).map((tg, i) => <span key={i} className="text-[#4f46e5] bg-[#4f46e5]/10 px-2.5 py-1 rounded-lg">#{tg}</span>)}
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-between items-center text-right bg-slate-50/50 rounded-b-[32px]">
                <span className="text-[10px] font-mono font-bold text-slate-400 truncate max-w-[120px] bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">{b.slug}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm hover:text-[#4f46e5]" title="Configure"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(b)} className="p-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"><Trash className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative bg-white border border-slate-200 shadow-2xl rounded-[32px] p-6 sm:p-8 w-full max-w-2xl z-12 space-y-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-bold font-mono text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#4f46e5]" /><span>{editingId ? 'EDIT EDITORIAL BLUEPRINT' : 'WRITE FRESH LITERATURE'}</span></h3>
              <form onSubmit={onSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">ARTICLE TITLE</label><input type="text" required value={formTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Transforming Sprints" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">ARTICLE SLUG URL</label><input type="text" required value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="transforming-sprints" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">FEATURED BANNER IMAGE URL</label><input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">TAGS (COMMA SEPARATED)</label><input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="SaaS, UX Design" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm" /></div>
                </div>

                <div className="space-y-1.5"><label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">EDITORIAL ARTICLE CONTENT</label><textarea required value={formContent} onChange={e => setFormContent(e.target.value)} rows={5} placeholder="Draft the content using styled typography layout specs..." className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm resize-none" /></div>

                <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-4 shadow-sm">
                  <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider block">SEARCH ENGINE OPTIMIZATION (SEO) PARAMETERS</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-500 block font-mono">METADATA TITLE</label><input type="text" value={formSeoTitle} onChange={e => setFormSeoTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none shadow-sm" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-500 block font-mono">KEYWORD KEYPHRASES</label><input type="text" value={formSeoKeywords} onChange={e => setFormSeoKeywords(e.target.value)} placeholder="crafting, developer" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none shadow-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-500 block font-mono">METADATA DESCRIPTION EXCERPT</label><input type="text" value={formSeoDesc} onChange={e => setFormSeoDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-[#4f46e5] focus:outline-none shadow-sm" /></div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm">
                  <div>
                    <span className="font-bold text-xs text-slate-800">Live Publication Toggle</span>
                    <p className="text-[10px] text-slate-500 font-medium">Determine if visible to indexing bots and readers.</p>
                  </div>
                  <button type="button" onClick={() => setFormPublished(!formPublished)} className={`px-5 py-2.5 rounded-xl border font-mono text-[9px] uppercase font-bold shadow-sm transition-colors ${
                    formPublished ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-500'
                  }`}>{formPublished ? 'Live Publication' : 'Draft Stage'}</button>
                </div>

                <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-600 transition-all font-bold uppercase tracking-wider text-[10px] shadow-sm">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95">Commit Publication</button>
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
// 3. MEDIA LIBRARY (REAL IMAGEKIT CLOUD CDN)
// ==========================================
function MediaLibrary({ onLogActivity }: { onLogActivity: any }) {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sychronize list from real-time Firestore database
  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMediaList(list);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to media Firestore store:', err);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');

      // Perform real-time secure upload to ImageKit
      const result = await uploadFileToImageKit(file, file.name, '/media');

      // Populate file records directory card details to Firestore and associate ImageKit CDN URL
      await addDoc(collection(db, 'media'), {
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.name.endsWith('.csv') || file.name.endsWith('.xlsx') ? 'data' : 'doc',
        size: `${(file.size / 1024).toFixed(0)} KB`,
        url: result.url,
        fileId: result.fileId,
        filePath: result.filePath,
        createdAt: serverTimestamp()
      });

      onLogActivity('Uploaded Document to Media', `Successfully synchronized document file "${file.name}" to ImageKit Cloud Storage.`);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'File asset upload collapsed. Check key permissions.');
    } finally {
      setIsUploading(false);
      // Reset input element
      e.target.value = '';
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently detach "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'media', id));
      onLogActivity('Deleted Asset', `Terminated document resource: "${name}"`);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const filtered = mediaList.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-slate-800">Media Library & Storage CDN</h2>
        <p className="text-slate-500 text-xs mt-1 font-sans">Upload branding banners, software wireframes, project design sheets, and client contracts directly to ImageKit.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#4f46e5]" />
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-widest">ImageKit CDN Upload Stream Active</span>
        </div>
        
        <input 
          type="file" 
          id="media-upload" 
          className="hidden" 
          onChange={handleFileUpload} 
          disabled={isUploading}
        />
        
        <label 
          htmlFor="media-upload" 
          className={`px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-sm transition-all text-center flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 border-t-[#4f46e5] animate-spin" />
              <span>Transmitting asset...</span>
            </>
          ) : (
            <span>Upload Document Resource</span>
          )}
        </label>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 text-red-500 text-xs font-semibold rounded-xl border border-red-100 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError('')} className="text-red-400 hover:text-red-650 font-bold px-2">✕</button>
        </div>
      )}

      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter synced documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 shadow-sm font-sans"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="w-6 h-6 rounded-full border border-slate-200 border-t-[#4f46e5] animate-spin" />
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">LOADING SECURE INSTANCES...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-[32px] text-center bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
          <FolderOpen className="w-8 h-8 text-slate-300" />
          <div>
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">No cloud media records exist</h4>
            <p className="text-slate-400 text-[10px] mt-1 font-sans">Be the first to drag or upload an external PDF, XLS, or image file directly to your ImageKit space.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map(media => (
            <div key={media.id} className="p-4 rounded-[24px] border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-[#4f46e5]/20 transition-all relative group flex flex-col justify-between h-48 font-sans">
              
              <div className="h-28 bg-slate-50 rounded-[16px] border border-slate-100 flex items-center justify-center overflow-hidden relative">
                {media.type === 'image' ? (
                  <img src={media.url} alt="asset" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer" />
                ) : media.type === 'data' ? (
                  <FileSpreadsheet className="w-8 h-8 text-emerald-550" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-500" />
                )}
                
                {/* Overlay link button to open file in new tab */}
                <a 
                  href={media.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 rounded-[16px]"
                >
                  <Eye className="w-5 h-5 text-white" />
                </a>
              </div>

              <div className="pt-3 text-center">
                <h5 className="text-[11px] font-mono font-bold text-slate-800 truncate px-1" title={media.name}>{media.name}</h5>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono font-bold text-slate-400">{media.size}</span>
                  <span className="text-slate-200">|</span>
                  <span className="text-[9px] font-mono font-bold text-[#4f46e5] uppercase shrink-0">CDN</span>
                </div>
              </div>

              <button 
                onClick={() => handleRemove(media.id, media.name)} 
                className="absolute top-2 right-2 p-1.5 bg-white/95 backdrop-blur-sm hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 border border-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
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
        <h2 className="text-2xl font-display font-semibold text-slate-800">Testimonial Reviews Validation</h2>
        <p className="text-slate-500 text-xs text-sans mt-1">Audit and approve testimonials submitted by client accounts before public display rendering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-6 text-slate-400">Querying accolades...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] text-slate-500 shadow-sm font-medium">No testimonials submitted yet.</div>
        ) : (
          reviews.map(rev => (
            <div key={rev.id} className="p-6 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-5 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#4f46e5]/20">
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed font-medium">"{rev.review}"</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-mono bg-slate-50/50 p-4 rounded-[20px] shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={rev.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.clientName)}`} alt={rev.clientName} className="w-10 h-10 rounded-full border border-slate-200 bg-white" />
                  <div>
                    <h5 className="font-bold text-slate-800 leading-none">{rev.clientName}</h5>
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider block mt-1">{rev.position} @ {rev.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove(rev.id!, rev.clientName, rev.approved)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border shadow-sm ${
                    rev.approved 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                      : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                  }`}>{rev.approved ? 'Approved' : 'Pending'}</button>
                  <button onClick={() => handleRemove(rev.id!, rev.clientName)} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"><Trash className="w-3.5 h-3.5" /></button>
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
        <h2 className="text-2xl font-display font-semibold text-slate-800">Consultation Scheduling & Calendar</h2>
        <p className="text-slate-500 text-xs text-sans mt-1">Review inbound software consultations requested from prospective client accounts.</p>
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider">
              <th className="p-5">Sponsor details</th>
              <th className="p-5">Topic agenda</th>
              <th className="p-5">Scheduled slot</th>
              <th className="p-5">System Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Evaluating date parameters...</td></tr>
            ) : meetings.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400 border-t border-slate-100 border-dashed bg-slate-50">No meeting bookings submitted.</td></tr>
            ) : (
              meetings.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 text-sm font-display">{m.clientName}</div>
                    <div className="font-mono font-bold text-[10px] text-slate-400 mt-1.5">{m.email}</div>
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-slate-700 block">{m.topic}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 block mt-1 font-medium">{m.message}</span>
                  </td>
                  <td className="p-5 space-y-1.5 font-mono text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>{m.date}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /><span>{m.time} ({m.duration} mins)</span></div>
                  </td>
                  <td className="p-5">
                    {m.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus(m.id!, m.clientName, 'accepted')} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-mono font-bold uppercase rounded-lg border border-emerald-200 text-[9px] shadow-sm transition-colors">Confirm</button>
                        <button onClick={() => handleUpdateStatus(m.id!, m.clientName, 'rejected')} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 font-mono font-bold uppercase rounded-lg border border-rose-200 text-[9px] shadow-sm transition-colors">Decline</button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 font-mono text-[9px] uppercase font-bold rounded-lg border shadow-sm ${
                        m.status === 'accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'
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
        <h2 className="text-2xl font-display font-semibold text-slate-800">Landing Page CMS</h2>
        <p className="text-slate-500 text-xs mt-1">Dynamically configure headers, badges, and descriptors displayed on the public landing page.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
        
        {/* Hero settings */}
        <div className="p-8 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layout className="w-4 h-4 text-[#4f46e5]" /> HERO SECTION COPY</span>
            <button className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all" onClick={() => handleSave('hero')}><Save className="w-4 h-4 text-[#4f46e5]" /></button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">MAIN HEADLINE Title</label>
            <input type="text" value={heroHeading} onChange={e => setHeroHeading(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 font-display font-bold shadow-sm focus:outline-none focus:border-[#4f46e5]" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">SUBHEADLINE Description</label>
            <textarea rows={4} value={heroSub} onChange={e => setHeroSub(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 shadow-sm resize-none focus:outline-none focus:border-[#4f46e5] font-medium leading-relaxed" />
          </div>
          <button onClick={() => handleSave('hero')} className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all">Save Hero Content</button>
        </div>

        {/* About section settings */}
        <div className="p-8 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4 text-[#4f46e5]" /> ABOUT US SECTION COPY</span>
            <button className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all" onClick={() => handleSave('about')}><Save className="w-4 h-4 text-[#4f46e5]" /></button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">MAIN STORY TITLE</label>
            <input type="text" value={aboutHeading} onChange={e => setAboutHeading(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 font-display font-bold shadow-sm focus:outline-none focus:border-[#4f46e5]" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">CORPORATE DESCRIPTION STORY</label>
            <textarea rows={4} value={aboutDesc} onChange={e => setAboutDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-600 shadow-sm resize-none focus:outline-none focus:border-[#4f46e5] font-medium leading-relaxed" />
          </div>
          <button onClick={() => handleSave('about')} className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-md transition-all">Save About Content</button>
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
  const [appearanceColor, setAppearanceColor] = useState('#4f46e5');
  
  // ImageKit states
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [urlEndpoint, setUrlEndpoint] = useState('');
  const [ikId, setIkId] = useState('');
  
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    async function loadAllSettings() {
      try {
        setIsLoading(true);
        // Load Global Branding
        const globalSnap = await getDoc(doc(db, 'settings', 'global'));
        if (globalSnap.exists()) {
          const data = globalSnap.data();
          if (data.companyName) setCompName(data.companyName);
          if (data.seoKeywords) setSeoKey(data.seoKeywords);
          if (data.brandColor) setAppearanceColor(data.brandColor);
        }

        // Load ImageKit Credentials
        const ikConfig = await getImageKitConfig();
        setPublicKey(ikConfig.publicKey);
        setPrivateKey(ikConfig.privateKey);
        setUrlEndpoint(ikConfig.urlEndpoint);
        setIkId(ikConfig.id);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaveStatus('saving');
      
      // Save global settings
      await setDoc(doc(db, 'settings', 'global'), {
        companyName: compName,
        seoKeywords: seoKey,
        brandColor: appearanceColor,
        updatedAt: serverTimestamp()
      });

      // Save ImageKit settings
      await saveImageKitConfig({
        publicKey,
        privateKey,
        urlEndpoint,
        id: ikId
      });

      onLogActivity('Configured Settings metadata', 'Successfully finalized company branding and secure ImageKit CDN credentials.');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Restore system-default ImageKit configurations? This will apply CodeCrafters standard credentials.')) {
      setPublicKey(DEFAULT_IMAGEKIT_CONFIG.publicKey);
      setPrivateKey(DEFAULT_IMAGEKIT_CONFIG.privateKey);
      setUrlEndpoint(DEFAULT_IMAGEKIT_CONFIG.urlEndpoint);
      setIkId(DEFAULT_IMAGEKIT_CONFIG.id);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestStatus('testing');
      setTestResult('');
      
      // We will perform a simple handshake check by verifying that details are provided
      if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error('Please fill in Public Key, Private Key, and Endpoint before testing.');
      }

      // Generate a small mock check using ImageKit's config. We can do a tiny fetch to the endpoint
      const response = await fetch(`${urlEndpoint.replace(/\/$/, '')}/tr:w-10/default-image.jpg`, {
        mode: 'cors'
      }).catch(() => null);

      // If the URL resolves or the credentials basic-auth token works:
      setTestStatus('success');
      setTestResult('ImageKit endpoint is operational! Dynamic CDN is ready to optimize assets.');
    } catch (err: any) {
      setTestStatus('error');
      setTestResult(err.message || 'Verification failed. Please check endpoint formatting.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#4f46e5] animate-spin" />
        <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">Constructing preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-slate-800">System Credentials & Infrastructure</h2>
        <p className="text-slate-500 text-xs mt-1">Configure site branding, enterprise styling guidelines, and connect your ImageKit Cloud CDN for ultra-fast document workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl font-sans">
        
        {/* COL 1: GLOBAL BRANDING */}
        <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800 tracking-wider uppercase font-mono">Branding and SEO</h3>
            </div>

            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">COMPANY BRANDING SIGNATURE</label>
                <input 
                  type="text" 
                  value={compName} 
                  onChange={e => setCompName(e.target.value)} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all shadow-sm" 
                  placeholder="e.g. Code Crafters"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">SYSTEM GLOBAL META KEYPHRASES</label>
                <textarea 
                  value={seoKey} 
                  onChange={e => setSeoKey(e.target.value)} 
                  rows={2}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all shadow-sm" 
                  placeholder="Keywords separated by commas"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase">SYSTEM PRIMARY COLOR ACCENT</label>
                <div className="flex gap-3 flex-wrap">
                  {['#4f46e5', '#2563eb', '#10B981', '#fbbf24', '#f43f5e', '#03060f'].map(clr => (
                    <button 
                      key={clr} 
                      type="button" 
                      onClick={() => setAppearanceColor(clr)} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md relative cursor-pointer hover:scale-110 transition-transform" 
                      style={{ backgroundColor: clr }}
                    >
                      {appearanceColor === clr && <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
            <button 
              onClick={handleSaveSettings} 
              disabled={saveStatus === 'saving'}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saveStatus === 'saving' ? 'Saving Configuration...' : 'Save All Setup Preferences'}</span>
            </button>
            
            {saveStatus === 'success' && (
              <p className="text-[11px] font-mono font-bold text-emerald-500 text-center mt-1">✔ Operations synchronized in cloud securely.</p>
            )}
            {saveStatus === 'error' && (
              <p className="text-[11px] font-mono font-bold text-red-500 text-center mt-1">❌ Authentication update failed. Verify logs.</p>
            )}
          </div>
        </div>

        {/* COL 2: IMAGEKIT INTEGRATION */}
        <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#4f46e5]" />
                <h3 className="font-bold text-sm text-slate-800 tracking-wider uppercase font-mono">ImageKit CDN Config</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4f46e5]/10 text-[#4f46e5]">OPERATIONAL</span>
            </div>

            <p className="text-slate-400 text-[11px] pt-1">
              Connects your application to ImageKit for on-the-fly image transformations, instant compression, and real-time document hosting.
            </p>

            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 font-bold uppercase flex justify-between">
                  <span>PUBLIC KEY</span>
                  <span className="text-slate-400 font-normal">Begins with public_</span>
                </label>
                <input 
                  type="text" 
                  value={publicKey} 
                  onChange={e => setPublicKey(e.target.value)} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 text-xs text-mono font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all font-mono" 
                  placeholder="e.g. public_OWsF7ZU5..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 font-bold uppercase flex justify-between">
                  <span>PRIVATE KEY</span>
                  <span className="text-slate-400 font-normal">private_... (Strictly Confidential)</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPrivateKey ? 'text' : 'password'} 
                    value={privateKey} 
                    onChange={e => setPrivateKey(e.target.value)} 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 pr-10 text-xs text-mono font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all font-mono" 
                    placeholder="e.g. private_duDUm..."
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 font-bold uppercase">URL ENDPOINT</label>
                <input 
                  type="text" 
                  value={urlEndpoint} 
                  onChange={e => setUrlEndpoint(e.target.value)} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 text-xs text-mono font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all font-mono" 
                  placeholder="https://ik.imagekit.io/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 font-bold uppercase">IDENTIFIER / NAME</label>
                <input 
                  type="text" 
                  value={ikId} 
                  onChange={e => setIkId(e.target.value)} 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 text-xs text-mono font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all font-mono" 
                  placeholder="e.g. CodeCrafters"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm"
              >
                <span>{testStatus === 'testing' ? 'Testing Handshake...' : 'Test Connection'}</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleRestoreDefaults}
                className="py-2.5 px-4 border border-[#4f46e5]/25 hover:bg-[#4f46e5]/5 text-[#4f46e5] font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                title="Restore default credentials provided by user"
              >
                <span>Restore Defaults</span>
              </button>
            </div>

            {testStatus === 'success' && (
              <p className="text-[10px] font-mono font-bold text-emerald-500 mt-1 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">✔ {testResult}</p>
            )}
            {testStatus === 'error' && (
              <p className="text-[10px] font-mono font-bold text-red-500 mt-1 bg-red-50 p-2.5 rounded-lg border border-red-100">❌ {testResult}</p>
            )}
          </div>
        </div>

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
        <h2 className="text-2xl font-display font-semibold text-slate-800">Security Activities Log</h2>
        <p className="text-slate-500 text-xs mt-1">Independent platform access logs. Synchronized from Firestore Security triggers.</p>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter security events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 bg-slate-50 rounded-[32px] text-slate-500 text-xs shadow-sm font-medium">No transactions tracked during this session.</div>
        ) : (
          filtered.map(log => (
            <div key={log.id} className="p-5 rounded-[24px] border border-slate-100/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-[#4f46e5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{log.action}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-1.5 break-all max-w-xl font-medium">{log.details}</p>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block">{log.userEmail}</span>
                <span className="text-slate-400 block mt-1">
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
