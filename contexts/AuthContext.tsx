import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpDetails extends SignInCredentials {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  medicalHistory?: string;
  height?: string;
  weight?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Failed to fetch session', error);
      }

      if (isMounted) {
        setSession(data.session ?? null);
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    birthDate,
    gender,
    medicalHistory,
    height,
    weight,
  }: SignUpDetails) => {
    const metadataEntries = Object.entries({
      full_name: fullName?.trim(),
      birth_date: birthDate?.trim(),
      gender: gender?.trim(),
      medical_history: medicalHistory?.trim(),
      height: height?.trim(),
      weight: weight?.trim(),
    }).filter(([, value]) => Boolean(value));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: Object.fromEntries(metadataEntries),
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

