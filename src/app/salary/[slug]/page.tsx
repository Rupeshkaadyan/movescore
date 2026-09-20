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
import { DataProvenance } from "@/components/ui/DataProvenance";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { computeTaxes } from "@/lib/calc/tax";
import { DEFAULT_INPUT, SALARY_PRESETS } from "@/lib/defaults";
import { money, percent } from "@/lib/format";
import { AssumptionNote } from "@/components/results/panels";
import { TAX_ASSUMPTIONS_LABEL } from "@/lib/calc/notes";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return buildMetadata({ title: "Salary calculator", path: "/salary" });
  return buildMetadata({
    title: `Salary calculator — take-home pay in ${city.name}, ${city.stateCode}`,
    description: `Work out take-home pay after federal, state and local tax and FICA in ${city.name}, ${city.stateCode}, and what it covers at local prices.`,
    path: `/salary/${slug}`,
  });
}

export default async function SalaryCityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  const salary = DEFAULT_INPUT.salary;
  const taxes = computeTaxes(salary, city, DEFAULT_INPUT.filingStatus);
  const monthly = (salary - taxes.total) / 12;

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/cities" },
          { name: cityLabel(city), href: `/cities/${city.slug}` },
          { name: "Salary calculator" },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Take-home pay in {city.name}, {city.stateCode}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          Start from {money(salary)} and adjust. Every level below shows the tax
          split for {city.name}, including{" "}
          {city.metrics.hasStateIncomeTax
            ? `${city.state}'s ${percent(city.metrics.stateIncomeTaxRate, 2)} effective state rate`
            : "no state income tax"}
          .
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Take-home summary">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Annual take-home on {money(salary)}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(salary - taxes.total)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Monthly take-home
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{money(monthly)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Effective tax rate
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {percent(taxes.effectiveRate, 1)}
          </p>
          <p className="mt-1 text-xs text-muted">{taxes.note}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Median 1-bed rent
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(city.metrics.medianRent1br)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {(monthly / city.metrics.medianRent1br).toFixed(1)} months of rent
          </p>
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="levels">
        <SectionHeading
          eyebrow="Salary levels"
          title={`Take-home pay at each level in ${city.name}`}
          description="Each link opens the full breakdown for that salary, including the tax split and what it covers locally."
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {SALARY_PRESETS.map((preset) => {
            const presetTaxes = computeTaxes(preset, city, DEFAULT_INPUT.filingStatus);
            return (
              <li key={preset}>
                <Link
                  href={`/salary/${city.slug}/${preset}`}
                  className="card flex h-full flex-col p-5 hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="text-base font-semibold text-ink">{money(preset)}</span>
                  <span className="mt-1 text-sm text-muted">
                    {money(preset - presetTaxes.total)} after tax ·{" "}
                    {percent(presetTaxes.effectiveRate, 1)} effective
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Open breakdown
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 max-w-3xl">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink">
            How this is calculated for {city.name}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-muted">Federal income tax</span>
              <span className="font-semibold tabular-nums">{money(taxes.federal)}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted">{city.state} income tax</span>
              <span className="font-semibold tabular-nums">{money(taxes.state)}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted">Local income tax</span>
              <span className="font-semibold tabular-nums">{money(taxes.local)}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted">FICA</span>
              <span className="font-semibold tabular-nums">{money(taxes.fica)}</span>
            </li>
          </ul>
          <AssumptionNote items={TAX_ASSUMPTIONS_LABEL} />
          <DataProvenance group="taxes" />
        </Card>
      </section>

      <p className="mt-10 text-sm text-muted">
        Want the full picture?{" "}
        <Link
          href={`/compare/austin-tx-vs-${city.slug}?salary=${salary}`}
          className="font-medium text-brand hover:underline"
        >
          Compare {city.name} with another city
        </Link>
        .
      </p>
    </Container>
  );
}
