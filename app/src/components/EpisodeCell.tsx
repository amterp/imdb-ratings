import type { Episode } from '@/types';
import { getColorForRating } from '@/utils/colorUtils';
import { IMDB_URL } from '@/utils/constants';
import { useHover } from '@/contexts/HoverContext';
import { useRatingMode } from '@/contexts/RatingModeContext';
import { calculateAdjustedRating } from '@/utils/ratingUtils';

interface EpisodeCellProps {
  episode: Episode;
  seasonNumber: number;
}

export function EpisodeCell({ episode, seasonNumber }: EpisodeCellProps) {
  const { hoveredEpisode, setHoveredEpisode, clearHover } = useHover();
  const { isAdjusted } = useRatingMode();

  // Missing episode (no IMDb data) - early return before hooks that depend on rating
  if (episode.rating === null) {
    return (
      <td
        className="w-10 h-10 min-w-10 min-h-10 text-center bg-slate-700 border border-slate-600"
        title={`S${seasonNumber}E${episode.episode} - No data`}
      >
        <span className="text-slate-500 text-xs">—</span>
      </td>
    );
  }

  if (episode.rating === 0) {
    return <td className="w-10 h-10 min-w-10 min-h-10 text-center border border-slate-700" />;
  }

  // Calculate display rating based on mode
  const displayRating = isAdjusted
    ? calculateAdjustedRating(episode.rating, episode.votes) ?? episode.rating
    : episode.rating;

  const { backgroundColor, textColor } = getColorForRating(displayRating);

  const episodeUrl = `${IMDB_URL}${episode.id}/`;

  // Check if this cell is currently hovered (from context)
  const isHighlighted =
    hoveredEpisode.seasonNumber === seasonNumber &&
    hoveredEpisode.episodeNumber === episode.episode;

  const handleMouseEnter = () => {
    setHoveredEpisode(seasonNumber, episode.episode);
  };

  const handleMouseLeave = () => {
    clearHover();
  };

  return (
    <td
      className="w-10 h-10 min-w-10 min-h-10 text-center transition-smooth hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor,
        border: isHighlighted ? '3px solid #06b6d4' : '1px solid #334155',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={episodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full h-full text-sm font-semibold no-underline hover:underline"
        style={{ color: textColor }}
      >
        {displayRating.toFixed(1)}
      </a>
    </td>
  );
}
