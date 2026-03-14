/**
 * src/utils/math.js
 *
 * Shared math helpers used across components and scene logic.
 * Designed to support energy-flow visualizations in M2/M3.
 */

/**
 * Linear interpolation between two values.
 * @param {number} a  Start value
 * @param {number} b  End value
 * @param {number} t  Factor in [0, 1]
 */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Clamp a value within [min, max].
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Re-map a value from one numeric range to another.
 * e.g. mapRange(flowRateLPM, 0, 20, 0, 1) → normalized flow intensity
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

/**
 * Map a normalized intensity [0, 1] to an RGB hex color
 * along a cold→hot gradient (blue → green → red).
 * Used in M2 for temperature-based particle/badge coloring.
 * @param {number} t  Normalized intensity in [0, 1]
 * @returns {number}  Three.js-compatible hex color
 */
export function heatColor(t) {
  t = clamp(t, 0, 1)
  const r = Math.round(clamp(t * 2, 0, 1) * 255)
  const g = Math.round(clamp(t < 0.5 ? t * 2 : (1 - t) * 2, 0, 1) * 255)
  const b = Math.round(clamp((1 - t) * 2, 0, 1) * 255)
  return (r << 16) | (g << 8) | b
}
