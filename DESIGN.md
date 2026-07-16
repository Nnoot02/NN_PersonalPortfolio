---
version: 1.0
name: engineering-field-notes
description: >
  A warm-paper editorial interface for a solo electrical-engineering portfolio.
  The system anchors on a deep warm-paper canvas with an uppercase condensed
  industrial display face (Barlow Condensed) and a quiet humanist sans body
  (Inter). Brand voltage comes from a single burnt-orange accent used scarcely
  and structurally — bars, buttons, borders, and large display text only.
  Depth is color-block, not shadow: sharp hairline structure on paper, one dark
  ink footer, sepia-toned photography. The voice is a workshop field notebook,
  not a SaaS marketing page. Tokens below are measured from app/globals.css
  :root as of 2026-07-12 and are the authoritative source for this repo.

colors:
  accent: "#c84b1a"
  accent-dark: "#9f3510"
  paper: "#f3f0e9"
  paper-deep: "#e8e3d9"
  ink: "#242321"
  muted: "#6d6962"
  line: "#d1cbc0"
  white: "#fffdfa"
  footer-warm: "#d88868"
  footer-line: "#5d5a55"

typography:
  # Font families are declared literally (not as aliases) so tooling reads them.
  # Display = Barlow Condensed; body = Inter; code = the UA monospace stack that
  # unstyled <pre> renders in (.writeup pre carries no font-family override).
  display-family: '"Barlow Condensed", "Arial Narrow", sans-serif'
  body-family: '"Inter", Arial, sans-serif'
  code-family: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'
  hero-display:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(6rem, 11vw, 10rem)"
    fontWeight: 700
    lineHeight: 0.76
    letterSpacing: "-0.025em"
    textTransform: uppercase
  hero-display-mobile:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(5.4rem, 27vw, 8rem)"
    fontWeight: 700
    lineHeight: 0.76
    textTransform: uppercase
  page-hero-display:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(4.6rem, 9vw, 9rem)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "-0.02em"
    textTransform: uppercase
  section-heading:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(2.4rem, 4vw, 4rem)"
    fontWeight: 600
    lineHeight: 0.95
    textTransform: uppercase
  section-heading-sm:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(2rem, 3.2vw, 3.2rem)"
    fontWeight: 600
    lineHeight: 0.95
    textTransform: uppercase
  project-title:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(2rem, 3.5vw, 3.2rem)"
    fontWeight: 600
    lineHeight: 0.95
    textTransform: uppercase
  writeup-block-heading:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)"
    fontWeight: 600
    lineHeight: 1
    textTransform: uppercase
  footer-title:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(2rem, 4vw, 3.8rem)"
    fontWeight: 600
    lineHeight: 1.1
    textTransform: uppercase
  hero-role:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "clamp(1.25rem, 2.2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
    textTransform: uppercase
  project-number:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "2.6rem"
    fontWeight: 600
    lineHeight: 1
  project-number-mobile:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "2.2rem"
    fontWeight: 600
    lineHeight: 1
  principle-title:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
    textTransform: uppercase
  principle-marker:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1
  eyebrow:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
    textTransform: uppercase
  footer-kicker:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.15em"
    textTransform: uppercase
  meta-label:
    fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.68rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.13em"
    textTransform: uppercase
  nav-link:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.95rem"
    fontWeight: 400
  button:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.86rem"
    fontWeight: 600
    letterSpacing: "0.06em"
    textTransform: uppercase
  case-lede:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "clamp(1rem, 1.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.65
  prose:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.8
  principle-body:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.6
  meta-value:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.45
  table:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.84rem"
    fontWeight: 400
  code:
    fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.65
  scroll-cue:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.74rem"
    fontWeight: 400
    letterSpacing: "0.12em"
    textTransform: uppercase
  tag:
    fontFamily: '"Inter", Arial, sans-serif'
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.08em"
    textTransform: uppercase

rounded:
  none: 0
  pill: 999px

motifs:
  accent-rule: "34px × 3px accent bar"
  photography-tone: "filter: sepia(0.08)"
  hairline: "1px solid {colors.line}"

layout:
  page-inset: "6vw (1.25rem at ≤720px)"
  section-padding: "clamp(5rem, 8vw, 8rem) vertical"
  body-measure-max: "62ch"

