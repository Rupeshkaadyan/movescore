"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { HouseholdInput } from "@/lib/types";
import { DEFAULT_INPUT, DEFAULT_OPTIONS } from "@/lib/defaults";
import { compareHref } from "@/lib/query";
import { track } from "@/lib/analytics";

type Option = { slug: string; label: string };

export function HeroSearch({
  cities,
  defaultFrom = "new-york-ny",
  defaultTo = "austin-tx",
  compact = false,
}: {
  cities: Option[];
  defaultFrom?: string;
  defaultTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [input, setInput] = useState<HouseholdInput>(DEFAULT_INPUT);

  const swapDisabled = !from || !to || from === to;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (from === to) return;
    // City pair only — never salary or household details.
    track("comparison_started", { from, to });
    router.push(compareHref(from, to, input, DEFAULT_OPTIONS));
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? "card p-5" : "card p-6 sm:p-8"}
      aria-label="Compare two cities"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current city">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="select-input"
            aria-label="Current city"
          >
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="New city">
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="select-input"
            aria-label="New city"
          >
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Annual salary">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              $
            </span>
            <input
              type="number"
              min={10000}
              max={5000000}
              step={1000}
              value={input.salary}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, salary: Number(e.target.value) }))
              }
              className="input-base pl-7"
              aria-label="Annual salary"
            />
          </div>
        </Field>

        <Field label="Household">
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
            aria-label="Household size"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Children">
          <select
            value={input.children}
            onChange={(e) => setInput((prev) => ({ ...prev, children: Number(e.target.value) }))}
            className="select-input"
            aria-label="Children in household"
          >
            {Array.from({ length: Math.max(1, input.householdSize) }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Car">
          <select
            value={input.ownsCar ? "yes" : "no"}
            onChange={(e) => setInput((prev) => ({ ...prev, ownsCar: e.target.value === "yes" }))}
            className="select-input"
            aria-label="Own a car"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>

        {!compact ? (
          <>
            <Field label="Housing">
              <select
                value={input.housingMode}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, housingMode: e.target.value === "own" ? "own" : "rent" }))
                }
                className="select-input"
                aria-label="Rent or own"
              >
                <option value="rent">Rent</option>
                <option value="own">Buy</option>
              </select>
            </Field>

            <Field label="Filing status">
              <select
                value={input.filingStatus}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    filingStatus: e.target.value === "married" ? "married" : "single",
                  }))
                }
                className="select-input"
                aria-label="Filing status"
              >
                <option value="single">Single</option>
                <option value="married">Married filing jointly</option>
              </select>
            </Field>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={swapDisabled}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          Get My MoveScore
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        {from === to ? (
          <p role="alert" className="text-sm text-danger">
            Pick two different cities to compare.
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-text mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
