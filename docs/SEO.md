# SEO

## Canonical domain

Every canonical URL, Open Graph URL and sitemap entry is derived from one
constant:

```ts
// src/lib/seo.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movescore.app";
```

`NEXT_PUBLIC_SITE_URL` must be set in Vercel for Production **and** Preview.
If it is missing in production, canonicals silently point at the `.app`
fallback and the site competes with itself. Treat this as a launch blocker.

## Metadata helper

All pages use `buildMetadata({ title, description, path, noIndex })` from
`src/lib/seo.ts`. It produces, in one call:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">` (absolute, from `SITE_URL`)
- Open Graph: type, site name, title, description, url, image
- Twitter: `summary_large_image`, title, description, image
- `robots: noindex, follow` when `noIndex: true`

Never hand-write `<meta>` tags in a page. Add a field to the helper instead.

## Structured data

| Type            | Where                                              |
| --------------- | -------------------------------------------------- |
| `BreadcrumbList`| City, compare, cost-of-living and guide pages      |
| `Dataset`       | `/methodology`                                     |

Rendered as JSON-LD in a `<script type="application/ld+json">` block. Values
come from `breadcrumbSchema()` and `datasetSchema()` — no hand-written JSON.

## robots.txt

`src/app/robots.ts` → `/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Sitemap: <SITE_URL>/sitemap.xml
```

## sitemap.xml

`src/app/sitemap.ts` → `/sitemap.xml`.

Included:

- 15 static pages (home, hubs, legal, methodology, about, contact)
- 30 `/cities/<slug>` + 30 `/cost-of-living/<slug>`
- `/cities/<slug>/neighborhoods` for cities that actually have neighborhood data
- curated `/compare/<a>-vs-<b>` pairs only
- 30 `/salary/<slug>`
- every `/guides/<slug>` with a real `updated` date

Deliberately **excluded**:

| Excluded                            | Why                                                        |
| ----------------------------------- | ---------------------------------------------------------- |
| `/search`                           | Internal search; `noindex`                                 |
| `/account`, `/admin`                | Private; also `Disallow` in robots.txt                     |
| `/salary/<amount>/<city>`           | 180 near-duplicate thin pages; `noindex, follow`           |
| Every possible city pair            | Thousands of thin pages with no unique content             |

The rule: a URL is only published when there is substantial unique content
behind it. Generating pages from the cross-product of the dataset is how
relocation sites get deindexed.

## URL structure

```
/cities/austin-tx
/cities/austin-tx/neighborhoods
/cost-of-living/austin-tx
/salary/austin-tx
/compare/new-york-ny-vs-austin-tx
/guides/<slug>
```

Lowercase, hyphenated, state code suffixed, no query strings on canonical
pages. Scenario state (salary, household) lives in the query string only on
non-canonical views.

## Google Search Console

1. Add property — **Domain** type (`movescore.com`), which covers all
   subdomains and both protocols.
2. Verify with the DNS TXT record Google gives you, added at the registrar or
   at Vercel → Domains → DNS.
3. Submit `https://<domain>/sitemap.xml`.
4. Use URL Inspection on `/` and one `/cities/<slug>` and request indexing.

Domain verification requires a DNS change — that is an owner action, not
something the codebase can do for you.

## Pre-launch checks

```bash
curl -sI https://<domain>/robots.txt | head -1     # 200
curl -s  https://<domain>/sitemap.xml | head -5    # <urlset
curl -s  https://<domain>/ | grep canonical        # absolute, correct host
curl -sI https://www.<domain>/ | grep -i location  # 308 → apex, once
```

Check for exactly **one** redirect hop on `www` → apex. A chain of two or more
usually means both Vercel and the registrar are redirecting.
