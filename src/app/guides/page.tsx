import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { GUIDES } from "@/lib/data/guides";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Moving guides — taxes, housing, salaries and moving costs",
  description:
    "Practical guides on U.S. relocation: how state taxes really work, what salary you need, whether to rent or buy, and the moving costs people forget.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Guides"
        title="How to think about the move"
        description="Written to be useful first. No keyword stuffing, no invented statistics — every number in these guides exists in the city dataset."
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="card flex h-full flex-col p-6 hover:shadow-[var(--shadow-lift)]">
              <span className="inline-flex w-fit rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {guide.category}
              </span>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-ink">
                {guide.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {guide.excerpt}
              </p>
              <p className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{guide.readingMinutes} min read</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand">
                  Read
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
