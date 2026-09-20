import { describe, expect, it } from "vitest";
import { CITIES } from "@/lib/data/cities";
import { computeTaxes, federalIncomeTax, ficaTax, marketAdjustedSalary } from "@/lib/calc/tax";
import { monthlyCosts } from "@/lib/calc/costOfLiving";
import { scoreCity, CATEGORY_WEIGHTS } from "@/lib/calc/moveScore";
import { computeComparison } from "@/lib/calc/compare";
import { distanceMiles, estimateMoveCost } from "@/lib/calc/moveCost";
import { DEFAULT_INPUT } from "@/lib/defaults";
import type { City, HouseholdInput } from "@/lib/types";

const ny = CITIES.find((c) => c.slug === "new-york-ny")!;
const austin = CITIES.find((c) => c.slug === "austin-tx")!;
const sf = CITIES.find((c) => c.slug === "san-francisco-ca")!;

const single: HouseholdInput = { ...DEFAULT_INPUT };
const family: HouseholdInput = {
  salary: 150_000,
  householdSize: 4,
  children: 2,
  ownsCar: true,
  housingMode: "own",
  filingStatus: "married",
};

describe("federal income tax", () => {
  it("matches the 2025 single brackets on a $100k salary", () => {
    // Taxable = 100,000 - 15,000 standard deduction = 85,000
    // 10% of 11,925 + 12% of 36,550 + 22% of 36,525
    expect(federalIncomeTax(100_000, "single")).toBeCloseTo(13_614, 0);
  });

  it("charges nothing below the standard deduction", () => {
    expect(federalIncomeTax(15_000, "single")).toBe(0);
    expect(federalIncomeTax(10_000, "single")).toBe(0);
  });

  it("halves the burden for married filers at low incomes", () => {
    expect(federalIncomeTax(60_000, "married")).toBeLessThan(
      federalIncomeTax(60_000, "single"),
    );
  });

  it("is monotonic in income", () => {
    let previous = -1;
    for (let salary = 20_000; salary <= 400_000; salary += 20_000) {
      const tax = federalIncomeTax(salary, "single");
      expect(tax).toBeGreaterThan(previous);
      previous = tax;
    }
  });
});

describe("FICA", () => {
  it("applies 7.65% under the Social Security wage base", () => {
    expect(ficaTax(100_000, "single")).toBeCloseTo(7_650, 0);
  });

  it("caps Social Security at the wage base", () => {
    const atCap = ficaTax(176_100, "single");
    const overCap = ficaTax(300_000, "single");
    // Above the base only Medicare (1.45%) plus the additional 0.9% applies.
    expect(overCap - atCap).toBeCloseTo((300_000 - 176_100) * 0.0145 + (300_000 - 200_000) * 0.009, 0);
  });
});

describe("state and local tax", () => {
  it("charges nothing in no-income-tax states", () => {
    const taxes = computeTaxes(100_000, austin, "single");
    expect(taxes.state).toBe(0);
    expect(taxes.local).toBe(0);
  });

  it("stacks state and city tax in New York", () => {
    const taxes = computeTaxes(100_000, ny, "single");
    expect(taxes.state).toBeCloseTo(6_400, 0);
    expect(taxes.local).toBeCloseTo(3_080, 0);
    expect(taxes.total).toBeCloseTo(13_614 + 7_650 + 6_400 + 3_080, 0);
    expect(taxes.effectiveRate).toBeCloseTo(30.74, 1);
  });

  it("gives Austin a lower total burden than New York at the same salary", () => {
    expect(computeTaxes(100_000, austin, "single").total).toBeLessThan(
      computeTaxes(100_000, ny, "single").total,
    );
  });
});

describe("market salary adjustment", () => {
  it("scales by the metro wage index ratio", () => {
    // New York 118 -> Austin 106
    const adjusted = marketAdjustedSalary(100_000, ny, austin);
    expect(adjusted / 100_000).toBeCloseTo(106 / 118, 5);
    expect(adjusted).toBeGreaterThan(89_000);
    expect(adjusted).toBeLessThan(90_000);
  });

  it("is identity when both cities share a wage index", () => {
    expect(marketAdjustedSalary(100_000, austin, austin)).toBeCloseTo(100_000, 0);
  });
});

