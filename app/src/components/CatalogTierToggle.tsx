import type { CatalogTier } from '@/hooks/useCatalogTier';

interface CatalogTierToggleProps {
  tier: CatalogTier;
  onToggle: () => void;
  isLoading: boolean;
}

const TIER_INFO = {
  lite: {
    label: 'Lite',
    count: '5K',
    tooltip: 'Lite: Top 5,000 shows by popularity (~86% of IMDb ratings coverage). Faster to load.',
  },
  expanded: {
    label: 'Expanded',
    count: '25K',
    tooltip: 'Expanded: Top 25,000 shows (~98% of IMDb ratings coverage). Includes more niche content.',
  },
};

export function CatalogTierToggle({ tier, onToggle, isLoading }: CatalogTierToggleProps) {
  const info = TIER_INFO[tier];
  const otherTier = tier === 'lite' ? 'expanded' : 'lite';
  const otherInfo = TIER_INFO[otherTier];

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium transition-smooth hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`${info.tooltip}\n\nClick to switch to ${otherInfo.label} (${otherInfo.count} shows).`}
    >
      <span className="text-gray-400">Catalog:</span>

      {/* Toggle switch visual */}
      <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5">
        <span
          className={`px-2 py-0.5 rounded-full text-xs transition-smooth ${
            tier === 'lite'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400'
          }`}
        >
          5K
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs transition-smooth ${
            tier === 'expanded'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400'
          }`}
        >
          25K
        </span>
      </div>
    </button>
  );
}
