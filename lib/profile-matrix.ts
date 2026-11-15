// The /profile verification matrix (plan 2026-11-15-002). One row per case
// study, in /projects order. Title and key-figure value are not stored here:
// components/ProfileMatrix.tsx resolves them from lib/projects.ts (the title,
// and the CaseSpec row whose label equals specLabel), so no number is retyped.
// scripts/portfolio-contract.mjs parses these literals as text: keep one
// object per line in exactly this field order.

export type MatrixLens = "power" | "hardware";

export type MatrixRow = {
  slug: string;
  basis: string;
  specLabel: string;
  evidence: string;
  lens: MatrixLens;
};

export const PROFILE_MATRIX: readonly MatrixRow[] = [
  { slug: "lv-cabling-design-commercial-complex", basis: "AS/NZS 3000 · AS/NZS 3008.1.1", specLabel: "Voltage drop", evidence: "Complete", lens: "power" },
  { slug: "solar-grid-connection-assessment", basis: "SAPN TS132/TS133 · AS/NZS 4777.2", specLabel: "Connection voltage", evidence: "Complete, network study not run", lens: "power" },
  { slug: "gps-denied-autonomous-uav", basis: "Simulation trials", specLabel: "Held-out", evidence: "Simulation only", lens: "hardware" },
  { slug: "thrust-stand", basis: "Bench validation gates", specLabel: "Validation gates", evidence: "Bench, uncalibrated", lens: "hardware" },
  { slug: "quadsolver-propulsion-sizing", basis: "Propulsion model", specLabel: "Limits", evidence: "Model only", lens: "hardware" },
  { slug: "last-metre-eyes-viasat-entry", basis: "Competition entry", specLabel: "Phase 2", evidence: "Concept, not measured", lens: "hardware" },
];

export const PROFILE_LENSES = [
  { id: "all", label: "All" },
  { id: "power", label: "Power systems" },
  { id: "hardware", label: "Hardware and autonomy" },
] as const;
