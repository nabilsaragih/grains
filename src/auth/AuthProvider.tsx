'use client';

import { ReactNode, createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'auth_user_id';

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
      } catch (error) {
        console.warn('Failed to clear auth token on startup', error);
      } finally {
        if (isMounted) {
          setIsAuthenticated(false);
          setUserId(null);
          setIsReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email dan password harus diisi');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    console.log('Supabase signInWithPassword response', { data, error });

    if (error) {
      throw new Error(error.message);
    }

    const accessToken = data.session?.access_token;
    const nextUserId = data.user?.id ?? data.session?.user?.id ?? null;

    if (!accessToken) {
      throw new Error('Gagal mendapatkan token dari Supabase.');
    }

    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [USER_ID_KEY, nextUserId ?? ''],
      ]);
    } catch (err) {
      console.warn('Failed to persist auth token', err);
    }

    setIsAuthenticated(true);
    setUserId(nextUserId);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
    } catch (error) {
      console.warn('Failed to clear auth token on logout', error);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('Supabase sign out error', error);
    }

    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  const restore = useCallback(async () => {
    setIsReady(false);

    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
    } catch (error) {
      console.warn('Failed to clear auth token on restore', error);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('Supabase sign out error during restore', error);
    }

    setIsAuthenticated(false);
    setUserId(null);
    setIsReady(true);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      userId,
      login,
      logout,
      restore,
    }),
    [isAuthenticated, isReady, userId, login, logout, restore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
