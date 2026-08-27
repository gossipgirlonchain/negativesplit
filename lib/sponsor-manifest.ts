import type { PublicSponsor } from "./sponsors";

/* ============================================================
   SPONSORS ON THE BOARD

   Brand, website, X handle and logo for each sold position, edited
   here rather than clicked in one at a time. Anything published from
   /admin overrides what is written here.

   A sponsor may have a site, an X, or both. Where there is no site the
   X becomes the link. Both are shown on the hover card.

   Logos live in public/sponsors, named by brand so the two that bought
   more than one position share a file.
   ============================================================ */

type ManifestEntry = {
  brand: string;
  /** Website. Empty when the sponsor only gave an X. */
  url?: string;
  /** X handle, without the @. */
  x?: string;
  logo?: string;
};

const MANIFEST: Record<string, ManifestEntry> = {
  "01": {
    brand: "Deepstate",
    url: "https://deepstate.sh",
    x: "Deepstatesh",
    logo: "/sponsors/deepstate.jpg",
  },
  "02": {
    brand: "Levanto Labs",
    url: "https://levanto.ai",
    x: "levantolabs",
    logo: "/sponsors/levanto.jpg",
  },
  "03": {
    brand: "Ketone-IQ",
    url: "https://ketone.com",
    x: "ketone",
    logo: "/sponsors/ketone-iq.svg",
  },
  "04": {
    brand: "Deepstate",
    url: "https://deepstate.sh",
    x: "Deepstatesh",
    logo: "/sponsors/deepstate.jpg",
  },
  // supplied as a wordmark whose text was white and so invisible here,
  // cropped to the mark itself
  "05": {
    brand: "Givner Law",
    url: "https://givnerlawpc.com",
    x: "givnerlaw",
    logo: "/sponsors/givner-law.png",
  },
  "06": {
    brand: "Doorvana",
    url: "https://doorvana.com",
    x: "doorvana",
    logo: "/sponsors/doorvana.svg",
  },
  "07": {
    brand: "LO:TECH",
    url: "https://lo.tech",
    x: "lo_tech",
    logo: "/sponsors/lotech.jpg",
  },
  // UNCONFIRMED: built from their contact address, no site or handle given
  "08": {
    brand: "⚡️CMDK",
    url: "https://cmdk.email",
  },
  "09": {
    brand: "Soup",
    url: "https://trysoup.xyz",
    x: "secretsoupco",
    logo: "/sponsors/soup.jpg",
  },
  // gave an X only
  "10": {
    brand: "Good Marketing",
    x: "jamesrichardfry",
  },
  "11": {
    brand: "Babes Net",
    url: "https://babesnet.xyz",
    x: "babesnetxyz",
    logo: "/sponsors/babesnet.jpg",
  },
  // gave an X only
  "12": {
    brand: "polarchain",
    x: "post_polar_",
    logo: "/sponsors/polarchain.png",
  },
  "13": {
    brand: "Wawandco",
    url: "https://wawand.co",
    x: "wawandco",
    logo: "/sponsors/wawandco.svg",
  },
  "14": {
    brand: "SymbolSecurity",
    url: "https://symbolsecurity.com",
    x: "symbol_security_",
    logo: "/sponsors/symbolsecurity.svg",
  },
  "15": {
    brand: "Wawandco",
    url: "https://wawand.co",
    x: "wawandco",
    logo: "/sponsors/wawandco.svg",
  },
  "16": {
    brand: "Sova",
    url: "https://drinksova.com",
    x: "drinksova",
    logo: "/sponsors/sova.jpg",
  },
  // no site, no handle, no logo yet
  "17": {
    brand: "Joe Hovanec",
  },
  // gave an X only
  "18": {
    brand: "Octant",
    x: "octantapp",
    logo: "/sponsors/octant.png",
  },
  "19": {
    brand: "Relayzero",
    url: "https://relayzero.com",
    x: "relayzero",
    logo: "/sponsors/relayzero.jpg",
  },
  // supplied white only, recoloured to the board text colour so it reads
  "20": {
    brand: "Last",
    url: "https://golast.xyz",
    x: "lastdotnet",
    logo: "/sponsors/last.svg",
  },
  // marked by hand, no payment
  "21": {
    brand: "nook",
    x: "nook_platform",
    logo: "/sponsors/nook.png",
  },
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
      ...(entry.x ? { x: entry.x } : {}),
    };
  }
  return out;
}
