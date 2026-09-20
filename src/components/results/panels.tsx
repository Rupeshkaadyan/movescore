import Link from "next/link";
import type { ComparisonResult } from "@/lib/types";
import { money, percent, signedMoney } from "@/lib/format";
import { Card, ScoreBar } from "@/components/ui/primitives";
import { BudgetTable } from "@/components/results/BudgetTable";
import { sourcesForGroup } from "@/lib/data/sources";
import { COL_ASSUMPTIONS, TAX_ASSUMPTIONS_LABEL } from "@/lib/calc/notes";

export function OverviewPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Key takeaways</h3>
        <ul className="mt-4 space-y-3">
          {result.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex gap-3 text-sm leading-relaxed text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
              {takeaway}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Monthly cost comparison</h3>
        <p className="mt-1 text-sm text-muted">
          Modelled for your household: {result.input.householdSize}{" "}
          {result.input.householdSize === 1 ? "person" : "people"}
          {result.input.children > 0 ? `, ${result.input.children} child${result.input.children === 1 ? "" : "ren"}` : ""}
          {result.input.ownsCar ? ", with a car" : ", no car"},{" "}
          {result.input.housingMode === "rent" ? "renting" : "buying"}.
        </p>
        <div className="mt-4">
          <BudgetTable rows={result.budget} origin={origin} destination={destination} />
        </div>
        <AssumptionNote items={COL_ASSUMPTIONS} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-ink">Estimated monthly leftover</h3>
          <div className="mt-4 space-y-4">
            <LeftoverRow label={origin.name} value={result.leftover.origin} total={result.monthlyCost.origin} />
            <LeftoverRow label={destination.name} value={result.leftover.destination} total={result.monthlyCost.destination} />
          </div>
          <p className="mt-4 text-sm font-semibold text-ink">
            Difference:{" "}
            <span className={result.monthlySavings >= 0 ? "text-emerald-600" : "text-red-600"}>
              {signedMoney(result.monthlySavings)}/mo
            </span>
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-ink">Category scores</h3>
          <ul className="mt-4 space-y-3">
            {result.moveScore.categories.map((category) => (
              <li key={category.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{category.label}</span>
                  <span className="text-xs text-muted">
                    weight {Math.round(category.weight * 100)}%
                  </span>
                </div>
                <ScoreBar score={category.score} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function LeftoverRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-lg font-semibold tabular-nums text-ink">{money(value)}</span>
      </div>
      <p className="text-xs text-muted">{money(total)}/mo in modelled costs</p>
    </div>
  );
}

export function HousingPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  const rows = [
    { label: "Median 1-bed rent", a: origin.metrics.medianRent1br, b: destination.metrics.medianRent1br },
    { label: "Median 2-bed rent", a: origin.metrics.medianRent2br, b: destination.metrics.medianRent2br },
    { label: "Median 3-bed rent", a: origin.metrics.medianRent3br, b: destination.metrics.medianRent3br },
    { label: "Median home price", a: origin.metrics.medianHomePrice, b: destination.metrics.medianHomePrice },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Housing prices</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">{destination.name}</th>
                <th scope="col" className="py-2 text-right font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-line/70">
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium">{row.label}</th>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money(row.a)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money(row.b)}</td>
                  <td className="py-2.5 text-right tabular-nums font-semibold">
                    {signedMoney(row.b - row.a)}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-medium">Property tax rate</th>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(origin.metrics.propertyTaxRate, 2)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(destination.metrics.propertyTaxRate, 2)}</td>
                <td className="py-2.5 text-right tabular-nums font-semibold">
                  {signedMoney(
                    (destination.metrics.medianHomePrice * destination.metrics.propertyTaxRate) / 100 / 12 -
                      (origin.metrics.medianHomePrice * origin.metrics.propertyTaxRate) / 100 / 12,
                  )}
                  /mo
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-medium">Rent change YoY</th>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(origin.metrics.rentGrowthYoY, 1)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(destination.metrics.rentGrowthYoY, 1)}</td>
                <td className="py-2.5 text-right text-xs text-muted">compounds</td>
              </tr>
            </tbody>
          </table>
        </div>
        <SourceLine group="housing" />
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Your modelled housing cost</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <HousingCostCard
            label={origin.name}
            monthly={result.budget.find((r) => r.key === "housing")?.current ?? 0}
            share={result.takeHome.origin}
          />
          <HousingCostCard
            label={destination.name}
            monthly={result.budget.find((r) => r.key === "housing")?.destination ?? 0}
            share={result.takeHome.destination}
          />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Explore neighbourhood-level prices on the{" "}
          <Link href={`/cities/${destination.slug}/neighborhoods`} className="font-medium text-brand hover:underline">
            {destination.name} neighbourhoods page
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}

function HousingCostCard({
  label,
  monthly,
  share,
}: {
  label: string;
  monthly: number;
  share: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{money(monthly)}/mo</p>
      <p className="mt-1 text-xs text-muted">
        {percent((monthly / Math.max(1, share)) * 100, 1)} of take-home pay
      </p>
    </div>
  );
}

export function TaxesPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Annual tax breakdown</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">Tax</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
                <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Federal income", "federal"],
                  ["State income", "state"],
                  ["Local income", "local"],
                  ["FICA (Social Security + Medicare)", "fica"],
                ] as const
              ).map(([label, key]) => (
                <tr key={key} className="border-b border-line/70">
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium">{label}</th>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money(result.taxes.origin[key])}</td>
                  <td className="py-2.5 text-right tabular-nums">{money(result.taxes.destination[key])}</td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-semibold">Total</th>
                <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">{money(result.taxes.origin.total)}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{money(result.taxes.destination.total)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-medium">Effective rate</th>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(result.taxes.origin.effectiveRate, 1)}</td>
                <td className="py-2.5 text-right tabular-nums">{percent(result.taxes.destination.effectiveRate, 1)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-medium">Combined sales tax</th>
                <td className="py-2.5 pr-4 text-right tabular-nums">{percent(origin.metrics.salesTaxRate, 2)}</td>
                <td className="py-2.5 text-right tabular-nums">{percent(destination.metrics.salesTaxRate, 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {origin.name}: {origin.metrics.stateTaxNote} {destination.name}:{" "}
          {destination.metrics.stateTaxNote}
        </p>
        <AssumptionNote items={TAX_ASSUMPTIONS_LABEL} />
        <SourceLine group="taxes" />
      </Card>
    </div>
  );
}

export function JobsPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Job market</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Wage index (US = 100)" a={origin.metrics.salaryIndex} b={destination.metrics.salaryIndex} />
            <MetricRow label="Unemployment rate" a={origin.metrics.unemploymentRate} b={destination.metrics.unemploymentRate} suffix="%" />
            <MetricRow label="Job growth YoY" a={origin.metrics.jobGrowthYoY} b={destination.metrics.jobGrowthYoY} suffix="%" />
            <MetricRow label="Median household income" a={origin.metrics.medianHouseholdIncome} b={destination.metrics.medianHouseholdIncome} moneyFormat />
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <IndustryList city={origin.name} industries={origin.metrics.topIndustries} />
        <IndustryList city={destination.name} industries={destination.metrics.topIndustries} />
      </div>
      <SourceLine group="jobs" />
    </Card>
  );
}

function IndustryList({ city, industries }: { city: string; industries: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{city} — largest sectors</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {industries.map((industry) => (
          <li
            key={industry}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-slate-700"
          >
            {industry}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WeatherPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Climate and air quality</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Climate score (0-100)" a={origin.metrics.climateScore} b={destination.metrics.climateScore} />
            <MetricRow label="Sunny days per year" a={origin.metrics.sunnyDays} b={destination.metrics.sunnyDays} />
            <MetricRow label="Average high" a={origin.metrics.avgHighF} b={destination.metrics.avgHighF} suffix="°F" />
            <MetricRow label="Average low" a={origin.metrics.avgLowF} b={destination.metrics.avgLowF} suffix="°F" />
            <MetricRow label="Annual rainfall" a={origin.metrics.annualRainInches} b={destination.metrics.annualRainInches} suffix=" in" />
            <MetricRow label="Air quality index (lower is better)" a={origin.metrics.airQualityIndex} b={destination.metrics.airQualityIndex} />
          </tbody>
        </table>
      </div>
      <SourceLine group="weather" />
    </Card>
  );
}

export function HealthcarePanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  const row = result.budget.find((r) => r.key === "healthcare");
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Healthcare</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Quality index (0-100)" a={origin.metrics.healthcareQualityIndex} b={destination.metrics.healthcareQualityIndex} />
            <MetricRow label="Cost index (US = 100)" a={origin.metrics.healthcareIndex} b={destination.metrics.healthcareIndex} />
            <MetricRow label="Modelled monthly cost" a={row?.current ?? 0} b={row?.destination ?? 0} moneyFormat />
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Modelled cost covers premiums and typical out-of-pocket spending for your
        household size, scaled by the regional cost index. It is not a quote.
      </p>
      <SourceLine group="healthcare" />
    </Card>
  );
}

export function SafetyPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Safety</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Safety score (0-100)" a={origin.metrics.safetyScore} b={destination.metrics.safetyScore} />
            <MetricRow label="Violent crime per 100k" a={origin.metrics.violentCrimePer100k} b={destination.metrics.violentCrimePer100k} />
            <MetricRow label="Property crime per 100k" a={origin.metrics.propertyCrimePer100k} b={destination.metrics.propertyCrimePer100k} />
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        City-wide rates hide large neighbourhood variation. Check the
        neighbourhood pages before you decide.
      </p>
      <SourceLine group="safety" />
    </Card>
  );
}

