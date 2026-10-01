# VENT IT launch configuration — 1 October 2026

Seller configured from https://rekvizitai.vz.lt/imone/gedventa/:
UAB „Gedventa“, 303314094, VAT LT100010636410,
Ilgalaukio g. 7-2, LT-02119 Vilnius, Lithuania.

## Remaining account configuration

Production Stripe credentials are absent. Keep `commerce.accept_card_payments=false`
until test checkout, payment-status and signed webhook all pass.
In Supabase project `fihyzcabvrndsztlsufg`, set secrets through the dashboard:
`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Never commit or send them in chat.
Register a Stripe webhook for
`https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/stripe-webhook`, with
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.expired`. First use Stripe sandbox credentials and sandbox webhook.

`create-order` deliberately sets tax_status=to_confirm_before_payment.
Prices, VAT, actual stock, freight and lead time must be confirmed on each order before
marking its metadata.tax_status=confirmed. Company VAT registration alone does not
confirm international tax treatment. Checkout uses exact stored order totals.

## Authentication

Set Auth Site URL to `https://vent-it-com.onrender.com` until the custom domain is verified.
Add the exact planner redirect URL `https://vent-it-com.onrender.com/planner.html`
and any verified production domain planner URL to the allowlist.

To avoid Microsoft Safe Links consuming a one-time URL, use a code in BOTH signup
confirmation and magic-link templates. The planner now verifies the code directly:

```html
<h2>VENT IT — prisijungimo kodas</h2>
<p>Įrašyk šį vienkartinį kodą atidarytame VENT IT planeryje:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>Jei prisijungimo neprašei, šį laišką gali ignoruoti.</p>
```

Send a new login email and verify actual receipt, code sign-in, uploaded plan recognition,
room count against the drawing, wall alignment, scale, routes, export and kit-to-cart.
Automated geometry tests are not evidence of real-plan recognition accuracy.

## Completed checks

Payment tests cover webhook signature, rotated signatures, stale replay, incorrect total,
incorrect session, async completion and conditional expiry updates.
Geometry tests cover concave room placement, nearby wall refinement, blank images,
overlapping polygons, count mismatch and outside-footprint rejection.
Live API negative tests do not send emails or create orders.
