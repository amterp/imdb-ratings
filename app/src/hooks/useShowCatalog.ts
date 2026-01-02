import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ShowMetadata } from '@/types';
import type { CatalogTier } from './useCatalogTier';
import { TITLE_ID_LITE_URL, TITLE_ID_EXPANDED_URL } from '@/utils/constants';

const CATALOG_URLS: Record<CatalogTier, string> = {
  lite: TITLE_ID_LITE_URL,
  expanded: TITLE_ID_EXPANDED_URL,
};

async function fetchShowCatalog(tier: CatalogTier): Promise<ShowMetadata[]> {
  const url = CATALOG_URLS[tier];
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${tier} show catalog`);
  }
  return response.json();
}

export function useShowCatalog(tier: CatalogTier) {
  return useQuery({
    queryKey: ['showCatalog', tier],
    queryFn: () => fetchShowCatalog(tier),
    staleTime: Infinity, // Catalog doesn't change often
    gcTime: Infinity, // Keep in cache indefinitely
    placeholderData: keepPreviousData, // Keep old catalog visible while loading new tier
  });
}
