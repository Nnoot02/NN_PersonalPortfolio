# Last-Metre Eyes relay animation — spec

Status: built. Decisions by Nathan on 2026-10-29, after the interactive mock-up:
- **Placement:** it replaces the hero.
- **Scale bar:** kept.
- **Evidence styling:** solid and dashed lines.

Source: the Codex audit of 2026-10-29, motion table, row "Last-Metre Eyes".

## Goal

Make the entry's novelty claim visible. With autonomy onboard, a 42 kB
occupancy map leaves the site instead of about 20 MB of video, and that fits
through narrowband L-band. Show the evidence level of every part of the chain.

## Behaviour

- **Timing.** The animation plays once, when the figure is half visible (about 4.1 s):
  - 0 to 1.4 s: the drone surveys the structure and the map cells fill in.
  - 1.5 s: a "42 kB" packet leaves the drone and hops to the relay, then the satellite, then incident command.
  - 3.2 s: the map appears on the incident command (IC) screen.
  - 3.6 s: "Go · no-go · cleared" appears.
  - The scale bars draw in as the packet arrives.
- **Stops.** There are five: Drone, Local link, Relay, L-band backhaul and Incident command. Each one opens its evidence level (Real, Modelled, Concept, Mock in the demo, Target) and fades the rest of the chain.
- **Evidence styling:**
  - solid: real (the drone);
  - dashed (7 6): modelled (Wi-Fi HaLow);
  - dotted (2 5): a mock in the demo (L-band).
- **Scale bar.** It compares the 42 kB map with the ~20 MB video, drawn to scale. The map bar has a 3 px minimum. The caveat from the write-up appears below it.
- **Fallbacks.** Under reduced motion, with no JS, in print and in the full-size `<img>`, the figure shows its finished state.
- **Phones.** At 640 px and below, the chain runs vertically.
- **Journey card.** The user-journey card, which used to be the hero, now sits in the write-up's "Two segments" block.

## Implementation

- `scripts/build-lme-relay.py` generates `public/images/viasat-entry/relay-h.svg` and
  `relay-v.svg`. Each SVG carries its own keyframes, computed from the path
  geometry, keyed on `DrawingTrace`'s `data-trace` states.
- `components/LmeRelayFigure.tsx` inlines both SVGs through `DrawingTrace`, and
  passes the scale bar in through the new `afterStage` prop.
- Every stop claim is already made in `components/ViasatEntryWriteUp.tsx` or
  in the project's evidence status.

## Tests

- **Contract:**
  - the figure leads the page;
  - it ships idle;
  - both drawings are present;
  - stop groups and stops are in chain order;
  - the HaLow link is dashed and the L-band link is dotted, in both drawings;
  - all five evidence labels appear;
  - the scale bar shows both figures and the caveat;
  - there is no "navigates without GPS" claim.
- **Motion check:**
  - every map cell animates;
  - the packet is hidden until 1.5 s, visible in transit and gone after delivery;
  - stops are at least 44 px;
  - selecting a stop fades the others;
  - under reduced motion it is idle, phones get the vertical drawing, and the map shows complete.
- **Mutation tests.** A solid HaLow line fails the contract. The packet's old `both` fill fails the motion check.
