/* ============================================================
   THE BOARD — the single source of truth.

   Every number on the site derives from this file: the inventory
   total, the counts, the "individually $X" figure, the group
   headers, the progress bar. Nothing is hand-typed twice.

   What is NOT here: sold state. That lives in KV (lib/sold.ts)
   and is written by the Stripe webhook, so a sale shows up
   without a redeploy.

   One duplicate does exist on purpose: scripts/stripe-setup.mjs
   carries its own copy of the numbers, because it runs under
   plain node with no TypeScript loader. If you change a price
   here, change it there too and re-run the script.
   ============================================================ */

export type Position = {
  /** Two-digit string. Matches the code in the drawing and the
   *  Stripe metadata.position field. */
  no: string;
  /** id of the <g class="zone"> in the drawing this row belongs to. */
  target: string;
  name: string;
  sub: string;
  size: string;
  price: number;
  tag?: string;
};

export type PositionGroup = {
  title: string;
  note: string;
  items: Position[];
};

export const SITE_NAME = "Negative Split";
export const CONTACT_EMAIL = "winny@winny.wtf";

/** The whole-board buy. One buyer, every position. */
export const TAKE_ALL = { no: "TITLE", price: 3000 } as const;

export const GROUPS: PositionGroup[] = [
  {
    title: "The race kit",
    note: "Printed. Artwork closes October 24.",
    items: [
      {
        no: "01",
        target: "k-front-up",
        name: "Front panel, upper",
        sub: "Chest. Every photo taken of my face, and the finish chute.",
        size: "12 × 8 cm",
        price: 600,
        tag: "Best on the board",
      },
      {
        no: "02",
        target: "k-back-up",
        name: "Back panel, upper",
        sub: "56 miles of bike and 13.1 of run, seen by everyone behind me.",
        size: "14 × 10 cm",
        price: 500,
        tag: "Most minutes",
      },
      {
        no: "03",
        target: "k-front-lo",
        name: "Front panel, lower",
        sub: "Bigger than the chest, but the aero position folds it. Priced for that.",
        size: "14 × 10 cm",
        price: 350,
      },
      {
        no: "04",
        target: "k-back-lo",
        name: "Back panel, lower",
        sub: "Dead centre of every photo taken from a following bike.",
        size: "14 × 10 cm",
        price: 300,
      },
      {
        no: "05",
        target: "k-sleeves",
        name: "Sleeves, pair",
        sub: "In frame on every photo shot from the aero position.",
        size: "7 × 5 cm ×2",
        price: 225,
      },
      {
        no: "12",
        target: "k-waist-f1",
        name: "Waist tab, front left",
        sub: "Left of the waistband, front. Sold on its own.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "13",
        target: "k-waist-f2",
        name: "Waist tab, front centre",
        sub: "Dead centre of the waistband, front.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "14",
        target: "k-waist-f3",
        name: "Waist tab, front right",
        sub: "Right of the waistband, front. Sold on its own.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "15",
        target: "k-waist-b1",
        name: "Waist tab, back left",
        sub: "Left of the waistband, back.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "16",
        target: "k-waist-b2",
        name: "Waist tab, back centre",
        sub: "Dead centre of the waistband, seen from every following wheel.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "17",
        target: "k-waist-b3",
        name: "Waist tab, back right",
        sub: "Right of the waistband, back.",
        size: "4 × 4 cm",
        price: 200,
      },
      {
        no: "18",
        target: "k-leg-fl",
        name: "Front thigh, left",
        sub: "In shot for 56 miles of bike and 13.1 of run.",
        size: "5 × 4 cm",
        price: 250,
      },
      {
        no: "19",
        target: "k-leg-fr",
        name: "Front thigh, right",
        sub: "Same panel, other leg, sold on its own.",
        size: "5 × 4 cm",
        price: 250,
      },
      {
        no: "20",
        target: "k-leg-bl",
        name: "Back thigh, left",
        sub: "Facing the camera on every climb.",
        size: "5 × 4 cm",
        price: 250,
      },
      {
        no: "21",
        target: "k-leg-br",
        name: "Back thigh, right",
        sub: "Same panel, other leg, sold on its own.",
        size: "5 × 4 cm",
        price: 250,
      },
    ],
  },
  {
    title: "The frameset and helmet",
    note: "Cut vinyl. Open until race week.",
    items: [
      {
        no: "06",
        target: "b-dt-low",
        name: "Down tube, lower half",
        sub: "Both sides. Where the manufacturer's name normally goes.",
        size: "11 × 7 cm ×2",
        price: 400,
        tag: "Biggest panel",
      },
      {
        no: "07",
        target: "b-dt-up",
        name: "Down tube, upper half",
        sub: "Both sides. Same panel, forward of the split line.",
        size: "11 × 7 cm ×2",
        price: 300,
      },
      {
        no: "08",
        target: "b-fork",
        name: "Fork blades",
        sub: "Both sides. Head on, in the aero tuck.",
        size: "14 × 3 cm ×2",
        price: 175,
      },
      {
        no: "09",
        target: "b-helmet",
        name: "Helmet, sides",
        sub: "Leaves the bike and follows me onto the run.",
        size: "8 × 4 cm ×2",
        price: 175,
      },
      {
        no: "10",
        target: "b-helmet-f",
        name: "Helmet, front",
        sub: "Straight down the barrel of every finish line camera.",
        size: "7 × 4 cm",
        price: 150,
        tag: "On camera",
      },
      {
        no: "11",
        target: "b-headtube",
        name: "Head tube",
        sub: "Small, front on, the cheapest way in.",
        size: "6 × 4 cm",
        price: 125,
        tag: "Entry",
      },
    ],
  },
];

/* ---------- derived, never hand-typed ---------- */

export const POSITIONS: Position[] = GROUPS.flatMap((g) => g.items);

/** Total if every position is sold one at a time. */
export const INVENTORY = POSITIONS.reduce((sum, p) => sum + p.price, 0);

/** How many positions exist. Drives every count in the copy. */
export const TOTAL_N = POSITIONS.length;

/** The cheapest way onto the board. */
export const CHEAPEST = Math.min(...POSITIONS.map((p) => p.price));

export const BY_NO: Record<string, Position> = Object.fromEntries(
  POSITIONS.map((p) => [p.no, p]),
);

export const BY_TARGET: Record<string, Position> = Object.fromEntries(
  POSITIONS.map((p) => [p.target, p]),
);

/**
 * Where a Claim button goes. The route builds a Stripe Checkout Session
 * for this position on the spot and redirects to it, so there is nothing
 * to create in Stripe ahead of time and no list of URLs to maintain.
 */
export function buyHref(no: string): string {
  return `/api/checkout/${encodeURIComponent(no)}`;
}

/** Committed dollars, given what KV says has sold. */
export function raised(sold: Set<string>): number {
  if (sold.has(TAKE_ALL.no)) return TAKE_ALL.price;
  return POSITIONS.filter((p) => sold.has(p.no)).reduce((s, p) => s + p.price, 0);
}

/** Positions still available. */
export function openCount(sold: Set<string>): number {
  return POSITIONS.filter((p) => !sold.has(p.no)).length;
}
