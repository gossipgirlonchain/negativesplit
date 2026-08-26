/** Whole dollars, grouped. No cents: every price on the board is round. */
export const money = (n: number): string => "$" + n.toLocaleString("en-US");

/** Plain grouped integer, for the visitor counter. */
export const num = (n: number): string => n.toLocaleString("en-US");

/** Percentage of a goal, clamped to the width of the track. */
export const pct = (part: number, whole: number): number =>
  Math.max(0, Math.min(100, (part / whole) * 100));
