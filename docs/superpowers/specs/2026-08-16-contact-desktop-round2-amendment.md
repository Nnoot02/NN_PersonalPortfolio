# Contact desktop round-2 composition amendment

**Status:** APPROVED — Nathan, 2026-08-16
**Date:** 2026-08-16
**Revision:** 2
**Owner:** Nathan No-ot
**Review target:** this file
**Supersedes:** desktop/tablet upper-composition and ink-rail rules of
`docs/superpowers/specs/2026-08-15-contact-desktop-a2-amendment.md`

## Problem

The shipped A2 composition (approved 2026-08-15) fixed the email-primary
hierarchy but left three shortcomings, agreed with Nathan on 2026-08-16:

1. At desktop (≥1240px) the left rail carries only the eyebrow and headline —
   sparse, with all contact substance pushed into the right region.
2. The contact block and Technical Snapshot still read as two disconnected
   zones, cut by an ink rule.
3. Primary-action hierarchy is present but muted inside the split upper
   composition.

Round-2 prototype (`prototypes/contact-desktop-rework-round2/`) compared three
directions. Nathan selected **V2 — Single editorial column** for desktop and,
for tablet, chose to keep the shipped A2 tablet implementation with one
change: remove the rail/separator.

This amendment changes desktop and tablet composition only. It does not reopen
copy, claims, destinations, interaction behaviour, mobile design, footer
content, typography, colour, or brand language.

## Outcome

- At `min-width: 1240px`, Contact is one continuous vertical hairline flow:
  eyebrow, headline, intro, actions, then Technical Snapshot directly below.
  No left/right split, no ink rule between the contact block and the snapshot.
  The shipped A2 weighted desktop ledger (Current Role / Studying / Path over
  Verified Power / Current Build) is retained.
- Above `720px` and below `1240px`, the shipped A2 tablet layout is retained
  with one change: the ink rail under `.contact-column` and the ink top rule
  on the snapshot heading are removed so the snapshot joins the contact block
  in one flow. The tablet ledger rhythm is unchanged.
- At `max-width: 720px`, the shipped mobile design is unchanged, including
  the ink top rule on the snapshot heading.

Success means the contact block reads as one composition, email remains
unmistakably primary, and no viewport, zoom, keyboard, semantic-order, or
unrelated-route regression is introduced.

## Authority and scope

Authority resolves in this order:

1. Nathan's decisions in the 2026-08-16 prototype review.
2. This amendment, once approved, for desktop/tablet composition only.
3. `docs/superpowers/specs/2026-08-15-contact-desktop-a2-amendment.md` for
   ledger geometry, tablet rhythm, mobile preservation, and all unchanged
   requirements.
4. `docs/superpowers/specs/2026-08-10-contact-page-design.md` for all locked
   content, behaviour, mobile, footer, evidence, and exclusions.
5. `app/globals.css` `:root`, then `DESIGN.md`.
6. `../../knowledge/me/visual-taste.md`.
7. `.impeccable/config.json`, then generic UI guidance.

Approval of this amendment supersedes only these parts of the A2 amendment:

- `D-01 — Email-first upper composition` (desktop two-region split);
- desktop/tablet portions of the `Design contract` that create the upper
  composition closing ink rule, the separated ledger-heading ink rule, the
  desktop right-region hairline, `fit-content(calc(528px + 1px + 1.4rem))`
  track sizing, and region-gap rules;
- desktop/tablet portions of `NFR-02` and `AC-08` that require the two
  separated ink rules;
- `FR-03` and `AC-02` desktop upper-layout assertions;
- `AC-04` tablet assertions only where they repeat the removed rail geometry;
- the 2026-08-10 specification's `Snapshot heading` ink-top-hairline
  requirement and its acceptance criterion 6, above `720px` only — reopened
  explicitly by Nathan on 2026-08-16 under the 2026-08-10 Reopening rule.

Every other requirement in the A2 amendment and the 2026-08-10 specification
remains binding.

## Context and evidence

### Observed source facts

- Production (release `20260815`, commit `3ac1023`) implements the approved
  A2 composition: base `.contact-column` carries
  `border-bottom: 1px solid var(--ink)`; base `.technical-snapshot-heading`
  carries `border-top: 1px solid var(--ink)`; `@media (min-width: 1240px)`
  converts `.contact-column` into a two-area grid (eyebrow/headline left,
  `.contact-details` right with leading hairline) and switches
  `.technical-snapshot` to the six-track weighted ledger.
