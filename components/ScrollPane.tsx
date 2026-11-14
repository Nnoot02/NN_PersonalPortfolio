"use client";

import { useEffect, useRef } from "react";
import styles from "./WriteUpFigure.module.css";

// Horizontal home for a dense diagram below 720px. A 1600-1920px drawing
// squeezed into a 350px slot renders its labels illegible, so the figure
// scrolls inside its own box at a legible minimum width instead.
//
// The container is focusable only where it actually scrolls: server output
// starts at 0 so hydration matches, then the media query moves it to -1 on
// desktop, which keeps six extra stops out of the tab order there. The
// wrapper is a client component so WriteUpFigure stays server-rendered.
//
// minWidth defaults to the 1000px floor a wide diagram needs. The animated
// app-tour figure passes 720 instead: it is an 800px capture, so 1000 would
// upscale it (audit 2026-11-13, UIUX-04).
export function ScrollPane({
  label,
  minWidth = 1000,
  children,
}: {
  label: string;
  minWidth?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const query = window.matchMedia("(max-width: 720px)");
    const apply = () => {
      element.tabIndex = query.matches ? 0 : -1;
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <div
      ref={ref}
      className={styles.scroll}
      role="group"
      aria-label={label}
      tabIndex={0}
      style={{ "--scroll-min": `${minWidth}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
