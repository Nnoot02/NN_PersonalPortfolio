"use client";

import { useState } from "react";
import styles from "./WriteUpFigure.module.css";

// One figure in a case-study write-up. Diagrams come from my capstone final
// presentation (deliverables/drafts/final-2026-11-12) and keep their own paper
// ground. A static figure links to its full-size file; an animated one serves a
// still under prefers-reduced-motion, which needs no JavaScript.
//
// The animated variant also carries a pause control (audit 2026-11-13, A11Y-01):
// the tour is a 10 s looping WebP inside an <img>, and WCAG 2.2.2 needs a
// mechanism that stops it, not only the operating-system setting. Pausing swaps
// the frame for the still, so the reader keeps the last state without the motion.
type Base = { width: number; height: number; alt: string; children: React.ReactNode };
type Static = Base & { src: string; full: string; still?: never };
type Animated = Base & { src: string; still: string; full?: string };

export function WriteUpFigure(props: Static | Animated) {
  const { src, width, height, alt, children } = props;
  const [paused, setPaused] = useState(false);
  const animated = Boolean(props.still);
  const imageSrc = animated && paused ? props.still : src;

  const image = (
    <img
      className={animated ? styles.animation : undefined}
      src={imageSrc}
      width={width}
      height={height}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );

  return (
    <figure className={styles.figure}>
      {animated ? (
        <>
          <p className={styles.hint}>Scroll sideways to see all four steps.</p>
          <div className={styles.scroller}>
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={props.still} />
              {image}
            </picture>
          </div>
        </>
      ) : (
        image
      )}
      {animated ? (
        <button
          type="button"
          className={styles.pause}
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
        >
          {paused ? "Play the four-step tour" : "Pause the four-step tour"}
        </button>
      ) : null}
      <figcaption>
        {children}
        {props.full ? (
          <>
            {" "}
            <a className="text-link" href={props.full} target="_blank" rel="noopener">Open full size<span className="sr-only"> (opens in a new tab)</span></a>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
