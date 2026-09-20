import type { HouseholdInput } from "@/lib/types";

/** Default household inputs used by the homepage form and shareable URLs. */
export const DEFAULT_INPUT: HouseholdInput = {
  salary: 100_000,
  householdSize: 1,
  children: 0,
  ownsCar: true,
  housingMode: "rent",
  filingStatus: "single",
};

export const DEFAULT_OPTIONS = { marketAdjustSalary: true };

export const SALARY_PRESETS = [60_000, 80_000, 100_000, 120_000, 150_000, 200_000];
