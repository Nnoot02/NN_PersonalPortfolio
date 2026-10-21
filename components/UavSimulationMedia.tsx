import styles from "./UavSimulationMedia.module.css";

export function UavFaultResponse() {
  return (
    <div className="writeup-block" data-uav-fault-response>
      <h3>Depth loss: failure and recovery</h3>
      <p>Cutting the depth stream exposed a failure in the old planner: it continued into an obstacle without fresh perception. With the watchdog added, the aircraft held position until depth returned, then replanned and resumed the flight.</p>
      <div className={styles.pair}>
        <figure className={styles.figure}>
          <video controls playsInline preload="none" poster="/images/uav-simulation/failure-poster.webp" aria-label="Reconstruction of old-code flight after depth loss" aria-describedby="uav-failure-caption">
            <source src="/videos/uav-simulation/depth-loss-reconstruction.webm" type="video/webm" />
            <track kind="captions" src="/videos/uav-simulation/depth-loss-reconstruction.vtt" srcLang="en" label="Flight events" />
            <a href="/videos/uav-simulation/depth-loss-reconstruction.webm">Download failure reconstruction</a>
          </video>
          <figcaption id="uav-failure-caption">
            <h4>Failure reconstruction · 35 s</h4>
            <p>The pre-fix code keeps flying after depth is cut and strikes an obstacle. This reconstructs the failure behaviour; the original failed trial was not recorded.</p>
            <details><summary>Read flight sequence</summary><p>About 6 s: takeoff finishes and depth is cut. About 16 s: the aircraft reaches the box and collides. About 31 s: ArduPilot&apos;s crash check disarms it.</p></details>
          </figcaption>
        </figure>
        <figure className={styles.figure}>
          <video controls playsInline preload="none" poster="/images/uav-simulation/recovery-poster.webp" aria-label="Watchdog holds position after depth loss and resumes after recovery" aria-describedby="uav-recovery-caption">
            <source src="/videos/uav-simulation/watchdog-hold-resume.webm" type="video/webm" />
            <track kind="captions" src="/videos/uav-simulation/watchdog-hold-resume.vtt" srcLang="en" label="Flight events" />
            <a href="/videos/uav-simulation/watchdog-hold-resume.webm">Download watchdog recovery flight</a>
          </video>
          <figcaption id="uav-recovery-caption">
            <h4>Watchdog recovery · 45 s</h4>
            <p>Under the same type of depth-loss fault, the revised planner holds position, then resumes avoidance after the stream returns.</p>
            <details><summary>Read flight sequence</summary><p>About 10.5 s: depth is cut. About 13 s: perception loss triggers position hold. About 23 s: the bridge restarts; perception returns around 24.5 s. The aircraft reaches its goal around 41.5 s.</p></details>
          </figcaption>
        </figure>
      </div>
      <p>Recorded on 1 October 2026 with the earlier 0.45 m planner inflation. These silent clips are Gazebo camera-sensor renders with truth-derived path overlays, rather than recordings of the counted 0.7 m batches. Clip event times are approximate.</p>
    </div>
  );
}

const baselinePlots = [
  { stem: "baseline-box", poster: "/images/uav-simulation/baseline-box.webp", animation: "/videos/uav-simulation/baseline-box.mp4", title: "Box", clearance: "0.61 m", alt: "Ten baseline truth tracks divert around the box; all reach the goal with at least 0.61 m centre clearance." },
  { stem: "baseline-pillar", poster: "/images/uav-simulation/baseline-pillar.webp", animation: "/videos/uav-simulation/baseline-pillar.mp4", title: "Pillar", clearance: "0.64 m", alt: "Ten baseline truth tracks pass around the pillar; all reach the goal with at least 0.64 m centre clearance." },
  { stem: "baseline-wall", poster: "/images/uav-simulation/baseline-wall.webp", animation: "/videos/uav-simulation/baseline-wall.mp4", title: "Wall", clearance: "0.57 m", alt: "Ten baseline truth tracks pass the end of the wall; all reach the goal with at least 0.57 m centre clearance." },
];

