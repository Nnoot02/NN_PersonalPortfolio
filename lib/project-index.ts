import { projects, type Project } from "@/lib/projects";

export type JourneyStageState = "resolved" | "current" | "future";

export type JourneyStage = {
  label: string;
  detail: string;
  state: JourneyStageState;
};

export type ProjectIndexEntry = {
  project: Project;
  /** Lane label. Omitted when it would only restate `project.status` (F16). */
  stateLabel?: string;
  summary: string;
  ctaLabel: "Read the case study" | "See current work" | "Read the entry";
  miniature: {
    src: string;
    alt: string;
  };
  stages: readonly [JourneyStage, JourneyStage, JourneyStage];
};

export const projectIndexSlugs = [
  "lv-cabling-design-commercial-complex",
  "solar-grid-connection-assessment",
  "gps-denied-autonomous-uav",
  "thrust-stand",
  "quadsolver-propulsion-sizing",
  "last-metre-eyes-viasat-entry",
] as const;

type ProjectIndexSlug = (typeof projectIndexSlugs)[number];
type ProjectIndexDefinition = Omit<ProjectIndexEntry, "project">;
type ProjectIndexDefinitions = { [Slug in ProjectIndexSlug]: ProjectIndexDefinition };

const definitions = {
  "lv-cabling-design-commercial-complex": {
    stateLabel: "Coursework case study",
    summary: "Standards-traceable 400 V design for a three-tenancy commercial complex.",
    ctaLabel: "Read the case study",
    miniature: {
      src: "/images/project-index/lv-cabling-artifact.webp",
      alt: "One-line diagram of the LV cabling design: a 400 V three-tenancy commercial complex from the supply transformer through the main switchboard to the three distribution boards",
    },
    stages: [
      { label: "Theory", detail: "AS/NZS requirements", state: "resolved" },
      { label: "System decision", detail: "400 V cable and protection design", state: "resolved" },
      { label: "Verification", detail: "Voltage drop and fault checks", state: "resolved" },
    ],
  },
  "solar-grid-connection-assessment": {
    stateLabel: "Coursework assessment",
    summary: "Connection voltage, compliance, protection, and storage assessed against network and inverter requirements.",
    ctaLabel: "Read the case study",
    miniature: {
      src: "/images/project-index/solar-grid-connection-artifact.webp",
      alt: "Single-line concept of the solar grid-connection assessment: the 1 MW plant at the point of common coupling to the distribution network, with the LV and HV options that were assessed",
    },
    stages: [
      { label: "Theory", detail: "SAPN and AS/NZS requirements", state: "resolved" },
      { label: "System decision", detail: "LV and HV connection options", state: "resolved" },
      { label: "Verification", detail: "Hosting-capacity conclusion", state: "resolved" },
    ],
  },
  "gps-denied-autonomous-uav": {
    stateLabel: "Active capstone",
    summary: "30/30 held-out goals reached in simulation and 27/30 cleared the 0.5 m requirement; the three misses go to Phase 3 hardware-in-the-loop (HITL) testing.",
    ctaLabel: "See current work",
    miniature: {
      src: "/images/project-index/gps-denied-uav-artifact.webp",
      alt: "GPS-denied UAV bench mock-up: red-and-white quadcopter with electronics and landing gear in the workshop",
    },
    stages: [
      { label: "Simulation", detail: "Baseline and held-out trials", state: "resolved" },
      { label: "Current frontier", detail: "Hardware and software integration", state: "current" },
      { label: "Verification", detail: "Phase 3/HITL clearance validation", state: "future" },
    ],
  },
  "thrust-stand": {
    stateLabel: "Capstone instrument",
    summary: "Bench instrument for thrust, RPM, current and voltage, built so the motor-upgrade decision rests on measured data.",
    ctaLabel: "See current work",
    miniature: {
      src: "/images/project-index/thrust-stand-artifact.webp",
      alt: "Thrust stand CAD model: orange printed carriage with the motor plate on two steel rods, rod supports and a timber base",
    },
    stages: [
      { label: "Design", detail: "Shield PCB and stand CAD", state: "resolved" },
      { label: "Current frontier", detail: "RPM front end on the bench", state: "current" },
      { label: "Verification", detail: "Thrust sweep and motor decision", state: "future" },
    ],
  },
  "quadsolver-propulsion-sizing": {
    // stateLabel omitted: it would restate project.status byte for byte (F16).
    summary: "Propulsion sizing that checks nine limits at once and labels its method; results stay model estimates until my own thrust data arrives.",
    ctaLabel: "Read the case study",
    miniature: {
      src: "/images/project-index/quadsolver-artifact.webp",
      alt: "QuadSolver Results screen for the 5-inch preset: thrust-to-weight, hover time, hover current, payload headroom and specific thrust tiles above the powertrain limit bars",
    },
    stages: [
      { label: "Model", detail: "Three hover methods", state: "resolved" },
      { label: "Current frontier", detail: "Version 1.0 release", state: "current" },
      { label: "Verification", detail: "Own thrust-stand sweep", state: "future" },
    ],
  },
  "last-metre-eyes-viasat-entry": {
    stateLabel: "Competition entry",
    summary: "GPS-denied search drone with a satellite relay, entered in Viasat Space for Good 2026; the satellite side stayed modelled.",
    ctaLabel: "Read the entry",
    miniature: {
      src: "/images/project-index/viasat-entry-artifact.webp",
      alt: "Viasat entry user journey card: relay node on at the site perimeter, drone into the structure, map out to incident command, entry decision made",
    },
    stages: [
      { label: "Phase 1", detail: "Written concept advanced", state: "resolved" },
      { label: "Phase 2", detail: "Video package submitted", state: "resolved" },
      { label: "Measurement", detail: "Drone-to-relay link on a bench", state: "future" },
    ],
  },
} satisfies ProjectIndexDefinitions;

