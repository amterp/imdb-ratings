/**
 * Confidence-adjusted rating calculation using SteamDB-style formula.
 *
 * The formula pulls ratings toward a baseline with decreasing strength as vote count increases.
 * This accounts for the uncertainty in low-vote ratings.
 *
 * Formula: adjustedRating = rawRating - (rawRating - baseline) × 2^(-log₁₀(votes + 1))
 *
 * Impact by vote count (for a 9.0 raw rating):
 *   10 votes → ~8.2 (50% uncertain)
 *   100 votes → ~8.6 (25% uncertain)
 *   1,000 votes → ~8.8 (12.5% uncertain)
 *   10,000 votes → ~8.9 (6% uncertain)
 */

/** Global IMDb average rating - used as the baseline for adjustment */
export const IMDB_BASELINE_RATING = 7.4;

/**
 * Calculate confidence-adjusted rating using SteamDB-style formula.
 *
 * @param rating - Raw IMDb rating (0-10), or null if missing
 * @param votes - Number of votes, or null if missing
 * @param baseline - The neutral rating to pull toward (default: global IMDb average)
 * @returns Adjusted rating clamped to 0-10, or null if input is invalid
 */
export function calculateAdjustedRating(
  rating: number | null,
  votes: number | null,
  baseline: number = IMDB_BASELINE_RATING
): number | null {
  // Can't adjust without both rating and votes
  if (rating === null || votes === null || rating <= 0) {
    return null;
  }

  // Calculate uncertainty factor: decreases logarithmically with vote count
  // At 10 votes: ~0.5 (50% uncertain)
  // At 100 votes: ~0.25 (25% uncertain)
  // At 1000 votes: ~0.125 (12.5% uncertain)
  const uncertainty = Math.pow(2, -Math.log10(votes + 1));

  // Pull rating toward baseline proportional to uncertainty
  const adjusted = rating - (rating - baseline) * uncertainty;

  // Clamp to valid rating range
  return Math.max(0, Math.min(10, adjusted));
}
