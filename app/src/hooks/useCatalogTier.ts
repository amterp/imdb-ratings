import { useState, useCallback } from 'react';

export type CatalogTier = 'lite' | 'expanded';

const STORAGE_KEY = 'catalogTier';
const DEFAULT_TIER: CatalogTier = 'lite';

/**
 * Hook to manage catalog tier preference in localStorage
 */
export function useCatalogTier() {
  const [tier, setTierState] = useState<CatalogTier>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'lite' || stored === 'expanded') {
        return stored;
      }
    }
    return DEFAULT_TIER;
  });

  const setTier = useCallback((newTier: CatalogTier) => {
    setTierState(newTier);
    localStorage.setItem(STORAGE_KEY, newTier);
  }, []);

  const toggleTier = useCallback(() => {
    setTier(tier === 'lite' ? 'expanded' : 'lite');
  }, [tier, setTier]);

  return {
    tier,
    setTier,
    toggleTier,
    isExpanded: tier === 'expanded',
  };
}
