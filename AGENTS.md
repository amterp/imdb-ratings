# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMDb Ratings is a web app that visualizes TV show episode ratings as interactive heatmaps. The frontend fetches pre-generated JSON data files containing episode ratings for the top 2500 shows by vote count.

## Commands

### Development
```bash
cd app && npm run dev      # Start dev server (Vite, typically http://localhost:5173)
cd app && npm run build    # TypeScript check + production build
cd app && npm run lint     # ESLint
```

### Data Generation
```bash
pip install -r requirements.txt
python scripts/create_dataset.py   # Regenerates all JSON data files in data/
```

## Architecture

### Frontend (`app/`)

React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query application.

**Data flow:**
1. `useShowCatalog` hook fetches `data/titleId.json` (show catalog: `{id, title}[]`)
2. User selects a show via `SearchBar` (Headless UI Combobox with autocomplete)
3. `useShowData` hook fetches `data/{showId}.json` (episode data)
4. `HeatmapGrid` renders the rating grid + `SeasonStatsTable` + `RatingsLineGraph`

**Key types (`src/types/index.ts`):**
- `ShowData = Season[]` where `Season = Episode[]`
- `Episode = { episode: number, rating: number, votes: number | null, id: string }`
- `CompactShowData` / `CompactEpisode` - wire format types (arrays deserialized in `useShowData`)

**Color mapping:** HSL gradient from red (low) to green (high) in `src/utils/colorUtils.ts`

**URL state:** Show ID persisted to URL query params via `useUrlState` hook

### Data Generation (`scripts/`)

Python scripts that download IMDb datasets and generate JSON files:
- `create_dataset.py`: Main pipeline - downloads TSV files from IMDb, filters to top 2500 shows, generates per-show JSON files
- Runs daily via GitHub Actions cron (`.github/workflows/`)

### Deployment

GitHub Pages deployment via Actions - builds the app and copies `data/` folder to `dist/` for serving.

## Data Format

Each show file (`data/{imdbId}.json`) uses a compact array format:
```json
[
  [[1,8.5,12345,"tt1234567"],[2,8.8,11000,"tt1234568"]],  // Season 1
  [[1,9.0,15000,"tt1234569"],[2,8.7,14000,"tt1234570"]]   // Season 2
]
```

**Episode schema:** `[episode, rating, votes, id]` — positional array, no keys.

The frontend deserializes this to `Episode` objects in `useShowData.ts`.
