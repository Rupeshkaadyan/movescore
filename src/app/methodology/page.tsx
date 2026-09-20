import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { DATA_SNAPSHOT, DATA_STATUS, SOURCES, METRIC_SOURCE_GROUP } from "@/lib/data/sources";
import { SCORE_METHODOLOGY, CATEGORY_WEIGHTS } from "@/lib/calc/moveScore";
import { COL_ASSUMPTIONS, MOVE_COST_ASSUMPTIONS, PROJECTION_ASSUMPTIONS, TAX_ASSUMPTIONS_LABEL } from "@/lib/calc/notes";
import { buildMetadata } from "@/lib/seo";
import { percent } from "@/lib/format";

export const metadata: Metadata = buildMetadata({
  title: "Methodology and data sources",
  description:
    "How MoveScore calculates take-home pay, cost of living, moving costs and the MoveScore — plus every source, its update cadence and its methodology note.",
  path: "/methodology",
});

const GROUP_LABELS: Record<string, string> = {
  demographics: "Population, income, commute time",
  housing: "Rents, home prices, property tax",
  "cost-of-living": "Category cost indices",
  jobs: "Wages, unemployment, job growth",
  taxes: "State, local and sales tax",
  transportation: "Transit and walkability scores",
  weather: "Climate normals and air quality",
  healthcare: "Healthcare quality and cost",
  education: "School ratings and attainment",
  safety: "Crime rates",
  lifestyle: "Amenity density",
};

export default function MethodologyPage() {
  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Methodology"
        title="How every number is produced"
        description="MoveScore is not a black box. This page lists the scoring model, the calculation assumptions, and every source with its update cadence."
      />

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink">MoveScore model</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            {SCORE_METHODOLOGY.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold text-ink">Category weights</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(CATEGORY_WEIGHTS).map(([key, weight]) => (
              <li key={key} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="capitalize text-slate-700">{key}</span>
                <span className="font-semibold tabular-nums text-ink">{percent(weight * 100, 0)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink">Calculation assumptions</h2>
          <div className="mt-4 space-y-4">
            <AssumptionBlock title="Take-home pay" items={TAX_ASSUMPTIONS_LABEL} />
            <AssumptionBlock title="Cost of living" items={COL_ASSUMPTIONS} />
            <AssumptionBlock title="Projections" items={PROJECTION_ASSUMPTIONS} />
            <AssumptionBlock title="Moving cost" items={MOVE_COST_ASSUMPTIONS} />
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sources">
        <SectionHeading
          eyebrow="Sources"
          title="Where the data comes from"
          description={`Snapshot ${DATA_SNAPSHOT}. Status: ${DATA_STATUS === "demo" ? "demo data for development" : "live"}.`}
        />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-3 pr-4 font-semibold">Metric group</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Source</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Methodology</th>
                <th scope="col" className="py-3 text-right font-semibold">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(METRIC_SOURCE_GROUP).map(([group, sourceId]) => {
                const source = SOURCES.find((s) => s.id === sourceId);
                if (!source) return null;
                return (
                  <tr key={group} className="border-b border-line/70 align-top">
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                      {GROUP_LABELS[group] ?? group}
                    </th>
                    <td className="py-3 pr-4">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium text-brand hover:underline"
                      >
                        {source.label}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-xs leading-relaxed text-muted">
                      {source.methodology}
                    </td>
                    <td className="py-3 text-right text-xs tabular-nums text-muted">
                      {source.lastUpdated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="roadmap">
        <SectionHeading eyebrow="Roadmap" title="What is demo today and what ships next" />
        <ol className="mt-6 space-y-3">
          {[
            "Phase 1-2 (done): full frontend, calculation engine and 30-city demo dataset.",
            "Phase 3: Postgres/Supabase schema for cities, neighbourhoods, sources and saved comparisons.",
            "Phase 4: ingestion jobs that replace demo values with the dated source series above.",
            "Phase 5: authentication, saved comparisons and PDF report delivery.",
            "Phase 6-7: SEO page expansion, admin dashboard, performance and accessibility polish.",
          ].map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">
          Questions about a specific figure? Every result page links to the source
          that produced it. Start with a{" "}
          <Link href="/compare" className="font-medium text-brand hover:underline">
            city comparison
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}

function AssumptionBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <details className="rounded-xl border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink">{title}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </details>
  );
}
