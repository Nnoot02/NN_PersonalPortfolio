import { readFileSync } from "node:fs";
import path from "node:path";
import { DrawingTrace, type TraceStop } from "@/components/DrawingTrace";

// Last-Metre Eyes case-study hero (docs/lme-relay-animation.md, Nathan
// 2026-10-29): the relay chain with each part labelled by its evidence level,
// and the to-scale comparison that carries the entry's novelty claim. Both
// SVGs come from scripts/build-lme-relay.py; CSS shows one per width.
const relayH = readFileSync(path.join(process.cwd(), "public/images/viasat-entry/relay-h.svg"), "utf8");
const relayV = readFileSync(path.join(process.cwd(), "public/images/viasat-entry/relay-v.svg"), "utf8");

// Every claim here is already made in components/ViasatEntryWriteUp.tsx or
// the project's evidence status; the value is the evidence level.
const STOPS: TraceStop[] = [
  { id: "drone", label: "Drone", rows: [{ name: "GPS-denied search drone", value: "Real", detail: "The aircraft I am building for my GPS-denied capstone, designed to navigate without GPS using visual-inertial odometry, stereo depth and D* Lite replanning. Moving perception onboard means a map leaves the site instead of a video stream." }] },
  { id: "halow", label: "Local link", rows: [{ name: "Wi-Fi HaLow (IEEE 802.11ah)", value: "Modelled", detail: "Named as the candidate drone-to-relay bearer. The in-rubble range is modelled from published attenuation of roughly 6 to 10 dB per concrete wall at 915 MHz (QUT, 2024); it is not a measurement of this system." }] },
  { id: "relay", label: "Relay", rows: [{ name: "Perimeter relay node", value: "Concept", detail: "A one-button node at the site perimeter, where it has sky view. It takes the map, position track and detection events from the drone and backhauls them to incident command." }] },
  { id: "lband", label: "L-band backhaul", rows: [{ name: "Viasat L-band", value: "Mock in the demo", detail: "The demo ran real MAVLink traffic over a link shaped to published L-band latency and bandwidth, with the bearer labelled on screen as a mock. Nothing in the satellite segment was measured." }] },
  { id: "ic", label: "Incident command", rows: [{ name: "Entry decision", value: "Target", detail: "Time to first interior map under 15 minutes was a submitted target, not a result. The map supports the entry decision: go, no-go or cleared empty." }] },
];

function ScaleBar() {
  return (
    <div className="lme-scale">
      <p className="lme-scale-title">What leaves the site, same 32 s survey</p>
      <dl>
        <div><dt>Map · 42 kB</dt><dd><span className="lme-scale-track"><span className="lme-scale-fill" data-kind="map" /></span></dd></div>
        <div><dt>HD video · ~20 MB</dt><dd><span className="lme-scale-track"><span className="lme-scale-fill" data-kind="video" /></span><span className="lme-scale-note">about 476× the map</span></dd></div>
      </dl>
      <p className="lme-scale-caption">Drawn to scale. The 42 kB is the map from the synthetic survey in my shot 4 demo; the 20 MB is a round figure for the same 32 seconds of HD video. One survey, not a compression ratio for the field.</p>
    </div>
  );
}

export function LmeRelayFigure() {
  return (
    <div className="case-diagram lme-relay-figure">
      <DrawingTrace svg={relayH + relayV} stops={STOPS} stopsLabel="Parts of the system" afterStage={<ScaleBar />} />
    </div>
  );
}
