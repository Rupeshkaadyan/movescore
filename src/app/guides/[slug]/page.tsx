import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, Container } from "@/components/ui/primitives";
import { GUIDES, GUIDE_BY_SLUG } from "@/lib/data/guides";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) return buildMetadata({ title: "Guide not found", path: `/guides/${slug}` });
  return buildMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guides/${slug}`,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) notFound();

  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: guide.title },
        ]}
      />

      <article className="mt-8 max-w-3xl">
        <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
          {guide.category}
        </span>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {guide.readingMinutes} min read · Updated {guide.updated}
        </p>

        <div className="mt-8 space-y-5">
          {guide.body.map((paragraph, index) => (
            <p
              key={index}
              className={
                index === 0
                  ? "text-lg leading-relaxed text-slate-800"
                  : "text-base leading-relaxed text-slate-700"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Test it on your own numbers</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Everything in this guide is reflected in the calculators. Run a
            comparison with your salary, household and housing choice to see your
            own version of it.
          </p>
          <Link
            href="/compare"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Compare two cities
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </article>

      <section className="mt-14" aria-labelledby="more-guides">
        <h2 id="more-guides" className="text-lg font-semibold text-ink">
          More guides
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug}>
              <Link href={`/guides/${other.slug}`} className="card block h-full p-5 hover:shadow-[var(--shadow-lift)]">
                <p className="text-sm font-semibold text-ink">{other.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{other.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
