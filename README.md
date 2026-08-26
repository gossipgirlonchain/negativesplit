# Negative Split

Sponsor positions on a triathlon kit and bike, sold one at a time or all at once.
A Next.js 15 port of the original single-file site, with three things the flat
file could not do: real Stripe checkout, a real visitor counter, and positions
that mark themselves sold the moment someone pays.

The design is unchanged. `app/globals.css` is the original stylesheet, carried
across as-is.

---

## What lives where

```
app/
  layout.tsx                html shell, metadata
  page.tsx                  server component: reads sold state, renders the page
  globals.css               the original CSS, ported as-is
  opengraph-image.tsx       the unfurl card, drawn with next/og
  icon.svg                  favicon
  api/
    visits/route.ts         POST -> { now, total }
    stripe/webhook/route.ts POST -> marks a position sold
  sponsor/page.tsx          sponsors sign in and upload artwork
  admin/page.tsx            you approve or reject it
components/                 one component per section of the page
lib/
  positions.ts              THE single source of truth for the board
  sold.ts                   KV reads and writes for sold state
  money.ts                  formatting
scripts/
  stripe-setup.mjs          creates every Stripe product, price and payment link
```

**`lib/positions.ts` is the source of truth.** Prices, names, sizes, group
headers, the inventory total, the "individually $3,300" figure and every count
on the page derive from the `GROUPS` array. Change a price there and the whole
page follows.

One number is deliberately typed twice: `scripts/stripe-setup.mjs` carries its
own copy of the price list, because it runs under plain `node` with no
TypeScript loader. **If you change a price in `lib/positions.ts`, change it in
the script too and re-run it.**

