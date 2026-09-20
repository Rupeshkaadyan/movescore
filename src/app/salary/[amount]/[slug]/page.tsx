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
import { DEFAULT_INPUT, SALARY_PRESETS } from "@/lib/defaults";
import { money, percent } from "@/lib/format";
import { AssumptionNote } from "@/components/results/panels";
import { TAX_ASSUMPTIONS_LABEL } from "@/lib/calc/notes";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ amount: string; slug: string }> };

export function generateStaticParams() {
  return CITIES.flatMap((city) =>
    SALARY_PRESETS.map((amount) => ({ amount: String(amount), slug: city.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { amount, slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  const salary = Number(amount);
  if (!city || !Number.isFinite(salary)) {
    return buildMetadata({ title: "Salary calculator", path: "/salary/100000/austin-tx" });
  }
  return buildMetadata({
    title: `${money(salary)} salary in ${city.name}, ${city.stateCode} — take-home pay`,
    description: `Take-home pay after federal, state and local tax and FICA for a ${money(salary)} salary in ${city.name}, ${city.stateCode}.`,
    path: `/salary/${salary}/${slug}`,
  });
}

export default async function SalaryPage({ params }: PageProps) {
  const { amount, slug } = await params;
  const salary = Number(amount);
  const city = CITIES.find((c) => c.slug === slug);
  if (!city || !Number.isFinite(salary) || salary < 10_000 || salary > 5_000_000) notFound();

  const taxes = computeTaxes(salary, city, DEFAULT_INPUT.filingStatus);
  const takeHomeAnnual = salary - taxes.total;
  const monthly = takeHomeAnnual / 12;
  const costs = monthlyCosts(city, { ...DEFAULT_INPUT, salary });
  const rent = city.metrics.medianRent1br;

  const rows = [
    { label: "Federal income tax", value: taxes.federal },
    { label: `${city.state} income tax`, value: taxes.state },
    { label: "Local income tax", value: taxes.local },
    { label: "FICA (Social Security + Medicare)", value: taxes.fica },
  ];

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/cities" },
          { name: cityLabel(city), href: `/cities/${city.slug}` },
          { name: `${money(salary)} salary` },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {money(salary)} in {city.name}, {city.stateCode}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          Take-home pay after federal, state, local and FICA tax — and what that
          buys in {city.name}.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Take-home summary">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Annual take-home
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {money(takeHomeAnnual)}
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
            Months of median rent
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {(monthly / rent).toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Median 1-bed is {money(rent)}/mo
          </p>
        </Card>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink">Tax breakdown</h2>
          <ul className="mt-4 divide-y divide-line">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-slate-700">{row.label}</span>
                <span className="font-semibold tabular-nums text-ink">{money(row.value)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-semibold text-ink">Total tax</span>
              <span className="font-semibold tabular-nums text-ink">{money(taxes.total)}</span>
            </li>
          </ul>
          <AssumptionNote items={TAX_ASSUMPTIONS_LABEL} />
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink">What it covers</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-baseline justify-between gap-4">
              <span className="text-muted">Median 1-bed rent</span>
              <span className="font-semibold tabular-nums text-ink">{money(rent)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span className="text-muted">Modelled total monthly cost</span>
              <span className="font-semibold tabular-nums text-ink">{money(costs.total)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4">
              <span className="text-muted">Leftover after costs</span>
              <span className="font-semibold tabular-nums text-ink">
                {money(monthly - costs.total)}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Costs modelled for a single person renting with a car. Change the
            household on the comparison page for your own situation.
          </p>
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="other-salaries">
        <SectionHeading eyebrow="Try another salary" title="Take-home pay at other levels" />
        <ul className="mt-6 flex flex-wrap gap-2">
          {SALARY_PRESETS.map((preset) => (
            <li key={preset}>
              <Link
                href={`/salary/${preset}/${city.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  preset === salary
                    ? "border-brand bg-brand text-white"
                    : "border-line text-slate-700 hover:border-brand hover:text-brand"
                }`}
              >
                {money(preset)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-muted">
        Ready to compare?{" "}
        <Link
          href={`/compare/new-york-ny-vs-${city.slug}?salary=${salary}`}
          className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
        >
          Compare {city.name} with New York at {money(salary)}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </p>
    </Container>
  );
}
