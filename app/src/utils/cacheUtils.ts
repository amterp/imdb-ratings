/**
 * Generates a cache-busting suffix based on current UTC date.
 * Delays new json fetch by 8 hours after midnight UTC to give GitHub Actions time to update data.
 */
export function getCacheBustingSuffix(): string {
  const now = new Date();
  const hour = now.getUTCHours();
  let day = now.getUTCDate();

  // Delay new json fetch by 8 hours after midnight UTC
  // Gives GitHub Actions 8 hours to update data
  if (hour < 8) {
    day--;
  }

  const utcTime = `${now.getUTCFullYear()}${now.getUTCMonth()}${day}`;
  return `?nocache=${utcTime.toString(16)}`;
}
