import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, X, Check, Save,
  Layers, ChevronDown, Monitor, CheckCircle, Smartphone, Terminal, Cpu, Database
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Service } from '../types';

interface ServicesProps {
  onLogActivity: (action: string, details: string) => void;
}

export default function ServicesManagement({ onLogActivity }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Terminal');
  const [formFeatures, setFormFeatures] = useState('');
  const [formPricing, setFormPricing] = useState('');
  const [formOrderIndex, setFormOrderIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snap) => {
      const list: Service[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Service);
      });
      // Sort by orderIndex ascending
      list.sort((a, b) => a.orderIndex - b.orderIndex);
      setServices(list);
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
    setFormIcon('Terminal');
    setFormFeatures('UI/UX Design, Custom Sprints, QA Analysis, Deployment');
    setFormPricing('$10,000 - $15,000');
    setFormOrderIndex(services.length);
    setIsFormOpen(true);
  };

  const openEditForm = (srv: Service) => {
    setEditingId(srv.id || null);
    setFormName(srv.serviceName);
    setFormDesc(srv.description);
    setFormIcon(srv.icon || 'Terminal');
    setFormFeatures(Array.isArray(srv.features) ? srv.features.join(', ') : srv.features || '');
    setFormPricing(srv.pricing);
    setFormOrderIndex(srv.orderIndex || 0);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const parsedFeatures = formFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0);
      
      const payload: any = {
        serviceName: formName.trim(),
        description: formDesc.trim(),
        icon: formIcon,
        features: parsedFeatures,
        pricing: formPricing.trim(),
        orderIndex: Number(formOrderIndex) || 0
      };

      if (editingId) {
        await updateDoc(doc(db, 'services', editingId), payload);
        onLogActivity('Updated Service Model', `Modified service setup: ${formName}`);
      } else {
        await addDoc(collection(db, 'services'), payload);
        onLogActivity('Created Service Icon Model', `Added service blueprint: ${formName}`);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save service records.');
    }
  };

  const handleDeleteService = async (srv: Service) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${srv.serviceName}?`)) return;

    try {
      await deleteDoc(doc(db, 'services', srv.id!));
      onLogActivity('Deleted Service', `Removed Service Option: ${srv.serviceName}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder index shift
  const moveService = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const currentSrv = services[index];
    const swapSrv = services[targetIdx];

    try {
      await updateDoc(doc(db, 'services', currentSrv.id!), { orderIndex: swapSrv.orderIndex });
      await updateDoc(doc(db, 'services', swapSrv.id!), { orderIndex: currentSrv.orderIndex });
    } catch (err) {
      console.error(err);
    }
  };

  // Icon set mapping
  const availableIcons = ['Terminal', 'Smartphone', 'Monitor', 'Database', 'Cpu', 'Layers'];

  return (
    <div className="space-y-8 text-slate-800 font-sans pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-slate-800">Services Configuration</h2>
          <p className="text-slate-500 text-xs font-normal">Define pricing models, technical options, features lists, and visual icons for Code Crafters offerings.</p>
        </div>

        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Service</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400 text-xs">
          Interrogating Firestore services database...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-slate-200 bg-slate-50 rounded-[24px] text-slate-500 text-xs shadow-sm">
          No services published yet. Design some custom enterprise tiers today!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {services.map((srv, index) => {
            const hasFeatures = srv.features && srv.features.length > 0;

            return (
              <div 
                key={srv.id}
                className="p-6 rounded-[32px] border border-slate-100/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#4f46e5]/20 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#4f46e5] shadow-sm">
                        {srv.icon === 'Terminal' && <Terminal className="w-6 h-6" />}
                        {srv.icon === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                        {srv.icon === 'Monitor' && <Monitor className="w-6 h-6" />}
                        {srv.icon === 'Database' && <Database className="w-6 h-6" />}
                        {srv.icon === 'Cpu' && <Cpu className="w-6 h-6" />}
                        {srv.icon === 'Layers' && <Layers className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="text-base font-bold font-display text-slate-800">{srv.serviceName}</h4>
                        <span className="text-[11px] font-mono text-[#4f46e5] font-bold uppercase tracking-wider">{srv.pricing}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-xl p-1 border border-slate-100">
                      <button
                        onClick={() => moveService(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#4f46e5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shadow-sm disabled:shadow-none"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveService(index, 'down')}
                        disabled={index === services.length - 1}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#4f46e5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shadow-sm disabled:shadow-none"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                    {srv.description}
                  </p>

                  {hasFeatures && (
                    <div className="space-y-3 border-t border-slate-100 pt-5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Scope Highlights</span>
                      <div className="flex flex-col gap-2 pt-1">
                        {srv.features.map((feat, idx) => (
                          <span key={idx} className="text-slate-600 text-xs font-medium flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-5 mt-6 border-dashed">
                  <button
                    onClick={() => openEditForm(srv)}
                    className="p-2 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>Configure</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv)}
                    className="p-2 border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                  <span>{editingId ? 'Edit Service Details' : 'Configure New Service Item'}</span>
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
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">SERVICE NAME</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="UI/UX Engineering"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">PRICING STRUCTURE</label>
                    <input
                      type="text"
                      required
                      value={formPricing}
                      onChange={(e) => setFormPricing(e.target.value)}
                      placeholder="e.g. $4,000 / month"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-2 uppercase">VISUAL ICON TEMPLATE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableIcons.map(ic => {
                        const isSel = formIcon === ic;
                        return (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setFormIcon(ic)}
                            className={`py-2 px-1 text-[10px] font-mono uppercase font-bold rounded-xl border transition-all ${
                              isSel 
                                ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-md' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
                            }`}
                          >
                            {ic}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">ORDERING INDEX</label>
                    <input
                      type="number"
                      required
                      value={formOrderIndex}
                      onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">SERVICE COGNITIVE SUMMARY</label>
                  <textarea
                    rows={3}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide a client-facing explanation on what this software service entails and how it streamlines operational friction..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase">KEY DELIVERABLES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    required
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    placeholder="Custom layout, Figma wireframes, Responsive code, Tailwind"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all shadow-sm"
                  />
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
                    className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                     <Save className="w-4 h-4"/>
                    Save Blueprint
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
