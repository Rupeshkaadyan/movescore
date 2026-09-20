# Architecture

## Runtime shape

MoveScore is a **Next.js 15 App Router application with no backend of its own**.
Every calculation runs as a pure function at render time; there is no API layer,
no server action, and no database call in the request path today.

```
Browser
  └── Next.js server component (rendered per request or prerendered)
        ├── lib/data/*        ← typed dataset (demo today, Postgres later)
        └── lib/calc/*        ← pure calculation engine
              └── ComparisonResult → components/results/*
```

That is deliberate: the product is a calculator, so the math must be
reproducible from a URL. A comparison is fully described by
`/compare/<from>-vs-<to>?<inputs>`, which is why scenario changes rewrite the URL
instead of mutating local state.

## Layers

| Layer | Location | Rule |
| ----- | -------- | ---- |
| Data | `src/lib/data/` | Plain typed constants. No business logic. Every metric group maps to a `SourceRef`. |
| Engine | `src/lib/calc/` | Pure functions only. No React, no I/O, no `Date.now()`. Fully unit-testable. |
| Query/URL | `src/lib/query.ts` | The only place scenario inputs are serialised or parsed. |
| Presentation | `src/components/` | Receives computed values. Never recomputes. |
| Routing | `src/app/` | Thin: parse params → call engine → render. |

## The engine

`computeComparison(origin, destination, input, options)` is the single entry
point. It composes:

1. `tax.ts` — federal brackets, FICA, effective state/local rates, market
   adjustment by metro wage index.
2. `costOfLiving.ts` — national baselines × city indices; rent vs own.
3. `moveScore.ts` — eight weighted categories, each exposing drivers.
4. `moveCost.ts` — distance × weight factor, plus upfront costs.
5. `compare.ts` — orchestrates, builds budget rows, takeaways, 1/3/5-year
   projections and the break-even figure.

Everything returns `ComparisonResult` (`src/lib/types.ts`), which is plain JSON —
serialisable, snapshot-testable, and reusable by a future API route without
change.

## Server vs client boundaries

Client components are only used where interactivity is required:

- `Header` (mobile menu)
- `HeroSearch` (city selection)
- `ResultsTabs` (tab state)
- `ScenarioControls` (rewrites the URL)
- `ShareBar` (clipboard, print)
- `SearchExperience`, `MoveCostCalculator`
- `ViewBeacon` (analytics)

Everything else renders on the server. The dataset is never shipped to the
client except where a client component genuinely needs city lists.

## Data → UI contract

`src/lib/data/sources.ts` holds:

- `SOURCES` — id, publisher, URL, update cadence, methodology.
- `METRIC_SOURCE_GROUP` — metric group → source id.
- `DATA_STATUS` — `"demo"` today.

Components read provenance through `sourcesForGroup()` and render it with
`<DataProvenance />`, so source, updated date and methodology travel with the
number rather than living in a separate docs page nobody reads.

## Future backend

When Supabase is connected (`supabase/migrations/0001_init.sql`), the change is
confined to the data layer: a repository reads rows instead of constants, and
`DATA_STATUS` flips per metric group. No component or calculation changes.

## Deployment architecture

```
GitHub (main)
   └── Vercel
         ├── Build: next build
         ├── Static: prerendered city / comparison / guide / salary pages
         ├── On-demand: any scenario URL (query params)
         └── Env: NEXT_PUBLIC_SITE_URL, analytics endpoint, (later) Supabase
```

No serverless functions are required for the current feature set.
