import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import {
  Badge,
  Breadcrumbs,
  Card,
  Container,
  SectionHeading,
} from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { neighborhoodsForCity } from "@/lib/data/neighborhoods";
import { relatedComparisons } from "@/lib/cities";
import { computeTaxes } from "@/lib/calc/tax";
import { monthlyCosts } from "@/lib/calc/costOfLiving";
import { DEFAULT_INPUT } from "@/lib/defaults";
import { money, percent } from "@/lib/format";
import { absoluteUrl, breadcrumbSchema, buildMetadata, jsonLd } from "@/lib/seo";
import { DATA_STATUS } from "@/lib/data/sources";
import { ViewBeacon } from "@/components/analytics/ViewBeacon";
import { DataProvenance } from "@/components/ui/DataProvenance";
import type { MetricGroup } from "@/lib/types";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return buildMetadata({ title: "City not found", path: `/cities/${slug}` });
  return buildMetadata({
    title: `Living in ${city.name}, ${city.stateCode} — cost of living, housing, jobs and taxes`,
    description: city.summary.slice(0, 155),
    path: `/cities/${slug}`,
  });
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  const input = DEFAULT_INPUT;
  const taxes = computeTaxes(input.salary, city, input.filingStatus);
  const takeHome = (input.salary - taxes.total) / 12;
  const costs = monthlyCosts(city, input);
  const neighbourhoods = neighborhoodsForCity(slug);
  const comparisons = relatedComparisons(slug, 6);

  const salaryForComfort = Math.round((costs.housing * 3 * 12) / 1000) * 1000;

  const faqs = [
    {
      question: `How much do you need to earn to live in ${city.name}?`,
      answer:
        `Using the 30%-of-income rule on the median one-bedroom rent of ${money(city.metrics.medianRent1br)}, a single renter needs roughly ${money(salaryForComfort)} a year before tax. That figure ignores childcare, debt and student loans, and rises with each extra bedroom.`,
    },
    {
      question: `Is ${city.name} more expensive than the U.S. average?`,
      answer:
        city.metrics.colIndex >= 100
          ? `Yes. ${city.name} sits at ${city.metrics.colIndex} on our cost index, where 100 is the U.S. average — about ${percent(city.metrics.colIndex - 100, 0)} above it. Housing is the biggest driver at an index of ${city.metrics.rentIndex}.`
          : `No. ${city.name} sits at ${city.metrics.colIndex} on our cost index, where 100 is the U.S. average — about ${percent(100 - city.metrics.colIndex, 0)} below it.`,
    },
    {
      question: `What income tax would I pay in ${city.name}?`,
      answer: city.metrics.hasStateIncomeTax
        ? `${city.metrics.stateTaxNote} Combined sales tax is ${percent(city.metrics.salesTaxRate, 2)}. On ${money(input.salary)} our model puts the total effective tax burden at ${percent(taxes.effectiveRate, 1)}.`
        : `${city.name} has no state income tax${city.metrics.localIncomeTaxRate > 0 ? `, though a local rate of ${percent(city.metrics.localIncomeTaxRate, 2)} applies` : ""}. Combined sales tax is ${percent(city.metrics.salesTaxRate, 2)}. On ${money(input.salary)} our model puts the total effective tax burden at ${percent(taxes.effectiveRate, 1)}.`,
    },
    {
      question: `How long is the average commute in ${city.name}?`,
      answer:
        `About ${city.metrics.commuteMinutes} minutes each way. Transit score is ${city.metrics.transitScore}/100 and walk score is ${city.metrics.walkScore}/100, which is a reasonable proxy for whether you can live without a car.`,
    },
    {
      question: `Is ${city.name} good for families?`,
      answer:
        `School score is ${city.metrics.schoolScore}/100 with a ${percent(city.metrics.highSchoolGradRate, 0)} high-school graduation rate, and the safety score is ${city.metrics.safetyScore}/100. Both vary a lot by neighbourhood, so check the neighbourhood page before committing.`,
    },
  ];

  const groups: { title: string; group: MetricGroup; rows: [string, string][] }[] = [
    {
      title: "Housing",
      group: "housing",
      rows: [
        ["Median 1-bed rent", `${money(city.metrics.medianRent1br)}/mo`],
        ["Median 2-bed rent", `${money(city.metrics.medianRent2br)}/mo`],
        ["Median 3-bed rent", `${money(city.metrics.medianRent3br)}/mo`],
        ["Median home price", money(city.metrics.medianHomePrice)],
        ["Property tax rate", percent(city.metrics.propertyTaxRate, 2)],
        ["Rent change YoY", percent(city.metrics.rentGrowthYoY, 1)],
      ],
    },
    {
      title: "Jobs and money",
      group: "jobs",
      rows: [
        ["Median household income", money(city.metrics.medianHouseholdIncome)],
        ["Wage index (US = 100)", String(city.metrics.salaryIndex)],
        ["Unemployment rate", percent(city.metrics.unemploymentRate, 1)],
        ["Job growth YoY", percent(city.metrics.jobGrowthYoY, 1)],
        ["State income tax", city.metrics.hasStateIncomeTax ? percent(city.metrics.stateIncomeTaxRate, 2) : "None"],
        ["Combined sales tax", percent(city.metrics.salesTaxRate, 2)],
      ],
    },
    {
      title: "Getting around",
      group: "transportation",
      rows: [
        ["Average one-way commute", `${city.metrics.commuteMinutes} min`],
        ["Transit score", `${city.metrics.transitScore}/100`],
        ["Walk score", `${city.metrics.walkScore}/100`],
        ["Monthly transit pass", money(city.metrics.transitFareMonthly)],
      ],
    },
    {
      title: "Climate and environment",
      group: "weather",
      rows: [
        ["Climate score", `${city.metrics.climateScore}/100`],
        ["Sunny days per year", String(city.metrics.sunnyDays)],
        ["Average high / low", `${city.metrics.avgHighF}°F / ${city.metrics.avgLowF}°F`],
        ["Annual rainfall", `${city.metrics.annualRainInches} in`],
        ["Air quality index", String(city.metrics.airQualityIndex)],
      ],
    },
    {
      title: "Health, schools and safety",
      group: "healthcare",
      rows: [
        ["Healthcare quality index", `${city.metrics.healthcareQualityIndex}/100`],
        ["School score", `${city.metrics.schoolScore}/100`],
        ["High-school graduation", percent(city.metrics.highSchoolGradRate, 0)],
        ["Adults with a bachelor's", percent(city.metrics.bachelorShare, 0)],
        ["Safety score", `${city.metrics.safetyScore}/100`],
        ["Violent crime per 100k", String(city.metrics.violentCrimePer100k)],
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Cities", url: "/cities" },
              { name: cityLabel(city), url: `/cities/${city.slug}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />

      <ViewBeacon event="city_viewed" props={{ city: city.slug, state: city.stateCode }} />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Cities", href: "/cities" },
            { name: cityLabel(city) },
          ]}
        />

        <header className="mt-6">
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4" aria-hidden />
            {city.county}, {city.state}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Living in {city.name}, {city.stateCode}
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
            {city.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="brand">Cost index {city.metrics.colIndex}</Badge>
            <Badge tone="brand">Wage index {city.metrics.salaryIndex}</Badge>
            <Badge>Population {city.metrics.population.toLocaleString("en-US")}</Badge>
            {!city.metrics.hasStateIncomeTax ? (
              <Badge tone="success">No state income tax</Badge>
            ) : null}
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Monthly snapshot">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Take-home on {money(input.salary)}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {money(takeHome)}
              <span className="text-sm font-medium text-muted">/mo</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Effective tax rate {percent(taxes.effectiveRate, 1)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Modelled monthly costs
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {money(costs.total)}
              <span className="text-sm font-medium text-muted">/mo</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Single person, renting, with a car
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Housing share
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {percent((costs.housing / takeHome) * 100, 0)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {money(costs.housing)}/mo — {costs.housingDetail.detail}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Leftover
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {money(takeHome - costs.total)}
              <span className="text-sm font-medium text-muted">/mo</span>
            </p>
            <p className="mt-1 text-xs text-muted">After all modelled costs</p>
          </Card>
        </section>

        <section className="mt-12" aria-labelledby="metrics">
          <SectionHeading
            eyebrow="City data"
            title={`${city.name} at a glance`}
            description={
              DATA_STATUS === "demo"
                ? "Demo data for development. Every metric below is traceable to a published source on the methodology page."
                : undefined
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.title} className="p-6">
                <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                <dl className="mt-4 space-y-2.5">
                  {group.rows.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3 text-sm">
                      <dt className="text-muted">{label}</dt>
                      <dd className="font-medium tabular-nums text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <DataProvenance group={group.group} compact />
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2" aria-labelledby="pros-cons">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">What people like</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
              {city.pros.map((pro) => (
                <li key={pro} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  {pro}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">What to weigh up</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
              {city.cons.map((con) => (
                <li key={con} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                  {con}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {neighbourhoods.length > 0 ? (
          <section className="mt-12" aria-labelledby="neighborhoods">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Neighborhoods"
                title={`Where to live in ${city.name}`}
                description="Rent, home prices, commute, schools and safety for each neighbourhood."
              />
              <Link
                href={`/cities/${city.slug}/neighborhoods`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
              >
                All neighbourhoods
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {neighbourhoods.slice(0, 3).map((hood) => (
                <li key={hood.slug}>
                  <Card className="h-full p-5">
                    <h3 className="text-base font-semibold text-ink">{hood.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                      {hood.vibe}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {hood.description}
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <dt className="text-muted">1-bed rent</dt>
                        <dd className="font-semibold tabular-nums text-ink">{money(hood.rent1br)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Commute</dt>
                        <dd className="font-semibold tabular-nums text-ink">{hood.commuteMinutes} min</dd>
                      </div>
                    </dl>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="comparisons">
          <SectionHeading
            eyebrow="Compare"
            title={`Compare ${city.name} with other cities`}
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((pair) => (
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
        </section>

        <section className="mt-12" aria-labelledby="faq">
          <SectionHeading eyebrow="FAQ" title={`Questions about moving to ${city.name}`} />
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="card p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-muted">
          Canonical URL: {absoluteUrl(`/cities/${city.slug}`)}
        </p>
      </Container>
    </>
  );
}
