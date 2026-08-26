import { viewerFrom } from "@/lib/auth";
import { POSITIONS, TAKE_ALL } from "@/lib/positions";
import { getSale, getSold } from "@/lib/sold";
import { getAllSponsorRecords, getApprovedSponsors } from "@/lib/sponsors";

/* Everything submitted, pending first. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }
  const [records, sold, live] = await Promise.all([
    getAllSponsorRecords(),
    getSold(),
    getApprovedSponsors(),
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

  return Response.json({ records, board: withState });
}
