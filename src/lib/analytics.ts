/**
 * Analytics architecture.
 *
 * Design rules:
 *  1. Never send sensitive inputs. Salary, household size, children, debt and
 *     free-text queries are stripped before anything leaves the browser.
 *  2. No third-party script is loaded by default. Set
 *     NEXT_PUBLIC_ANALYTICS_ENDPOINT to a self-hosted or privacy-friendly
 *     collector and events are delivered with `sendBeacon`.
 *  3. Failure silent: analytics must never break the product.
 *
 * See docs/ANALYTICS.md for the event list and the collector contract.
 */

import { useEffect, type DependencyList } from "react";

export type AnalyticsEvent =
  | "comparison_started"
  | "comparison_completed"
  | "city_viewed"
  | "neighborhoods_viewed"
  | "calculator_used"
  | "scenario_created"
  | "report_generated"
  | "report_downloaded"
  | "comparison_saved"
  | "search_used";

/** Fields that are never allowed to leave the browser. */
const BLOCKED_KEYS = new Set([
  "salary",
  "income",
  "household",
  "householdSize",
  "children",
  "debt",
  "query",
  "email",
  "name",
]);

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

function sanitize(props: AnalyticsProps = {}): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (BLOCKED_KEYS.has(key)) continue;
    if (typeof value === "string" && value.length > 64) continue;
    safe[key] = value;
  }
  return safe;
}

const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ?? "";

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  if (!ENDPOINT) return;

  const payload = JSON.stringify({
    event,
    props: sanitize(props),
    path: window.location.pathname,
    ts: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    // Analytics must never break the product.
  }
}

/** Fire once on mount (or whenever deps change) inside a client component. */
export function useTrack(
  event: AnalyticsEvent,
  props?: AnalyticsProps,
  deps: DependencyList = [],
) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