describe("cost of living", () => {
  it("uses the city's own median rent for a single renter", () => {
    const costs = monthlyCosts(austin, single);
    expect(costs.housing).toBe(austin.metrics.medianRent1br);
  });

  it("grows housing with household size", () => {
    const one = monthlyCosts(austin, { ...single, householdSize: 1 });
    const three = monthlyCosts(austin, { ...single, householdSize: 3 });
    expect(three.housing).toBeGreaterThan(one.housing);
  });

  it("removes car costs when the household has no car", () => {
    const withCar = monthlyCosts(austin, { ...single, ownsCar: true });
    const noCar = monthlyCosts(austin, { ...single, ownsCar: false });
    expect(noCar.transportation).toBeLessThan(withCar.transportation);
    expect(noCar.cars).toBe(0);
  });

  it("costs more to buy than to rent in most cities at these prices", () => {
    const renting = monthlyCosts(austin, { ...single, housingMode: "rent" });
    const owning = monthlyCosts(austin, { ...single, housingMode: "own" });
    expect(owning.housing).toBeGreaterThan(renting.housing);
  });

  it("scales food and healthcare with children", () => {
    const solo = monthlyCosts(austin, single);
    const withKids = monthlyCosts(austin, { ...single, householdSize: 3, children: 2 });
    expect(withKids.groceries).toBeGreaterThan(solo.groceries);
    expect(withKids.healthcare).toBeGreaterThan(solo.healthcare);
  });

  it("keeps every city's total positive and housing-dominant", () => {
    for (const city of CITIES) {
      const costs = monthlyCosts(city, single);
      expect(costs.total).toBeGreaterThan(0);
      expect(costs.housing).toBeGreaterThan(costs.utilities);
    }
  });
});

