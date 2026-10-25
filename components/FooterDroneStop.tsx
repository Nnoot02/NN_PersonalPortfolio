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
        <g fill="currentColor">
          <ellipse className="footer-drone-prop" cx="6" cy="3.2" rx="5.5" ry=".9" />
          <ellipse className="footer-drone-prop" cx="34" cy="3.2" rx="5.5" ry=".9" />
          <rect x="5" y="4" width="2" height="2.6" />
          <rect x="33" y="4" width="2" height="2.6" />
          <rect x="5" y="6" width="30" height="1.4" />
          <rect x="13" y="7" width="14" height="4.6" rx="1" />
          <circle cx="25.5" cy="12.4" r="1.4" />
        </g>
        <path d="M15 11.4 5.5 18.6M25 11.4 34.5 18.6M3.5 18.6h4M32.5 18.6h4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
