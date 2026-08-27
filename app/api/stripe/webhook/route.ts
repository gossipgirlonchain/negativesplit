import Stripe from "stripe";
import { markSold, recordUnmatched } from "@/lib/sold";

/* ============================================================
   THE POINT OF THE MIGRATION

   Stripe tells us a position has been paid for, we write it to KV,
   and the page greys it out within the revalidate window. No redeploy,
   no editing a source file, no position sold twice.

   Two things matter here:
     - the raw body, not parsed JSON, or the signature will not verify
     - return 200 fast, and 500 on a failed write so Stripe retries
   ============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !signingSecret) {
    console.error("[webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing");
    return new Response("stripe not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing stripe-signature", { status: 400 });

  // raw body. Do not req.json() this: the signature covers the exact bytes.
  const payload = await req.text();

  const stripe = new Stripe(secretKey);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      signingSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[webhook] signature verification failed:", message);
    return new Response(`signature verification failed: ${message}`, {
      status: 400,
    });
  }

  // Cards clear inside checkout.session.completed. Slower methods clear
  // later, under async_payment_succeeded, and are just as paid.
  const relevant =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";

  if (!relevant) return new Response("ignored", { status: 200 });

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status === "unpaid") {
    return new Response("not paid yet", { status: 200 });
  }

  // Set by /api/checkout. A payment that arrives without it came from
  // somewhere else: a manual link, an invoice, an old link. Money has
  // changed hands, so record it for /admin rather than dropping it.
  const position = session.metadata?.position;
  if (!position) {
    console.warn(`[webhook] session ${session.id} has no metadata.position`);
    await recordUnmatched(session, "no position on the payment");
    return new Response("recorded as unmatched", { status: 200 });
  }

  try {
    await markSold(position, session);
  } catch (err) {
    // 500 so Stripe retries. A position that stays available after
    // someone paid for it is the one bug worth a retry storm.
    console.error(`[webhook] could not mark ${position} sold:`, err);
    return new Response("could not write sold state", { status: 500 });
  }

  console.log(`[webhook] ${position} sold — session ${session.id}`);
  return new Response("ok", { status: 200 });
}
