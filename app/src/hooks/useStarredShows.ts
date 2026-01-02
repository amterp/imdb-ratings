import { useState, useCallback, useMemo } from 'react';
import type { ShowMetadata } from '@/types';

const STORAGE_KEY = 'starredShows';

/**
 * Hook to manage starred (favorite) shows in localStorage.
 * No limit on number of starred shows.
 */
export function useStarredShows() {
  const [starredShows, setStarredShows] = useState<ShowMetadata[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Invalid JSON, start fresh
      }
    }
    return [];
  });

  const starredIds = useMemo(
    () => new Set(starredShows.map((s) => s.id)),
    [starredShows]
  );

  const isStarred = useCallback(
    (id: string) => starredIds.has(id),
    [starredIds]
  );

  const addStarred = useCallback((show: ShowMetadata) => {
    setStarredShows((prev) => {
      if (prev.some((s) => s.id === show.id)) {
        return prev; // Already starred
      }
      const updated = [...prev, show];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeStarred = useCallback((id: string) => {
    setStarredShows((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const reorderStarred = useCallback((fromIndex: number, toIndex: number) => {
    setStarredShows((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleStarred = useCallback(
    (show: ShowMetadata) => {
      if (isStarred(show.id)) {
        removeStarred(show.id);
      } else {
        addStarred(show);
      }
    },
    [isStarred, removeStarred, addStarred]
  );

  return {
    starredShows,
    isStarred,
    addStarred,
    removeStarred,
    reorderStarred,
    toggleStarred,
  };
}
