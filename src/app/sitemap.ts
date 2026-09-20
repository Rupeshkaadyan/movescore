import type { MetadataRoute } from "next";
import { CITIES, POPULAR_COMPARISONS } from "@/lib/data/cities";
import { CITIES_WITH_NEIGHBORHOODS } from "@/lib/data/neighborhoods";
import { GUIDES } from "@/lib/data/guides";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only pages backed by real content are published. We deliberately do not
 * generate every possible city pair — that would create thousands of thin pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/compare",
    "/cities",
    "/cost-of-living",
    "/jobs",
    "/housing",
    "/neighborhoods",
    "/guides",
    // /search is intentionally absent: it is `noindex` internal search.
    "/methodology",
    "/move-cost",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const cityRoutes = CITIES.flatMap((city) => [
    {
      url: absoluteUrl(`/cities/${city.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: absoluteUrl(`/cost-of-living/${city.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);

  const neighborhoodRoutes = CITIES_WITH_NEIGHBORHOODS.map((slug) => ({
    url: absoluteUrl(`/cities/${slug}/neighborhoods`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const comparisonRoutes = POPULAR_COMPARISONS.map((pair) => ({
    url: absoluteUrl(`/compare/${pair.from}-vs-${pair.to}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  /** Salary calculator landing pages: /salary/austin-tx */
  const salaryCityRoutes = CITIES.map((city) => ({
    url: absoluteUrl(`/salary/${city.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // NOTE: /salary/<amount>/<city> is deliberately not published. It is the
  // same page as /salary/<city> with one number changed, so 30 cities x 6
  // presets would be 180 near-duplicate URLs — classic thin programmatic
  // content. Those pages stay reachable from the calculator (and are marked
  // `noindex, follow`) but are kept out of the sitemap.

  const guideRoutes = GUIDES.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...neighborhoodRoutes,
    ...comparisonRoutes,
    ...salaryCityRoutes,
    ...guideRoutes,
  ];
}
