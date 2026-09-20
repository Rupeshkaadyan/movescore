/**
 * Print a full comparison without starting the web server.
 *
 *   npm run sample                                # New York -> Austin, defaults
 *   npm run sample -- seattle-wa miami-fl 150000  # custom pair and salary
 *
 * Useful for sanity-checking the engine, for debugging a data change, and as a
 * worked example of what the result page renders.
 */
import { CITY_BY_SLUG } from "@/lib/data/cities";
import { computeComparison } from "@/lib/calc/compare";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";
import { money, signedMoney } from "@/lib/format";

const [fromSlug = "new-york-ny", toSlug = "austin-tx", salaryArg] = process.argv.slice(2);

const origin = CITY_BY_SLUG[fromSlug];
const destination = CITY_BY_SLUG[toSlug];

if (!origin || !destination) {
  console.error(`Unknown city. Available: ${Object.keys(CITY_BY_SLUG).join(", ")}`);
  process.exit(1);
}

const input = {
  ...DEFAULT_INPUT,
  salary: salaryArg ? Number(salaryArg) : DEFAULT_INPUT.salary,
};

const result = computeComparison(origin, destination, input, DEFAULT_OPTIONS);
const pad = (label: string) => label.padEnd(22);

console.log("\nMoveScore — demo run (data status: demo)\n");
console.log(`${origin.name}, ${origin.stateCode} -> ${destination.name}, ${destination.stateCode}`);
console.log(
  `Salary ${money(input.salary)} | ${input.householdSize} person household | ${
    input.ownsCar ? "car" : "no car"
  } | ${input.housingMode === "rent" ? "renting" : "buying"}\n`,
);

console.log(`${money(Math.abs(result.monthlySavings))}/month ${
  result.monthlySavings >= 0 ? "kept by moving" : "extra cost of moving"
}`);
console.log(`MoveScore ${result.moveScore.score}/100 (${result.moveScore.band})`);
console.log(`${origin.name} scores ${result.originScore.score}/100 on the same model\n`);

console.log("Monthly comparison");
console.log("-".repeat(64));
for (const row of result.budget) {
  console.log(
    `${pad(row.label)}${money(row.current).padStart(11)}${money(row.destination).padStart(12)}${signedMoney(row.delta).padStart(12)}  ${signedPercent(row.percentDelta)}`,
  );
}
console.log("-".repeat(64));
console.log(`${pad("Total cost")}${money(result.monthlyCost.origin).padStart(11)}${money(result.monthlyCost.destination).padStart(12)}`);
console.log(`${pad("Leftover")}${money(result.leftover.origin).padStart(11)}${money(result.leftover.destination).padStart(12)}\n`);

console.log("Category scores");
for (const category of result.moveScore.categories) {
  const bar = "#".repeat(Math.round(category.score / 4));
  console.log(
    `${pad(category.label)}${String(Math.round(category.score)).padStart(3)}  ${bar.padEnd(25)} ${Math.round(category.weight * 100)}% weight`,
  );
}

console.log("\nProjections");
for (const projection of result.projections) {
  console.log(
    `${pad(projection.horizonLabel)}move ${money(projection.moveCumulative).padStart(12)} | stay ${money(
      projection.stayCumulative,
    ).padStart(12)} | net ${signedMoney(projection.netBenefit)}`,
  );
}

console.log(
  `\nMove cost ${money(result.moveCost.mid)} (${result.moveCost.distanceMiles.toLocaleString("en-US")} miles)` +
    (result.moveCost.monthsToBreakEven
      ? ` — pays back in ${result.moveCost.monthsToBreakEven} months`
      : " — does not pay back on cost alone"),
);

console.log("\nTakeaways");
for (const takeaway of result.takeaways) console.log(`- ${takeaway}`);
console.log();

function signedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
