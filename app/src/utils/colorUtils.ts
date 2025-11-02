import type { ColorResult } from '@/types';
import { RATING_CUTOFF, MIN_RATING, MAX_RATING } from './constants';

/**
 * Calculates HSL color for a given rating.
 * Ratings 0-6: Dark red to red gradient (HSL: 0°, 100%, 0-50% lightness)
 * Ratings 6-10: Red → Orange → Yellow → Green gradient (HSL: 0-120°, 100%, 50%)
 */
export function getColorForRating(rating: number): ColorResult {
  // Handle zero/null ratings
  if (rating === MIN_RATING) {
    return {
      backgroundColor: 'transparent',
      textColor: 'white',
    };
  }

  // Clamp rating to valid range
  const clampedRating = Math.max(MIN_RATING, Math.min(MAX_RATING, rating));

  // Good ratings (above cutoff): green gradient
  if (clampedRating > RATING_CUTOFF) {
    const adjustedRating = clampedRating - RATING_CUTOFF;
    const hue = (adjustedRating / (MAX_RATING - RATING_CUTOFF)) * 120;
    return {
      backgroundColor: `hsl(${hue}, 100%, 50%)`,
      textColor: 'black',
    };
  }

  // Bad ratings (below cutoff): red gradient with varying lightness
  const lightness = (clampedRating / RATING_CUTOFF) * 50;
  return {
    backgroundColor: `hsl(0, 100%, ${lightness}%)`,
    textColor: 'white',
  };
}
