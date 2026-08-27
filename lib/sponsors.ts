import { kv, kvConfigured } from "./kv";
import { manifestSponsors } from "./sponsor-manifest";
import { POSITIONS, TAKE_ALL } from "./positions";
import { ownerKey, publicSponsorsKey, saleKey, sponsorKey } from "./boards";

/* ============================================================
   SPONSOR ARTWORK

   A buyer logs in with Privy, uploads a logo and a link, and it sits
   pending until it is approved. Only approved artwork is ever public.

     sponsor:<no>       hash, the full record including pending work
     sponsors:public    hash, field = position no, value = approved JSON
     owner:<no>         string, manual override of who owns a position

   The public page reads one key. Everything else is off the hot path.
   ============================================================ */

export type SponsorStatus = "pending" | "approved" | "rejected";

/** What the public page renders. */
export type PublicSponsor = {
  no: string;
  brand: string;
  url: string;
  /** Absent until artwork is approved. A brand can go on the board by
   *  name first, and gain its logo later. */
  logoUrl?: string;
  /** X handle without the @. */
  x?: string;
};

/** Where a sponsor's name should lead: their site if they have one,
 *  otherwise their X. */
export function sponsorLink(sponsor: PublicSponsor): string {
  if (sponsor.url) return sponsor.url;
  return sponsor.x ? `https://x.com/${sponsor.x}` : "";
}

/** The full record, admin side. */
export type SponsorRecord = PublicSponsor & {
  logoPath: string;
  status: SponsorStatus;
  submittedAt: string;
  reviewedAt: string;
  note: string;
};


/** Everything out of KV comes back deserialized, so "11" can arrive as 11.
 *  Force strings on the way in. */
const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/* ---------- public ---------- */

/** Approved artwork only, keyed by position number. One KV read. */
export async function getApprovedSponsors(
  board = "",
): Promise<Record<string, PublicSponsor>> {
  // the manifest is the starting point; anything published from /admin
  // is written over the top of it
  const out: Record<string, PublicSponsor> = { ...manifestSponsors(board) };

  if (!kvConfigured()) return out;
  const raw = await kv().hgetall<Record<string, unknown>>(publicSponsorsKey(board));
  if (!raw) return out;

  for (const [no, value] of Object.entries(raw)) {
    const parsed = typeof value === "string" ? safeParse(value) : value;
    if (!parsed || typeof parsed !== "object") continue;
    const s = parsed as Partial<PublicSponsor>;
    if (!s.brand) continue;
    const logoUrl = str(s.logoUrl);
    const handle = str((s as { x?: string }).x);
    out[str(no)] = {
      no: str(no),
      brand: str(s.brand),
      url: str(s.url),
      ...(logoUrl ? { logoUrl } : {}),
      ...(handle ? { x: handle } : {}),
    };
  }
  return out;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/* ---------- records ---------- */

export async function getSponsorRecord(
  no: string,
  board = "",
): Promise<SponsorRecord | null> {
  if (!kvConfigured()) return null;
  const raw = await kv().hgetall<Record<string, unknown>>(sponsorKey(board, no));
  if (!raw || !raw.logoUrl) return null;
  const status = str(raw.status);
  return {
    no,
    brand: str(raw.brand),
    url: str(raw.url),
    logoUrl: str(raw.logoUrl),
    logoPath: str(raw.logoPath),
    status: (["pending", "approved", "rejected"].includes(status)
      ? status
      : "pending") as SponsorStatus,
    submittedAt: str(raw.submittedAt),
    reviewedAt: str(raw.reviewedAt),
    note: str(raw.note),
  };
}

/** Every submission, newest work first. Admin view. */
export async function getAllSponsorRecords(board = ""): Promise<SponsorRecord[]> {
  if (!kvConfigured()) return [];
  const numbers = [...POSITIONS.map((p) => p.no), TAKE_ALL.no];
  const records = await Promise.all(
    numbers.map((no) => getSponsorRecord(no, board)),
  );
  const found = records.filter((r): r is SponsorRecord => r !== null);
  const rank = { pending: 0, approved: 1, rejected: 2 };
  return found.sort(
    (a, b) =>
      rank[a.status] - rank[b.status] || b.submittedAt.localeCompare(a.submittedAt),
  );
}

/** Save a submission. Always lands as pending: nothing reaches the public
 *  page without a human saying yes. */
export async function submitArtwork(
  input: {
    no: string;
    brand: string;
    url: string;
    logoUrl: string;
    logoPath: string;
  },
  board = "",
): Promise<void> {
  await kv().hset(sponsorKey(board, input.no), {
    brand: input.brand,
    url: input.url,
    logoUrl: input.logoUrl,
    logoPath: input.logoPath,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: "",
    note: "",
  });
  // a resubmission pulls the old artwork off the public page immediately
  await kv().hdel(publicSponsorsKey(board), input.no);
}

export async function reviewArtwork(
  no: string,
  decision: "approve" | "reject",
  note = "",
  board = "",
): Promise<SponsorRecord | null> {
  const record = await getSponsorRecord(no, board);
  if (!record) return null;

  const status: SponsorStatus = decision === "approve" ? "approved" : "rejected";
  await kv().hset(sponsorKey(board, no), {
    status,
    reviewedAt: new Date().toISOString(),
    note,
  });

  if (status === "approved") {
    const publicRecord: PublicSponsor = {
      no,
      brand: record.brand,
      url: record.url,
      logoUrl: record.logoUrl,
    };
    await kv().hset(publicSponsorsKey(board), { [no]: JSON.stringify(publicRecord) });
  } else {
    await kv().hdel(publicSponsorsKey(board), no);
  }

  return { ...record, status, note };
}

/* ---------- ownership ---------- */

/** Who owns a position: the manual override if one is set, otherwise the
 *  email that paid for it. */
export async function getOwnerEmail(no: string, board = ""): Promise<string> {
  if (!kvConfigured()) return "";
  const override = await kv().get<string>(ownerKey(board, no));
  if (override) return str(override).toLowerCase();
  const sale = await kv().hgetall<Record<string, unknown>>(saleKey(board, no));
  return str(sale?.email).toLowerCase();
}

/** Bind a position to a different email than the one that paid. */
export async function setOwnerEmail(
  no: string,
  email: string,
  board = "",
): Promise<void> {
  await kv().set(ownerKey(board, no), email.trim().toLowerCase());
}

/* ---------- publishing a name without artwork ----------
   The brand a buyer types at Stripe checkout is free text from a
   stranger. It reaches the board only when you put it there. */

/** Put a brand name on the board, with or without a logo. */
export async function publishBrand(
  no: string,
  brand: string,
  url = "",
  board = "",
): Promise<void> {
  const existing = await getSponsorRecord(no, board);
  const entry: PublicSponsor = {
    no,
    brand: brand.trim(),
    url: url.trim(),
    ...(existing?.status === "approved" && existing.logoUrl
      ? { logoUrl: existing.logoUrl }
      : {}),
  };
  await kv().hset(publicSponsorsKey(board), { [no]: JSON.stringify(entry) });
}

/** Take a name back off the board. */
export async function hideBrand(no: string, board = ""): Promise<void> {
  await kv().hdel(publicSponsorsKey(board), no);
}
