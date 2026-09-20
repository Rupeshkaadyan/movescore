/**
 * MoveScore core domain types.
 *
 * Every quantitative field that surfaces in the UI is traceable to a
 * `SourceRef` (see `lib/data/sources.ts`) through `METRIC_SOURCE_GROUP`.
 * Nothing in this file is allowed to hold a bare number without a source.
 */

export type DataStatus = "demo" | "live";

/** A citable origin for one or more data points. */
export type SourceRef = {
  id: string;
  label: string;
  publisher: string;
  url: string;
  /** ISO date the publisher last refreshed the series. */
  lastUpdated: string;
  /** How the publisher / MoveScore derived the number. */
  methodology: string;
};

/** Coarse families of metrics, used to attach sources without 40 duplicate maps. */
export type MetricGroup =
  | "demographics"
  | "housing"
  | "cost-of-living"
  | "jobs"
  | "taxes"
  | "transportation"
  | "weather"
  | "healthcare"
  | "education"
  | "safety"
  | "lifestyle";

export type CityMetrics = {
  // Demographics
  population: number;
  medianHouseholdIncome: number;

  // Housing
  medianRent1br: number;
  medianRent2br: number;
  medianRent3br: number;
  medianHomePrice: number;
  propertyTaxRate: number; // effective annual % of home value
  rentGrowthYoY: number; // %
  homeGrowthYoY: number; // %

  // Cost of living (100 = U.S. average)
  colIndex: number;
  rentIndex: number;
  utilitiesIndex: number;
  groceriesIndex: number;
  transportationIndex: number;
  healthcareIndex: number;
  miscIndex: number;

  // Jobs
  unemploymentRate: number; // %
  jobGrowthYoY: number; // %
  salaryIndex: number; // 100 = national wage for the same occupation
  topIndustries: string[];

  // Taxes
  hasStateIncomeTax: boolean;
  stateIncomeTaxRate: number; // effective % of gross, approximation
  localIncomeTaxRate: number; // %
  salesTaxRate: number; // combined state + average local %
  stateTaxNote: string;

  // Transportation
  commuteMinutes: number; // one-way average
  transitScore: number; // 0-100
  walkScore: number; // 0-100
  transitFareMonthly: number;

  // Weather / environment
  climateScore: number; // 0-100
  sunnyDays: number;
  avgHighF: number;
  avgLowF: number;
  annualRainInches: number;
  airQualityIndex: number; // lower is better

  // Healthcare
  healthcareQualityIndex: number; // 0-100

  // Education
  schoolScore: number; // 0-100
  highSchoolGradRate: number; // %
  bachelorShare: number; // % of adults 25+

  // Safety
  safetyScore: number; // 0-100
  violentCrimePer100k: number;
  propertyCrimePer100k: number;

  // Lifestyle
  amenityScore: number; // 0-100
};

export type City = {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  county: string;
  lat: number;
  lng: number;
  timezone: string;
  /** One-line hook used in cards and search results. */
  tagline: string;
  /** 2-3 sentence human-written overview for the city page. */
  summary: string;
  pros: string[];
  cons: string[];
  metrics: CityMetrics;
};

export type Neighborhood = {
  slug: string;
  citySlug: string;
  name: string;
  rent1br: number;
  medianHomePrice: number;
  commuteMinutes: number;
  safetyScore: number; // 0-100
  schoolScore: number; // 0-100
  walkScore: number;
  lifestyleScore: number; // 0-100
  population: number;
  vibe: string;
  description: string;
};

/** Household inputs captured from the user. */
export type HouseholdInput = {
  salary: number; // annual gross, USD
  householdSize: number;
  children: number;
  ownsCar: boolean;
  housingMode: "rent" | "own";
  filingStatus: "single" | "married";
  occupation?: string;
};

export type FilingStatus = HouseholdInput["filingStatus"];

/** One row of the monthly budget comparison table. */
export type BudgetRow = {
  key: string;
  label: string;
  current: number;
  destination: number;
  /** destination - current; negative means the destination is cheaper. */
  delta: number;
  percentDelta: number;
  note: string;
  group: MetricGroup;
};

export type CategoryScore = {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // share of the MoveScore, sums to 1
  contribution: number;
  /** Plain-English explanation shown in the "why" drawer. */
  explanation: string;
  drivers: { label: string; value: string }[];
};

export type ProjectionYear = {
  year: 1 | 3 | 5;
  horizonLabel: string;
  stayCumulative: number;
  moveCumulative: number;
  netBenefit: number;
  note: string;
};

export type MoveScoreBreakdown = {
  score: number;
  band: "excellent" | "good" | "mixed" | "risky";
  headline: string;
  categories: CategoryScore[];
};

export type ComparisonResult = {
  origin: City;
  destination: City;
  input: HouseholdInput;
  takeHome: { origin: number; destination: number };
  taxes: {
    origin: TaxBreakdown;
    destination: TaxBreakdown;
  };
  budget: BudgetRow[];
  monthlyCost: { origin: number; destination: number };
  leftover: { origin: number; destination: number };
  monthlySavings: number;
  moveScore: MoveScoreBreakdown;
  /** Score for the origin city, shown beside the destination for context. */
  originScore: MoveScoreBreakdown;
  salaryScenario: { originGross: number; destinationGross: number; marketAdjusted: boolean };
  projections: ProjectionYear[];
  moveCost: MoveCostEstimate;
  takeaways: string[];
  dataStatus: DataStatus;
};

export type TaxBreakdown = {
  federal: number;
  state: number;
  local: number;
  fica: number;
  total: number;
  effectiveRate: number;
  note: string;
};

export type MoveCostEstimate = {
  distanceMiles: number;
  low: number;
  mid: number;
  high: number;
  lineItems: { label: string; amount: number; note: string }[];
  monthsToBreakEven: number | null;
  methodology: string;
};