export function UavResultsGallery() {
  return (
    <div className="writeup-block" data-uav-results-gallery>
      <h3>Results gallery</h3>
      <p>The baseline tracks, a held-out clearance miss and the delayed-depth comparison show different parts of the investigation. Animations run at four times simulation speed, aligned at each run&apos;s first horizontal movement. Playback starts only when selected.</p>
      {baselinePlots.map(({ stem, poster, animation, title, clearance, alt }) => (
        <figure className={`${styles.figure} ${styles.row}`} key={stem}>
          <video controls playsInline preload="none" poster={poster} aria-label={`${title}: ten baseline trial trajectories at four times speed`} aria-describedby={`uav-${stem}-caption`}>
            <source src={animation} type="video/mp4" />
            <a href={animation}>Download {title.toLowerCase()} animation</a>
          </video>
          <figcaption id={`uav-${stem}-caption`}>
            <h4>Baseline · {title}</h4>
            <p>{alt} The planner used 0.7 m inflation, 0.5 m/s commanded speed and 3.0 m sensing range.</p>
            <p>10/10 arrivals · minimum clearance {clearance}<br />Counted batch: 2 October 2026.</p>
            <a href={poster}>Open full-size {title.toLowerCase()} plot</a>
          </figcaption>
        </figure>
      ))}
      <figure className={`${styles.figure} ${styles.row}`}>
        <video controls playsInline preload="none" poster="/images/uav-simulation/heldout-box-02.webp" aria-label="Held-out box trial 02: arrival with a clearance requirement breach" aria-describedby="uav-heldout-caption">
          <source src="/videos/uav-simulation/heldout-box-02.mp4" type="video/mp4" />
          <a href="/videos/uav-simulation/heldout-box-02.mp4">Download held-out clearance animation</a>
        </video>
        <figcaption id="uav-heldout-caption">
          <h4>Held-out · arrived, clearance missed</h4>
          <p>Box trial 02 reached its goal, but passed only 0.41 m from the true obstacle footprint. It is one of three clearance misses across 30 held-out runs.</p>
          <p>The full footprint shown here is simulator ground truth, not the planner&apos;s observed occupancy map. Inflation protects observed cells, so the unseen depth of an obstacle can leave insufficient clearance around its corners.</p>
          <a href="/images/uav-simulation/heldout-box-02.webp">Open full-size held-out plot</a>
        </figcaption>
      </figure>
      <figure className={`${styles.figure} ${styles.comparison}`}>
        <a href="/images/uav-simulation/depth-delay-comparison.png" aria-label="Open full-size depth-delay comparison plot">
          <img src="/images/uav-simulation/depth-delay-comparison.png" width="1080" height="576" loading="lazy" alt="At 0.4 seconds depth delay, newest-pose placement has twelve of thirty runs below 0.5 m clearance; capture-time placement keeps all thirty above the requirement." />
        </a>
        <figcaption>
          <h4>Depth delay · place frames at capture time</h4>
          <p>With an injected 0.4 s depth delay, newest-pose placement produced 22/30 collision-free arrivals, five contacts and twelve clearance breaches. Optional capture-time placement restored 30/30 collision-free arrivals with a minimum clearance of 0.61 m.</p>
          <p>These 4 and 5 October batches used the same seeds and goals, so the rerun tests the fix on known cases. Capture-time placement remains off by default pending hardware clock checks and the remaining adoption checks.</p>
        </figcaption>
      </figure>
      <p>Wind, vibration and sensing range were also tested: wind exposed further clearance failures, shorter sensing range reduced clearance margin, and injected vibration produced no measurable effect within the simulator&apos;s limits.</p>
      <p>Plots use logged simulator truth. The dotted rectangular guides mark a 0.5 m clearance allowance around the true obstacle footprint; reported clearance uses Euclidean distance, including at corners. They do not show the planner&apos;s inflated occupancy grid.</p>
    </div>
  );
}