components:
  button-primary:
    background: "{colors.accent}"
    borderColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    minHeight: 50px
    padding: "0 1.5rem"
    rounded: "{rounded.none}"
    activeBackground: "{colors.accent-dark}"
  button-secondary:
    background: transparent
    borderColor: "{colors.ink}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    minHeight: 50px
    rounded: "{rounded.none}"
    hoverBackground: "{colors.ink}"
    hoverTextColor: "{colors.white}"
  accent-rule:
    background: "{colors.accent}"
    width: 34px
    height: 3px
  project-row:
    background: "{colors.paper}"
    borderTop: "{motifs.hairline}"
    borderBottom: "{motifs.hairline}"
    imageBackground: "{colors.paper-deep}"
    rounded: "{rounded.none}"
  case-status-pill:
    background: transparent
    borderColor: "{colors.accent}"
    textColor: "{colors.accent-dark}"
    typography: "{typography.meta-label}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.85rem"
  tag:
    background: transparent
    borderColor: "{colors.line}"
    textColor: "{colors.muted}"
    typography: "{typography.tag}"
    rounded: "{rounded.none}"
  site-header:
    background: "rgba(243, 240, 233, 0.96)"
    borderBottom: "{motifs.hairline}"
    minHeight: 76px
    sticky: true
  site-footer:
    background: "{colors.ink}"
    textColor: "{colors.white}"
    kickerColor: "{colors.footer-warm}"
    linkBorderColor: "{colors.footer-line}"
    minHeight: 250px
---

## Overview

