"use client";

import { useState } from "react";
import { ScrollPane } from "./ScrollPane";
import styles from "./WriteUpFigure.module.css";

// Playback control for an animated figure (audit 2026-11-13, A11Y-01): the app
// tour is a 10 s looping WebP inside an <img>, and WCAG 2.2.2 needs a mechanism
// that stops it, not only the operating-system setting. Pausing swaps the frame
// for the still, so the reader keeps the last state without the motion, and the
// button sits outside the scroll box so it never scrolls away.
//
// The still also stays the reduced-motion source inside <picture>, so a reader
// with that preference never needs the control (the CSS hides it there).
export function FigurePlayback({
  src,
  still,
  width,
  height,
  alt,
  label,
  minWidth = 720,
  pauseLabel = "the animation",
}: {
  src: string;
  still: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  minWidth?: number;
  pauseLabel?: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <ScrollPane label={label} minWidth={minWidth}>
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={still} />
          <img
            className={styles.animation}
            src={paused ? still : src}
            width={width}
            height={height}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </ScrollPane>
      <p className={styles.scrollHint}>Scroll or use the arrow keys to see the whole figure.</p>
      <button
        type="button"
        className={styles.pause}
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
      >
        {paused ? `Play ${pauseLabel}` : `Pause ${pauseLabel}`}
      </button>
    </>
  );
}
