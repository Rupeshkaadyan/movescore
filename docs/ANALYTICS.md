# Analytics

MoveScore does **not** ship a third-party analytics script. The app ships an
event *architecture* (`src/lib/analytics.ts`) and stays silent until you point
it at a collector. That keeps the MVP cookie-free and GDPR-sane, and means no
vendor code loads on a page the user has not consented to.

## Turning it on

```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://collector.example.com/e
```

Set it in the Vercel project settings for Production and Preview separately.
Leave it empty and `track()` returns immediately — no network call, no error.

Delivery uses `navigator.sendBeacon` with a `fetch(..., { keepalive: true })`
fallback. Failures are swallowed inside `try/catch`: analytics must never break
the product.

## Event payload

```json
{
  "event": "comparison_completed",
  "props": { "from": "austin-tx", "to": "denver-co" },
  "path": "/compare/austin-tx-vs-denver-co",
  "ts": 1758372000000
}
```

There is no user identifier, no session cookie and no fingerprint. Events are
anonymous page-level facts.

## Events

| Event                  | Where                                     | Props                       |
| ---------------------- | ----------------------------------------- | --------------------------- |
| `comparison_started`   | `HeroSearch` — user submits from → to     | `from`, `to`                |
| `comparison_completed` | Compare / city result render              | `from`, `to`                |
| `city_viewed`          | `ViewBeacon` on `/cities/[slug]`          | `slug`                      |
| `neighborhoods_viewed` | `ViewBeacon` on neighborhood sections     | `slug`                      |
| `calculator_used`      | Move-cost calculator, salary calculator   | `tool`                      |
| `scenario_created`     | `ScenarioControls` — salary/household edit| —                           |
| `report_generated`     | Report view builds                        | `from`, `to`                |
| `report_downloaded`    | Print / download action                   | `from`, `to`                |
| `comparison_saved`     | Save action (Phase 5)                     | `from`, `to`                |
| `search_used`          | Search experience                         | `resultCount`               |

## What is never sent

`src/lib/analytics.ts` holds a `BLOCKED_KEYS` denylist that is applied to every
call, plus a 64-character cap on string values:

```
salary, income, household, householdSize, children, debt, query, email, name
```

The denylist is enforced in `sanitize()`, not by convention. A caller that
passes `salary` anyway has it dropped before serialization. If you add a new
sensitive input, add the key here in the same commit.

## Adding an event

1. Add the literal to the `AnalyticsEvent` union.
2. Call `track("event_name", { ... })` from an event handler, or
   `useTrack("event_name", { ... }, [deps])` from a client component.
3. Do not wrap `track()` in a conditional — filtering belongs in `sanitize()`.

## Error monitoring

`NEXT_PUBLIC_SENTRY_DSN` is reserved for a Sentry-compatible DSN. The client
never renders a raw stack trace: `src/app/error.tsx` and `src/app/not-found.tsx`
show a friendly state with a retry action, and the digest is what gets logged.

Until a DSN is set, server-side errors surface in the Vercel runtime log
(Functions → Logs) and failed builds surface in the deployment log. That is
acceptable for launch; add Sentry when there is real traffic worth paging on.
