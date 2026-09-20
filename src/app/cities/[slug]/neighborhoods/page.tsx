import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  Card,
  Container,
  EmptyState,
  SectionHeading,
} from "@/components/ui/primitives";
import { CITIES, cityLabel } from "@/lib/data/cities";
import { CITIES_WITH_NEIGHBORHOODS, neighborhoodsForCity } from "@/lib/data/neighborhoods";
import { money } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_WITH_NEIGHBORHOODS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return buildMetadata({ title: "City not found", path: `/cities/${slug}` });
  return buildMetadata({
    title: `${city.name} neighborhoods — rent, commute, schools and safety`,
    description: `Compare ${city.name} neighbourhoods on rent, home prices, commute time, school quality, safety and walkability.`,
    path: `/cities/${slug}/neighborhoods`,
  });
}

export default async function NeighborhoodsPage({ params }: PageProps) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) {
    return (
      <Container className="py-10">
        <EmptyState
          title="City not found"
          description="That city is not in the current 30-city dataset."
          action={
            <Link href="/cities" className="text-sm font-semibold text-brand hover:underline">
              Browse all cities
            </Link>
          }
        />
      </Container>
    );
  }

  const hoods = neighborhoodsForCity(slug);

  if (hoods.length === 0) {
    return (
      <Container className="py-10">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Cities", href: "/cities" },
            { name: cityLabel(city), href: `/cities/${city.slug}` },
            { name: "Neighborhoods" },
          ]}
        />
        <div className="mt-6">
          <EmptyState
            title={`Neighbourhood data for ${city.name} is not published yet`}
            description="We publish neighbourhood pages only where we have rent, commute, school and safety data for every area. City-level data is still available."
            action={
              <Link
                href={`/cities/${city.slug}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Open the {city.name} city profile
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  const cheapest = [...hoods].sort((a, b) => a.rent1br - b.rent1br)[0];
  const safest = [...hoods].sort((a, b) => b.safetyScore - a.safetyScore)[0];
  const bestSchools = [...hoods].sort((a, b) => b.schoolScore - a.schoolScore)[0];
  const shortestCommute = [...hoods].sort((a, b) => a.commuteMinutes - b.commuteMinutes)[0];

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/cities" },
          { name: cityLabel(city), href: `/cities/${city.slug}` },
          { name: "Neighborhoods" },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {city.name} neighborhoods
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          {hoods.length} areas modelled on rent, home prices, commute, schools,
          safety and walkability. City-level averages hide most of this variation.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Highlights">
        <HighlightCard label="Cheapest rent" name={cheapest.name} value={`${money(cheapest.rent1br)}/mo`} />
        <HighlightCard label="Highest safety score" name={safest.name} value={`${safest.safetyScore}/100`} />
        <HighlightCard label="Best school scores" name={bestSchools.name} value={`${bestSchools.schoolScore}/100`} />
        <HighlightCard label="Shortest commute" name={shortestCommute.name} value={`${shortestCommute.commuteMinutes} min`} />
      </section>

      <section className="mt-12" aria-labelledby="compare-hoods">
        <SectionHeading
          eyebrow="Compare"
          title="Neighbourhood comparison"
          description="All areas side by side. Lower rent usually means a longer commute or weaker schools — the point of this table is to see the trade."
        />
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <caption className="sr-only">
              Neighbourhood comparison for {city.name}
            </caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="p-4 pr-4 font-semibold">Neighborhood</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">1-bed rent</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">Median home</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">Commute</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">Schools</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">Safety</th>
                <th scope="col" className="p-4 pr-4 text-right font-semibold">Walk</th>
                <th scope="col" className="p-4 text-right font-semibold">Lifestyle</th>
              </tr>
            </thead>
            <tbody>
              {hoods.map((hood) => (
                <tr key={hood.slug} className="border-b border-line/70">
                  <th scope="row" className="p-4 pr-4 text-left font-medium text-ink">
                    {hood.name}
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      {hood.vibe} · {hood.population.toLocaleString("en-US")} residents
                    </span>
                  </th>
                  <td className="p-4 pr-4 text-right tabular-nums">{money(hood.rent1br)}</td>
                  <td className="p-4 pr-4 text-right tabular-nums">{money(hood.medianHomePrice)}</td>
                  <td className="p-4 pr-4 text-right tabular-nums">{hood.commuteMinutes} min</td>
                  <td className="p-4 pr-4 text-right tabular-nums">{hood.schoolScore}</td>
                  <td className="p-4 pr-4 text-right tabular-nums">{hood.safetyScore}</td>
                  <td className="p-4 pr-4 text-right tabular-nums">{hood.walkScore}</td>
                  <td className="p-4 text-right tabular-nums">{hood.lifestyleScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="hood-cards">
        <SectionHeading eyebrow="Profiles" title="Area by area" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hoods.map((hood) => (
            <li key={hood.slug}>
              <Card className="h-full p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-ink">{hood.name}</h3>
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    {money(hood.rent1br)}
                    <span className="text-xs font-medium text-muted">/mo</span>
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">{hood.vibe}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{hood.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Row label="Median home" value={money(hood.medianHomePrice)} />
                  <Row label="Commute" value={`${hood.commuteMinutes} min`} />
                  <Row label="Schools" value={`${hood.schoolScore}/100`} />
                  <Row label="Safety" value={`${hood.safetyScore}/100`} />
                  <Row label="Walk score" value={`${hood.walkScore}/100`} />
                  <Row label="Lifestyle" value={`${hood.lifestyleScore}/100`} />
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-muted">
        Want the full picture?{" "}
        <Link href={`/compare/new-york-ny-vs-${city.slug}`} className="font-medium text-brand hover:underline">
          Compare {city.name} with New York
        </Link>{" "}
        or{" "}
        <Link href="/compare" className="font-medium text-brand hover:underline">
          pick two cities
        </Link>
        .
      </p>
    </Container>
  );
}

function HighlightCard({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{name}</p>
      <p className="mt-1 text-sm tabular-nums text-muted">{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-slate-700">{value}</dd>
    </div>
  );
}
