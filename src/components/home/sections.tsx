import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Database,
  Eye,
  Mail,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { CITIES, FEATURED_CITIES, POPULAR_COMPARISONS, cityLabel } from "@/lib/data/cities";
import { GUIDES } from "@/lib/data/guides";
import { compareHref } from "@/lib/query";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";
import { computeComparison } from "@/lib/calc/compare";
import { money } from "@/lib/format";
import { Button, Card, Container, SectionHeading, ScoreBar } from "@/components/ui/primitives";
import { ScoreGauge, ScoreBandLabel } from "@/components/results/ScoreGauge";

export function PopularComparisons() {
  return (
    <section className="py-14 sm:py-16" aria-labelledby="popular-comparisons">
      <Container>
        <SectionHeading
          eyebrow="Popular comparisons"
          title="Start with a comparison people actually ask about"
          description="Every link opens a personalized result page you can adjust — salary, household, car, rent or buy."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_COMPARISONS.map((pair) => (
            <li key={`${pair.from}-${pair.to}`}>
              <Link
                href={compareHref(pair.from, pair.to, DEFAULT_INPUT, DEFAULT_OPTIONS)}
                className="card group flex h-full flex-col gap-1 p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <span className="text-base font-semibold text-ink">
                  {CITIES.find((c) => c.slug === pair.from)?.name} →{" "}
                  {CITIES.find((c) => c.slug === pair.to)?.name}
                </span>
                <span className="text-sm leading-relaxed text-muted">{pair.note}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Open comparison
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

const WHY = [
  {
    icon: Database,
    title: "Real data, not vibes",
    body: "Every number carries a source, a source URL and a last-updated date. If we don't have it, we say so.",
  },
  {
    icon: Sparkles,
    title: "Personalized to your household",
    body: "Your salary, household size, children, car and housing choice change the answer. National averages don't decide for you.",
  },
  {
    icon: Eye,
    title: "Transparent scoring",
    body: "The MoveScore is a weighted average of eight category scores. You can open every weight and driver.",
  },
  {
    icon: CalendarRange,
    title: "1, 3 and 5-year planning",
    body: "Rent and home prices compound. We project the cumulative difference so you can see when a move pays back.",
  },
];

export function WhyMoveScore() {
  return (
    <section className="border-y border-line bg-surface py-14 sm:py-16" aria-labelledby="why">
      <Container>
        <SectionHeading
          eyebrow="Why MoveScore"
          title="Built for a decision, not a curiosity"
          description="Most cost-of-living calculators stop at an index. MoveScore models what actually happens to your money."
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <li key={item.title}>
              <Card className="h-full p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function ExampleResultPreview() {
  const origin = CITIES.find((c) => c.slug === "new-york-ny");
  const destination = CITIES.find((c) => c.slug === "austin-tx");
  if (!origin || !destination) return null;

  const result = computeComparison(origin, destination, DEFAULT_INPUT, DEFAULT_OPTIONS);
  const saving = result.monthlySavings;

  return (
    <section className="py-14 sm:py-16" aria-labelledby="example-result">
      <Container>
        <SectionHeading
          eyebrow="Example result"
          title="What a MoveScore report actually looks like"
          description={`A demo run for a single person earning ${money(
            DEFAULT_INPUT.salary,
          )} who rents and owns a car. Your own numbers will differ — that's the point.`}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {origin.name} → {destination.name}
            </p>
            <p className="mt-3 text-sm font-medium text-muted">
              {saving >= 0 ? "You could keep" : "You would spend"}
            </p>
            <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {money(Math.abs(saving))}
              <span className="ml-1 text-lg font-medium text-muted">/ month</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {result.moveScore.headline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={compareHref(origin.slug, destination.slug, DEFAULT_INPUT, DEFAULT_OPTIONS)}>
                <Button variant="primary" size="md">
                  Open this comparison
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col items-center justify-center p-6">
              <ScoreGauge breakdown={result.moveScore} size={140} />
              <p className="mt-3 text-sm font-semibold text-ink">MoveScore</p>
              <div className="mt-2">
                <ScoreBandLabel breakdown={result.moveScore} />
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-semibold text-ink">Estimated monthly leftover</p>
              <div className="mt-4 space-y-3">
                <LeftoverBar label={origin.name} value={result.leftover.origin} />
                <LeftoverBar label={destination.name} value={result.leftover.destination} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Take-home pay minus housing, utilities, groceries, transport,
                healthcare and misc.
              </p>
            </Card>

            <Card className="p-6 sm:col-span-2">
              <p className="text-sm font-semibold text-ink">Top category scores</p>
              <ul className="mt-4 space-y-3">
                {result.moveScore.categories.slice(0, 4).map((category) => (
                  <li key={category.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{category.label}</span>
                      <span className="text-xs text-muted">{Math.round(category.weight * 100)}% weight</span>
                    </div>
                    <ScoreBar score={category.score} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}

function LeftoverBar({ label, value }: { label: string; value: number }) {
  const width = Math.max(6, Math.min(100, (value / 3500) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums text-ink">{money(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function FeaturedCities() {
  return (
    <section className="border-t border-line bg-surface py-14 sm:py-16" aria-labelledby="cities">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Cities"
            title="Thirty major U.S. cities, modelled properly"
            description="We started with 30 instead of 10,000 on purpose. Each one has a full cost, tax, housing, jobs and lifestyle profile."
          />
          <Link
            href="/cities"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            All cities
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_CITIES.map((city) => (
            <li key={city.slug}>
              <Link href={`/cities/${city.slug}`} className="card block h-full p-5 hover:shadow-[var(--shadow-lift)]">
                <p className="text-base font-semibold text-ink">{cityLabel(city)}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                  Cost index {city.metrics.colIndex} · Wage index {city.metrics.salaryIndex}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{city.tagline}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  View city
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function GuidesTeaser() {
  return (
    <section className="py-14 sm:py-16" aria-labelledby="guides">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Guides"
            title="How to think about the move"
            description="Written to be useful first. No fabricated statistics, no filler."
          />
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            All guides
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.slice(0, 3).map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="card block h-full p-6 hover:shadow-[var(--shadow-lift)]">
                <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
                  {guide.category}
                </span>
                <h3 className="mt-3 text-base font-semibold leading-snug text-ink">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{guide.excerpt}</p>
                <p className="mt-4 text-xs text-muted">{guide.readingMinutes} min read</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function NewsletterCta() {
  return (
    <section className="py-14 sm:py-16" aria-labelledby="newsletter">
      <Container>
        <div className="rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                Coming with accounts
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Get your MoveScore report by email
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                Save a comparison and we will send the full report. Email capture
                and saved reports land with authentication in Phase 5 — until then,
                you can download any report as a PDF.
              </p>
            </div>
            <form className="flex flex-col gap-3" aria-label="Newsletter signup">
              <label className="block">
                <span className="sr-only">Email address</span>
                <span className="relative block">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    disabled
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 disabled:opacity-70"
                  />
                </span>
              </label>
              <button
                type="button"
                disabled
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-ink disabled:opacity-70"
              >
                Notify me
              </button>
              <p className="text-xs text-slate-400">
                Disabled in this build — nothing is collected yet.
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
