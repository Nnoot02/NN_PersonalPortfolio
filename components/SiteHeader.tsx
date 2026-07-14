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

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Link className="wordmark" href="/" aria-label="Nathan portfolio home">
        {isHome ? (
          <span className="wordmark-home">NN<span className="wordmark-period">.</span></span>
        ) : (
          <>
            <span className="wordmark-desktop">Nathan No-ot</span>
            <span className="wordmark-mobile">NN<span className="wordmark-period">.</span></span>
          </>
        )}
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
