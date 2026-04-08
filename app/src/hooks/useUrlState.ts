import { useSearchParams } from 'react-router-dom';
import { useCallback, useRef } from 'react';

/**
 * Hook to manage show ID and search query in URL search params
 */
export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const showId = searchParams.get('show');

  // Capture initial search query once on mount. Ignored if a show is already selected.
  const initialSearchQueryRef = useRef<string | null>(
    !searchParams.get('show')
      ? searchParams.get('search') || null
      : null
  );
  const initialSearchQuery = initialSearchQueryRef.current;

  const setShowId = useCallback(
    (id: string | null, title?: string) => {
      if (id) {
        setSearchParams({ show: id });

        // Update document title
        if (title) {
          document.title = `Series Heatmap - ${title}`;
        }
      } else {
        setSearchParams({});
        document.title = 'Series Heatmap';
      }
    },
    [setSearchParams]
  );

  const clearSearchQuery = useCallback(() => {
    if (searchParams.has('search')) {
      const next = new URLSearchParams(searchParams);
      next.delete('search');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return { showId, setShowId, initialSearchQuery, clearSearchQuery };
}
