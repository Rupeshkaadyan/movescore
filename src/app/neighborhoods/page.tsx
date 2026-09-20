import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { CITIES_WITH_NEIGHBORHOODS, neighborhoodsForCity } from "@/lib/data/neighborhoods";
import { money } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Neighborhoods by city — rent, commute, schools and safety",
  description:
    "Neighbourhood-level data for major U.S. cities: rent, home prices, commute time, school scores, safety and walkability.",
  path: "/neighborhoods",
});

export default function NeighborhoodsIndexPage() {
  const cities = CITIES_WITH_NEIGHBORHOODS.map((slug) => CITIES.find((c) => c.slug === slug)).filter(
    (city): city is NonNullable<typeof city> => Boolean(city),
  );

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Neighborhoods"
        title="City averages hide the truth"
        description="Within a single city, one-bedroom rents can vary by more than $1,000 a month between neighbourhoods. We publish neighbourhood pages where we have complete data for every area."
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const hoods = neighborhoodsForCity(city.slug);
          const rents = hoods.map((h) => h.rent1br);
          return (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}/neighborhoods`}
                className="card flex h-full flex-col p-6 hover:shadow-[var(--shadow-lift)]"
              >
                <h2 className="text-base font-semibold text-ink">{cityLabel(city)}</h2>
                <p className="mt-1 text-xs text-muted">
                  {hoods.length} neighborhoods · rent from {money(Math.min(...rents))} to{" "}
                  {money(Math.max(...rents))}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{city.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Compare neighborhoods
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-sm text-muted">
        More cities are added as neighbourhood data is ingested. Meanwhile,{" "}
        <Link href="/cities" className="font-medium text-brand hover:underline">
          city-level profiles
        </Link>{" "}
        cover all 30.
      </p>
    </Container>
  );
}
