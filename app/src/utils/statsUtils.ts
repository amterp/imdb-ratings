/**
 * Calculate the mean (average) of an array of ratings.
 * Excludes episodes with rating = 0.
 * Returns 0 if no valid ratings are found.
 */
export function calculateMean(ratings: number[]): number {
  const validRatings = ratings.filter((rating) => rating > 0);
  if (validRatings.length === 0) return 0;

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
}

/**
 * Calculate the median of an array of ratings.
 * Excludes episodes with rating = 0.
 * Returns 0 if no valid ratings are found.
 */
export function calculateMedian(ratings: number[]): number {
  const validRatings = ratings.filter((rating) => rating > 0);
  if (validRatings.length === 0) return 0;

  const sorted = [...validRatings].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Even number of elements: return average of two middle values
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    // Odd number of elements: return middle value
    return sorted[mid];
  }
}

/**
 * Calculate the standard deviation of an array of ratings.
 * Excludes episodes with rating = 0.
 * Returns 0 if no valid ratings are found.
 */
export function calculateStdDev(ratings: number[]): number {
  const validRatings = ratings.filter((rating) => rating > 0);
  if (validRatings.length === 0) return 0;

  const mean = calculateMean(validRatings);
  const squaredDiffs = validRatings.map((rating) => Math.pow(rating - mean, 2));
  const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / validRatings.length;

  return Math.sqrt(variance);
}
