/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Ease out quadratic - decelerating to zero velocity
 * Creates a smooth deceleration effect
 */
export function easeOutQuad(t: number): number {
  return 1 - Math.pow(1 - t, 2);
}

/**
 * Ease in quadratic - accelerating from zero velocity
 * Creates a smooth acceleration effect
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Custom ease out with adjustable power
 * Higher power = more dramatic easing
 */
export function easeOutPow(t: number, power: number): number {
  return 1 - Math.pow(1 - t, power);
}

/**
 * Custom ease in with adjustable power
 * Higher power = more dramatic easing
 */
export function easeInPow(t: number, power: number): number {
  return Math.pow(t, power);
}

/**
 * Calculate a normalized progress value with offset and range
 * Useful for delaying animations until a certain scroll point
 * 
 * @param progress - The raw progress value (0-1)
 * @param offset - When to start (0-1)
 * @param range - How long the transition takes (0-1)
 * @returns Normalized progress clamped to 0-1
 */
export function normalizeProgress(
  progress: number,
  offset: number,
  range: number
): number {
  return clamp((progress - offset) / range, 0, 1);
}

/**
 * Calculate content fade opacity based on scroll progress
 * Fades in, holds, then fades out
 * 
 * @param progress - Scroll progress (0-1)
 * @param fadeInStart - When to start fading in
 * @param fadeInEnd - When fully visible
 * @param fadeOutStart - When to start fading out
 * @param fadeOutEnd - When fully hidden
 */
export function calculateFadeOpacity(
  progress: number,
  fadeInStart = 0.1,
  fadeInEnd = 0.3,
  fadeOutStart = 0.6,
  fadeOutEnd = 0.85
): number {
  if (progress < fadeInStart) return 0;
  if (progress < fadeInEnd) return (progress - fadeInStart) / (fadeInEnd - fadeInStart);
  if (progress < fadeOutStart) return 1;
  if (progress < fadeOutEnd) return 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
  return 0;
}
