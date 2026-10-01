# Product information review — 2026-10-01

Catalogue: 3,058 SKUs. Exact manufacturer SKU matches: 2,413. Four additional legacy Smarty 2R variants reference archived manual P0108_AZ_0003; the page explicitly requires production-revision confirmation because the manual does not list SKUs. 641 remaining SKUs are listed in product-data-review.csv and remain marked unverified.

The published details contain 63,008 technical fields, including climate-specific ErP fields, and 26,179 document/drawing references (references include shared documents). Each record links to its manufacturer source and records the check date. No joining by similar model names is allowed. Manufacturer template placeholders are excluded.

Delivery ranges are merchant planning allowances, not supplier-confirmed dates. They cover preparation, destination transit and a visible buffer. Unknown stock uses 50–65 business days preparation; commercial AHUs use 60–80. Explicit admin in_stock status uses 3–5. Add destination transit (2–15 business days), five buffer days, another five for Norway and three for goods over 100 kg. Quote/discontinued products do not receive a numerical promise. Confirm stock and dispatch before payment. Review these allowances when supplier lead-time and carrier feeds become available.

Validation: scripts/test-product-details.mjs checks identifiers, source domains, variant differences, every published field and document reference, and delivery rules for all 16 supported destinations. npm run build packages the per-SKU data. Live browser verification is required after publishing.
