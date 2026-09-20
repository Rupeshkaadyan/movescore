import type { City, FilingStatus, TaxBreakdown } from "@/lib/types";

/**
 * U.S. take-home pay model.
 *
 * Scope: federal income tax, state income tax, local income tax, and FICA.
 * Not modelled (yet): pre-tax 401(k) deferrals, itemised deductions, credits,
 * self-employment tax, and state-specific exemptions. Every figure the UI
 * shows links back to the assumptions below so a user can sanity-check them.
 */

/** 2025 federal ordinary-income brackets. Upper bound inclusive, rate applies to the slice. */
const FEDERAL_BRACKETS: Record<FilingStatus, { cap: number; rate: number }[]> = {
  single: [
    { cap: 11_925, rate: 0.1 },
    { cap: 48_475, rate: 0.12 },
    { cap: 103_350, rate: 0.22 },
    { cap: 197_300, rate: 0.24 },
    { cap: 250_525, rate: 0.32 },
    { cap: 626_350, rate: 0.35 },
    { cap: Infinity, rate: 0.37 },
  ],
  married: [
    { cap: 23_850, rate: 0.1 },
    { cap: 96_950, rate: 0.12 },
    { cap: 206_700, rate: 0.22 },
    { cap: 394_600, rate: 0.24 },
    { cap: 501_050, rate: 0.32 },
    { cap: 751_600, rate: 0.35 },
    { cap: Infinity, rate: 0.37 },
  ],
};

/** 2025 standard deduction. */
const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15_000,
  married: 30_000,
};

/** Social Security wage base (2025). */
const SS_WAGE_BASE = 176_100;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200_000,
  married: 250_000,
};

export const TAX_ASSUMPTIONS = [
  "2025 federal brackets and standard deduction; no itemised deductions or credits.",
  "State and local income tax use the effective rate published per city, not a marginal bracket calculation.",
  "FICA: 6.2% Social Security up to the wage base, 1.45% Medicare, plus 0.9% above the threshold.",
  "No pre-tax retirement deferrals, HSA contributions or self-employment tax are modelled.",
];

function progressiveTax(
  taxable: number,
  brackets: { cap: number; rate: number }[],
): number {
  let lower = 0;
  let tax = 0;
  for (const bracket of brackets) {
    if (taxable <= lower) break;
    const slice = Math.min(taxable, bracket.cap) - lower;
    tax += slice * bracket.rate;
    lower = bracket.cap;
  }
  return tax;
}

export function federalIncomeTax(gross: number, filing: FilingStatus): number {
  const taxable = Math.max(0, gross - STANDARD_DEDUCTION[filing]);
  return progressiveTax(taxable, FEDERAL_BRACKETS[filing]);
}

export function ficaTax(gross: number, filing: FilingStatus): number {
  const socialSecurity = Math.min(gross, SS_WAGE_BASE) * SS_RATE;
  const medicare = gross * MEDICARE_RATE;
  const additional =
    gross > ADDITIONAL_MEDICARE_THRESHOLD[filing]
      ? (gross - ADDITIONAL_MEDICARE_THRESHOLD[filing]) * ADDITIONAL_MEDICARE_RATE
      : 0;
  return socialSecurity + medicare + additional;
}

/**
 * Full take-home breakdown for a salary earned in a given city.
 */
export function computeTaxes(
  gross: number,
  city: City,
  filing: FilingStatus,
): TaxBreakdown {
  const federal = federalIncomeTax(gross, filing);
  const fica = ficaTax(gross, filing);
  const state = city.metrics.hasStateIncomeTax
    ? gross * (city.metrics.stateIncomeTaxRate / 100)
    : 0;
  const local = gross * (city.metrics.localIncomeTaxRate / 100);
  const total = federal + state + local + fica;

  const parts: string[] = [];
  parts.push(city.metrics.hasStateIncomeTax
    ? `State effective rate ${city.metrics.stateIncomeTaxRate.toFixed(2)}%`
    : "No state income tax");
  if (city.metrics.localIncomeTaxRate > 0) {
    parts.push(`local ${city.metrics.localIncomeTaxRate.toFixed(2)}%`);
  }

  return {
    federal,
    state,
    local,
    fica,
    total,
    effectiveRate: gross > 0 ? (total / gross) * 100 : 0,
    note: parts.join(", "),
  };
}

/**
 * Market-adjusted salary: the same role priced in another metro.
 * Uses the BLS-style metro wage ratio stored on each city.
 */
export function marketAdjustedSalary(
  gross: number,
  origin: City,
  destination: City,
): number {
  const ratio =
    destination.metrics.salaryIndex / Math.max(1, origin.metrics.salaryIndex);
  return gross * ratio;
}
