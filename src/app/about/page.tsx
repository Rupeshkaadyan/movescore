import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";
import { CITIES } from "@/lib/data/cities";

export const metadata: Metadata = buildMetadata({
  title: "About MoveScore",
  description:
    "Why MoveScore exists, what problem it solves, how it differs from a cost-of-living calculator, and what it deliberately does not do.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container className="py-10">
      <article className="max-w-3xl">
        <SectionHeading
          eyebrow="About"
          title="A decision engine, not a cost-of-living index"
          description="MoveScore models what moving would do to your money and your life — for your household, not for a national average."
        />

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-ink">The problem</h2>
            <p className="mt-2">
              Cost-of-living calculators answer “is city A more expensive than
              city B?” That is rarely the actual question. The real question is
              whether <em>you</em>, on <em>your</em> salary, with <em>your</em>{" "}
              household, would be better off — after tax, after rent, after the
              cost of getting there, and three years from now.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">What MoveScore does</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Models take-home pay with federal, state, local and FICA tax.</li>
              <li>
                Models monthly costs at your household size, with rent or
                ownership, car or no car.
              </li>
              <li>
                Produces a MoveScore from eight weighted categories, each with
                visible drivers — no black box.
              </li>
              <li>
                Projects 1, 3 and 5 years forward using each city&apos;s own rent
                and price growth.
              </li>
              <li>Estimates what the move itself costs and how long it takes to pay back.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">What it deliberately does not do</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                It does not rank cities “best to worst”. A score describes a fit
                with your inputs, not a verdict.
              </li>
              <li>
                It does not invent data. Where a metric is unavailable the page
                says so, and any placeholder is labelled demo.
              </li>
              <li>
                It does not model childcare, student debt, or irregular income —
                those are outside the current model.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Scope</h2>
            <p className="mt-2">
              The current build covers {CITIES.length} major U.S. cities, with
              neighbourhood data for a subset. We would rather be excellent on 30
              cities than vague on 10,000.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Independence</h2>
            <p className="mt-2">
              MoveScore is an independent product. It is not affiliated with any
              government body, employer, mover or real-estate company, and it does
              not accept payment for placement or ranking.
            </p>
          </section>

          <p className="pt-2">
            <Link href="/methodology" className="font-medium text-brand hover:underline">
              Read the full data and scoring methodology →
            </Link>
          </p>
        </div>
      </article>
    </Container>
  );
}
