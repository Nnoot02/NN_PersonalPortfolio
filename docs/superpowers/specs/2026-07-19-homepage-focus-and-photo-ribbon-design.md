# Homepage Focus and Photo Ribbon Design

**Date:** 2026-07-19

**Status:** Approved design

**Audience:** Recruiters and hiring managers for South Australian power-engineering internships, including organisations such as Schneider Electric, Consolidated Power Projects Australia, and SA Power Networks

**Primary positioning:** Broad power engineering, with renewable-generation and grid-connection context

## 1. Goal

Make the homepage a short, coherent recruiter path instead of a stack of equally
important project chapters. A visitor should identify Nathan No-ot, understand
his target discipline, see his strongest completed power evidence, and reach
his resume or contact path quickly. Broader work should remain discoverable
without demanding another long scroll.

The homepage is primarily second-stage persuasion: many visitors will arrive
from a resume, LinkedIn, referral, or direct recommendation with baseline
context. It should therefore confirm fit quickly and remain memorable. It must
still work for a cold visitor who has no prior context.

Success means:

- Nathan reads as a broad power-engineering internship candidate, not only a
  solar specialist.
- Commercial LV Cabling Design is the first completed proof and the project a
  recruiter is most likely to remember.
- Renewable and grid-connection relevance remains visible through the 1 MW
  Solar Grid-Connection Assessment and honest Tindo Solar context.
- The page ends soon after completed power evidence through a compact photo
  ribbon for the UAV capstone and Workbench.
- Resume and contact remain available within two clicks.

## 2. Problem

The current homepage contains six major narrative movements:

1. Hero.
2. Tindo Solar employment strip.
3. Completed power work.
4. GPS-Denied UAV capstone.
5. Workbench previews.
6. Footer.

The first three establish professional relevance. The remaining full sections
restart the page twice with new subjects and new visual hierarchies. Nathan's
own review and visual-companion selections identified every seam after Power
Systems Work as awkward. Attention drops after the primary evidence has already
done its job.

Transition polish cannot solve this structural problem. The homepage needs
fewer chapters, not decorative bridges between them.

## 3. Design principles applied

This design applies
`knowledge/references/portfolio-ui-audit-workflow-2026.md` and
`knowledge/references/ui-ux-portfolio-design-insights-2026.md`:

- **One dominant thesis:** Nathan is a broad power-engineering candidate.
- **Readable hierarchy:** identity and target discipline precede completed
  evidence; secondary work cannot compete with that evidence.
- **Impact, detail, release:** hero, power ledger, compact exploration ribbon,
  footer.
- **One visual star:** the hero uses an authentic LV/broad-power artifact that
  supports the strongest proof.
- **Visual rhyming:** warm paper, Barlow Condensed, Inter, square geometry,
  hairlines, restrained burnt orange, and existing image treatment remain.
- **Proof before personality:** completed work stays above broader and personal
  work.
- **Reliable actions:** each preview has one destination, visible focus, useful
  alt text, and no hover-only meaning.
- **Controlled experiments:** miniature scenes are excluded from this homepage
  after visual comparison showed that they either became another large gallery
  or looked forced at compact size.

The audit workflow has informed the design and judgment stages. A fresh
deterministic and browser audit must run after implementation; mockups are not
verification evidence.

## 4. Information architecture

The approved homepage sequence is:

1. Site header.
2. Broad power-engineering hero with compact Tindo Solar credential.
3. Power Systems Work, ordered LV first and solar second.
4. Compact authentic-photo ribbon linking the UAV capstone and Workbench.
5. Ink footer with internship availability, resume, contact, and LinkedIn.

Remove these homepage sections:

- Standalone Tindo Solar strip.
- Full GPS-Denied UAV Capstone section.
- Full two-entry Workbench section.

Their destination pages remain public and unchanged except for any link or
metadata corrections required by the new homepage entry points.

## 5. Hero

### 5.1 Copy hierarchy

Use this hierarchy:

1. Eyebrow: `Electrical engineering student · Adelaide`
2. Name: `Nathan No-ot`
3. Accent rule.
4. Discipline: `Power systems · networks · renewable integration`
5. Support: `I design from standards and verify decisions with calculations—backed by Australian solar-manufacturing exposure.`
6. Compact credential: `Currently · Production Worker · Tindo Solar · Nov 2025–present`
7. Primary action: `View selected work`
8. Secondary action: `Download résumé`

The Tindo line is supporting context, not an engineering claim or a new
chapter. It must retain the accurate Production Worker title and expose no
internal production data, confidential detail, or implied design authority.

### 5.2 Hero media

Replace solar-only hero emphasis with the existing authentic LV artifact,
`/images/lv-cabling-design.webp`, which reinforces the strongest completed
evidence.

Keep hero media passive, as a `figure`, so it does not create a duplicate route
target above the power ledger. The primary button moves to completed work. The
artifact receives descriptive alt text and remains free of miniature overlays,
selectors, carousels, or animation.

