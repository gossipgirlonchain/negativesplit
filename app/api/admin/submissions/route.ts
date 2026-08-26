import { viewerFrom } from "@/lib/auth";
import { getAllSponsorRecords } from "@/lib/sponsors";

/* Everything submitted, pending first. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }
  return Response.json({ records: await getAllSponsorRecords() });
}
