import { STORAGE_KEYS } from '@/constants/storage.constants';
import type { LoginResponse } from '@/types/api.types';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function saveAuthSession(session: LoginResponse) {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(STORAGE_KEYS.authToken, session.token);

  if (session.refreshToken) {
    storage.setItem(
      STORAGE_KEYS.authRefreshToken,
      session.refreshToken
    );
  }

  if (session.tokenExpiryUnix) {
    storage.setItem(
      STORAGE_KEYS.authTokenExpiry,
      session.tokenExpiryUnix.toString()
    );
  }

  storage.setItem(
    STORAGE_KEYS.authUser,
    JSON.stringify({
      userId: session.userId,
      candidateId: session.candidateId,
      role: session.role,
      fullName: session.fullName,
      email: session.email,
    })
  );
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(STORAGE_KEYS.authToken);
  storage.removeItem(STORAGE_KEYS.authRefreshToken);
  storage.removeItem(STORAGE_KEYS.authTokenExpiry);
  storage.removeItem(STORAGE_KEYS.authUser);
}

export function getAuthToken() {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEYS.authToken) ?? null;
}

export function getRefreshToken() {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEYS.authRefreshToken) ?? null;
}

export function getTokenExpiry() {
  const storage = getStorage();

  const expiry = storage?.getItem(STORAGE_KEYS.authTokenExpiry);

  return expiry ? Number(expiry) : null;
}

export function getAuthUser() {
  const storage = getStorage();

  const user = storage?.getItem(STORAGE_KEYS.authUser);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}
