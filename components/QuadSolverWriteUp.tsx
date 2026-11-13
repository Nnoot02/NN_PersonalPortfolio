// QuadSolver write-up (plan 2026-11-13-001). Every figure comes from the
// QuadSolverApp README and the Results screen for the built-in 5-inch preset;
// nothing here is a measurement of my own hardware.
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
        <h2>Every result names its method.<br />Measured data replaces the model.</h2>
        <p>QuadSolver started as the propulsion sizing tool for my <a className="text-link" href="/projects/gps-denied-autonomous-uav">GPS-denied capstone</a>, where integrated obstacle avoidance depends on full-payload thrust margin. I split it into its own app so it could size any quad, from a 5-inch freestyle build to an F450-class frame.</p>
        <WriteUpIndex sections={sections} label="Sections of the QuadSolver write-up" />
      </div>
      <div className="writeup-block">
        <h3 id="hover-methods">Three ways to solve hover</h3>
        <p>The app uses the best evidence it has and labels the method on every result. Measured thrust-stand data comes first, interpolated over an imported CSV, but only while the saved setup matches the hardware the CSV was recorded on. Without it, a coefficient model solves each motor from the propeller&apos;s thrust and power coefficients, and momentum theory with a figure of merit is the last fallback.</p>
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
                <td>Screening only; no throttle headroom</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>The CSV headers carry their units, so a plain <code>thrust</code> or <code>current</code> column is rejected rather than guessed.</p>
      </div>
      <div className="writeup-block">
        <h3 id="limits">Nine limits, checked together</h3>
        <p>Each result checks motor current and power, ESC continuous and burst current, the ESC voltage range, the battery C rating, the airframe takeoff mass, and my thrust-to-weight and hover-throttle targets, all at the same operating point. Payload headroom is the smallest of three margins (to the thrust-to-weight target, the throttle ceiling and the electrical limit), so the result names the limit that is reached first. When a boundary cannot be found inside the data, the app reports it as unavailable instead of inventing a margin.</p>
      </div>
      <div className="writeup-block">
        <h3 id="preset-result">The 5-inch preset</h3>
        <p>The preset is a 2207 1900KV motor on a 5.1 inch tri-blade, a 6S 1200 mAh pack and a 55 A 4-in-1 ESC on a 240 mm frame, with 120 g of assumed electronics for 620 g all-up. Its Ct of 0.141 and Cp of 0.103 are fitted to T-Motor&apos;s published thrust test for the same propeller on a 1950KV 2207 at 6S, so the model reproduces that test&apos;s electrical power within 5 % from 20 to 100 % throttle.</p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="5-inch preset results">
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
                <td>7.7 : 1</td>
              </tr>
              <tr>
                <th scope="row">Hover duty</th>
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
        </div>
        <p>The thrust-to-weight ratio assumes the default 30 mΩ pack resistance, as Tattu publishes none for this pack. At 15 mΩ it rises to 9.1, which is why the app shows its assumptions next to the answer.</p>
      </div>
      <div className="writeup-block">
        <h3 id="model-limits">Where the model stops</h3>
        <p>The coefficient path treats the ESC as an ideal power converter, so switching losses are not modelled, and the command-to-duty calibration of a real ESC is unknown. The momentum fallback&apos;s figure of merit and drivetrain efficiency are general assumptions, not tuned to small propellers. None of the results on this page come from hardware I have measured.</p>
      </div>
      <div className="writeup-block">
        <h3 id="next">Next: my own thrust data</h3>
        <p>The <a className="text-link" href="/projects/thrust-stand">thrust stand</a> I am building is the planned source of the first measured sweep. Once a sweep for a known motor and propeller is imported, the app can report model-minus-measurement residuals for that hardware, which is the test the coefficient model still has to pass.</p>
      </div>
    </section>
  );
}
