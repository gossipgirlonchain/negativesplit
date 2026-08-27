import { viewerFrom } from "@/lib/auth";
import { POSITIONS, TAKE_ALL } from "@/lib/positions";
import { getSale, getSold, listUnmatched } from "@/lib/sold";
import { getAllSponsorRecords, getApprovedSponsors } from "@/lib/sponsors";

/* Everything submitted, pending first. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }
  const [records, sold, live, unmatched] = await Promise.all([
    getAllSponsorRecords(),
    getSold(),
    getApprovedSponsors(),
    listUnmatched(),
  ]);
  const board = [...POSITIONS.map((p) => ({ no: p.no, name: p.name })), {
    no: TAKE_ALL.no,
    name: "Every position, one brand",
  }];

  const withState = await Promise.all(
    board.map(async (p) => ({
      ...p,
      sold: sold.has(p.no),
      sale: sold.has(p.no) ? await getSale(p.no) : null,
      onBoard: live[p.no]?.brand ?? "",
    })),
  );

  // the amount paid narrows which position it can be. Only offer positions
  // that are still open, since a sold one is already accounted for.
  const withCandidates = unmatched.map((payment) => ({
    ...payment,
    candidates: POSITIONS.filter(
      (position) =>
        position.price * 100 === payment.amount && !sold.has(position.no),
    ).map((position) => ({ no: position.no, name: position.name })),
  }));

  return Response.json({ records, board: withState, unmatched: withCandidates });
}
