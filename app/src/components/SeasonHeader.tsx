interface SeasonHeaderProps {
  seasonNumber: number;
}

export function SeasonHeader({ seasonNumber }: SeasonHeaderProps) {
  return (
    <td className="w-10 h-10 min-w-10 min-h-10 text-center bg-slate-700 border border-slate-600 font-bold">
      {seasonNumber}
    </td>
  );
}
