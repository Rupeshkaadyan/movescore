import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "What MoveScore collects, what it never collects, and how your data is handled.",
  path: "/privacy",
});

const UPDATED = "September 2026";

export default function PrivacyPage() {
  return (
    <Container className="py-10">
      <article className="max-w-3xl">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy policy"
          description={`Last updated: ${UPDATED}`}
        />

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-ink">The short version</h2>
            <p className="mt-2">
              You can use every calculator and comparison on MoveScore without
              creating an account. Your salary, household size and other inputs
              stay in the URL you are viewing and in your browser — they are not
              sent to analytics and are not stored by us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">What we collect</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong className="font-semibold">Product events</strong> such as
                “comparison completed” or “calculator used”, with the city pair
                involved. These never include salary, household size, children,
                or free-text search terms.
              </li>
              <li>
                <strong className="font-semibold">Standard server logs</strong>{" "}
                (URL, status, timestamp, user agent) produced by our hosting
                provider for reliability and security.
              </li>
              <li>
                <strong className="font-semibold">Account data</strong> — only
                once accounts ship: an email address and the comparisons you
                explicitly choose to save.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">
              What we deliberately do not collect
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Salary, income, debt or expense figures you enter.</li>
              <li>Household composition, beyond what is needed to render the page you are on.</li>
              <li>Search text. We record that a search happened and how many results it returned, not what you typed.</li>
              <li>Precise location. City selection is explicit, not inferred.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Cookies</h2>
            <p className="mt-2">
              MoveScore currently sets no advertising or tracking cookies. If
              analytics is enabled it uses a first-party, cookieless beacon.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Sharing</h2>
            <p className="mt-2">
              We do not sell personal data. Processors are limited to hosting and
              (once enabled) error monitoring and analytics, each bound to handle
              data only for that purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Your choices</h2>
            <p className="mt-2">
              Because most inputs live in the URL, clearing or not sharing the URL
              keeps your scenario private. Once accounts exist you will be able to
              export or delete saved comparisons. Requests: use the contact page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Status of this build</h2>
            <p className="mt-2">
              This deployment runs without accounts and without a database, so
              there is no persistent store of user data yet. If that changes, this
              policy will be updated before the change ships.
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
