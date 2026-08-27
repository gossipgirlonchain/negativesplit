import type { PublicSponsor } from "./sponsors";

/* ============================================================
   SPONSORS ON THE BOARD

   Brand, link and logo for each sold position, edited here rather
   than clicked in one at a time. Anything published from /admin
   overrides what is written here, so this is a starting point and
   not a lock.

   Links were taken from the email domain on each sale, which is
   the only evidence there is. The four marked UNCONFIRMED are
   guesses from an X handle or have no domain at all.

   Logos live in public/sponsors and are referenced by path. Drop a
   file in, add the logo line, and it appears on the drawing.
   ============================================================ */

type ManifestEntry = { brand: string; url?: string; logo?: string };

const MANIFEST: Record<string, ManifestEntry> = {
  "01": { brand: "Deepstate", url: "https://deepstate.sh" },
  "02": { brand: "Levanto Labs", url: "https://levanto.ai" },
  "03": { brand: "Ketone-IQ", url: "https://ketone.com" },
  "04": { brand: "Deepstate", url: "https://deepstate.sh" },
  "05": { brand: "Givner Law", url: "https://givnerlawpc.com" },
  "06": { brand: "Doorvana", url: "https://doorvana.com" },
  "07": { brand: "LO:TECH", url: "https://lo.tech" },
  "08": { brand: "⚡️CMDK", url: "https://cmdk.email" },
  "09": { brand: "Soup", url: "https://trysoup.xyz" },
  "10": { brand: "Good Marketing", url: "https://jamesrichardfry.com" },
  // UNCONFIRMED: no company domain on the sale, handle was Babesnet_xyz
  "11": { brand: "Babes Net", url: "https://x.com/Babesnet_xyz" },
  // UNCONFIRMED: no company domain on the sale, handle was post_polar_
  "12": { brand: "polarchain", url: "https://x.com/post_polar_" },
  "13": { brand: "Wawandco", url: "https://wawand.co" },
  "14": { brand: "SymbolSecurity", url: "https://symbolsecurity.com" },
  "15": { brand: "Wawandco", url: "https://wawand.co" },
  "16": { brand: "Sova", url: "https://drinksova.com" },
  // UNCONFIRMED: bought from a personal address, no site given
  "17": { brand: "Joe Hovanec" },
  "18": { brand: "Octant", url: "https://octantlabs.io" },
  "19": { brand: "Relayzero", url: "https://relayzero.com" },
  "20": { brand: "Last", url: "https://golast.xyz" },
  // UNCONFIRMED: marked by hand, no payment and no details yet
  "21": { brand: "nook" },
};

/** The manifest applies to the original board only. */
export function manifestSponsors(board: string): Record<string, PublicSponsor> {
  if (board) return {};
  const out: Record<string, PublicSponsor> = {};
  for (const [no, entry] of Object.entries(MANIFEST)) {
    out[no] = {
      no,
      brand: entry.brand,
      url: entry.url ?? "",
      ...(entry.logo ? { logoUrl: entry.logo } : {}),
    };
  }
  return out;
}
