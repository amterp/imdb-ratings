import { useQuery } from '@tanstack/react-query';
import type { ShowData, CompactShowData } from '@/types';
import { SERIES_URL } from '@/utils/constants';
import { getCacheBustingSuffix } from '@/utils/cacheUtils';

function parseCompactShow(data: CompactShowData): ShowData {
  return data.map(season =>
    season.map(([episode, rating, votes, id]) => ({ episode, rating, votes, id }))
  );
}

async function fetchShowData(showId: string): Promise<ShowData> {
  const cacheSuffix = getCacheBustingSuffix();
  const url = `${SERIES_URL}${showId}.json${cacheSuffix}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch show data for ${showId}`);
  }
  const compactData: CompactShowData = await response.json();
  return parseCompactShow(compactData);
}

export function useShowData(showId: string | null) {
  return useQuery({
    queryKey: ['showData', showId],
    queryFn: () => fetchShowData(showId!),
    enabled: !!showId, // Only fetch if showId is provided
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
