// Design basis for the LV cabling design, read by both drawings: the hero's
// one-line legend and the case study's installation route. One source, so a
// value cannot drift between the two views.
// Copy traced to components/LvCablingWriteUp.tsx and the project brief; the
// voltage-drop split (brief 1 % vs Cl 3.6.2's 5 %) was verified against the
// standard's own text (Cl 3.6.2 Value) and the brief's source document.

export type BasisId = "supply" | "mains" | "vd" | "device" | "sup" | "hai" | "but" | "trench";

export type BasisEntry = { id: BasisId; name: string; value: string; detail: string };

export const LV_DESIGN_BASIS: Record<BasisId, BasisEntry> = {
  supply: {
    id: "supply",
    name: "Supply",
    value: "500 kVA · 400 V 3-ph",
    detail: "Supply capacity S = 500 kVA · U₀ = 400 V · I_psc = 15 kA. Maximum demand: AS/NZS 3000:2018 Cl 2.2.2(a), Table C2 diversity; 85.6 kVA on the heaviest phase (Ib 123.6 A).",
  },
  mains: {
    id: "mains",
    name: "Consumer mains",
    value: "25 mm² X-90 Cu · Ib 123.6 A",
    detail: "I_b = S_demand / (√3 · U₀) with S_demand = 85.6 kVA; I_b ≤ I_n ≤ I_z with I_z from AS/NZS 3008.1.1:2025 Table 3.8 → Table 3.13 Col 19 (buried trefoil); corrections per Cl 3.4.3.",
  },
  vd: {
    id: "vd",
    name: "Voltage drop",
    value: "ΔV 0.74 % vs 1 % brief limit",
    detail: "ΔV = √3 · I_b · L · R_c / 1000 ≤ 1 % of 400 V (project brief). AS/NZS 3000:2018 Cl 3.6.2 sets the 5 % installation limit.",
  },
  device: {
    id: "device",
    name: "Main switchboard",
    value: "125 A Type C · 8.0 kA fault",
    detail: "I_n = 125 A Type C; I_psc 8.0 kA ≤ 10 kA breaking capacity per Cl 2.5.4.2(a). EFLI: Cl 5.7.3, Table 8.1.",
  },
  sup: {
    id: "sup",
    name: "Supermarket submain",
    value: "SUP-DB · 40 A · 6 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
  },
  hai: {
    id: "hai",
    name: "Hairdresser submain",
    value: "HAI-DB · 25 A · 6 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
  },
  but: {
    id: "but",
    name: "Butcher submain",
    value: "BUT-DB · 50 A · 10 mm² V-75",
    detail: "Submain: same chain; Table 3.8 → Table 3.12 Col 17 (one conduit). ΔV adds to the path budget against Cl 3.6.2's 5 %.",
  },
  // Installation view only: the one-line diagram does not draw the trench.
  trench: {
    id: "trench",
    name: "Trench section A",
    value: "600 mm · trefoil · k = 1.03",
    detail: "Consumer mains: X-90 single-core copper, actives in separate conduits laid in trefoil with N and E, buried 600 mm in 20 °C soil. Corrections k = 1.04 (soil, Table 3.45) × 0.99 (depth, Table 3.46) = 1.03 feed the capacity check. The layer build-up drawn is indicative, not a compliance dimension.",
  },
};
