"use client";

import { useState } from "react";
import { Bookmark, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";

export function ShareBar({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

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
      <Button variant="primary" onClick={() => window.print()}>
        <Download className="h-4 w-4" aria-hidden />
        Download report
      </Button>
      <Button variant="secondary" onClick={copy}>
        <Link2 className="h-4 w-4" aria-hidden />
        {copied ? "Link copied" : "Copy share link"}
      </Button>
      <Button variant="secondary" disabled ariaLabel="Saving arrives with accounts">
        <Bookmark className="h-4 w-4" aria-hidden />
        Save comparison
      </Button>
      <p className="w-full text-xs text-muted">
        Saving and PDF export via accounts arrive in Phase 5. Printing this page
        produces a clean report today.
      </p>
    </div>
  );
}
