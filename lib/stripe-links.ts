import Stripe from "stripe";
import { POSITIONS, TAKE_ALL } from "./positions";

/* ============================================================
   PAYMENT LINKS, STRAIGHT FROM STRIPE

   The single-file version kept a hand-pasted map of URLs. This reads
   the live links instead, matched by the metadata.position that
   scripts/stripe-setup.mjs writes, so there is no second list to keep
   in sync and no copy-paste step after a re-run.

   Read on every render, behind the page's 30s revalidate. Creation is
   never automatic: it happens from the script or the admin button.
   ============================================================ */

const CURRENCY = "usd";
const PREFIX = "sponsor";

function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/** position number -> checkout URL, for whatever exists in Stripe today. */
export async function getPaymentLinks(): Promise<Record<string, string>> {
  const client = stripe();
  if (!client) return {};

  try {
    const links = await client.paymentLinks.list({ limit: 100, active: true });
    const out: Record<string, string> = {};
    for (const link of links.data) {
      const no = link.metadata?.position;
      if (no) out[no] = link.url;
    }
    return out;
  } catch (err) {
    // A checkout link is recoverable: the row falls back to email. Log it
    // loudly rather than take the page down.
    console.error("[stripe] could not list payment links:", err);
    return {};
  }
}

type SyncResult = { created: string[]; existing: string[]; links: Record<string, string> };

/**
 * Find or create a product, price and payment link for every position.
 * Idempotent by price lookup_key and payment link metadata.position, so
 * running it twice reuses whatever it already made. Same logic as
 * scripts/stripe-setup.mjs, callable without a terminal.
 */
export async function ensurePaymentLinks(siteUrl: string): Promise<SyncResult> {
  const client = stripe();
  if (!client) throw new Error("STRIPE_SECRET_KEY is not set");

  const site = siteUrl.replace(/\/$/, "");
  const board = [
    ...POSITIONS.map((p) => ({ no: p.no, name: p.name, price: p.price })),
    { no: TAKE_ALL.no, name: "Every position, one brand", price: TAKE_ALL.price },
  ];

  const existingLinks = await client.paymentLinks.list({ limit: 100, active: true });
  const result: SyncResult = { created: [], existing: [], links: {} };

  for (const item of board) {
    const match = existingLinks.data.find((l) => l.metadata?.position === item.no);
    if (match) {
      result.existing.push(item.no);
      result.links[item.no] = match.url;
      continue;
    }

    const lookup_key = `${PREFIX}_${item.no.toLowerCase()}`;
    const found = await client.prices.list({ lookup_keys: [lookup_key], limit: 1 });

    let priceId = found.data[0]?.id;
    if (!priceId) {
      const product = await client.products.create({
        name: `${item.no} · ${item.name}`,
        metadata: { position: item.no },
      });
      const price = await client.prices.create({
        product: product.id,
        unit_amount: item.price * 100,
        currency: CURRENCY,
        lookup_key,
      });
      priceId = price.id;
    }

    const link = await client.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { position: item.no },
      custom_fields: [
        { key: "brand", label: { type: "custom", custom: "Brand name" }, type: "text" },
        {
          key: "contact",
          label: { type: "custom", custom: "Best email or X handle" },
          type: "text",
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: { url: `${site}/?claimed=${item.no}` },
      },
    });

    result.created.push(item.no);
    result.links[item.no] = link.url;
  }

  return result;
}
