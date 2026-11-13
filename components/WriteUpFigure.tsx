import { ScrollPane } from "./ScrollPane";
import styles from "./WriteUpFigure.module.css";

// One figure in a case-study write-up. Diagrams come from my capstone final
// presentation (deliverables/drafts/final-2026-11-12) and keep their own paper
// ground. A static figure links to its full-size file; an animated one serves a
// still under prefers-reduced-motion, with no JavaScript.
//
// `scroll` marks a dense diagram: below 720px it scrolls inside its own box at
// a legible minimum width instead of shrinking into the phone column. The
// string is the region's accessible name, so pass what the diagram is.
type Base = { width: number; height: number; alt: string; children: React.ReactNode };
type Static = Base & { src: string; full: string; still?: never; scroll?: string };
type Animated = Base & { src: string; still: string; full?: never; scroll?: never };

export function WriteUpFigure(props: Static | Animated) {
  const { src, width, height, alt, children } = props;
  const image = <img className={props.still ? styles.animation : undefined} src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" />;
  return (
    <figure className={styles.figure}>
      {props.still ? (
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={props.still} />
          {image}
        </picture>
      ) : props.scroll ? (
        <ScrollPane label={props.scroll}>{image}</ScrollPane>
      ) : (
        image
      )}
      {!props.still && props.scroll ? <p className={styles.scrollHint}>Scroll or use the arrow keys to read the diagram.</p> : null}
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
