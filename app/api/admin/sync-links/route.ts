import { revalidatePath } from "next/cache";
import { viewerFrom } from "@/lib/auth";
import { resolveSiteUrl } from "@/lib/site";
import { ensurePaymentLinks } from "@/lib/stripe-links";

/* Create any missing Stripe product, price and payment link for the board.
   Idempotent, so pressing it twice is safe. Admin only. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }

  try {
    const result = await ensurePaymentLinks(resolveSiteUrl());
    revalidatePath("/");
    return Response.json({
      ok: true,
      created: result.created,
      existing: result.existing,
      total: Object.keys(result.links).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[sync-links]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
