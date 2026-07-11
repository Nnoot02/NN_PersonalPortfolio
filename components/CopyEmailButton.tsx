"use client";

import { Copy } from "@phosphor-icons/react";
import { useState } from "react";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <button className="button button-primary" type="button" onClick={copyEmail}>
      <Copy size={20} /> {copied ? "Copied email" : "Copy email"}
    </button>
  );
}
