import Link from "next/link";

type EvidenceState = "verified" | "associated" | "pending";

type EvidenceItem = {
  state: EvidenceState;
  label: string;
  project?: string;
  slug?: string;
  note?: string;
};

type Capability = {
  title: string;
  description: string;
  standards?: string;
  evidence: EvidenceItem[];
};

// One ledger at every width (audit 2026-09-24, A1, Nathan's call): the desktop
// click-to-reveal network hid every tool name until a node was selected, and
// its separate node/edge data had drifted from this list.
const capabilities: Capability[] = [
  {
    title: "Power design",
    description: "Maximum demand, cable selection and de-rating, voltage drop, fault current, earth-fault-loop impedance, single-line diagrams, and wiring schedules. Design tools: AutoCAD, Autodesk Inventor, Fusion 360, and KiCad.",
    standards: "AS/NZS 3000 · AS/NZS 3008.1.1 · AS 1100 technical drawing",
    evidence: [
      { state: "verified" as const, label: "Verified public evidence", project: "Commercial LV Cabling Design", slug: "lv-cabling-design-commercial-complex" },
      { state: "associated" as const, label: "Associated", note: "SLD public; CAD authoring tool unnamed." },
    ],
  },
  {
    title: "Grid connection",
    description: "Connection-voltage assessment, protection and power-quality compliance, and hosting-capacity reasoning.",
    standards: "AS/NZS 4777.1 and 4777.2 · AS/NZS 5033 · SA Power Networks TS132/TS133/TS134",
    evidence: [
      { state: "verified" as const, label: "Verified public evidence", project: "1 MW Solar Grid-Connection Assessment", slug: "solar-grid-connection-assessment" },
    ],
  },
  {
    title: "Embedded systems",
    description: "Python, MATLAB, C, ROS 2, ESP and AVR microcontrollers, and MAVLink telemetry. Multimeter, oscilloscope, function generator, LTspice, and Logisim support bench work and simulation.",
    evidence: [
      { state: "pending" as const, label: "Public evidence pending", project: "GPS-Denied Autonomous UAV", slug: "gps-denied-autonomous-uav", note: "Systems design active; integrated results pending." },
    ],
  },
  {
    title: "Manufacturing and quality",
    description: "5S, Kaizen, root cause analysis, 8D problem-solving, inspection, soldering, and production fault-finding.",
    evidence: [
      { state: "pending" as const, label: "Public evidence pending", note: "Solar Manufacturing & DFMA: current experience; sanitised engineering evidence incomplete." },
    ],
  },
];

export function ToolsStandardsNetwork() {
  return (
    <>
      <div className="tools-heading-row">
        <h2 id="tools-and-standards-heading">Tools and standards</h2>
        <div className="tools-evidence-legend" aria-label="Evidence states" role="group">
          <span className="tools-evidence-key is-verified">Verified</span>
          <span className="tools-evidence-key is-associated">Associated</span>
          <span className="tools-evidence-key is-pending">Pending</span>
        </div>
      </div>
      <div className="tools-proof-ledger" data-tools-ledger>
        {capabilities.map((capability) => (
          <article className="tools-proof-capability" key={capability.title}>
            <h3>{capability.title}</h3>
            <p>{capability.description}</p>
            <div className="tools-proof-lines">
              {capability.evidence.map((item) => (
                <div className={`tools-proof-evidence is-${item.state}`} data-state={item.state} key={`${capability.title}-${item.label}-${item.project ?? "note"}`}>
                  <span className="tools-evidence-state">{item.label}</span>
                  {item.project && item.slug ? <Link className="text-link" href={`/projects/${item.slug}`}>{item.project} →</Link> : null}
                  {item.note ? <span className="tools-proof-note">{item.note}</span> : null}
                </div>
              ))}
            </div>
            {capability.standards ? <p className="tools-proof-standards"><strong>Standards</strong><br />{capability.standards}</p> : null}
          </article>
        ))}
      </div>
    </>
  );
}
