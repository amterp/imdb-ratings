import { useState } from 'react';
import type { ShowMetadata } from '@/types';

interface RecentlyViewedDropdownProps {
  recentlyViewed: ShowMetadata[];
  onSelectShow: (show: ShowMetadata) => void;
  className?: string;
}

export function RecentlyViewedDropdown({
  recentlyViewed,
  onSelectShow,
  className = '',
}: RecentlyViewedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectShow = (show: ShowMetadata) => {
    onSelectShow(show);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium transition-smooth hover:bg-white/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-blue-400"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-gray-300">Recent</span>
        {recentlyViewed.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-blue-400/20 text-blue-400 rounded-full">
            {recentlyViewed.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-[100]">
          <div className="w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {recentlyViewed.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No recently viewed shows
              </div>
            ) : (
              <ul className="max-h-80 overflow-auto py-1">
                {recentlyViewed.map((show) => (
                  <li
                    key={show.id}
                    onClick={() => handleSelectShow(show)}
                    className="px-4 py-2.5 text-gray-200 hover:bg-white/10 cursor-pointer transition-smooth truncate"
                  >
                    {show.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
