import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderGit2, Plus, Edit, Trash2, Search, Link as LinkIcon, Github, 
  Calendar, CheckCircle, Clock, AlertTriangle, Eye, EyeOff, Sparkles, X, 
  Layers, ToggleLeft, ToggleRight, Check 
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Project } from '../types';

interface ProjectManagementProps {
  onLogActivity: (action: string, details: string) => void;
}

export default function ProjectManagement({ onLogActivity }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formStatus, setFormStatus] = useState<Project['projectStatus']>('completed');
  const [formDate, setFormDate] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formCategory, setFormCategory] = useState('Web Application');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const list: Project[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Project);
      });
      // Sort: Completed / Featured first or newest
      setProjects(list);
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
    setFormDesc('');
    setFormTech('React, Tailwind CSS, TypeScript, Firebase');
    setFormClient('');
    setFormStatus('completed');
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormImages('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600');
    setFormLiveUrl('https://');
    setFormGithubUrl('https://github.com/');
    setFormPublished(true);
    setFormFeatured(false);
    setFormCategory('Web Application');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Project) => {
    setEditingId(p.id || null);
    setFormName(p.projectName);
    setFormDesc(p.description);
    setFormTech(p.technologies.join(', '));
    setFormClient(p.clientName || '');
    setFormStatus(p.projectStatus);
    setFormDate(p.completionDate || '');
    setFormImages(p.projectImages || '');
    setFormLiveUrl(p.liveUrl || '');
    setFormGithubUrl(p.githubUrl || '');
    setFormPublished(p.published);
    setFormFeatured(p.featured || false);
    setFormCategory(p.category || 'Web Application');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const parsedTech = formTech.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      const payload: any = {
        projectName: formName.trim(),
        description: formDesc.trim(),
        technologies: parsedTech,
        clientName: formClient.trim() || 'Internal Venture',
        projectStatus: formStatus,
        completionDate: formDate,
        projectImages: formImages.trim(),
        liveUrl: formLiveUrl.trim(),
        githubUrl: formGithubUrl.trim(),
        published: formPublished,
        featured: formFeatured,
        category: formCategory,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), payload);
        onLogActivity('Updated Project', `Modified project profile: ${formName}`);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'projects'), payload);
        onLogActivity('Added Project', `Created new portfolio record: ${formName}`);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save project records.');
    }
  };

  const togglePublishStatus = async (p: Project) => {
    try {
      await updateDoc(doc(db, 'projects', p.id!), {
        published: !p.published
      });
      onLogActivity('Toggle Project Visibility', `Flipped visibility for project "${p.projectName}" to ${!p.published}`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeaturedStatus = async (p: Project) => {
    try {
      await updateDoc(doc(db, 'projects', p.id!), {
        featured: !p.featured
      });
      onLogActivity('Toggle Featured Class', `Marked "${p.projectName}" featured to ${!p.featured}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (p: Project) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${p.projectName}?`)) return;

    try {
      await deleteDoc(doc(db, 'projects', p.id!));
      onLogActivity('Deleted Project', `Removed project record: ${p.projectName}`);
    } catch (err) {
      console.error(err);
      alert('Database error during project deletion.');
    }
  };

  // Extract unique categories for filter
  const categoriesList = ['all', 'Web Application', 'Mobile App', 'Enterprise SaaS', 'Consultation', 'Cloud Architecture'];

  const filtered = projects.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.technologies.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-slate-800 font-sans pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Project Workflows</h2>
          <p className="text-slate-500 text-xs font-normal">Document engineering sprints, manage client deliverables, and control landing-page portfolio showcasing.</p>
        </div>

        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-center justify-between bg-white p-5 rounded-[24px] border border-slate-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, stack, technologies..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#4f46e5] font-sans transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 font-mono text-[10px] hide-scrollbar">
          {categoriesList.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2.5 rounded-xl border whitespace-nowrap uppercase tracking-wider transition-all font-bold shadow-sm ${
                activeCategory === c
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-24 text-slate-400 text-xs">
            Analyzing database portfolio documents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-24 border border-dashed border-slate-200 bg-slate-50 rounded-3xl text-slate-500 text-xs shadow-sm">
            No projects matched current search tags. Begin by publishing your first showcase!
          </div>
        ) : (
          filtered.map((p) => {
            return (
              <div 
                key={p.id}
                className="rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#4f46e5]/20 overflow-hidden transition-all flex flex-col justify-between group"
              >
                <div className="h-48 relative bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img 
                    src={p.projectImages || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600'} 
                    alt={p.projectName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />
                  
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 font-mono text-[9px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm">
                    {p.category}
                  </span>

                  <div className="absolute top-4 right-4 flex gap-2">
                    
                    <button
                      onClick={() => toggleFeaturedStatus(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-sm backdrop-blur-sm ${
                        p.featured 
                          ? 'bg-amber-400 border-amber-500 text-white' 
                          : 'bg-white/90 border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}
                      title={p.featured ? "Featured showcase on landing" : "Promote project to featured"}
                    >
                      ★
                    </button>

                    <button
                      onClick={() => togglePublishStatus(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-sm backdrop-blur-sm ${
                        p.published 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'bg-rose-500 border-rose-600 text-white'
                      }`}
                      title={p.published ? "Active live visualization" : "Invisible draft mode"}
                    >
                      {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                  </div>

                  <div className="absolute bottom-4 left-4 flex gap-1.5 items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1 text-[9px] font-mono uppercase font-bold text-slate-700 shadow-sm">
                    {p.projectStatus === 'completed' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
                        <span className="text-emerald-700">Completed</span>
                      </>
                    ) : p.projectStatus === 'in_progress' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-blue-500 mr-0.5" />
                        <span className="text-blue-700">Engineering</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-0.5" />
                        <span className="text-amber-700">Pipeline</span>
                      </>
                    )}
                  </div>

                </div>

                <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold text-slate-800 font-display leading-tight">{p.projectName}</h3>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed font-medium">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-4 font-mono text-[10px]">
                    
                    <div className="flex flex-wrap gap-1.5">
                      {p.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg font-bold shadow-sm">
                          {tech}
                        </span>
                      ))}
                      {p.technologies.length > 4 && (
                        <span className="text-slate-400 pl-1 font-bold flex items-center">+{p.technologies.length - 4}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-slate-500">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">CLIENT ACCOUNTS</span>
                        <span className="text-slate-700 truncate block mt-1 font-bold">{p.clientName || 'Internal Sprints'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">DELIVERED</span>
                        <span className="text-slate-600 block mt-1 font-bold">{p.completionDate || 'Planned'}</span>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-[32px]">
                  
                  <div className="flex gap-2">
                    {p.liveUrl && p.liveUrl !== 'https://' && (
                      <a 
                        href={p.liveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-slate-500 hover:text-[#4f46e5] bg-white border border-slate-200 p-2 rounded-xl shadow-sm transition-colors"
                        title="Live Site"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                    {p.githubUrl && p.githubUrl !== 'https://github.com/' && (
                      <a 
                        href={p.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-slate-500 hover:text-slate-900 bg-white border border-slate-200 p-2 rounded-xl shadow-sm transition-colors"
                        title="Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(p)}
                      className="p-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono flex items-center gap-1.5 transition-all shadow-sm hover:text-[#4f46e5]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProject(p)}
                      className="p-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

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
                  <span>{editingId ? 'Edit Project Config' : 'Publish New Project'}</span>
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
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">PROJECT COVER URL</label>
                  <input
                    type="text"
                    required
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    placeholder="Unsplash, cloud storage or absolute photo links..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">PROJECT NAME</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enterprise Dashboard Portal"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">CATEGORY TARGET</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Enterprise SaaS">Enterprise SaaS</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Cloud Architecture">Cloud Architecture</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">DESCRIPTION OVERVIEW</label>
                  <textarea
                    rows={3}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detailed structural documentation on what problems this project resolves, client feedback, and sprint architecture..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">CLIENT SPONSOR</label>
                    <input
                      type="text"
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="e.g. Starwood Ltd, Google, Internal"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">DELIVERY DATE</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">TECHNOLOGIES</label>
                  <input
                    type="text"
                    required
                    value={formTech}
                    onChange={(e) => setFormTech(e.target.value)}
                    placeholder="React, Redux, PostgreSQL"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">LIVE URL</label>
                    <input
                      type="text"
                      value={formLiveUrl}
                      onChange={(e) => setFormLiveUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono text-[11px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">GITHUB REPO</label>
                    <input
                      type="text"
                      value={formGithubUrl}
                      onChange={(e) => setFormGithubUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex gap-5 items-center p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-slate-800">Status Allocation</span>
                    <p className="text-[10px] text-slate-500">Target deployment stage status.</p>
                  </div>
                  <div className="flex gap-2 font-mono text-[9px] font-bold">
                    {(['pending', 'in_progress', 'completed'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormStatus(st)}
                        className={`px-4 py-2 rounded-xl border uppercase shadow-sm ${
                          formStatus === st
                            ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Published</span>
                      <p className="text-[9px] text-slate-500">Public visibility.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormPublished(!formPublished)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {formPublished ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Featured Badge</span>
                      <p className="text-[9px] text-slate-500">Prioritize top row.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormFeatured(!formFeatured)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {formFeatured ? (
                        <ToggleRight className="w-8 h-8 text-amber-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
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
                    Publish Project
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
