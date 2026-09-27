# Planner: 20 next improvements

The current plan generator is a schematic draft. These items are ordered roughly by impact and should be validated with real drawings and ventilation engineers before automatic ordering.

1. Detect every PDF page and let the user select floors before recognition.
2. Deskew photographed drawings and correct perspective automatically.
3. Detect dimensions printed on the drawing and suggest a scale with confidence.
4. Identify walls, doors, windows, shafts and stairwells as separate layers.
5. Highlight rooms with uncertain boundaries for targeted confirmation.
6. Recognize room names in Lithuanian, Norwegian and English.
7. Infer room use from both labels and fixtures, with manual correction.
8. Ask all missing project questions in one adaptive form.
9. Suggest HRV position from service clearance, noise and shaft access.
10. Mark outdoor intake and exhaust positions on a façade view.
11. Detect ceiling voids, beams and fire compartments from supplementary plans.
12. Route supply and extract through allowed installation zones, not across walls.
13. Show alternate route options and explain length, bends and conflicts.
14. Estimate airflow by country-specific, versioned rule profiles and occupancy.
15. Balance supply and extract while showing every changed room airflow.
16. Calculate pressure losses and noise from verified manufacturer product curves.
17. Size each main duct, radial branch, terminal and manifold from the same calculation.
18. Match each component to a compatible catalog SKU with live price and stock.
19. Generate an annotated drawing, bill of materials and a review trail for an engineer.
20. Compare the three complete, validated kit totals including tax, shipping and substitutions.

## Make the customer journey simpler

These are product opportunities, not claims that the current schematic already performs engineering validation.

1. Keep an uploaded plan and all manually edited rooms if recognition or sign-in fails. (Implemented.)
2. Resume recognition after a one-time email sign-in without asking the customer to upload again. (Implemented.)
3. Hide price tiers until a plan contains actual supply or extract terminals. (Implemented.)
4. Ask only for dimensions that cannot be read reliably from the drawing; prefill detected values with confidence labels.
5. Present one short review screen with uncertain rooms highlighted, instead of requiring a room-by-room inspection.
6. Recognize all PDF pages and suggest one floor per page; let customers remove irrelevant pages.
7. Save automatically with a visible last-saved time and offer a recoverable version history.
8. Offer a photo-capture guide that checks blur, perspective, cropping and legibility before upload.
9. Let a customer mark the proposed HRV, outdoor intake and exhaust with three taps on the drawing.
10. Ask about ceiling voids, beams and fire compartments through small choices tied to affected routes.
11. Provide an interactive before/after view for every proposed route change.
12. Explain each supply and extract point in plain language beside the drawing.
13. Show one compact list of blockers before requesting a professional kit review.
14. Recalculate only affected floors after a change, preserving other floors and manual terminal placements.
15. Show a clear difference between priced catalog items, project-priced items and the eventual quoted total.
16. Generate a shareable review link for an installer with highlighted questions and drawing annotations.
17. Let customers compare the three kits by noise, energy use, warranty and compatible components once verified data exists.
18. Prefill delivery location and currency only from a confirmed country choice, with a simple override.
19. Keep the project usable without an account; request sign-in only at the first server-dependent action.
20. Provide a final one-page summary of assumptions, unresolved checks and who will verify them.
