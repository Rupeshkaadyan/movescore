import type { HouseholdInput } from "@/lib/types";
import type { CompareOptions } from "@/lib/calc/compare";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";

export type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function num(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Parse shareable comparison URLs: /compare/a-vs-b?salary=120000&household=3 */
export function parseHouseholdInput(params: RawParams): HouseholdInput {
  const rawSalary = first(params.salary);
  const salary = rawSalary ? num(rawSalary, DEFAULT_INPUT.salary, 10_000, 5_000_000) : DEFAULT_INPUT.salary;
  const householdSize = num(
    first(params.household),
    DEFAULT_INPUT.householdSize,
    1,
    10,
  );
  const childrenRaw = num(first(params.children) ?? "", 0, 0, 8);
  const children = Math.min(childrenRaw, Math.max(0, householdSize - 1));
  const car = first(params.car);
  const housing = first(params.housing);
  const filing = first(params.filing);

  return {
    salary,
    householdSize,
    children,
    ownsCar: car ? car === "yes" || car === "1" || car === "true" : DEFAULT_INPUT.ownsCar,
    housingMode: housing === "own" || housing === "buy" ? "own" : "rent",
    filingStatus: filing === "married" ? "married" : "single",
    occupation: first(params.occupation),
  };
}

export function parseCompareOptions(params: RawParams): CompareOptions {
  const adjust = first(params.adjust);
  return {
    marketAdjustSalary: adjust ? adjust === "1" || adjust === "yes" : DEFAULT_OPTIONS.marketAdjustSalary,
  };
}

export function buildQueryString(
  input: HouseholdInput,
  options: CompareOptions,
): string {
  const params = new URLSearchParams({
    salary: String(Math.round(input.salary)),
    household: String(input.householdSize),
    children: String(input.children),
    car: input.ownsCar ? "yes" : "no",
    housing: input.housingMode,
    filing: input.filingStatus,
    adjust: options.marketAdjustSalary ? "1" : "0",
  });
  if (input.occupation) params.set("occupation", input.occupation);
  return params.toString();
}

export function compareHref(
  from: string,
  to: string,
  input?: HouseholdInput,
  options?: CompareOptions,
): string {
  const base = `/compare/${from}-vs-${to}`;
  if (!input) return base;
  return `${base}?${buildQueryString(input, options ?? DEFAULT_OPTIONS)}`;
}
