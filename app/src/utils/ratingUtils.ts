/**
 * Confidence-adjusted rating calculation using SteamDB-style formula.
 *
 * The formula pulls ratings toward a baseline with decreasing strength as vote count increases.
 * This accounts for the uncertainty in low-vote ratings.
 *
 * Formula: adjustedRating = rawRating - (rawRating - baseline) × halvingFactor^(-log_logBase(votes + 1))
 *
 * Parameters tuned empirically (see scripts/confidence_tuning.ipynb):
 *   - Baseline 7.0: slightly below average to penalize low-vote episodes
 *   - Log base 8, halving factor 2.2: less aggressive than original (10, 2)
 *
 * Impact by vote count (for a 9.0 raw rating):
 *   31 votes (median) → ~8.46 (31% pull to baseline)
 *   100 votes → ~8.65 (18% pull)
 *   1,000 votes → ~8.85 (8% pull)
 *   10,000 votes → ~8.94 (3% pull)
 */

/** Baseline rating - low-vote episodes get pulled toward this value */
export const IMDB_BASELINE_RATING = 7.0;

/** Log base for uncertainty decay - lower = faster confidence gain */
const LOG_BASE = 8;

/** Halving factor - how much uncertainty decreases per order of magnitude */
const HALVING_FACTOR = 2.2;

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
  // Uses natural log divided by log of base to compute log_base(votes + 1)
  const uncertainty = Math.pow(HALVING_FACTOR, -Math.log(votes + 1) / Math.log(LOG_BASE));

  // Pull rating toward baseline proportional to uncertainty
  const adjusted = rating - (rating - baseline) * uncertainty;

  // Clamp to valid rating range
  return Math.max(0, Math.min(10, adjusted));
}
