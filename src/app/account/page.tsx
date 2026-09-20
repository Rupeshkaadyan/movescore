import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your account",
  description:
    "Saved comparisons, saved cities and MoveScore reports. Accounts and saved reports arrive in Phase 5.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Account"
        title="Saved comparisons and reports"
        description="Accounts are not switched on in this build. Here is exactly what is planned, and what you can do today."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <EmptyState
          title="Saved comparisons"
          description="Sign in to keep the comparisons you run, name them, and come back to them. Planned for Phase 5 with Supabase authentication."
          action={
            <Link href="/compare" className="text-sm font-semibold text-brand hover:underline">
              Run a comparison instead
            </Link>
          }
        />
        <EmptyState
          title="Downloadable reports"
          description="A polished PDF version of any comparison is planned alongside accounts. Today you can print any result page — it is styled for print."
          action={
            <Link
              href="/compare/new-york-ny-vs-austin-tx"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Open a result page
            </Link>
          }
        />
      </div>

      <p className="mt-8 text-sm text-muted">
        Until then, every comparison has a shareable URL — copy it from the result
        page and it will reproduce your exact inputs.
      </p>
    </Container>
  );
}
