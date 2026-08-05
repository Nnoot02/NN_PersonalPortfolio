import { projects, type Project } from "@/lib/projects";

export type JourneyStageState = "resolved" | "current" | "future";

export type JourneyStage = {
  label: string;
  detail: string;
  state: JourneyStageState;
};

export type ProjectIndexEntry = {
  project: Project;
  stateLabel: string;
  summary: string;
  ctaLabel: "Read verified case study" | "See current work";
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
] as const;

type ProjectIndexSlug = (typeof projectIndexSlugs)[number];
type ProjectIndexDefinition = Omit<ProjectIndexEntry, "project">;
type ProjectIndexDefinitions = { [Slug in ProjectIndexSlug]: ProjectIndexDefinition };

const definitions = {
  "lv-cabling-design-commercial-complex": {
    stateLabel: "Verified case study",
    summary: "Standards-traceable 400 V design for a three-tenancy commercial complex.",
    ctaLabel: "Read verified case study",
    miniature: {
      src: "/images/project-index/lv-cabling-process.webp",
      alt: "Illustrative low-resolution triptych of LV cabling work moving from standards and calculations, through a commercial-complex system design, to verification worksheets",
    },
    stages: [
      { label: "Theory", detail: "AS/NZS requirements", state: "resolved" },
      { label: "System decision", detail: "400 V cable and protection design", state: "resolved" },
      { label: "Verification", detail: "Voltage drop and fault checks", state: "resolved" },
    ],
  },
  "solar-grid-connection-assessment": {
    stateLabel: "Verified assessment",
    summary: "Connection voltage, compliance, protection, and storage assessed against network and inverter requirements.",
    ctaLabel: "Read verified case study",
    miniature: {
      src: "/images/project-index/solar-grid-connection-process.webp",
      alt: "Illustrative low-resolution triptych of a solar grid-connection assessment moving from requirements, through LV and HV connection options, to neutral verification worksheets",
    },
    stages: [
      { label: "Theory", detail: "SAPN and AS/NZS requirements", state: "resolved" },
      { label: "System decision", detail: "LV and HV connection options", state: "resolved" },
      { label: "Verification", detail: "Hosting-capacity conclusion", state: "resolved" },
    ],
  },
  "gps-denied-autonomous-uav": {
    stateLabel: "Active capstone · systems design",
    summary: "Indoor autonomy planned through requirements, sensing, control, and staged test gates.",
    ctaLabel: "See current work",
    miniature: {
      src: "/images/project-index/gps-denied-uav-process.webp",
      alt: "Illustrative low-resolution triptych of a UAV systems-design desk followed by integration and quiet unfinished verification scenes",
    },
    stages: [
      { label: "Planning", detail: "Requirements and architecture", state: "resolved" },
      { label: "Current frontier", detail: "Hardware and software integration", state: "current" },
      { label: "Verification", detail: "Staged tests and measured results", state: "future" },
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

export const projectIndexRelations = [
  "standards + verification",
  "buildability + physical systems",
] as const;

export const manufacturingLens = {
  title: "Manufacturing lens",
  body: "Solar module production gives me practical context for buildability, process reliability, and DFMA. Employer-sensitive details stay private.",
} as const;
