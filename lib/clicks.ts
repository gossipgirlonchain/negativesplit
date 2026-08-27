import { kv, kvConfigured } from "./kv";
import { clickSeenKey, clicksKey } from "./boards";

/* ============================================================
   SPONSOR LINK CLICKS

   Sponsors will be told these numbers, so they are counted the same
   way the visitor counter is: real events only, nothing seeded, and
   a unique count alongside the raw one so a single person refreshing
   cannot inflate what gets reported.

     clicks:<board>total    hash, position -> every click
     clicks:<board>unique   hash, position -> distinct visitors, 12h window
   ============================================================ */

const WINDOW_SECONDS = 60 * 60 * 12;

export type ClickCounts = Record<string, { total: number; unique: number }>;

/** Count one click. Returns quietly if there is no store to write to. */
export async function recordClick(
  no: string,
  board: string,
  visitor: string,
): Promise<void> {
  if (!kvConfigured()) return;

  await kv().hincrby(clicksKey(board, "total"), no, 1);

  const seen = await kv().set(clickSeenKey(board, no, visitor), 1, {
    nx: true,
    ex: WINDOW_SECONDS,
  });
  if (seen) await kv().hincrby(clicksKey(board, "unique"), no, 1);
}

/** Every position's counts, for the admin view. */
export async function getClicks(board = ""): Promise<ClickCounts> {
  if (!kvConfigured()) return {};

  const [total, unique] = await Promise.all([
    kv().hgetall<Record<string, unknown>>(clicksKey(board, "total")),
    kv().hgetall<Record<string, unknown>>(clicksKey(board, "unique")),
  ]);

  const out: ClickCounts = {};
  for (const [no, value] of Object.entries(total ?? {})) {
    out[String(no)] = { total: Number(value) || 0, unique: 0 };
  }
  for (const [no, value] of Object.entries(unique ?? {})) {
    const key = String(no);
    out[key] = { total: out[key]?.total ?? 0, unique: Number(value) || 0 };
  }
  return out;
}

/** A coarse, non-identifying fingerprint. Same approach as the visitor
 *  counter: enough to spot the same person twice, not enough to know who. */
export async function fingerprint(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf).slice(0, 10))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
