import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { money } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cost of living by U.S. city",
  description:
    "Cost-of-living index and monthly budget breakdown for 30 major U.S. cities. Compare housing, utilities, groceries, transport and healthcare.",
  path: "/cost-of-living",
});

export default function CostOfLivingIndexPage() {
  const ranked = [...CITIES].sort((a, b) => a.metrics.colIndex - b.metrics.colIndex);

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Cost of living"
        title="Every city, ranked by cost index"
        description="100 is the U.S. average. Rent is the single biggest driver of the differences below — which is why MoveScore models housing at your household size rather than at a city average."
      />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/cost-of-living/${city.slug}`}
              className="card flex h-full flex-col p-5 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold text-ink">{cityLabel(city)}</span>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {city.metrics.colIndex}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Median 1-bed {money(city.metrics.medianRent1br)}/mo · Median home{" "}
                {money(city.metrics.medianHomePrice)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Full breakdown
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
