import { viewerFrom } from "@/lib/auth";
import { POSITIONS } from "@/lib/positions";
import { boardBySlug } from "@/lib/boards";
import { getSale, getSold, listUnmatched } from "@/lib/sold";
import { getClicks } from "@/lib/clicks";
import { getAllSponsorRecords, getApprovedSponsors } from "@/lib/sponsors";

/* Everything submitted, pending first. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }
  const board = boardBySlug(new URL(req.url).searchParams.get("board"));

  const [records, sold, live, unmatched] = await Promise.all([
    getAllSponsorRecords(board.slug),
    getSold(board.slug),
    getApprovedSponsors(board.slug),
    listUnmatched(),
  ]);

  const clicks = await getClicks(board.slug);
  // TAKE_ALL is deliberately absent. Marking it sold closes every position
  // at once, and the whole-board offer is no longer sold on the site, so the
  // row was a trap with no upside.
  const everyPosition = POSITIONS.map((p) => ({ no: p.no, name: p.name }));

  const withState = await Promise.all(
    everyPosition.map(async (p) => ({
      ...p,
      sold: sold.has(p.no),
      sale: sold.has(p.no) ? await getSale(p.no, board.slug) : null,
      onBoard: live[p.no]?.brand ?? "",
      clicks: clicks[p.no] ?? { total: 0, unique: 0 },
    })),
  );

  // the amount paid narrows which position it can be. Only offer positions
  // that are still open, since a sold one is already accounted for.
  const withCandidates = unmatched
    .filter((payment) => (payment.board ?? "") === board.slug)
    .map((payment) => ({
    ...payment,
    candidates: POSITIONS.filter(
      (position) =>
        position.price * 100 === payment.amount && !sold.has(position.no),
    ).map((position) => ({ no: position.no, name: position.name })),
  }));

  return Response.json({ records, board: withState, unmatched: withCandidates });
}
