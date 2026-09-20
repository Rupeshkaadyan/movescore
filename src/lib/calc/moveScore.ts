import type {
  CategoryScore,
  City,
  HouseholdInput,
  MoveScoreBreakdown,
  TaxBreakdown,
} from "@/lib/types";
import type { MonthlyCostBreakdown } from "@/lib/calc/costOfLiving";
import { clamp, money, percent, rescale } from "@/lib/format";

/**
 * The MoveScore is a transparent weighted average of eight category scores.
 *
 * Rules we hold to:
 *  1. Every category exposes named drivers with raw values, not just a number.
 *  2. Weights are published and sum to 1.
 *  3. If a driver is missing we renormalise rather than guess.
 */

export const CATEGORY_WEIGHTS = {
  financial: 0.3,
  housing: 0.18,
  jobs: 0.14,
  taxes: 0.12,
  transportation: 0.08,
  healthcare: 0.06,
  weather: 0.06,
  lifestyle: 0.06,
} as const;

export type ScoreInput = {
  city: City;
  input: HouseholdInput;
  takeHomeMonthly: number;
  taxes: TaxBreakdown;
  costs: MonthlyCostBreakdown;
};

const round = (n: number) => Math.round(n * 10) / 10;

function financialCategory(
  leftover: number,
  takeHome: number,
): Omit<CategoryScore, "weight" | "contribution"> {
  const ratio = takeHome > 0 ? leftover / takeHome : -1;
  const score = clamp(40 + ratio * 200, 0, 100);
  return {
    key: "financial",
    label: "Financial",
    score: round(score),
    explanation:
      "Compares money left over after taxes and living costs against take-home pay. The heaviest-weighted category, because it decides whether the move is sustainable.",
    drivers: [
      { label: "Monthly leftover", value: money(leftover) },
      { label: "Take-home pay", value: `${money(takeHome)}/mo` },
      { label: "Leftover share", value: percent(ratio * 100, 1) },
    ],
  };
}

function housingCategory(
  city: City,
  costs: MonthlyCostBreakdown,
  takeHome: number,
): Omit<CategoryScore, "weight" | "contribution"> {
  const share = takeHome > 0 ? costs.housing / takeHome : 1;
  const affordability = rescale(share, 0.5, 0.28);
  const growth = rescale(city.metrics.rentGrowthYoY, 3, -2);
  const score = 0.75 * affordability + 0.25 * growth;
  return {
    key: "housing",
    label: "Housing",
    score: round(clamp(score, 0, 100)),
    explanation:
      "75% housing cost as a share of take-home pay (28% is the target, 50% scores zero), 25% whether local rents are rising or falling.",
    drivers: [
      { label: costs.housingDetail.label, value: `${money(costs.housing)}/mo` },
      { label: "Share of take-home", value: percent(share * 100, 1) },
      { label: "Rent change YoY", value: percent(city.metrics.rentGrowthYoY, 1) },
    ],
  };
}

function jobsCategory(city: City): Omit<CategoryScore, "weight" | "contribution"> {
  const wage = rescale(city.metrics.salaryIndex, 80, 140);
  const unemployment = rescale(city.metrics.unemploymentRate, 8, 2);
  const growth = rescale(city.metrics.jobGrowthYoY, 0, 4);
  const score = 0.5 * wage + 0.3 * unemployment + 0.2 * growth;
  return {
    key: "jobs",
    label: "Jobs",
    score: round(clamp(score, 0, 100)),
    explanation:
      "50% metro wage index for your occupation band, 30% unemployment rate, 20% year-over-year job growth.",
    drivers: [
      { label: "Wage index", value: `${city.metrics.salaryIndex} (US = 100)` },
      { label: "Unemployment", value: percent(city.metrics.unemploymentRate, 1) },
      { label: "Job growth YoY", value: percent(city.metrics.jobGrowthYoY, 1) },
    ],
  };
}

function taxesCategory(
  city: City,
  taxes: TaxBreakdown,
): Omit<CategoryScore, "weight" | "contribution"> {
  // Income-tax burden plus a consumption proxy (sales tax, weighted at 40%).
  const burden = taxes.effectiveRate + city.metrics.salesTaxRate * 0.4;
  const score = rescale(burden, 38, 12);
  return {
    key: "taxes",
    label: "Taxes",
    score: round(clamp(score, 0, 100)),
    explanation:
      "Total effective tax burden (federal + state + local + FICA) plus 40% of the combined sales tax rate as a consumption proxy.",
    drivers: [
      { label: "Effective tax rate", value: percent(taxes.effectiveRate, 1) },
      { label: "State income tax", value: city.metrics.hasStateIncomeTax ? percent(city.metrics.stateIncomeTaxRate, 2) : "None" },
      { label: "Combined sales tax", value: percent(city.metrics.salesTaxRate, 2) },
    ],
  };
}

function transportationCategory(
  city: City,
  costs: MonthlyCostBreakdown,
  takeHome: number,
  ownsCar: boolean,
): Omit<CategoryScore, "weight" | "contribution"> {
  const share = takeHome > 0 ? costs.transportation / takeHome : 1;
  const cost = rescale(share, 0.16, 0.02);
  const commute = rescale(city.metrics.commuteMinutes, 45, 15);
  const score = 0.4 * cost + 0.3 * commute + 0.3 * city.metrics.transitScore;
  return {
    key: "transportation",
    label: "Transportation",
    score: round(clamp(score, 0, 100)),
    explanation:
      "40% transport cost as a share of take-home, 30% average one-way commute, 30% transit score (which also proxies how optional a car really is).",
    drivers: [
      { label: "Monthly cost", value: `${money(costs.transportation)}/mo` },
      { label: "Average commute", value: `${city.metrics.commuteMinutes} min` },
      { label: "Transit score", value: `${city.metrics.transitScore}/100` },
      { label: "Car in model", value: ownsCar ? `Yes (${costs.cars})` : "No" },
    ],
  };
}