**Sponsor artwork is never self-publishing.** An upload lands as `pending`
and only appears on the board after it is approved at `/admin`. See
[Sponsor artwork](#sponsor-artwork) below.

**Sold state is not in the source.** It lives in KV, written by the Stripe
webhook, read by `app/page.tsx` on a 30 second revalidate. A sale greys out its
position without a deploy.

---

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. With no KV configured, every position reads as
available and the visitor counter stays hidden — both correct: nothing has
sold, and there is nothing real to count.

## 2. Create the Stripe products, against test keys

```bash
export STRIPE_SECRET_KEY=sk_test_...
export SITE_URL=http://localhost:3000
node scripts/stripe-setup.mjs
```

It prints a block of payment link URLs. Paste them over `STRIPE_LINKS` in
`lib/positions.ts` — same keys, `"01"` through `"11"` plus `"TITLE"`. Any
position left blank falls back to a prefilled email, so a missing link costs a
lead, not a sale.

The script is idempotent by `lookup_key`. Running it again reuses whatever it
already made.

## 3. Wire the webhook locally

In a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` it prints on startup into `STRIPE_WEBHOOK_SECRET` in
`.env.local`, then restart `npm run dev` so the new value is picked up.

## 4. Buy a position and watch it go grey

Local KV is needed for this step to prove anything — without it there is
nowhere to write the sale. Either add Vercel KV now (step 5) and
`vercel env pull .env.local`, or point `KV_REST_API_URL` / `KV_REST_API_TOKEN`
at any Upstash Redis database.

Then, on the running site, claim position 11 and pay with `4242 4242 4242 4242`,
any future expiry, any CVC. Stripe redirects back to `/?claimed=11`, the thank
you banner appears, and within 30 seconds position 11 is struck through in the
list and greyed out in the drawing.

If it does not go grey, check in this order:

- `stripe listen` shows `checkout.session.completed` and a `200`
- the dev server logged `[webhook] 11 sold`
- KV env vars are set in the terminal running `npm run dev`

**Do not skip this step.** A sponsorship page that still shows a position as
available after someone has paid for it is the one bug that costs you a
customer twice.

## 5. Add Vercel KV

Vercel dashboard → your project → Storage → Create → KV. Connect it to the
project; that writes `KV_REST_API_URL` and `KV_REST_API_TOKEN` into the
project's environment variables. Pull them down locally with:

```bash
vercel env pull .env.local
```

KV holds two things: the set of sold positions (`sold:positions`), and the
visitor counter (`visits:*`). Buyer details land in `sale:<position>` as a hash
with `brand`, `contact`, `email`, `amount`, `session` and `at` — that is where
you go to chase artwork.

## 6. Deploy

```bash
vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL=https://negativesplit.space` in the project's
environment variables.

## 7. Point the domain

Vercel → project → Settings → Domains → add `negativesplit.space`, then follow
the DNS instructions it gives you at your registrar. Add `www` as a redirect if
you want one.

## 8. Switch to live keys

```bash
export STRIPE_SECRET_KEY=sk_live_...
export SITE_URL=https://negativesplit.space
node scripts/stripe-setup.mjs
```

Paste the new links over `STRIPE_LINKS` in `lib/positions.ts` and redeploy. The
test links and the live links are different URLs; the live ones redirect to the
real domain.

## 9. Add the live webhook endpoint

Stripe dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://negativesplit.space/api/stripe/webhook`
- Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`

Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel and
redeploy. It is a different secret from the local `stripe listen` one.

Then buy one cheap position for real, confirm it goes grey, and refund yourself.

---

## Sponsor artwork

Once a position is paid for, its buyer can put their own logo on it.

**The flow**

1. Buyer pays. The webhook stores their Stripe email against the position.
2. They go to `/sponsor` and sign in with Privy using that same email.
3. They see only the positions that email paid for, and upload a logo plus a
   link for each.
4. The submission sits as `pending`. Nothing is public yet.
5. You approve it at `/admin`. The logo takes over that plate in the drawing,
   the row shows the brand and a Visit link, and hovering either one names the
   sponsor and links out.

Rejecting is the same click, with a note the sponsor sees on their own page. A
resubmission pulls the old artwork off the board immediately and goes back to
pending.

**Setup**

1. Create a new Privy app at dashboard.privy.io. It has to be its own app;
   credentials from another project will not work. Enable **Email** as a login
   method and add `https://negativesplit.space` to Allowed origins.
2. Put the app ID in `PRIVY_APP_ID` and the secret in
   `PRIVY_APP_SECRET`.
3. Add Vercel Blob: dashboard → Storage → Create → Blob, connect it to the
   project. That writes `BLOB_READ_WRITE_TOKEN`.
4. Set `ADMIN_EMAILS` to the email you will sign in with. Anyone else gets 403
   from every admin route.

**Uploads** are capped at 2MB and limited to SVG, PNG, JPG and WebP. Links are
normalised and anything that is not http or https is rejected, so no
`javascript:` or `data:` URL reaches the page.

**When the paying email is not the working email**, open `/admin`, hit
*Reassign owner* on that position and enter the address they will sign in with.
That override wins over the Stripe email.

**A whole-board buyer** owns every position and sees all eleven upload forms.

---

## Notes

- **The counter never invents a number.** `/api/visits` answers 503 if KV is
  unreachable, and `VisitorCounter` renders nothing until it has a real
  response. Fake social proof on a page asking brands for money is worse than
  no counter.
- **The OG image is static on purpose.** It shows the goal and the size of the
  board, not live committed dollars: X caches an unfurl for a long time and a
  stale figure would be a lie with a long half-life.
- **Buying the whole board closes everything.** A paid `TITLE` marks all
  positions sold in the same write.
- **The webhook returns 500 on a failed KV write** so Stripe retries. Silence
  there is how a sold position stays on sale.

## Env vars

See `.env.local.example`. All five are required in production:
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `KV_REST_API_URL`,
`KV_REST_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`.

Four more are needed for sponsor sign in and artwork:
`PRIVY_APP_ID`, `PRIVY_APP_SECRET`, `ADMIN_EMAILS`,
`BLOB_READ_WRITE_TOKEN`. Without them the site still sells positions; the
`/sponsor` page just tells buyers to email their artwork in.
