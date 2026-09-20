# MoveScore

**A smarter move for a brighter you.**

A personalized U.S. relocation decision engine. Enter where you live, where you
are thinking of moving, your salary and your household — MoveScore models
take-home pay, taxes, housing, cost of living, moving cost and 1/3/5-year
projections, then explains every number it produced.

This repository is **Phase 1 + Phase 2 complete**: a production-quality frontend
and a real, tested-feeling calculation engine running on a clearly-labelled
30-city demo dataset.

---

## Stack

| Layer    | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript (strict)        |
| Styling  | Tailwind CSS v4 with brand tokens from the asset pack          |
| Icons    | `lucide-react`                                                |
| Charts   | Hand-rolled SVG (no chart library — faster, fully accessible)  |
| Data     | Typed demo dataset in `src/lib/data` (Supabase in Phase 3)     |
| Auth     | Not yet — Supabase Auth in Phase 5                             |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional until Phase 3
npm run dev                    # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # vitest run (51 tests)
npm run sample      # print a worked comparison to stdout
```

## Environment variables

Copy `.env.example` to `.env.local`. **Every value is optional** — the app runs
on its bundled dataset with no configuration at all.

| Variable                          | Required        | Notes                                              |
| --------------------------------- | --------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | **In production** | Canonical host. Wrong value = wrong canonicals.  |
| `NEXT_PUBLIC_SUPABASE_URL`        | Phase 3+        |                                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Phase 3+        | Safe to expose — RLS is what protects data.        |
| `SUPABASE_SERVICE_ROLE_KEY`       | Phase 3+        | **Server-only. Never add a `NEXT_PUBLIC_` prefix.** |
| `CENSUS_API_KEY`, `BLS_API_KEY`, `HUD_API_KEY`, `NOAA_API_KEY`, `EPA_API_KEY` | Phase 4 | Ingestion only. |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT`  | Optional        | Empty = analytics disabled.                        |
| `NEXT_PUBLIC_SENTRY_DSN`          | Optional        | Empty = error monitoring disabled.                 |
| `INGEST_CRON_SECRET`              | Phase 4         | Guards `/api/ingest`.                              |

Nothing in `.env` is ever committed — `.gitignore` covers `.env*`, and
`.env.example` ships empty values only.

## Database setup

Supabase is **not required to run the site**. The schema exists and is
versioned; the app simply does not connect yet.

```bash
supabase db push        # apply supabase/migrations/0001_init.sql
```

The migration creates the city/state/zip/housing/salary/tax/source tables plus
`saved_comparisons`, with Row Level Security enabled. Every metric table carries
`value`, `source`, `source_url`, `source_date`, `last_updated` and
`methodology_note` — provenance is part of the schema, not an afterthought.
See `docs/DATA.md`.

---

## Project structure

```
src/
├── app/                      # routes (App Router)
│   ├── page.tsx              # homepage
│   ├── compare/[slug]/       # THE result page: /compare/new-york-ny-vs-austin-tx
│   ├── cities/[slug]/        # city profiles + neighborhoods
│   ├── cost-of-living/[slug] # SEO cost pages
│   ├── salary/[slug]/[amount] # take-home calculator pages (noindex variants)
│   ├── jobs|housing|neighborhoods|guides|search|methodology|move-cost
│   ├── account|admin         # Phase 5/7 placeholders (honest, not fake)
│   ├── sitemap.ts, robots.ts
│   └── error.tsx, not-found.tsx
├── components/
│   ├── ui/primitives.tsx     # Card, Button, Badge, ScoreBar, Breadcrumbs…
│   ├── site/                 # Header, Footer, DemoNotice
│   ├── home/                 # HeroSearch + homepage sections
│   ├── results/              # ScoreGauge, BudgetTable, tabs, panels, projections
│   └── search/, move-cost/
├── lib/
│   ├── calc/                 # THE ENGINE — pure functions, no UI
│   │   ├── tax.ts            # federal brackets, FICA, state/local, market adj.
│   │   ├── costOfLiving.ts   # monthly budget model
│   │   ├── moveScore.ts      # transparent 8-category weighted score
│   │   ├── moveCost.ts       # distance + weight moving estimate
│   │   └── compare.ts        # orchestrator → ComparisonResult
│   ├── data/                 # cities, neighborhoods, guides, sources
│   ├── analytics.ts           # event architecture + sensitive-field denylist
│   ├── seo.ts                 # buildMetadata, jsonLd, breadcrumb/dataset schema
│   └── types.ts, defaults.ts, query.ts, cities.ts, format.ts, cn.ts
└── public/brand/             # logos, app icon, favicon from the asset pack
supabase/migrations/0001_init.sql  # versioned schema, RLS enabled
docs/                         # architecture, data, deployment, SEO, security…
.github/workflows/ci.yml      # typecheck, lint, test, build on every push
```

---

## The calculation engine

Four independent, testable modules. No magic numbers buried in components.

**1. Take-home pay** (`lib/calc/tax.ts`)
2025 federal brackets and standard deduction, FICA with the Social Security wage
base, effective state and local income tax rates, and an optional market
adjustment that scales your salary by the metro wage index.

**2. Cost of living** (`lib/calc/costOfLiving.ts`)
National baselines per adult, scaled by each city's category index. Housing uses
the city's own median rent or home price. Homeownership models mortgage (20%
down, 30-year, 6.8%), property tax, insurance and maintenance.