describe("MoveScore", () => {
  const build = (city: City, input: HouseholdInput) => {
    const salary = input.salary;
    const taxes = computeTaxes(salary, city, input.filingStatus);
    const takeHome = (salary - taxes.total) / 12;
    const costs = monthlyCosts(city, input);
    return scoreCity({ city, input, takeHomeMonthly: takeHome, taxes, costs });
  };

  it("publishes weights that sum to 1", () => {
    const total = Object.values(CATEGORY_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it("returns eight categories with drivers and explanations", () => {
    const score = build(austin, single);
    expect(score.categories).toHaveLength(8);
    for (const category of score.categories) {
      expect(category.explanation.length).toBeGreaterThan(20);
      expect(category.drivers.length).toBeGreaterThan(1);
      expect(category.score).toBeGreaterThanOrEqual(0);
      expect(category.score).toBeLessThanOrEqual(100);
    }
  });

  it("scores the MoveScore as the weighted sum of its categories", () => {
    const score = build(austin, single);
    const sum = score.categories.reduce((acc, c) => acc + c.score * c.weight, 0);
    expect(score.score).toBe(Math.round(sum));
  });

  it("stays within 0-100 for every city and household", () => {
    for (const city of CITIES) {
      for (const input of [single, family]) {
        const score = build(city, input);
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("rewards a higher salary in the same city", () => {
    const low = build(austin, { ...single, salary: 50_000 });
    const high = build(austin, { ...single, salary: 200_000 });
    expect(high.score).toBeGreaterThan(low.score);
  });
});

describe("comparison", () => {
  const result = computeComparison(ny, austin, single, { marketAdjustSalary: true });

  it("produces seven budget rows including take-home and housing", () => {
    expect(result.budget).toHaveLength(7);
    expect(result.budget.map((r) => r.key)).toContain("takeHome");
    expect(result.budget.map((r) => r.key)).toContain("housing");
  });

  it("keeps leftover consistent with take-home minus costs", () => {
    expect(result.leftover.origin).toBeCloseTo(
      result.takeHome.origin - result.monthlyCost.origin,
      5,
    );
    expect(result.leftover.destination).toBeCloseTo(
      result.takeHome.destination - result.monthlyCost.destination,
      5,
    );
  });

  it("computes monthly savings as the leftover difference", () => {
    expect(result.monthlySavings).toBeCloseTo(
      result.leftover.destination - result.leftover.origin,
      5,
    );
  });

  it("saves money moving from New York to Austin on the demo data", () => {
    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.budget.find((r) => r.key === "housing")!.delta).toBeLessThan(0);
  });

  it("does not market-adjust when asked not to", () => {
    const flat = computeComparison(ny, austin, single, { marketAdjustSalary: false });
    expect(flat.salaryScenario.destinationGross).toBe(single.salary);
    expect(flat.salaryScenario.marketAdjusted).toBe(false);
    // Holding the nominal salary at $100k means Austin keeps the full amount,
    // and no state income tax beats a $89.8k Austin-market salary.
    const expected = (single.salary - computeTaxes(single.salary, austin, "single").total) / 12;
    expect(flat.takeHome.destination).toBeCloseTo(expected, 5);
    expect(flat.takeHome.destination).toBeGreaterThan(result.takeHome.destination);
  });

  it("shows the housing trade-off in the takeaways", () => {
    expect(result.takeaways.length).toBeGreaterThan(2);
    expect(result.takeaways.join(" ")).toMatch(/Austin/);
  });

  it("projects one year as twelve months of the monthly difference", () => {
    const oneYear = result.projections.find((p) => p.year === 1)!;
    expect(oneYear.netBenefit).toBeCloseTo(result.monthlySavings * 12, -1);
  });

  it("grows the cumulative benefit from 1 to 5 years when moving saves money", () => {
    const [one, , five] = result.projections;
    expect(five.netBenefit).toBeGreaterThan(one.netBenefit);
  });

  it("measures a real distance and a positive move cost", () => {
    expect(result.moveCost.distanceMiles).toBeGreaterThan(1_400);
    expect(result.moveCost.distanceMiles).toBeLessThan(1_700);
    expect(result.moveCost.mid).toBeGreaterThan(0);
    expect(result.moveCost.low).toBeLessThan(result.moveCost.high);
  });

  it("reports how long the move takes to pay back", () => {
    expect(result.moveCost.monthsToBreakEven).toBeGreaterThan(0);
    expect(result.moveCost.monthsToBreakEven).toBe(
      Math.ceil(result.moveCost.mid / result.monthlySavings),
    );
  });

  it("handles a family buying a home without producing NaN", () => {
    const fam = computeComparison(sf, austin, family, { marketAdjustSalary: true });
    const numbers = [
      fam.monthlySavings,
      fam.moveScore.score,
      fam.monthlyCost.destination,
      fam.moveCost.mid,
      ...fam.projections.map((p) => p.netBenefit),
    ];
    for (const value of numbers) expect(Number.isFinite(value)).toBe(true);
  });

  it("works for every ordered pair in the dataset", () => {
    for (const from of CITIES) {
      for (const to of CITIES) {
        if (from.slug === to.slug) continue;
        const pair = computeComparison(from, to, single, { marketAdjustSalary: true });
        expect(Number.isFinite(pair.monthlySavings)).toBe(true);
        expect(pair.moveScore.score).toBeGreaterThanOrEqual(0);
        expect(pair.moveScore.score).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("moving cost", () => {
  it("measures great-circle distance symmetrically", () => {
    expect(distanceMiles(ny, austin)).toBe(distanceMiles(austin, ny));
  });

  it("is zero for a city against itself", () => {
    expect(distanceMiles(austin, austin)).toBe(0);
  });

  it("scales with household size", () => {
    const solo = estimateMoveCost(ny, austin, { ...single, householdSize: 1 }, 1700);
    const big = estimateMoveCost(ny, austin, { ...single, householdSize: 5 }, 1700);
    expect(big.mid).toBeGreaterThan(solo.mid);
  });
});
