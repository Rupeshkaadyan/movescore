import { CITIES, CITY_BY_SLUG, cityLabel } from "@/lib/data/cities";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function citySlug(name: string, stateCode: string): string {
  return `${slugify(name)}-${stateCode.toLowerCase()}`;
}

export function findCity(slug: string) {
  return CITY_BY_SLUG[slug];
}

export function comparisonSlug(from: string, to: string): string {
  return `${from}-vs-${to}`;
}

export function parseComparisonSlug(
  slug: string,
): { from: string; to: string } | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  const [from, to] = parts;
  if (!CITY_BY_SLUG[from] || !CITY_BY_SLUG[to]) return null;
  return { from, to };
}

export function cityOptionList() {
  return CITIES.map((city) => ({
    slug: city.slug,
    label: cityLabel(city),
    group: city.state,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

export type SearchHit = {
  type: "city" | "comparison" | "guide" | "calculator";
  title: string;
  subtitle: string;
  href: string;
};

/**
 * Demo search: rank cities, pre-built comparisons and guides by simple
 * substring scoring. Replaced by Postgres full-text search in Phase 5.
 */
export function search(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const city of CITIES) {
    const haystack = `${city.name} ${city.state} ${city.stateCode} ${city.county}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        type: "city",
        title: cityLabel(city),
        subtitle: city.tagline,
        href: `/cities/${city.slug}`,
      });
    }
  }

  // "new york vs austin" → pre-built comparison
  const vsMatch = q.split(/\s+vs\.?\s+/);
  if (vsMatch.length === 2) {
    const a = CITIES.find((c) => c.name.toLowerCase().startsWith(vsMatch[0].trim()));
    const b = CITIES.find((c) => c.name.toLowerCase().startsWith(vsMatch[1].trim()));
    if (a && b) {
      hits.unshift({
        type: "comparison",
        title: `${a.name} vs ${b.name}`,
        subtitle: "Personalized cost, salary and lifestyle comparison",
        href: `/compare/${comparisonSlug(a.slug, b.slug)}`,
      });
    }
  }

  // "$100k in texas" style query
  const salaryMatch = q.match(/\$?(\d{2,3})[k,]?0{0,3}\b/);
  if (salaryMatch) {
    const amount = Number(salaryMatch[1]) * 1000;
    const stateCity = CITIES.find((c) => q.includes(c.state.toLowerCase()) || q.includes(c.name.toLowerCase()));
    if (stateCity) {
      hits.push({
        type: "calculator",
        title: `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)} in ${cityLabel(stateCity)}`,
        subtitle: "Take-home pay calculator",
        href: `/salary/${amount}/${stateCity.slug}`,
      });
    }
  }

  return hits.slice(0, 20);
}

export function relatedComparisons(slug: string, limit = 6) {
  const city = CITY_BY_SLUG[slug];
  if (!city) return [];
  return CITIES.filter((c) => c.slug !== slug)
    .map((c) => ({
      city: c,
      distance:
        Math.abs(c.metrics.colIndex - city.metrics.colIndex) +
        Math.abs(c.metrics.salaryIndex - city.metrics.salaryIndex),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => ({
      slug: comparisonSlug(slug, entry.city.slug),
      from: city,
      to: entry.city,
    }));
}
