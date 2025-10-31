'use client';

import { ReactNode, createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const TOKEN_KEY = 'auth_token';

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } catch (error) {
        console.warn('Failed to clear auth token on startup', error);
      } finally {
        if (isMounted) {
          setIsAuthenticated(false);
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

    if (error) {
      throw new Error(error.message);
    }

    const accessToken = data.session?.access_token;

    if (!accessToken) {
      throw new Error('Gagal mendapatkan token dari Supabase.');
    }

    try {
      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    } catch (err) {
      console.warn('Failed to persist auth token', err);
    }

    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear auth token on logout', error);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('Supabase sign out error', error);
    }

    setIsAuthenticated(false);
  }, []);

  const restore = useCallback(async () => {
    setIsReady(false);

    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear auth token on restore', error);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('Supabase sign out error during restore', error);
    }

    setIsAuthenticated(false);
    setIsReady(true);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      login,
      logout,
      restore,
    }),
    [isAuthenticated, isReady, login, logout, restore],
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
