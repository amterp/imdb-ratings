import { useState, useCallback } from 'react';
import type { ShowMetadata } from '@/types';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 10;

/**
 * Hook to manage recently viewed shows in localStorage.
 * Stores up to 10 shows, with most recent first.
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<ShowMetadata[]>(() => {
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

  const addRecentlyViewed = useCallback((show: ShowMetadata) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists (will be re-added at front)
      const filtered = prev.filter((s) => s.id !== show.id);
      // Add to front, trim to max
      const updated = [show, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentlyViewed, addRecentlyViewed };
}
