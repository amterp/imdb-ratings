import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

/**
 * Hook to manage show ID in URL search params
 */
export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const showId = searchParams.get('show');

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

  return { showId, setShowId };
}
