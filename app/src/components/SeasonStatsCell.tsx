import { useMemo } from 'react';
import { getColorForRating } from '@/utils/colorUtils';

interface SeasonStatsCellProps {
  value: number;
}

export function SeasonStatsCell({ value }: SeasonStatsCellProps) {
  const { backgroundColor, textColor } = useMemo(
    () => getColorForRating(value),
    [value]
  );

  // If no valid ratings, show empty cell with "--"
  if (value === 0) {
    return (
      <td className="w-15 h-10 min-w-15 min-h-10 text-center border border-slate-700">
        <span className="text-slate-500 text-sm">--</span>
      </td>
    );
  }

  return (
    <td
      className="w-15 h-10 min-w-15 min-h-10 text-center border border-slate-700"
      style={{ backgroundColor }}
    >
      <span
        className="flex items-center justify-center w-full h-full text-sm font-semibold"
        style={{ color: textColor }}
      >
        {value.toFixed(2)}
      </span>
    </td>
  );
}
