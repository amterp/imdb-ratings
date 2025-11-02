interface EpisodeHeaderProps {
  episodeNumber: number;
}

export function EpisodeHeader({ episodeNumber }: EpisodeHeaderProps) {
  return (
    <td className="w-10 h-10 min-w-10 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold">
      {episodeNumber}
    </td>
  );
}
