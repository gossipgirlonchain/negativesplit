import { boardBySlug } from "@/lib/boards";
import { fingerprint, recordClick } from "@/lib/clicks";
import { BY_NO } from "@/lib/positions";

/* Fired by sendBeacon when someone follows a sponsor's link. Answers 204
   whatever happens: a counter must never get in the way of the click. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { position?: string; board?: string };
    const no = String(body.position ?? "").trim();
    if (!BY_NO[no]) return new Response(null, { status: 204 });

    const board = boardBySlug(body.board);
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ua = req.headers.get("user-agent") ?? "";

    await recordClick(no, board.slug, await fingerprint(ip + ua));
  } catch {
    /* never let counting break a click */
  }
  return new Response(null, { status: 204 });
}
