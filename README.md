# Southern Horizons

Website and backoffice for a volunteer group: news and events as threads, QR Ph donation campaigns, and a public transparency ledger.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Auth.js v5 · Drizzle ORM + Neon Postgres · Cloudflare R2 · Zustand · Formik + Zod (`zod-formik-adapter`) · Tiptap · Hugeicons · pnpm

## Getting started

```bash
pnpm install
cp .env.example .env.local      # fill in the values (see below)
pnpm db:migrate                 # create tables
pnpm db:seed                    # first admin + sample campaign + sample post
pnpm dev
```

Sign in at `http://localhost:3000/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Services to set up

### 1. Neon (database)
1. Create a project at neon.tech, region **AWS Asia Pacific (Singapore)** for the lowest latency from the Philippines.
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Optional: install the Neon integration on Vercel to get a database branch per preview deployment.

### 2. Cloudflare R2 (media)
1. In the Cloudflare dashboard, go to **R2 → Create bucket** (e.g. `southern-horizons-media`).
2. **Settings → Custom domains**: connect `media.<your-domain>`. Put that URL in `R2_PUBLIC_URL`.
3. **R2 → Manage API tokens → Create token** with *Object Read & Write* on that bucket. Copy the account ID, access key ID, and secret.
4. **Settings → CORS policy** on the bucket (browsers upload directly to R2):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<your-domain>", "https://*.vercel.app"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Vercel
1. Import the GitHub repo. Framework preset: Next.js. Package manager is detected from `pnpm-lock.yaml`.
2. Add every variable from `.env.example` under **Settings → Environment Variables** (you can skip the `SEED_*` ones).
3. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain.
4. **Domains:** add your domain, then create the DNS records Vercel shows you in Cloudflare. Set those records to **DNS only** (grey cloud) so Vercel can issue the SSL certificate.

Run migrations against production from your machine with the production `DATABASE_URL`: `pnpm db:migrate`.

## Roles and permissions

Code checks permissions, never role names. The map lives in `src/lib/rbac.ts`.

| Role | Posts | Publish | Media | Donations | Ledger | Users |
|---|---|---|---|---|---|---|
| Admin | all | ✓ | ✓ incl. SVG | review | ✓ | ✓ |
| Editor | all | ✓ | ✓ | view | — | — |
| Content creator | own drafts and in-review | submits for review | ✓ | — | — | — |
| Treasurer | — | — | ✓ (receipts) | review | ✓ | — |
| Member | — | — | — | view | — | — |

Checks run in three layers:
1. `src/proxy.ts` keeps signed-out users out of `/admin`.
2. **Every server action and API route calls `requirePermission()`.** This is the real check.
3. The UI hides controls a role can't use. This is cosmetic only.

Deletes are soft (`deleted_at`), and changes are written to `audit_logs`.

## How the main flows work

**Posts as threads.** A post of type `event` can have `update` posts that point to it through `parent_id`. The event page renders them as a timeline. Whether an event is upcoming, happening now, or past is computed from its dates.

**Uploads.**
1. The browser asks `/api/uploads/presign` for a signed URL (permission, file type, and size are checked).
2. The browser uploads straight to R2, so files never pass through Vercel.
3. The browser calls `/api/uploads/finalize`, which checks the file's real bytes against its declared type. Only then is the media marked `verified`.

JPEG and PNG are converted to WebP in the browser before upload, which also strips EXIF data such as GPS location. SVG uploads are admin-only, and any SVG containing scripts or external links is rejected.

Limits: images 10 MB, SVG 512 KB, video 250 MB, PDF/DOCX 25 MB (see `src/lib/validations/upload.ts`).

**Donations (static QR Ph).**
1. The donor picks an item and quantity, pays with the campaign's QR code, and submits their reference number.
2. The server computes the amount from the item price. The client never sends a total.
3. The treasurer confirms or rejects each donation in `/admin/donations`.
4. Only confirmed donations count toward progress bars and the transparency page.

To add a payment gateway later (PayMongo, Xendit, or Maya), create donations with `channel: "gateway"` and `external_id`, then confirm them from the gateway's webhook.

## Not built yet

- Backoffice screens for campaigns, the ledger, contact messages, users and roles, and the audit log. The tables and permissions already exist; for now use `pnpm db:studio`.
- Cloudflare Turnstile on the contact and donation forms (a TODO is in `src/actions/contact.ts`).
- Email notifications, e.g. with Resend.
- Rate limiting on `/login` and the public forms.

## Before launch

- Have a lawyer review `/privacy` and `/terms`. Both are drafts written with RA 10173 (Data Privacy Act) in mind.
- Get written consent before publishing photos of children, and don't pair their full names with their faces.
- Check whether soliciting donations from the public requires a DSWD solicitation permit for your group.
