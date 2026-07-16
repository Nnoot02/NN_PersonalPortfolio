export type BuildType =
  | "Original design"
  | "Adapted build"
  | "Reproduction"
  | "Experiment"
  | "Repair";

export type EvidenceKind = "Photo" | "CAD" | "Sketch" | "Build note" | "Parts list" | "Test";

export type WorkbenchEvidence = {
  kind: EvidenceKind;
  image: string;
  alt: string;
  caption: string;
};

export type SourceAttribution = {
  sourceName: string;
  creator?: string;
  canonicalUrl: string;
  rightsNote: string;
};

type WorkbenchEntryBase = {
  slug: string;
  title: string;
  summary: string;
  buildType: BuildType;
  motivation: string;
  contribution: string;
  constraint: string;
  observedOutcome: string;
  failure: string;
  nextIteration: string;
  tags: string[];
  image: string;
  imageAlt: string;
  evidence: WorkbenchEvidence[];
};

type AttributedWorkbenchEntry = WorkbenchEntryBase & {
  buildType: "Adapted build" | "Reproduction";
  source: SourceAttribution;
};

type SelfDirectedWorkbenchEntry = WorkbenchEntryBase & {
  buildType: "Original design" | "Experiment" | "Repair";
  source?: never;
};

export type WorkbenchEntry = AttributedWorkbenchEntry | SelfDirectedWorkbenchEntry;

