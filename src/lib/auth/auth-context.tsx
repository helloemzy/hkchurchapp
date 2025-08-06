'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  language: 'zh-HK' | 'zh-CN' | 'en';
  role: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);

      // Handle auth events
      if (event === 'SIGNED_IN') {
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile with role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      setProfile({
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        language: profileData.language,
        role: roleData?.role ?? 'member',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      // Log security event
      await logSecurityEvent('successful_login', 'low');
    } else {
      // Log failed login attempt
      await logSecurityEvent('failed_login', 'medium');
    }

    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          language: 'en',
          timezone: 'Asia/Hong_Kong',
        }]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      // Assign default member role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: data.user.id,
          role: 'member',
        }]);

      if (roleError) {
        console.error('Error assigning user role:', roleError);
      }

      // Log security event
      await logSecurityEvent('user_registration', 'low');
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await logSecurityEvent('user_logout', 'low');
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error) {
      await logSecurityEvent('oauth_login_google', 'low');
    }

    return { error };
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error) {
      await logSecurityEvent('oauth_login_github', 'low');
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    setSession(session);
    setUser(session?.user ?? null);
  };

  const logSecurityEvent = async (eventType: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    try {
      await supabase.from('security_events').insert([{
        event_type: eventType,
        severity,
        user_id: user?.id,
        ip_address: 'unknown', // This would be populated by middleware
        user_agent: navigator.userAgent,
        details: {
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      }]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    updateProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Alias for compatibility
export const useAuthContext = useAuth;

export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}

export function useRequireRole(requiredRole: UserProfile['role'], redirectTo = '/unauthorized') {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile && !hasRole(profile.role, requiredRole)) {
      router.push(redirectTo);
    }
  }, [profile, loading, router, redirectTo, requiredRole]);

  return { profile, loading };
}

// Role hierarchy helper
function hasRole(userRole: UserProfile['role'], requiredRole: UserProfile['role']): boolean {
  const roleHierarchy = {
    'member': 0,
    'group_leader': 1,
    'pastor': 2,
    'admin': 3,
    'super_admin': 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}