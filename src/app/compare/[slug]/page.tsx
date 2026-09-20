import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, Card, Container, SectionHeading } from "@/components/ui/primitives";
import { BudgetTable } from "@/components/results/BudgetTable";
import { ScoreGauge, ScoreBandLabel } from "@/components/results/ScoreGauge";
import { ResultsTabs } from "@/components/results/ResultsTabs";
import { ScenarioControls } from "@/components/results/ScenarioControls";
import { ShareBar } from "@/components/results/ShareBar";
import { Projections } from "@/components/results/Projections";
import { MoveCostPanel } from "@/components/results/MoveCostPanel";
import { computeComparison } from "@/lib/calc/compare";
import { parseComparisonSlug, relatedComparisons } from "@/lib/cities";
import { parseCompareOptions, parseHouseholdInput, type RawParams } from "@/lib/query";
import { money, signedMoney } from "@/lib/format";
import { CITIES, POPULAR_COMPARISONS } from "@/lib/data/cities";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";
import { absoluteUrl, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { SCORE_METHODOLOGY } from "@/lib/calc/moveScore";
import { DATA_STATUS } from "@/lib/data/sources";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
};

export function generateStaticParams() {
  return POPULAR_COMPARISONS.map((pair) => ({
    slug: `${pair.from}-vs-${pair.to}`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return buildMetadata({ title: "Comparison not found", path: `/compare/${slug}` });

  const from = CITIES.find((c) => c.slug === parsed.from);
  const to = CITIES.find((c) => c.slug === parsed.to);
  if (!from || !to) return buildMetadata({ title: "Comparison not found", path: `/compare/${slug}` });

  return buildMetadata({
    title: `${from.name} vs ${to.name}: cost of living, salary and MoveScore`,
    description: `Compare take-home pay, rent, taxes, housing and lifestyle between ${from.name}, ${from.stateCode} and ${to.name}, ${to.stateCode} for your household.`,
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const raw = await searchParams;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) notFound();

  const origin = CITIES.find((c) => c.slug === parsed.from);
  const destination = CITIES.find((c) => c.slug === parsed.to);
  if (!origin || !destination) notFound();

  const input = parseHouseholdInput(raw);
  const options = parseCompareOptions(raw);
  const result = computeComparison(origin, destination, input, options);

  const shareUrl = absoluteUrl(
    `/compare/${slug}?salary=${input.salary}&household=${input.householdSize}&children=${input.children}&car=${input.ownsCar ? "yes" : "no"}&housing=${input.housingMode}&filing=${input.filingStatus}&adjust=${options.marketAdjustSalary ? "1" : "0"}`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Compare", url: "/compare" },
              { name: `${origin.name} vs ${destination.name}`, url: `/compare/${slug}` },
            ]),
          ),
        }}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Compare cities", href: "/compare" },
            { name: `${origin.name} vs ${destination.name}` },
          ]}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {origin.name}, {origin.stateCode} → {destination.name},{" "}
              {destination.stateCode}
            </p>

            <p className="mt-4 text-sm font-medium text-muted">
              {result.monthlySavings >= 0
                ? "You could keep"
                : "You would spend"}
            </p>
            <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {money(Math.abs(result.monthlySavings))}
              <span className="ml-1 text-lg font-medium text-muted">/ month</span>
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Modelled for {input.householdSize}{" "}
              {input.householdSize === 1 ? "person" : "people"}
              {input.children > 0 ? ` with ${input.children} child${input.children === 1 ? "" : "ren"}` : ""}
              , {input.ownsCar ? "with a car" : "without a car"},{" "}
              {input.housingMode === "rent" ? "renting" : "buying"}, at{" "}
              {money(input.salary)} a year.
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Take-home / mo
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                  {money(result.takeHome.destination)}
                </dd>
                <dd className="text-xs text-muted">
                  {signedMoney(result.takeHome.destination - result.takeHome.origin)} vs{" "}
                  {origin.name}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Costs / mo
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                  {money(result.monthlyCost.destination)}
                </dd>
                <dd className="text-xs text-muted">
                  {signedMoney(result.monthlyCost.destination - result.monthlyCost.origin)} vs{" "}
                  {origin.name}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Leftover / mo
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">
                  {money(result.leftover.destination)}
                </dd>
                <dd className="text-xs text-muted">
                  {money(result.leftover.origin)} in {origin.name}
                </dd>
              </div>
            </dl>

            {options.marketAdjustSalary ? (
              <p className="mt-4 text-xs text-muted">
                Salary is market-adjusted to {destination.name} at{" "}
                {money(result.salaryScenario.destinationGross)} using the metro wage
                index. Turn this off in the scenario controls to compare the same
                nominal salary.
              </p>
            ) : null}

            <div className="mt-6">
              <ShareBar shareUrl={shareUrl} />
            </div>
          </Card>

          <Card className="flex flex-col items-center p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your MoveScore
            </p>
            <ScoreGauge breakdown={result.moveScore} size={190} className="mt-4" />
            <div className="mt-3">
              <ScoreBandLabel breakdown={result.moveScore} />
            </div>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted">
              {result.moveScore.headline}
            </p>
            <p className="mt-4 text-xs text-muted">
              {origin.name} scores {result.originScore.score} on the same model.
            </p>
          </Card>
        </div>

        <div className="mt-8">
          <ScenarioControls
            basePath={`/compare/${slug}`}
            input={input}
            options={options}
          />
        </div>

        <section className="mt-10" aria-labelledby="why">
          <SectionHeading
            eyebrow="Why this score"
            title="Every category, every weight, every driver"
            description="The MoveScore is a weighted average. Open any category to see the inputs that produced it."
          />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.moveScore.categories.map((category) => (
              <li key={category.key}>
                <Card className="h-full p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-ink">{category.label}</h3>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {Math.round(category.score)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {Math.round(category.weight * 100)}% of the score · contributes{" "}
                    {category.contribution.toFixed(1)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {category.explanation}
                  </p>
                  <dl className="mt-4 space-y-1.5">
                    {category.drivers.map((driver) => (
                      <div key={driver.label} className="flex justify-between gap-2 text-xs">
                        <dt className="text-muted">{driver.label}</dt>
                        <dd className="font-medium tabular-nums text-slate-700">
                          {driver.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
          <details className="mt-4 rounded-xl border border-line bg-surface p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Scoring methodology
            </summary>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {SCORE_METHODOLOGY.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </details>
        </section>

        <section className="mt-10" aria-labelledby="monthly">
          <SectionHeading
            eyebrow="Monthly comparison"
            title="Where the money actually goes"
          />
          <Card className="mt-6 p-6">
            <BudgetTable rows={result.budget} origin={origin} destination={destination} />
            {DATA_STATUS === "demo" ? (
              <p className="mt-4 text-xs text-muted">
                Demo data — these figures are realistic placeholders, not verified
                statistics.
              </p>
            ) : null}
          </Card>
        </section>

        <div className="mt-8">
          <ResultsTabs result={result} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Projections
            projections={result.projections}
            origin={origin}
            destination={destination}
          />
          <MoveCostPanel
            estimate={result.moveCost}
            monthlySavings={result.monthlySavings}
          />
        </div>

        <section className="mt-12" aria-labelledby="related">
          <SectionHeading
            eyebrow="Keep exploring"
            title={`More comparisons involving ${destination.name}`}
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedComparisons(destination.slug, 6).map((pair) => (
              <li key={pair.slug}>
                <Link
                  href={`/compare/${pair.slug}`}
                  className="card flex h-full items-center justify-between gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="text-sm font-semibold text-ink">
                    {pair.from.name} vs {pair.to.name}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Start a different comparison on the{" "}
            <Link href="/compare" className="font-medium text-brand hover:underline">
              compare page
            </Link>
            , or browse all{" "}
            <Link href="/cities" className="font-medium text-brand hover:underline">
              {CITIES.length} cities
            </Link>
            .
          </p>
        </section>
      </Container>
    </>
  );
}
