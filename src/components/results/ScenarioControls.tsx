"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import type { HouseholdInput } from "@/lib/types";
import type { CompareOptions } from "@/lib/calc/compare";
import { buildQueryString } from "@/lib/query";
import { DEFAULT_INPUT } from "@/lib/defaults";
import { track } from "@/lib/analytics";
import { Card } from "@/components/ui/primitives";

/**
 * Scenario engine. Every change rewrites the URL, so the server recomputes the
 * comparison and the URL stays shareable.
 */
export function ScenarioControls({
  basePath,
  input,
  options,
}: {
  basePath: string;
  input: HouseholdInput;
  options: CompareOptions;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<HouseholdInput>(input);
  const [adjust, setAdjust] = useState(options.marketAdjustSalary);

  function commit(next: HouseholdInput, nextAdjust: boolean) {
    setDraft(next);
    // Deliberately excludes salary and household size.
    track("scenario_created", {
      housing: next.housingMode,
      car: next.ownsCar ? "yes" : "no",
      marketAdjust: nextAdjust,
    });
    startTransition(() => {
      router.replace(`${basePath}?${buildQueryString(next, { marketAdjustSalary: nextAdjust })}`, {
        scroll: false,
      });
    });
  }

  const update = (patch: Partial<HouseholdInput>) => commit({ ...draft, ...patch }, adjust);

  return (
    <Card className={`p-6 no-print ${pending ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Change the scenario</h2>
        <button
          type="button"
          onClick={() => {
            setAdjust(DEFAULT_INPUT.housingMode === "rent");
            commit(DEFAULT_INPUT, true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="scenario-salary" className="label-text mb-1.5 block">
            Salary: ${draft.salary.toLocaleString("en-US")}
          </label>
          <input
            id="scenario-salary"
            type="range"
            min={40000}
            max={400000}
            step={5000}
            value={draft.salary}
            onChange={(event) => setDraft({ ...draft, salary: Number(event.target.value) })}
            onPointerUp={(event) =>
              update({ salary: Number((event.target as HTMLInputElement).value) })
            }
            onKeyUp={(event) =>
              update({ salary: Number((event.target as HTMLInputElement).value) })
            }
            className="w-full accent-[color:var(--color-brand)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>$40k</span>
            <span>$400k</span>
          </div>
        </div>

        <div>
          <label htmlFor="scenario-household" className="label-text mb-1.5 block">
            Household size
          </label>
          <select
            id="scenario-household"
            value={draft.householdSize}
            onChange={(event) => {
              const householdSize = Number(event.target.value);
              update({
                householdSize,
                children: Math.min(draft.children, Math.max(0, householdSize - 1)),
              });
            }}
            className="select-input"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scenario-children" className="label-text mb-1.5 block">
            Children
          </label>
          <select
            id="scenario-children"
            value={draft.children}
            onChange={(event) => update({ children: Number(event.target.value) })}
            className="select-input"
          >
            {Array.from({ length: Math.max(1, draft.householdSize) }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scenario-housing" className="label-text mb-1.5 block">
            Rent or buy
          </label>
          <select
            id="scenario-housing"
            value={draft.housingMode}
            onChange={(event) =>
              update({ housingMode: event.target.value === "own" ? "own" : "rent" })
            }
            className="select-input"
          >
            <option value="rent">Rent</option>
            <option value="own">Buy</option>
          </select>
        </div>

        <div>
          <label htmlFor="scenario-car" className="label-text mb-1.5 block">
            Car
          </label>
          <select
            id="scenario-car"
            value={draft.ownsCar ? "yes" : "no"}
            onChange={(event) => update({ ownsCar: event.target.value === "yes" })}
            className="select-input"
          >
            <option value="yes">Own a car</option>
            <option value="no">No car</option>
          </select>
        </div>

        <div>
          <label htmlFor="scenario-filing" className="label-text mb-1.5 block">
            Filing status
          </label>
          <select
            id="scenario-filing"
            value={draft.filingStatus}
            onChange={(event) =>
              update({ filingStatus: event.target.value === "married" ? "married" : "single" })
            }
            className="select-input"
          >
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
          </select>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
        <input
          type="checkbox"
          checked={adjust}
          onChange={(event) => {
            setAdjust(event.target.checked);
            commit(draft, event.target.checked);
          }}
          className="mt-0.5 h-4 w-4 accent-[color:var(--color-brand)]"
        />
        <span className="text-sm leading-relaxed text-slate-700">
          <strong className="font-semibold text-ink">Adjust salary to the local market.</strong>{" "}
          Scales your salary by the metro wage index. Turn this off to compare the
          same nominal salary in both cities.
        </span>
      </label>

      <p aria-live="polite" className="sr-only">
        {pending ? "Recalculating" : "Up to date"}
      </p>
    </Card>
  );
}
