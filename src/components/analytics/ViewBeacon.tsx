"use client";

import { useTrack, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/**
 * Invisible client component that records a view event once per mount.
 * Kept separate from page components so server rendering stays pure.
 */
export function ViewBeacon({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
}) {
  useTrack(event, props);
  return null;
}
