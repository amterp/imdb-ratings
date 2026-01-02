export const SERIES_URL = `${import.meta.env.BASE_URL}data/`;
export const TITLE_ID_LITE_URL = `${import.meta.env.BASE_URL}data/titleId-lite.json`;
export const TITLE_ID_EXPANDED_URL = `${import.meta.env.BASE_URL}data/titleId-expanded.json`;
export const IMDB_URL = 'https://www.imdb.com/title/';

// Color thresholds
export const RATING_CUTOFF = 6;
export const MIN_RATING = 0;
export const MAX_RATING = 10;

// Cell dimensions
export const CELL_SIZE = 40; // pixels

// Version info (injected by Vite at build time)
export const COMMIT_HASH = __COMMIT_HASH__;
export const COMMIT_DATE = __COMMIT_DATE__;
export const COMMIT_URL = `https://github.com/amterp/imdb-ratings/commit/${COMMIT_HASH}`;
