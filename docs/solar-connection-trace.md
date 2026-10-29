# Solar connection trace — spec

Status: decisions settled by Nathan 2026-10-29: D1 no study-note stop, D2 BESS static but selectable, D3 generalise into DrawingTrace. Source: Codex audit
2026-10-29, motion table, "Solar grid connection" row: trace PV → inverter →
connection point → grid, with selectable LV/HV views.

## Goal

The single-line concept shows the assessment's finding: power leaves the
array, is inverted, meets the network at the point of common coupling (PCC),
and has two ways up to the grid. A reader can compare the two options side by
side (LV at about 1443 A against HV at about 52 A or 17 A) and read why the
choice belongs to the network study.

## Behaviour (same pattern as the LV route trace)

1. **Trace:** the first time the diagram is half visible, it draws once along the power
   flow, in about 2 s:
   1. PV → inverter
   2. inverter → PCC
   3. out along the PCC bus
   4. both options rise to the grid bus together.

   The LV and HV paths are the same length on the drawing, so they reach the grid
   bus at the same moment. Neither is presented as the winner.
2. **Stops:** a row of buttons under the drawing. Choosing a stop opens its
   detail and fades the other stops to 30 %. Choosing LV dims the HV branch and
   the reverse, which is the comparison.
3. **Replay** link. Under reduced motion, without JS and in print, the drawing
   is complete from the start; without JS every detail is shown.
4. **Unchanged:** the homepage row, the /projects thumbnail and the 800w image,
   which are rasters. Only the case-study hero becomes the inline SVG.

## Stops and their text

The text is quoted or condensed from `components/PvConnectionWriteUp.tsx`. The capacity
values move to `lib/solar-design-basis.ts`, where both the write-up table and the
stops read them, the same way as `lib/lv-design-basis.ts`.

| Stop | Value | Detail (source) |
|---|---|---|
| PV array | ≈1.2 MWp DC | capacity table |
| Inverter | 1.0 MW AC · 400 V · AS/NZS 4777.2 | capacity table + power-quality block (reactive power, ride-through vs anti-islanding) |
| Point of common coupling | Export ≤1.0 MW · TS134 | capacity table (export limit) + connection-voltage block (switchgear, protection, SCADA) |
| LV option | 400 V · ~1443 A · TS132 | connection-voltage block |
| HV option | 11 / 33 kV · ~52 / ~17 A · TS133 | connection-voltage block |
| BESS (optional) | AS/NZS 5139 · NICC271 | storage block |

## Implementation

- `public/images/solar-grid-connection.svg` (hand-authored) gains
  `<g data-stop>` wrappers and four reveal masks (`solReveal1`–`4`) with solid
  `pathLength="1"` copies drawn in the direction of power flow. Without page
  CSS the copies are solid, so the file renders exactly as before. That is
  proven by a pixel diff of the old and new renders, after which only the
  SVG's hash in the contract changes and the three rasters are left
  untouched.
- `components/LvInstallationTrace.tsx` becomes a generic
  `components/DrawingTrace.tsx` (props: svg, stops, labels). Class names
  `lv-trace-*` become `drawing-trace-*`. Dimming moves from per-stop CSS
  rules to a `data-on` attribute that the component sets on the active
  group, so any drawing works without new CSS. The LV tests are updated to
  match.
- The solar case study renders the inline SVG through `DrawingTrace` in place
  of `.case-image`, keeping the "Open the full-size diagram" link.

## Tests

The LV set, applied to solar:
- **Contract:** the stop groups and their order; every reveal copy has `pathLength` and
  its mask; the server-rendered trace is idle; the no-JS details are present; the stop
  values match the write-up table, from one source.
- **Motion check:** the trace finishes within 3 s; every reveal animates; the stops are
  44 px; the LV stop dims the HV branch; Escape restores focus; reduced motion shows
  the drawing complete.
- **Pixel diff:** the old and new SVG renders are identical.

## Decisions (Nathan, 2026-10-29)

- **D1:** no stop for the network-study note; six stops.
- **D2:** BESS is not traced; it stays dashed and static but is still a stop.
- **D3:** generalise `LvInstallationTrace` into `DrawingTrace`.
