'use client';

import { useEffect, useState } from 'react';

export type PortalLanguage = 'en' | 'mr';

const STORAGE_KEY = 'portal-language';
const EVENT_NAME = 'portal-language-change';

function getStoredLanguage(): PortalLanguage {
  if (typeof window === 'undefined') return 'en';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'mr' || stored === 'en' ? stored : 'en';
}

export function usePortalLanguage() {
  const [language, setLanguageState] = useState<PortalLanguage>('en');

  useEffect(() => {
    const applyLanguage = (nextLanguage: PortalLanguage) => {
      setLanguageState(nextLanguage);
      document.documentElement.lang = nextLanguage;
    };

    applyLanguage(getStoredLanguage());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        applyLanguage(getStoredLanguage());
      }
    };

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<PortalLanguage>;
      applyLanguage(customEvent.detail ?? getStoredLanguage());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_NAME, handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_NAME, handleLanguageChange);
    };
  }, []);

  const setLanguage = (nextLanguage: PortalLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.dispatchEvent(new CustomEvent<PortalLanguage>(EVENT_NAME, { detail: nextLanguage }));
  };

  return { language, setLanguage };
}
