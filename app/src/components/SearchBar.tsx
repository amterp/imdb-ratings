import { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import type { ShowMetadata } from '@/types';

interface SearchBarProps {
  shows: ShowMetadata[];
  onSelectShow: (show: ShowMetadata) => void;
  isLoading: boolean;
}

export function SearchBar({ shows, onSelectShow, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const filteredShows = useMemo(() => {
    if (query === '') {
      return shows.slice(0, 10); // Show top 10 by default
    }

    const lowerQuery = query.toLowerCase();
    return shows
      .filter((show) => show.title.toLowerCase().includes(lowerQuery))
      .slice(0, 20); // Limit to 20 results for performance
  }, [query, shows]);

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <Combobox
        onChange={(show: ShowMetadata | null) => {
          if (show) {
            onSelectShow(show);
            setQuery('');
          }
        }}
      >
        <div className="relative">
          <Combobox.Input
            className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              isLoading
                ? 'Loading shows...'
                : 'Search for a TV show...'
            }
            onChange={(event) => setQuery(event.target.value)}
            value={query}
            disabled={isLoading}
            autoComplete="off"
            autoFocus
          />

          {filteredShows.length > 0 && query !== '' && (
            <Combobox.Options className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-auto">
              {filteredShows.map((show) => (
                <Combobox.Option
                  key={show.id}
                  value={show}
                  className={({ active }) =>
                    `px-6 py-3 cursor-pointer transition-smooth ${
                      active ? 'bg-blue-600 text-white' : 'text-gray-200'
                    }`
                  }
                >
                  {show.title}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
