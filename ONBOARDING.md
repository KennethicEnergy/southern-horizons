# Onboarding

A step-by-step guide to getting Southern Horizons running on your machine and shipping your first change. Read [README.md](README.md) for what the app does and how its main flows work, and [CLAUDE.md](CLAUDE.md) for the code rules every change must follow.

## 1. Get access

Ask the project owner to add you to these before you start:

| Service | Why you need it |
|---|---|
| GitHub: `KennethicEnergy/southern-horizons` | Clone and push |
| Vercel: project `southern-horizons` | Pull env vars, view deployments and logs |
| Neon: the `southern-horizons` project | Database and per-developer branches |
| Cloudflare (R2) | Only if you'll work on uploads or media |
| Google Cloud OAuth client | Only if you'll work on Google sign-in |

You also need a backoffice account. Either an admin invites your Google email under **Backoffice → Members**, or you use the seed admin you create in step 5.

## 2. Install the tools

- **Node.js 20.9 or newer** (Next.js 16 requirement). Check with `node -v`.
- **pnpm 10.18.0**, the version pinned in `package.json`. The easiest way to get it is `corepack enable`, which picks the right version automatically.
- **Git**, with an SSH key added to GitHub.
- **Vercel CLI** (`pnpm add -g vercel`) to pull env vars.
- **Neon CLI** (`pnpm add -g neonctl`) to create your own database branch.

On Windows, every command below works in PowerShell or Git Bash.

## 3. Clone and install

```bash
git clone git@github.com:KennethicEnergy/southern-horizons.git
cd southern-horizons
pnpm install
```

## 4. Set up environment variables

All variables are listed with comments in [.env.example](.env.example). Your local file is `.env.local`. It is gitignored, so never commit it.

**Option A: pull from Vercel (recommended).**

```bash
vercel login
vercel link                     # pick the southern-horizons project
vercel env pull .env.local      # pulls the Development environment
```

**Option B: fill in by hand.**

```bash
cp .env.example .env.local
```

Then fill in the values. [README → Services to set up](README.md#services-to-set-up) explains where each one comes from.

Whichever option you use, check these values afterwards:

| Variable | What to put |
|---|---|
| `DATABASE_URL` | Pooled connection string for **your own Neon branch** (see below), never production |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) connection string for the same branch. Migrations use it when it's set, because the pooler breaks them. It isn't in `.env.example` yet, so add it yourself. |
| `AUTH_SECRET` | Generate your own: `pnpm dlx auth secret` |
| `AUTH_URL`, `SITE_URL` | `http://localhost:3000` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Your email and a password of **at least 12 characters** |
| `R2_*` | Needed only to upload media. Without them, the rest of the site still works. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional. If either is empty, the Google button is hidden. |

### Create your own database branch

Work against a Neon branch of your own, so migrations and test data never touch production:

```bash
neonctl auth
neonctl set-context --project-id <project id from the Neon dashboard>
neonctl branches create --name dev-<your-name>
neonctl connection-string dev-<your-name> --pooled   # → DATABASE_URL
neonctl connection-string dev-<your-name>            # → DATABASE_URL_UNPOOLED
```

A branch starts as a copy of its parent's data, and you can delete it and create a new one at any time.

## 5. Prepare the database

```bash
pnpm db:migrate          # applies the SQL files in drizzle/
pnpm db:seed             # creates the admin from SEED_ADMIN_* and a sample campaign
pnpm db:seed:samples     # optional: placeholder news, events, donations, and ledger entries
```

To remove the placeholder content later, run `pnpm db:seed:samples --remove`. It deletes everything with a slug that starts with `sample-`.

## 6. Run the app

```bash
pnpm dev
```

- Public site: http://localhost:3000
- Backoffice: http://localhost:3000/login. Sign in with your `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
- Component showcase: http://localhost:3000/components
- Database browser: `pnpm db:studio`

## 7. Check that everything passes

Run these now to confirm your setup works. Run them again before every push to `main`, and don't push if any of them fail:

```bash
pnpm lint
pnpm test
pnpm build
```

