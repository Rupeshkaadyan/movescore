"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { search, cityOptionList } from "@/lib/cities";
import { Card, EmptyState } from "@/components/ui/primitives";
import { track } from "@/lib/analytics";

const EXAMPLES = ["Austin", "New York vs Austin", "100k in Texas", "Seattle"];

const TYPE_LABEL = {
  city: "City",
  comparison: "Comparison",
  guide: "Guide",
  calculator: "Calculator",
} as const;

export function SearchExperience() {
  const [query, setQuery] = useState("");
  const cities = useMemo(() => cityOptionList(), []);
  const hits = useMemo(() => search(query), [query]);

  // Search text never leaves the browser — only that a search happened and
  // whether it produced results.
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      track("search_used", {
        results: hits.length,
        matchedComparison: hits.some((hit) => hit.type === "comparison"),
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [query, hits.length]);

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search MoveScore</span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cities, comparisons, calculators"
            autoComplete="off"
            className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-4 text-base text-ink placeholder:text-muted"
          />
        </span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-brand hover:text-brand"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!query ? (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-ink">Browse all {cities.length} cities</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-surface hover:text-brand"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : hits.length === 0 ? (
          <EmptyState
            title="No matches yet"
            description={`Nothing matched “${query}”. MoveScore currently indexes 30 cities — try a city name or a state.`}
          />
        ) : (
          <ul className="space-y-2" aria-live="polite">
            {hits.map((hit) => (
              <li key={`${hit.type}-${hit.href}`}>
                <Link
                  href={hit.href}
                  className="card flex items-center justify-between gap-4 p-4 hover:shadow-[var(--shadow-lift)]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">{hit.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{hit.subtitle}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                    {TYPE_LABEL[hit.type]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
