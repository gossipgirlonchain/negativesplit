import Stripe from "stripe";
import { BY_NO, SITE_NAME, TAKE_ALL, TOTAL_N } from "@/lib/positions";
import { boardBySlug } from "@/lib/boards";
import { resolveSiteUrl } from "@/lib/site";
import { getSold } from "@/lib/sold";
import { getApprovedSponsors } from "@/lib/sponsors";

/* ============================================================
   CHECKOUT, ON DEMAND

   A buyer clicks Claim and lands here. We build a Stripe Checkout
   Session for that position on the spot and send them to it. Nothing
   has to exist in Stripe beforehand: no products, no prices, no
   payment links, no setup step. The price comes from lib/positions.ts,
   which stays the only place a number is written.

   Paying is what reserves the position. The webhook writes it sold,
   and this route refuses a position that is already gone.
   ============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ position: string }> },
) {
  const { position } = await params;
  const board = boardBySlug(new URL(req.url).searchParams.get("b"));
  const site = resolveSiteUrl();
  const back = `${site}${board.path === "/" ? "" : board.path}`;

  const item =
    position === TAKE_ALL.no
      ? {
          no: TAKE_ALL.no,
          name: `Every position, one brand`,
          price: TAKE_ALL.price,
          description: `All ${TOTAL_N} sponsor positions on the kit, helmet and frameset.`,
        }
      : BY_NO[position]
        ? {
            no: position,
            name: BY_NO[position].name,
            price: BY_NO[position].price,
            description: BY_NO[position].sub,
          }
        : null;

  if (!item) return Response.redirect(`${back}/#positions`, 303);

  // already gone: send them back to the board rather than take their money
  const [sold, sponsors] = await Promise.all([
    getSold(board.slug),
    getApprovedSponsors(board.slug),
  ]);
  if (sold.has(item.no) || sold.has(TAKE_ALL.no) || sponsors[item.no]) {
    return Response.redirect(`${back}/?taken=${item.no}#positions`, 303);
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return Response.redirect(
      emailFallback(item.no, item.name, board.contactEmail),
      303,
    );
  }

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: item.price * 100,
            product_data: {
              name: `${item.no} · ${item.name}`,
              description: item.description,
            },
          },
        },
      ],
      // the webhook reads this to know what was bought
      // the webhook reads both: what was bought, and whose board
      metadata: { position: item.no, board: board.slug },
      // what the buyer has to give you so you can chase artwork
      custom_fields: [
        { key: "brand", label: { type: "custom", custom: "Brand name" }, type: "text" },
        {
          key: "contact",
          label: { type: "custom", custom: "Best email or X handle" },
          type: "text",
        },
      ],
      success_url: `${back}/?claimed=${item.no}`,
      cancel_url: `${back}/#positions`,
    });

    if (!session.url) throw new Error("Stripe returned a session with no URL");
    return Response.redirect(session.url, 303);
  } catch (err) {
    console.error(`[checkout] could not start checkout for ${item.no}:`, err);
    return Response.redirect(
      emailFallback(item.no, item.name, board.contactEmail),
      303,
    );
  }
}

/** Last resort only. A buyer should never see this unless Stripe is down. */
function emailFallback(no: string, label: string, to: string): string {
  const subject = `${SITE_NAME} - claiming No. ${no} (${label})`;
  const body = `Hi Winny,\n\nI want No. ${no} - ${label}.\n\nBrand:\nArtwork format:\n\n`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
