import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          We could not find that page
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          MoveScore currently indexes 30 U.S. cities. The page you asked for is
          not part of that set.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/compare"
            className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Compare two cities
          </Link>
          <Link
            href="/cities"
            className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:bg-surface"
          >
            Browse cities
          </Link>
        </div>
      </div>
    </Container>
  );
}
