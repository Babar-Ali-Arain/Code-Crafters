import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'admin' | 'team' | 'client';
  createdAt: any;
  updatedAt: any;
  phone?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeam: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, name: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Configure prompt to select accounts if wanted
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user, result.user.displayName || 'Google Member');
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  // Sign up with Email and Password
  const signUpWithEmail = async (email: string, name: string, pass: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      await syncUserProfile(result.user, name);
    } catch (err) {
      console.error('Email Sign Up Error:', err);
      throw err;
    }
  };

  // Sign in with Email and Password
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfile(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
      throw err;
    }
  };

  // Synchronize Auth User with Firestore Database Profiles collection
  const syncUserProfile = async (authUser: User, displayName: string) => {
    const userRef = doc(db, 'users', authUser.uid);
    try {
      const snap = await getDoc(userRef);
      const isDefaultAdmin = authUser.email?.toLowerCase() === 'babaraliarain2211@gmail.com';
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email || '',
          name: displayName,
          photoURL: authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
          role: isDefaultAdmin ? 'admin' : 'client',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, newProfile);
      } else {
        const existingData = snap.data() as UserProfile;
        if (isDefaultAdmin && existingData.role !== 'admin') {
          await updateDoc(userRef, {
            role: 'admin',
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (err: any) {
      console.warn(
        `[Firebase Sync] Profiling synchronization postponed or offline. ` +
        `This is expected during transient offline connections, token refresh cycles, or cold-starts. ` +
        `Using cached local fallback. Details: ${err?.message || err}`
      );
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Sync user profile first to ensure document exists
        syncUserProfile(currentUser, currentUser.displayName || currentUser.email || 'Console Member');

        // Handle listening to user profile changes
        const profileRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // Profile entry may not be created yet due to sync latency
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Listening to user profile error:", err);
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isTeam = profile?.role === 'team' || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isTeam,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}
