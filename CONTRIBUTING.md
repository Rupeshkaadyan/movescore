# Contributing

## Before you start

```bash
npm install
cp .env.example .env.local   # optional; every value is optional
npm run dev
```

## The gate

All four must pass before a PR is merged. CI runs the same four.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Rules that will get a PR rejected

**1. No invented data.** Every number that appears to a user must trace to a
source. If a figure is unavailable, the UI says it is unavailable. Do not fill a
gap with a plausible number — that is the one failure mode that destroys trust in
a relocation tool.

**2. No new dependencies without a reason.** The chart components are
hand-rolled SVG on purpose. Adding a charting library costs more bundle than it
saves effort.

**3. No secrets in code.** See `docs/SECURITY.md`. If you add an env var, add it
to `.env.example` with an empty value and document it in the README table.

**4. Calculations live in `src/lib/calc`, not in components.** The engine is
pure functions so it can be tested. If you find yourself doing arithmetic in JSX,
move it.

**5. Never send sensitive input to analytics.** `src/lib/analytics.ts` has a
`BLOCKED_KEYS` denylist. If you add an input that is personal (salary, household
size, children, debt, free text), add the key there in the same commit.

**6. SEO metadata goes through `buildMetadata()`.** No hand-written `<meta>`
tags. If you add a route, decide explicitly whether it should be indexed.

**7. Do not publish thin pages.** A new URL pattern only goes in
`src/app/sitemap.ts` if there is substantial unique content behind it. The
cross-product of the dataset is not content.

## Adding a city

1. Add the record to `src/lib/data/cities.ts` with **sourced** metrics.
2. Add provenance: source, source URL, source date, methodology note.
3. Only add neighborhoods if you have real neighborhood data.
4. Only add a comparison to `POPULAR_COMPARISONS` if people actually compare
   those two cities.

## Tests

`src/lib/calc/engine.test.ts` and `src/lib/query.test.ts`. If you change the
engine, add a test that would have caught your bug. If you change URL parsing,
add a case to the query tests.

## Commit messages

One logical change per commit, and say why:

```
feat: add neighborhood comparison table
fix: correct FICA wage base for 2025
docs: document the sitemap exclusion rules
chore: bump next to 15.5.25
```

Not `update`, `fix`, `final`, `wip`.
