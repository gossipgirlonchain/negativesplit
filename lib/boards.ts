/* ============================================================
   BOARDS

   One site, more than one athlete. Each board has its own sold
   state and its own contacts, and shares everything else: the
   drawing, the positions, the prices, the race, and the Stripe
   account the money lands in.

   The original board keeps unprefixed KV keys so nothing that has
   already sold moves.
   ============================================================ */

export type Board = {
  /** "" for the original board, otherwise the URL segment. */
  slug: string;
  /** Where the board lives. */
  path: string;
  /** Shown in the browser tab and the OG card. */
  title: string;
  contactEmail: string;
  socialLabel: string;
  socialHref: string;
  /** Whether sponsors can upload artwork, or are asked to email it. */
  uploads: boolean;
  /** The crypto line in the FAQ is a personal claim, not a house rule. */
  personalCryptoLine: boolean;
};

export const MAIN: Board = {
  slug: "",
  path: "/",
  title: "Negative Split",
  contactEmail: "winny@winny.wtf",
  socialLabel: "@winternet on X",
  socialHref: "https://x.com/winternet",
  uploads: true,
  personalCryptoLine: true,
};

export const CONNOR: Board = {
  slug: "connor",
  path: "/connor",
  title: "Negative Split",
  contactEmail: "jconnorholliman@gmail.com",
  socialLabel: "@jconnorholliman on X",
  socialHref: "https://x.com/jconnorholliman",
  uploads: false,
  personalCryptoLine: false,
};

export const BOARDS: Board[] = [MAIN, CONNOR];

export function boardBySlug(slug: string | undefined | null): Board {
  return BOARDS.find((b) => b.slug === (slug ?? "")) ?? MAIN;
}

/* ---------- KV keys, namespaced per board ---------- */

const ns = (slug: string) => (slug ? `${slug}:` : "");

export const soldKey = (slug: string) => `sold:${ns(slug)}positions`;
export const saleKey = (slug: string, no: string) => `sale:${ns(slug)}${no}`;
export const sponsorKey = (slug: string, no: string) => `sponsor:${ns(slug)}${no}`;
export const publicSponsorsKey = (slug: string) => `sponsors:${ns(slug)}public`;
export const ownerKey = (slug: string, no: string) => `owner:${ns(slug)}${no}`;
/** kind is "total" or "unique". */
export const clicksKey = (slug: string, kind: string) =>
  `clicks:${ns(slug)}${kind}`;
export const clickSeenKey = (slug: string, no: string, visitor: string) =>
  `clicks:${ns(slug)}seen:${no}:${visitor}`;
