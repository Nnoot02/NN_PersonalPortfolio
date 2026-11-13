import { WriteUpIndex, type WriteUpSection } from "@/components/WriteUpIndex";
import styles from "./ThrustStandWriteUp.module.css";

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

// Figures from my capstone final presentation (deliverables/drafts/final-2026-11-12).
// The wiring diagram is the slide version with the manufacturers' product photos
// replaced by plain labelled boxes for the public site.
function Figure({ src, full, width, height, alt, children }: { src: string; full: string; width: number; height: number; alt: string; children: React.ReactNode }) {
  return (
    <figure className={styles.figure}>
      <img src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
      <figcaption>
        {children} <a className="text-link" href={full} target="_blank" rel="noopener">Open full size<span className="sr-only"> (opens in a new tab)</span></a>
      </figcaption>
    </figure>
  );
}

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
        <Figure
          src="/images/thrust-stand/thrust-stand-wiring-1920.webp"
          full="/images/thrust-stand/thrust-stand-wiring.webp"
          width={1920}
          height={872}
          alt="Wiring diagram: battery power runs from a Zeee 3S 2200 mAh battery through an Allegro ACS758 current sensor to the ESC and on to a 2212 type 920 KV motor. The thrust stand shield, which plugs on top of an Arduino Mega 2560, takes in motor current, the motor speed pickup, battery voltage and the force signal from an Adafruit 4541 5 kg load cell, and sends throttle to the ESC"
        >
          How the stand is wired. The orange path is battery power, which carries up to tens of amps and stays off my
          board, so the board only handles signals. The ESC and motor came in a kit with no recorded make or model.
        </Figure>
        <p>
          All four channels land on one Arduino Mega 2560 shield, with an ESC signal output, test points on the key
          signal nodes and three status LEDs for power, logging and armed. The shield is also my Design for
          Manufacture project at TAFE, so each revision is released and archived. Rev02 carries the full board layout,
          and on 11 November 2026 it passed ERC and DRC with no errors. The board is quoted but not ordered, so all bench
          work so far has been on a protoboard and an Arduino Uno.
        </p>
        <Figure
          src="/images/thrust-stand/shield-schematic-to-pcb-1920.webp"
          full="/images/thrust-stand/shield-schematic-to-pcb.webp"
          width={1920}
          height={706}
          alt="The Rev02 shield schematic beside the same circuit as a board render, with five numbered blocks: 1 load cell amplifier, 2 motor speed pickup from one motor wire, 3 battery voltage scaled down to read safely, 4 current sensor input from a separate sensor, 5 throttle out and status lights. The board is split into a 5 V logic side and a battery side"
        >
          The Rev02 schematic and the same circuit in copper, split into a logic side and a battery side.
        </Figure>
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
          On 6 November 2026 I built the RPM front end on a protoboard and ran it on a spare 920 KV motor with a 1045
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
          capacitor across that resistor and a full re-test on a known-good motor. Rev02 of the shield carries the
          470 kΩ value, and the capacitor stays off the board until I have tested it properly.
        </p>
      </div>
      <div className="writeup-block">
        <h3 id="mechanical-stand">The mechanical stand</h3>
        <p>
          The motor mounts on a printed carriage that slides on two 8 mm steel rods in linear bearings, so thrust pushes
          the carriage back into the load cell through an adjustable screw, with a hard stop to protect the cell. The
          guard is three panels of 4.5 mm clear polycarbonate, which I collected on 18 September 2026.
        </p>
        <figure className={styles.figure}>
          {/* Under reduced motion the browser picks the still: step 3, thrust pressing on the load cell. */}
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/images/thrust-stand/thrust-stand-how-it-works-still.webp" />
            <img
              className={styles.animation}
              src="/images/thrust-stand/thrust-stand-how-it-works.webp"
              width={640}
              height={518}
              loading="lazy"
              decoding="async"
              alt="How it works, in three steps: with the motor off the sensor reads zero; thrust pushes the carriage along the rods; the load cell measures that push and the force reading rises. Movement is exaggerated: the real carriage moves under 0.5 mm"
            />
          </picture>
          <figcaption>
            How thrust becomes a reading. The movement is exaggerated, as the real carriage moves less than 0.5 mm.
          </figcaption>
        </figure>
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
