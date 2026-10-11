# WeDo

A wedding invite, RSVP and check-in app built on Next.js (App Router), Prisma and Postgres, deployable to Vercel.

- **Guests** enter their invite code (or scan the QR code on their card) to RSVP for everyone on their invite.
- **Admins** ("God" mode) manage guests, tables and invites, generate printable invite cards, export a seating
  chart, and check guests in at the door by code, name or QR scan.

`/about` is a product page describing the app, with mockups of each screen. Set **Demo invite code** in
`/god/settings` to a fictional invite and the page links to it, and its sample card's QR code opens it.

## Stack

Next.js 16 (App Router, Server Components, Server Actions) · React 19 · Prisma 7 (`pg` driver adapter) ·
Auth0 (`@auth0/nextjs-auth0` v4) · hCaptcha · Bootstrap 5 · Vitest

## Setup

```sh
cp .env.example .env   # then fill it in, see below
npm install            # also generates the Prisma client
npx prisma migrate deploy
npm run db:seed        # optional: fictional demo event and invite code DEMO2026
npm run dev
```

Any Postgres works (Neon, Supabase, Vercel Postgres, or local).

### Environment

See [`.env.example`](.env.example). The important ones:

| Variable                                                                                 | Purpose                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                           | Postgres connection string                                                                                                                               |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` | Auth0 Regular Web Application. Allowed callback URL: `<APP_BASE_URL>/auth/callback`; allowed logout URL: `<APP_BASE_URL>`                                |
| `ADMIN_EMAILS`                                                                           | Optional. Comma-separated, verified emails allowed into `/god` and `/checkin`. If empty, anyone who can log in through the Auth0 application is an admin |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET`                                       | Required to submit RSVPs. `.env.example` has hCaptcha's always-pass test keys for local use                                                              |
| `SLACK_BOT_TOKEN`                                                                        | Optional. RSVP notifications go to the channel set in `/god/settings`                                                                                    |
| `GOOGLE_MAPS_API_KEY`                                                                    | Optional. Map embed in the FAQ                                                                                                                           |
| `BLOB_STORE_ID` or `BLOB_READ_WRITE_TOKEN`                                               | Optional. Image uploads in settings via Vercel Blob. Connecting a store in Vercel sets `BLOB_STORE_ID`                                                   |

Without the Auth0 variables the guest-facing pages still work and the admin pages are disabled.

## Making it yours

Nothing about a specific wedding lives in this repository. A fresh deployment shows neutral placeholder copy on a
plain cover; you fill in your own in **God → Settings** (`/god/settings`):

- **Event:** the wedding date and time (in the event time zone), venue and event name. Saving creates the event if
  none exists yet.
- **After the wedding:** a message from the couple. By default the home page turns into a thank-you page showing
  only that message the day after the wedding; switch `thankYouPage` off to keep the normal page (e.g. for a demo)
  with a link to `/thank-you` instead. `/thank-you` is always reachable, so you can preview it.
- **Look:** a theme preset (`classic`, `modern`, `garden` or `blush`, each with its own fonts and palette), an
  optional accent colour, and the tagline above your names on the cover.
- **Text:** couple names, invitation message, RSVP notes and agreement, change policy, FAQ (Markdown, including
  tables and images), map location, footer.
- **Images:** cover photos, a photo gallery for the thank-you page (plus an optional link to your full album), an optional gift/payment QR code shown after check-in, and an optional printable invite
  card background (1240 × 1748 px). Uploads are stored in [Vercel Blob](https://vercel.com/docs/vercel-blob); connect
  a public Blob store to the project (this sets `BLOB_STORE_ID`), or paste image URLs instead.

All of this is stored in your database and Blob store, so forks of the repository never contain your photos, contact
details or payment information. A test (`tests/repo-hygiene.test.ts`) fails if images other than the favicon,
or phone numbers, are committed. Never put secrets in settings: values are visible to admins. Secrets belong in
environment variables.

## Scripts

| Command                               |                       |
| ------------------------------------- | --------------------- |
| `npm run dev` / `build` / `start`     | Next.js               |
| `npm run lint` / `typecheck` / `test` | ESLint, `tsc`, Vitest |
| `npm run db:seed`                     | Seed demo data        |
| `npx prisma studio`                   | Browse and edit data  |

## Security model

- Every admin page, Server Action and route handler calls `requireAdmin()` (`lib/auth.ts`), which checks for a
  logged-in user (and, if `ADMIN_EMAILS` is set, that their verified email is on it). `proxy.ts` also redirects
  logged-out visitors away from `/god` and `/checkin`, but it is not relied on.
- Without `ADMIN_EMAILS`, **anyone who can log in is an admin**, so disable sign-ups on the Auth0 connection
  (Authentication → Database → your connection → "Disable Sign Ups") and create admin accounts yourself.
- The RSVP page only loads the fields a guest needs (no phone numbers, emails or tables).
- RSVP submissions are verified server-side: hCaptcha, the invite's deadline, and that every guest belongs to
  that invite.
- Invite codes are generated with `crypto.getRandomValues` from an unambiguous 31-character alphabet: 8
  characters by default, never fewer than 6. The invite code is what lets someone RSVP, so don't use short or
  guessable custom codes.

## Upgrading a v1 (2022, Pages Router) deployment

1. Revoke the Slack bot token that was stored in the settings table (v1 exposed it publicly) and set a new one as
   `SLACK_BOT_TOKEN`. Migration `20261011000000_move_secrets_out_of_settings` deletes the old row.
2. Auth0 SDK v4 renamed its variables and routes: `AUTH0_ISSUER_BASE_URL` → `AUTH0_DOMAIN` (hostname only; the old
   variable is still read as a fallback),
   `AUTH0_BASE_URL` → `APP_BASE_URL`, and the callback moved from `/api/auth/callback` to `/auth/callback`.
   Update the Auth0 application's allowed callback/logout URLs.
3. Disable sign-ups on the Auth0 connection, or set `ADMIN_EMAILS`.
4. Splash photos no longer come from listing an S3 bucket via Cognito (`S3_COGNITO_IDENTITY_POOL_ID` is unused).
   Put the photo URLs in the `splashPhotos` setting instead.
5. Use Node.js 22 or newer.

## Licence

[MIT](LICENSE) © WuCoLaBo
