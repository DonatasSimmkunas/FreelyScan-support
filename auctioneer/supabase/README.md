# Auctioneer Supabase schema

Project ref: `hvsbczirrxzzhuxlsbwe`

Applied migrations:

- 20260926114935 — auctioneer_core_schema
- 20260926115106 — auctioneer_intake_items
- 20260926130334 — liquidity_engine_v1
- 20260926131816 — auctioneer_fee_engine_v1
- 20260926132626 — auction_engine_launch_core
- 20260926132709 — launch_trust_legal_handover_admin
- 20260926132841 — auction_registration_notifications_payout_holds
- 20260926133241 — privacy_bid_history_hardening
- 20260926133419 — emergency_controls_self_bid_payout_monitor
- 20260926133455 — seller_onboarding_support_search_publish_gates
- 20260926133542 — seller_house_and_intake_linking
- 20260926133658 — payment_provider_event_scaffold

Generated database types are stored in `database.types.ts`.

## Operational jobs

- auctioneer-close-lots — every minute
- auctioneer-event-aggregate — every 15 minutes
- auctioneer-liquidity-eval — every 15 minutes
- auctioneer-notifications — every 15 minutes
- auctioneer-payout-eligibility — every 15 minutes
- auctioneer-health-monitor — every 5 minutes

## Payment state

Payment edge functions are deployed but guarded by `PAYMENTS_ENABLED=true`. Do not enable until Stripe secrets, webhook signing secret, marketplace/KYC setup and test transactions are configured.
