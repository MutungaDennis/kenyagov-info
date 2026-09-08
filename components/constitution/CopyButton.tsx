"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
};

export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  return (
    <div className="constitution-copy-control">
      <button
        type="button"
        className="govuk-button govuk-button--secondary govuk-!-margin-bottom-1"
        onClick={handleCopy}
      >
        {copied ? copiedLabel : label}
      </button>

      <span
        className="govuk-body-s constitution-copy-status"
        role="status"
        aria-live="polite"
      >
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}