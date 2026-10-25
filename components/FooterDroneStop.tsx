"use client";

import { useEffect, useRef, useState } from "react";

// Homepage footer full stop (Nathan's pick, 2026-10-25, option B): a drone
// flies in and collapses into the "." the first time the footer is seen.
// The glyph is always in the DOM; it is only hidden once JS has armed the
// flight under no-preference motion, so no-JS and reduced-motion readers get
// a plain full stop.
export function FooterDroneStop() {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "landing">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    setState("armed");
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setState("landing");
      io.disconnect();
    }, { threshold: 1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className="footer-stop" data-footer-drone={state}>
      <span className="footer-stop-glyph">.</span>
      <svg className="footer-drone" viewBox="0 0 40 20" aria-hidden="true" focusable="false">
        {/* F450 side profile: props on motor bells, arms sandwiched between
            the top plate and the power-distribution plate, battery slung
            underneath, legs straight down under the motors. */}
        <g fill="currentColor">
          <ellipse className="footer-drone-prop" cx="6" cy="2.4" rx="6.5" ry=".7" />
          <ellipse className="footer-drone-prop" cx="34" cy="2.4" rx="6.5" ry=".7" />
          <rect x="5.6" y="2.6" width=".8" height="1" />
          <rect x="34.6" y="2.6" width=".8" height="1" />
          <rect x="4.5" y="3.5" width="3" height="2.7" rx=".4" />
          <rect x="32.5" y="3.5" width="3" height="2.7" rx=".4" />
          <rect x="17" y="3.4" width="6" height="1.4" rx=".3" />
          <rect x="12" y="5" width="16" height=".9" />
          <rect x="4" y="6.1" width="32" height="1.7" rx=".4" />
          <rect x="12" y="8" width="16" height=".9" />
          <rect x="14" y="9.4" width="12" height="2.8" rx=".5" />
        </g>
        <path d="M6 7.8v10.8M34 7.8v10.8M3.5 18.6h5M31.5 18.6h5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
