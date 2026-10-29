import type { TraceStop } from "@/components/DrawingTrace";

// Basis for the 1 MW solar connection assessment, read by the write-up's
// capacity table and by the single-line concept's stops (DrawingTrace), so a
// value cannot drift between them. Wording is condensed from
// components/PvConnectionWriteUp.tsx; it adds no claim the write-up lacks.

export const CAPACITY_BASIS = {
  dc: { name: "PV array DC capacity", value: "≈1.2 MWp", detail: "Installed module capacity; exceeds the inverter rating at a ~1.2 inverter loading ratio." },
  ac: { name: "Inverter AC nameplate", value: "1.0 MW", detail: "The rated AC output assumed for the assessment." },
  export: { name: "Approved export limit", value: "≤1.0 MW", detail: "Maximum power permitted into the network at the point of common coupling, set by SA Power Networks after the connection study, possibly below the inverter rating." },
} as const;

// Stop order follows the power flow drawn by the trace; BESS is optional and
// not traced, so it comes last.
export const SOLAR_ROUTE_STOPS: TraceStop[] = [
  { id: "pv", label: "PV array", rows: [CAPACITY_BASIS.dc] },
  {
    id: "inverter",
    label: "Inverter",
    rows: [
      CAPACITY_BASIS.ac,
      { name: "Grid support", value: "AS/NZS 4777.2", detail: "Supplies or absorbs reactive power to hold network voltage (fixed power factor or Volt-VAr), rides through permitted frequency excursions while the grid is present, and disconnects on loss of mains (anti-islanding)." },
    ],
  },
  {
    id: "pcc",
    label: "Point of common coupling",
    rows: [
      CAPACITY_BASIS.export,
      { name: "Connection equipment", value: "TS134", detail: "Switchgear, ring main units, breakers, isolators, instrument transformers and protection relays, plus metering, telemetry and SCADA-compatible communications where required. Harmonic distortion here must stay within SA Power Networks limits." },
    ],
  },
  { id: "lv", label: "LV option", rows: [{ name: "Low-voltage connection", value: "400 V · ~1443 A · TS132", detail: "Possible where the local feeder has hosting capacity and voltage rise stays within limits, but a 1 MW three-phase export at 400 V draws about 1443 A, demanding substantial dedicated switchgear, cabling and transformer capacity. The final voltage is set by SA Power Networks' site-specific study." }] },
  { id: "hv", label: "HV option", rows: [{ name: "High-voltage connection", value: "11 / 33 kV · ~52 / ~17 A · TS133", detail: "Often more practical at 1 MW: lower current, better voltage control, simpler protection coordination. The final voltage is set by SA Power Networks' site-specific study of feeder thermal limit, voltage rise, fault level, protection grading and transformer capacity." }] },
  { id: "bess", label: "BESS (optional)", rows: [{ name: "Battery storage", value: "AS/NZS 5139 · NICC271", detail: "May be recommended where network studies, export constraints or commercial modelling justify the cost: it absorbs midday generation, discharges into evening demand and reduces curtailment." }] },
];
