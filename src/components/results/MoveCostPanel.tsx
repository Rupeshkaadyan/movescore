import type { MoveCostEstimate } from "@/lib/types";
import { money } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { AssumptionNote } from "@/components/results/panels";
import { MOVE_COST_ASSUMPTIONS } from "@/lib/calc/notes";

export function MoveCostPanel({
  estimate,
  monthlySavings,
}: {
  estimate: MoveCostEstimate;
  monthlySavings: number;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Estimated cost to move</h2>
          <p className="mt-1 text-sm text-muted">
            {estimate.distanceMiles.toLocaleString("en-US")} miles, priced on
            household size.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-ink">
            {money(estimate.mid)}
          </p>
          <p className="text-xs text-muted">
            range {money(estimate.low)} – {money(estimate.high)}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {estimate.lineItems.map((item) => (
          <li key={item.label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-slate-700">
              {item.label}
              <span className="block text-xs text-muted">{item.note}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">
              {money(item.amount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-line bg-surface p-4">
        {estimate.monthsToBreakEven !== null ? (
          <p className="text-sm text-slate-700">
            At {money(Math.abs(monthlySavings))}/month of modelled{" "}
            {monthlySavings >= 0 ? "savings" : "extra cost"}, the move pays for
            itself in about{" "}
            <strong className="font-semibold text-ink">
              {estimate.monthsToBreakEven} month
              {estimate.monthsToBreakEven === 1 ? "" : "s"}
            </strong>
            .
          </p>
        ) : (
          <p className="text-sm text-slate-700">
            This move does not pay for itself on cost alone at your current inputs —
            any reason to move here would be lifestyle or career, not savings.
          </p>
        )}
      </div>

      <AssumptionNote items={MOVE_COST_ASSUMPTIONS} />
    </Card>
  );
}
