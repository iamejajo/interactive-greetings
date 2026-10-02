# Valentine Surprise

Create a little interactive Valentine surprise, get a short link, and send it to someone you love. They open it, get asked _the_ question, and (eventually) say yes. ❤️

V1 contains a single experience type, `valentine`. The codebase is organised around a generic **experience** concept so that more types (birthday, anniversary, …) can be added later without reworking the creator or database layers.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- [Motion](https://motion.dev) (Framer Motion) for animation
- Supabase PostgreSQL, accessed only from the server
- Vitest for unit tests
- Deployed on Vercel

## Getting started

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev                   # http://localhost:3000
```

## Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm start`         | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript, no emit             |
| `npm test`          | Run unit tests once (Vitest)    |
| `npm run test:watch`| Run unit tests in watch mode    |

## Environment variables

See [`.env.example`](./.env.example).

| Variable                    | Scope       | Purpose                                   |
| --------------------------- | ----------- | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | public      | Base URL for share links (optional)       |
| `NEXT_PUBLIC_SUPABASE_URL`  | public      | Supabase project URL                      |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Supabase service-role key — never exposed |

All database access goes through the server, so no Supabase anon key is used in V1.

## Project structure

```
src/
  app/            Routes (pages, route handlers)
  components/     Shared components
    ui/           Small UI primitives
  experiences/    Experience registry + one folder per experience type
  lib/
    db/           Supabase client + data access (server-only)
    validation/   Input schemas shared by client and server
    utils/        Small helpers
  types/          Shared TypeScript types
```

## Supabase setup

_Coming in PR 2._

## Deployment

_Coming in PR 8._