This is an electrical-engineering portfolio built as a warm **field notebook**,
not a SaaS marketing page. The base atmosphere is a **deep warm paper canvas**
(`{colors.paper}` — #f3f0e9) — warmer and deeper than the tinted-cream most
warm-canvas systems settle on — carrying dark warm-ink text (`{colors.ink}` —
#242321). Photography is toned to match with a light `sepia(0.08)` filter so no
image reads cooler than the paper.

Brand voltage comes from a single **burnt-orange accent** (`{colors.accent}` —
#c84b1a), used scarcely and *structurally*: the 34×3px accent-rule bar, button
fills, 1px borders, arrows, and large uppercase display headlines. It is a
higher-voltage, more industrial accent than the muted corals of literary
brands — appropriate for a portfolio that should read as a workshop, not a
publisher. Where the same orange would appear on small text it steps down to
`{colors.accent-dark}` (#9f3510) for legibility (see Colors).

The type voice is the differentiator: **Barlow Condensed**, always uppercase,
tightly set, for every display headline and label, paired with **Inter** as
quiet body infrastructure. Condensed industrial caps over humanist body reads
as engineering drawings and field notes — the opposite of a serif literary
voice or a geometric-sans product voice.

The system has two surface modes:

1. **Paper canvas** (`{colors.paper}`) — the default floor for every page.
2. **Ink footer** (`{colors.ink}`) — the single dark surface, closing every
   page, where the accent warms to `{colors.footer-warm}` (#d88868).

There is a third quiet surface, **paper-deep** (`{colors.paper-deep}` —
#e8e3d9), used only as an image/placeholder backing and code-block background —
one elevation step down from paper, never a full band.

**Key characteristics:**

- Warm paper canvas with warm-ink text — the deliberate brand palette, backed
  by system support (sepia photography, warm `{colors.line}` hairlines, a
  `{colors.paper-deep}` secondary tone, an ink footer), not a reflex default.
- A single burnt-orange accent used structurally and scarcely. Never sprinkled
  as decoration; it earns its place on bars, buttons, borders, and big type.
- Uppercase Barlow Condensed display over Inter body. The condensed industrial
  caps are the identity; Inter is intentionally invisible.
- **Square corners.** There is effectively no border-radius in the system — the
  one exception is the `{component.case-status-pill}`. Sharpness is part of the
  drafting-table character.
- **Color-block depth, not shadow.** The only shadow in the system is on the
  open mobile menu sheet, where it must separate from the shared paper floor.
- The **accent-rule bar** (34×3px) is the signature motif and the *replacement*
  for numbered section markers, which are banned (see Do's and Don'ts).

## Colors

### Accent

- **Accent / Burnt orange** (`{colors.accent}` — #c84b1a): The signature.
  Used on the accent-rule bar, `{component.button-primary}` fill, 1px accent
  borders (`{component.case-status-pill}` outline), row arrows, and **large**
  uppercase display text (hero role, project titles). Measured contrast on
  paper is **4.12:1** — this clears AA for large text and non-text UI (3:1) but
  **not** small text (4.5:1). Keep it off anything under large-text size.
- **Accent-dark** (`{colors.accent-dark}` — #9f3510): The small-text accent.
  Measured **6.17:1** on paper and **5.49:1** on paper-deep — both clear AA for
  small text. Every small accent-colored string uses this: `.eyebrow`,
  `.text-link`, `.row-action`, `.project-number.is-featured`, `.case-status`
  text.

### Surface

- **Paper** (`{colors.paper}` — #f3f0e9): The default page floor. The sticky
  header sits on the same paper at 96% alpha (`rgba(243, 240, 233, 0.96)`).
- **Paper-deep** (`{colors.paper-deep}` — #e8e3d9): One step down. Backs
  images/placeholders (`.project-image`, `.case-image`) and code blocks
  (`.writeup pre`). Never used as a full-width band.
- **Ink** (`{colors.ink}` — #242321): The footer surface and all primary text
  on paper. Warm near-black.
- **Line** (`{colors.line}` — #d1cbc0): The 1px hairline tone that carries
  almost all structure — header/section/row/meta dividers and tag borders. The
  system is built from hairlines, so this token is load-bearing.

### Text

- **Ink** (`{colors.ink}`): Headlines and primary body text on paper.
- **Muted** (`{colors.muted}` — #6d6962): Secondary/supporting copy — section
  intros, project descriptions, meta values, prose. Measured **4.80:1** on
  paper (clears AA small text).
- **White** (`{colors.white}` — #fffdfa): Text on accent buttons and on the ink
  footer. A warm off-white, not pure #ffffff, to sit inside the warm palette.

### On the ink footer

- **Footer-warm** (`{colors.footer-warm}` — #d88868): The footer kicker and the
  hover tone for footer link boxes. Measured **5.71:1** on ink (clears AA small
  text). This is the *only* place the accent brightens rather than darkens —
  on the dark surface a warmer, lighter orange is the legible move.
- **Footer-line** (`{colors.footer-line}` — #5d5a55): The 1px border on footer
  link boxes, the ink-surface analogue of `{colors.line}`.

## Typography

### Families

Two faces, no third. **Barlow Condensed** (`{typography.display-family}`) is
the display and label face — every headline, eyebrow, meta label, button, and
tag. It is used at weight 600 almost everywhere, 700 only for the wordmark and
the home hero h1, and **always uppercase**. **Inter**
(`{typography.body-family}`) is the body face — running copy, summaries, prose —
at weight 400 (600 for inline emphasis and `.text-link`). Inter is never set in
display roles; Barlow Condensed is never set as body copy.

### Scale

| Role | Family | Size | Weight | Line height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Home hero h1 | Barlow Condensed | clamp(6rem, 11vw, 10rem) | 700 | 0.76 | -0.025em | Uppercase. The one place lh drops this tight; single-line only. |
| Page/case h1 | Barlow Condensed | clamp(4.6rem, 9vw, 9rem) | 600 | 0.82 | -0.02em | Uppercase. |
| Section heading h2 | Barlow Condensed | clamp(2.4rem, 4vw, 4rem) | 600 | 0.95 | — | Uppercase. |
| Project title | Barlow Condensed | clamp(2rem, 3.5vw, 3.2rem) | 600 | 0.95 | — | Uppercase. |
| Footer title | Barlow Condensed | clamp(2rem, 4vw, 3.8rem) | 600 | 1.1 | — | Uppercase; **wraps to 2 lines, so lh ≥ 1.1** (never 1.0). |
| Hero role | Barlow Condensed | clamp(1.25rem, 2.2vw, 2rem) | 600 | 1 | 0.08em | Uppercase, accent-colored (large → #c84b1a OK). |
| Eyebrow | Barlow Condensed | 0.78rem | 600 | 1.2 | 0.18em | Uppercase, **accent-dark**. Must carry information. |
| Meta label (dt) | Barlow Condensed | 0.68rem | 600 | 1.2 | 0.13em | Uppercase. |
| Button | Inter | 0.86rem | 600 | — | 0.06em | Uppercase. |
| Body / summary | Inter | clamp(1rem, 1.4vw, 1.25rem) | 400 | 1.65 | — | Sentence case. |
| Prose (about/contact) | Inter | 1.05rem | 400 | 1.8 | — | Sentence case. |
| Tag | Inter | 0.72rem | 400 | — | 0.08em | Uppercase (short label). |

### Principles

- **Display line-height runs tight on purpose.** Single-line display may go as
  low as 0.76. Any display that *wraps* must sit at ≥ 1.1 (the footer title is
  the reference case). Never ship a wrapping headline at lh 1.0.
- **Body line-height stays open**, 1.55–1.8, for readability at the warm
  contrast levels.
- **Body measure is capped at ~62ch** (`{layout.body-measure-max}`). Section
  intros, prose, and project descriptions carry an explicit `max-width` in `ch`
  so lines never run to ~90ch on wide containers.
- **Uppercase is for labels and display headings only — never body copy.**
  Tracked caps on a sentence is a readability drag; keep uppercase strings
  short (labels ≤ ~30ch; the footer kicker precedent is "Available for graduate
  roles").

## Layout

### Inset & rhythm

- **Horizontal page inset** is `6vw` on desktop, tightening to `1.25rem` at
  ≤ 720px. Everything hangs off this consistent gutter.
- **Section padding** is `clamp(5rem, 8vw, 8rem)` vertical — a generous
  editorial rhythm that scales with viewport.
- **Grids are explicit and asymmetric.** The hero is a 46%/54% split
  (copy/image). Project rows are a 4-track grid
  (`54px minmax(260px,34%) minmax(320px,1fr) 42px`: marker, meta, copy, arrow).
  Principles and case sections are 3- and 2-up hairline-divided grids.

### Structure from hairlines

The layout is drawn with 1px `{colors.line}` rules rather than boxes or cards:
header bottom border, section top/bottom borders, row dividers, meta-column
dividers (vertical `border-right`), and tag outlines. This hairline lattice —
not shadow or fill — is what gives the site its drafting-table structure.

## Elevation & Depth

Depth is **color-block first, shadow essentially never.**

| Level | Treatment | Use |
|---|---|---|
| Flat on paper | No border, no shadow | Hero copy, section bodies, most content |
| Hairline | 1px `{colors.line}` | Header, section, row, meta, tag structure |
| Paper-deep backing | `{colors.paper-deep}` fill | Image placeholders, code blocks |
| Ink surface | `{colors.ink}` fill | Footer only — the single dark band |
| Shadow (rare) | `0 14px 26px rgba(36,35,33,0.18)` | **Only** the open mobile menu sheet |

The one shadow exists because the open mobile nav shares the paper background
with the page beneath it and needs to read as a separate surface. Nothing else
in the system casts a shadow. Contrast between paper, paper-deep, and the ink
footer carries all other depth.

## Shapes

- **Border-radius is 0 across the system.** Buttons, images, tags, meta boxes,
  and the footer link boxes are all square. Sharp corners are part of the
  industrial character.
- **The single exception** is the `{component.case-status-pill}`
  (`rounded: {rounded.pill}` — 999px): a small outlined status pill under a
  case-study h1. It is deliberately the one rounded element, which is what makes
  it read as a status token rather than structure.

### Photography

Images (hero, project, case) are cropped `object-fit: cover` and toned with
`filter: sepia(0.08)` so they never introduce a color cooler than the paper.
Project images scale to 1.025 on hover; motion respects
`prefers-reduced-motion`. Backing color under any loading/placeholder image is
`{colors.paper-deep}`.

## Components

### Header & nav

**`site-header`** — Sticky bar, `min-height: 76px`, paper at 96% alpha
(`rgba(243, 240, 233, 0.96)`), 1px `{colors.line}` bottom border. Carries the
Barlow Condensed wordmark (700, the "." in accent) at left and horizontal nav
at right. Nav links get a 2px transparent bottom border that turns accent on
hover / focus / active. Collapses to a hamburger sheet at ≤ 720px.

Wordmark route matrix: homepage uses `NN.` at every width so it does not
duplicate the full name in the hero; non-home pages use `Nathan No-ot` on
desktop and `NN.` at 720px or narrower. In both `NN.` variants, only the period
uses `{colors.accent}`. Keep the link's accessible label based on Nathan's full
name.

### Buttons

**`button-primary`** — Accent-filled CTA. Background + border `{colors.accent}`,
text `{colors.white}`, `{typography.button}` (Inter 600 uppercase, 0.06em),
`min-height: 50px`, square. Hover/focus darkens to `{colors.accent-dark}` and
lifts `translateY(-2px)`.

**`button-secondary`** — Outlined CTA. Transparent fill, 1px `{colors.ink}`
border, ink text. Hover/focus inverts to ink fill + white text. Same height,
square.

### The accent-rule

**`accent-rule`** — A 34×3px `{colors.accent}` bar. The system's signature
motif: it opens the hero, marks non-featured project rows (as
`.project-number-rule`), and heads each home principle. **It replaces numbered
section markers** — see Do's and Don'ts.

### Project rows

**`project-row`** — The core index unit. A hairline-bounded 4-track grid:
accent-rule marker · meta column · copy column (`{typography.project-title}` +
muted description capped ~58ch) · a 42px accent row-arrow that nudges +3px and
darkens to accent-dark on hover. Image cell is `{colors.paper-deep}`-backed,
square, `sepia(0.08)`. Featured rows swap the accent-rule marker for a small
uppercase "Featured" label in `{colors.accent-dark}`.

### Meta & tags

**`project-meta` / `case-meta`** — Definition lists in a 3-up grid, columns
divided by vertical `{colors.line}` rules. `dt` is `{typography.meta-label}`
(Barlow Condensed 0.68rem uppercase, 0.13em); `dd` is muted 0.78rem.

**`tag`** — Square outlined chip, 1px `{colors.line}` border, muted text,
`{typography.tag}` (Inter 0.72rem uppercase). Never filled.

### Case-study status pill

**`case-status-pill`** — The one rounded element. Transparent fill, 1px
`{colors.accent}` outline, `{colors.accent-dark}` text,
`{typography.meta-label}`, `rounded: {rounded.pill}`. Sits directly beneath a
case-study h1 as a verification/status token (e.g. "Evidence verified —
sanitized write-up").

### Principles

**`principles`** — A 3-up hairline-divided band (top + bottom `{colors.line}`,
vertical dividers between). Each cell: an accent-rule, a Barlow Condensed
uppercase h3, and a muted 0.88rem description.

### Footer

**`site-footer`** — The single ink band closing every page. Background
`{colors.ink}`, text `{colors.white}`, `min-height: 250px`. Kicker in
`{colors.footer-warm}` (short, e.g. "Available for graduate roles"); large
`{typography.footer-title}`; link boxes with 1px `{colors.footer-line}` borders
(≥ 46px targets) that turn `{colors.footer-warm}` on hover. `flex-wrap` so
links wrap rather than clip on narrow screens.

## Do's and Don'ts

### Do

- Anchor every page on `{colors.paper}`. The warm paper is the brand — it has
  system support (sepia imagery, warm hairlines, paper-deep, ink footer), so
  treat it as deliberate, not swappable.
- Keep the accent **scarce and structural**: accent-rule, button fills, 1px
  borders, arrows, large display. Use `{colors.accent-dark}` for any accent
  string at small-text size (contrast, see Colors).
- Set every display headline in uppercase Barlow Condensed; keep Inter for
  body. The condensed-caps / humanist-body split is the identity.
- Use the **accent-rule bar** as the section/row marker.
- Cap body measure at ~62ch and keep body line-height 1.55–1.8.
- Keep corners square; reserve the pill radius for the case-status token only.
- Make eyebrows carry information (breadcrumb-style location/role/availability).

### Don't

- Don't reach for cool grays or pure white as the canvas, and don't retone
  photography cooler than the paper.
- Don't paint the burnt-orange accent as decoration or use `{colors.accent}`
  on small text — step down to `{colors.accent-dark}`.
- **Don't use numbered section markers (01–04).** They are a banned editorial
  tell; the accent-rule replaces them.
- Don't set body copy in uppercase, and don't force a sentence into tracked
  caps — keep uppercase strings to short labels (≤ ~30ch).
- Don't ship empty eyebrows that merely restate the page title/role.
- Don't add card fills, rounded corners, or drop shadows to create depth — use
  hairlines and the paper/ink surface contrast instead.
- Don't set a wrapping display headline at line-height 1.0 (footer-title lesson;
  multi-line display ≥ 1.1).
- Keep body copy to **≤ 2 em-dashes per page.**
- Don't set Inter as a display face or Barlow Condensed as body.

### Deferred personality layer: miniature evidence windows

Status: deferred as of 2026-07-14. Current public UI contains no miniature
content. The existing solar miniature asset remains dormant for possible future
exploration; any reintroduction requires a new design session before code work.

- Selected personality direction: **curious systems world-builder**. Use an
  occasional, project-specific isometric low-resolution miniature engineering
  scene inside an evidence-image frame.
- Pair every miniature with its related authentic engineering artifact, diagram,
  or calculation. The real artifact remains primary evidence; the miniature is
  interpretive context, never proof or a replacement for evidence.
- Contain dither or pixel texture inside that illustration frame only. Keep the
  surrounding paper, typography, navigation, rules, and controls in the
  approved field-notes system.
- Preserve Barlow Condensed, Inter, square geometry, hairlines, and restrained
  orange. Do not use pixel fonts, CRT effects, game HUD chrome, fake technical
  decoration, site-wide dithering, or auto-rotating content.
- Treat miniature scenes as authored, static illustrations. If meaningful,
  alt text must identify them as illustrative; do not imply measured or
  verified engineering content.

## Responsive Behavior

### Breakpoints

| Width | Key changes |
|---|---|
| ≤ 960px | Hero collapses 2-col → 1-col (image below copy); scroll cue hidden; project rows drop the arrow track; project meta stacks 1-up; profile/case grids go single-column. |
| ≤ 720px | Header inset tightens to 1.25rem; nav collapses to a hamburger **sheet** (the one shadowed surface) that closes on link activation and on Escape (focus returns to the menu button); hero h1 clamps to `clamp(5.4rem, 27vw, 8rem)`; buttons go full-width; project rows reflow to marker+image over full-width copy; principles stack; footer stacks. |

### Touch targets

Buttons are `min-height: 50px`; footer link boxes and the mobile menu button
are ≥ 46px. Footer links use `min-height` + `flex-wrap` + `white-space: nowrap`
so they keep natural width and wrap to a new row rather than clipping.

### Motion

Image hover scale and button lift are the only transitions; all are disabled
under `prefers-reduced-motion: reduce`, which also switches
`scroll-behavior` to auto.

## Notes

- **Token truth is `app/globals.css` :root.** This file documents the measured
  system as of 2026-07-12; if the two ever disagree, `globals.css` wins and this
  file should be re-synced.
- **Process rules live elsewhere.** `design-qa.md` (QA checklist) and
  `PRE-PUBLISH-GATE.md` remain authoritative for process; this file is
  authoritative only for tokens and visual rules. No process policy is copied
  here.
- **Contrast figures** are the measured values from the 2026-07-12 UI audit
  (`audits/ui-audit-2026-07-12/audit-notes.md`): accent on paper 4.12:1,
  accent-dark on paper 6.17:1, accent-dark on paper-deep 5.49:1, muted on paper
  4.80:1, footer-warm on ink 5.71:1.
- **Waivers** (`overused-font: Inter`, `cream-palette`, `hero-eyebrow-chip`,
  `all-caps-body`) are codified in `.impeccable/config.json`. This file explains
  *why* they hold (deliberate palette, deliberate type pairing, informative
  eyebrows, label/display-only caps); it does not re-litigate them.

### Workbench pattern

Workbench uses compact editorial build records, not cards: paper surface,
hairline dividers, square image frames, and one stretched title link per
preview. Build type appears before title; non-original builds show text-only
source credit so each preview still has one destination. Homepage shows two
previews in a two-column region that stacks below 960px; Workbench stays out of
primary navigation.

Detail pages place attribution near the heading, then show motivation,
contribution, constraint, observed outcome, shortfall, and next iteration
before owned evidence. Workbench photos use existing `cover` treatment; the
technical hero artifact remains the deliberate `contain` exception. Footer
keeps Workbench as a normal action and Recruiter / AI brief as a quiet utility.
