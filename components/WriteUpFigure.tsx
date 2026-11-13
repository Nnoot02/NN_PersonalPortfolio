import styles from "./WriteUpFigure.module.css";

// One figure in a case-study write-up. Diagrams come from my capstone final
// presentation (deliverables/drafts/final-2026-11-12) and keep their own paper
// ground. A static figure links to its full-size file; an animated one serves a
// still under prefers-reduced-motion, with no JavaScript.
type Base = { width: number; height: number; alt: string; children: React.ReactNode };
type Static = Base & { src: string; full: string; still?: never };
type Animated = Base & { src: string; still: string; full?: never };

export function WriteUpFigure(props: Static | Animated) {
  const { src, width, height, alt, children } = props;
  return (
    <figure className={styles.figure}>
      {props.still ? (
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={props.still} />
          <img className={styles.animation} src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
        </picture>
      ) : (
        <img src={src} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
      )}
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
