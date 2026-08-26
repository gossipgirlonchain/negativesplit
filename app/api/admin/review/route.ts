import { revalidatePath } from "next/cache";
import { viewerFrom } from "@/lib/auth";
import { BY_NO } from "@/lib/positions";
import { reviewArtwork, setOwnerEmail } from "@/lib/sponsors";

/* Approve or reject submitted artwork, and bind a position to a
   different email when the card email is not the working one. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }

  const body = (await req.json()) as {
    position?: string;
    decision?: string;
    note?: string;
    owner?: string;
  };

  const no = String(body.position ?? "").trim();
  if (!BY_NO[no]) return Response.json({ error: "unknown position" }, { status: 400 });

  if (typeof body.owner === "string" && body.owner.trim()) {
    await setOwnerEmail(no, body.owner);
    return Response.json({ ok: true, owner: body.owner.trim().toLowerCase() });
  }

  const decision = body.decision === "approve" ? "approve" : "reject";
  const record = await reviewArtwork(no, decision, String(body.note ?? "").trim());
  if (!record) {
    return Response.json({ error: "no artwork submitted for that position" }, { status: 404 });
  }

  revalidatePath("/");

  return Response.json({ ok: true, record });
}
