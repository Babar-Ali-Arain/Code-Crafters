import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../layout/FirebaseProvider';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, Check, AlertCircle, User, Mail, Lock } from 'lucide-react';
import { COMPANY_NAME } from '../../lib/constants';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && !agreedToTerms) {
      setError('You must agree to the Terms of Service to create an account.');
      return;
    }
    
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUpWithEmail(email, name, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'An authentication error occurred';
      if (errMsg.includes('auth/invalid-credential')) {
        errMsg = 'Invalid email or password credentials.';
      } else if (errMsg.includes('auth/email-already-in-use')) {
        errMsg = 'This email is already registered.';
      } else if (errMsg.includes('auth/weak-password')) {
        errMsg = 'The password must be stronger.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020514] text-white flex items-center justify-center p-0 sm:p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Star Grid / Wave pattern overlay */}
      <div 
        className="absolute inset-0 opacity-100 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Dynamic Cosmic Soft Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[110px] pointer-events-none z-0" />

      {/* Back button to homepage */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all duration-300 shadow-lg"
        id="bg-btn-back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Main Container Card: Fully responsive split screen on tablet/desktop */}
      <div className="w-full max-w-5xl min-h-[100dvh] sm:min-h-[600px] h-auto lg:h-[650px] bg-[#03071C]/80 backdrop-blur-2xl sm:rounded-3xl border-0 sm:border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Premium Welcome Splash Panel (Hidden on mobile) */}
        <div className="hidden md:flex w-1/2 flex-col justify-between p-12 bg-gradient-to-b from-[#060B28]/90 to-[#03071C]/95 border-r border-white/5 relative overflow-hidden select-none">
          {/* Wave/Glow vectors inside left panel */}
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-blue-500/10 blur-[60px]" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-indigo-500/10 blur-[60px]" />
          
          <svg className="absolute inset-0 h-full w-full stroke-white/[0.03] fill-none pointer-events-none" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 150 C 120 220, 180 80, 420 320 C 520 420, 280 620, 520 850" strokeWidth="1.5" className="stroke-[#00F0FF]/15" />
            <path d="M-50 200 C 170 270, 130 30, 370 420 C 470 520, 230 720, 470 950" strokeWidth="1" className="stroke-indigo-500/10" />
            <path d="M-150 100 C 70 170, 230 230, 230 400 C 230 570, 330 670, 380 800" strokeWidth="2" strokeDasharray="4 4" className="stroke-[#00F0FF]/10" />
          </svg>

          {/* Top Brand Info */}
          <div className="flex items-center gap-3 relative z-10">
            <img 
              src="/logo.png" 
              alt={COMPANY_NAME} 
              className="w-10 h-10 object-contain rounded-xl border border-white/15 bg-white/5 p-1 shadow-md"
            />
            <div className="leading-none">
              <span className="font-display font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {COMPANY_NAME}
              </span>
              <p className="text-[10px] font-mono tracking-wider text-[#00F0FF] uppercase mt-0.5">Software Solutions</p>
            </div>
          </div>

          {/* Core Greeting Text with Smooth Transition */}
          <div className="relative z-10 my-auto">
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <motion.div
                  key="signup-welcome"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-[42px] leading-[1.1] font-display font-extrabold tracking-tight mb-4">
                    Create your<br />
                    <span className="bg-gradient-to-r from-[#00F0FF] to-[#0D9488] bg-clip-text text-transparent">account . . .</span>
                  </h2>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                    It's just few minutes and free! Get started to connect with premium operations console of Code Crafters.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="login-welcome"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-[42px] leading-[1.1] font-display font-extrabold tracking-tight mb-4">
                    Welcome<br />
                    <span className="bg-gradient-to-r from-[#00F0FF] via-blue-400 to-indigo-400 bg-clip-text text-transparent">back . . .</span>
                  </h2>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                    Access your account instantly. Monitor institutional performance, track service tickets, and align workflow operations seamlessly.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer of Splash */}
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="tracking-wider uppercase text-[10px] font-bold text-slate-400">Operations Console Active</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Input Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto custom-scrollbar h-full bg-[#04081E]/40 sm:bg-transparent relative z-10">
          
          {/* Mobile Top Branding / Logo */}
          <div className="flex md:hidden flex-col items-center text-center mt-6 mb-8">
            <img 
              src="/logo.png" 
              alt={COMPANY_NAME} 
              className="w-14 h-14 object-contain rounded-2xl border border-white/10 bg-white/5 p-1 mb-3 shadow-[0_0_20px_rgba(0,183,255,0.2)]"
            />
            <h1 className="text-xl font-bold font-display tracking-tight text-white mb-0.5">
              {COMPANY_NAME}
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">Digital Operations Console</p>
          </div>

          <div className="my-auto w-full max-w-[380px] mx-auto">
            {/* Form Headers */}
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold font-display tracking-tight text-white mb-2">
                {isSignUp ? "Create your account" : "Welcome back..."}
              </h3>
              <p className="text-xs text-slate-400">
                {isSignUp ? "it's just few minutes and free!" : "Sign in to continue"}
              </p>
            </div>

            {/* Error Callout */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs mb-6 shadow-lg shadow-red-950/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-slate-300 ml-1">Username / Full Name</label>
                    <div className="relative group/field">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-focus-within/field:border-[#00F0FF]/30 transition-colors">
                        <User className="w-4 h-4 text-slate-400 group-focus-within/field:text-[#00F0FF] transition-colors" />
                      </div>
                      <input
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-[#00F0FF]/50 rounded-2xl pl-14 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 focus:bg-white/[0.04] transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative group/field">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-focus-within/field:border-[#00F0FF]/30 transition-colors">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within/field:text-[#00F0FF] transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="webmail@mail.com"
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-[#00F0FF]/50 rounded-2xl pl-14 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 focus:bg-white/[0.04] transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5 label-pass">
                <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
                <div className="relative group/field">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-focus-within/field:border-[#00F0FF]/30 transition-colors">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within/field:text-[#00F0FF] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-[#00F0FF]/50 rounded-2xl pl-14 pr-16 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 focus:bg-white/[0.04] transition-all font-medium"
                  />
                  {/* Show/Hide password toggle */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00F0FF] focus:outline-none flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="text-[10px] font-mono select-none hidden sm:inline opacity-70">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-mono select-none hidden sm:inline opacity-70">Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Toggles: Accept Terms / Remember row */}
              <div className="flex items-center justify-between pt-1 pb-3">
                <button 
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="flex items-center gap-2 group focus:outline-none text-left"
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/10 group-hover:border-white/20 bg-white/5'}`}>
                     {agreedToTerms && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                    {isSignUp ? (
                      <span>I agree with <b className="text-[#00F0FF] hover:underline animate-duration-100">terms and conditions</b>.</span>
                    ) : (
                      'I agree with terms and conditions.'
                    )}
                  </span>
                </button>
                
                {!isSignUp && (
                  <button type="button" className="text-[11px] font-semibold text-[#00F0FF] hover:underline transition-all">
                    Forget password?
                  </button>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-bold py-4 rounded-2xl text-sm transition-all duration-300 shadow-[0_4px_30px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_35px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>{isSignUp ? 'Create account' : 'LOG IN'}</span>
                )}
              </button>
            </form>

            {/* Social logins */}
            <div className="text-center mt-7 mb-5 relative">
              <span className="text-[10px] tracking-wider text-slate-500 font-bold uppercase px-4 bg-[#03071C]/90 sm:bg-[#03071C] relative z-10">
                Or Continue With
              </span>
              <div className="w-full h-px bg-white/5 absolute top-1/2 left-0 z-0" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Google Button */}
              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full py-3.5 border border-white/10 hover:border-white/20 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] flex items-center justify-center gap-3 text-xs text-white font-semibold transition-all duration-350 active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.58-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11c-2.074-1.933-4.947-3.11-8.274-3.11-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.534-4.87 11.534-11.74 0-.788-.085-1.39-.19-1.885h-11.344z"/>
                </svg>
                <span>Google Connection</span>
              </button>
            </div>
          </div>

          {/* Toggle bottom link */}
          <div className="text-center pt-8 pb-2">
             <button 
               type="button" 
               onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
               }} 
               className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors"
             >
               {isSignUp ? (
                 <span>Already member? <span className="text-[#00F0FF] hover:underline font-bold">Sign in</span></span>
               ) : (
                 <span>Don't have an account? <span className="text-[#00F0FF] hover:underline font-bold">Sign Up</span></span>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