- The mobile block `@media (max-width: 720px)` already sets
  `.contact-column { border-bottom: 0 }` and leaves the snapshot heading's
  ink top rule inherited from base. Mobile is therefore already borderless
  above the snapshot heading and must not change.
- Existing static and layout checks already cover Contact content, semantics,
  typography, links, footer, responsive order, overflow, and focus.

### Prototype evidence

- Prototype question: will one of three structures — Typographic statement,
  Single editorial column, or Two-column split — fix the sparse left rail,
  weak hierarchy, and disconnected zones?
- Three variants were compared at desktop ≈1440 and tablet ≈1024. Nathan
  selected **V2 — Single editorial column** for desktop and, for tablet,
  **current A2 implementation minus the rail/separator**.
- Nathan attached a screenshot during review; this model cannot read image
  input, so the text decision recorded in the prototype README verdict is
  authoritative.
- Prototype files: `prototypes/contact-desktop-rework-round2/index.html` and
  `prototypes/contact-desktop-rework-round2/README.md`.

### Evidence limits

Prototype evidence proves direction and hierarchy only. It does not prove
production spacing, font loading, semantic reading order, keyboard focus,
200% text scaling, breakpoint transitions, browser compatibility, or route
regression safety. The prototype V2 desktop snapshot already matches the
shipped A2 weighted-ledger geometry, so no group visual/DOM reordering beyond
A2's locked arrangement is introduced.

## Decisions and rationale

### D-01 — Single-flow desktop upper composition

At `min-width: 1240px`, the upper region is one vertical flow in source
order: eyebrow, headline, intro, then the email/copy action row. This removes
the sparse left rail and gives the intro its full 62ch measure. Email stays
primary without enlarging or decorating the CTA beyond the existing button
system.

The shipped hero clamp (`clamp(4rem, 6.2vw, 6.25rem)`) is retained. Nathan
compared the full-width page-scale h1 (prototype V1) against this composition
on 2026-08-16 and chose V2's shipped scale; the 6.2vw clamp was tuned for the
old two-column split, but measured in single flow after `document.fonts.ready`
it occupies 46.1% of the content measure at 1240px and 1440px, 38.7% at
1920px, on one line at `line-height: .82` — an acceptable display statement,
with V1's page-scale alternative rejected in the same comparison.

Measured at 1240px/1440px/1920px with 200% root text, both actions remain on
one row and the headline on one line, because the action group receives the
full content measure instead of A2's 528px region. These 200% figures come
from simulating the rule deletions against the shipped 20260815 export, not
from an implemented V2; AC-02 and AC-11 remain mandatory production
confirmation on the real build. A wrapping allowance is retained as a safety
clause only; preserving content and the unbroken email address outranks
single-row geometry.

### D-02 — No ink rail between contact block and snapshot (tablet + desktop)

Above the mobile breakpoint, `.contact-column` loses its ink bottom border
and `.technical-snapshot-heading` loses its ink top border. The layout gap
(`clamp(1.25rem, 2vw, 1.75rem)`) becomes the only separation, and the
snapshot heading is bounded by its neutral bottom hairline. The two zones
read as one composition. Mobile keeps its current ink top rule on the
snapshot heading, restored explicitly in the mobile override.

Nathan confirmed on 2026-08-16 that both rules go together: removing only the
`.contact-column` bottom border would move the ink rule ~20px down onto the
snapshot heading and keep the zone break, defeating the purpose. Both go, or
neither.

### D-03 — Shipped A2 ledger geometry retained

Desktop keeps the A2 weighted two-row ledger (Current Role / Studying / Path,
then Verified Power / Current Build) with explicit named placement, zero
grid gaps, 1rem inset dividers, and Verified Power's internal two-link
region. Tablet keeps the A2 rhythm (Current Role / Studying, full-width
Path, Verified Power / Current Build). No group order, content, or divider
behaviour inside the ledger changes.

### D-04 — Mobile and semantic source order remain unchanged

At `max-width: 720px`, current production layout and group order remain.
Production DOM order remains Current Role, Studying, Verified Power, Current
Build, Path at every width; the desktop/tablet visual Path placement is CSS
Grid only and does not alter focus order (A2 D-05 continues to apply).

## Functional requirements

- **FR-01 — Locked content:** unchanged (A2 FR-01).
- **FR-02 — Locked actions:** unchanged (A2 FR-02).
- **FR-03 — Desktop upper layout (supersedes A2 FR-03):** At
  `min-width: 1240px`, render eyebrow, headline, intro, and the action row
  as one vertical flow in source order spanning the Contact content width.
  At normal root text size, both actions occupy one row.