## 6. Power Systems Work

Render exactly two completed projects in this order:

1. `lv-cabling-design-commercial-complex`
2. `solar-grid-connection-assessment`

Each existing `ProjectRow` remains an evidence surface with:

- Authentic project image.
- Project title and one destination link.
- Concise outcome or objective.
- Two or three evidence markers.
- Existing non-interactive case-study cue.

Use accent-rule bars, not numeric `01/02` markers. The July UI audit deliberately
removed numeric editorial markers from this system. Do not reintroduce them.

The section heading remains `Power Systems Work`. Supporting copy is:
`Completed studies showing decisions, standards, calculations, and limitations.`

## 7. Compact photo ribbon

### 7.1 Purpose

The ribbon is an exit ramp after proof, not another evidence ledger. It keeps
current work visible for interested visitors while allowing an uninterested
recruiter to reach the footer immediately.

Use:

- Eyebrow: `Beyond the ledger`
- Label: `Other systems`
- Collection action: `View all`

Render exactly two portals:

1. `GPS-Denied UAV`
   - Status: `In progress`
   - Copy: `Indoor autonomy and staged verification.`
   - Image: existing `/images/gps-denied-uav.webp`
   - Destination: `/projects/gps-denied-autonomous-uav`
2. `Workbench`
   - Status: `After hours`
   - Copy: `Builds, failures, and next iterations.`
   - Image: existing fume-extractor image from the `bench-fume-extractor`
     Workbench entry
   - Destination: `/workbench`

### 7.2 Composition

At desktop widths, use one shallow three-column ribbon:

```text
170px context column | UAV portal | Workbench portal
```

Set the desktop ribbon minimum height to 142 px. Each portal uses a
118 × 118 px square image, compact copy, and a directional cue. Columns are
hairline-separated on the shared paper surface. The ribbon must not introduce
cards, rounded corners, shadows, a large section headline, or a second dark
band.

Use the existing warm-photo treatment, including the current restrained sepia
tone, paper-deep loading surface, and square crop. Do not add aggressive filters
that obscure authentic detail.

At widths below 760 px:

- Stack the context label, UAV portal, and Workbench portal.
- Use 92 × 92 px images.
- Keep UAV before Workbench in reading and focus order.
- Avoid horizontal scrolling and doubled borders.

### 7.3 Interaction and semantics

Each portal is one link and one keyboard focus target. The image, title, copy,
and arrow belong to that single destination. Do not add nested links or a
separate image link.

Images use truthful descriptive alt text. Status and project identity remain
visible without hover. Hover may apply the existing restrained image scale;
focus must use a non-colour-only outline. Reduced-motion mode removes transform
transitions.

## 8. Component and data design

Keep `app/page.tsx` responsible for composition and required-data resolution.
Create one focused presentational component:

```text
HomepageEpilogue
├── context label and /projects collection link
├── UAV portal from Project data
└── Workbench collection portal using one approved Workbench entry image
```

Create the component at `components/HomepageEpilogue.tsx`.

Its interface should accept the resolved UAV `Project` and Workbench
`WorkbenchEntry`; it should not fetch data, own client state, or generalise into
a new card framework. The Workbench portal uses the approved entry for its
image and alt text but links to the `/workbench` collection.

`app/page.tsx` resolves:

- Project slug `gps-denied-autonomous-uav`.
- Workbench slug `bench-fume-extractor`.

Reorder `verifiedPowerSlugs` so `lv-cabling-design-commercial-complex` precedes
`solar-grid-connection-assessment`. Remove homepage mapping over
`homepageWorkbenchSlugs`; the homepage no longer previews two Workbench detail
entries.

No new dependency, client component, route, API, state store, or content schema
is required.

## 9. Data flow and failure behaviour

```text
lib/projects.ts ──────┬─> HomePage power rows
                      └─> required UAV portal data

lib/workbench.ts ───────> required Workbench image/alt data

HomePage ───────────────> HomepageEpilogue ─> static links and images
```

Required homepage content must fail closed at build time. If the UAV project or
approved Workbench entry is missing, throw a descriptive error naming the slug.
Do not silently filter missing data or render an incomplete ribbon.

The static contract must also fail when:

- Power projects are out of approved order.
- A portal destination changes or disappears.
- Portal count is not exactly two.
- The standalone Tindo, full UAV, or full Workbench homepage sections return.
- A miniature asset or miniature marker returns to the homepage.
- A portal gains multiple anchors.

There is no runtime loading or network error state because all content is local
and statically exported.

## 10. Footer

The footer follows the ribbon immediately and remains the only major ink
surface. Preserve the existing recruiter actions and machine-readable utility
paths.

Use:

- Lead: `Build power infrastructure with me.`
- Support: `Available for South Australian internships.`
- Actions: resume, contact, LinkedIn, Projects, Workbench, and quiet recruiter
  profile utility according to the existing footer hierarchy.