// Public data only. Entries stay out of this export until Nathan approves the
// wording, owned evidence, and source packet required by the publication gate.
export const workbenchEntries: readonly WorkbenchEntry[] = [
  {
    slug: "bench-fume-extractor",
    title: "3D-Printed Bench Fume Extractor",
    summary: "A compact bench extractor designed around a 12 V fan, printed enclosure, and a first pass at simple control electronics.",
    buildType: "Original design",
    motivation: "I wanted a practical bench tool and a short design-and-build problem during an exam week.",
    contribution: "I designed the enclosure in Inventor, printed and assembled it, then started integrating the Pico-based electronics enclosure.",
    constraint: "The first version had to fit around a 12 V fan within a one-week exam-period build window.",
    observedOutcome: "The fan drew 300 mA at 12 V (3.6 W). In bench use, it captured loose smoke roughly 15–30 cm from the intake; formal airflow testing is still pending.",
    failure: "Seam leakage reduced capture, and the Pico electronics enclosure remains unfinished.",
    nextIteration: "Add TPU gaskets, finish the electronics enclosure, and run a repeatable airflow test.",
    tags: ["Inventor", "3D printing", "Bench test"],
    image: "/images/workbench/bench-fume-extractor/bench-fume-extractor.jpg",
    imageAlt: "Blue 3D-printed bench fume extractor with a square front grille on an electronics workbench",
    evidence: [
      {
        kind: "Photo",
        image: "/images/workbench/bench-fume-extractor/bench-fume-extractor.jpg",
        alt: "Front view of the blue 3D-printed fume extractor enclosure around its fan",
        caption: "Assembled extractor at the bench.",
      },
      {
        kind: "Photo",
        image: "/images/workbench/bench-fume-extractor/bench-fume-extractor-electronics.jpg",
        alt: "Open black electronics enclosure beside the extractor, showing a Pico board, wiring, and power components",
        caption: "Electronics enclosure work still in progress.",
      },
    ],
  },
  {
    slug: "tarmo5",
    title: "TARMO5 RC Car",
    summary: "A printed RC-car build used to learn assembly, electronics integration, tuning, and repair through a capable but unfinished chassis.",
    buildType: "Adapted build",
    motivation: "I wanted a hands-on way to learn how a printed RC car behaves once drivetrain, controls, and repairs are part of the build.",
    contribution: "I printed, assembled, tuned, wired, and repaired the car, and made the controls interchangeable between RC, ESP32 Bluetooth, and Arduino Bluetooth setups.",
    constraint: "The drivetrain needs investigation after moving from a spur to a double-helical gearbox, especially around meshing and noise.",
    observedOutcome: "It drove indoors and steered under its control setups. I did not run a speed test.",
    failure: "The tyres had poor indoor grip, which limited useful testing on the available surface.",
    nextIteration: "Review tyre choice and overall build quality, then investigate gearbox meshing and noise.",
    tags: ["3D printing", "RC", "ESP32"],
    image: "/images/workbench/tarmo5/tarmo5.jpg",
    imageAlt: "Partly assembled 3D-printed TARMO5 RC car with visible wiring and a handheld transmitter",
    evidence: [
      {
        kind: "Photo",
        image: "/images/workbench/tarmo5/tarmo5.jpg",
        alt: "Side view of the TARMO5 RC car during assembly with transmitter and wiring visible",
        caption: "Current TARMO5 assembly and control hardware.",
      },
    ],
    source: {
      sourceName: "3D Printed RC Car TARMO5",
      creator: "Engineering Nonsense",
      canonicalUrl: "https://www.printables.com/model/348623-3d-printed-rc-car-tarmo5",
      rightsNote: "Original design files remain on Printables; this page shows only my own build photo and observations.",
    },
  },
  {
    slug: "sesame-robot",
    title: "Sesame Robot",
    summary: "A reproduction build used to practise assembly, wiring, configuration, and microcontroller programming before portable power was solved.",
    buildType: "Reproduction",
    motivation: "I wanted practical microcontroller programming experience tied to a physical system that made movement immediately visible.",
    contribution: "I printed, assembled, wired, configured, and programmed the robot without modifying the original source design.",
    constraint: "The compact, nonstandard battery bay made a portable power solution difficult.",
    observedOutcome: "The programmed movement sequence worked visibly during bench testing.",
    failure: "It still depends on a bench supply and laptop, so the build is not yet self-contained.",
    nextIteration: "Complete battery-powered autonomous operation and add phone-based manual control.",
    tags: ["Microcontrollers", "Assembly", "Programming"],
    image: "/images/workbench/sesame-robot/sesame-robot-pose.webp",
    imageAlt: "Small assembled Sesame Robot posed with its legs and arm mechanisms visible",
    evidence: [
      {
        kind: "Photo",
        image: "/images/workbench/sesame-robot/sesame-robot-pose.webp",
        alt: "Sesame Robot posed on a work surface after movement programming",
        caption: "Metadata-stripped still from the movement test.",
      },
    ],
    source: {
      sourceName: "sesame-robot",
      creator: "dorianborian",
      canonicalUrl: "https://github.com/dorianborian/sesame-robot",
      rightsNote: "Original source remains at GitHub; this page shows only my assembly and test evidence.",
    },
  },
  {
    slug: "servo-mini-arm",
    title: "Servo Mini Arm",
    summary: "A reproduced servo arm extended with my own joystick circuit and control code to learn through a deliberately light-duty mechanism.",
    buildType: "Reproduction",
    motivation: "I wanted to understand why people build small servo arms and explore the control side for myself.",
    contribution: "I printed, assembled, and wired the arm, then built the joystick circuit and wrote the control code.",
    constraint: "The original arm geometry and small servos limited stiffness and payload.",
    observedOutcome: "Joystick control worked as intended. The arm could pick up and grab items below 20 g.",
    failure: "Payload capability was very limited, and the arm was not stiff enough for heavier objects.",
    nextIteration: "Design a stiffer, more robust arm from scratch.",
    tags: ["Servos", "Joystick control", "Microcontrollers"],
    image: "/images/workbench/servo-mini-arm/servo-mini-arm.jpg",
    imageAlt: "Printed Servo Mini Arm connected to a breadboard-based joystick control circuit",
    evidence: [
      {
        kind: "Photo",
        image: "/images/workbench/servo-mini-arm/servo-mini-arm.jpg",
        alt: "Servo Mini Arm on a floor beside its breadboard joystick-control circuit",
        caption: "Current build evidence; a cleaner documentation photo is planned.",
      },
    ],
    source: {
      sourceName: "Servo Mini Arm",
      creator: "LucaDilo",
      canonicalUrl: "https://makerworld.com/en/models/1290483-servo-mini-arm",
      rightsNote: "Original design files remain on MakerWorld; this page shows only my build and joystick-control evidence.",
    },
  },
];

// Kept separate from collection order so the homepage stays intentionally curated.
export const homepageWorkbenchSlugs = ["bench-fume-extractor", "tarmo5"] as const;

export function getWorkbenchEntry(slug: string): WorkbenchEntry | undefined {
  return workbenchEntries.find((entry) => entry.slug === slug);
}
