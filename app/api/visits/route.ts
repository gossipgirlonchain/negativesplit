import { kv } from "@vercel/kv";
import { kvConfigured } from "@/lib/sold";

/* ============================================================
   THE REAL VISITOR COUNTER
   Ported from api-visits.js.

   Returns { now, total } where
     now   = distinct visitors seen in the last 60 seconds
     total = all-time page views, counted once per visitor per 12h

   The page pings this every 20 seconds while a tab is open, so "now"
   stays warm while someone is actually reading and drops off about a
   minute after they leave. These are real numbers. Do not seed them.
   If anything fails it answers 503 and the counter stays hidden.
   ============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_SECONDS = 60;

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  try {
    if (!kvConfigured()) throw new Error("KV is not configured");

    // a coarse, non-identifying fingerprint so one person is not counted twice
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ua = req.headers.get("user-agent") ?? "";
    const visitor = await fingerprint(ip + ua);

    const now = Date.now();
    const cutoff = now - WINDOW_SECONDS * 1000;

    // sliding window of who is here right now
    await kv.zadd("visits:live", { score: now, member: visitor });
    await kv.zremrangebyscore("visits:live", 0, cutoff);
    const live = await kv.zcard("visits:live");

    // all-time, counted once per visitor per 12 hours
    const seenKey = `visits:seen:${visitor}`;
    const fresh = await kv.set(seenKey, 1, { nx: true, ex: 60 * 60 * 12 });
    const total = fresh
      ? await kv.incr("visits:total")
      : ((await kv.get<number>("visits:total")) ?? 0);

    return Response.json(
      { now: Math.max(1, live ?? 1), total: Number(total) },
      { headers: NO_STORE },
    );
  } catch {
    // never invent a number: fail and let the site hide the counter
    return Response.json(
      { error: "counter unavailable" },
      { status: 503, headers: NO_STORE },
    );
  }
}

async function fingerprint(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf).slice(0, 10))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
