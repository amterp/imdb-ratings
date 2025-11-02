import type { ShowData } from '@/types';
import { SeasonStatsCell } from './SeasonStatsCell';
import { calculateMean, calculateMedian, calculateStdDev } from '@/utils/statsUtils';

interface SeasonStatsTableProps {
  showData: ShowData;
}

export function SeasonStatsTable({ showData }: SeasonStatsTableProps) {
  return (
    <table className="border-collapse">
      <thead>
        <tr>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Mean
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Median
          </td>
          <td className="w-15 h-10 min-w-15 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold text-xs">
            Stddev
          </td>
        </tr>
      </thead>
      <tbody>
        {showData.map((season, seasonIndex) => {
          // Calculate statistics for this season
          const ratings = season.map((episode) => episode.rating);
          const mean = calculateMean(ratings);
          const median = calculateMedian(ratings);
          const stddev = calculateStdDev(ratings);

          return (
            <tr key={seasonIndex}>
              <SeasonStatsCell value={mean} />
              <SeasonStatsCell value={median} />
              <SeasonStatsCell value={stddev} />
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
