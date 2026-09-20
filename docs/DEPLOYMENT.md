# Deployment

Target: **GitHub → Vercel → production**, with Supabase added when the data
layer ships. This document is written so someone else can deploy it without
asking the original developer.

## 1. Repository (owner action — needs GitHub auth)

The local repository is initialised with a clean first commit on `main`. The
remote does not exist yet because no GitHub credential is available on this
machine (no `gh` CLI, no SSH key).

```bash
# Option A — GitHub CLI (recommended)
brew install gh
gh auth login            # browser OAuth
cd MoveScore
gh repo create movescore --public --source=. --remote=origin --push

# Option B — create the repo in GitHub UI, then:
git remote add origin git@github.com:<owner>/movescore.git
git push -u origin main
```

Branch model: `main` is production. Vercel deploys `main` to production and
every pull request to a preview URL.

## 2. Vercel (owner action — needs Vercel auth)

```bash
npm i -g vercel
vercel login
vercel link                 # link this directory to a Vercel project
vercel git connect          # optional: connect via the dashboard instead
```

Project settings:

| Setting | Value |
| ------- | ----- |
| Framework preset | Next.js |
| Build command | `npm run build` |
| Output | `.next` (default) |
| Install command | `npm install` |
| Node version | 22.x |
| Production branch | `main` |

### Environment variables (Vercel → Settings → Environment Variables)

| Variable | Environments | Notes |
| -------- | ------------ | ----- |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | `https://movescore.com` (preview: the preview URL) |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Production, Preview | Optional. Cookieless collector URL; omit to disable analytics |
| `ADMIN_ENABLED` | none by default | Leave unset in production until auth exists |
| `NEXT_PUBLIC_SUPABASE_URL` | later | Phase 3+ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | later | Phase 3+ |
| `SUPABASE_SERVICE_ROLE_KEY` | later, server-only | Never expose to the browser |

Secrets are never written to source. `.env.example` documents the shape only.

## 3. Domain (owner action — purchase/DNS)

In Vercel → Domains → Add:

1. Add `movescore.com` and `www.movescore.com`.
2. Set **primary** to `movescore.com` and enable the redirect from `www` to the
   apex (Vercel manages this once both domains are attached).
3. At the registrar, point either the A/AAAA records or the nameservers as
   Vercel instructs.
4. Wait for the SSL certificate (automatic, usually minutes).

After DNS resolves, verify:

```
https://movescore.com                 → 200, canonical
https://www.movescore.com             → 308 to apex
https://movescore.com/robots.txt      → 200
https://movescore.com/sitemap.xml     → 200
https://movescore.com/compare/...     → 200 with canonical + OG tags
```

## 4. Database (Phase 3+, owner action — needs Supabase project)

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push            # applies supabase/migrations/*.sql in order
supabase db remote commit   # only if you changed the remote by hand (avoid)
```

Schema rules are documented in `docs/DATA.md`. Row Level Security: reference
tables are public-read; user tables are owner-scoped by `auth.uid()`.

## 5. Post-deploy smoke test

Work through `docs/LAUNCH-CHECKLIST.md`. Minimum: homepage loads, a comparison
runs, a scenario URL reproduces after reload, an unknown city 404s, and mobile
has no horizontal scroll.

## 6. Rollback

Vercel keeps every deployment immutable. To roll back: Deployments → previous
deployment → Promote to Production. Database rollbacks require a restore
(Supabase dashboard → Backups) — see `docs/DATA.md` for the backup strategy.
