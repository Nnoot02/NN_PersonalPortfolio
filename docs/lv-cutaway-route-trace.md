# LV cutaway route trace — spec

Status: decisions settled by Nathan 2026-10-29 (D1 case study only, D2 one-line stays default with the tab relabelled, D3/D4 five stops). Source: Codex audit 2026-10-29,
motion section, "LV cabling" row. No code until the open decisions are settled.

## Goal

The installation cutaway shows where the power goes, from the padmount kiosk
through the buried consumer mains to the MSB, then through the three submains
to the tenancy boards. A reader can stop at any point on the route and read the
design decision made there, the same basis the one-line hero already gives.

Success means a hiring reader can follow supply → board in one pass, and every
number they read matches the one-line view, because both come from one source.

## Behaviour

1. **Trace.** When the installation drawing first becomes visible, the route
   draws once in order: kiosk risers, the 15 m buried mains, MSB entry, then
   the three submains together. About 2.4 s in total, no loop. The rest of the
   drawing (slab, soil, labels) is static from the start.
2. **Stops.** After the trace, five stops become selectable: Supply (kiosk),
   Consumer mains (buried run), Main switchboard, Submains (one stop, three
   rows), Trench section A. Selecting a stop highlights its part of the route
   in accent and opens a detail panel with the value and its design basis.
3. **Replay.** One text button, "Replay route", under the drawing. It is
   hidden under reduced motion, where there is nothing to replay.
4. **Reduced motion.** The route is drawn from the start and the stops still
   work. Highlighting changes colour only, with no movement.
5. **No JS.** A static drawing plus a plain list of the five stops with their
   values. The same restoration pattern as the hero legend's `<noscript>`.

## Placement

Only on the LV case study, in the "Installation" tab of `LvDesignViews`. The
homepage keeps the static cutaway thumbnail, because the hero already plays the
one-line plot and two plot animations on one page compete (decision D1).

## Single source for the text

Move `TARGETS` out of `components/FeaturedSldInteractive.tsx` into
`lib/lv-design-basis.ts`. Both the hero and the cutaway read from it. Add one
new entry for Trench section A (bedding, sand surround, marker tape,
conduit grouping; layer depths stay marked indicative).

## Implementation (as built)

- `scripts/build-lv-installation.py` wraps each stop in `<g data-stop>` and
  gives every route polyline a trace step (1 kiosk risers, 2 buried mains,
  3 MSB entry, 4 submains, 5 risers into the boards). Each step has its own
  `<mask id="instReveal{n}">` holding solid copies of its routes with
  `pathLength="1"`. CSS draws the copies on, which reveals the dashed
  originals with their dashes intact. The hero's dasharray trick would have
  erased the dashes. Masks are per step because a shared mask reveals a later
  route wherever it crosses an earlier one. Without the page CSS (the
  full-size `<img>`, the homepage thumbnail) the copies are solid and the
  route shows in full.
- `components/LvInstallationTrace.tsx` arms the trace only under no-preference
  motion and plays it when the stage is half visible, which happens when its
  tab is chosen. It reuses the hero's `plot` keyframe; the timing comes from
  `--motion-trace` (520 ms) and `--motion-trace-step` (480 ms).
- Stops are a row of buttons under the drawing, labelled with the drawing's
  own callouts (01, 02, 03, A). This replaces the overlaid hit areas in the
  draft: on a phone the drawing is about 350 px wide, so 44 px overlays would
  cover it. A chosen stop keeps its group at full strength and the rest drop
  to 30 % opacity.
- The text comes from `lib/lv-design-basis.ts`, shared with the hero legend.
- Print and no-JS: the route is drawn, the stop row is hidden, and every
  detail is shown.

## Tests

- **Contract:**
  - every route polyline has `pathLength`;
  - there are five `data-stop` groups;
  - the hero and the cutaway text come from one module (grep: no duplicated
    detail strings);
  - the no-JS list is present.
- **Motion check:**
  - reduced motion: the route is fully drawn at load (dashoffset 0) and Replay is
    absent;
  - no-preference: the trace finishes within 2.6 s;
  - the stops are keyboard-reachable, at least 44 px, and toggle `aria-expanded`.
- **Layout:** the 305 route/viewport combinations stay green; no overflow at
  320 px or at 200 % text.

## Size

One PR. Roughly: the generator +30 lines, a new component ~120, the shared lib
move ~0 net, CSS ~25, tests ~60.

## Decisions (Nathan, 2026-10-29)

- **D1 Placement:** case study only. The homepage thumbnail stays static.
- **D2 Default tab:** the one-line view stays the default; the second tab reads
  "Installation · route".
- **D3 Submains:** one stop with three rows.
- **D4 Trench:** included as stop 5.
