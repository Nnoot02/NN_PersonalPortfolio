import { WriteUpIndex, type WriteUpSection } from "@/components/WriteUpIndex";

const sections: WriteUpSection[] = [
  { id: "what-it-measures", label: "What it measures" },
  { id: "validation-gates", label: "Six validation gates" },
  { id: "bench-bring-up", label: "Bench bring-up" },
  { id: "mechanical-stand", label: "The mechanical stand" },
];

// Gate wording and thresholds: InternalOS gps-denied-capstone/Thrust-Stand/
// validation-gates.md (gate 2 and 3 tolerances as amended 2026-09-30, CHG-020).
// Status as of the 2026-11-06 bench session; update both together.
const gates = [
  {
    n: 1,
    name: "RPM from the motor phase",
    pass: "Phase-tap RPM agrees with an optical tachometer within 5 % or 100 RPM at low, mid and high throttle, with one clean comparator edge per electrical cycle.",
    status: "Partial. The front end switches cleanly on the scope, but the logger still over-counts. Not passed.",
  },
  {
    n: 2,
    name: "Load-cell calibration",
    pass: "Known weights read within 2 % of reading or 20 g, whichever is larger, and zero returns within 20 g after unloading.",
    status: "Not started. The bench calibration from bring-up is void.",
  },
  {
    n: 3,
    name: "Current and voltage",
    pass: "Pack voltage matches a multimeter within 2 % or 0.2 V, and current matches a reference within 5 % or 0.5 A, whichever is larger in each case.",
    status: "Not started. The current sensor is not wired yet.",
  },
  {
    n: 4,
    name: "Repeatable sweep",
    pass: "Three sweeps on the same setup agree within about 5 % thrust, 3 % RPM and 5 % current, with pack voltage logged at every point.",
    status: "Not started.",
  },
  {
    n: 5,
    name: "Vibration",
    pass: "Ground-run logs stay below about 30 m/s² with zero clipping, and any filter setting is tied to a measured frequency.",
    status: "Not started.",
  },
  {
    n: 6,
    name: "Motor decision",
    pass: "The thrust-to-weight margin at full payload is calculated from measured thrust. Only a failed margin justifies buying larger motors.",
    status: "Not started, and it is the gate the stand exists for.",
  },
] as const;

export function ThrustStandWriteUp() {
  return (
    <section className="writeup" aria-label="Thrust stand design and bench evidence">
      <div className="writeup-heading">
        <p className="eyebrow">Capstone instrument · bench evidence</p>
        <h2>Measure first, then buy motors.<br />No gate has passed yet.</h2>
        <p>
          My <a className="text-link" href="/projects/gps-denied-autonomous-uav">GPS-denied capstone drone</a> carries a
          stereo camera, a Raspberry Pi 5 and sensors on a stock 2212 motor and 1045 propeller kit. Whether those motors
          give enough thrust margin at full payload is a question I wanted to answer with measurements, not a sizing
          model, before spending the budget on an upgrade. This stand is the instrument for that measurement.
        </p>
        <WriteUpIndex sections={sections} label="Sections of the thrust stand write-up" />
      </div>
      <div className="writeup-block">
        <h3 id="what-it-measures">What it measures</h3>
        <p>
          The stand logs four channels at once against throttle. Thrust comes from a 5 kg bar load cell read by a
          24-bit NAU7802 ADC. RPM comes from the motor itself: a tap on one phase is clamped, filtered and squared up by
          an LM393 comparator, giving one edge per electrical cycle, so no optical sensor has to sit near the propeller.
          Current comes from an off-board ACS758 Hall-effect sensor in the battery lead, and pack voltage from a
          resistor divider, so every thrust point carries the battery sag behind it.
        </p>
        <p>
          All four channels land on one Arduino Mega 2560 shield, with an ESC signal output, test points on the key
          signal nodes and three status LEDs for power, logging and armed. The shield is also my Design for
          Manufacture project at TAFE, so its schematic is released and archived as a numbered revision. Rev01 passed
          ERC with no errors or warnings on 10 November 2026. The PCB layout has not started.
        </p>
      </div>
      <div className="writeup-block">
        <h3 id="validation-gates">Six validation gates</h3>
        <p>
          I wrote the pass and fail criteria before the hardware existed, so the stand cannot grade its own results
          after the fact. Each gate has to pass before the one after it means anything: a sweep is worthless if the
          load cell was never calibrated.
        </p>
        <ol className="gate-list">
          {gates.map((gate) => (
            <li key={gate.n}>
              <p className="gate-marker">Gate {gate.n}</p>
              <h4>{gate.name}</h4>
              <dl>
                <div>
                  <dt>Pass when</dt>
                  <dd>{gate.pass}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{gate.status}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
      <div className="writeup-block">
        <h3 id="bench-bring-up">Bench bring-up</h3>
        <p>
          On 6 November 2026 I built the RPM front end on a breadboard and ran it on a spare 920 KV motor with a 1045
          propeller, with a Rigol scope on the comparator output and the phase waveform. The first logged run read zero
          RPM because the comparator had no supply. Once it was powered, the scope showed one clean output edge per
          electrical cycle from 20 to 50 % throttle.
        </p>
        <p>
          At 50 % throttle the logger counted 860 edges per second while the scope showed 431 Hz, almost exactly
          double. My best explanation is chatter: the comparator switches on back-EMF ramps that carry PWM ripple, and
          its hysteresis took about 100 µs to build, so a ripple cycle could cross the threshold again first. I also
          counted 12 magnet poles on that motor where the logger assumed 14, which skews every RPM figure on its own.
        </p>
        <p>
          After the runs I noticed the motor itself was faulty, as it skipped at low throttle, so some of what I
          logged may be the motor rather than the front end. I lowered the hysteresis resistor from 1 MΩ to 470 kΩ, and a re-test
          at 20 % throttle agreed with an earlier scope capture within 3.4 %. The two readings were not taken at the
          same time, though, and the 2× fault came from 50 %, so this does not prove the fix. The next step is a speed-up
          capacitor across that resistor and a full re-test on a known-good motor. The Rev01 schematic still shows the
          1 MΩ value, so the change goes into the next revision.
        </p>
      </div>
      <div className="writeup-block">
        <h3 id="mechanical-stand">The mechanical stand</h3>
        <p>
          The motor mounts on a printed carriage that slides on two 8 mm steel rods in linear bearings, so thrust pushes
          the carriage back into the load cell through an adjustable screw, with a hard stop to protect the cell. The
          guard is three panels of 4.5 mm clear polycarbonate, which I collected on 18 September 2026.
        </p>
        <p>
          The carriage has been through several revisions. An earlier printed version snapped at the screw tower when knocked, so
          Rev F widens that part into a tapered flange and checks the printed parts and the pusher screw for clashes in the CAD
          assembly before printing. None of the Rev F parts is printed yet. Design for Manufacture only assesses the
          electronics, but the capstone needs the stand built either way.
        </p>
      </div>
    </section>
  );
}
