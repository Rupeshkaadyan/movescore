import type { Metadata } from "next";

export const SITE_NAME = "MoveScore";
export const SITE_TAGLINE = "A smarter move for a brighter you.";
export const SITE_DESCRIPTION =
  "Compare the real cost of moving between U.S. cities — take-home pay, rent, taxes, housing, jobs and lifestyle — and get a personalized MoveScore for your household.";

/**
 * Set NEXT_PUBLIC_SITE_URL in production so canonical URLs and the sitemap
 * resolve to the live domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://movescore.app";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: absoluteUrl("/brand/app-icon.png"), width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/brand/app-icon.png")],
    },
  };
}

/**
 * Serialize structured data for a `<script type="application/ld+json">` block.
 *
 * `JSON.stringify` alone is not enough: a value containing `</script>` would
 * terminate the script element early. Escaping `<` as a unicode escape keeps
 * the JSON valid while making script break-out impossible.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** BreadcrumbList structured data. */
export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function datasetSchema(opts: {
  name: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url),
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
  };
}
