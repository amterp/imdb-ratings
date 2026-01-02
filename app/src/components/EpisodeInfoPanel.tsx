import { useMemo } from 'react';
import { useHover } from '@/contexts/HoverContext';
import { useRatingMode } from '@/contexts/RatingModeContext';
import { formatVotes } from '@/utils/statsUtils';
import { calculateAdjustedRating } from '@/utils/ratingUtils';
import type { ShowData } from '@/types';

interface EpisodeInfoPanelProps {
  showData: ShowData | undefined;
}

export function EpisodeInfoPanel({ showData }: EpisodeInfoPanelProps) {
  const { hoveredEpisode } = useHover();
  const { isAdjusted } = useRatingMode();

  const episodeInfo = useMemo(() => {
    if (!showData || hoveredEpisode.seasonNumber === null || hoveredEpisode.episodeNumber === null) {
      return null;
    }

    const season = showData[hoveredEpisode.seasonNumber - 1];
    if (!season) return null;

    const episode = season.find((ep) => ep.episode === hoveredEpisode.episodeNumber);
    if (!episode || episode.rating === null) return null;

    const adjustedRating = calculateAdjustedRating(episode.rating, episode.votes);

    return {
      season: hoveredEpisode.seasonNumber,
      episode: hoveredEpisode.episodeNumber,
      rating: episode.rating,
      adjustedRating,
      votes: episode.votes,
    };
  }, [showData, hoveredEpisode]);

  // Don't render if no show is loaded
  if (!showData) return null;

  return (
    <div className="fixed top-8 right-8 z-50">
      <div className="rounded-xl px-4 py-3 w-[160px] shadow-lg border border-slate-600/50 backdrop-blur-md bg-slate-800/90">
        {episodeInfo ? (
          <div className="text-slate-200">
            <div className="font-semibold text-center mb-2 text-lg">
              S{episodeInfo.season} E{episodeInfo.episode}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Rating</span>
                <span className="font-bold">
                  {isAdjusted
                    ? (episodeInfo.adjustedRating?.toFixed(1) ?? '—')
                    : episodeInfo.rating.toFixed(1)}
                </span>
              </div>
              {isAdjusted && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Raw</span>
                  <span className="text-slate-400">{episodeInfo.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Votes</span>
                <span className="font-semibold">{episodeInfo.votes !== null ? formatVotes(episodeInfo.votes) : '—'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-200">
            <div className="text-center mb-2 text-lg text-slate-400">Hover for info</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Rating</span>
                <span className="text-slate-500">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Votes</span>
                <span className="text-slate-500">—</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
