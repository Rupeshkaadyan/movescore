import type { BudgetRow, City } from "@/lib/types";
import { money, signedMoney, signedPercent } from "@/lib/format";
import { sourcesForGroup } from "@/lib/data/sources";
import { cn } from "@/lib/cn";

/**
 * Monthly budget comparison. Positive delta = destination costs more.
 * For take-home pay, higher is better, so the colour logic is inverted.
 */
export function BudgetTable({
  rows,
  origin,
  destination,
}: {
  rows: BudgetRow[];
  origin: City;
  destination: City;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          Monthly budget comparison between {origin.name} and {destination.name}
        </caption>
        <thead>
          <tr className="border-b border-line text-left">
            <th scope="col" className="py-3 pr-4 font-semibold text-ink">
              Category
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-semibold text-ink">
              {origin.name}
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-semibold text-ink">
              {destination.name}
            </th>
            <th scope="col" className="py-3 text-right font-semibold text-ink">
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const higherIsBetter = row.key === "takeHome";
            const good = higherIsBetter ? row.delta > 0 : row.delta < 0;
            const neutral = Math.abs(row.delta) < 1;
            return (
              <tr key={row.key} className="border-b border-line/70 align-top">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                  {row.label}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {row.note}
                  </span>
                  <SourceHint group={row.group} />
                </th>
                <td className="py-3 pr-4 text-right tabular-nums text-slate-700">
                  {money(row.current)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-slate-700">
                  {money(row.destination)}
                </td>
                <td
                  className={cn(
                    "py-3 text-right tabular-nums font-semibold",
                    neutral
                      ? "text-muted"
                      : good
                        ? "text-emerald-600"
                        : "text-red-600",
                  )}
                >
                  {signedMoney(row.delta)}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {signedPercent(row.percentDelta, 1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SourceHint({ group }: { group: BudgetRow["group"] }) {
  const sources = sourcesForGroup(group);
  const primary = sources[0];
  if (!primary) return null;
  return (
    <a
      href={primary.url}
      target="_blank"
      rel="noreferrer noopener"
      className="mt-1 inline-block text-xs font-medium text-brand hover:underline"
    >
      Source: {primary.publisher} ↗
    </a>
  );
}
