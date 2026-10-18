"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function FooterNavLink({ href, children, ...props }: { href: string; children: ReactNode; "data-footer-utility"?: true }) {
  const pathname = usePathname();
  const current = pathname === href ? "page" : pathname.startsWith(`${href}/`) ? "location" : undefined;
  return <Link href={href} aria-current={current} {...props}>{children}</Link>;
}
