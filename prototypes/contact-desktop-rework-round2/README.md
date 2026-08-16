# Contact desktop rework round 2 prototype

## Prototype question

Will one of three desktop/tablet structures — Typographic statement, Single
editorial column, or Two-column split — fix the three agreed shortcomings of
the shipped A2 layout (sparse left rail, weak primary-action hierarchy,
disconnected contact/snapshot zones) while preserving the approved mobile
design and the hairline field-notes system?

## Frame

- Trigger: Nathan reviewed the shipped A2 layout (2026-08-15) and found
  hierarchy, zone connection, and left-rail density still fall short.
- Desktop/tablet only. Mobile (≤720px) remains the shipped design and is not
  shown.
- Approved copy, routes, action behaviour, typography, palette, square
  corners, hairline depth, and accent usage are fixed (DESIGN.md +
  globals.css).
- Prototype controls are inert; Copy address stubs its real interaction. No
  production components, styles, tests, or routes are changed.
- Stop condition: Nathan compares the three frames at desktop (≈1440) and
  tablet (≈1024) widths in a real browser and selects one direction or names
  a hybrid.

## Directions

- **V1 — Typographic statement:** full-width page-scale h1; intro and actions
  beneath; Technical Snapshot demoted to a quiet single-row hairline strip.
  Fixes the sparse left rail by letting the h1 own the width; risk: snapshot
  reads as buried.
- **V2 — Single editorial column:** one continuous hairline flow. Eyebrow, h1,
  intro, actions, then the snapshot joins directly below with no zone break
  and no ink divider. Fixes disconnection; keeps the tallest scroll.
- **V3 — Two-column split:** complete contact block (eyebrow, h1, intro,
  stacked actions) left; Technical Snapshot as a vertical hairline-divided
  rail right. One side-by-side composition; tightest fit on narrow tablets.

## Open

Open `index.html` directly in a browser. Use the Desktop / Tablet control in
the sticky bar to compare all three at the same conceptual viewport.

## Prototype verdict

- Question: which structure fixes sparse left rail, weak hierarchy, and
  disconnected zones?
- Evidence observed: three variants compared at desktop ≈1440 and tablet
  ≈1024; Nathan reviewed and attached a screenshot (not readable by this
  model — text decision below is authoritative).
- Verdict: **V2 — Single editorial column for desktop (≥1240px).** Tablet
  (960–1240px) keeps the current shipped implementation with one visual
  change: remove the rail/separator — both ink rules go, the ink
  border-bottom on `.contact-column` and the ink border-top on
  `.technical-snapshot-heading` — so the snapshot joins the contact block
  in one flow (Nathan, 2026-08-16: removing only the bottom border would
  move the ink rule onto the snapshot heading and keep the zone break).
  Mobile (≤720px) stays unchanged, including the snapshot heading's ink top
  rule.
- Decision unlocked: desktop becomes one continuous hairline flow — eyebrow,
  h1, intro, actions, then Technical Snapshot directly below with no zone
  break; tablet keeps shipped snapshot grid minus both ink rules. Shipped
  hero h1 clamp retained (page-scale V1 h1 compared and rejected in the same
  review); measured single-flow occupancy 46.1% at 1240/1440, 38.7% at 1920.
- Limits / unresolved: desktop snapshot grid arrangement, breakpoint
  placement, and mobile-rule cleanup detail are specification/implementation
  work. No production code changed in this prototype round.
