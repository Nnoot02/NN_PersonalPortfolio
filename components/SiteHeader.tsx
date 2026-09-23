"use client";

import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Home", "/"],
  ["Projects", "/projects"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // PLAN v7 Rev 3 (audit C1), corrected by Rev 4 (audit D1). The spec strip's
  // top offset and every fragment jump hang off --header-h, and the header is a
  // min-height box whose content grows with root text (138px at 200% text
  // against the 76px floor). Measure it instead of asserting it -- but write
  // the result as --header-measured, never into --header-h itself: min-height
  // reads --header-floor, and a measurement written into what min-height
  // reads would pin the header at its last measured height (it could never
  // shrink again, and an inline value would defeat the <=720px floor).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty("--header-measured", `${Math.round(header.getBoundingClientRect().height)}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--header-measured");
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="site-header" ref={headerRef}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Link className="wordmark" href="/">
        {isHome ? (
          <span className="wordmark-home">NN<span className="wordmark-period">.</span></span>
        ) : (
          <>
            <span className="wordmark-desktop">Nathan No-ot</span>
            <span className="wordmark-mobile">NN<span className="wordmark-period">.</span></span>
          </>
        )}
        <span className="sr-only">, portfolio home</span>
      </Link>
      <button
        ref={menuButtonRef}
        className="menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
      </button>
      <nav id="primary-navigation" className={open ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
        {links.map(([label, href]) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              className={active ? "nav-link is-active" : "nav-link"}
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
