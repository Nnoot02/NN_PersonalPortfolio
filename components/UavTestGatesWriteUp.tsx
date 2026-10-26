import { UavFaultResponse, UavResultsGallery } from "./UavSimulationMedia";
import { WriteUpIndex, type WriteUpSection } from "@/components/WriteUpIndex";

const sections: WriteUpSection[] = [
  { id: "trials-measured", label: "What the trials measured" },
  { id: "depth-loss", label: "Depth loss: failure and recovery" },
  { id: "results-gallery", label: "Results gallery" },
  { id: "held-out-testing", label: "What held-out testing exposed" },
  { id: "simulation-limits", label: "Where simulation stops" },
  { id: "next-gates", label: "Next verification gates" },
];

export function UavTestGatesWriteUp() {
  return (
    <section className="writeup" aria-label="Phase 0 simulation evidence">
      <div className="writeup-heading">
        <p className="eyebrow">Phase 0 · simulation evidence</p>
        <h2>Simulation demonstrated.<br />Clearance validation continues.</h2>
        <p>In Gazebo, the GPS-disabled aircraft reached its goal without collision in all 30 baseline trials and all 30 trials on held-out obstacle geometry. However, three held-out trials fell below the 0.5 m centre-clearance requirement, so clearance remains an open validation item for Phase 3 with hardware-in-the-loop (HITL) testing.</p>
        <WriteUpIndex sections={sections} label="Sections of the simulation evidence" />
      </div>
      <div className="writeup-block">
        <h3 id="trials-measured">What the trials measured</h3>
        <p>The simulation connects ArduPilot SITL and Gazebo to ROS 2 and MAVROS, with a depth-based occupancy grid feeding the D* Lite planner. Both batches used 0.7 m planner inflation, a commanded speed of 0.5 m/s and a 3.0 m sensing range, with ten runs each against a box, pillar and wall.</p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Simulation batch comparison">
          <table className="uav-results-table">
            <caption className="sr-only">Simulation results by batch: baseline and held-out geometry, with goal, clearance and path measures</caption>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Baseline</th>
                <th scope="col">Held-out geometry</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Goal reached, collision-free</th>
                <td>30 / 30</td>
                <td>30 / 30</td>
              </tr>
              <tr>
                <th scope="row">Centre clearance ≥ 0.5 m</th>
                <td>30 / 30</td>
                <td>27 / 30</td>
              </tr>
              <tr>
                <th scope="row">Minimum centre clearance</th>
                <td>0.57 m</td>
                <td>0.41 m</td>
              </tr>
              <tr>
                <th scope="row">First-detection latency, worst</th>
                <td>0.726 s</td>
                <td>0.696 s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Collision-free success uses a 0.35 m aircraft envelope; the 0.5 m clearance requirement is a separate, stricter test. Clearance is measured from the aircraft centre to the obstacle surface, not from the propeller tip.</p>
        <figure className="uav-clearance-figure">
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Clearance plot, scrollable">
            <img className="uav-clearance-plot" src="/images/uav-phase0-clearance.svg" width="860" height="270" alt="All 30 baseline trials clear 0.5 m; three of 30 held-out trials fall below it, with a minimum centre clearance of 0.41 m." />
          </div>
          <figcaption>Scroll sideways to compare both batches on a narrow screen. All 60 trials are plotted, including the three held-out runs below the clearance requirement. Trial dates: baseline, 2 October 2026; held-out, 8 October 2026.</figcaption>
        </figure>
      </div>
      <UavFaultResponse />
      <UavResultsGallery />
      <div className="writeup-block">
        <h3 id="held-out-testing">What held-out testing exposed</h3>
        <p>The frozen planner was tested on new obstacle positions and sizes without retuning, and the new geometry exposed two box runs at 0.41 m clearance and one pillar run at 0.48 m. Inflation protects the surfaces the camera has observed, so unseen obstacle depth can reduce clearance around corners.</p>
        <p>My advisor recommended finalising clearance in Phase 3 with HITL, which leaves the three misses as open validation work for that phase.</p>
      </div>
      <div className="writeup-block">
        <h3 id="simulation-limits">Where simulation stops</h3>
        <p>The simulator's estimator, ArduPilot's EKF3, did not respond to the injected vision and IMU errors, so these GPS-disabled trials do not validate real visual-inertial odometry, estimator drift or sensor-source transitions. On the aircraft I am building, EKF3 will take its position from an OAK-D Lite camera supported by a rangefinder and an optical-flow sensor, and that sensor set still needs hardware evidence.</p>
        <p>The latency figures cover the first obstacle detection to publication of an avoidance path on the simulation laptop, excluding real camera, stereo and USB delays. In the baseline batch, 12 of 62 blocking events exceeded 1.0 s, so the first-detection result does not establish a deadline for every event. Raspberry Pi 5 timing and real flight still need validation.</p>
      </div>
      <div className="writeup-block">
        <h3 id="next-gates">Next verification gates</h3>
        <p>Props-off electronics and failsafe checks come before real flight. Position hold and estimator-source transitions need hardware evidence, while final clearance checks are planned for Phase 3/HITL. Integrated obstacle avoidance also depends on measured full-payload thrust margin.</p>
      </div>
    </section>
  );
}
