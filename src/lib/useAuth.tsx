'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// Actions
import { getCurrentUser, changePassword, logout as logoutApi, type ChangePasswordRequest } from '@/actions/api';
import { clearAuthToken } from '@/actions/api/client';

// Types
import type { CurrentUser } from '@/types/api.types';

type AuthContextType = {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (user: CurrentUser) => void;
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: CurrentUser) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const payload = user ? { userId: user.userId } : undefined;
      await logoutApi(payload);
    } catch {
      // Continue with client-side logout even if API call fails.
    } finally {
      clearAuthToken();
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  const handleChangePassword = async (payload: ChangePasswordRequest) => {
    await changePassword(payload);
    toast.success('Password changed successfully.');
  };

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch {
      // If token is invalid, user is not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}