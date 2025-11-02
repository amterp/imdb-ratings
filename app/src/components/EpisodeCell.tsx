import { useMemo } from 'react';
import type { Episode } from '@/types';
import { getColorForRating } from '@/utils/colorUtils';
import { IMDB_URL } from '@/utils/constants';

interface EpisodeCellProps {
  episode: Episode;
  seasonNumber: number;
}

export function EpisodeCell({ episode, seasonNumber }: EpisodeCellProps) {
  const { backgroundColor, textColor } = useMemo(
    () => getColorForRating(episode.rating),
    [episode.rating]
  );

  const episodeUrl = `${IMDB_URL}${episode.id}/`;

  if (episode.rating === 0) {
    return <td className="w-10 h-10 min-w-10 min-h-10 text-center border border-slate-700" />;
  }

  return (
    <td
      className="w-10 h-10 min-w-10 min-h-10 text-center border border-slate-700 transition-smooth hover:scale-105 hover:shadow-lg"
      style={{ backgroundColor }}
    >
      <a
        href={episodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full h-full text-sm font-semibold no-underline hover:underline"
        style={{ color: textColor }}
      >
        {episode.rating.toFixed(1)}
      </a>
    </td>
  );
}
