const gates = [
  [
    "0",
    "Simulation",
    "Scripted Gazebo worlds with obstacles at known poses.",
    "Success rate over repeated runs (target ≥ 8 in 10), path length against optimal, and replan latency.",
  ],
  [
    "1",
    "Airframe and failsafe",
    "Bench prop-balance and vibration check, tethered first hover, override-switch failover with props off.",
    "Logged vibration stays inside the safe band, and manual override takes control on demand.",
  ],
  [
    "2",
    "Position hold without GPS",
    "GPS disabled in parameters. Drift measured against a marked floor target over 60 s from logged local position, run VIO-only, flow-only, and across controlled transitions in both directions.",
    "Measured drift, pose jump at each source transition, recovery time, and whether the transition stays inside the safety envelope.",
  ],
  [
    "3",
    "Closed-loop tracking",
    "Commanded 1 m square, logged trajectory compared against the commanded path.",
    "Overshoot and settling time.",
  ],
  [
    "4",
    "Replan around an unmarked obstacle",
    "An unmarked box placed in the planned straight-line path, after a full-payload thrust-margin precondition is met.",
    "Detection range honoured, occupancy map updated, a new path generated, and the obstacle cleared with the costmap inflation margin intact.",
  ],
];

export function UavTestGatesWriteUp() {
  return (
    <section className="writeup" aria-label="UAV verification gates">
      <div className="writeup-heading">
        <p className="eyebrow">Verification design</p>
        <h2>The test gates, defined before the data</h2>
        <p>
          This is the acceptance criteria for the capstone, not a results table. Each
          gate names its method and its pass metric before the test is run, and a lower
          gate has to pass before the layer above it is touched. Publishing the standard
          ahead of the evidence is the point: it is what stops a demo video from
          standing in for a measurement. No gate below is claimed as passed.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Gates and pass metrics</h3>
        <ol className="gate-list" data-gate-list>
          {gates.map(([id, proves, method, metric]) => (
            <li key={id}>
              <p className="gate-marker">Gate {id}</p>
              <h4>{proves}</h4>
              <dl>
                <div>
                  <dt>Method</dt>
                  <dd>{method}</dd>
                </div>
                <div>
                  <dt>Pass metric</dt>
                  <dd>{metric}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>

      <div className="writeup-block">
        <h3>Why the estimator gates carry the weight</h3>
        <p>
          Gates 2 and 3 are the control and estimation evidence. Removing GPS does not
          simply degrade position accuracy; it moves the aircraft onto an estimator that
          fuses visual-inertial odometry with an optical-flow and rangefinder fallback,
          and the interesting failure is not steady-state drift but the transition
          between those sources. That is why gate 2 measures pose jump and recovery time
          across a source change in both directions, rather than only logging drift over
          60 s. Gate 3 then closes the loop: a commanded 1 m square exposes overshoot and
          settling that a stationary hold test cannot.
        </p>
        <p>
          Gate 4 carries a precondition that is a measurement, not a schedule item. The
          as-shipped motors sit under the thrust-to-weight margin set for integrated
          flight at full payload, so the upgrade decision is gated on measured
          thrust-stand data rather than a catalogue figure.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Declared limits</h3>
        <p>
          The gate definitions and methods are current; the results are not published
          because they do not exist yet. Where a gate has been partially exercised, the
          partial state is not reported here as a pass. Flight and verification data will
          be published as logs and measured values, or not at all.
        </p>
      </div>
    </section>
  );
}