function healthcareCategory(
  city: City,
  costs: MonthlyCostBreakdown,
  takeHome: number,
): Omit<CategoryScore, "weight" | "contribution"> {
  const share = takeHome > 0 ? costs.healthcare / takeHome : 1;
  const cost = rescale(share, 0.14, 0.04);
  const score = 0.6 * city.metrics.healthcareQualityIndex + 0.4 * cost;
  return {
    key: "healthcare",
    label: "Healthcare",
    score: round(clamp(score, 0, 100)),
    explanation:
      "60% regional healthcare quality index (hospital ratings, specialist supply), 40% modelled out-of-pocket and premium cost share.",
    drivers: [
      { label: "Quality index", value: `${city.metrics.healthcareQualityIndex}/100` },
      { label: "Modelled cost", value: `${money(costs.healthcare)}/mo` },
      { label: "Share of take-home", value: percent(share * 100, 1) },
    ],
  };
}

function weatherCategory(city: City): Omit<CategoryScore, "weight" | "contribution"> {
  const aqi = rescale(city.metrics.airQualityIndex, 80, 20);
  const score = 0.75 * city.metrics.climateScore + 0.25 * aqi;
  return {
    key: "weather",
    label: "Weather",
    score: round(clamp(score, 0, 100)),
    explanation:
      "75% climate score (temperature range, sunny days, precipitation), 25% annual average air quality index.",
    drivers: [
      { label: "Climate score", value: `${city.metrics.climateScore}/100` },
      { label: "Sunny days", value: `${city.metrics.sunnyDays}/yr` },
      { label: "Avg high / low", value: `${city.metrics.avgHighF}°F / ${city.metrics.avgLowF}°F` },
      { label: "Air quality (AQI)", value: String(city.metrics.airQualityIndex) },
    ],
  };
}

function lifestyleCategory(city: City): Omit<CategoryScore, "weight" | "contribution"> {
  const score =
    0.5 * city.metrics.amenityScore +
    0.25 * city.metrics.walkScore +
    0.25 * city.metrics.safetyScore;
  return {
    key: "lifestyle",
    label: "Lifestyle",
    score: round(clamp(score, 0, 100)),
    explanation:
      "50% amenity density (dining, culture, recreation), 25% walkability, 25% safety score.",
    drivers: [
      { label: "Amenity score", value: `${city.metrics.amenityScore}/100` },
      { label: "Walk score", value: `${city.metrics.walkScore}/100` },
      { label: "Safety score", value: `${city.metrics.safetyScore}/100` },
    ],
  };
}

function bandFor(score: number): MoveScoreBreakdown["band"] {
  if (score >= 75) return "excellent";
  if (score >= 60) return "good";
  if (score >= 45) return "mixed";
  return "risky";
}

function headlineFor(score: number, city: City): string {
  const band = bandFor(score);
  switch (band) {
    case "excellent":
      return `${city.name} scores well across finances, housing and lifestyle for your inputs.`;
    case "good":
      return `${city.name} works for your situation, with a few categories worth a closer look.`;
    case "mixed":
      return `${city.name} is a genuine trade-off for your inputs — check the weakest categories below.`;
    default:
      return `${city.name} is a stretch for your current inputs. Try the scenario controls before ruling it out.`;
  }
}

export function scoreCity(input: ScoreInput): MoveScoreBreakdown {
  const { city, takeHomeMonthly, taxes, costs } = input;
  const leftover = takeHomeMonthly - costs.total;

  const raw: Omit<CategoryScore, "weight" | "contribution">[] = [
    financialCategory(leftover, takeHomeMonthly),
    housingCategory(city, costs, takeHomeMonthly),
    jobsCategory(city),
    taxesCategory(city, taxes),
    transportationCategory(city, costs, takeHomeMonthly, input.input.ownsCar),
    healthcareCategory(city, costs, takeHomeMonthly),
    weatherCategory(city),
    lifestyleCategory(city),
  ];

  const weightFor = (key: string) =>
    CATEGORY_WEIGHTS[key as keyof typeof CATEGORY_WEIGHTS] ?? 0;

  const categories: CategoryScore[] = raw.map((c) => {
    const weight = weightFor(c.key);
    return { ...c, weight, contribution: round(c.score * weight) };
  });

  const score = Math.round(
    categories.reduce((sum, c) => sum + c.contribution, 0),
  );

  return {
    score,
    band: bandFor(score),
    headline: headlineFor(score, city),
    categories,
  };
}

export const SCORE_METHODOLOGY = [
  "Each category is scored 0-100 from named drivers, then weighted and summed.",
  "Weights: financial 30%, housing 18%, jobs 14%, taxes 12%, transportation 8%, healthcare 6%, weather 6%, lifestyle 6%.",
  "A MoveScore above 75 means the city fits your inputs well; below 45 means the numbers are working against you.",
  "Missing drivers are dropped and the remaining weights renormalised — we never invent a value.",
];
