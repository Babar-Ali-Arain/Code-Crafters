import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Shield, Camera, Save, UserCheck, ShieldCheck, PenTool, 
  CheckCircle, Smartphone, Github, Twitter, Linkedin, Globe, FileText, Info 
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../layout/FirebaseProvider';
import { uploadFileToImageKit } from '../../../lib/imagekit';

// Utility helper to downscale and compress images to high-quality lightweight JPEG base64 strings
const resizeAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.75 ratio - highly optimized (usually < 20KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ProfileManagement({ onLogActivity }: { onLogActivity?: (a: string, b: string) => void }) {
  const { user, profile, isAdmin } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [name, setName] = useState('');
  const [roleStr, setRoleStr] = useState('');
  
  // New information fields
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use a ref switch to prevent stale Firestore onSnapshot snapshots 
  // from overwriting newly saved local states immediately after clicking save.
  const justSaved = useRef(false);

  // Sync state with profile data when it loads / becomes available
  useEffect(() => {
    if (profile && !isEditing && !justSaved.current) {
      setPhotoURL(profile.photoURL || '');
      setName(profile.name || '');
      setRoleStr(profile.role || 'client');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setGithub(profile.github || '');
      setTwitter(profile.twitter || '');
      setLinkedin(profile.linkedin || '');
      setWebsite(profile.website || '');
    }
  }, [profile, isEditing]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setErrorMsg('');
        setIsUploadingPhoto(true);

        // Deploy directly to ImageKit CDN space for high performance loading
        const result = await uploadFileToImageKit(file, `avatar-${Date.now()}-${file.name}`, '/profile-avatars');
        setPhotoURL(result.url);
        
        if (onLogActivity) {
          onLogActivity('Uploaded Profile Picture', 'Changed profile avatar image using secure ImageKit CDN.');
        }
      } catch (err: any) {
        console.error('ImageKit upload collapsed, falling back to local base64:', err);
        try {
          const compressedBase64 = await resizeAndConvertToBase64(file);
          setPhotoURL(compressedBase64);
          setErrorMsg('Uploaded using offline local compression fallback (check active ImageKit keys).');
        } catch (localErr) {
          setErrorMsg('Failed to process and compress the selected image. Please try a different one.');
        }
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      const userRef = doc(db, 'users', user.uid);
      
      const updatedData: any = {
        name: name.trim(),
        photoURL,
        phone: phone.trim(),
        bio: bio.trim(),
        github: github.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
        website: website.trim(),
        updatedAt: serverTimestamp()
      };

      // Only allow admins to update their own actual registered system role in the document
      if (isAdmin) {
        updatedData.role = roleStr;
      }

      justSaved.current = true;
      await updateDoc(userRef, updatedData);

      if (onLogActivity) {
        onLogActivity('Updated Profile', 'Modified personal profile details.');
      }
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Keep justSaved as true temporarily to allow db socket snapshots to catch up
      setTimeout(() => {
        justSaved.current = false;
      }, 2000);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      justSaved.current = false;
      setErrorMsg(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const isProfileComplete = name && phone && bio && (github || linkedin || website);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto pb-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Dynamic User Profile</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your operational credentials, avatars, and linked social channels.</p>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saveLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0FA484] hover:bg-[#0c856a] rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveLoading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            <PenTool className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Cover Canvas Background */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-teal-500 via-[#0FA484] to-blue-600 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute bottom-4 right-6 bg-black/20 backdrop-blur-md text-white/90 text-[10px] font-mono px-3 py-1.5 rounded-lg uppercase tracking-wider">
            Operational Desk
          </div>
        </div>

        {/* Profile Details Area */}
        <div className="px-6 sm:px-10 pb-10 relative">
          
          {/* Main Header / Avatar info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-8 z-10 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative group inline-block w-28 h-28 sm:w-36 sm:h-36">
                <img 
                  src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || user?.email || 'Dev')}`} 
                  alt="Profile" 
                  className="w-full h-full rounded-[28px] object-cover border-4 border-white shadow-xl bg-slate-50 transition-all duration-300 group-hover:brightness-95" 
                  referrerPolicy="no-referrer"
                />
                
                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-[28px] bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-[9px] uppercase font-mono font-bold select-none">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mb-1" />
                    <span>Uploading...</span>
                  </div>
                )}
                
                {isEditing && !isUploadingPhoto && (
                  <button 
                    onClick={handleUploadClick}
                    className="absolute bottom-1 right-1 p-2.5 bg-[#0FA484] text-white rounded-2xl shadow-lg border-2 border-white hover:bg-[#0c856a] hover:scale-105 transition-all"
                    type="button"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-4 h-4" />
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

              <div className="pb-1 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-800 tracking-tight leading-tight">
                  {name || profile?.name || 'User Profile'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border flex items-center gap-1.5 ${
                    profile?.role === 'admin' 
                      ? 'bg-amber-50 text-amber-600 border-amber-200' 
                      : profile?.role === 'team'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  }`}>
                    {profile?.role === 'admin' ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <UserCheck className="w-3 h-3" />
                    )}
                    {profile?.role || 'Guest'}
                  </span>
                  
                  {isProfileComplete ? (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-lg">
                      Profile Complete
                    </span>
                  ) : (
                    <span className="bg-slate-50 text-slate-400 border border-slate-100 text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Incomplete Details
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Primary Personal Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-[#0FA484]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Personal Space</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Contact-Line Phone</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        placeholder="+1 (555) 019-2834"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Access Clearance Role</label>
                      <div className="relative">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={roleStr}
                          onChange={e => setRoleStr(e.target.value)}
                          disabled={!isEditing}
                          className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner appearance-none"
                        >
                          <option value="admin">Super Admin</option>
                          <option value="team">Team Member</option>
                          <option value="client">Standard Client</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Communication Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Mail className="w-4 h-4 text-[#0FA484]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Linked Credentials</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5 flex justify-between">
                      <span>Primary Registered Email</span>
                      <span className="text-[9px] text-[#0FA484] tracking-widest font-mono font-bold">Immutable</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-slate-100/70 border border-slate-200/50 rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-500 cursor-not-allowed" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Professional Biography</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-4 w-4 h-4 text-slate-400" />
                      <textarea 
                        rows={3}
                        placeholder="Share a short bio detailing your workspace expertise, technology focus, or professional background..."
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        disabled={!isEditing}
                        className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner resize-none min-h-[105px]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Social Accounts Area */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Globe className="w-4 h-4 text-[#0FA484]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Social Accounts & Work Channels</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">GitHub Space</label>
                  <div className="relative">
                    <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Twitter / X Channel</label>
                  <div className="relative">
                    <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://twitter.com/handle"
                      value={twitter}
                      onChange={e => setTwitter(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-0.5">Website / Portfolio</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-transparent rounded-[16px] pl-10 pr-4 py-3.5 text-sm text-slate-800 disabled:opacity-75 disabled:cursor-not-allowed focus:border-[#0FA484] focus:ring-2 focus:ring-[#0FA484]/15 focus:outline-none focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar inside panel */}
            <AnimatePresence>
              {(isEditing || saveSuccess) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100"
                >
                  {saveSuccess ? (
                    <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-4 py-3 rounded-2xl w-full sm:w-auto">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 shadow-sm" />
                      <span>Operational Identity Updated Successfully!</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs px-1 text-center sm:text-left">
                      Review all parameters carefully. Edits apply instantly to your workspace registry.
                    </span>
                  )}
                  
                  {isEditing && (
                    <button 
                      type="submit" 
                      disabled={saveLoading}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#0FA484] hover:bg-[#0c856a] text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saveLoading ? 'Deploying...' : 'Save Profile Changes'}</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

        </div>
      </div>
    </div>
  );
}
