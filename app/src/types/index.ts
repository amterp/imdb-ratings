export interface ShowMetadata {
  id: string;
  title: string;
}

export interface Episode {
  episode: number;
  rating: number;
  votes: number | null;
  id: string;
}

export type Season = Episode[];
export type ShowData = Season[];

// Compact wire format: [episode, rating, votes, id]
export type CompactEpisode = [number, number, number | null, string];
export type CompactShowData = CompactEpisode[][];

export interface ColorResult {
  backgroundColor: string;
  textColor: string;
}

export interface CellPosition {
  season: number;
  episode: number;
}
