import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact MoveScore",
  description:
    "How to reach the MoveScore team about data corrections, bugs, partnerships or privacy requests.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="py-10">
      <article className="max-w-3xl">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="Data corrections are the most valuable message we receive — every figure on the site is traceable, so if one is wrong we can fix it at the source."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink">Data corrections</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Tell us the city, the metric and the correct value with a link to
              the source. We re-check the group and update the provenance record.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink">Bugs and feedback</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Include the URL of the comparison you were running — it reproduces
              your exact inputs without you sharing personal details.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink">Privacy requests</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Export or deletion requests. There is no account system in this
              build, so there is currently no personal data store to export.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink">Press or partnerships</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              We do not sell placement, rankings or leads. Editorial use of our
              data is welcome with attribution and a link to the methodology.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Email status</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Professional email is not switched on yet. It requires the production
            domain to be connected and a mailbox provider to be configured — both
            are pending. The intended addresses are{" "}
            <span className="font-medium">hello@</span> and{" "}
            <span className="font-medium">support@</span> on the production
            domain. Until then, please use the project&apos;s repository issues
            for anything you need answered.
          </p>
          <p className="mt-3 text-xs text-muted">
            We never ask for passwords, payment details or credentials by email.
          </p>
        </div>

        <p className="mt-8 text-sm text-muted">
          Before writing in, the{" "}
          <Link href="/methodology" className="font-medium text-brand hover:underline">
            methodology page
          </Link>{" "}
          answers most questions about where numbers come from and how the score
          is built.
        </p>
      </article>
    </Container>
  );
}