- **FR-04 — Desktop ledger:** unchanged (A2 FR-04).
- **FR-05 — Tablet upper layout:** unchanged (A2 FR-05).
- **FR-06 — Tablet ledger:** unchanged (A2 FR-06).
- **FR-07 — Mobile preservation:** unchanged (A2 FR-07).
- **FR-08 — Semantic preservation:** unchanged (A2 FR-08).
- **FR-09 — Compact footer:** unchanged (A2 FR-09).
- **FR-10 — Zone connection (new):** Above `720px`, render no ink hairline
  on `.contact-column`'s bottom edge and no ink hairline on
  `.technical-snapshot-heading`'s top edge. At `max-width: 720px`, preserve
  the current ink top hairline on `.technical-snapshot-heading`.

## Non-functional requirements

- **NFR-01 — Visual system:** unchanged (A2 NFR-01).
- **NFR-02 — Hairline integrity (supersedes A2 NFR-02):** Each shared ledger
  edge renders as one visible hairline. Add one `1px solid var(--line)`
  vertical divider between horizontally adjacent cells and suppress it on
  the first cell of every visual row. Adjacent ledger cells must not create
  doubled borders. The only ink rules in the Contact composition above
  `720px` are those required for ledger semantics; the contact block and
  snapshot heading are separated by spacing only. The mobile ink top rule
  on the snapshot heading is the shipped exception at `max-width: 720px`.
- **NFR-03 — Legibility:** unchanged (A2 NFR-03).
- **NFR-04 — Link affordance:** unchanged (A2 NFR-04).
- **NFR-05 — Responsive safety:** unchanged (A2 NFR-05).
- **NFR-06 — Reading and focus order:** unchanged (A2 NFR-06).
- **NFR-07 — Motion:** unchanged (A2 NFR-07).
- **NFR-08 — Route isolation:** unchanged (A2 NFR-08).
- **NFR-09 — Implementation economy:** unchanged (A2 NFR-09). This amendment
  is expected to delete CSS: the `min-width: 1240px` contact-column grid
  block, the two base border declarations, and the two mobile resets that
  become dead code once base drops them (`.contact-column`'s
  `border-bottom: 0; padding-bottom: 0` and `.contact-details`'
  `border-left: 0; padding-left: 0` in the `max-width: 720px` block), plus
  one added mobile declaration restoring the snapshot heading's ink top
  rule.

## Design contract

### Upper composition (supersedes A2 upper-composition rules)

- Keep existing Contact eyebrow, hero size clamp, body measure, and button
  components unless measured overflow requires a route-scoped adjustment
  (see D-01 for the retained-clamp decision).
- Base `.contact-column` has no bottom border and no extra bottom padding;
  the `.contact-layout` gap (`clamp(1.25rem, 2vw, 1.75rem)`) alone separates
  the contact block from the snapshot. This is intentionally tighter than
  the shipped `padding-bottom` + gap stack and tighter than mobile's
  `2.5rem` gap — the "one flow" reading trades spacing for connection.
- The `@media (min-width: 1240px)` block must not restyle `.contact-column`
  or `.contact-details` as a grid or add any vertical hairline, region gap,
  or track sizing. Desktop upper composition is the base flow at desktop
  hero scale.
- At normal root text size and `min-width: 1240px`, email and Copy address
  share one action row. Under text scaling, the action group may wrap; the
  email label must remain unbroken above the mobile breakpoint.
- Do not force the compact footer into the initial viewport. Natural
  document height wins over squeezed content.

### Technical Snapshot ledger

- Keep `TECHNICAL SNAPSHOT` as one structural heading row. Above `720px` the
  heading is bounded by its neutral bottom hairline only; at
  `max-width: 720px` it keeps the shipped ink top hairline and neutral
  bottom hairline.
- Keep `1rem` vertical padding per evidence group and `0.25rem` to `0.5rem`
  label/value gap.
- Ledger grids use `column-gap: 0` and `row-gap: 0`.
- Every internal divider receives `1rem` content inset on both sides. Outer
  ledger edges receive no extra horizontal inset, preserving alignment with
  the snapshot heading and page gutter.
- Desktop uses six equal tracks with explicit named placement: Current Role
  `2/6`, Studying `2/6`, Path `2/6`, Verified Power `3/6`, Current Build
  `3/6`.
- Tablet uses two tracks: Current Role `1/2`, Studying `1/2`, Path `2/2`,
  Verified Power `1/2`, Current Build `1/2`.
- Mobile uses current single-track production layout.
- Mobile override resets every ledger cell to `padding: 1rem 0`, removes all
  ledger-cell `border-left` dividers, and restores the ink top rule on the
  snapshot heading.