function requireUniqueProject(slug: ProjectIndexSlug): Project {
  const matches = projects.filter((project) => project.slug === slug);
  if (matches.length !== 1) {
    throw new Error(`Project index requires exactly one project for slug: ${slug}`);
  }
  return matches[0];
}

export const projectIndexEntries: readonly ProjectIndexEntry[] = projectIndexSlugs.map((slug) => {
  const indexContent = definitions[slug];
  if (!indexContent.miniature.alt.trim()) {
    throw new Error(`Project index requires non-empty miniature alt text for slug: ${slug}`);
  }
  return { project: requireUniqueProject(slug), ...indexContent };
});

// Sub-discipline grouping for /projects. Order across all groups must stay
// LV -> Solar -> UAV -> Thrust stand -> QuadSolver -> Viasat, which the contract asserts on the rendered DOM.
export const projectIndexGroups = [
  {
    id: "power-systems",
    heading: "Power Systems & Grid Integration",
    slugs: ["lv-cabling-design-commercial-complex", "solar-grid-connection-assessment"],
  },
  {
    id: "embedded-hardware",
    heading: "Embedded & Hardware",
    slugs: ["gps-denied-autonomous-uav", "thrust-stand", "quadsolver-propulsion-sizing", "last-metre-eyes-viasat-entry"],
  },
] as const satisfies readonly { id: string; heading: string; slugs: readonly ProjectIndexSlug[] }[];

export const projectIndexRelation = {
  sourceSlug: "lv-cabling-design-commercial-complex",
  targetSlug: "solar-grid-connection-assessment",
  label: "standards + verification",
} as const;

// F8 (site screening audit 2026-09-16, Nathan's go 2026-09-18): the named next
// case study at each completed study's end, reusing the singular relation
// label. UAV/DFMA are not completed and get no link.
export const projectStudyNext: Record<string, { slug: string; label: string }> = {
  "lv-cabling-design-commercial-complex": { slug: "solar-grid-connection-assessment", label: projectIndexRelation.label },
  "solar-grid-connection-assessment": { slug: "lv-cabling-design-commercial-complex", label: projectIndexRelation.label },
};
