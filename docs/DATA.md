# Data model, provenance and the Phase 4 ingestion plan

## The rule

> Every number the UI shows must be traceable to a source, and every source
> carries a publisher, a URL, an update cadence and a methodology note.

That rule is enforced in code by three things:

1. `src/lib/data/sources.ts` — the source registry (`SourceRef`) plus
   `METRIC_SOURCE_GROUP`, which maps each metric group to a source id.
2. `DATA_STATUS` — a single `"demo" | "live"` switch. When it is `"demo"`, the
   site renders the amber banner, the footer disclaimer and inline notes.
3. `supabase/schema.sql` — every quantitative table has `source_id`,
   `source_date`, `last_updated` and `methodology_note` columns.

## Current dataset (demo)

- **30 cities** — the largest U.S. cities by population, chosen so the engine is
  excellent on a small surface before scaling.
- **30 neighbourhoods groups** — 6 cities × 5 neighbourhoods.
- **6 guides** — editorial, no invented statistics.
- **13 sources** — Census ACS, HUD FMR, Zillow, BLS CPI, BLS OES, BLS LAUS,
  Tax Foundation, NOAA, EPA, FBI UCR, NCES/GreatSchools, CMS, Walk Score.

Demo values are internally consistent (rents sit around each city's median,
commutes within its range, wage indices ordered sensibly) but they are **not**
verified statistics. Moving to live data does not change any component — it only
changes the values behind `CITY_BY_SLUG`.

## Provenance map

| Metric group     | Source                                   |
| ---------------- | ---------------------------------------- |
| Demographics     | Census ACS 5-year                        |
| Housing          | HUD Fair Market Rents (+ Zillow)         |
| Cost of living   | BLS CPI metro indices (+ Zillow)         |
| Jobs             | BLS OES (+ BLS LAUS)                     |
| Taxes            | Tax Foundation                           |
| Transportation   | Walk Score / Transit Score               |
| Weather          | NOAA Climate Normals (+ EPA AQI)         |
| Healthcare       | CMS Hospital Compare                     |
| Education        | NCES + GreatSchools                      |
| Safety           | FBI UCR                                  |
| Lifestyle        | Census ACS + Walk Score                   |

## Phase 4 ingestion plan

1. **Ingest** — scheduled jobs write raw payloads to a `raw_*` schema with the
   fetch timestamp and the publisher's `last_updated`.
2. **Normalise** — one transform per metric group into the tables in
   `supabase/schema.sql`. Each row carries `source_id`, `source_date`,
   `methodology_note`.
3. **Validate** — range checks (rent > 0, rate between 0 and 20), cross-source
   checks (city rent within ±60% of metro FMR), and a year-over-year outlier
   check. Failures land in an admin review queue rather than shipping silently.
4. **Flip** — once a metric group passes validation for all 30 cities, that
   group's `DATA_STATUS` flips to live and the demo banner narrows to the groups
   still on demo data.

## Expansion policy

New cities are added only when **every** metric group has live data for them.
A city with half a profile is worse than no city, because comparisons silently
become unequal. Neighbourhood pages follow the same rule at the neighbourhood
level — which is why only 6 cities have them today.
