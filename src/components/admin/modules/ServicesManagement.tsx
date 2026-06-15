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
    <div className="space-y-8 text-white">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Services Configuration</h2>
          <p className="text-gray-400 text-xs text-sans font-normal">Define pricing models, technical options, features lists, and visual icons for Code Crafters offerings.</p>
        </div>

        <button
          onClick={openAddForm}
          className="px-5 py-2.5 bg-electric hover:bg-white text-navy font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(0,240,255,0.2)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Service</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500 text-xs">
          Interrogating Firestore services database...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/5 rounded-3xl text-gray-500 text-xs">
          No services published yet. Design some custom enterprise tiers today!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {services.map((srv, index) => {
            const hasFeatures = srv.features && srv.features.length > 0;

            return (
              <div 
                key={srv.id}
                className="p-6 rounded-3xl border border-white/5 bg-[#050b14]/40 hover:bg-[#071324] hover:border-white/10 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Service Headers */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center text-electric">
                        {srv.icon === 'Terminal' && <Terminal className="w-5 h-5" />}
                        {srv.icon === 'Smartphone' && <Smartphone className="w-5 h-5" />}
                        {srv.icon === 'Monitor' && <Monitor className="w-5 h-5" />}
                        {srv.icon === 'Database' && <Database className="w-5 h-5" />}
                        {srv.icon === 'Cpu' && <Cpu className="w-5 h-5" />}
                        {srv.icon === 'Layers' && <Layers className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-display text-white">{srv.serviceName}</h4>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{srv.pricing}</span>
                      </div>
                    </div>

                    {/* Order buttons */}
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveService(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 hover:text-electric transition-colors disabled:opacity-30.5 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveService(index, 'down')}
                        disabled={index === services.length - 1}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 hover:text-electric transition-colors disabled:opacity-30.5 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans font-normal">
                    {srv.description}
                  </p>

                  {/* Feature badges list */}
                  {hasFeatures && (
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Scope Highlights</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {srv.features.map((feat, idx) => (
                          <span key={idx} className="bg-white/[0.02] border border-white/5 text-gray-400 text-[10px] px-2.5 py-0.5 rounded font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#00E5FF] shrink-0" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Service Admin Controls Footer */}
                <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-6">
                  <button
                    onClick={() => openEditForm(srv)}
                    className="p-1.5 px-3 border border-white/5 bg-white/[0.01] hover:bg-white/5 text-gray-400 hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-wider font-mono flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                    <span>Configure</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv)}
                    className="p-1.5 px-3 border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg text-[10px] uppercase font-bold tracking-wider font-mono flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#030712]/85 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#080d1a] p-6 sm:p-8 shadow-2xl z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-electric" />
                  <span>{editingId ? 'Edit Service Details' : 'Configure New Service Item'}</span>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">SERVICE NAME</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="UI/UX Engineering"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">PRICING STRUCTURE</label>
                    <input
                      type="text"
                      required
                      value={formPricing}
                      onChange={(e) => setFormPricing(e.target.value)}
                      placeholder="e.g. $4,000 / month"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-mono text-gray-400 block mb-1">VISUAL ICON TEMPLATE</label>
                    <div className="grid grid-cols-3 gap-1">
                      {availableIcons.map(ic => {
                        const isSel = formIcon === ic;
                        return (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setFormIcon(ic)}
                            className={`py-2 text-[10px] font-mono uppercase font-bold rounded border ${
                              isSel 
                                ? 'bg-electric/10 border-electric text-electric' 
                                : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            {ic}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 block">ORDERING INDEX</label>
                    <input
                      type="number"
                      required
                      value={formOrderIndex}
                      onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block">SERVICE COGNITIVE SUMMARY</label>
                  <textarea
                    rows={3}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide a client-facing explanation on what this software service entails and how it streamlines operational friction..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block">KEY DELIVERABLES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    required
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    placeholder="Custom layout, Figma wireframes, Responsive code, Tailwind"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-electric"
                  />
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
                    Save Service Blueprint
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
