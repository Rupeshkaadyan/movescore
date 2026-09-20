import type {
  BudgetRow,
  City,
  ComparisonResult,
  HouseholdInput,
  ProjectionYear,
} from "@/lib/types";
import { computeTaxes, marketAdjustedSalary } from "@/lib/calc/tax";
import { monthlyCosts } from "@/lib/calc/costOfLiving";
import { scoreCity } from "@/lib/calc/moveScore";
import { estimateMoveCost, withBreakEven } from "@/lib/calc/moveCost";
import { money, percent } from "@/lib/format";
import { DEFAULT_INPUT, DEFAULT_OPTIONS as DEFAULT_OPTS } from "@/lib/defaults";

export type { HouseholdInput } from "@/lib/types";
export { DEFAULT_INPUT };
const DEFAULT_OPTIONS: CompareOptions = DEFAULT_OPTS;

const SALARY_GROWTH = 0.03;
const NON_HOUSING_INFLATION = 0.025;

export type CompareOptions = {
  /** Scale the salary by the metro wage index when moving. */
  marketAdjustSalary: boolean;
};


function budgetRow(
  key: string,
  label: string,
  current: number,
  destination: number,
  note: string,
): BudgetRow {
  const delta = destination - current;
  const percentDelta = current !== 0 ? (delta / current) * 100 : 0;
  const group =
    key === "takeHome"
      ? "jobs"
      : key === "housing"
        ? "housing"
        : key === "utilities" || key === "groceries" || key === "misc"
          ? "cost-of-living"
          : key === "transportation"
            ? "transportation"
            : "healthcare";
  return {
    key,
    label,
    current,
    destination,
    delta,
    percentDelta,
    note,
    group: group as BudgetRow["group"],
  };
}

function buildProjections(
  origin: City,
  destination: City,
  input: HouseholdInput,
  originMonthly: { takeHome: number; housing: number; other: number },
  destMonthly: { takeHome: number; housing: number; other: number },
): ProjectionYear[] {
  const housingGrowthOrigin =
    (input.housingMode === "own" ? origin.metrics.homeGrowthYoY : origin.metrics.rentGrowthYoY) /
    100;
  const housingGrowthDest =
    (input.housingMode === "own"
      ? destination.metrics.homeGrowthYoY
      : destination.metrics.rentGrowthYoY) / 100;

  const years: (1 | 3 | 5)[] = [1, 3, 5];
  return years.map((year) => {
    let stay = 0;
    let move = 0;
    for (let y = 0; y < year; y += 1) {
      const salaryFactor = Math.pow(1 + SALARY_GROWTH, y);
      const otherFactor = Math.pow(1 + NON_HOUSING_INFLATION, y);
      const stayHousing = Math.pow(1 + housingGrowthOrigin, y);
      const moveHousing = Math.pow(1 + housingGrowthDest, y);

      stay +=
        12 *
        (originMonthly.takeHome * salaryFactor -
          originMonthly.housing * stayHousing -
          originMonthly.other * otherFactor);
      move +=
        12 *
        (destMonthly.takeHome * salaryFactor -
          destMonthly.housing * moveHousing -
          destMonthly.other * otherFactor);
    }
    return {
      year,
      horizonLabel: year === 1 ? "1 year" : `${year} years`,
      stayCumulative: Math.round(stay),
      moveCumulative: Math.round(move),
      netBenefit: Math.round(move - stay),
      note:
        "Assumes 3% annual salary growth, 2.5% inflation on non-housing costs, and each city's own housing growth rate.",
    };
  });
}

function buildTakeaways(
  origin: City,
  destination: City,
  input: HouseholdInput,
  rows: BudgetRow[],
  monthlySavings: number,
  breakEven: number | null,
): string[] {
  const takeaways: string[] = [];
  const biggest = [...rows]
    .filter((r) => r.key !== "takeHome")
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const takeHomeRow = rows.find((r) => r.key === "takeHome");

  if (takeHomeRow) {
    takeaways.push(
      takeHomeRow.delta >= 0
        ? `Take-home pay is ${money(Math.abs(takeHomeRow.delta))} higher per month in ${destination.name}, a ${percent(Math.abs(takeHomeRow.percentDelta), 1)} change.`
        : `Take-home pay is ${money(Math.abs(takeHomeRow.delta))} lower per month in ${destination.name}, mostly because of the tax and wage index difference.`,
    );
  }

  if (biggest) {
    const direction = biggest.delta < 0 ? "lower" : "higher";
    takeaways.push(
      `Your biggest single change is ${biggest.label.toLowerCase()}: ${money(Math.abs(biggest.delta))}/mo ${direction} in ${destination.name} (${percent(Math.abs(biggest.percentDelta), 1)}).`,
    );
  }

  takeaways.push(
    monthlySavings >= 0
      ? `Net of everything modelled, you keep about ${money(monthlySavings)} more per month in ${destination.name}.`
      : `Net of everything modelled, ${destination.name} costs you about ${money(Math.abs(monthlySavings))} more per month than staying in ${origin.name}.`,
  );

  if (!destination.metrics.hasStateIncomeTax && origin.metrics.hasStateIncomeTax) {
    takeaways.push(
      `${destination.state} has no state income tax, which is worth roughly ${money(
        (input.salary * origin.metrics.stateIncomeTaxRate) / 100 / 12,
      )} a month at your salary before any property or sales tax offset.`,
    );
  } else if (destination.metrics.hasStateIncomeTax && !origin.metrics.hasStateIncomeTax) {
    takeaways.push(
      `${destination.state} adds a ${percent(destination.metrics.stateIncomeTaxRate, 2)} effective state income tax that ${origin.state} does not charge.`,
    );
  }

  if (breakEven !== null) {
    takeaways.push(
      `At that monthly difference, the move pays for itself in about ${breakEven} month${breakEven === 1 ? "" : "s"}.`,
    );
  }

  const weatherDelta = destination.metrics.climateScore - origin.metrics.climateScore;
  if (Math.abs(weatherDelta) >= 10) {
    takeaways.push(
      weatherDelta > 0
        ? `${destination.name} scores ${weatherDelta} points higher on climate, with ${destination.metrics.sunnyDays} sunny days a year against ${origin.metrics.sunnyDays}.`
        : `${destination.name} scores ${Math.abs(weatherDelta)} points lower on climate and sees ${destination.metrics.sunnyDays} sunny days a year against ${origin.metrics.sunnyDays}.`,
    );
  }

  return takeaways.slice(0, 6);
}

