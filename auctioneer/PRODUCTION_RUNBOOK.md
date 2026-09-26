# Auctioneer Production Launch Runbook

## Current launch state
- Public site: https://auctioneer.it.com
- Launch mode: preview
- Real bidding: disabled
- Payments: disabled
- Current seeded inventory: demo only
- Stripe Connect/Checkout code: deployed, but disabled until real Stripe secrets + KYB configuration are complete.

## Real-money launch gate
Do not switch to live until all items below are complete:
1. Terms of Service legally reviewed and set active.
2. Privacy Policy legally reviewed and set active.
3. Buyer Protection terms legally reviewed and set active.
4. Dispute/refund policy legally reviewed and set active.
5. Stripe test payment succeeds end-to-end.
6. Stripe webhook signature is verified in production.
7. Seller Connect/KYB reaches transfer capability active.
8. Refund test succeeds.
9. Payout release procedure is approved and tested.
10. Transactional email provider is enabled.
11. At least one real seller has passed verification.
12. No RED QA lots are published.
13. Static security headers are configured in Render Dashboard.
14. Production backup/recovery policy is confirmed.

## Emergency procedures

### Stop all bidding
Use the admin RPC `admin_set_bidding(false, reason)`.

### Platform outage during auction
1. Disable bidding.
2. Record a system incident.
3. Extend all open lots with `admin_extend_open_lots(minutes, reason)`.
4. Verify the auction close cron is healthy.
5. Re-enable bidding only after realtime and database checks pass.

### Failed auction-close job
Check `cron.job_run_details` for `auctioneer-close-lots`.
The job must be succeeding every minute.

### Payment incident
1. Keep `payments_enabled=false`.
2. Do not manually mark orders as paid.
3. Inspect Stripe webhook events and `payment_provider_events`.
4. Reconcile order, PaymentIntent, charge, refund and payout records before reopening payments.

### Dispute
Opening a dispute blocks seller payout eligibility. Do not release a payout while an order is disputed or refund_pending.

## Render static security headers
Render Dashboard -> auctioneer-it-com -> Headers.
Recommended for `/*`:
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

The HTML also includes a CSP meta fallback, but response headers are preferred.

## Monitoring
- Public health: https://hvsbczirrxzzhuxlsbwe.supabase.co/functions/v1/health
- Human-readable status: https://auctioneer.it.com/status.html
- Database health monitor: every 5 minutes
- Auction close cron: every minute
- Liquidity evaluator: every 15 minutes
- Notifications queue: every 15 minutes

## Demo inventory
All current seeded auctions are flagged `is_demo=true`.
Real bidding stays disabled while demo inventory is the only inventory.
