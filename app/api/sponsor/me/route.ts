import { viewerFrom } from "@/lib/auth";
import { BY_NO, POSITIONS, TAKE_ALL } from "@/lib/positions";
import { getSold } from "@/lib/sold";
import { getOwnerEmail, getSponsorRecord } from "@/lib/sponsors";

/* What this signed-in sponsor owns, and the state of their artwork. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer) return Response.json({ error: "not signed in" }, { status: 401 });

  const sold = await getSold();

  // a whole-board buyer owns every position
  const candidates = sold.has(TAKE_ALL.no)
    ? POSITIONS.map((p) => p.no)
    : POSITIONS.filter((p) => sold.has(p.no)).map((p) => p.no);

  const ownerOf = sold.has(TAKE_ALL.no) ? TAKE_ALL.no : null;
  const boardOwner = ownerOf ? await getOwnerEmail(ownerOf) : "";

  const owned = [];
  for (const no of candidates) {
    const owner = boardOwner || (await getOwnerEmail(no));
    if (owner !== viewer.email && !viewer.isAdmin) continue;
    const position = BY_NO[no];
    owned.push({
      no,
      name: position.name,
      size: position.size,
      price: position.price,
      artwork: await getSponsorRecord(no),
    });
  }

  return Response.json({
    email: viewer.email,
    isAdmin: viewer.isAdmin,
    positions: owned,
  });
}
