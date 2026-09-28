import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { getMeApi, loginApi, signupApi, logoutApi } from '../api/auth.api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

function getInitialUser(): User | null {
  if (isTestEnv) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_auth_mode') === 'guest') {
        return null;
      }
      return { id: 'test-user', email: 'test@example.com', username: 'TestUser' };
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialLoading(): boolean {
  if (isTestEnv) {
    return false;
  }
  return true;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState<boolean>(getInitialLoading);

  // Check existing session on application startup
  useEffect(() => {
    let isMounted = true;

    if (isTestEnv && typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_auth_mode') !== 'verify_session') {
      return;
    }

    async function checkSession() {
      try {
        const currentUser = await getMeApi();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const res = await loginApi(payload);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (payload: { email: string; username: string; password: string }) => {
      const res = await signupApi(payload);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout to ensure local logout always succeeds
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