export function EducationPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Schools and education</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="School score (0-100)" a={origin.metrics.schoolScore} b={destination.metrics.schoolScore} />
            <MetricRow label="High-school graduation rate" a={origin.metrics.highSchoolGradRate} b={destination.metrics.highSchoolGradRate} suffix="%" />
            <MetricRow label="Adults 25+ with a bachelor's" a={origin.metrics.bachelorShare} b={destination.metrics.bachelorShare} suffix="%" />
          </tbody>
        </table>
      </div>
      <SourceLine group="education" />
    </Card>
  );
}

export function LifestylePanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-ink">Lifestyle</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
              <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Amenity score (0-100)" a={origin.metrics.amenityScore} b={destination.metrics.amenityScore} />
            <MetricRow label="Walk score (0-100)" a={origin.metrics.walkScore} b={destination.metrics.walkScore} />
            <MetricRow label="Transit score (0-100)" a={origin.metrics.transitScore} b={destination.metrics.transitScore} />
            <MetricRow label="Average one-way commute" a={origin.metrics.commuteMinutes} b={destination.metrics.commuteMinutes} suffix=" min" />
            <MetricRow label="Population" a={origin.metrics.population} b={destination.metrics.population} />
          </tbody>
        </table>
      </div>
      <SourceLine group="lifestyle" />
    </Card>
  );
}

