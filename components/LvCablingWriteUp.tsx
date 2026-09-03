import { WriteUpIndex, type WriteUpSection } from "@/components/WriteUpIndex";

// Public URL fragments. Once shipped these ids do not change; the contract
// pins them so a link sent to a reviewer keeps working.
const sections: WriteUpSection[] = [
  { id: "design-basis", label: "Design basis" },
  { id: "maximum-demand", label: "Maximum demand and phase balance" },
  { id: "consumer-mains", label: "Consumer mains: worked chain" },
  { id: "submains", label: "Submains: worst case worked" },
  { id: "final-subcircuits", label: "Final subcircuits" },
  { id: "earthing-and-protection", label: "Earthing and protection" },
  { id: "fault-level", label: "Fault level and earth-fault loop" },
  { id: "assumptions-and-limits", label: "Declared assumptions and limits" },
];

const finalsSchedule = [
  ["Lighting", "26", "5.0", "10", "1.5 mm²", "11.2", "1.87 %", "1.5 mm²"],
  ["Power (10 A GPO)", "24", "10", "20", "4 mm²", "21.4", "1.17 %", "2.5 mm²"],
  ["Power >10 A (15 A socket)", "15", "15", "20", "4 mm²", "21.4", "1.10 %", "2.5 mm²"],
  ["Hot water service", "18", "15.7", "20", "4 mm²", "21.4", "1.37 %", "2.5 mm²"],
  ["Cooking appliances", "15", "11.3", "16", "4 mm²", "21.4", "0.83 %", "2.5 mm²"],
  ["Air-conditioning (3-ph)", "10", "4.6/ph", "10", "2.5 mm²", "15.8", "0.18 %", "2.5 mm²"],
  ["3-phase 15 A outlet", "10", "15/ph", "20", "4 mm²", "21.4", "0.36 %", "2.5 mm²"],
];

