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

/** The campaign is finished when someone takes everything, so the
 *  goal is the flat price rather than a second number to maintain. */
export const GOAL = TAKE_ALL.price;

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

/** How many positions exist. Drives every "11" in the copy. */
export const TOTAL_N = POSITIONS.length;

export const BY_NO: Record<string, Position> = Object.fromEntries(
  POSITIONS.map((p) => [p.no, p]),
);

export const BY_TARGET: Record<string, Position> = Object.fromEntries(
  POSITIONS.map((p) => [p.target, p]),
);

/* ============================================================
   STRIPE PAYMENT LINKS

   Run `node scripts/stripe-setup.mjs` and paste what it prints
   over this block. Any position left blank falls back to a
   prefilled email, so a missing link costs you a lead, not a sale.
   ============================================================ */
export const STRIPE_LINKS: Record<string, string> = {
  "01": "",
  "02": "",
  "03": "",
  "04": "",
  "05": "",
  "06": "",
  "07": "",
  "08": "",
  "09": "",
  "10": "",
  "11": "",
  TITLE: "",
};

export function buyHref(
  no: string,
  label: string,
  live?: Record<string, string>,
): string {
  // live links from Stripe win, then anything pasted in below, then email
  const link = live?.[no] || STRIPE_LINKS[no];
  if (link) return link;
  const subject = `${SITE_NAME} - claiming No. ${no} (${label})`;
  const body = `Hi Winny,\n\nI want No. ${no} - ${label}.\n\nBrand:\nArtwork format:\n\n`;
  return (
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
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