- Verified Power keeps two internal link tracks above `720px`; mobile keeps
  its current stacked links.
- CSS must explicitly place the heading and all five groups using stable
  named grid areas or group selectors. Divider suppression must derive from
  each group's visual grid position, not DOM adjacency such as
  `.cell + .cell`.
- CSS must not use DOM duplication, JavaScript viewport logic, absolute
  positioning, or visual transforms to place groups.

### Breakpoints

- Mobile: `max-width: 720px` — unchanged production design, including the
  snapshot heading's ink top rule.
- Tablet: base Contact layout above the mobile override and below the
  desktop override — stacked upper composition plus two-track ledger, with
  no ink rail above the snapshot heading.
- Desktop: `min-width: 1240px` — single-flow upper composition plus the
  retained weighted two-row ledger.

Do not implement tablet as paired `min-width`/`max-width` queries. Tablet is
the base Contact layout, mobile is one `max-width: 720px` override, and
desktop is one `min-width: 1240px` override. No additional Contact-specific
breakpoint is authorised unless measured implementation evidence
demonstrates an intermediate-width failure.

## Failure and edge behaviour

- Long email text must wrap only as already permitted on mobile; desktop and
  tablet controls must not overlap or escape their region.
- Immediately above `720px`, the only visual changes from the mobile
  override are the reflow into the base flow and the removal of the snapshot
  heading's ink top rule; no tap target may shrink, reorder focus, clip
  Contact content, or introduce Contact-owned horizontal overflow.
- At `1240px`, transition from tablet to desktop must only switch the ledger
  to the weighted placement; the upper composition does not change shape.
- At 200% root text scaling, layout may become taller. It must not hide or
  overlap Contact content; content visibility outranks maintaining nominal
  row shape. Pre-existing `site-nav` overflow remains a separate header
  defect and remains outside this amendment.
- Clipboard failure continues to announce existing failure feedback. This
  amendment adds no new interaction state.
- During self-hosted font loading, existing fallback stacks must not lose or
  clip content. Final geometry is assessed after `document.fonts.ready`
  because bundled `@fontsource` faces use `font-display: swap`.

## Accessibility, privacy, and safety

Unchanged from the A2 amendment: preserve semantic heading, landmark, link,
button, and live-region behaviour; preserve visible keyboard focus and
minimum target sizes; no new personal data or claims; accessibility
conformance remains subject to browser inspection; the visual Path placement
does not alter focus order and verification must prove every focusable
element's visual sequence matches DOM sequence.

## Acceptance criteria

- **AC-01 ⇒ FR-01, FR-02:** unchanged (A2 AC-01).
- **AC-02 ⇒ FR-03 (supersedes A2 AC-02):** At `1440×900` and `1240×900` with
  normal root text, computed layout shows eyebrow, headline, intro, and
  actions in one vertical source-order flow spanning the Contact content
  width; both actions share one row; Technical Snapshot begins below the
  actions. The headline remains one line at `line-height: .82`.
- **AC-03 ⇒ FR-04:** unchanged (A2 AC-03).
- **AC-04 ⇒ FR-05, FR-10 (supersedes A2 AC-04):** At `1024×768` and
  `721×900`, upper Contact content is one vertical flow in eyebrow,
  headline, intro, actions order; computed `.contact-column` border-bottom
  and `.technical-snapshot-heading` border-top are `none`. Inspect every
  `.contact-*` and `.technical-snapshot*` selector introduced or modified
  by this change; each must have tablet as its base layout, with only
  `max-width: 720px` and `min-width: 1240px` overrides.
- **AC-05 ⇒ FR-06:** unchanged (A2 AC-05).
- **AC-06 ⇒ FR-07 (amended):** At `720×900` and `390×844`, layout and group
  order match current mobile production behaviour; verified links stack and
  actions remain full width; every snapshot group computes to
  `padding: 1rem 0` with no `border-left` divider; computed
  `.technical-snapshot-heading` border-top resolves to `1px solid` in the
  computed `--ink` colour (compare resolved values, not the `var(--ink)`
  literal — `getComputedStyle` returns `rgb(36, 35, 33)`).
- **AC-07 ⇒ FR-08, NFR-06:** unchanged (A2 AC-07).
- **AC-08 ⇒ NFR-02 (supersedes A2 AC-08):** Computed borders and pixel
  inspection show one neutral vertical divider between every pair of
  horizontally adjacent ledger cells, none on the first cell of each visual
  row, one boundary rule per shared edge, no ink rule between the contact
  block and the snapshot heading at `721px` and above, and the shipped ink
  top rule on the snapshot heading at `max-width: 720px`.