export function LvCablingWriteUp() {
  return (
    <section className="writeup" aria-label="Full design write-up">
      <div className="writeup-heading">
        <p className="eyebrow">Design detail</p>
        <h2>The full selection chain</h2>
        <p>
          Every cable in this design was selected with the same auditable nine-step
          chain: design current, protective device, installation method, correction
          factors, cable selection, voltage drop, fault withstand, earth-fault-loop
          check, final selection. The worked results below are my calculations;
          standards table data is cited by table number, not reproduced, because
          those tables are Standards Australia copyright.
        </p>
        <WriteUpIndex sections={sections} label="Sections of the full selection chain" />
      </div>

      <div className="writeup-block">
        <h3 id="design-basis">Design basis</h3>
        <p>
          Three-tenancy commercial complex (a small supermarket, a hairdresser and
          a butcher, plus communal services), supplied at 400 V three-phase (230 V
          line-to-neutral) from a 500 kVA transformer with a stated prospective
          fault current of 15 kA at the transformer. Cable selection to AS/NZS
          3008.1.1:2025; installation, earthing, protection and maximum demand to
          AS/NZS 3000:2018 (+ Amdt 1–3, Ruling 1:2024).
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="maximum-demand">Maximum demand and phase balance</h3>
        <p>
          Maximum demand was determined by calculation per AS/NZS 3000:2018 Clause
          2.2.2(a), using the Table C2 non-domestic diversity method. Every load was
          classified once, allocated to a phase, and group-diversity rules applied
          per phase; three-phase loads add their per-phase current to all three
          phases. The heaviest phase sets the design current: <strong>123.6 A</strong> on
          phase A, with 7.5 % phase imbalance. Per board: communal 39.9 A,
          supermarket 39.1 A, hairdresser 24.5 A, butcher 41.8 A. The butcher is
          simultaneously the heaviest-loaded and longest (15 m) submain.
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="consumer-mains">Consumer mains: worked chain</h3>
        <p>
          X-90 single-core copper, separate conduits laid in trefoil, buried 600 mm,
          soil 20 °C, 15 m route. AS/NZS 3008.1.1:2025 Table 3.8 routes this
          arrangement to Table 3.13, Column 19 (separately enclosed).
        </p>
        <pre tabIndex={0} role="region" aria-label="Consumer mains selection chain, worked steps">{`Step 1  Design current    Ib = 123.6 A (heaviest phase)
Step 2  Protective device In = 125 A Type C   (Ib ≤ In)
Step 3  Install method    Table 3.8 → Table 3.13, Col 19
Step 4  Correction        k = 1.04 (soil, T3.45) × 0.99 (depth, T3.46)
                            = 1.03
        Required tabulated CCC ≥ 125 / 1.03 = 121.4 A
Step 5  16 mm² → 101 A (fail);  25 mm² → 132 A (pass)
        Iz = 132 × 1.03 = 136 A → Ib 123.6 ≤ In 125 ≤ Iz 136  OK
Step 6  Voltage drop (limit 1 % = 4.0 V), Rc = 0.927 Ω/km
        ΔV = √3 × 123.6 × 15 × 0.927 / 1000 = 2.98 V = 0.74 %  OK
Step 7  PFC at MSB = 8.0 kA; breaking capacity 10 kA  OK
SELECT  25 mm² X-90 Cu active and neutral; 6 mm² Cu earth`}</pre>
        <p>
          A single-conduit arrangement (Column 17) would instead require 35 mm²;
          that is not the arrangement specified. The result is
          current-carrying-capacity driven, not voltage-drop driven.
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="submains">Submains: worst case worked</h3>
        <p>
          V-75 single-insulated copper, one conduit, buried 1 m, soil 20 °C. Table
          3.8 routes this to Table 3.12, Column 17. Combined correction k = 1.05 × 0.95
          = 1.00. The butcher submain governs.
        </p>
        <pre tabIndex={0} role="region" aria-label="Butcher submain selection chain, worked steps">{`Step 1  Ib = 41.8 A          Step 2  In = 50 A Type C
Step 4  k = 1.00 → required CCC ≥ 50 A
Step 5  6 mm² → 45 A (fail); 10 mm² → 59 A (pass); Iz = 59 A
        Ib 41.8 ≤ In 50 ≤ Iz 59  OK
Step 6  ΔV = √3 × 41.8 × 15 × 2.23 / 1000 = 2.42 V = 0.61 %  OK
SELECT  10 mm² V-75 Cu; 4 mm² Cu earth
        (16 mm² recommended for practical margin)`}</pre>
      </div>

      <div className="writeup-block">
        <h3 id="final-subcircuits">Final subcircuits: the thermal-insulation catch</h3>
        <p>
          The specification states thermal insulation in all ceiling spaces, and the
          final subcircuits clip across the ceiling joists, so the cables are not
          in free air. A cable clipped to a structural member within bulk insulation
          is a partially-surrounded thermal-insulation installation under AS/NZS
          3008.1.1 Clause 3.4.3. Ratings were therefore read from the
          partially-surrounded column with the 45 °C ambient correction (Table 3.44,
          factor 0.93). This condition raised most power circuits from 2.5 mm² to
          4 mm², the single most consequential installation-condition decision in
          the design.
        </p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Final subcircuit schedule">
          <table>
            <thead>
              <tr>
                <th>Load type</th>
                <th>Run (m)</th>
                <th>Ib (A)</th>
                <th>In (A)</th>
                <th>Cable</th>
                <th>Iz (A)</th>
                <th>ΔV</th>
                <th>Earth</th>
              </tr>
            </thead>
            <tbody>
              {finalsSchedule.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={`${row[0]}-${index}`}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          All Iz ≥ In and every voltage drop is within budget; the worst-case total
          path (mains + butcher submain + lighting final) sums to 3.2 % against the
          5 % limit.
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="earthing-and-protection">Earthing and protection</h3>
        <p>
          Protective earthing conductors were sized from AS/NZS 3000:2018 Table 5.1
          on the MEN system, main earth connected at the MSB neutral bar. Because
          the 25 mm² consumer-mains active was set by current-carrying capacity and
          not upsized for voltage drop, the 6 mm² main earth follows directly from
          Table 5.1. Type C circuit breakers were used throughout (suited to the
          low inrush of LED lighting, resistive heating and small motors), with
          30 mA RCDs on all final subcircuits up to 32 A supplying socket-outlets
          and lighting. Nominal-current grading (125 A, then 40 to 50 A, then
          10 to 20 A) gives
          current discrimination; full selectivity is to be confirmed against
          manufacturer time–current curves, a stated limitation of scope.
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="fault-level">Fault level and earth-fault loop</h3>
        <pre tabIndex={0} role="region" aria-label="Fault level and earth-fault loop calculation">{`Source impedance  Zs = 400 / (√3 × 15 000) = 0.0154 Ω/phase
Consumer mains    R  = 0.884 × 15 / 1000   = 0.0133 Ω
Z at MSB   = 0.0154 + 0.0133 = 0.0287 Ω
PFC at MSB = 230 / 0.0287    = 8 014 A = 8.0 kA`}</pre>
        <p>
          All device breaking capacities (10 kA) exceed the local prospective fault
          current. Earth-fault-loop impedance was checked for the longest circuit of
          each conductor size against AS/NZS 3000:2018 Table 8.1 for Type C
          breakers; the worst-case loop (4 mm² general-power final, 24 m, on the
          butcher submain) gives Zs ≈ 0.57 Ω against a limit of ≈ 1.15 Ω. The
          external loop impedance Ze = 0.0345 Ω is a declared assumption; the real
          figure comes from the network operator&apos;s connection-point fault data or
          an on-site loop-impedance measurement.
        </p>
      </div>

      <div className="writeup-block">
        <h3 id="assumptions-and-limits">Declared assumptions and limits</h3>
        <p>
          Assumptions are logged explicitly rather than hidden: the socket-outlet
          diversity basis, the consumer-mains conduit arrangement (Column 19 basis
          confirmed against the controlled 2025 edition at transcription), the
          assumed Ze above, and discrimination pending manufacturer curves. The
          partially-surrounded ratings used were cross-checked against the 2017
          edition and confirmed unchanged in the 2025 edition. Final values are to
          be verified against the controlling standards and network authority at
          installation. This write-up is sanitised from graded coursework: the
          design scenario is paraphrased, and no standards table content is
          reproduced.
        </p>
      </div>
    </section>
  );
}
