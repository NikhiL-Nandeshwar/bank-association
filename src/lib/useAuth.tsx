'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// API
import { getCurrentUser, changePassword, logout as logoutApi, type ChangePasswordRequest } from '@/actions/api';

// Types
import type { CurrentUser } from '@/types/api.types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  user: CurrentUser | null;
  status: AuthStatus;
  login: () => Promise<void>; // note: no user param now
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component that manages user state and authentication status.
 * Provides login, logout, change password, and user refresh functions to the context.
 * @param param0 
 * @returns 
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Function to refresh current user data and update auth status
  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  // On mount, check if user is authenticated by calling refreshUser
  useEffect(() => {
    void refreshUser();
  }, []);

  // LOGIN
  const login = async () => {
    // Backend should set HttpOnly cookie on login
    await refreshUser();
    toast.success('Logged in successfully.');
  };

  // LOGOUT
  const logout = async () => {
    setStatus('loading');

    try {
      await logoutApi();

      setUser(null);
      setStatus('unauthenticated');

      toast.success('Logged out successfully.');
    } catch {
      toast.error('Logout failed.');
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      // toast.success('Logged out successfully.');
    }
  };

  // change password handler that calls API and shows toast
  const handleChangePassword = async (payload: ChangePasswordRequest) => {
    await changePassword(payload);
    toast.success('Password changed successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        logout,
        changePassword: handleChangePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 * @throws Will throw an error if used outside of AuthProvider
 * @returns 
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}