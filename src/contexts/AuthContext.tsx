import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { authService, AuthSession } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  loginCustomer: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  registerCustomer: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load session on startup
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentSession = await authService.getSession();
        if (mounted) {
          setSession(currentSession);
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Supabase auth listener if configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT' || !sbSession) {
          setSession(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const fresh = await authService.getSession();
          setSession(fresh);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const loginCustomer = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.loginCustomer(email, password);
      setSession(res);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.loginAdmin(email, password);
      setSession(res);
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (data: { fullName: string; email: string; phone: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.registerCustomer(data);
      setSession(res);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>) => {
    if (!session?.user.id) return;
    const updated = await authService.updateProfile(session.user.id, data);
    setSession(prev => (prev ? { ...prev, profile: updated } : null));
  };

  const isAdmin = session?.profile?.role === 'admin';
  const isAuthenticated = Boolean(session?.user);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        profile: session?.profile || null,
        isAdmin,
        isAuthenticated,
        loading,
        loginCustomer,
        loginAdmin,
        registerCustomer,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
