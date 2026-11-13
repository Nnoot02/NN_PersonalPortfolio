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
  /**
   * Case-study eyebrow. DESIGN.md requires it to carry information rather than
   * restate the h1, and bans uppercase strings past ~30ch, so an unnumbered
   * page passes its own short discipline line here instead of "Case study"
   * (audit 2026-11-13, UIUX-07).
   */
  eyebrow?: string;
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
    status: "Coursework · worked checks",
    tags: ["Power systems", "AS/NZS standards", "Verification"],
    evidenceMarkers: ["400 V 3-ph", "123.6 A design current", "0.74 % voltage drop", "AS/NZS 3008.1.1"],
    spec: [
      { label: "Voltage system", value: "400 V 3-phase", note: "230 V line-to-neutral" },
      { label: "Design current", value: "123.6 A", note: "on the heaviest phase (A)" },
      { label: "Voltage drop", value: "0.74 %", note: "consumer mains, against the 1 % limit set by the brief" },
      { label: "Standards", value: "AS/NZS 3000:2018 · AS/NZS 3008.1.1:2025" },
    ],
    problem:
      "Design the complete LV cabling system for a three-tenancy commercial complex supplied at 400 V from a 500 kVA transformer, and prove every cable and protective device against AS/NZS 3000:2018 and AS/NZS 3008.1.1:2025.",
    approach:
      "Calculated per-phase maximum demand by the AS/NZS 3000 Clause 2.2.2(a) method, then ran one auditable nine-step selection chain per cable covering current capacity, de-rating, voltage drop, fault level, and earth-fault-loop impedance, with every assumption logged for verification against the controlling standard.",
    result:
      "123.6 A design current met by 25 mm² X-90 copper consumer mains at 0.74 % voltage drop; 8.0 kA prospective fault current at the main switchboard confirmed 10 kA-rated Type C protection; the longest final subcircuit of each conductor size was checked against the AS/NZS 3000 Table 8.1 earth-fault-loop limits, with the governing loop at 0.57 Ω against a 1.15 Ω limit.",
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
    status: "Coursework · argued assessment",
    tags: ["Power systems", "Embedded generation", "AS/NZS standards"],
    evidenceMarkers: ["1 MW AC", "SAPN TS132/TS133", "AS/NZS 4777.2", "PCC voltage rise"],
    spec: [
      { label: "Inverter AC nameplate", value: "1.0 MW", note: "one inverter, the rated AC output assumed for the assessment" },
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
      "Complete. No network data was available, so voltage rise, fault level and protection grading are named as inputs to the network study, not computed. The assessment and its clause-level citations are published; the TAFE SA coursework is unrestricted, and standards data is cited by clause rather than reproduced (Standards Australia copyright).",
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
    scope: "Autonomy, perception, verification",
    role: "Sole developer: planning, simulation and verification, now building the aircraft",
    status: "Active capstone",
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
    slug: "thrust-stand",
    number: "05",
    title: "Propulsion Thrust Stand",
    summary:
      "A bench instrument that measures thrust, RPM, current and pack voltage on my capstone drone's motor and propeller, so the decision to keep or upgrade the motors rests on measured data. None of its six validation gates has passed yet.",
    image: "/images/thrust-stand/thrust-stand-exploded.webp",
    imageSrcSet: "/images/thrust-stand/thrust-stand-exploded-960.webp 960w, /images/thrust-stand/thrust-stand-exploded-1280.webp 1280w, /images/thrust-stand/thrust-stand-exploded.webp 1950w",
    heroSrcSet: "/images/thrust-stand/thrust-stand-exploded-960.webp 960w, /images/thrust-stand/thrust-stand-exploded-1280.webp 1280w, /images/thrust-stand/thrust-stand-exploded.webp 1950w",
    imageAlt: "Exploded view of the thrust stand, labelled: propeller and motor, a motor plate swapped to fit a different motor, the sliding carriage that carries the motor, a load cell on a fixed bracket as the force sensor, bearings on two steel rods so the carriage slides one way only, and a wooden base. Orange parts move with the motor, dark parts are fixed to the base, grey parts are bought",
    imageIsDiagram: true,
    imageNote: "Exploded view from my capstone final presentation, rendered from the Rev F CAD. It is not the built stand.",
    scope: "Instrumentation, embedded hardware, verification",
    role: "Sole designer: shield electronics, printed mechanics and bench testing",
    status: "Active capstone",
    tags: ["Instrumentation", "Embedded hardware", "Verification"],
    evidenceMarkers: ["4 channels", "Shield PCB Rev02", "0 / 6 gates passed", "A$275 cap"],
    spec: [
      { label: "Channels", value: "Thrust · RPM · current · voltage", note: "5 kg load cell, motor phase tap, ACS758 Hall sensor, pack divider" },
      { label: "Shield PCB", value: "Rev02 layout", note: "0 ERC and 0 DRC errors, 11 November 2026; quoted, not ordered" },
      { label: "Validation gates", value: "0 / 6 passed", note: "gate 1, RPM, is on the bench" },
      { label: "Spend", value: "A$236.55", note: "against my A$275 cap for the stand, raised from A$250 on 30 September 2026 for the shield PCB; the DigiKey line is an approximate AUD total" },
    ],
    problem:
      "My capstone drone needs enough thrust margin at full payload to hold position and avoid obstacles indoors. The propulsion models I had only gave estimates, and I did not want to buy new motors on an estimate, so I needed to measure the motor and propeller I already had.",
    approach:
      "I set six pass/fail gates before building anything: RPM, load-cell calibration, current and voltage checks, a repeatable sweep, vibration, and finally the motor decision itself. The electronics go on an Arduino Mega shield, which is also my Design for Manufacture project at TAFE, and the mechanics are 3D-printed parts on linear rods behind a polycarbonate guard.",
    result:
      "The shield PCB is laid out at Rev02 with no ERC or DRC errors, and the RPM front end is on the bench. Its first real-motor run read about twice the scope frequency at half throttle, and the motor itself turned out to be faulty, so gate 1 has not passed.",
    evidenceStatus:
      "No gate has passed. Thrust, current and voltage are not calibrated, the shield board is quoted but not ordered, and the printed parts are not printed yet. Every number on this page is a design value or a bench observation, not a validated measurement.",
  },
  {
    // Unnumbered like the Viasat entry: "04" stays reserved for DFMA.
    slug: "quadsolver-propulsion-sizing",
    title: "QuadSolver: Drone Propulsion Sizing",
    summary:
      "A propulsion sizing app that checks a quad's motors, props, ESC and battery against nine limits at once. Its results are model estimates until my own thrust-stand data replaces them.",
    image: "/images/quadsolver-results.webp",
    imageSrcSet: "/images/quadsolver-results-960.webp 960w, /images/quadsolver-results-1280.webp 1280w, /images/quadsolver-results.webp 1920w",
    heroSrcSet: "/images/quadsolver-results-960.webp 960w, /images/quadsolver-results-1280.webp 1280w, /images/quadsolver-results.webp 1920w",
    // Cropped to the summary band (audit 2026-11-13, Nathan): the metric tiles
    // plus the INFO line stay in frame; the readings table, the empty measured
    // thrust plot and the clipped Evidence control are cropped out.
    imageAlt:
      "QuadSolver Results screen for the 5-inch preset, cropped to its summary band: thrust-to-weight 7.69 to 1, 8.8 min hover, 6.6 A hover current, 1.45 kg payload headroom and 4.3 g/W, with the coefficient-model label and the model-only warning line both in frame",
    imageNote: "Model estimate, not a measurement: the built-in 5-inch preset with 120 g of assumed electronics, solved on the coefficient model. No measured thrust data is loaded.",
    scope: "Propulsion modelling, software",
    role: "Sole developer: models, app and tests",
    status: "Software tool · model-only, hardware pending",
    eyebrow: "Propulsion modelling, software",
    tags: ["Propulsion modelling", "Python", "Verification"],
    evidenceMarkers: ["3 hover methods", "9 limits", "620 g all-up", "Thrust stand pending"],
    spec: [
      { label: "Hover methods", value: "3", note: "measured data wins when it matches the hardware" },
      { label: "Limits", value: "9", note: "six decide feasibility, three are warnings; full throttle binds this preset" },
      { label: "5-inch preset", value: "620 g all-up", note: "120 g of assumed electronics, model estimate" },
      { label: "Validation", value: "Pending", note: "my own thrust-stand sweep" },
    ],
    problem:
      "Choosing motors, props, an ESC and a battery for a multirotor means checking thrust, endurance and several electrical ratings against each other, and a spreadsheet rarely shows which limit is reached first.",
    approach:
      "Solve hover with the best method the data allows, label that method on every result, and check the electrical ratings and the throttle ceiling at the hover point, with the peak ratings checked at full throttle.",
    result:
      "For the 5-inch preset with 120 g of assumed electronics, the coefficient model gives a 7.7:1 thrust-to-weight ratio, 27 % hover throttle and about 8.8 minutes of hover on 80 % of the pack's capacity. These are model estimates, since the propeller coefficients are fitted to T-Motor's published thrust test rather than my own measurements.",
    evidenceStatus:
      "Model-only. I have not yet imported a thrust-stand sweep of my own; the thrust stand I am building is the planned data source. The source code and Windows build are not public yet.",
  },
  {
    // Unnumbered: "04" stays reserved while the DFMA study is unpublished.
    slug: "last-metre-eyes-viasat-entry",
    title: "Last-Metre Eyes: Viasat Space for Good 2026",
    summary:
      "My entry to the Viasat Space for Good Australia 2026 challenge: a GPS-denied search drone paired with a portable satellite relay for disaster response. It advanced from Phase 1, was submitted in full for Phase 2, and was not selected for Phase 3.",
    image: "/images/viasat-entry/journey.webp",
    imageAlt: "Card from the Phase 2 video showing the user journey: relay node switched on at the site perimeter, drone enters the structure, map reaches incident command, entry decision made",
    // The case-study hero is the relay diagram (components/LmeRelayFigure.tsx);
    // this card now sits with the rest of the Phase 2 set in the write-up.
    imageNote: "A schematic of the entry as submitted. Each part carries its evidence level: real, modelled, concept, mock or target.",
    scope: "Systems concept, satellite backhaul, evidence boundaries",
    role: "Sole entrant: concept, written answers, video and cards",
    status: "Competition entry",
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
