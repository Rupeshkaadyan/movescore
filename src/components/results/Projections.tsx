import type { City, ProjectionYear } from "@/lib/types";
import { money, signedMoney } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { AssumptionNote } from "@/components/results/panels";
import { PROJECTION_ASSUMPTIONS } from "@/lib/calc/notes";
import { cn } from "@/lib/cn";

export function Projections({
  projections,
  origin,
  destination,
}: {
  projections: ProjectionYear[];
  origin: City;
  destination: City;
}) {
  const max = Math.max(
    ...projections.map((p) => Math.max(Math.abs(p.stayCumulative), Math.abs(p.moveCumulative))),
    1,
  );

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-ink">Cumulative money kept</h2>
      <p className="mt-1 text-sm text-muted">
        Total left over after all modelled costs, comparing staying in {origin.name}{" "}
        with moving to {destination.name}.
      </p>

      <div className="mt-6 space-y-6">
        {projections.map((projection) => (
          <div key={projection.year}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{projection.horizonLabel}</h3>
              <p className="text-sm">
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    projection.netBenefit >= 0 ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {signedMoney(projection.netBenefit)}
                </span>{" "}
                <span className="text-muted">
                  {projection.netBenefit >= 0 ? "better off moving" : "better off staying"}
                </span>
              </p>
            </div>
            <div className="mt-3 space-y-2">
              <BarRow
                label={`Stay in ${origin.name}`}
                value={projection.stayCumulative}
                max={max}
                tone="slate"
              />
              <BarRow
                label={`Move to ${destination.name}`}
                value={projection.moveCumulative}
                max={max}
                tone="brand"
              />
            </div>
          </div>
        ))}
      </div>

      <AssumptionNote items={PROJECTION_ASSUMPTIONS} />
    </Card>
  );
}

function BarRow({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "slate" | "brand";
}) {
  const width = Math.max(2, (Math.abs(value) / max) * 100);
  return (
    // Fixed-width label + value columns cannot shrink below their min-content
    // width, which pushed the page into horizontal scroll at 320px. Narrow them
    // on small screens and let the bar take the remaining space.
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-24 shrink-0 text-xs text-muted sm:w-40 lg:w-52">{label}</span>
      <div className="h-6 min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-100">
        <div
          className={cn(
            "h-full rounded-lg",
            tone === "brand" ? "bg-brand" : "bg-slate-400",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-ink sm:w-24">
        {money(value)}
      </span>
    </div>
  );
}
