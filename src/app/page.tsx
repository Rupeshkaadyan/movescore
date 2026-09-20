import type { Metadata } from "next";
import { HeroSearch } from "@/components/home/HeroSearch";
import {
  ExampleResultPreview,
  FeaturedCities,
  GuidesTeaser,
  NewsletterCta,
  PopularComparisons,
  WhyMoveScore,
} from "@/components/home/sections";
import { Container } from "@/components/ui/primitives";
import { cityOptionList } from "@/lib/cities";
import { SITE_DESCRIPTION, SITE_TAGLINE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `MoveScore — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  const cities = cityOptionList();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-soft/70 to-white">
        <Container className="py-14 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                U.S. relocation decision engine
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Thinking about moving to a new city?
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Compare real costs, salaries, housing, lifestyle and more. Make a
                smarter decision with data, not guesswork.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <li>Take-home pay after state and local tax</li>
                <li>Rent or buy, modelled both ways</li>
                <li>1, 3 and 5-year projections</li>
              </ul>
            </div>
            <HeroSearch cities={cities} />
          </div>
        </Container>
      </section>

      <PopularComparisons />
      <WhyMoveScore />
      <ExampleResultPreview />
      <FeaturedCities />
      <GuidesTeaser />
      <NewsletterCta />
    </>
  );
}
