'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

// API
import { getCurrentUser, changePassword, logout as logoutApi, type ChangePasswordRequest } from '@/actions/api';

// Types
import type { CurrentUser, LoginResponse } from '@/types/api.types';
import { clearAuthSession, getRefreshToken, saveAuthSession } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';
import SessionExpiredModal from '@/components/common/SessionExpiredModal';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  user: CurrentUser | null;
  status: AuthStatus;
  sessionExpired: boolean;
  login: (session: LoginResponse) => Promise<void>;
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

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



  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setStatus('unauthenticated');
      setSessionExpired(true);
    };

    window.addEventListener(
      'session-expired',
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        'session-expired',
        handleSessionExpired
      );
    };
  }, []);

  // On mount, check if user is authenticated by calling refreshUser
  useEffect(() => {
    void refreshUser();
  }, []);

  // LOGIN
  const login = async (session: LoginResponse) => {
    saveAuthSession(session);
    setSessionExpired(false);
    await refreshUser();
    toast.success('Logged in successfully.');
  };

  // LOGOUT
  const logout = async () => {
    setStatus('loading');

    try {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        await logoutApi({
          refreshToken,
        });
      }
      clearAuthSession();

      setUser(null);
      setStatus('unauthenticated');

      toast.success('Logged out successfully.');
    } catch {
      toast.error('Logout failed.');
    } finally {
      clearAuthSession();
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
        sessionExpired,
      }}
    >
      {children}

      <SessionExpiredModal
        open={sessionExpired} // make sure the user cannot dismiss it by clicking outside or pressing Escape.
        onLogin={() => {
          setSessionExpired(false);
          router.push('/auth/login');
        }}
      />
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
