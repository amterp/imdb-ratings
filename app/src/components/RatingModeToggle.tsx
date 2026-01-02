import type { RatingMode } from '@/contexts/RatingModeContext';

interface RatingModeToggleProps {
  mode: RatingMode;
  onToggle: () => void;
}

const MODE_INFO = {
  raw: {
    label: 'Raw',
    tooltip: 'Raw: Show IMDb ratings as-is, regardless of vote count.',
  },
  adjusted: {
    label: 'Adjusted',
    tooltip:
      'Adjusted: Confidence-adjusted ratings that account for vote counts. Low-vote episodes are pulled toward the average (~7.4), while high-vote episodes remain mostly unchanged.',
  },
};

export function RatingModeToggle({ mode, onToggle }: RatingModeToggleProps) {
  const info = MODE_INFO[mode];
  const otherMode = mode === 'raw' ? 'adjusted' : 'raw';
  const otherInfo = MODE_INFO[otherMode];

  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium transition-smooth hover:bg-white/20"
      title={`${info.tooltip}\n\nClick to switch to ${otherInfo.label}.`}
    >
      <span className="text-gray-400">Ratings</span>

      {/* Toggle switch visual */}
      <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 ml-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs transition-smooth ${
            mode === 'raw' ? 'bg-emerald-500 text-white' : 'text-gray-400'
          }`}
        >
          Raw
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs transition-smooth ${
            mode === 'adjusted' ? 'bg-amber-500 text-white' : 'text-gray-400'
          }`}
        >
          Adj
        </span>
      </div>
    </button>
  );
}