**3. MoveScore** (`lib/calc/moveScore.ts`)
Eight categories — financial 30%, housing 18%, jobs 14%, taxes 12%,
transportation 8%, healthcare 6%, weather 6%, lifestyle 6%. Each category
exposes named drivers with raw values and a plain-English explanation. Missing
drivers renormalise; nothing is invented.

**4. Moving cost** (`lib/calc/moveCost.ts`)
Great-circle distance × household weight factor, plus deposit, first month,
utility setup and vehicle registration — with a months-to-break-even figure.

---

## Data status: this is demo data

Every number in this build is a **realistic placeholder**, not a verified
statistic. The app says so on every page (the amber banner, the footer note, and
inline on result pages). `DATA_STATUS` in `src/lib/data/sources.ts` is the single
switch that flips the whole site from demo to live.

Each metric group is mapped to a real upstream source with its publisher, URL,
update cadence and methodology note. See `/methodology` in the running app and
`src/lib/data/sources.ts` in code.

**Ruthless scope rule:** 30 cities, not 10,000. The engine is excellent on a
small surface, then expands.

---

## Routes worth looking at

| Route                                        | What it shows                              |
| -------------------------------------------- | ------------------------------------------ |
| `/`                                          | Hero form, popular comparisons, example result |
| `/compare/new-york-ny-vs-austin-tx`          | The full result dashboard                  |
| `/compare/new-york-ny-vs-austin-tx?salary=150000&household=3&children=1&car=no&housing=own` | Scenario URLs are shareable |
| `/cities/austin-tx`                          | City profile with FAQ schema               |
| `/cities/austin-tx/neighborhoods`            | Neighbourhood comparison table             |
| `/salary/austin-tx`                          | Take-home pay calculator                   |
| `/salary/austin-tx/120000`                   | Same, at a fixed salary (`noindex`)        |
| `/cost-of-living/austin-tx`                  | Monthly breakdown                          |
| `/move-cost`                                 | Moving cost calculator                     |
| `/methodology`                               | Scoring model, assumptions, sources        |

---

## Accessibility & performance notes

- Semantic HTML, labelled form controls, visible focus rings, `aria-*` on tabs,
  meters, breadcrumbs and live regions.
- Colour is never the only signal: every score carries a numeric value and a
  text band.
- Print stylesheet: any result page prints as a clean report (this is how
  "download as PDF" works today).
- Below-the-fold images are lazy, hero logo is prioritised, no client-side chart
  library, minimal client components.

---

## Roadmap

1. ✅ Frontend + demo data
2. ✅ Calculation engine
3. ⏳ Supabase/Postgres schema — `supabase/migrations/0001_init.sql` is written
4. ⏳ Real U.S. data ingestion (Census, BLS, HUD, NOAA, EPA, FBI, CMS)
5. ⏳ Auth, saved comparisons, PDF reports
6. ⏳ SEO expansion (only pages with real content)
7. ⏳ Admin dashboard, performance and accessibility polish

## Deployment architecture

```
git push origin main
      ↓
GitHub Actions (typecheck · lint · test · build)
      ↓
Vercel builds from main → production deployment
      ↓
Static/ISR pages served from the edge (no server runtime, no DB at request time)
```

Vercel is the default target. Set `NEXT_PUBLIC_SITE_URL` to your production
domain so canonical URLs, Open Graph tags and `sitemap.xml` resolve correctly.
Full walkthrough — including domain, DNS, Search Console and post-deploy
verification — is in `docs/DEPLOYMENT.md`.

```bash
vercel deploy --prod
```

**Production / preview / development are separate.** Preview deployments get
their own `NEXT_PUBLIC_SITE_URL` (the `*.vercel.app` host) so preview build
canonicals never point at the live domain.

## Known limitations

Stated plainly, because a relocation tool that overstates its data is worse
than no tool:

- **The dataset is a labelled 30-city demo dataset.** Realistic in magnitude,
  not verified statistics. `DATA_STATUS` in `src/lib/data/sources.ts` is the
  single switch from demo to live; every page renders a demo notice until it
  flips.
- **No accounts, no saved comparisons, no PDF export.** Printing a result page
  produces a clean report today.
- **Estimates, not quotes.** Tax output is an annual estimate from published
  brackets; it is not tax advice and ignores credits, deductions and filing
  subtleties.
- **30 metros only.** Anything outside the dataset returns "not found", not a
  guessed number.
- **Analytics and error monitoring are off** until you supply an endpoint.

MoveScore does not claim to be 100% accurate, does not name a "best city", and
does not guarantee savings.

## Documentation

| Doc                                                     | What it covers                          |
| ------------------------------------------------------- | --------------------------------------- |
| `docs/ARCHITECTURE.md`                                  | System shape, rendering strategy, boundaries |
| `docs/DATA.md`                                          | Data model, provenance rules, ingestion plan |
| `docs/DEPLOYMENT.md`                                    | Vercel, domain, DNS, env, smoke tests   |
| `docs/SEO.md`                                           | Metadata, sitemap, robots, Search Console |
| `docs/ANALYTICS.md`                                     | Event list, privacy rules, collector contract |
| `docs/SECURITY.md`                                      | Threat surface, secrets, headers, RLS   |
| `docs/LAUNCH-CHECKLIST.md`                              | What is done vs. what needs your account |
| `docs/DECISIONS.md`                                     | Why the stack and trade-offs were chosen |
| `docs/ASSETS.md`                                        | How the brand asset pack maps into the UI |

## License

MIT — see `LICENSE`.
