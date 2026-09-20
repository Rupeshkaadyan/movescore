import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { CITIES } from "@/lib/data/cities";
import { SOURCES } from "@/lib/data/sources";
import { NEIGHBORHOODS } from "@/lib/data/neighborhoods";
import { GUIDES } from "@/lib/data/guides";
import { money } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin — data management",
  description: "Read-only overview of the current dataset.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  const stale = CITIES.filter((city) => city.metrics.rentGrowthYoY > 3).length;

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Admin"
        title="Dataset overview"
        description="The editing interface arrives in Phase 7. This read-only view already exposes the records an admin will manage, so the shape is fixed before the CRUD is built."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Cities" value={String(CITIES.length)} sub="30-city launch set" />
        <MetricCard label="Neighborhoods" value={String(NEIGHBORHOODS.length)} sub="across 6 cities" />
        <MetricCard label="Sources" value={String(SOURCES.length)} sub="with methodology notes" />
        <MetricCard label="Guides" value={String(GUIDES.length)} sub="editorial" />
      </div>

      <section className="mt-12" aria-labelledby="cities-admin">
        <h2 id="cities-admin" className="text-lg font-semibold text-ink">
          City records
        </h2>
        <p className="mt-1 text-sm text-muted">
          {stale} cities show rent growth above 3% and will need re-checking first
          when ingestion goes live.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">City</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Cost index</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">1-bed rent</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Home price</th>
                <th scope="col" className="py-2 text-right font-semibold">Rent YoY</th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((city) => (
                <tr key={city.slug} className="border-b border-line/70">
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium">
                    <Link href={`/cities/${city.slug}`} className="hover:text-brand hover:underline">
                      {city.name}, {city.stateCode}
                    </Link>
                  </th>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{city.metrics.colIndex}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money(city.metrics.medianRent1br)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money(city.metrics.medianHomePrice)}</td>
                  <td className="py-2.5 text-right tabular-nums">{city.metrics.rentGrowthYoY}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}
