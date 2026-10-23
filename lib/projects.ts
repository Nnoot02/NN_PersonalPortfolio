export type SpecRow = {
  label: string;
  value: string;
  note?: string;
};

export type Project = {
  slug: string;
  number?: string;
  title: string;
  summary: string;
  image: string;
  /** Optional srcset for list rows, whose box never exceeds ~574px (audit U7 follow-up). */
  imageSrcSet?: string;
  /** Responsive candidates for the case-study hero (photographic heroes only). */
  heroSrcSet?: string;
  imageAlt: string;
  scope: string;
  role: string;
  status: string;
  tags: string[];
  problem: string;
  approach: string;
  result: string;
  evidenceStatus: string;
  evidenceMarkers?: string[];
  spec?: SpecRow[];
  // Diagram artifacts are unreadable at mobile widths; offer the full-size file.
  imageIsDiagram?: boolean;
  /** Provenance line shown under a diagram, before the full-size link. */
  imageNote?: string;
};

export const projects: Project[] = [
  {
    slug: "lv-cabling-design-commercial-complex",
    number: "01",
    title: "Commercial LV Cabling Design",
    summary:
      "Standards-traceable 400 V cabling design for a three-tenancy commercial complex: maximum demand, cable selection, earthing, and fault verification to AS/NZS 3000 and AS/NZS 3008.1.1.",
    image: "/images/lv-cabling-sld.svg",
    imageAlt: "One-line diagram of a 400 V three-tenancy installation from supply transformer to distribution boards",
    imageIsDiagram: true,
    // Nathan, 2026-09-24: the original SLD was drawn in Autodesk Inventor.
    imageNote: "I drew the original one-line diagram in Autodesk Inventor; this is a vector redraw of it for the web.",
    scope: "Power design, standards, verification",
    role: "Sole designer (coursework)",
    status: "Coursework design - every AS/NZS 3000 and 3008.1.1 check shown",
    tags: ["Power systems", "AS/NZS standards", "Verification"],
    evidenceMarkers: ["400 V 3-ph", "123.6 A design current", "0.74 % voltage drop", "AS/NZS 3008.1.1"],
    spec: [
      { label: "Voltage system", value: "400 V 3-phase", note: "230 V line-to-neutral" },
      { label: "Design current", value: "123.6 A", note: "on the heaviest phase (A)" },
      { label: "Voltage drop", value: "0.74 %", note: "consumer mains, against the 1 % limit" },
      { label: "Standards", value: "AS/NZS 3000:2018 · AS/NZS 3008.1.1:2025" },
    ],
    problem:
      "Design the complete LV cabling system for a three-tenancy commercial complex supplied at 400 V from a 500 kVA transformer, and prove every cable and protective device against AS/NZS 3000:2018 and AS/NZS 3008.1.1:2025.",
    approach:
      "Calculated per-phase maximum demand by the AS/NZS 3000 Clause 2.2.2(a) method, then ran one auditable nine-step selection chain per cable covering current capacity, de-rating, voltage drop, fault level, and earth-fault-loop impedance, with every assumption logged for verification against the controlling standard.",
    result:
      "123.6 A design current met by 25 mm² X-90 copper consumer mains at 0.74 % voltage drop; 8.0 kA prospective fault current at the main switchboard confirmed 10 kA-rated Type C protection; every final subcircuit was checked against the AS/NZS 3000 Table 8.1 earth-fault-loop limits, with the governing loop at 0.57 Ω against a 1.15 Ω limit.",
    evidenceStatus:
      "Complete. The nine-step selection chain and the per-subcircuit results table are published; standards table data is cited by table number rather than reproduced (Standards Australia copyright).",
  },
  {
    slug: "solar-grid-connection-assessment",
    number: "02",
    title: "1 MW Solar Grid-Connection Assessment",
    summary:
      "Technical assessment for connecting a 1 MW solar plant to the SA Power Networks distribution grid: connection voltage, power-quality compliance, protection, and storage, with each conclusion argued against AS/NZS inverter standards and SAPN TS132/TS133.",
    image: "/images/solar-grid-connection.webp",
    imageSrcSet: "/images/thumbs/solar-grid-connection-800.webp 800w, /images/solar-grid-connection.webp 1536w",
    heroSrcSet: "/images/thumbs/solar-grid-connection-800.webp 800w, /images/solar-grid-connection.webp 1536w",
    imageAlt: "Single-line concept of a 1 MW solar plant connecting to a distribution grid at the point of common coupling",
    imageIsDiagram: true,
    scope: "Power systems, grid connection, compliance",
    role: "Sole author (coursework technical assessment)",
    status: "Coursework assessment - every TS132/TS133 and AS/NZS 4777.2 check shown",
    tags: ["Power systems", "Embedded generation", "AS/NZS standards"],
    evidenceMarkers: ["1 MW AC", "SAPN TS132/TS133", "AS/NZS 4777.2", "PCC voltage rise"],
    spec: [
      { label: "Inverter AC nameplate", value: "1.0 MW", note: "the rated AC output assumed for the assessment" },
      { label: "PV array DC capacity", value: "≈1.2 MWp", note: "installed module capacity; exceeds the inverter rating at a ~1.2 inverter loading ratio" },
      { label: "Approved export limit", value: "≤1.0 MW", note: "possibly below the inverter rating; set by SA Power Networks after the connection study" },
      { label: "Connection voltage", value: "LV (TS132) or HV (TS133)", note: "decided by a site-specific network study, not by capacity" },
      { label: "Standards", value: "SAPN TS132/TS133 · AS/NZS 4777.2" },
    ],
    problem:
      "Determine how a new 1 MW solar plant could be connected to the SA Power Networks distribution grid (the viable connection voltage, the power-quality and protection obligations, and whether storage is warranted), and justify each conclusion against the controlling standards and network requirements.",
    approach:
      "Framed the connection against SA Power Networks TS132/TS133/TS134 and the AS/NZS inverter, PV and wiring standards (4777.1/4777.2, 5033, 3000, 61000.4.7): compared LV and HV connection options, tested the reactive-power, frequency ride-through, anti-islanding and harmonic obligations at the point of common coupling, and weighed a battery energy storage system against curtailment, export limits and possible FCAS value.",
    result:
      "A 1 MW AC plant (roughly a 1.2 MWp array at a ~1.2 inverter loading ratio) can connect at LV under TS132 where feeder hosting capacity allows, but an HV connection under TS133 (11 kV or 33 kV) is usually more practical given the export current, voltage-rise and protection demands. The governing finding is that connection voltage and viability follow a site-specific network study (feeder thermal limit, voltage rise, fault level, protection grading), not the plant's capacity or nearby consumer demand; the analysis reframed an early demand-matching assumption toward hosting capacity as the real constraint.",
    evidenceStatus:
      "Complete. The assessment and its clause-level citations are published; the TAFE SA coursework is unrestricted, and standards data is cited by clause rather than reproduced (Standards Australia copyright).",
  },
  {
    slug: "gps-denied-autonomous-uav",
    number: "03",
    title: "GPS-Denied Autonomous UAV",
    summary:
      "GPS-disabled simulation reached the goal in 30/30 baseline and 30/30 held-out trials, while three clearance misses remain for Phase 3/HITL.",
    image: "/images/gps-denied-uav.webp",
    imageSrcSet: "/images/gps-denied-uav-960.webp 960w, /images/gps-denied-uav-1280.webp 1280w, /images/gps-denied-uav.webp 1920w",
    heroSrcSet: "/images/gps-denied-uav-960.webp 960w, /images/gps-denied-uav-1280.webp 1280w, /images/gps-denied-uav.webp 1920w",
    imageAlt: "Red-and-white quadcopter bench mock-up with electronics and landing gear on a workshop bench",
    imageNote: "Bench mock-up, shown at 00:04 in my assembly footage. The results below are from simulation.",
    scope: "Autonomy, controls, estimation",
    role: "Systems planning and verification",
    status: "Active capstone · Phase 0 simulation reviewed",
    tags: ["Systems engineering", "Sensor fusion", "Control"],
    evidenceMarkers: ["Baseline 30/30", "Held-out 30/30", "Clearance 27/30", "Phase 3 / HITL"],
    spec: [
      { label: "Baseline", value: "30 / 30", note: "goal reached, collision-free" },
      { label: "Held-out", value: "30 / 30", note: "goal reached, collision-free" },
      { label: "Clearance", value: "27 / 30", note: "held-out trials ≥ 0.5 m, aircraft centre" },
      { label: "Next", value: "Phase 3 / HITL", note: "final clearance validation" },
    ],
    problem:
      "Demonstrate indoor UAV autonomy without relying on GPS, while keeping safety, sensing limits and verification visible.",
    approach:
      "Define the acceptance criteria, test the same planner configuration on baseline and held-out obstacles, then use the results to plan Phase 3/HITL clearance validation.",
    result:
      "GPS-disabled simulation reached the goal without collision in 30/30 baseline trials and 30/30 held-out trials. Three held-out trials fell below the 0.5 m centre-clearance requirement, so final clearance validation will continue in Phase 3/HITL following my advisor's review.",
    evidenceStatus: "Results cover simulation only; clearance, real VIO, Raspberry Pi 5 timing and flight performance still need validation.",
  },
  {
    // Unnumbered: "04" stays reserved while the DFMA study is unpublished.
    slug: "last-metre-eyes-viasat-entry",
    title: "Last-Metre Eyes: Viasat Space for Good 2026",
    summary:
      "My entry to the Viasat Space for Good Australia 2026 challenge: a GPS-denied search drone paired with a portable satellite relay for disaster response. It advanced from Phase 1, was submitted in full for Phase 2, and was not selected for Phase 3.",
    image: "/images/viasat-entry/journey.webp",
    imageAlt: "Card from the Phase 2 video showing the user journey: relay node switched on at the site perimeter, drone enters the structure, map reaches incident command, entry decision made",
    imageIsDiagram: true,
    imageNote: "One of the cards from my Phase 2 video. The rest of the set is below.",
    scope: "Systems concept, satellite backhaul, evidence boundaries",
    role: "Sole entrant: concept, written answers, video and cards",
    status: "Competition entry · submitted, not selected for Phase 3",
    tags: ["Systems engineering", "Satellite communications", "Disaster response"],
    evidenceMarkers: ["Phase 1 advanced", "Phase 2 submitted", "A$1,084.84 BOM", "HaLow link modelled"],
    spec: [
      { label: "Phase 1", value: "Advanced", note: "written concept, nine answers, 5 September 2026" },
      { label: "Phase 2", value: "Submitted", note: "2 min 47 s video package, 27 September 2026" },
      { label: "Drone BOM", value: "A$1,084.84", note: "as submitted, against my capstone A$1,100 budget cap; forecast, prices not re-checked" },
      { label: "Local link", value: "Modelled", note: "Wi-Fi HaLow candidate, not measured" },
    ],
    problem:
      "Enter a satellite-for-good challenge with a concept I could defend in front of technical judges: a disaster-response system that uses satellite connectivity where it actually helps, built on hardware I was already building rather than hardware I could only describe.",
    approach:
      "I anchored the concept on my GPS-denied capstone, so the drone side is real work on my bench, and labelled everything else for what it was. The satellite link in the demo was a declared mock, the drone-to-relay radio was a named candidate with modelled range, and the impact metrics were targets, with every on-screen claim checked against a claims-to-evidence table before it went into the video.",
    result:
      "The written concept advanced from Phase 1 on 5 September 2026, and I submitted the Phase 2 video package complete and compliant on 27 September. The entry was not selected for Phase 3.",
    evidenceStatus:
      "Nothing in the satellite segment was measured. The bearer in the demo was a mock, the Wi-Fi HaLow range is modelled from published wall attenuation, and the metrics are targets, not results.",
  },
];

// Featured projects for the Home and Profile pages, a maximum of three,
// shown in this explicit order (not the case-study numbering order).
export const verifiedPowerSlugs = [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
] as const;

export const verifiedPowerProjects: Project[] = verifiedPowerSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project));

export const broaderEngineeringProjects: Project[] = projects.filter(
  (project) => !verifiedPowerSlugs.includes(project.slug as (typeof verifiedPowerSlugs)[number]),
);

export const featuredProjects = verifiedPowerProjects;
