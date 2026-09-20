"use client";

import { useMemo, useState } from "react";
import { CITIES } from "@/lib/data/cities";
import { estimateMoveCost } from "@/lib/calc/moveCost";
import { monthlyCosts } from "@/lib/calc/costOfLiving";
import { DEFAULT_INPUT } from "@/lib/defaults";
import type { HouseholdInput } from "@/lib/types";
import { money } from "@/lib/format";
import { Card } from "@/components/ui/primitives";

export function MoveCostCalculator() {
  const [from, setFrom] = useState("new-york-ny");
  const [to, setTo] = useState("austin-tx");
  const [input, setInput] = useState<HouseholdInput>(DEFAULT_INPUT);

  const result = useMemo(() => {
    const origin = CITIES.find((c) => c.slug === from);
    const destination = CITIES.find((c) => c.slug === to);
    if (!origin || !destination || from === to) return null;
    const costs = monthlyCosts(destination, input);
    return {
      origin,
      destination,
      estimate: estimateMoveCost(origin, destination, input, costs.housing),
    };
  }, [from, to, input]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label-text mb-1.5 block">Moving from</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="select-input">
              {CITIES.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}, {city.stateCode}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-text mb-1.5 block">Moving to</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="select-input">
              {CITIES.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}, {city.stateCode}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-text mb-1.5 block">Household size</span>
            <select
              value={input.householdSize}
              onChange={(e) => {
                const householdSize = Number(e.target.value);
                setInput((prev) => ({
                  ...prev,
                  householdSize,
                  children: Math.min(prev.children, Math.max(0, householdSize - 1)),
                }));
              }}
              className="select-input"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-text mb-1.5 block">Car</span>
            <select
              value={input.ownsCar ? "yes" : "no"}
              onChange={(e) => setInput((prev) => ({ ...prev, ownsCar: e.target.value === "yes" }))}
              className="select-input"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Household size sets the shipment weight, which is how long-distance
          movers actually price a job.
        </p>
      </Card>

      <Card className="p-6">
        {!result ? (
          <p className="text-sm text-muted">Pick two different cities.</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {result.origin.name} → {result.destination.name} ·{" "}
              {result.estimate.distanceMiles.toLocaleString("en-US")} miles
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
              {money(result.estimate.mid)}
            </p>
            <p className="mt-1 text-sm text-muted">
              Range {money(result.estimate.low)} – {money(result.estimate.high)}
            </p>
            <ul className="mt-6 space-y-2.5">
              {result.estimate.lineItems.map((item) => (
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
            <p className="mt-5 text-xs leading-relaxed text-muted">
              {result.estimate.methodology}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
