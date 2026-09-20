# Decisions

Why the project is shaped the way it is. Each entry records the decision, the
reason and the trade-off accepted.

## Product

**D1 — 30 cities, not 10,000.**
Every city has the same full metric set, so comparisons are like-for-like. A
city with half a profile makes comparisons silently unequal, which is worse than
absence. Trade-off: long-tail SEO coverage arrives later.

**D2 — Personalized, not indexed.**
Output is computed from the user's salary, household, car and housing choice.
A single cost index would be simpler and much less useful.

**D3 — The score is transparent.**
MoveScore is a weighted average of eight categories with visible drivers,
weights and explanations. A black-box score would be easier to build and
impossible to trust.

**D4 — No "best city" ranking.**
Scores describe fit with a specific household. Absolute rankings would invite
exactly the false precision the product exists to avoid.

## Data

**D5 — Demo data is labelled, everywhere.**
`DATA_STATUS = "demo"` drives a site banner, a footer disclaimer, inline notes on
result pages and a badge on every data card. Placeholders are realistic but never
presented as verified.

**D6 — Provenance travels with the number.**
Source, updated date and methodology render next to the figure
(`<DataProvenance />`), not on a separate page.

**D7 — Missing data is never invented.**
If a metric is unavailable the page says so. Weights renormalise rather than
guessing a value.

**D8 — Migrations are the source of truth.**
`supabase/migrations/0001_init.sql`. The database is never edited by hand.

## Engineering

**D9 — The engine is pure functions.**
No React, no I/O, no clock. This is what makes 51 unit tests possible and makes
a future API route trivial.

**D10 — Scenario state lives in the URL.**
`/compare/a-vs-b?salary=...&household=...` reproduces any result exactly. It
makes sharing work, makes results bookmarkable, and keeps the server the source
of truth.

**D11 — No chart library.**
Bars, gauges and meters are hand-rolled SVG. Smaller bundles, full control of
accessibility semantics, no dependency to keep patched.

**D12 — Tailwind v4 with tokens from the brand pack.**
Colours come from `MoveScore_Color_Codes.txt` rather than being re-derived, so
the site stays consistent with the brand assets.

**D13 — No screenshots embedded.**
The asset pack's website/mobile images are composite mockups with baked-in
numbers. Re-implementing them as components keeps the UI responsive, accessible
and translatable.

## Security and trust

**D14 — Admin is closed by default.**
There is no auth layer, so `/admin` renders a locked notice unless
`ADMIN_ENABLED=true`. Shipping an open write surface would be indefensible.

**D15 — Sensitive inputs never leave the browser.**
`salary`, `household`, `children`, `debt`, `email` and search text are blocked
keys in the analytics layer. Analytics records that an action happened, never
the values.

**D16 — Legal pages describe what the product does not do.**
Terms state plainly that output is an estimate, not advice, and that no savings
are guaranteed.

## Deferred (with reasons)

- **Auth and saved comparisons** — planned with Supabase Auth; shipping a fake
  "save" would be worse than an honest "coming with accounts".
- **PDF generation** — print stylesheet today; real PDF delivery with accounts.
- **Real data ingestion** — the source list and validation plan exist
  (`docs/DATA.md`); ingesting unverified data would violate D7.
