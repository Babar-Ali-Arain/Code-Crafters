import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../layout/FirebaseProvider';
import { ChevronLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setPassword('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && !agreedToTerms) {
      setError('You must agree to the Terms of Service to create an account.');
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
      onClose();
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
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in was canceled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          {/* Modal Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full h-full sm:h-auto sm:max-w-[400px] overflow-hidden sm:rounded-[40px] bg-white sm:shadow-2xl flex flex-col"
          >
            {/* Top Navigation inside modal */}
            <div className="flex justify-between items-center px-6 pt-10 sm:pt-8 pb-4 bg-white sticky top-0 z-20">
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold font-display text-blue-500 tracking-wide mr-2">
                ConsoleBase
              </h1>
              <div className="w-10"></div> {/* Placeholder for balance */}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              
              {/* Card Container for form */}
              <div className="bg-white mt-2">
                <div className="text-center mb-8 px-4">
                  <h2 className="text-[26px] font-bold font-display text-slate-900 leading-tight">
                    {isSignUp ? 'Create an Account?' : 'Welcome to \nConsoleBase login now!'}
                  </h2>
                </div>

                {/* Error Callout */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs mb-6 mx-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 px-2">
                  <AnimatePresence mode="popLayout">
                    {isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5"
                      >
                        <label className="text-xs font-semibold text-slate-700 ml-1">Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required={isSignUp}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-slate-50 border border-transparent rounded-[20px] px-5 py-4 text-sm text-slate-900 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder-slate-400"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="joedoe75@gmail.com"
                        className="w-full bg-slate-50 border border-transparent rounded-[20px] px-5 py-4 text-sm text-slate-900 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pb-2">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-transparent rounded-[20px] px-5 py-4 text-sm text-slate-900 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder-slate-400 pr-12 font-mono tracking-widest"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-1 pb-4">
                    <button 
                      type="button"
                      onClick={() => setAgreedToTerms(!agreedToTerms)}
                      className="flex items-center gap-2 group focus:outline-none"
                    >
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${agreedToTerms ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-400 bg-white'}`}>
                         {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700">
                        {isSignUp ? <span>I agree to the <b className="text-blue-500">Terms of Service</b></span> : 'Remember me'}
                      </span>
                    </button>
                    
                    {!isSignUp && (
                      <button type="button" className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                        Forget password?
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-70 active:scale-[0.98] font-bold py-4 rounded-full text-sm transition-all duration-300 shadow-md shadow-blue-500/20"
                  >
                    {loading ? 'Processing...' : isSignUp ? 'Create account' : 'Login'}
                  </button>
                </form>

                <div className="text-center mt-8 mb-6">
                  <span className="text-xs text-slate-400 font-medium px-2 bg-white relative z-10">Or Sign {isSignUp ? 'up' : 'in'} with</span>
                  <div className="w-full h-px bg-slate-100 -mt-2 absolute left-0"></div>
                </div>

                <div className="flex justify-center gap-4 px-4 pb-4">
                  {/* Fake Facebook button */}
                  <button type="button" className="w-12 h-12 rounded-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-center hover:-translate-y-1 transition-transform">
                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  
                  {/* Google Button */}
                  <button type="button" onClick={handleGoogleLogin} className="w-12 h-12 rounded-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-center hover:-translate-y-1 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.58-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11c-2.074-1.933-4.947-3.11-8.274-3.11-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.534-4.87 11.534-11.74 0-.788-.085-1.39-.19-1.885h-11.344z"/>
                    </svg>
                  </button>

                  {/* Fake Apple button */}
                  <button type="button" className="w-12 h-12 rounded-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center justify-center hover:-translate-y-1 transition-transform">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M16.365 21.44c-1.507.96-3.083.744-4.542.062-1.258-.588-2.529-.553-3.903.024-1.782.756-3.155.518-4.32-1.127-4.14-5.836-3.23-13.488 2.658-13.805 1.517.014 2.89.878 3.738.878.89 0 2.628-1.096 4.356-.928.796.024 3.01.326 4.417 2.389-3.411 2.016-2.85 6.78.694 8.214-1.02 2.617-2.128 3.96-3.098 4.293zM14.887 2.152c-.93 1.134-2.39 1.83-3.69 1.705.184-1.332.955-2.615 1.849-3.435.918-1.066 2.441-1.761 3.655-1.636-.089 1.488-.86 2.502-1.814 3.366z"/>
                    </svg>
                  </button>
                </div>

                <div className="text-center pt-8">
                   <button 
                     type="button" 
                     onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                     }} 
                     className="text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                   >
                     {isSignUp ? (
                       <span>Already have an account? <span className="text-blue-500">Log In</span></span>
                     ) : (
                       <span>Don't have an account? <span className="text-blue-500">Create one</span></span>
                     )}
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