You can also run `pnpm typecheck` for a faster type-only check.

## 8. Find your way around

```
src/
  app/(site)/     public pages (home, news, campaigns, transparency, …)
  app/admin/      backoffice pages
  app/api/        route handlers (auth, upload presign and finalize)
  actions/        server actions; each one calls requirePermission()
  components/     UI, grouped as site/, admin/, forms/, og/
  config/         constants and static config (site.ts, brand.ts, …)
  db/             Drizzle schema, client, and seed scripts
  lib/            pure helpers and wrappers (rbac, r2, money, dates, validations/)
  stores/         Zustand stores
  types/          shared types
  auth.ts         Auth.js setup (credentials and Google)
  proxy.ts        keeps signed-out users out of /admin
drizzle/          generated SQL migrations (committed)
```

Start with these files:

- [src/lib/rbac.ts](src/lib/rbac.ts): who can do what. Code checks permissions, never role names.
- [src/db/schema.ts](src/db/schema.ts): every table and enum.
- [src/lib/session.ts](src/lib/session.ts): `requirePermission()`, the server-side permission check.
- [src/actions/_helpers.ts](src/actions/_helpers.ts): `runAction()`, which turns errors thrown in server actions into messages forms can show.

## 9. Everyday workflows

### Change the database schema

1. Edit [src/db/schema.ts](src/db/schema.ts).
2. Run `pnpm db:generate`. This writes a new SQL file to `drizzle/`. Read it before going on.
3. Run `pnpm db:migrate` to apply it to your branch.
4. Commit the schema change and the generated SQL together.

Avoid `pnpm db:push` except for throwaway experiments on your own branch. It changes the database without creating a migration file.

### Write code

The full rules are in [CLAUDE.md](CLAUDE.md). In short:

- Use `const` arrow functions and destructuring. Some older files still use `function` declarations; new code shouldn't.
- Put helpers in `src/lib/`, constants in `src/config/`, shared types in `src/types/`, and hooks in `src/hooks/useXxx.ts`.
- Follow TDD: write a failing test first. Tests live next to the code as `*.test.ts` and run with Vitest. See [src/lib/og.test.ts](src/lib/og.test.ts) for an example.
- Never trust the client for permissions or money. Server actions call `requirePermission()`, and donation amounts are computed on the server.

### Commit

```
[TYPE] : Meaningful short message
```

Types: `FEAT`, `FIX`, `CHORE`, `STYLE`, `REFACTOR`, `TEST`, `DOCS`, `PERF`, `BUILD`, `CI`, `REVERT`.
Example: `[FIX] : Fall back to production domain when site URL env var is empty`. Don't add AI co-author or attribution lines.

### Deploy

Vercel deploys `main` to production and builds a preview for every other branch. When a change includes a migration, apply it to production **before** merging, so the new code never runs against an old schema:

```bash
DATABASE_URL_UNPOOLED="<production direct URL>" pnpm db:migrate
```

Variables already set in your shell take priority over `.env.local`. Set the production URL for this one command only, not in your `.env.local`.

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL is not set` | `.env.local` is missing or the variable is empty. Redo step 4. |
| A migration hangs or fails with prepared-statement errors | You're using the pooled URL. Set `DATABASE_URL_UNPOOLED`. |
| `pnpm db:seed` fails with a password error | `SEED_ADMIN_PASSWORD` must be at least 12 characters. |
| `R2_… is not set` when uploading | Add the R2 variables (see the README), or skip media work. |
| Uploads fail in the browser with a CORS error | Your origin is missing from the bucket's CORS policy (see the README). |
| Google sign-in sends you back with "not invited" | Your email isn't an active member. Ask an admin to invite you. |
| Google sign-in fails on a preview deployment | Expected: Google rejects preview URLs. Use email and password there. |
| Images from R2 don't load through `next/image` | Set `R2_PUBLIC_URL` and restart `pnpm dev`. `next.config.ts` reads it at startup. |

Questions? Ask the project owner, or check the Vercel logs for production issues.
