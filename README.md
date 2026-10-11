# WeDo

A wedding invite, RSVP and check-in app built on Next.js (App Router), Prisma and Postgres, deployable to Vercel.

- **Guests** enter their invite code (or scan the QR code on their card) to RSVP for everyone on their invite.
- **Admins** ("God" mode) manage guests, tables and invites, generate printable invite cards, export a seating
  chart, and check guests in at the door by code, name or QR scan.

## Stack

Next.js 16 (App Router, Server Components, Server Actions) · React 19 · Prisma 7 (`pg` driver adapter) ·
Auth0 (`@auth0/nextjs-auth0` v4) · hCaptcha · Bootstrap 5 · Vitest

## Setup

```sh
cp .env.example .env   # then fill it in, see below
npm install            # also generates the Prisma client
npx prisma migrate deploy
npm run db:seed        # optional: demo event, settings and invite code DEMO2026
npm run dev
```

Any Postgres works (Neon, Supabase, Vercel Postgres, or local).

### Environment

See [`.env.example`](.env.example). The important ones:

| Variable                                                                                 | Purpose                                                                                                                             |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                           | Postgres connection string                                                                                                          |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` | Auth0 Regular Web Application. Allowed callback URL: `<APP_BASE_URL>/auth/callback`; allowed logout URL: `<APP_BASE_URL>`           |
| `ADMIN_EMAILS`                                                                           | Comma-separated, verified emails allowed into `/god` and `/checkin`. **Empty means nobody**, so logging in is not enough on its own |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET`                                       | Required to submit RSVPs. `.env.example` has hCaptcha's always-pass test keys for local use                                         |
| `SLACK_BOT_TOKEN`                                                                        | Optional. RSVP notifications go to the channel set in `/god/settings`                                                               |
| `GOOGLE_MAPS_API_KEY`                                                                    | Optional. Map embed in the FAQ                                                                                                      |

Non-secret settings (couple name, default event, time zone, splash photo URLs, invite code length, ...) are edited
in `/god/settings` and stored in the `Feature` table. Never put secrets there.

Event-specific copy (FAQ, RSVP wording, contact numbers) lives in [`content/`](content).

## Scripts

| Command                               |                       |
| ------------------------------------- | --------------------- |
| `npm run dev` / `build` / `start`     | Next.js               |
| `npm run lint` / `typecheck` / `test` | ESLint, `tsc`, Vitest |
| `npm run db:seed`                     | Seed demo data        |
| `npx prisma studio`                   | Browse and edit data  |

## Security model

- Every admin page, Server Action and route handler calls `requireAdmin()` (`lib/auth.ts`), which checks for a
  logged-in user whose verified email is in `ADMIN_EMAILS`. `proxy.ts` also redirects logged-out visitors away
  from `/god` and `/checkin`, but it is not relied on.
- The RSVP page only loads the fields a guest needs (no phone numbers, emails or tables).
- RSVP submissions are verified server-side: hCaptcha, the invite's deadline, and that every guest belongs to
  that invite.
- Invite codes are generated with `crypto.getRandomValues` from an unambiguous 31-character alphabet: 8
  characters by default, never fewer than 6. The invite code is what lets someone RSVP, so don't use short or
  guessable custom codes.

## Upgrading a v1 (2022, Pages Router) deployment

1. Revoke the Slack bot token that was stored in the settings table (v1 exposed it publicly) and set a new one as
   `SLACK_BOT_TOKEN`. Migration `20261011000000_move_secrets_out_of_settings` deletes the old row.
2. Auth0 SDK v4 renamed its variables and routes: `AUTH0_ISSUER_BASE_URL` → `AUTH0_DOMAIN` (hostname only),
   `AUTH0_BASE_URL` → `APP_BASE_URL`, and the callback moved from `/api/auth/callback` to `/auth/callback`.
   Update the Auth0 application's allowed callback/logout URLs.
3. Set `ADMIN_EMAILS`.
4. Splash photos no longer come from listing an S3 bucket via Cognito (`S3_COGNITO_IDENTITY_POOL_ID` is unused).
   Put the photo URLs in the `splashPhotos` setting instead.
5. Use Node.js 22 or newer.
