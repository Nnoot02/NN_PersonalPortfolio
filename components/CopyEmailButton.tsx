"use client";

import { Copy } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copying" | "copied" | "failed";

const LABELS: Record<CopyState, string> = {
  idle: "Copy email",
  copying: "Copying email",
  copied: "Copied email",
  failed: "Copy failed",
};

const ANNOUNCEMENTS: Partial<Record<CopyState, string>> = {
  copied: "Email address copied to clipboard.",
  failed: "Could not copy. Use the address shown next to this button.",
};

export function CopyEmailButton({ email, label = "Copy email", variant = "primary" }: { email: string; label?: string; variant?: "primary" | "secondary" }) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function copyEmail() {
    window.clearTimeout(resetTimer.current);
    setState("copying");
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    resetTimer.current = window.setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      <button className={`button button-${variant}`} type="button" onClick={copyEmail} disabled={state === "copying"}>
        <Copy size={20} /> {state === "idle" ? label : LABELS[state]}
      </button>
      <span className="sr-only" role="status">{ANNOUNCEMENTS[state] ?? ""}</span>
    </>
  );
}
