/**
 * Moon phase rendering — classic terminator technique.
 *
 * The lit shape is one SVG path: the moon's left outer semicircle plus an
 * inner elliptical "terminator" arc whose horizontal radius shrinks/grows
 * with the phase. Updating a single `d` attribute morphs the phase.
 *
 * Phase p in [0, 1]: 0 = full moon, 1 = new moon (waning as the user
 * scrolls and the moon sets behind the dunes).
 */

/** ViewBox radius used by the scene's moon SVG. */
export const MOON_RADIUS = 46;

/**
 * Discrete phase steps: the path only updates when the quantized step
 * changes, so scrolling doesn't rewrite the attribute on every frame.
 */
export const MOON_PHASE_STEPS = 48;

export function quantizePhase(p: number): number {
  const clamped = Math.min(1, Math.max(0, p));
  return Math.round(clamped * MOON_PHASE_STEPS) / MOON_PHASE_STEPS;
}

/**
 * Path (`d`) for the lit portion at phase p, centered at (0,0).
 *
 * Left semicircle drawn top->bottom (sweep 0 = counterclockwise), then the
 * terminator arc back up. While waning past full (p < 0.5) the terminator
 * bulges right (gibbous); past quarter (p > 0.5) it bulges left (crescent).
 */
export function moonPathD(p: number, r: number = MOON_RADIUS): string {
  const clamped = Math.min(1, Math.max(0, p));
  const terminatorRx = Math.abs(Math.cos(Math.PI * clamped)) * r;
  const bulgeRight = clamped < 0.5;
  return (
    `M 0 ${-r} ` +
    `A ${r} ${r} 0 0 0 0 ${r} ` +
    `A ${terminatorRx.toFixed(2)} ${r} 0 0 ${bulgeRight ? 0 : 1} 0 ${-r} Z`
  );
}
