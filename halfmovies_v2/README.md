# HalfMovies v2

Foundational scaffolding for the adaptive, multilingual HalfMovies platform.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind
- next-i18next (ar default, en/es)
- NextAuth v5 beta + Prisma ORM (PostgreSQL 16)
- Express 5 API (Node 22), rate limiting, Helmet, CORS
- Redis optional (Upstash/ioredis), BullMQ ready
- Testing: Jest + Testing Library

## Scripts
- `pnpm dev` – Next.js dev
- `pnpm server:dev` – Express dev (port 4000)
- `pnpm build` – Next.js build
- `pnpm start` – Next.js start
- `pnpm server:build` – compile Express to dist
- `pnpm server:start` – run compiled Express
- `pnpm lint` – ESLint
- `pnpm test` – Jest
- `pnpm ci:check` – lint + test + build

## Env
Copy `.env.example` to `.env.local` and set:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
YOUTUBE_API_KEY=
REDIS_URL=
```

## Directory Layout
```
/app
  /[locale]
  /components
  /lib
  /styles
  /api
/server (Express)
/prisma
/tests
```

## Branch Policy (requested)
- main: stable deploy
- dev: integration + staging deploy
- feature/*: PRs with lint/test/build checks; Husky enforces lint-staged (pre-commit) and full suite on pre-push.

## Docker
`Dockerfile` builds Next + Express. Exposes 3000 (Next) and 4000 (API). Command runs both (`pnpm server:start` & `pnpm start`).

## CI/CD
GitHub Actions: lint → test → build (Next) → build (server) on push/PR to main & dev.

## Localization
- defaultLocale: ar, fallbacks en/es
- locale switcher in header
- RTL support enabled via dir attribute

## Next Steps
- Run `pnpm prisma:migrate` after setting DATABASE_URL.
- Connect Redis/Upstash if caching is desired.
- Wire OAuth providers in NextAuth and add Secrets.
- Add analytics + community modules in Phase 2.
