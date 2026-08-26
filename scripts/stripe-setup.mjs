#!/usr/bin/env node
/**
 * stripe-setup.mjs
 * Creates one Stripe Product + Price + Payment Link for every position on the
 * board, then prints the exact STRIPE = { ... } block to paste into the site.
 *
 * Run it once. It is idempotent by lookup_key, so running it twice will not
 * create duplicates: it reuses anything it already made.
 *
 *   npm install stripe
 *   export STRIPE_SECRET_KEY=sk_live_...        (or sk_test_... to rehearse)
 *   export SITE_URL=https://yourdomain.com      (where buyers land after paying)
 *   node stripe-setup.mjs
 *
 * Test first. Use sk_test_ and card 4242 4242 4242 4242 until the flow is right,
 * then re-run with sk_live_ and paste the new links.
 */

import Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY;
const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");

if (!KEY) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}
if (!SITE) {
  console.error("Set SITE_URL first, e.g. export SITE_URL=https://yourdomain.com");
  process.exit(1);
}

const stripe = new Stripe(KEY);

/* ---- keep this list identical to the one in the site ---- */
const POSITIONS = [
  { no: "01", name: "Front panel, upper",       price:  600, group: "Race kit" },
  { no: "02", name: "Back panel, upper",        price:  500, group: "Race kit" },
  { no: "03", name: "Front panel, lower",       price:  350, group: "Race kit" },
  { no: "04", name: "Back panel, lower",        price:  300, group: "Race kit" },
  { no: "05", name: "Sleeves, pair",            price:  225, group: "Race kit" },
  { no: "06", name: "Down tube, lower half",    price:  400, group: "Frameset" },
  { no: "07", name: "Down tube, upper half",    price:  300, group: "Frameset" },
  { no: "08", name: "Fork blades",              price:  175, group: "Frameset" },
  { no: "09", name: "Helmet, sides",            price:  175, group: "Frameset" },
  { no: "10", name: "Helmet, front",            price:  150, group: "Frameset" },
  { no: "11", name: "Head tube",                price:  125, group: "Frameset" },
  { no: "TITLE", name: "Every position, one brand", price: 3000, group: "Whole board" }
];

const CURRENCY = "usd";
const PREFIX = "sponsor";           // lookup_key prefix, so re-runs find existing prices

async function findOrCreatePrice(pos) {
  const lookup_key = `${PREFIX}_${pos.no.toLowerCase()}`;

  const existing = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1, expand: ["data.product"] });
  if (existing.data.length) {
    console.log(`  price exists  ${lookup_key}`);
    return existing.data[0];
  }

  const product = await stripe.products.create({
    name: `${pos.no} · ${pos.name}`,
    description: `${pos.group} sponsor position. Ironman 70.3 Indian Wells, December 2026, and the full Ironman in Q2 2027.`,
    metadata: { position: pos.no, group: pos.group }
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: pos.price * 100,
    currency: CURRENCY,
    lookup_key
  });

  console.log(`  created       ${lookup_key}  $${pos.price}`);
  return price;
}

async function findOrCreateLink(pos, price) {
  const links = await stripe.paymentLinks.list({ limit: 100, active: true });
  const match = links.data.find(l => l.metadata?.position === pos.no);
  if (match) {
    console.log(`  link exists   ${pos.no}`);
    return match;
  }

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { position: pos.no },
    // what the buyer has to give you so you can chase artwork
    custom_fields: [
      { key: "brand", label: { type: "custom", custom: "Brand name" }, type: "text" },
      { key: "contact", label: { type: "custom", custom: "Best email or X handle" }, type: "text" }
    ],
    after_completion: {
      type: "redirect",
      redirect: { url: `${SITE}/?claimed=${pos.no}` }
    }
  });

  console.log(`  link created  ${pos.no}`);
  return link;
}

const out = {};

console.log("\nSetting up positions\n");
for (const pos of POSITIONS) {
  console.log(`${pos.no}  ${pos.name}`);
  const price = await findOrCreatePrice(pos);
  const link = await findOrCreateLink(pos, price);
  out[pos.no] = link.url;
}

console.log("\n\nPaste this over the STRIPE block in the site:\n");
console.log("const STRIPE = {");
for (const [no, url] of Object.entries(out)) {
  console.log(`  "${no}": "${url}",`);
}
console.log("};\n");
console.log("Then set COUNTER_ENDPOINT if you are running the visitor counter, and redeploy.\n");
