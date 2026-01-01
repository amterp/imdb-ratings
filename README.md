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

**Data Generation:**

The Python script (`scripts/create_dataset.py`) downloads IMDb data and saves the top 2500 shows as one `{title, id}` JSON file (`data/titleId.json`). It then generates individual JSON files for each show ID, containing ratings for every episode across all seasons.

The scripts run every 24h via a cron job through GitHub Actions. The generated JSON files are automatically pushed to the repo.

**Frontend:**

The React application loads the show catalog from `data/titleId.json`, provides an autocomplete search interface, and dynamically loads episode data for the selected show. Episode ratings are displayed as a color-coded heatmap using HSL color gradients (red → orange → yellow → green).

## Known Issues

- Duplicate show names (e.g., "The Office" US vs UK) — could add year to disambiguate
- Some shows with unusual episode numbering may have gaps displayed as gray cells
