import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  staffProfile: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maps a `staff` table row (snake_case) to the app's User type (camelCase-ish)
function mapStaffRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    nameKm: row.name_km ?? row.name,
    email: row.email,
    role: row.role,
    preferred_language: row.preferred_language,
    avatar: row.avatar ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaffProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Auth succeeded but no matching staff row exists yet.
      setError(
        'Signed in, but no staff profile was found for this account. Ask an Admin to add you to the staff table.'
      );
      setStaffProfile(null);
      return;
    }
    setStaffProfile(mapStaffRow(data));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadStaffProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        loadStaffProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setStaffProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setStaffProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, staffProfile, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
