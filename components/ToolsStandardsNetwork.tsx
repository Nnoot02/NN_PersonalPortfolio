"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";

type EvidenceState = "verified" | "associated" | "pending";
type NodeKind = "category" | "project";

type NetworkNode = {
  id: string;
  kind: NodeKind;
  label: string;
  x: string;
  y: string;
  slug?: string;
  tools?: string;
};

type NetworkEdge = {
  category: string;
  detail: string;
  path: string;
  project: string;
  state: EvidenceState;
};

const nodes: NetworkNode[] = [
  { id: "standards", kind: "category", label: "Standards", x: "12%", y: "19%", tools: "AS/NZS 3000, AS/NZS 3008.1.1, AS/NZS 4777.1 and 4777.2, AS/NZS 5033, SA Power Networks TS132/TS133/TS134, and AS 1100 technical drawing." },
  { id: "power", kind: "category", label: "Power design", x: "12%", y: "50%", tools: "Maximum demand, cable selection and de-rating, voltage drop, prospective fault current, earth-fault-loop impedance, single-line diagrams, and wiring schedules." },
  { id: "cad", kind: "category", label: "CAD and EDA", x: "12%", y: "81%", tools: "AutoCAD, Autodesk Inventor, Fusion 360, and KiCad." },
  { id: "lv", kind: "project", label: "Commercial LV cabling", slug: "lv-cabling-design-commercial-complex", x: "38%", y: "35%" },
  { id: "grid", kind: "project", label: "1 MW grid connection", slug: "solar-grid-connection-assessment", x: "38%", y: "69%" },
  { id: "uav", kind: "project", label: "GPS-denied UAV", slug: "gps-denied-autonomous-uav", x: "62%", y: "35%" },
  { id: "solar", kind: "project", label: "Solar manufacturing", slug: "solar-manufacturing-dfma", x: "62%", y: "69%" },
  { id: "embedded", kind: "category", label: "Programming and embedded", x: "88%", y: "19%", tools: "Python, MATLAB, C, ROS 2, ESP and AVR microcontrollers, and MAVLink telemetry." },
  { id: "test", kind: "category", label: "Test and simulation", x: "88%", y: "50%", tools: "Multimeter, oscilloscope, function generator, LTspice, and Logisim." },
  { id: "quality", kind: "category", label: "Manufacturing and quality", x: "88%", y: "81%", tools: "5S, Kaizen, root cause analysis, 8D problem-solving, inspection, soldering, and production fault-finding." },
];

const edges: NetworkEdge[] = [
  { project: "lv", category: "standards", state: "verified", detail: "AS/NZS 3000 and AS/NZS 3008.1.1 control the published design.", path: "M 380 168 C 275 168, 230 91, 120 91" },
  { project: "lv", category: "power", state: "verified", detail: "Published calculations cover demand, cable selection, voltage drop, fault level, and loop impedance.", path: "M 380 168 C 275 168, 230 240, 120 240" },
  { project: "lv", category: "cad", state: "associated", detail: "A public single-line diagram exists; its authoring tool is not named in the case study.", path: "M 380 168 C 275 168, 230 389, 120 389" },
  { project: "grid", category: "standards", state: "verified", detail: "The assessment cites inverter, PV, wiring, and SA Power Networks requirements.", path: "M 380 331 C 275 331, 230 91, 120 91" },
  { project: "grid", category: "power", state: "verified", detail: "The published case applies grid-connection and hosting-capacity reasoning.", path: "M 380 331 C 275 331, 230 240, 120 240" },
  { project: "uav", category: "embedded", state: "pending", detail: "Systems design is active; integrated flight and verification results remain pending.", path: "M 620 168 C 725 168, 770 91, 880 91" },
  { project: "uav", category: "test", state: "pending", detail: "Staged test gates are documented; completed flight evidence is not yet published.", path: "M 620 168 C 725 168, 770 240, 880 240" },
  { project: "solar", category: "quality", state: "pending", detail: "Manufacturing experience is current; sanitised public engineering evidence remains pending.", path: "M 620 331 C 725 331, 770 389, 880 389" },
];

