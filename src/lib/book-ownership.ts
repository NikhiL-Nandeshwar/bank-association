'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { getMyLibrary } from '@/actions/api/library.actions';

export const BOOK_OWNERSHIP_KEY = 'my-library-ownership';

export function useBookOwnership(isAuthenticated: boolean) {
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? BOOK_OWNERSHIP_KEY : null,
    async () => (await getMyLibrary()).data,
    { revalidateOnFocus: true }
  );

  const purchasedBookIds = useMemo(() => new Set((data?.books ?? []).map((book) => book.bookId)), [data]);
  return { purchasedBookIds, error, isLoading, mutate };
}
