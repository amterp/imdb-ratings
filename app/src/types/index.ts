export interface ShowMetadata {
  id: string;
  title: string;
  rating?: number;  // Show-level average rating (0-10)
  votes?: number;   // Show-level vote count
}

export interface Episode {
  episode: number;
  rating: number | null;
  votes: number | null;
  id: string | null;  // null for missing episodes
}

export type Season = Episode[];
export type ShowData = Season[];

// Compact wire format: [rating, votes, id] or null (episode number = index + 1)
export type CompactEpisode = [number, number, string] | null;
export type CompactShowData = CompactEpisode[][];

export interface ColorResult {
  backgroundColor: string;
  textColor: string;
}

export interface CellPosition {
  season: number;
  episode: number;
}
