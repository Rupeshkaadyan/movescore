# Security

## Current attack surface

MoveScore in this build is a **static, read-only Next.js application**. That is
a security posture, not a limitation:

| Surface            | State                                                       |
| ------------------ | ----------------------------------------------------------- |
| API routes         | None. No `src/app/**/route.ts` exists.                      |
| Server actions     | None.                                                       |
| Database           | Not connected. Data is a typed module in `src/lib/data`.    |
| Auth               | Not shipped. `/account` and `/admin` are static placeholders.|
| User input         | URL params and client state only — no persistence.          |
| File uploads       | None.                                                       |

There is therefore no SQL injection surface (no DB), no stored XSS surface (no
user content is persisted), and no privilege-escalation surface (no accounts).

## Rendered HTML

React escapes interpolated values by default. The only
`dangerouslySetInnerHTML` uses in the codebase are JSON-LD structured-data
blocks (city pages and compare pages) — that is the App Router's documented
way to emit `<script type="application/ld+json">`.

Those blocks are built with `jsonLd()` from `src/lib/seo.ts`, which escapes `<`
as `\u003c` so a value containing `</script>` cannot terminate the element
early. **Never** swap `jsonLd()` back to a bare `JSON.stringify` there.

Any *new* use of `dangerouslySetInnerHTML` outside JSON-LD should be rejected
in review:

```bash
grep -rn "dangerouslySetInnerHTML" src/   # must only be ld+json blocks
```

## Secrets

Rules enforced in this repo:

1. `.env`, `.env.local`, `.env.*.local` are in `.gitignore` and were never
   committed. Confirmed by scanning history (see below).
2. Only `NEXT_PUBLIC_*` variables may reach the browser. Anything else is
   server-only and must never be prefixed.
3. `SUPABASE_SERVICE_ROLE_KEY` is listed in `.env.example` **only** as a
   commented placeholder with an empty value. It must be set in Vercel as a
   server-only variable and must never be given the `NEXT_PUBLIC_` prefix —
   that would ship a database admin credential to every visitor.
4. `.env.example` contains no real values. It is a template.

Scan before every push:

```bash
# 1. No env file is tracked
git ls-files | grep -E "^\.env" && echo "FAIL" || echo "OK"

# 2. No key-looking strings in source
grep -rInE "(sk_live|sk_test|ghp_|AIza[0-9A-Za-z_-]{20,}|eyJhbGci)" src/ public/ scripts/

# 3. No key-looking strings anywhere in history
git log -p --all -S "SUPABASE_SERVICE_ROLE_KEY=" -- . | grep -E "^\+.*=.{20,}" || echo "clean"
```

## Headers

`next.config.ts` sets:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN` — MoveScore has no reason to be framed
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — the app
  needs none of these, so all are denied
- `X-DNS-Prefetch-Control: on` and `X-Powered-By: MoveScore` (replaces the
  default Next.js banner)

A full CSP is deliberately **not** enabled yet: Tailwind v4 and the App Router
emit inline styles/scripts that a strict CSP would break. Add CSP as a
`Content-Security-Policy-Report-Only` header first, watch the reports, then
enforce.

## Admin

`src/app/admin/page.tsx` renders a **disabled** console. It performs no data
operations, exposes no credentials and is `noindex` + `Disallow`ed in
robots.txt. When real admin operations are added they must be gated on a
server-side session check — a hidden URL is not authorization — and every
destructive action needs a confirmation step.

## When Phase 5 (auth + Supabase) lands

Checklist before turning accounts on:

- [ ] RLS enabled on every table that holds user data
- [ ] `saved_comparisons` policy scoped to `auth.uid() = user_id`
- [ ] Anon key only in the browser; service-role key only in server code
- [ ] `/admin` gated by a server-side role check, not a client-side flag
- [ ] Rate limiting on auth endpoints
- [ ] `INGEST_CRON_SECRET` checked on `/api/ingest` before any write

## Reporting

Use `/contact` on the site, or open a security issue on the repository. Do not
file a public issue for an exploitable vulnerability.
