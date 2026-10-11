# AGENTS.md

Context for coding agents working on WeDo. Read this before changing anything. `README.md` covers setup for humans.

## What this is

A single-deployment wedding invite, RSVP and check-in app. Guests open `/rsvp/<CODE>` (or enter the code on `/`) and
RSVP for everyone on their invite. Admins ("God" mode, `/god/*`) manage guests, tables, invites and settings, and
check guests in at the door (`/checkin`) by code, name or QR scan. It is deliberately **not** multi-tenant.

**This repository is public and meant to be forked.** It must never contain a real couple's names, photos, contact
details, venue specifics or payment QR codes. Everything event-specific lives in the database (`Feature` table,
edited in `/god/settings`) and Vercel Blob (uploaded images). `tests/repo-hygiene.test.ts` enforces part of this.

## Stack

Next.js 16 App Router (Server Components, Server Actions, `proxy.ts`) · React 19 · TypeScript (strict) · Prisma 7
with the `pg` driver adapter · Postgres · Auth0 (`@auth0/nextjs-auth0` v4) · hCaptcha · Vercel Blob · Bootstrap 5 /
react-bootstrap · zod · Vitest. Node 22+. Deployed on Vercel.

## Commands

```sh
npm ci                  # also runs `prisma generate` (postinstall)
npm run dev
npm run lint            # ESLint flat config
npm run typecheck       # next typegen (route types) + tsc --noEmit
npm test                # Vitest, tests/**/*.test.ts
npx prettier --check .  # formatting (default Prettier config)
npm run build
npx prisma migrate deploy && npm run db:seed   # local DB; seed creates invite code DEMO2026
```

Run lint, typecheck, test and build before pushing. Vercel runs `vercel-build`, which **applies migrations to the
deployment's database before building**.

## Layout

