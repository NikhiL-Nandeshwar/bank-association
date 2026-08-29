'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'ebook-cart';
const EVENT_NAME = 'ebook-cart-updated';

type CartContextValue = {
  bookIds: number[];
  count: number;
  add: (bookId: number) => boolean;
  remove: (bookId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.from(new Set(Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []));
  } catch { return []; }
}

function publish(ids: number[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ids }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [bookIds, setBookIds] = useState<number[]>(readCart);
  useEffect(() => {
    const sync = (event: Event) => setBookIds((event as CustomEvent<number[]>).detail || readCart());
    const syncStorage = () => setBookIds(readCart());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', syncStorage);
    return () => { window.removeEventListener(EVENT_NAME, sync); window.removeEventListener('storage', syncStorage); };
  }, []);
  const add = useCallback((bookId: number) => {
    if (bookIds.includes(bookId)) return false;
    const next = [...bookIds, bookId];
    setBookIds(next); publish(next); return true;
  }, [bookIds]);
  const remove = useCallback((bookId: number) => setBookIds((current) => { const next = current.filter((id) => id !== bookId); publish(next); return next; }), []);
  const clear = useCallback(() => { setBookIds([]); publish([]); }, []);
  const value = useMemo(() => ({ bookIds, count: bookIds.length, add, remove, clear }), [bookIds, add, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
