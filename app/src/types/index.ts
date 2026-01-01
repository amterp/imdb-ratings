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

export interface ColorResult {
  backgroundColor: string;
  textColor: string;
}

export interface CellPosition {
  season: number;
  episode: number;
}
