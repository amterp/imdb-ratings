import { useQuery } from '@tanstack/react-query';
import type { ShowMetadata } from '@/types';
import { TITLE_ID_URL } from '@/utils/constants';

async function fetchShowCatalog(): Promise<ShowMetadata[]> {
  const response = await fetch(TITLE_ID_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch show catalog');
  }
  return response.json();
}

export function useShowCatalog() {
  return useQuery({
    queryKey: ['showCatalog'],
    queryFn: fetchShowCatalog,
    staleTime: Infinity, // Catalog doesn't change often
    gcTime: Infinity, // Keep in cache indefinitely
  });
}
