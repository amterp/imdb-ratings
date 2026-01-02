import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type RatingMode = 'raw' | 'adjusted';

interface RatingModeContextType {
  ratingMode: RatingMode;
  setRatingMode: (mode: RatingMode) => void;
  toggleRatingMode: () => void;
  isAdjusted: boolean;
}

const STORAGE_KEY = 'ratingMode';
const DEFAULT_MODE: RatingMode = 'raw';

const RatingModeContext = createContext<RatingModeContextType | undefined>(undefined);

export function RatingModeProvider({ children }: { children: ReactNode }) {
  const [ratingMode, setRatingModeState] = useState<RatingMode>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'raw' || stored === 'adjusted') {
        return stored;
      }
    }
    return DEFAULT_MODE;
  });

  const setRatingMode = useCallback((mode: RatingMode) => {
    setRatingModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const toggleRatingMode = useCallback(() => {
    setRatingMode(ratingMode === 'raw' ? 'adjusted' : 'raw');
  }, [ratingMode, setRatingMode]);

  return (
    <RatingModeContext.Provider
      value={{
        ratingMode,
        setRatingMode,
        toggleRatingMode,
        isAdjusted: ratingMode === 'adjusted',
      }}
    >
      {children}
    </RatingModeContext.Provider>
  );
}

export function useRatingMode() {
  const context = useContext(RatingModeContext);
  if (context === undefined) {
    throw new Error('useRatingMode must be used within a RatingModeProvider');
  }
  return context;
}
