# Launch checklist

Legend: **[auto]** verified by code/CI in this repo · **[owner]** requires your
account, payment, DNS or 2FA · **[post]** must be re-run against the live URL.

## Code and build

- [x] **[auto]** `npm run typecheck` passes
- [x] **[auto]** `npm test` passes (51 tests)
- [x] **[auto]** `npm run build` succeeds
- [x] **[auto]** No API routes and no server actions exist
- [x] **[auto]** No `dangerouslySetInnerHTML` outside JSON-LD blocks
- [x] **[auto]** Security headers set (`next.config.ts`)
- [x] **[auto]** No tracked `.env` file; `.env.example` has empty values only
- [x] **[auto]** Git history scanned for key-shaped strings — clean
- [x] **[auto]** `npm run lint` — 0 errors, 0 warnings
- [x] **[auto]** Tests cover the query parser and the calculation engine (51)

## GitHub

- [x] **[auto]** Single commit with a meaningful message on `main`
- [x] **[auto]** `.gitignore` covers `.env*`, `.next`, `.vercel`, `*.pem`
- [x] **[auto]** CI workflow with `permissions: contents: read`
- [ ] **[owner]** Create the `movescore` repository and push `main`
- [ ] **[owner]** Enable branch protection on `main` (require CI, 1 review)
- [ ] **[owner]** Enable Dependabot alerts + security updates

## Vercel

- [ ] **[owner]** Import the GitHub repo into Vercel
- [ ] **[owner]** Production branch = `main`
- [ ] **[owner]** Set `NEXT_PUBLIC_SITE_URL` for **Production** and **Preview**
- [ ] **[post]** Build log shows no warnings about missing env vars
- [ ] **[post]** Deployment is `Ready`, not `Error`

## Supabase

- [x] **[auto]** `supabase/migrations/0001_init.sql` — versioned schema
- [x] **[auto]** RLS statements present in the migration
- [ ] **[owner]** Create the project, run the migration, verify RLS
- [ ] **[owner]** Set `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` in Vercel
- [ ] **[owner]** Set `SUPABASE_SERVICE_ROLE_KEY` **without** a `NEXT_PUBLIC_` prefix

Not required for launch: the app runs on its bundled dataset with no database
connection. Supabase becomes load-bearing only when accounts ship.

## Domain

- [ ] **[owner]** Purchase/connect the domain
- [ ] **[owner]** Add apex + `www` to Vercel; set the apex as canonical
- [ ] **[owner]** Redirect `www` → apex, exactly one hop
- [ ] **[post]** `https://<domain>/` returns 200
- [ ] **[post]** `https://www.<domain>/` 308s to the apex, once
- [ ] **[post]** SSL valid on both hosts
- [ ] **[post]** Favicon renders

## SEO

- [x] **[auto]** `buildMetadata()` on every page — title, description, canonical, OG, Twitter
- [x] **[auto]** `/robots.txt` disallows `/admin` and `/account`
- [x] **[auto]** `/sitemap.xml` excludes search, account, admin and the 180
      thin salary-preset pages
- [x] **[auto]** `/search`, `/account`, `/admin`, `/salary/<amount>/<city>` are `noindex`
- [x] **[auto]** `BreadcrumbList` on city/compare pages, `Dataset` on methodology
- [ ] **[post]** `/robots.txt` 200 and `/sitemap.xml` valid
- [ ] **[post]** Canonical on `/` resolves to the real domain, not the fallback
- [ ] **[owner]** Search Console: add **Domain** property, add the DNS TXT
      record Google issues, submit the sitemap

## Analytics and monitoring

- [x] **[auto]** Event architecture with a `BLOCKED_KEYS` denylist
      (salary, income, household, children, debt, query, email, name)
- [x] **[auto]** No vendor script loads until `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is set
- [x] **[auto]** Friendly `error.tsx` and `not-found.tsx`; no stack traces
- [ ] **[owner]** Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` (optional)
- [ ] **[owner]** Set `NEXT_PUBLIC_SENTRY_DSN` (optional)

## Content and trust

- [x] **[auto]** `/privacy`, `/terms`, `/about`, `/contact`, `/methodology`
- [x] **[auto]** Source + updated date + methodology shown on data cards
- [x] **[auto]** Dataset clearly labelled as a **30-city demo dataset**
- [x] **[auto]** No "100% accurate" / "best city" / "guaranteed savings" claims
- [ ] **[owner]** Replace demo data with sourced data before marketing the site
- [ ] **[owner]** Set up `hello@` / `support@` mail once the domain exists

## QA

- [x] **[auto]** Smoke test: homepage → pick cities → salary → household →
      compare → change scenario → reload → 404 → invalid params → no JS errors
      (`npm run qa:smoke`, 11/11)
- [x] **[auto]** Mobile widths 320 / 375 / 390 / 430 / 768 / 1024 / 1440 across
      9 pages — no horizontal scroll, no console errors (`npm run qa:responsive`,
      63/63)
- [x] **[auto]** 404 page renders on an unknown city
- [ ] **[post]** Re-run both scripts against the live URL after deploy
- [ ] **[post]** Safari, Firefox, Edge — Chromium verified here; the other
      engines are not installed in this environment

### Fixed during QA

- **320px horizontal scroll on `/compare/*`** — the projections panel used fixed
  `w-40` + `w-24` columns whose min-content width (330px) exceeded a 280px grid
  parent. Narrowed responsively.
- **Production server 500 on every route** — conflicting dynamic segment names
  (`/salary/[amount]/[slug]` vs `/salary/[slug]`). `next build` did not catch it.
