export type Project = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  scope: string;
  role: string;
  status: string;
  tags: string[];
  problem: string;
  approach: string;
  result: string;
  evidenceStatus: string;
  evidenceVerified?: boolean;
};

export const projects: Project[] = [
  {
    slug: "lv-cabling-design-commercial-complex",
    number: "01",
    title: "Commercial LV Cabling Design",
    summary:
      "Standards-traceable 400 V cabling design for a three-tenancy commercial complex — maximum demand, cable selection, earthing, and fault verification to AS/NZS 3000 and AS/NZS 3008.1.1.",
    image: "/images/lv-cabling-design.webp",
    imageAlt: "One-line diagram of a 400 V three-tenancy installation from supply transformer to distribution boards",
    scope: "Power design, standards, verification",
    role: "Sole designer (coursework)",
    status: "Evidence verified - sanitized write-up",
    tags: ["Power systems", "AS/NZS standards", "Verification"],
    problem:
      "Design the complete LV cabling system for a three-tenancy commercial complex supplied at 400 V from a 500 kVA transformer, and prove every cable and protective device against AS/NZS 3000:2018 and AS/NZS 3008.1.1:2025.",
    approach:
      "Calculated per-phase maximum demand by the AS/NZS 3000 Clause 2.2.2(a) method, then ran one auditable nine-step selection chain per cable covering current capacity, de-rating, voltage drop, fault level, and earth-fault-loop impedance, with every assumption logged for verification against the controlling standard.",
    result:
      "123.6 A design current met by 25 mm² X-90 copper consumer mains at 0.74 % voltage drop; 8.0 kA prospective fault current at the main switchboard confirmed 10 kA-rated Type C protection; every final subcircuit passed the AS/NZS 3000 Table 8.1 earth-fault-loop limits.",
    evidenceStatus:
      "Verified. Sanitized public write-up complete; full tabulated working held privately because standards tables are Standards Australia copyright.",
    evidenceVerified: true,
  },
  {
    slug: "solar-grid-connection-assessment",
    number: "02",
    title: "1 MW Solar Grid-Connection Assessment",
    summary:
      "Technical assessment for connecting a 1 MW solar plant to the SA Power Networks distribution grid — connection voltage, power-quality compliance, protection, and storage, decided against AS/NZS inverter standards and SAPN TS132/TS133.",
    image: "/images/solar-grid-connection.webp",
    imageAlt: "Single-line concept of a 1 MW solar plant connecting to a distribution grid at the point of common coupling",
    scope: "Power systems, grid connection, compliance",
    role: "Sole author (coursework technical assessment)",
    status: "Evidence verified - sanitized write-up",
    tags: ["Power systems", "Embedded generation", "AS/NZS standards"],
    problem:
      "Determine how a new 1 MW solar plant could be connected to the SA Power Networks distribution grid — the viable connection voltage, the power-quality and protection obligations, and whether storage is warranted — and justify each conclusion against the controlling standards and network requirements.",
    approach:
      "Framed the connection against SA Power Networks TS132/TS133/TS134 and the AS/NZS inverter, PV and wiring standards (4777.1/4777.2, 5033, 3000, 61000.4.7): compared LV and HV connection options, tested the reactive-power, frequency ride-through, anti-islanding and harmonic obligations at the point of common coupling, and weighed a battery energy storage system against curtailment, export limits and possible FCAS value.",
    result:
      "A 1 MW AC plant — roughly a 1.2 MWp array at a ~1.2 inverter loading ratio — can connect at LV under TS132 where feeder hosting capacity allows, but an HV connection under TS133 (11 kV or 33 kV) is usually more practical given the export current, voltage-rise and protection demands. The governing finding is that connection voltage and viability follow a site-specific network study — feeder thermal limit, voltage rise, fault level, protection grading — not the plant's capacity or nearby consumer demand; the analysis reframed an early demand-matching assumption toward hosting capacity as the real constraint.",
    evidenceStatus:
      "Verified. Sanitized public write-up complete; coursework is university-generated and unrestricted, and standards tables are cited by clause and number rather than reproduced (Standards Australia copyright).",
    evidenceVerified: true,
  },
  {
    slug: "gps-denied-autonomous-uav",
    number: "03",
    title: "GPS-Denied Autonomous UAV",
    summary:
      "Indoor autonomy capstone combining non-GPS positioning, local planning, obstacle detection, and disciplined verification.",
    image: "/images/gps-denied-uav.webp",
    imageAlt: "Quadcopter prototype with companion computer and depth camera on a lab bench",
    scope: "Autonomy, controls, estimation",
    role: "Systems planning and verification",
    status: "Planning - evidence pending",
    tags: ["Systems engineering", "Sensor fusion", "Control"],
    problem:
      "Demonstrate credible indoor UAV autonomy without relying on GPS, while keeping safety, sensing limits, and verification visible.",
    approach:
      "Document requirements, architecture, estimator choices, obstacle detection, local planning, and staged test gates before flight claims.",
    result:
      "Capstone evidence is still being assembled. Publish only measured test results, logs, and sanitized design decisions.",
    evidenceStatus: "Planning material exists; flight and verification results are pending.",
  },
  {
    slug: "esp32-drone",
    number: "04",
    title: "ESP32 Drone",
    summary:
      "Embedded flight-control platform used to explore real-time control, electronics integration, and iterative testing.",
    image: "/images/esp32-drone.webp",
    imageAlt: "Close-up of a compact quadcopter and its exposed flight-controller electronics",
    scope: "Embedded, firmware, control",
    role: "Embedded builder and tester",
    status: "Outcome evidence pending",
    tags: ["Embedded systems", "Firmware", "Prototyping"],
    problem:
      "Build practical understanding of flight electronics, real-time control, firmware iteration, and integration failure modes.",
    approach:
      "Use an ESP32-based drone platform to connect firmware, sensors, electronics, power, control behavior, and bench/flight testing.",
    result:
      "Measured outcomes need to be added before publishing, including flight behavior, control stability, failures, and improvements.",
    evidenceStatus: "Project exists; measured public outcomes need final copy and proof.",
  },
  {
    slug: "solar-manufacturing-dfma",
    number: "05",
    title: "Solar Manufacturing & DFMA",
    summary:
      "Production experience viewed through design-for-manufacture, process reliability, and systems-thinking lenses.",
    image: "/images/solar-manufacturing.webp",
    imageAlt: "Photovoltaic module moving through a precision manufacturing line",
    scope: "DFMA, process, manufacturing",
    role: "Production and DFMA observer",
    status: "Evidence pending",
    tags: ["DFMA", "Process design", "Manufacturing"],
    problem:
      "Translate solar manufacturing work into public engineering evidence without disclosing employer-sensitive process details.",
    approach:
      "Describe manufacturing constraints, process reliability, quality thinking, operator experience, and DFMA lessons at a sanitized level.",
    result:
      "Public copy must be reviewed before publishing. The useful outcome is a clear link between production work and engineering judgment.",
    evidenceStatus: "Sanitized public details and defensible examples are pending.",
  },
];
