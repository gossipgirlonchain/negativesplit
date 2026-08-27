import { revalidatePath } from "next/cache";
import { viewerFrom } from "@/lib/auth";
import { BY_NO, TAKE_ALL } from "@/lib/positions";
import { boardBySlug } from "@/lib/boards";
import {
  clearUnmatched,
  getSale,
  releasePosition,
  setSoldManually,
} from "@/lib/sold";
import { hideBrand, publishBrand } from "@/lib/sponsors";

/* Take a position off the board or put it back, without Stripe.
   For bank transfers, trades, and testing the artwork flow. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }

  const body = (await req.json()) as {
    position?: string;
    action?: string;
    email?: string;
    brand?: string;
    url?: string;
    session?: string;
    board?: string;
  };

  const board = boardBySlug(body.board);
  const no = String(body.position ?? "").trim();
  if (!BY_NO[no] && no !== TAKE_ALL.no) {
    return Response.json({ error: "unknown position" }, { status: 400 });
  }

  if (body.action === "publish-name") {
    const sale = await getSale(no, board.slug);
    const brand = String(body.brand ?? sale?.brand ?? "").trim();
    if (!brand) {
      return Response.json(
        { error: "no brand name on that sale. Enter one." },
        { status: 400 },
      );
    }
    await publishBrand(no, brand, String(body.url ?? "").trim(), board.slug);
    revalidatePath(board.path);
    return Response.json({ ok: true, position: no, brand });
  }

  if (body.action === "hide-name") {
    await hideBrand(no, board.slug);
    revalidatePath(board.path);
    return Response.json({ ok: true, position: no, state: "hidden" });
  }

  if (body.action === "release") {
    await releasePosition(no, board.slug);
    revalidatePath(board.path);
    return Response.json({ ok: true, position: no, state: "available" });
  }

  const email = String(body.email ?? viewer.email).trim().toLowerCase();
  if (!email) return Response.json({ error: "an owner email is required" }, { status: 400 });

  await setSoldManually(no, email, board.slug);

  // attaching a stray Stripe payment to a position clears it from the list
  if (body.session) await clearUnmatched(String(body.session));

  revalidatePath(board.path);
  return Response.json({ ok: true, position: no, state: "sold", owner: email });
}
