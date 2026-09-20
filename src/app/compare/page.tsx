import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { HeroSearch } from "@/components/home/HeroSearch";
import { CITIES, POPULAR_COMPARISONS, cityLabel } from "@/lib/data/cities";
import { cityOptionList } from "@/lib/cities";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare U.S. cities — cost of living, salary and MoveScore",
  description:
    "Pick two U.S. cities and get a personalized comparison: take-home pay, rent, taxes, housing, jobs, weather and a transparent MoveScore.",
  path: "/compare",
});

export default function CompareIndexPage() {
  const cities = cityOptionList();

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Compare cities"
        title="Pick two cities and see what changes"
        description="Enter your salary, household size and housing choice. The result is a full financial and lifestyle comparison, not a single index number."
      />

      <div className="mt-8 max-w-3xl">
        <HeroSearch cities={cities} defaultFrom="new-york-ny" defaultTo="austin-tx" />
      </div>

      <section className="mt-14" aria-labelledby="popular">
        <SectionHeading
          eyebrow="Popular comparisons"
          title="Comparisons people start with"
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_COMPARISONS.map((pair) => {
            const from = CITIES.find((c) => c.slug === pair.from);
            const to = CITIES.find((c) => c.slug === pair.to);
            if (!from || !to) return null;
            return (
              <li key={`${pair.from}-${pair.to}`}>
                <Link
                  href={`/compare/${pair.from}-vs-${pair.to}`}
                  className="card flex h-full items-center justify-between gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {from.name} vs {to.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{pair.note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="all-cities">
        <SectionHeading
          eyebrow="Build your own"
          title={`All ${CITIES.length} cities`}
          description="Open any city to see its full profile, then compare it against anywhere else."
        />
        <ul className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CITIES.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="rounded-lg border border-line px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand hover:text-brand"
              >
                {cityLabel(city)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
