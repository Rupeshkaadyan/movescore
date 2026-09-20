import type { MetricGroup } from "@/lib/types";
import { DATA_SNAPSHOT, DATA_STATUS, sourcesForGroup } from "@/lib/data/sources";
import { Badge } from "@/components/ui/primitives";

/**
 * Provenance footer for any data card: where the number came from, when it was
 * last refreshed, and how it was derived.
 *
 * The demo badge is not optional while DATA_STATUS is "demo" — a user must
 * always be able to tell official data from a placeholder.
 */
export function DataProvenance({
  group,
  compact = false,
}: {
  group: MetricGroup;
  compact?: boolean;
}) {
  const sources = sourcesForGroup(group);
  const primary = sources[0];
  if (!primary) return null;

  return (
    <div className="mt-4 border-t border-line pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={DATA_STATUS === "demo" ? "warning" : "success"}>
          {DATA_STATUS === "demo" ? "Demo data" : "Live data"}
        </Badge>
        <span className="text-xs text-muted">
          Source:{" "}
          <a
            href={primary.url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand hover:underline"
          >
            {primary.publisher}
          </a>
        </span>
        <span className="text-xs text-muted">Updated: {primary.lastUpdated}</span>
      </div>

      {!compact ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-ink">
            Methodology
          </summary>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {primary.methodology}
          </p>
          {sources.length > 1 ? (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {sources.slice(1).map((source) => (
                <li key={source.id}>
                  Also used:{" "}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-brand hover:underline"
                  >
                    {source.publisher}
                  </a>{" "}
                  (updated {source.lastUpdated})
                </li>
              ))}
            </ul>
          ) : null}
          {DATA_STATUS === "demo" ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              Snapshot {DATA_SNAPSHOT} — placeholder values for development, not
              verified statistics.
            </p>
          ) : null}
        </details>
      ) : null}
    </div>
  );
}
