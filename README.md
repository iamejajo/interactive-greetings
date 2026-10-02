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
| `npm run db:push`   | Apply pending migrations to the linked Supabase project |
| `npm run db:types`  | Regenerate `src/lib/db/database.types.ts` from the live schema |
| `npm run db:smoke`  | Create → read → delete a row against the real database |

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

1. **Create a project** at [supabase.com](https://supabase.com/dashboard). Under *Security*: enable the **Data API**, leave **"Automatically expose new tables"** off, and enable **automatic RLS**.
2. **Fill in `.env.local`** (copy from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → Data API → Project URL. Use the base URL (`https://<ref>.supabase.co`), **without** `/rest/v1/`.
   - `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API Keys → **Secret** key (`sb_secret_…`), or the legacy `service_role` key.
3. **Link the CLI** (the CLI is a dev dependency, so `npx` uses the pinned version):
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref>   # asks for the database password
   ```
4. **Apply the schema and check it:**
   ```bash
   npm run db:push
   npm run db:smoke
   ```

### Schema

One table, `public.experiences` ([migration](./supabase/migrations)):

| Column           | Type        | Notes                                   |
| ---------------- | ----------- | --------------------------------------- |
| `id`             | uuid        | Primary key, internal only              |
| `slug`           | text        | Unique, 6–16 alphanumerics, public URL  |
| `type`           | text        | Check-constrained; `valentine` in V1    |
| `sender_name`    | text        | 1–50 characters                         |
| `recipient_name` | text        | 1–50 characters                         |
| `message`        | text, null  | 1–500 characters when present           |
| `created_at`     | timestamptz |                                         |
| `updated_at`     | timestamptz | Maintained by trigger                   |

**Access model:** the browser never talks to the database. RLS is on with no policies and `anon`/`authenticated` have no grants, so the public key can't read or write anything. Only server code, using the service role (`select`, `insert`, `delete`), touches the table. The database also enforces the length, type and slug rules itself, independently of app validation.

**Schema changes:** add a migration with `npx supabase migration new <name>`, then `npm run db:push` and `npm run db:types`.

## Deployment

_Coming in PR 8._
