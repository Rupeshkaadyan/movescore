import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of use",
  description:
    "How MoveScore may be used, what the estimates mean, and what MoveScore does not guarantee.",
  path: "/terms",
});

const UPDATED = "September 2026";

export default function TermsPage() {
  return (
    <Container className="py-10">
      <article className="max-w-3xl">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of use"
          description={`Last updated: ${UPDATED}`}
        />

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-ink">
              MoveScore is an estimate, not advice
            </h2>
            <p className="mt-2">
              Every figure on MoveScore is a model output built from published
              data plus the assumptions published on our{" "}
              <Link href="/methodology" className="font-medium text-brand hover:underline">
                methodology page
              </Link>
              . It is not financial, tax, legal, immigration or relocation advice.
              Verify anything you intend to act on with a qualified professional
              and with the original source we cite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">What we do not claim</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>We do not claim our figures are 100% accurate.</li>
              <li>We do not claim any city is “the best” for you.</li>
              <li>
                We do not guarantee savings. A projected saving is what our model
                produces under stated assumptions, not a promise.
              </li>
              <li>
                We do not cover every cost: childcare, student loans, insurance
                specifics, HOA fees and one-off life events are outside the model
                unless explicitly stated.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Data status</h2>
            <p className="mt-2">
              This deployment is labelled <strong className="font-semibold">demo
              data</strong> on every page. Values are realistic placeholders used
              to develop and demonstrate the product; they are not verified
              statistics and must not be cited as such. Pages show the intended
              source, update cadence and methodology for each metric group.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Acceptable use</h2>
            <p className="mt-2">
              Do not scrape the site at a rate that degrades service, do not
              misrepresent MoveScore output as an official government statistic,
              and do not use the service for unlawful purposes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Availability</h2>
            <p className="mt-2">
              The service is provided as-is. Features described as “coming”
              (accounts, saved comparisons, PDF delivery, admin tooling) are not
              part of the current build and no timeline is implied.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Contact</h2>
            <p className="mt-2">
              Questions about these terms: see the{" "}
              <Link href="/contact" className="font-medium text-brand hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
