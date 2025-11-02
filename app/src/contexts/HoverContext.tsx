import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface HoverState {
  seasonNumber: number | null;
  episodeNumber: number | null;
}

interface HoverContextType {
  hoveredEpisode: HoverState;
  setHoveredEpisode: (seasonNumber: number, episodeNumber: number) => void;
  clearHover: () => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredEpisode, setHoveredEpisodeState] = useState<HoverState>({
    seasonNumber: null,
    episodeNumber: null,
  });

  const setHoveredEpisode = (seasonNumber: number, episodeNumber: number) => {
    setHoveredEpisodeState({ seasonNumber, episodeNumber });
  };

  const clearHover = () => {
    setHoveredEpisodeState({ seasonNumber: null, episodeNumber: null });
  };

  return (
    <HoverContext.Provider value={{ hoveredEpisode, setHoveredEpisode, clearHover }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHover() {
  const context = useContext(HoverContext);
  if (context === undefined) {
    throw new Error('useHover must be used within a HoverProvider');
  }
  return context;
}
