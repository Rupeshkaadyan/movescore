import Link from "next/link";
import { Info } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { DATA_SNAPSHOT } from "@/lib/data/sources";

/**
 * Shown on every page while the platform runs on demo data.
 * This is a hard requirement: demo numbers must never read as verified data.
 */
export function DemoNotice() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 no-print">
      <Container className="flex items-start gap-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <p className="text-xs leading-relaxed text-amber-900">
          <strong className="font-semibold">Demo data.</strong> The figures on
          this build are realistic placeholders for development (snapshot{" "}
          {DATA_SNAPSHOT}), not verified statistics.{" "}
          <Link href="/methodology" className="font-semibold underline">
            How MoveScore sources and calculates data
          </Link>
        </p>
      </Container>
    </div>
  );
}
