"use client";

import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["Home", "/"],
  ["Projects", "/projects"],
  ["About", "/about"],
  ["Profile", "/profile"],
  ["Resume", "/resume"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Link className="wordmark" href="/" aria-label="Nathan portfolio home">
        N<span>.</span>
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
      </button>
      <nav className={open ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
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
