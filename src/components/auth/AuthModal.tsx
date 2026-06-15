import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../layout/FirebaseProvider';
import { X, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#080f21] p-6 sm:p-8 shadow-2xl z-10"
          >
            {/* Visual background accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-golden/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-electric/15 flex items-center justify-center text-electric">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-semibold text-gray-400 tracking-wider">CODE CRAFTERS PORTAL</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switches */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-6 relative z-10">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                  !isSignUp
                    ? 'bg-electric text-navy shadow-[0_4px_12px_rgba(0,240,255,0.2)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                  isSignUp
                    ? 'bg-electric text-navy shadow-[0_4px_12px_rgba(0,240,255,0.2)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-display font-medium text-white mb-1">
                {isSignUp ? 'Create your Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400 text-xs mb-6">
                {isSignUp 
                  ? 'Join our premium engineering ecosystem & manage code tasks.' 
                  : 'Log in to access your administrative actions or team sprints.'}
              </p>

              {/* Error Callout */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs mb-4"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-electric transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-navy hover:bg-electric hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Separator */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <span className="relative bg-[#080f21] px-3.5 text-[10px] text-gray-500 font-mono uppercase tracking-widest">or continue with</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 active:scale-[0.99] text-white flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                {/* Google Icon Vector */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.58-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11c-2.074-1.933-4.947-3.11-8.274-3.11-6.63 0-12 5.37-12 12s5.37 12 12 12c6.923 0 11.534-4.87 11.534-11.74 0-.788-.085-1.39-.19-1.885h-11.344z"/>
                </svg>
                <span>Google single sign-on</span>
              </button>

              <div className="text-center mt-6 text-[10px] text-gray-500 font-sans max-w-xs mx-auto">
                By entering the platform, you acknowledge agreement with our clean documentation, enterprise security paradigms & legal templates.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
