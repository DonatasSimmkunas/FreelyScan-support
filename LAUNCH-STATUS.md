# VENT IT — implemented launch work, 2026-10-01

Owner excluded Paysera setup, sign-in configuration and mail configuration from this change.

Implemented:
- Recipient name, street, city, postal code, phone and delivery method required in the form and API; unsupported countries rejected.
- Versioned terms acceptance recorded with the request.
- Final quotation: administrator edits exact order lines, freight, tax treatment, supplier / carrier references, return cost and warranty; transactional save and expiring private customer link.
- Customer can view / print and explicitly accept the current quotation version; expired or replaced tokens are rejected.
- Operations: invoice and supplier order recorded only for accepted paid orders; dispatch requires invoice and tracking; return cases and completed-refund evidence recorded. Recording does not send funds.
- Supplier review: costs and margin kept in a private schema; evidence required; no made-up stock or supplier prices.
- 32 exact-source product candidates; all commercial confirmations remain outstanding until real supplier / carrier evidence is entered.
- Updated terms, shipping, returns, withdrawal form, warranty and privacy disclosures.
- Hashed email quotas: 5 requests/hour/address and 100 total requests/hour. AI: 10/day/user and 150/day overall. Database errors fail closed.
- Operational health endpoint, admin alerts and authenticated operational export. Export is not a complete database / storage backup.
- Website-only release tree; full source retained on vent-launch-source, served website on vent-deploy-staging. No server functions, test scripts, setup docs or supplier cost files in the served release.
- Polygon tracing tool for rooms along actual inside walls, including concave shapes; rejects self-crossing and tiny outlines. Scale remains required for metres / square metres.

Evidence:
- Automated order, payment, geometry, quote / operations, quota, export and public-build checks.
- Live database rollback test verifies final item totals, quotation acceptance, JSON restore equality and anonymous denial for private RPCs. No test order remains in production.
- Two real uploaded drawing requests reached the recognition backend, but both returned recognition_not_configured (OPENAI_API_KEY absent).
- A local image segmentation prototype was evaluated, found to miss rooms / draw false partitions, and not shipped.

Still unconfirmed:
- Supplier purchase prices, stock reservations, actual lead times and carrier quotes.
- Professional review of the ventilation rules and hydraulic / noise calculations.
- Automatic wall / room recognition accuracy; cannot be signed off without a configured model and an independent benchmark.
- Actual payment / refund / shipment; excluded payment setup prevents a real financial cycle.
- Full infrastructure disaster recovery and provider backup retention; operational JSON round trip is narrower.
- Actual transactional mail receipt and authentication; intentionally excluded.

Do not advertise the planner as a fully verified automatic installation design.
