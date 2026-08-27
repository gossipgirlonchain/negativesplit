import { kv, kvConfigured } from "./kv";
import type Stripe from "stripe";
import { POSITIONS, TAKE_ALL } from "./positions";

/* ============================================================
   SOLD STATE

   A set of position numbers in KV, written by the Stripe webhook
   and read by the page. The source file never knows what sold —
   that is the whole point of the migration.

     sold:positions   set of "01" ... "11" and "TITLE"
     sale:<no>        hash: brand, contact, email, amount, session, at
   ============================================================ */

const SOLD_KEY = "sold:positions";

export { kvConfigured };

/**
 * Position numbers that have been paid for.
 *
 * If KV is not configured at all (local dev, first build) this returns
 * an empty set so the site still renders. If KV *is* configured and the
 * read fails, it throws: with `revalidate = 30` Next keeps serving the
 * last good page rather than redrawing a sold position as available,
 * which is the one bug that costs a customer twice.
 */
export async function getSold(): Promise<Set<string>> {
  if (!kvConfigured()) return new Set();
  const members = await kv().smembers<unknown[]>(SOLD_KEY);
  // The KV client deserializes what it reads, and "11" round-trips as the
  // number 11 while "01" stays a string. Force everything back to strings
  // or position 11 silently stays on sale after it has been paid for.
  return new Set((members ?? []).map((m) => String(m)));
}

/**
 * Mark a position sold and keep the buyer's details so artwork can be chased.
 * Buying the whole board (TITLE) closes every position with it.
 */
export async function markSold(
  no: string,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const fields = session.custom_fields ?? [];
  const field = (key: string) =>
    fields.find((f) => f.key === key)?.text?.value ?? "";

  await kv().hset(`sale:${no}`, {
    brand: field("brand"),
    contact: field("contact"),
    email: session.customer_details?.email ?? "",
    name: session.customer_details?.name ?? "",
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    session: session.id,
    at: new Date().toISOString(),
  });

  const alsoClosed =
    no === TAKE_ALL.no ? POSITIONS.map((p) => p.no) : [];

  await kv().sadd(SOLD_KEY, no, ...alsoClosed);
}

/* ---------- manual overrides ----------
   For a position taken outside Stripe: a bank transfer, a trade, or a
   dry run of the artwork flow. Does exactly what the webhook does, minus
   the payment. */

/** Mark a position sold by hand and record who owns it. */
export async function setSoldManually(no: string, email: string): Promise<void> {
  await kv().hset(`sale:${no}`, {
    brand: "",
    contact: "",
    email: email.trim().toLowerCase(),
    name: "",
    amount: 0,
    currency: "usd",
    session: "manual",
    at: new Date().toISOString(),
  });

  const alsoClosed = no === TAKE_ALL.no ? POSITIONS.map((p) => p.no) : [];
  await kv().sadd(SOLD_KEY, no, ...alsoClosed);
}

/** Put a position back on the board and forget its artwork. */
export async function releasePosition(no: string): Promise<void> {
  const alsoOpened = no === TAKE_ALL.no ? POSITIONS.map((p) => p.no) : [];
  await kv().srem(SOLD_KEY, no, ...alsoOpened);
  await kv().del(`sale:${no}`, `sponsor:${no}`, `owner:${no}`);
  await kv().hdel("sponsors:public", no);
}

export type SaleRecord = {
  no: string;
  email: string;
  brand: string;
  contact: string;
  name: string;
  amount: number;
  currency: string;
  session: string;
  at: string;
};

/** The receipt for a position: who bought it, what they gave you, and
 *  whether it came from Stripe or was marked by hand. */
export async function getSale(no: string): Promise<SaleRecord | null> {
  if (!kvConfigured()) return null;
  const raw = await kv().hgetall<Record<string, unknown>>(`sale:${no}`);
  if (!raw) return null;
  const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    no,
    email: str(raw.email),
    brand: str(raw.brand),
    contact: str(raw.contact),
    name: str(raw.name),
    amount: Number(raw.amount ?? 0),
    currency: str(raw.currency) || "usd",
    session: str(raw.session),
    at: str(raw.at),
  };
}

/* ---------- payments that matched nothing ----------
   A paid checkout with no position in its metadata used to be acknowledged
   and forgotten, which means money in Stripe and nothing on the board. Keep
   them so they surface in /admin instead of only in a log. */

const UNMATCHED_KEY = "payments:unmatched";

export type UnmatchedPayment = {
  session: string;
  email: string;
  brand: string;
  contact: string;
  amount: number;
  currency: string;
  at: string;
  reason: string;
};

export async function recordUnmatched(
  session: Stripe.Checkout.Session,
  reason: string,
): Promise<void> {
  if (!kvConfigured()) return;
  const fields = session.custom_fields ?? [];
  const field = (key: string) =>
    fields.find((f) => f.key === key)?.text?.value ?? "";

  const record: UnmatchedPayment = {
    session: session.id,
    email: session.customer_details?.email ?? "",
    brand: field("brand"),
    contact: field("contact"),
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    at: new Date().toISOString(),
    reason,
  };
  await kv().hset(UNMATCHED_KEY, { [session.id]: JSON.stringify(record) });
}

export async function listUnmatched(): Promise<UnmatchedPayment[]> {
  if (!kvConfigured()) return [];
  const raw = await kv().hgetall<Record<string, unknown>>(UNMATCHED_KEY);
  if (!raw) return [];
  const out: UnmatchedPayment[] = [];
  for (const value of Object.values(raw)) {
    const parsed = typeof value === "string" ? safeJson(value) : value;
    if (parsed && typeof parsed === "object") out.push(parsed as UnmatchedPayment);
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export async function clearUnmatched(sessionId: string): Promise<void> {
  await kv().hdel(UNMATCHED_KEY, sessionId);
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