export function CostOfLivingPanel({ result }: { result: ComparisonResult }) {
  const { origin, destination } = result;
  const indices = [
    { label: "Overall cost index", key: "colIndex" },
    { label: "Rent index", key: "rentIndex" },
    { label: "Utilities index", key: "utilitiesIndex" },
    { label: "Groceries index", key: "groceriesIndex" },
    { label: "Transportation index", key: "transportationIndex" },
    { label: "Healthcare index", key: "healthcareIndex" },
    { label: "Miscellaneous index", key: "miscIndex" },
  ] as const;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Cost indices (U.S. average = 100)</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">Index</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">{origin.name}</th>
                <th scope="col" className="py-2 text-right font-semibold">{destination.name}</th>
              </tr>
            </thead>
            <tbody>
              {indices.map((index) => (
                <MetricRow
                  key={index.key}
                  label={index.label}
                  a={origin.metrics[index.key]}
                  b={destination.metrics[index.key]}
                />
              ))}
            </tbody>
          </table>
        </div>
        <SourceLine group="cost-of-living" />
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Your monthly costs</h3>
        <div className="mt-4">
          <BudgetTable rows={result.budget} origin={origin} destination={destination} />
        </div>
        <AssumptionNote items={COL_ASSUMPTIONS} />
      </Card>
    </div>
  );
}

function MetricRow({
  label,
  a,
  b,
  suffix = "",
  moneyFormat = false,
}: {
  label: string;
  a: number;
  b: number;
  suffix?: string;
  moneyFormat?: boolean;
}) {
  const fmt = (value: number) =>
    moneyFormat ? money(value) : `${value.toLocaleString("en-US")}${suffix}`;
  return (
    <tr className="border-b border-line/70">
      <th scope="row" className="py-2.5 pr-4 text-left font-medium">{label}</th>
      <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(a)}</td>
      <td className="py-2.5 text-right tabular-nums">{fmt(b)}</td>
    </tr>
  );
}

export function AssumptionNote({ items }: { items: string[] }) {
  return (
    <details className="mt-4 rounded-xl border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        Assumptions behind these numbers
      </summary>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </details>
  );
}

export function SourceLine({ group }: { group: Parameters<typeof sourcesForGroup>[0] }) {
  const sources = sourcesForGroup(group);
  if (!sources.length) return null;
  return (
    <p className="mt-4 text-xs text-muted">
      Sources:{" "}
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 ? ", " : ""}
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand hover:underline"
          >
            {source.publisher}
          </a>{" "}
          (updated {source.lastUpdated})
        </span>
      ))}
      .
    </p>
  );
}
