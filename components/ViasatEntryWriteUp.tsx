import styles from "./ViasatEntryWriteUp.module.css";

// Phase 2 cards as submitted (27 Sep 2026), except local-link.webp: a web
// re-render of card 05b with its two on-screen em dashes replaced (audit M1).
// Nathan, 2026-10-20: cards only; the full video is held back for now.
const cards = {
  mapFirst: {
    src: "/images/viasat-entry/map-first.webp",
    alt: "Card titled Map first: the occupancy map of the demo survey is 42 kB, measured in the shot 4 demo, against roughly 20 MB for the same 32 seconds of HD video",
  },
  localLink: {
    src: "/images/viasat-entry/local-link.webp",
    alt: "Card titled The local link: Wi-Fi HaLow, IEEE 802.11ah, as the candidate drone-to-relay bearer, with the bench link through walls marked not yet measured and in-rubble range marked modelled",
  },
  envelope: {
    src: "/images/viasat-entry/envelope.webp",
    alt: "Card titled Where this works: post-earthquake structural search is in the envelope, active-fire interiors with heavy smoke, dust or darkness are out of it",
  },
  bom: {
    src: "/images/viasat-entry/bom.webp",
    alt: "Card titled Built from commodity parts: a flight-ready bill of materials of A$1,084.84 tracking to the A$1,100 cap, with OAK-D Lite stereo depth, ArduPilot, Raspberry Pi 5 with ROS 2 and D* Lite replanning, marked building, not yet flying",
  },
  metrics: {
    src: "/images/viasat-entry/metrics.webp",
    alt: "Card titled How we will know it worked: time to first interior map under 15 minutes as a target, structures assessed per taskforce-day, and responder entries avoided, all labelled targets and trial measures, not results",
  },
} as const;

function Card({ card, caption }: { card: { src: string; alt: string }; caption: string }) {
  return (
    <figure className={styles.card}>
      <img src={card.src} alt={card.alt} width={1920} height={1080} loading="lazy" decoding="async" />
      <figcaption>
        {caption} <a href={card.src} target="_blank" rel="noopener">Open full size<span className="sr-only"> (opens in a new tab)</span></a>
      </figcaption>
    </figure>
  );
}

export function ViasatEntryWriteUp() {
  return (
    <section className="writeup" aria-label="Phase 2 entry">
      <div className="writeup-heading">
        <p className="eyebrow">Phase 2 · what I submitted</p>
        <h2>Two segments, one interface.<br />The satellite side was never measured.</h2>
        <p>Last-Metre Eyes targets the last metres of a disaster search, inside collapsed or damaged buildings, where GPS does not work and the local cell network is often down at the same time. The concept splits the job in two, as a satellite cannot reach inside rubble and a drone cannot reach incident command on its own.</p>
      </div>
      <div className="writeup-block">
        <h3 id="two-segments">Two segments</h3>
        <p>The first segment is the drone, which is designed to navigate without GPS using visual-inertial odometry, stereo depth and D* Lite replanning. This is the aircraft I am building for my <a className="text-link" href="/projects/gps-denied-autonomous-uav">GPS-denied capstone</a>, so the drone in the entry was hardware already on my bench.</p>
        <p>The second is a one-button relay node at the site perimeter, where it has sky view. The drone sends its map, position track and detection events to the relay over a local radio link, and the relay backhauls them over Viasat&apos;s L-band network to incident command. Because the traffic between the segments is MAVLink and ROS 2 over IP, the drone stack is the same whether the backhaul is bench Wi-Fi or a satellite terminal, which is what made a mocked satellite link a fair test of the drone side.</p>
        <p>The demo in the video ran real MAVLink traffic over a link shaped to published L-band latency and bandwidth, with the bearer labelled on screen as a mock.</p>
      </div>
      <div className="writeup-block">
        <h3 id="map-first">Why the autonomy matters to the link</h3>
        <p>Remote piloting a camera through a collapsed building needs a broadband link that no satellite can push into rubble. Moving perception and replanning onto the aircraft changes what has to leave the site, from a video stream to an occupancy map, a position track and a short list of detection events, and that fits inside narrowband L-band capacity. That idea was the novelty claim in my Phase 1 answers.</p>
        <Card card={cards.mapFirst} caption="The 42 kB is the map from the synthetic survey in my shot 4 demo. The 20 MB is a round figure for the same 32 seconds of HD video, so this card compares one survey and is not a compression ratio for the field." />
      </div>
      <div className="writeup-block">
        <h3 id="local-link">The link I could not measure</h3>
        <p>My Phase 1 answers referred to a local link between the drone and the relay but never said what it was, and a rubric review before submission had flagged that as the likeliest question from a technical judge. For Phase 2 I named Wi-Fi HaLow (IEEE 802.11ah) as the candidate, as it is sub-gigahertz, native IP and has Australian silicon from Morse Micro in Sydney. I labelled its range as modelled, because I did not own any HaLow hardware and buying it before Phase 2 would have broken the no-new-hardware rule I set for the entry.</p>
        <Card card={cards.localLink} caption="The in-rubble range is modelled from published attenuation of roughly 6 to 10 dB per concrete wall at 915 MHz (QUT, 2024). It is not a measurement of this system, and I have not checked ACMA compliance for this use." />
        <p>Naming a candidate I could later revise was a better position than leaving the central interface blank, although it means the strongest claim in the entry rests on someone else&apos;s measurements. A bench link through a counted number of walls at a known distance is the first measurement I would take.</p>
      </div>
      <div className="writeup-block">
        <h3 id="envelope">Where it works, and what it costs</h3>
        <p>My navigation stack depends on cameras, and heavy smoke, dust or darkness degrade both the odometry and the stereo depth. I bounded the mission to post-earthquake structural search rather than claim active-fire interiors, with optical flow and a rangefinder as the position-hold fallback.</p>
        <Card card={cards.envelope} caption="The operating envelope as it appeared in the video." />
        <p>The A$1,084.84 is the drone bill of materials as I submitted it on 27 September 2026, against my capstone&apos;s A$1,100 budget cap. It is the forecast from my capstone cost register, including risk reserve, with some lines still awaiting landed costs at the time, and I have not re-checked it since. It covers the aircraft only, as there was no costing for the relay node or airtime.</p>
        <Card card={cards.bom} caption="The bill-of-materials card. The aircraft was still being built, not flying, when this was submitted." />
      </div>
      <div className="writeup-block">
        <h3 id="metrics">How I would have measured impact</h3>
        <p>The metrics I submitted were time to first interior map, structures assessed per taskforce-day against the agency&apos;s own baseline, and responder entries avoided, counted from a trial log. None of them was measured, and the under-15-minute figure is a design target.</p>
        <Card card={cards.metrics} caption="The impact card, labelled as targets and trial measures in the video as well." />
      </div>
      <div className="writeup-block">
        <h3>What I took from it</h3>
        <p>Juggling school, work and this project, I knew one of them would suffer in quality, and the reviewers&apos; feedback confirmed the concerns I already had about my submission. In hindsight, too much of my time went into the drone build, and I should have re-recorded scenes to show a more confident delivery.</p>
        <p>After my TAFE capstone finishes in December, I will keep working towards the capabilities I planned for this entry: proving the complete system with mock relays I build myself, and researching what would make it commercially viable and what sets it apart from current solutions.</p>
        <p>Public speaking still makes me nervous, so I plan to enter more challenges like VSFG 2027 that make me present.</p>
        <p>Thank you to Viasat and HeroX for organising the challenge.</p>
      </div>
    </section>
  );
}
