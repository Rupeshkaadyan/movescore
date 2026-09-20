"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/primitives";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-20">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-danger">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          This comparison could not be calculated
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          The calculation engine hit an unexpected input. Trying again usually
          clears it; if not, the input values are outside the supported range.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
      </div>
    </Container>
  );
}
