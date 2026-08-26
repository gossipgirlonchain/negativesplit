import { viewerFrom } from "@/lib/auth";
import { POSITIONS, TAKE_ALL } from "@/lib/positions";
import { getSold } from "@/lib/sold";
import { getAllSponsorRecords } from "@/lib/sponsors";

/* Everything submitted, pending first. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }
  const [records, sold] = await Promise.all([getAllSponsorRecords(), getSold()]);
  const board = [...POSITIONS.map((p) => ({ no: p.no, name: p.name })), {
    no: TAKE_ALL.no,
    name: "Every position, one brand",
  }].map((p) => ({ ...p, sold: sold.has(p.no) }));

  return Response.json({ records, board });
}
