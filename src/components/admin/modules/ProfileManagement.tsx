import { useState, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Save, UserCheck, ShieldCheck, PenTool, CheckCircle } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../layout/FirebaseProvider';

export default function ProfileManagement({ onLogActivity }: { onLogActivity: (a: string, b: string) => void }) {
  const { user, profile, isAdmin } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [name, setName] = useState(profile?.name || '');
  const [roleStr, setRoleStr] = useState(profile?.role || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload to Firebase Storage, here we use Object URL for mock
      const imgUrl = URL.createObjectURL(file);
      setPhotoURL(imgUrl);
      onLogActivity('Uploaded Profile Picture', 'Changed profile avatar image.');
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        photoURL,
        role: roleStr,
        updatedAt: serverTimestamp()
      });
      onLogActivity('Updated Profile', 'Modified personal profile details.');
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-display font-semibold text-slate-800">Admin Profile Settings</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your professional identity, avatar, and system credentials.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Cover Background */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-emerald-500 to-teal-700 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        {/* Profile Info Container */}
        <div className="px-6 sm:px-10 pb-10 relative">
          
          {/* Avatar Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative inline-block w-32 h-32 sm:w-40 sm:h-40">
                <img 
                  src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-[32px] object-cover border-4 border-white shadow-xl bg-white" 
                />
                
                {isEditing && (
                  <button 
                    onClick={handleUploadClick}
                    className="absolute -bottom-2 -right-2 p-3 bg-white border border-slate-200 text-slate-700 hover:text-[#0FA484] hover:border-[#0FA484] rounded-2xl shadow-lg transition-all"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="pt-2 sm:pt-0 pb-2">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">{profile?.name || 'Administrator'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border flex items-center gap-1.5 ${isAdmin ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-[#0FA484] border-emerald-200'}`}>
                    {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {isAdmin ? 'Super Admin' : 'Team Member'}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">@ Code Crafters</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {!isEditing ? (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                 >
                   <PenTool className="w-4 h-4" />
                   <span>Edit Profile</span>
                 </button>
               ) : (
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="px-6 py-2.5 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm"
                 >
                   Cancel
                 </button>
               )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Personal Details</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/20 focus:outline-none focus:bg-white transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Organizational Role</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={roleStr}
                        onChange={e => setRoleStr(e.target.value)}
                        disabled={!isEditing}
                        placeholder="e.g. Senior Developer"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 disabled:opacity-70 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/20 focus:outline-none focus:bg-white transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Account Credentials</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase flex justify-between">
                      <span>Primary Email</span>
                      <span className="text-[9px] text-[#0FA484]">Verified</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-600 opacity-80 cursor-not-allowed shadow-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Email address is managed via authentication provider.</p>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between pt-6 border-t border-slate-100"
              >
                {saveSuccess ? (
                  <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4" />
                    Profile Updated Successfully!
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs">Review your details before saving.</span>
                )}
                
                <button 
                  type="submit" 
                  disabled={saveLoading}
                  className="px-8 py-3 bg-[#0FA484] hover:bg-[#0c856a] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </motion.div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