| Path                                                              | What                                                                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`, `app/rsvp/[code]/page.tsx`, `app/rsvp/actions.ts` | Public: home/lookup, invite page, RSVP Server Actions                                                                   |
| `app/god/**`, `app/god/actions.ts`                                | Admin pages and Server Actions (guests, invites, event, settings, image uploads)                                        |
| `app/checkin/**`                                                  | Admin check-in page and actions                                                                                         |
| `app/god/guests/export/route.ts`                                  | Seating-chart CSV route handler                                                                                         |
| `proxy.ts`                                                        | Auth0 middleware (mounts `/auth/*`), redirects logged-out users away from `/god`, `/checkin`                            |
| `components/`                                                     | UI. Client components are marked `"use client"`; `components/admin/` is admin-only UI                                   |
| `lib/`                                                            | Server and pure helpers (see below)                                                                                     |
| `lib/settings.ts`                                                 | The settings registry: every admin-editable setting, its kind (`text`/`markdown`/`image`/`images`/`toggle`) and default |
| `lib/theme.ts`, `app/globals.css`                                 | Theme presets (`data-theme` on `<html>`) and design tokens mapped onto Bootstrap's CSS variables                        |
| `lib/thank-you.ts`, `app/thank-you/page.tsx`                      | After the wedding: whether the home page becomes the thank-you page or links to `/thank-you`                            |
| `lib/default-content.ts`                                          | Neutral placeholder copy shown until settings are filled in                                                             |
| `prisma/schema.prisma`, `prisma/migrations/`, `prisma.config.ts`  | Schema, SQL migrations, Prisma 7 config                                                                                 |
| `lib/generated/prisma/`                                           | Generated client (gitignored). Import from `@/lib/generated/prisma/client`                                              |

Pure, unit-tested logic lives in `lib/` files without `server-only` imports: `rsvp.ts` (deadline + which guests may
be changed), `names.ts` (formal addressee line), `invite-code.ts`, `csv.ts`, `admin.ts`, `auth-config.ts`,
`db-url.ts`, `blob.ts`, `format.ts`, `theme.ts`, `thank-you.ts`, `image.ts`. Put new business rules there and test them in `tests/`.

## Invariants (don't break these)

1. **Every admin entry point calls `requireAdmin()` itself** (`lib/auth.ts`): each page, each Server Action, each
   route handler. Layouts are not a security boundary in the App Router, and `proxy.ts` is only a first line.
2. **Public pages select only the fields guests need.** Anyone holding (or guessing) an invite code can load
   `/rsvp/<code>`; never select phone numbers, emails or tables there.
3. **RSVP writes are validated server-side**: hCaptcha (fails closed), the deadline (`isRsvpClosed`), and that every
   guest id belongs to that invite (`planRsvp`). Check-in likewise checks guest ids belong to the invite.
4. **Validate all Server Action input with zod** and return generic error messages (no raw errors/records to clients,
   except admin-only upload errors).
5. **No secrets in settings.** `/god/settings` shows values to admins; tokens go in environment variables.
6. **No event-specific content in the repo** (see above). Seed data and tests use fictional names.
7. Invite codes come from `generateInviteCode` (crypto, unambiguous alphabet, ≥ 6 chars, default 8).
8. Admin-authored Markdown goes through `components/Markdown.tsx` (no raw HTML); image/link settings are filtered
   by `isSafeUrl`.

## Auth and admin access

- Auth0 SDK v4, configured in `lib/auth0.ts`. Routes are `/auth/login`, `/auth/callback`, `/auth/logout`, handled by
  `proxy.ts` (use plain `<a>`, not `<Link>`, for them).
- `AUTH0_DOMAIN` falls back to the v1 variable `AUTH0_ISSUER_BASE_URL`. If Auth0 isn't configured at all, guest pages
  still work and admin routes redirect to `/not-authorized`.
- Admin = any logged-in Auth0 user, unless `ADMIN_EMAILS` (comma-separated, verified emails) is set. Access control
  therefore relies on **sign-ups being disabled on the Auth0 connection**. Keep that documented if you touch it.

## Data and database

- Models: `Event`, `Invite` (code, respond-by, response), `Guest` (belongs to an invite and optionally a table),
  `Table`, `Feature` (settings name/value). `Guest.vaccinated`/`negativePET` and `users` are unused legacy columns.
- `DATABASE_URL` may carry `?schema=<name>`; `lib/db-url.ts` passes it to the pg adapter (the Prisma CLI reads it
  itself). The deployment uses a dedicated schema in a shared database, so never assume `public`.
- Prisma 7: the generator is `prisma-client` with `importFileExtension = ""` (Turbopack can't resolve the default
  `.js` imports to `.ts`). The datasource URL lives in `prisma.config.ts`, not the schema.
- New schema changes need a migration in `prisma/migrations/`. Production and previews share one database, so keep
  migrations backwards-compatible with the deployed code.
- Settings: add new ones to `SETTINGS` in `lib/settings.ts` (unknown names in the table are ignored, so you can seed
  rows before the code ships). `getSettings()` is request-cached.

## Dates and time zones

Event times are stored as instants and formatted in the `timeZone` setting (default `Asia/Singapore`) via
`lib/format.ts`. The event date is edited in `/god/settings` via `<input type="datetime-local">`, read as wall-clock time in
the event time zone (`fromDateTimeLocalInput` / `toDateTimeLocalInput`). Respond-by dates come from `<input type="date">`, are stored as midnight UTC and mean "by the end of
that calendar day in the event time zone" (`rsvpClosesAt`). Don't format date-only values in the event time zone;
use `formatCalendarDate`.

## Images (Vercel Blob)

Uploads go through `uploadSettingImage` in `app/god/actions.ts`: PNG/JPEG/WebP/GIF, under 4 MB (Server Actions
`bodySizeLimit` is 4 MB; Vercel caps bodies at 4.5 MB). Credentials: `BLOB_STORE_ID` (store connected in the Vercel
dashboard, auth via Vercel OIDC) or `BLOB_READ_WRITE_TOKEN`. The settings page resizes photos in the browser first
(`components/admin/resizeImage.ts`: at most 2400 px, JPEG/WebP; also converts HEIC where the browser can decode it)
and uploads multi-photo lists one file at a time, since each upload appends to the stored list. Only our own Blob
URLs go through Next's image optimiser (`isOptimizableImageUrl` in `lib/image.ts`); URLs pasted from other hosts
render `unoptimized`.

## Testing locally

- Postgres: any local instance works; `.env` with `DATABASE_URL` (+ optional `?schema=`). `.env*` is gitignored.
- hCaptcha test keys (in `.env.example`) always pass; the matching test response token is
  `10000000-aaaa-bbbb-cccc-000000000001`.
- Admin pages without a real Auth0 tenant: set any `AUTH0_*` values plus `AUTH0_SECRET`, then mint a session cookie
  named `__session` with `generateSessionCookie` from `@auth0/nextjs-auth0/testing`.
- Server Actions can be called directly over HTTP (`Next-Action` header with the id from
  `.next/server/server-reference-manifest.json`) to test authorization without the UI. Requests need a matching
  `Origin` header (Next's CSRF check).

## Conventions

- Match the surrounding style; Prettier defaults; comments explain _why_, sparingly.
- Server Components by default; add `"use client"` only for interactivity. react-bootstrap components are client
  components, so use plain Bootstrap classes in Server Components.
- Admin forms use `useAdminForm` (`components/admin/useAdminForm.ts`), which avoids React 19's automatic form reset
  on validation errors.
- Style with the tokens in `app/globals.css` (`--accent`, `--ink`, `--line`, `--font-display`, ...) rather than
  hard-coded colours or fonts, so every theme preset and the admin accent override keep working.
- Never commit images other than the favicon, or real phone numbers; the hygiene test will fail.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
