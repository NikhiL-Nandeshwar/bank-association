'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// Actions
import { getCurrentUser, changePassword, logout as logoutApi, type ChangePasswordRequest } from '@/actions/api';
import { clearAuthToken, readStoredToken, readStoredUser, storeAuthUser } from '@/actions/api/client';

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
  const [user, setUser] = useState<CurrentUser | null>(() => {
    if (typeof window !== 'undefined') {
      return readStoredUser();
    }

    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: CurrentUser) => {
    setUser(userData);
    storeAuthUser(userData);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const payload = user ? { userId: user.userId } : undefined;
      await logoutApi(payload);
    } catch {
      // Continue with client-side logout even if API call fails.
    } finally {
      clearAuthToken();
      setUser(null);
      setIsLoading(false);
      toast.success('Logged out successfully.');
    }
  };

  const handleChangePassword = async (payload: ChangePasswordRequest) => {
    await changePassword(payload);
    toast.success('Password changed successfully.');
  };

  const refreshUser = async () => {
    const storedUser = readStoredUser();
    const storedToken = readStoredToken();

    try {
      const response = await getCurrentUser();
      setUser(response.data);
      storeAuthUser(response.data);
    } catch {
      if (storedUser && storedToken) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
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