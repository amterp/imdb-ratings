import { useMemo } from 'react';
import type { ShowData } from '@/types';
import { SeasonStatsCell } from './SeasonStatsCell';
import {
  calculateMean,
  calculateMedian,
  calculateStdDev,
  calculateWeightedMean,
  calculateTotalVotes,
  formatVotes,
} from '@/utils/statsUtils';

interface SeasonStatsTableProps {
  showData: ShowData;
}

/**
 * Get background color for vote count based on normalized value (0-1).
 * Uses a cyan gradient: low = muted slate, high = bright cyan.
 */
function getVotesColor(normalized: number): { backgroundColor: string; textColor: string } {
  // Interpolate from slate-700 (#334155) to cyan-600 (#0891b2)
  const saturation = 30 + normalized * 50; // 30% to 80%
  const lightness = 25 + normalized * 20; // 25% to 45%
  return {
    backgroundColor: `hsl(190, ${saturation}%, ${lightness}%)`,
    textColor: normalized > 0.5 ? '#f8fafc' : '#cbd5e1', // slate-50 or slate-300
  };
}

export function SeasonStatsTable({ showData }: SeasonStatsTableProps) {
  // Pre-calculate all season stats including vote totals
  const seasonStats = useMemo(() => {
    return showData.map((season) => {
      const ratings = season.map((episode) => episode.rating);
      return {
        mean: calculateMean(ratings),
        weightedMean: calculateWeightedMean(season),
        median: calculateMedian(ratings),
        stddev: calculateStdDev(ratings),
        totalVotes: calculateTotalVotes(season),
      };
    });
  }, [showData]);

  // Find min/max votes for normalization
  const { minVotes, maxVotes } = useMemo(() => {
    const voteCounts = seasonStats.map((s) => s.totalVotes);
    return {
      minVotes: Math.min(...voteCounts),
      maxVotes: Math.max(...voteCounts),
    };
  }, [seasonStats]);

  // Normalize vote count to 0-1 range
  const normalizeVotes = (votes: number): number => {
    if (maxVotes === minVotes) return 0.5; // All seasons have same votes
    return (votes - minVotes) / (maxVotes - minVotes);
  };

  return (
    <table className="border-collapse">
      <thead>
        <tr>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Mean
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs whitespace-nowrap">
            W. Mean
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Median
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Stddev
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Votes
          </td>
        </tr>
      </thead>
      <tbody>
        {seasonStats.map((stats, seasonIndex) => {
          const normalized = normalizeVotes(stats.totalVotes);
          const { backgroundColor, textColor } = getVotesColor(normalized);

          return (
            <tr key={seasonIndex}>
              <SeasonStatsCell value={stats.mean} />
              <SeasonStatsCell value={stats.weightedMean} />
              <SeasonStatsCell value={stats.median} />
              <SeasonStatsCell value={stats.stddev} />
              <td
                className="w-15 h-10 min-w-15 min-h-10 text-center border border-slate-700"
                style={{ backgroundColor }}
              >
                <span className="text-sm font-semibold" style={{ color: textColor }}>
                  {formatVotes(stats.totalVotes)}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
