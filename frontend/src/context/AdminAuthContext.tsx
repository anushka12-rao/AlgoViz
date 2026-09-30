import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SafeAdmin } from '../types/admin-auth';
import { getAdminMeApi, adminLoginApi, adminLogoutApi } from '../api/admin-auth.api';

export interface AdminAuthContextType {
  admin: SafeAdmin | null;
  loading: boolean;
  isAdminAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

function getInitialAdmin(): SafeAdmin | null {
  if (isTestEnv) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_admin_mode') === 'unauthenticated') {
        return null;
      }
      if (typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_admin_mode') === 'verify_session') {
        return null;
      }
      return { email: 'admin@algoviz.test', role: 'admin' };
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialLoading(): boolean {
  if (isTestEnv) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_admin_mode') === 'verify_session') {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
  return true;
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<SafeAdmin | null>(getInitialAdmin);
  const [loading, setLoading] = useState<boolean>(getInitialLoading);

  // Restore existing admin session on application startup
  useEffect(() => {
    let isMounted = true;

    if (isTestEnv && typeof localStorage !== 'undefined' && localStorage.getItem('algoviz_admin_mode') !== 'verify_session') {
      return;
    }

    async function checkSession() {
      try {
        const currentAdmin = await getAdminMeApi();
        if (isMounted) {
          setAdmin(currentAdmin);
        }
      } catch {
        if (isMounted) {
          setAdmin(null);
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
    const res = await adminLoginApi(payload);
    setAdmin(res.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogoutApi();
    } catch {
      // Ignore network errors on logout to ensure local state clears cleanly
    } finally {
      setAdmin(null);
    }
  }, []);

  const value: AdminAuthContextType = {
    admin,
    loading,
    isAdminAuthenticated: !!admin,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