const nodeById = new Map(nodes.map((node) => [node.id, node]));

const mobileCapabilities = [
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
      { state: "pending" as const, label: "Public evidence pending", project: "Solar Manufacturing & DFMA", slug: "solar-manufacturing-dfma", note: "Current experience; sanitised engineering evidence incomplete." },
    ],
  },
];

function EvidenceLegend() {
  return (
    <div className="tools-evidence-legend" aria-label="Evidence states">
      <span className="tools-evidence-key is-verified">Verified</span>
      <span className="tools-evidence-key is-associated">Associated</span>
      <span className="tools-evidence-key is-pending">Pending</span>
    </div>
  );
}

export function ToolsStandardsNetwork() {
  const [selectedId, setSelectedId] = useState("lv");
  const selectedNode = nodeById.get(selectedId) ?? nodes[3];
  const selectedEdges = edges.filter((edge) => edge.project === selectedId || edge.category === selectedId);
  const relatedIds = new Set([selectedId]);

  for (const edge of selectedEdges) {
    relatedIds.add(edge.project);
    relatedIds.add(edge.category);
  }

  return (
    <>
      <div className="tools-heading-row">
        <h2 id="tools-and-standards-heading">Tools and standards</h2>
        <div className="tools-network-desktop-only">
          <EvidenceLegend />
        </div>
      </div>
      <div className="tools-network-desktop" data-tools-desktop-network>
        <div className="tools-network-map" aria-label="Project-centred relationship map of tools, standards, and public evidence">
          <svg viewBox="0 0 1000 480" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const active = edge.project === selectedId || edge.category === selectedId;
              return (
                <path
                  className={`tools-network-edge tools-network-edge--${edge.state}${active ? " is-active" : ""}`}
                  d={edge.path}
                  data-state={edge.state}
                  key={`${edge.project}-${edge.category}`}
                />
              );
            })}
          </svg>
          {nodes.map((node) => (
            <button
              aria-pressed={selectedId === node.id}
              className={`tools-network-node tools-network-node--${node.kind}${relatedIds.has(node.id) ? " is-related" : ""}${selectedId === node.id ? " is-selected" : ""}`}
              data-node-id={node.id}
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              style={{ "--node-x": node.x, "--node-y": node.y } as CSSProperties}
              type="button"
            >
              {node.label}
            </button>
          ))}
        </div>
        <div className="tools-detail-rail" aria-live="polite" data-tools-detail-rail>
          <div className="tools-detail-heading">
            <h3>{selectedNode.label}</h3>
            {selectedNode.slug ? <Link className="text-link" href={`/projects/${selectedNode.slug}`}>View case study →</Link> : null}
          </div>
          {selectedNode.kind === "category" ? <p className="tools-detail-summary">{selectedNode.tools}</p> : null}
          <ul className="tools-detail-relations">
            {selectedEdges.map((edge) => {
              const otherNode = nodeById.get(edge.project === selectedId ? edge.category : edge.project);
              return (
                <li className={`tools-evidence-line is-${edge.state}`} key={`${edge.project}-${edge.category}`}>
                  <span className="tools-evidence-state">{edge.state}</span>
                  <span>
                    {otherNode?.slug ? <Link className="text-link" href={`/projects/${otherNode.slug}`}>{otherNode.label}</Link> : <strong>{otherNode?.label}</strong>}
                    {`: ${edge.detail}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="tools-proof-mobile" data-tools-mobile-proof>
        <div className="tools-proof-ledger">
          {mobileCapabilities.map((capability) => (
            <article className="tools-proof-capability" key={capability.title}>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <div className="tools-proof-lines">
                {capability.evidence.map((item) => (
                  <div className={`tools-proof-evidence is-${item.state}`} key={`${capability.title}-${item.label}-${item.project ?? "note"}`}>
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
      </div>
    </>
  );
}
