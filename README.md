# IMDb Ratings

Website that visualizes IMDb ratings of TV show episodes as interactive heatmaps.

**Live Site:** https://amterp.github.io/imdb-ratings/

![website](./assets/screenshot.png)

A fork of [mokronos](https://github.com/mokronos)'s excellent project [imdb-heatmap](https://github.com/mokronos/imdb-heatmap).

Main changes include:

- Revamped frontend/theme/color scheme
- Stats table per season (mean, weighted mean, median, stddev, total votes)
- Ratings line chart with trend lines
- Floating episode info panel on hover
- Compact data format with ~78% size reduction
- Local caching for data generation

## How to Run

Located in `app/` - Modern React + TypeScript application with updated UI:

```bash
cd app
npm install
npm run dev
```

Then open http://localhost:5173 (or whichever port Vite assigns) in your browser.

**Tech Stack:**

- React 19 + TypeScript
- Vite 7
- TanStack Query (React Query)
- Headless UI
- Tailwind CSS v4
- Plotly.js (charts)

**Requirements:** Node.js 22+ (tested with v25.1.0)

## How it Works

This is a **static site** with no backend — just pre-generated JSON files served from GitHub Pages.

```
┌───────────────────────────────────────────────────────┐
│               GitHub Pages (Static Host)              │
│                                                       │
│   /index.html                ← React app              │
│   /data/titleId-lite.json    ← Catalog (5K shows)     │
│   /data/titleId-expanded.json← Catalog (25K shows)    │
│   /data/tt0903747.json       ← Breaking Bad data      │
│   /data/tt0944947.json       ← Game of Thrones data   │
│   /data/...                  ← 25,000 show files      │
└───────────────────────────────────────────────────────┘
```

### Data Generation

A Python script (`scripts/create_dataset.py`) runs daily via GitHub Actions:

1. **Downloads** public IMDb dataset files (ratings, episodes, titles)
2. **Ranks** all TV shows by vote count
3. **Generates catalogs** — two JSON files listing `{id, title}` pairs:
   - `titleId-lite.json` — top 5,000 shows
   - `titleId-expanded.json` — top 25,000 shows
4. **Generates show files** — one JSON file per show with episode data

Episode data uses a compact array format to minimize file size:
```json
[
  [[8.5, 12345, "tt1234567"], [8.8, 11000, "tt1234568"], null],
  [[9.0, 15000, "tt1234569"], [8.7, 14000, "tt1234570"]]
]
```
Each episode is `[rating, votes, episodeId]` or `null` for missing episodes. Season/episode numbers are implicit from array position.

### Frontend Architecture

```
User loads site
      │
      ▼
┌─────────────────────┐
│  Fetch catalog      │ ← ~70KB gzipped (lite) or ~350KB (expanded)
│  (cached forever)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User searches      │ ← Client-side array filtering, instant
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fetch show data    │ ← 1-5KB typical, ~90KB max (The Simpsons)
│  (cached 24h)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Render heatmap     │ ← HSL color gradient (red → green)
└─────────────────────┘
```

**Caching**: TanStack Query manages data fetching. The catalog is cached indefinitely in memory (it doesn't change during a session). Show data is cached for 24 hours.

**Catalog Tiers**: Users can toggle between Lite and Expanded via a header button. The preference persists in localStorage. Both catalogs are cached separately — once you've loaded both, switching is instant.

**Search**: Pure client-side filtering on the in-memory catalog array. No server round-trips, no debouncing needed — it's just JavaScript filtering ~5K-25K objects, which is effectively instant.

## Known Issues

- Duplicate show names (e.g., "The Office" US vs UK) — could add year to disambiguate
- Some shows with unusual episode numbering may have gaps displayed as gray cells
