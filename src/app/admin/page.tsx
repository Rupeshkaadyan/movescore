import type { Metadata } from "next";
import { Container, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

/**
 * Admin is gated server-side. The dashboard is intentionally unavailable until
 * authentication exists (Phase 5) — shipping an open admin surface would expose
 * write-oriented views of the dataset to anyone who finds the URL.
 *
 * To enable locally for development on trusted networks only:
 *   ADMIN_ENABLED=true npm run dev
 */
export const metadata: Metadata = buildMetadata({
  title: "Admin",
  description: "MoveScore data management console — disabled until authentication ships.",
  path: "/admin",
  noIndex: true,
});

const isEnabled = () => process.env.ADMIN_ENABLED === "true";

export default function AdminPage() {
  if (!isEnabled()) {
    return (
      <Container className="py-16">
        <SectionHeading
          eyebrow="Admin"
          title="Admin console is not enabled"
          description="There is no authentication layer in this build, so the data-management console stays closed rather than shipping an open write surface."
        />
        <div className="mt-8 max-w-2xl">
          <EmptyState
            title="Nothing is exposed here"
            description="City, housing, tax, source and article management arrives with Supabase Auth and role checks (Phase 5-7). Until then this route renders a locked notice, is disallowed in robots.txt, and is excluded from the sitemap."
            action={
              <a href="/methodology" className="text-sm font-semibold text-brand hover:underline">
                Read the data methodology instead
              </a>
            }
          />
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Operators: set <code className="rounded bg-surface px-1">ADMIN_ENABLED=true</code>{" "}
            in a trusted environment to preview the console. Never enable it on a
            public deployment before role checks exist.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Admin"
        title="Data management"
        description="Admin console enabled. Remember: this route has no authentication in this build — keep it off public deployments."
      />
    </Container>
  );
}
