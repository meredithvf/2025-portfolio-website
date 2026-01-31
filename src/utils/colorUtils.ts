/**
 * Lighten a hex color by a given percentage
 * @param hex - The hex color to lighten (e.g., "#E8D5A3")
 * @param percent - The percentage to lighten (0-1)
 * @returns The lightened color as an RGB string
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + (255 - (num >> 16)) * percent)
  );
  const g = Math.min(
    255,
    Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent)
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent)
  );
  return `rgb(${r}, ${g}, ${b})`;
}
