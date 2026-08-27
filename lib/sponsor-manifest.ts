import type { PublicSponsor } from "./sponsors";

/* ============================================================
   SPONSORS ON THE BOARD

   Brand, link and logo for each sold position, edited here rather
   than clicked in one at a time. Anything published from /admin
   overrides what is written here, so this is a starting point and
   not a lock.

   Logos live in public/sponsors, named by brand so the two that
   bought more than one position share a file. Drop a file in, add
   the logo line, and it appears on the drawing and in the list.
   ============================================================ */

type ManifestEntry = { brand: string; url?: string; logo?: string };

const MANIFEST: Record<string, ManifestEntry> = {
  "01": {
    brand: "Deepstate",
    url: "https://deepstate.sh",
    logo: "/sponsors/deepstate.jpg",
  },
  "02": {
    brand: "Levanto Labs",
    url: "https://levanto.ai",
    logo: "/sponsors/levanto.jpg",
  },
  "03": {
    brand: "Ketone-IQ",
    url: "https://ketone.com",
    logo: "/sponsors/ketone-iq.svg",
  },
  "04": {
    brand: "Deepstate",
    url: "https://deepstate.sh",
    logo: "/sponsors/deepstate.jpg",
  },
  // supplied as a wordmark whose text was white and so invisible here,
  // cropped to the mark itself
  "05": {
    brand: "Givner Law",
    url: "https://givnerlawpc.com",
    logo: "/sponsors/givner-law.png",
  },
  "06": {
    brand: "Doorvana",
    url: "https://doorvana.com",
    logo: "/sponsors/doorvana.svg",
  },
  "07": { brand: "LO:TECH", url: "https://lo.tech" },
  "08": { brand: "⚡️CMDK", url: "https://cmdk.email" },
  "09": { brand: "Soup", url: "https://trysoup.xyz" },
  "10": { brand: "Good Marketing", url: "https://jamesrichardfry.com" },
  // UNCONFIRMED: no company domain on the sale, handle was Babesnet_xyz
  "11": { brand: "Babes Net", url: "https://x.com/Babesnet_xyz" },
  "12": {
    brand: "polarchain",
    url: "https://x.com/post_polar_",
    logo: "/sponsors/polarchain.png",
  },
  "13": {
    brand: "Wawandco",
    url: "https://wawand.co",
    logo: "/sponsors/wawandco.svg",
  },
  "14": { brand: "SymbolSecurity", url: "https://symbolsecurity.com" },
  "15": {
    brand: "Wawandco",
    url: "https://wawand.co",
    logo: "/sponsors/wawandco.svg",
  },
  "16": {
    brand: "Sova",
    url: "https://drinksova.com",
    logo: "/sponsors/sova.jpg",
  },
  // UNCONFIRMED: bought from a personal address, no site given
  "17": { brand: "Joe Hovanec" },
  "18": {
    brand: "Octant",
    url: "https://octantlabs.io",
    logo: "/sponsors/octant.png",
  },
  "19": { brand: "Relayzero", url: "https://relayzero.com" },
  // supplied white only, recoloured to the board text colour so it reads
  "20": { brand: "Last", url: "https://golast.xyz", logo: "/sponsors/last.svg" },
  // UNCONFIRMED: marked by hand, no payment and no details yet
  "21": { brand: "nook", logo: "/sponsors/nook.png" },
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