export function computeComparison(
  origin: City,
  destination: City,
  input: HouseholdInput,
  options: CompareOptions = DEFAULT_OPTIONS,
): ComparisonResult {
  const originGross = input.salary;
  const destinationGross = options.marketAdjustSalary
    ? marketAdjustedSalary(input.salary, origin, destination)
    : input.salary;

  const originTaxes = computeTaxes(originGross, origin, input.filingStatus);
  const destTaxes = computeTaxes(destinationGross, destination, input.filingStatus);

  const originTakeHomeMonthly = (originGross - originTaxes.total) / 12;
  const destTakeHomeMonthly = (destinationGross - destTaxes.total) / 12;

  const originCosts = monthlyCosts(origin, input);
  const destCosts = monthlyCosts(destination, input);

  const rows: BudgetRow[] = [
    budgetRow(
      "takeHome",
      "Take-home pay",
      originTakeHomeMonthly,
      destTakeHomeMonthly,
      "After federal, state, local and FICA taxes",
    ),
    budgetRow(
      "housing",
      input.housingMode === "rent" ? "Rent" : "Housing (own)",
      originCosts.housing,
      destCosts.housing,
      originCosts.housingDetail.detail,
    ),
    budgetRow("utilities", "Utilities", originCosts.utilities, destCosts.utilities, "Electricity, gas, water, internet"),
    budgetRow("groceries", "Groceries", originCosts.groceries, destCosts.groceries, "Food at home, scaled by household size"),
    budgetRow(
      "transportation",
      "Transportation",
      originCosts.transportation,
      destCosts.transportation,
      input.ownsCar ? `Car ownership (${destCosts.cars} vehicle${destCosts.cars === 1 ? "" : "s"})` : "Transit passes and occasional rides",
    ),
    budgetRow("healthcare", "Healthcare", originCosts.healthcare, destCosts.healthcare, "Premiums and out-of-pocket estimate"),
    budgetRow("misc", "Miscellaneous", originCosts.misc, destCosts.misc, "Dining, subscriptions, clothing, personal"),
  ];

  const originLeftover = originTakeHomeMonthly - originCosts.total;
  const destLeftover = destTakeHomeMonthly - destCosts.total;
  const monthlySavings = destLeftover - originLeftover;

  const moveScore = scoreCity({
    city: destination,
    input,
    takeHomeMonthly: destTakeHomeMonthly,
    taxes: destTaxes,
    costs: destCosts,
  });
  const originScore = scoreCity({
    city: origin,
    input,
    takeHomeMonthly: originTakeHomeMonthly,
    taxes: originTaxes,
    costs: originCosts,
  });

  const projections = buildProjections(
    origin,
    destination,
    input,
    {
      takeHome: originTakeHomeMonthly,
      housing: originCosts.housing,
      other: originCosts.total - originCosts.housing,
    },
    {
      takeHome: destTakeHomeMonthly,
      housing: destCosts.housing,
      other: destCosts.total - destCosts.housing,
    },
  );

  const moveCost = withBreakEven(
    estimateMoveCost(origin, destination, input, destCosts.housing),
    monthlySavings,
  );

  const takeaways = buildTakeaways(
    origin,
    destination,
    input,
    rows,
    monthlySavings,
    moveCost.monthsToBreakEven,
  );

  return {
    origin,
    destination,
    input,
    takeHome: { origin: originTakeHomeMonthly, destination: destTakeHomeMonthly },
    taxes: { origin: originTaxes, destination: destTaxes },
    budget: rows,
    monthlyCost: { origin: originCosts.total, destination: destCosts.total },
    leftover: { origin: originLeftover, destination: destLeftover },
    monthlySavings,
    moveScore,
    originScore,
    salaryScenario: {
      originGross,
      destinationGross,
      marketAdjusted: options.marketAdjustSalary,
    },
    projections,
    moveCost,
    takeaways,
    dataStatus: "demo",
  };
}
