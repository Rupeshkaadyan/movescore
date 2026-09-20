import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Breadcrumbs,
  Card,
  Container,
  SectionHeading,
} from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { computeTaxes } from "@/lib/calc/tax";
import { monthlyCosts } from "@/lib/calc/costOfLiving";
import { DEFAULT_INPUT } from "@/lib/defaults";
import { money, percent } from "@/lib/format";
import { AssumptionNote, SourceLine } from "@/components/results/panels";
import { COL_ASSUMPTIONS } from "@/lib/calc/notes";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return buildMetadata({ title: "City not found", path: `/cost-of-living/${slug}` });
  return buildMetadata({
    title: `Cost of living in ${city.name}, ${city.stateCode}`,
    description: `Monthly cost breakdown for ${city.name}: housing, utilities, groceries, transportation, healthcare and misc — plus the cost index against the U.S. average.`,
    path: `/cost-of-living/${slug}`,
  });
}

export default async function CostOfLivingPage({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  const input = DEFAULT_INPUT;
  const costs = monthlyCosts(city, input);
  const taxes = computeTaxes(input.salary, city, input.filingStatus);
  const takeHome = (input.salary - taxes.total) / 12;

  const lines = [
    { label: costs.housingDetail.label, value: costs.housing, note: costs.housingDetail.detail },
    { label: "Utilities", value: costs.utilities, note: "Electricity, gas, water, internet" },
    { label: "Groceries", value: costs.groceries, note: "Food at home" },
    { label: "Transportation", value: costs.transportation, note: input.ownsCar ? "Car ownership" : "Transit" },
    { label: "Healthcare", value: costs.healthcare, note: "Premiums and out-of-pocket" },
    { label: "Miscellaneous", value: costs.misc, note: "Dining, subscriptions, personal" },
  ];

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cost of living", href: "/cost-of-living" },
          { name: cityLabel(city) },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Cost of living in {city.name}, {city.stateCode}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          {city.name} sits at {city.metrics.colIndex} on our cost index, where 100
          is the U.S. average. Below is what that means in dollars for a single
          person renting with a car.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Summary">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Total monthly cost
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(costs.total)}
          </p>
          <p className="mt-1 text-xs text-muted">Excludes taxes</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Take-home on {money(input.salary)}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(takeHome)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Effective tax rate {percent(taxes.effectiveRate, 1)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Leftover
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(takeHome - costs.total)}
          </p>
          <p className="mt-1 text-xs text-muted">Per month after costs</p>
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="breakdown">
        <SectionHeading eyebrow="Breakdown" title="Where the money goes each month" />
        <Card className="mt-6 p-6">
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <li key={line.label} className="flex items-start justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-ink">{line.label}</span>
                  <span className="block text-xs text-muted">{line.note}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {money(line.value)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-sm font-semibold tabular-nums text-ink">
                {money(costs.total)}
              </span>
            </li>
          </ul>
          <AssumptionNote items={COL_ASSUMPTIONS} />
          <SourceLine group="cost-of-living" />
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="compare-cta">
        <SectionHeading
          eyebrow="Next step"
          title="See how it compares to where you live now"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.filter((c) => c.slug !== city.slug)
            .slice(0, 6)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/compare/${city.slug}-vs-${other.slug}`}
                className="card flex items-center justify-between gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
              >
                <span className="text-sm font-semibold text-ink">
                  {city.name} vs {other.name}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              </Link>
            ))}
        </div>
      </section>
    </Container>
  );
}
