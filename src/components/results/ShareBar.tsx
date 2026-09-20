"use client";

import { useState } from "react";
import { Bookmark, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { track } from "@/lib/analytics";

export function ShareBar({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [saveNote, setSaveNote] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        onClick={() => {
          track("report_downloaded", { format: "print" });
          window.print();
        }}
      >
        <Download className="h-4 w-4" aria-hidden />
        Download report
      </Button>
      <Button variant="secondary" onClick={copy}>
        <Link2 className="h-4 w-4" aria-hidden />
        {copied ? "Link copied" : "Copy share link"}
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          track("comparison_saved", { status: "unavailable" });
          setSaveNote(true);
        }}
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        Save comparison
      </Button>
      <p aria-live="polite" className="w-full text-xs text-muted">
        {saveNote
          ? "Saved comparisons arrive with accounts (Phase 5). Copy the share link to keep this comparison today."
          : "Saving and PDF export via accounts arrive in Phase 5. Printing this page produces a clean report today."}
      </p>
    </div>
  );
}
