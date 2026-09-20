import type { City, HouseholdInput } from "@/lib/types";

/**
 * Monthly cost-of-living model.
 *
 * National baselines are per-adult monthly figures; each is scaled by the
 * city's category index (100 = U.S. average) taken from `CityMetrics`.
 * Housing uses the city's own median rent or median home price rather than an
 * index, because those are already local values.
 */

export const COL_BASELINES = {
  utilitiesPerAdult: 180,
  groceriesPerAdult: 400,
  groceriesPerChild: 260,
  healthcarePerAdult: 480,
  healthcarePerChild: 220,
  miscPerAdult: 520,
  miscPerChild: 260,
  carOwnershipPerCar: 560,
  carFreeBuffer: 60,
  /** Homeownership carrying costs, annual rates. */
  mortgageRate: 0.068,
  downPaymentShare: 0.2,
  homeInsuranceRate: 0.005,
  maintenanceRate: 0.01,
  loanTermYears: 30,
};

export const COL_ASSUMPTIONS = [
  "National baselines: utilities $180, groceries $400, healthcare $480, misc $520 per adult per month.",
  "Children are costed at roughly 60% of an adult for groceries, healthcare and misc.",
  "Housing uses the city's own median rent or median home price, not an index.",
  "Homeownership assumes 20% down, a 30-year fixed loan at 6.8%, plus property tax, insurance and 1% annual maintenance.",
  "Car ownership is costed at $560 per vehicle per month (payment, insurance, fuel, maintenance, parking).",
  "No car: the city's monthly transit fare per adult plus a $60 buffer for ride-hail and occasional rentals.",
];

export type HousingCost = {
  monthly: number;
  label: string;
  detail: string;
};

export function bedroomsFor(householdSize: number): number {
  return Math.max(1, Math.min(4, householdSize - 1));
}

export function housingCost(
  city: City,
  input: HouseholdInput,
): HousingCost {
  const bedrooms = bedroomsFor(input.householdSize);
  if (input.housingMode === "rent") {
    const base =
      bedrooms <= 1
        ? city.metrics.medianRent1br
        : bedrooms === 2
          ? city.metrics.medianRent2br
          : city.metrics.medianRent3br;
    // Beyond a 3-bed, add 12% of the 3-bed median per extra bedroom.
    const extra = Math.max(0, bedrooms - 3) * 0.12 * city.metrics.medianRent3br;
    const monthly = base + extra;
    return {
      monthly,
      label: "Rent",
      detail: `Median ${bedrooms}-bedroom rent in ${city.name}`,
    };
  }

  const price =
    city.metrics.medianHomePrice *
    (bedrooms <= 1 ? 0.82 : bedrooms === 2 ? 1 : 1.22 + Math.max(0, bedrooms - 3) * 0.14);
  const down = price * COL_BASELINES.downPaymentShare;
  const principal = price - down;
  const r = COL_BASELINES.mortgageRate / 12;
  const n = COL_BASELINES.loanTermYears * 12;
  const mortgage =
    r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  const propertyTax = (price * (city.metrics.propertyTaxRate / 100)) / 12;
  const insurance = (price * COL_BASELINES.homeInsuranceRate) / 12;
  const maintenance = (price * COL_BASELINES.maintenanceRate) / 12;

  return {
    monthly: mortgage + propertyTax + insurance + maintenance,
    label: "Housing (own)",
    detail: `Mortgage on a ${price > city.metrics.medianHomePrice ? "larger" : "median"} ${city.name} home plus ${city.metrics.propertyTaxRate.toFixed(2)}% property tax`,
  };
}

export type MonthlyCostBreakdown = {
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  healthcare: number;
  misc: number;
  total: number;
  housingDetail: HousingCost;
  cars: number;
};

export function monthlyCosts(
  city: City,
  input: HouseholdInput,
): MonthlyCostBreakdown {
  const adults = Math.max(1, input.householdSize - input.children);
  const children = Math.max(0, input.children);
  const scale = (index: number) => index / 100;

  const housing = housingCost(city, input);

  const utilities =
    COL_BASELINES.utilitiesPerAdult *
    (1 + 0.25 * (input.householdSize - 1)) *
    scale(city.metrics.utilitiesIndex);

  const groceries =
    (COL_BASELINES.groceriesPerAdult * adults +
      COL_BASELINES.groceriesPerChild * children) *
    scale(city.metrics.groceriesIndex);

  const cars = input.ownsCar ? Math.min(2, Math.max(1, adults)) : 0;
  const transportation = input.ownsCar
    ? cars * COL_BASELINES.carOwnershipPerCar * scale(city.metrics.transportationIndex)
    : (city.metrics.transitFareMonthly * adults + COL_BASELINES.carFreeBuffer) *
      scale(city.metrics.transportationIndex);

  const healthcare =
    (COL_BASELINES.healthcarePerAdult * adults +
      COL_BASELINES.healthcarePerChild * children) *
    scale(city.metrics.healthcareIndex);

  const misc =
    (COL_BASELINES.miscPerAdult * adults + COL_BASELINES.miscPerChild * children) *
    scale(city.metrics.miscIndex);

  return {
    housing: housing.monthly,
    utilities,
    groceries,
    transportation,
    healthcare,
    misc,
    total:
      housing.monthly + utilities + groceries + transportation + healthcare + misc,
    housingDetail: housing,
    cars,
  };
}
