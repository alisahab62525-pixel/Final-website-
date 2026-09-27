import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Profile, UserRole } from '../types';

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

const SESSION_CACHE_KEY = 'ali_session_user_ref';

export const authService = {
  // Get active session
  async getSession(): Promise<AuthSession | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) return null;

        return {
          user: {
            id: session.user.id,
            email: session.user.email || '',
          },
          profile,
        };
      } catch (err) {
        console.error('Failed to get Supabase session', err);
        return null;
      }
    } else {
      // Local session check
      const savedUserId = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (!savedUserId) return null;

      const profile = inMemoryDb.profiles.find(p => p.id === savedUserId);
      if (!profile) return null;

      return {
        user: {
          id: profile.id,
          email: profile.email,
        },
        profile,
      };
    }
  },

  // Register Customer (Strictly role="customer", never admin)
  async registerCustomer(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ user: { id: string; email: string }; profile: Profile }> {
    if (isSupabaseConfigured()) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      });

      if (error || !authData.user) {
        throw new Error(error?.message || 'Registration failed');
      }

      // Check profile created by trigger
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profile) {
        // Fallback insert if trigger not executed yet
        const newProfile: Profile = {
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: inserted } = await supabase.from('profiles').insert(newProfile).select().single();
        profile = inserted || newProfile;
      }

      return {
        user: { id: authData.user.id, email: authData.user.email || data.email },
        profile,
      };
    } else {
      // In-memory registration
      const existing = inMemoryDb.profiles.find(p => p.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const newId = 'cust-' + Math.random().toString(36).substring(2, 9);
      const newProfile: Profile = {
        id: newId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'customer', // strictly customer
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      inMemoryDb.profiles.push(newProfile);
      inMemoryDb.notify();
      sessionStorage.setItem(SESSION_CACHE_KEY, newId);

      return {
        user: { id: newId, email: data.email },
        profile: newProfile,
      };
    }
  },

  // Customer Login
  async loginCustomer(email: string, password: string): Promise<AuthSession> {
    if (isSupabaseConfigured()) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !authData.user) {
        throw new Error(error?.message || 'Invalid email or password');
      }

      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profError || !profile) {
        throw new Error('User profile record not found');
      }

      return {
        user: { id: authData.user.id, email: authData.user.email || email },
        profile,
      };
    } else {
      // Demo authentication:
      const profile = inMemoryDb.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        throw new Error('Account not found with this email. Please create an account.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      sessionStorage.setItem(SESSION_CACHE_KEY, profile.id);
      return {
        user: { id: profile.id, email: profile.email },
        profile,
      };
    }
  },

  // Admin Login (Requires profile.role === 'admin')
  async loginAdmin(email: string, password: string): Promise<AuthSession> {
    if (isSupabaseConfigured()) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !authData.user) {
        throw new Error(error?.message || 'Invalid administrator credentials');
      }

      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Administrator profile record not found');
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not possess administrator privileges.');
      }

      return {
        user: { id: authData.user.id, email: authData.user.email || email },
        profile,
      };
    } else {
      const profile = inMemoryDb.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile || profile.role !== 'admin') {
        throw new Error('Access denied. Invalid administrator credentials or role.');
      }
      if (password.length < 4) {
        throw new Error('Please enter your administrator password.');
      }

      sessionStorage.setItem(SESSION_CACHE_KEY, profile.id);
      return {
        user: { id: profile.id, email: profile.email },
        profile,
      };
    }
  },

  // Sign out
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  },

  // Update profile
  async updateProfile(userId: string, data: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>): Promise<Profile> {
    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updated) {
        throw new Error(error?.message || 'Failed to update profile');
      }
      return updated;
    } else {
      const index = inMemoryDb.profiles.findIndex(p => p.id === userId);
      if (index === -1) throw new Error('Profile not found');
      inMemoryDb.profiles[index] = {
        ...inMemoryDb.profiles[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      inMemoryDb.notify();
      return inMemoryDb.profiles[index];
    }
  },
};