- **AC-09 ⇒ NFR-03, NFR-04:** unchanged (A2 AC-09).
- **AC-10 ⇒ NFR-05:** unchanged (A2 AC-10).
- **AC-11 ⇒ NFR-05:** unchanged (A2 AC-11).
- **AC-12 ⇒ FR-09, NFR-08:** unchanged (A2 AC-12).
- **AC-13 ⇒ NFR-09:** unchanged (A2 AC-13). Additionally: the four
  `min-width: 1240px` upper-composition rules (`.contact-column`,
  `.contact-column > .eyebrow`, `.contact-column > h1`, `.contact-details`)
  are deleted, not disabled; the `.technical-snapshot` six-track placement
  and the `path` divider rule inside the same block remain intact.
- **AC-14 ⇒ NFR-01, NFR-07:** unchanged (A2 AC-14).

## Verification approach

### Static contract

Extend `scripts/portfolio-contract.mjs` only where necessary to prove FR-01,
FR-02, FR-08, FR-09, and NFR-09. Retain all existing unrelated assertions.

### Browser contract

Update Contact assertions in `scripts/layout-check.mjs` to prove the amended
AC-02, AC-04, AC-06, and AC-08. Keep the Contact-only viewport list from the
A2 amendment. Assert computed `border-bottom` / `border-top` values and
bounding-box relationships rather than screenshots.

### Commands

Run from `projects/personal-portfolio` after implementation:

```powershell
pnpm check
pnpm build
pnpm test:contract
pnpm test:layout
node --check scripts/portfolio-contract.mjs
node --check scripts/layout-check.mjs
git diff --check
git diff --stat -- app/contact/page.tsx app/globals.css scripts/portfolio-contract.mjs scripts/layout-check.mjs docs/superpowers/specs/2026-08-16-contact-desktop-round2-amendment.md
```

Then inspect `/contact` at every width in AC-10, repeat AC-11 text-scaling
checks, and complete keyboard-only focus review. Run
`npx impeccable detect <local-contact-url>` only with network approval; judge
its findings against project authority rather than treating generic findings
as mandates.

## Non-goals

- No production implementation during specification or audit.
- No mobile redesign; the mobile ink top rule on the snapshot heading is
  preserved on purpose.
- No copy, claim, project-route, metadata, or footer-content changes.
- No contact form, phone, address, availability, response promise, toolchain
  dump, badge, status marker, decorative ID, image, animation, card, shadow,
  radius, fill, terminal, or dashboard treatment.
- No font, palette, token, global breakpoint, header, navigation, default
  footer, or unrelated-route redesign.
- No package installation, dependency change, deployment, commit, push, or
  pull request.
- Do not consolidate or remove the two pre-existing Contact mobile hero
  `font-size` declarations in `app/globals.css`.

## Audit brief for next agent

Audit read-only. Do not implement or edit files.

Read completely:

1. `AGENTS.md`
2. `DESIGN.md`
3. `../../knowledge/me/visual-taste.md`
4. `docs/superpowers/specs/2026-08-10-contact-page-design.md`
5. `docs/superpowers/specs/2026-08-15-contact-desktop-a2-amendment.md`
6. this amendment
7. `prototypes/contact-desktop-rework-round2/README.md`
8. `prototypes/contact-desktop-rework-round2/index.html`
9. current Contact source, CSS, footer, and Contact contract assertions

Attack these points first:

1. Is the single-flow desktop upper composition unambiguous, and does
   removing the `min-width: 1240px` contact-column grid leave the A2 ledger
   override intact?
2. Does removing both ink rules (contact-column bottom, snapshot-heading
   top) at base actually produce the round-2 tablet look without touching
   the mobile override's inherited behaviour?
3. Does the amended AC-06 still fully pin the shipped mobile design,
   including the newly asserted ink top rule?
4. Are amended AC-02, AC-04, AC-08 measurable with computed styles and
   bounding boxes rather than brittle screenshot equality?
5. Does FR-10 conflict with any remaining A2 requirement that still
   references the two separated ink rules?

Report only concrete defects. For each finding provide severity `P0`–`P3`,
requirement or section, evidence, consequence, and one-line fix. Distinguish
specification defects from prototype limits and future implementation risks.
End with exactly one verdict:

`VERDICT: APPROVED`

or

`VERDICT: REVISE`

## Open questions

None blocking. Audit findings may reopen only the requirement they
demonstrate is unsafe, contradictory, untestable, or infeasible. Nathan
approves any behavioural or scope change after audit.
