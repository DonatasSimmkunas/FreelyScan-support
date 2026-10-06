# VENT IT: 20 improvements — implementation record

Date: 2026-10-06. This release is a preliminary planner update. It does not establish universal floor-plan recognition accuracy. Previous 18.32%/42.17% measurements do not describe this release.

| # | Status | Implemented behavior / remaining work |
|---|---|---|
| 1 | Implemented | Room IDs no longer prove geometric completeness. Independent enclosure, coverage, method agreement and absence of overlaps/missing IDs are checked. Room count evidence is independent of printed ID count. |
| 2 | Implemented | Removed the silent 40-region cap. Verified with 48-room controlled drawings. Project import still has an explicit 300-room safety bound. |
| 3 | Implemented, bounded | Overlapping 1000x700 tiles from the retained higher-resolution image; duplicate reconciliation, progress, cancellation and saved tile checkpoints. Maximum 64 tiles is explicit. No reconstruction of information absent from the source. |
| 4 | Implemented | Shared affine fit/composition/inversion for page, crop, PDF graphics and planner coordinates. Round-trip tests include rotations. |
| 5 | Implemented, limited PDF primitives | Reads PDF operator lists, graphics transforms and straight/rectangular paths as a separate candidate source. Unsupported curves and truncation are recorded. PDF paths are not assumed to be architectural walls. |
| 6 | Partial | Explicit room legend rows are excluded from spatial room-ID evidence. Automatic exclusion of complete table/legend graphic regions remains unfinished. |
| 7 | Implemented | Stroke estimate selects multiple gap sizes instead of exclusively fixed sizes. Comparison results remain evidence, not calibrated confidence. |
| 8 | Partial | Gap closing requires collinear support on both ends. A learned door/swing classifier is not installed; an open passage can still be ambiguous. |
| 9 | Partial | Existing thickness/long-line filtering remains; the original image is preserved. Separate semantic furniture/fixture/text segmentation is not installed. |
| 10 | Partial | Shared endpoint/edge graph records room incidence and non-manifold edges. General T-junction splitting and complete shared-wall reconciliation are unfinished. |
| 11 | Implemented, limited to resolvable enclosures | Structural enclosure is built without predicted rooms. Unassigned area is measured independently and blocks readiness. Open external boundaries remain unresolved. |
| 12 | Implemented, conservative | Original-pixel snapping accepted only when IoU with the original candidate is at least .98. This is a bounded refinement, not a wall accuracy guarantee. |
| 13 | Implemented | Separate printed kitchen/living anchors guide extract/supply placement in a single open-plan room. Manual terminal overrides remain authoritative. Missing anchors retain preliminary placement. |
| 14 | Partial | Multiple wall modes, gap variants, high-resolution and PDF candidates compared by polygon agreement. A validated independent learned segmentation model and calibrated acceptance probabilities are unfinished. |
| 15 | Implemented, explicit-unit evidence | Horizontal and vertical printed dimensions with explicit units are checked independently. Two horizontal widths remain estimated. Bare numbers never establish independent scale. |
| 16 | Partial | Boundary/scale uncertainty yields geometric area intervals, shown in Inspector and carried in quantity metadata. These are assumption-based bounds, not statistical confidence intervals. Full material/purchase interval propagation is unfinished. |
| 17 | Partial | 21 controlled layouts have exact geometric truth and strict IoU checks. A separate expert-annotated corpus of real architectural drawings is still required. |
| 18 | Implemented | 63 raster transformations test 180-degree rotation, contrast and translation across the 21 controlled layouts. Additional transform/tiling tests are included. These variants are not counted as independent internet plans. |
| 19 | Partial | IndexedDB jobs persist OCR/tile stages with version/source identity, restart reuse, bounded retention and a resume control. This works on the same browser; durable server workers and cross-device continuation are unfinished. |
| 20 | Partial | Duct diameter/parallel runs determine routing clearance; room-boundary crossings are listed for review. Segment/bend-position IDs tie CSV component rows to route IDs. SKU compatibility, installation-height approval and physical penetration details remain engineer checks. |

## Validation

- 123 additional evidence checks pass, including 21 controlled layouts and 63 raster transformations.
- Existing planner, input, geometry, reliability, language, export, checkout and product tests pass.
- Website build and public-surface checks pass.
- No new independent real-world recognition percentage is claimed.

## Storage and scope

Checkpoint data stays in the current browser's IndexedDB, expires after 14 days and is capped at 50 jobs. Browser storage can be unavailable or cleared. It is not a server queue or backup. Original plan uploads are not sent to a new model provider by these changes.

Components marked `bend-position` describe a geometric bend location. They are not automatically purchased rigid elbows; radial flexible ducts may use different construction. All catalog choices and installation assumptions remain preliminary.

## Remaining blockers for full completion

A deployable learned model must be selected and measured on an independent, completely annotated set of real plans; its code/weights/data usage rights and runtime must be checked. Full table/fixture segmentation, wall reconciliation, purchase interval propagation, server workers and verified SKU/penetration rules remain implementation work. The 20-point request is therefore not fully completed by this release.
