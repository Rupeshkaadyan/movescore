"use client";

import { useState } from "react";
import type { ComparisonResult } from "@/lib/types";
import { cn } from "@/lib/cn";
import {
  CostOfLivingPanel,
  EducationPanel,
  HealthcarePanel,
  HousingPanel,
  JobsPanel,
  LifestylePanel,
  OverviewPanel,
  SafetyPanel,
  TaxesPanel,
  WeatherPanel,
} from "@/components/results/panels";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "cost", label: "Cost of Living" },
  { key: "housing", label: "Housing" },
  { key: "taxes", label: "Taxes" },
  { key: "jobs", label: "Jobs" },
  { key: "weather", label: "Weather" },
  { key: "healthcare", label: "Healthcare" },
  { key: "safety", label: "Safety" },
  { key: "education", label: "Education" },
  { key: "lifestyle", label: "Lifestyle" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ResultsTabs({ result }: { result: ComparisonResult }) {
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <section aria-label="Detailed breakdown">
      <div
        role="tablist"
        aria-label="Comparison categories"
        className="no-print -mx-1 flex gap-1 overflow-x-auto px-1 pb-2"
      >
        {TABS.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  const index = TABS.findIndex((t) => t.key === active);
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % TABS.length
                      : (index - 1 + TABS.length) % TABS.length;
                  setActive(TABS[next].key);
                  document.getElementById(`tab-${TABS[next].key}`)?.focus();
                }
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "bg-ink text-white"
                  : "bg-surface text-slate-700 hover:bg-slate-100",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
        className="mt-4"
      >
        {active === "overview" ? <OverviewPanel result={result} /> : null}
        {active === "cost" ? <CostOfLivingPanel result={result} /> : null}
        {active === "housing" ? <HousingPanel result={result} /> : null}
        {active === "taxes" ? <TaxesPanel result={result} /> : null}
        {active === "jobs" ? <JobsPanel result={result} /> : null}
        {active === "weather" ? <WeatherPanel result={result} /> : null}
        {active === "healthcare" ? <HealthcarePanel result={result} /> : null}
        {active === "safety" ? <SafetyPanel result={result} /> : null}
        {active === "education" ? <EducationPanel result={result} /> : null}
        {active === "lifestyle" ? <LifestylePanel result={result} /> : null}
      </div>
    </section>
  );
}