The footer must not repeat full project summaries or become another hero.

## 11. Accessibility and responsive requirements

- Preserve skip navigation, semantic headings, and valid heading order.
- Keep one focus stop per Power Systems row and one per ribbon portal.
- Use visible keyboard focus and touch/pressed feedback.
- Keep touch targets at least 44 × 44 px.
- Preserve accurate image alt text.
- Avoid hover-only content or instructions.
- Respect `prefers-reduced-motion`.
- Verify at 320, 375, 390, 768, 1024, 1440, and 1920 px.
- Verify 200% zoom and enlarged text.
- Prevent horizontal overflow, image clipping, layout shift, and doubled
  hairlines.
- Confirm DOM reading order matches visual order.
- Confirm resume and contact remain available within two clicks.

## 12. Verification plan

Implementation is incomplete until all of these pass:

1. `pnpm check`.
2. `pnpm build`.
3. `pnpm test:contract` with new homepage order, absence, count, destination,
   and single-link assertions.
4. `pnpm test:layout` with the existing layout gate updated for the new hero
   and ribbon.
5. `git diff --check` on implementation changes.
6. Keyboard-only homepage and mobile-navigation pass.
7. Responsive captures at 390, 768, and 1440 px, plus overflow probes at all
   required widths.
8. 200% zoom and enlarged-text pass.
9. Reduced-motion pass.
10. Link audit for hero actions, Power Systems rows, ribbon destinations,
    resume, contact, and footer.
11. Structured-data, sitemap, `/profile`, `/projects`, `/workbench`, and both
    linked detail-route smoke checks.
12. `npx impeccable detect ./out --json` and a rendered browser judgment pass,
    following the existing `find → judge → fix` workflow.
13. Thumbnail-scale comparison proving identity, LV evidence priority, and the
    footer path remain recognisable.

## 13. Scope boundaries

### In scope

- Homepage narrative reduction and reordering.
- Broad power hero copy and LV-supporting artifact.
- Tindo credential compression.
- LV-first completed evidence order.
- Compact authentic-photo ribbon.
- Homepage-specific contract, layout, accessibility, and audit updates.
- Reconciliation of homepage rules in `DESIGN.md` and affected project-local
  plans during implementation.

### Out of scope

- Miniature art on the homepage.
- New miniature production assets.
- Projects-page systems-world redesign.
- About-page miniature portrait.
- Project-detail miniature codas.
- New primary-navigation destination.
- Changes to case-study evidence or claims.
- New palette, type system, motion system, route family, dependency, or content
  management abstraction.

## 14. Deferred follow-up

Run a separate design cycle for a miniature-led Projects surface. The preferred
future direction is a systems-world index where authored miniatures act as
navigation portals and dedicated pages carry proof. About-page or project-detail
use should be considered only as part of that coherent system.

Do not scatter miniatures across unrelated pages. One deliberate miniature-led
surface can become a signature; repeated decorative use becomes a gimmick.

The generated UAV and Workbench concept images used during this brainstorming
session are disposable comparison artifacts. They are not approved production
assets and must not enter `public/` or any implementation commit.

## 15. Authority and supersession

This document supersedes homepage-specific direction in:

- `docs/superpowers/specs/2026-07-13-solar-portfolio-visual-direction-design.md`
  where it requires solar-first homepage positioning, solar-first project
  order, standalone Tindo placement, or broader-work sections.
- `docs/plans/2026-07-15-001-feat-portfolio-workbench-personality-plan.md`
  where it requires two full Workbench homepage previews or the older homepage
  section order.
- `PLAN.md` where it requires completed power work followed by full UAV and
  Workbench chapters.

Those documents remain historical authority for unaffected routes, verified
content policy, Workbench detail semantics, attribution, public-safety rules,
and existing accessibility constraints.

`knowledge/me/visual-taste.md` remains the durable personal preference source.
Its evidence-surface and teaser-surface distinction governs future miniature
work but does not require miniature use on this homepage.

## 16. Acceptance criteria

- Homepage contains four narrative movements after the header: hero, Power
  Systems Work, compact photo ribbon, footer.
- Hero identifies Nathan No-ot, Adelaide, student status, broad power focus,
  renewable context, and honest Tindo role.
- Hero media uses `/images/lv-cabling-design.webp` and contains no miniature.
- LV Cabling Design precedes the Solar Grid-Connection Assessment.
- No numeric project markers appear.
- Standalone Tindo, full UAV, and full Workbench homepage sections are absent.
- Ribbon is compact, uses authentic existing photos, contains exactly two
  single-link portals, and stacks correctly on mobile.
- Footer follows immediately after the ribbon.
- Cold visitors can identify fit, evidence, resume, and contact without opening
  secondary pages.
- Warm visitors can reach UAV and Workbench destinations through the ribbon.
- Build, contract, layout, responsive, accessibility, audit, and smoke checks
  pass with observed evidence recorded.
