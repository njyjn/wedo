# WeDo

A wedding invite management system on Next.js and hosted on Vercel. You can try a live demo [here](https://wedo.sg) with invite code `TEST`.

## Setup

Create an `.env` file with the following

```env
DATABASE_URL=some_url
```

FYI: Heroku offers free PostgresQL database hosting.

```sh
npm i
npx prisma db push
npm run dev
```

## Test

Use Prisma studio to populate some data

```sh
npx prisma studio
```

Run wild! `https://localhost:8000`
