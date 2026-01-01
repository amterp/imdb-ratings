import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { ShowData } from '@/types';
import { useHover } from '@/contexts/HoverContext';
import type { PlotMouseEvent } from 'plotly.js';

interface RatingsLineGraphProps {
  showData: ShowData;
}

// Color palette for seasons (vibrant colors)
const SEASON_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

export function RatingsLineGraph({ showData }: RatingsLineGraphProps) {
  const { setHoveredEpisode, clearHover } = useHover();

  // Calculate dynamic y-axis range
  const yAxisRange = useMemo(() => {
    let minRating = 10;
    let maxRating = 0;

    showData.forEach((season) => {
      season.forEach((episode) => {
        if (episode.rating !== null && episode.rating > 0) {
          minRating = Math.min(minRating, episode.rating);
          maxRating = Math.max(maxRating, episode.rating);
        }
      });
    });

    // Add padding (0.5 on each side)
    const padding = 0.5;
    return [Math.max(0, minRating - padding), Math.min(10, maxRating + padding)];
  }, [showData]);

  // Generate traces and shapes
  const { traces, shapes } = useMemo(() => {
    const traces: Plotly.Data[] = [];
    const shapes: Partial<Plotly.Shape>[] = [];

    showData.forEach((season, seasonIndex) => {
      const seasonNumber = seasonIndex + 1;
      const color = SEASON_COLORS[seasonIndex % SEASON_COLORS.length];

      // Filter to only episodes with valid ratings (not null, > 0)
      const validEpisodes = season.filter((ep) => ep.rating !== null && ep.rating > 0);

      const validX = validEpisodes.map((ep) => ep.episode);
      const validY = validEpisodes.map((ep) => ep.rating as number);  // Safe cast since we filtered

      // Create hover text
      const hoverText = validEpisodes.map(
        (ep) => `Season ${seasonNumber}<br>Episode ${ep.episode}<br>Rating: ${(ep.rating as number).toFixed(2)}`
      );

      // Use consistent marker sizes
      const markerSizes = validEpisodes.map(() => 8);
      const markerBorderWidths = validEpisodes.map(() => 0);

      // Create trace for this season
      traces.push({
        x: validX,
        y: validY,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Season ${seasonNumber}`,
        line: {
          color: color,
          width: 2,
        },
        marker: {
          color: color,
          size: markerSizes,
          line: {
            color: '#06b6d4', // cyan border for highlighted points
            width: markerBorderWidths,
          },
        },
        hovertext: hoverText,
        hoverinfo: 'text',
        // Store season data for hover handling
        customdata: validEpisodes.map((ep) => [seasonNumber, ep.episode]),
      } as Plotly.Data);

      // Calculate linear regression for this season
      if (validEpisodes.length > 1) {
        // Linear regression: y = mx + b
        const n = validX.length;
        const sumX = validX.reduce((sum, val) => sum + val, 0);
        const sumY = validY.reduce((sum, val) => sum + val, 0);
        const sumXY = validX.reduce((sum, val, idx) => sum + val * validY[idx], 0);
        const sumX2 = validX.reduce((sum, val) => sum + val * val, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Draw trend line from first to last episode
        const minEpisode = Math.min(...validX);
        const maxEpisode = Math.max(...validX);
        const y0 = slope * minEpisode + intercept;
        const y1 = slope * maxEpisode + intercept;

        shapes.push({
          type: 'line',
          x0: minEpisode,
          x1: maxEpisode,
          y0: y0,
          y1: y1,
          line: {
            color: color,
            width: 1.5,
            dash: 'dash',
          },
          opacity: 0.4,
          layer: 'below',
        });
      }
    });

    return { traces, shapes };
  }, [showData]);

  const handleHover = (event: Readonly<PlotMouseEvent>) => {
    if (event.points && event.points.length > 0) {
      const point = event.points[0];
      if (point.customdata && Array.isArray(point.customdata)) {
        const [seasonNumber, episodeNumber] = point.customdata as unknown as [number, number];
        setHoveredEpisode(seasonNumber, episodeNumber);
      }
    }
  };

  const handleUnhover = () => {
    clearHover();
  };

  return (
    <div className="flex-grow min-w-0 overflow-hidden">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 600,
          title: {
            text: 'Episode Ratings by Season',
            font: {
              color: '#e2e8f0',
              size: 16,
            },
          },
          xaxis: {
            title: {
              text: 'Episode Number',
              font: { color: '#94a3b8' },
            },
            gridcolor: '#334155',
            color: '#94a3b8',
            zeroline: false,
          },
          yaxis: {
            title: {
              text: 'Rating',
              font: { color: '#94a3b8' },
            },
            gridcolor: '#334155',
            color: '#94a3b8',
            range: yAxisRange,
            zeroline: false,
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          showlegend: true,
          legend: {
            font: { color: '#e2e8f0' },
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            bordercolor: '#475569',
            borderwidth: 1,
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.15,
            yanchor: 'top',
          },
          hovermode: 'closest',
          shapes: shapes,
          margin: {
            l: 60,
            r: 20,
            t: 60,
            b: 120,
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        useResizeHandler={true}
        onHover={handleHover}
        onUnhover={handleUnhover}
        style={{ width: '100%', height: '100%' }}
        className="w-full"
      />
    </div>
  );
}
