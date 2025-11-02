import { useMemo } from 'react';
import type { ShowData } from '@/types';
import { EpisodeCell } from './EpisodeCell';
import { SeasonHeader } from './SeasonHeader';
import { EpisodeHeader } from './EpisodeHeader';
import { SeasonStatsTable } from './SeasonStatsTable';

interface HeatmapGridProps {
  showData: ShowData;
}

export function HeatmapGrid({ showData }: HeatmapGridProps) {
  // Calculate max episodes across all seasons for header
  const maxEpisodes = useMemo(() => {
    return Math.max(...showData.map((season) => season.length));
  }, [showData]);

  return (
    <div className="flex gap-8 items-start">
      {/* Episode ratings table - scrollable if needed */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Corner cell */}
              <td className="w-10 h-10 min-w-10 min-h-10 text-center bg-slate-600 border border-slate-500 font-bold">
                S\E
              </td>
              {/* Episode headers */}
              {Array.from({ length: maxEpisodes }, (_, i) => (
                <EpisodeHeader key={i} episodeNumber={i + 1} />
              ))}
            </tr>
          </thead>
          <tbody>
            {showData.map((season, seasonIndex) => (
              <tr key={seasonIndex}>
                {/* Season header */}
                <SeasonHeader seasonNumber={seasonIndex + 1} />
                {/* Episode cells */}
                {season.map((episode) => (
                  <EpisodeCell
                    key={episode.episode}
                    episode={episode}
                    seasonNumber={seasonIndex + 1}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Season statistics table - always visible */}
      <div className="flex-shrink-0">
        <SeasonStatsTable showData={showData} />
      </div>
    </div>
  );
}
