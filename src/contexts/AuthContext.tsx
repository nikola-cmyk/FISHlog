import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserProfile, setUserProfile, type UserProfile } from '@/lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fishingName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (fishingName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login with demo user
    const initAuth = () => {
      const existingProfile = getUserProfile();
      
      if (!existingProfile) {
        // Create default profile if none exists
        const newProfile = setUserProfile('Demo Fisher');
        setProfile(newProfile);
        setUser({ id: newProfile.user_id, email: 'demo@fishlog.app' });
      } else {
        setProfile(existingProfile);
        setUser({ id: existingProfile.user_id, email: 'demo@fishlog.app' });
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - always succeeds
    const existingProfile = getUserProfile();
    if (!existingProfile) {
      const newProfile = setUserProfile('Demo Fisher');
      setProfile(newProfile);
      setUser({ id: newProfile.user_id, email: email });
    } else {
      setProfile(existingProfile);
      setUser({ id: existingProfile.user_id, email: email });
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, fishingName: string) => {
    // Mock sign up - always succeeds
    const newProfile = setUserProfile(fishingName);
    setProfile(newProfile);
    setUser({ id: newProfile.user_id, email: email });
    return { error: null };
  };

  const signOut = async () => {
    // Keep the profile but just clear user state
    setUser(null);
  };

  const updateProfile = async (fishingName: string) => {
    const updatedProfile = setUserProfile(fishingName);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}