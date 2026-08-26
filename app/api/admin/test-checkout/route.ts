import Stripe from "stripe";
import { viewerFrom } from "@/lib/auth";
import { BY_NO } from "@/lib/positions";
import { resolveSiteUrl } from "@/lib/site";

/* A $1 checkout against a real position, so the whole live path can be
   proven for a dollar: Stripe checkout, webhook signature, KV write, the
   board greying out. Release the position afterwards from the same page.
   Admin only, so nobody else can buy a position for $1. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer?.isAdmin) {
    return Response.json({ error: "not allowed" }, { status: 403 });
  }

  const body = (await req.json()) as { position?: string };
  const no = String(body.position ?? "11").trim();
  const position = BY_NO[no];
  if (!position) return Response.json({ error: "unknown position" }, { status: 400 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return Response.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });

  const site = resolveSiteUrl();

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 100,
            product_data: {
              name: `TEST · ${position.no} · ${position.name}`,
              description: "One dollar end to end test. Release the position afterwards.",
            },
          },
        },
      ],
      // the real position number, so the webhook does exactly what it would
      // do for a real sale
      metadata: { position: position.no, test: "true" },
      custom_fields: [
        { key: "brand", label: { type: "custom", custom: "Brand name" }, type: "text" },
        {
          key: "contact",
          label: { type: "custom", custom: "Best email or X handle" },
          type: "text",
        },
      ],
      success_url: `${site}/?claimed=${position.no}`,
      cancel_url: `${site}/admin`,
    });

    return Response.json({ ok: true, url: session.url, position: position.no });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[test-checkout]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
