import type { MetricGroup, SourceRef } from "@/lib/types";

/**
 * Global source registry.
 *
 * PHASE 1-2 STATUS: these entries describe the *intended* upstream sources.
 * The numbers shipped in `cities.ts` are clearly-labelled demo values
 * (`DATA_STATUS = "demo"`), so every page renders a "demo data" notice until
 * the ingestion jobs in Phase 4 populate the real series.
 */
export const DATA_STATUS = "demo" as const;
export const DATA_SNAPSHOT = "2026-09-01";

export const SOURCES: SourceRef[] = [
  {
    id: "src-census-acs",
    label: "U.S. Census Bureau — American Community Survey (5-year)",
    publisher: "U.S. Census Bureau",
    url: "https://www.census.gov/programs-surveys/acs",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Population, household income, education attainment and commuting time are taken from ACS 5-year estimates at the place level.",
  },
  {
    id: "src-hud-fmr",
    label: "HUD Fair Market Rents & Small Area FMRs",
    publisher: "U.S. Department of Housing and Urban Development",
    url: "https://www.huduser.gov/portal/datasets/fmr.html",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Median asking rent per unit size is anchored to the 40th-percentile Fair Market Rent for the metro, converted to a monthly figure.",
  },
  {
    id: "src-zillow",
    label: "Zillow Home Value Index & Zillow Observed Rent Index",
    publisher: "Zillow",
    url: "https://www.zillow.com/research/data/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Home values use the seasonally-adjusted ZHVI for the city. Rent growth and home-value growth are trailing 12-month changes.",
  },
  {
    id: "src-bls-cpi",
    label: "BLS Consumer Price Index — Metro area price indexes",
    publisher: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/cpi/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Category cost indices are normalised so that the U.S. city average equals 100; each city value is a ratio to that average.",
  },
  {
    id: "src-bls-oes",
    label: "BLS Occupational Employment and Wage Statistics",
    publisher: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/oes/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "The salary index is the metro-to-national ratio of median annual wages, averaged across the city's largest occupations.",
  },
  {
    id: "src-bls-laus",
    label: "BLS Local Area Unemployment Statistics",
    publisher: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/lau/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Unemployment rate is the not-seasonally-adjusted metro rate for the latest available month.",
  },
  {
    id: "src-taxfoundation",
    label: "State & Local Tax Burden rankings",
    publisher: "Tax Foundation",
    url: "https://taxfoundation.org/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "State and local income tax rates are effective (not marginal) rates for a median household; sales tax is the combined state + average local rate.",
  },
  {
    id: "src-noaa",
    label: "NOAA Climate Normals (1991-2020)",
    publisher: "NOAA National Centers for Environmental Information",
    url: "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Sunny days, average high/low and annual precipitation come from the 30-year climate normals for the city's primary station.",
  },
  {
    id: "src-epa-aqi",
    label: "EPA Air Quality Index annual summary",
    publisher: "U.S. Environmental Protection Agency",
    url: "https://www.epa.gov/outdoor-air-quality-data",
    lastUpdated: DATA_SNAPSHOT,
    methodology: "Annual average AQI computed from daily PM2.5 and ozone values.",
  },
  {
    id: "src-fbi-ucr",
    label: "FBI Uniform Crime Reporting Program",
    publisher: "Federal Bureau of Investigation",
    url: "https://www.fbi.gov/services/cjis/ucr",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Violent and property crime rates are per 100,000 residents using the most recent full-year agency submissions.",
  },
  {
    id: "src-nces",
    label: "NCES & GreatSchools district ratings",
    publisher: "National Center for Education Statistics / GreatSchools",
    url: "https://nces.ed.gov/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "School score blends district GreatSchools ratings with NCES graduation rates, weighted by district enrollment.",
  },
  {
    id: "src-cms",
    label: "CMS Hospital Compare & Medicare cost reports",
    publisher: "Centers for Medicare & Medicaid Services",
    url: "https://data.cms.gov/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Healthcare quality index combines hospital star ratings, preventable-readmission rates and per-capita specialist supply.",
  },
  {
    id: "src-walkscore",
    label: "Walk Score / Transit Score / Bike Score",
    publisher: "Walk Score (Redfin)",
    url: "https://www.walkscore.com/",
    lastUpdated: DATA_SNAPSHOT,
    methodology:
      "Scores are the published city-level Walk Score and Transit Score, which measure proximity of amenities and transit frequency.",
  },
];

export const SOURCE_BY_ID: Record<string, SourceRef> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
);

export const METRIC_SOURCE_GROUP: Record<MetricGroup, string> = {
  demographics: "src-census-acs",
  housing: "src-hud-fmr",
  "cost-of-living": "src-bls-cpi",
  jobs: "src-bls-oes",
  taxes: "src-taxfoundation",
  transportation: "src-walkscore",
  weather: "src-noaa",
  healthcare: "src-cms",
  education: "src-nces",
  safety: "src-fbi-ucr",
  lifestyle: "src-census-acs",
};

/** Extra sources that contribute to a group, shown in the source drawer. */
export const GROUP_SECONDARY_SOURCES: Partial<Record<MetricGroup, string[]>> = {
  housing: ["src-zillow"],
  jobs: ["src-bls-laus"],
  weather: ["src-epa-aqi"],
  "cost-of-living": ["src-zillow"],
};

export function sourcesForGroup(group: MetricGroup): SourceRef[] {
  const primary = SOURCE_BY_ID[METRIC_SOURCE_GROUP[group]];
  const extra = (GROUP_SECONDARY_SOURCES[group] ?? []).map((id) => SOURCE_BY_ID[id]);
  return [primary, ...extra].filter(Boolean);
}

/** Resolve the source for a single budget row / metric label. */
export function sourceForMetricKey(key: string): MetricGroup {
  const map: Record<string, MetricGroup> = {
    takeHome: "jobs",
    taxes: "taxes",
    housing: "housing",
    rent: "housing",
    mortgage: "housing",
    utilities: "cost-of-living",
    groceries: "cost-of-living",
    transportation: "transportation",
    healthcare: "healthcare",
    misc: "cost-of-living",
    weather: "weather",
    schools: "education",
    safety: "safety",
    lifestyle: "lifestyle",
  };
  return map[key] ?? "cost-of-living";
}
