// QuadSolver write-up (plan 2026-11-13-001, revised by the 2026-11-13 audit).
// Every figure comes from the QuadSolverApp README and the Results screen for
// the built-in 5-inch preset; nothing here is a measurement of my own hardware.
// The limits block states which limit binds (full throttle) and which of the
// nine are warnings, per domain audit D-01 and D-04.
import { WriteUpFigure } from "@/components/WriteUpFigure";
import { WriteUpIndex, type WriteUpSection } from "@/components/WriteUpIndex";

const sections: WriteUpSection[] = [
  { id: "hover-methods", label: "Three ways to solve hover" },
  { id: "limits", label: "Nine limits, checked together" },
  { id: "preset-result", label: "The 5-inch preset" },
  { id: "model-limits", label: "Where the model stops" },
  { id: "next", label: "Next: my own thrust data" },
];

export function QuadSolverWriteUp() {
  return (
    <section className="writeup" aria-label="QuadSolver method and limits">
      <div className="writeup-heading">
        <p className="eyebrow">Method · where the model stops</p>
        <h2>Every result names its method.<br />Measured data wins while the setup matches.</h2>
        <p>QuadSolver started as the propulsion sizing tool for my <a className="text-link" href="/projects/gps-denied-autonomous-uav">GPS-denied capstone</a>, where integrated obstacle avoidance depends on full-payload thrust margin. I split it into its own app so it could size a quad from a 5-inch freestyle build to an F450-class frame.</p>
        <WriteUpIndex sections={sections} label="Sections of the QuadSolver write-up" />
      </div>
      <div className="writeup-block">
        <h3 id="hover-methods">Three ways to solve hover</h3>
        <p>The app solves hover with the best method its data supports and labels that method on every result. Measured thrust-stand data comes first, interpolated over an imported CSV, but only while the saved setup matches the hardware the CSV was recorded on. Without it, a coefficient model solves each motor from the propeller&apos;s thrust and power coefficients, and momentum theory with a figure of merit is the last fallback.</p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Hover methods">
          <table className="quadsolver-methods-table">
            <caption className="sr-only">Hover methods in order of preference, with what each needs and where it stops</caption>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Needs</th>
                <th scope="col">Where it stops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Measured</th>
                <td>Thrust-stand CSV for this hardware</td>
                <td>Never extrapolates past the sweep</td>
              </tr>
              <tr>
                <th scope="row">Coefficient</th>
                <td>Propeller Ct and Cp</td>
                <td>Only as good as the coefficients</td>
              </tr>
              <tr>
                <th scope="row">Momentum</th>
                <td>Figure of merit 0.65, drivetrain 0.85</td>
                <td>Screening only: about 16.9 min against 8.8 on this preset</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>The CSV headers carry their units, so a plain <code>thrust</code> or <code>current</code> column is rejected rather than guessed.</p>
        <WriteUpFigure
          src="/images/quadsolver/quadsolver-app-tour.webp"
          still="/images/quadsolver/quadsolver-app-tour-still.webp"
          full="/images/quadsolver/quadsolver-app-tour.webp"
          scroll="Four-step app tour"
          pauseLabel="the four-step tour"
          width={800}
          height={600}
          alt="Four screens from the QuadSolver app: 1 pick the motor, propeller, ESC and battery; 2 read thrust-to-weight and hover time from the model; 3 import measured thrust data, here a sample file; 4 the results switch to that imported file"
        >
          A tour of the app in four steps, captured from the real app with its F450 default setup. The imported thrust file is sample data, and the app marks that run as unqualified.
        </WriteUpFigure>
      </div>
      <div className="writeup-block">
        <h3 id="limits">Nine limits, checked together</h3>
        <p>Each result checks nine things: motor current and power, ESC continuous and burst current, the ESC voltage range, the battery C rating, the airframe takeoff mass, and my thrust-to-weight and hover-throttle targets. Six of them decide feasibility, checking the electrical ratings and the throttle ceiling at the hover point and the peak ratings at full throttle. The other three, ESC burst, the ESC voltage range and the airframe mass, are warnings, and the mass band is unset for this preset, so that check passes without testing anything.</p>
        <p>Payload headroom is the smallest of three margins (to the thrust-to-weight target, the throttle ceiling and the electrical limit), so the result names the limit that is reached first. For this preset that limit is full throttle: the propeller reaches 100 % duty at 29,412 rpm, which is what sets the 7.7:1 ratio. When a boundary cannot be found inside the data, the app reports it as unavailable instead of inventing a margin.</p>
      </div>
      <div className="writeup-block">
        <h3 id="preset-result">The 5-inch preset</h3>
        <p>The preset is a 2207 1900KV motor on a 5.1 inch tri-blade, a 6S 1200 mAh pack and a 55 A 4-in-1 ESC on a 240 mm frame, with 120 g of assumed electronics for 620 g all-up. Its Ct of 0.141 comes from T-Motor&apos;s published thrust test for the same propeller on a 1950KV 2207 at 6S, and its Cp of 0.103 was fitted so the model&apos;s electrical power matches that test within 5 % from 20 to 100 % throttle, which means Cp absorbs the ESC and no-load losses rather than predicting them. Hover throttle here means motor voltage over pack voltage, 27 % against a 60 % ceiling.</p>
        {/* Two columns fit at 320px, so this table is not wrapped in a scroll
            region: a focusable stop that can never scroll is a dead tab stop
            (audit 2026-11-13, A11Y-03). */}
        <table className="quadsolver-preset-table">
              <caption className="sr-only">Coefficient-model results for the 5-inch preset at 620 g all-up</caption>
              <thead>
                <tr>
                  <th scope="col">Result</th>
                  <th scope="col">Model estimate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Thrust-to-weight</th>
                  <td>7.69 : 1</td>
                </tr>
                <tr>
                  <th scope="row">Hover throttle</th>
                  <td>27 %</td>
                </tr>
                <tr>
                  <th scope="row">Hover time</th>
                  <td>8.8 min</td>
                </tr>
                <tr>
                  <th scope="row">Specific thrust</th>
                  <td>4.3 g/W</td>
                </tr>
              </tbody>
          </table>
        <p>The hover time assumes about 80 % of the pack&apos;s capacity is usable, which is why 1.2 Ah at 6.6 A does not read as eleven minutes. The thrust-to-weight ratio assumes the app&apos;s default 30 mΩ pack resistance, as Tattu publishes none for this pack, and that solve draws 146 A, about 122 C. At 15 mΩ the same solve rises to 9.1, at 172 A or about 143 C.</p>
      </div>
      <div className="writeup-block">
        <h3 id="model-limits">Where the model stops</h3>
        <p>The coefficient path treats the ESC as an ideal power converter, so switching losses are not modelled, and the command-to-duty calibration of a real ESC is unknown. The momentum fallback&apos;s figure of merit and drivetrain efficiency are general assumptions, not tuned to small propellers, which is the gap the methods table records. None of the results on this page come from hardware I have measured.</p>
      </div>
      <div className="writeup-block">
        <h3 id="next">Next: my own thrust data</h3>
        <p>The first measured sweep will come from the <a className="text-link" href="/projects/thrust-stand">thrust stand</a> I am building. Once a sweep for a known motor and propeller is imported, the app can report model-minus-measurement residuals for that hardware, which is the test the coefficient model still has to pass.</p>
      </div>
    </section>
  );
}
