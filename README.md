# FGT Website (Monorepo)

Frontend (React + Vite) and backend (Node/Express + Prisma + Postgres).

## Requirements

- Node.js + npm

## Run the project

1. Install dependencies:
   npm install

2. Start the frontend dev server:
   npm run dev

3. Start the backend dev server:
   npm run dev:server

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:server` - Start Express server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run prisma:seed` - Seed lookup tables

## Project structure

- `client/` - React + Vite frontend
- `server/` - Express API + Prisma schema

Frontend highlights:

- `client/src/api` - Mock API data and helpers
- `client/src/auth` - Auth context + protected route logic
- `client/src/components` - Reusable UI components and layouts
- `client/src/pages` - Route-level pages
- `client/src/locales` - i18n translation files
- `client/src/assets` - Static assets used in the app
- `client/public` - Static public assets

Backend highlights:

- `server/src` - Express entrypoint and routes
- `server/prisma/schema.prisma` - Database schema

## Routing overview

Defined in `client/src/App.jsx`.

Public routes:

- `/` - Login
- `/register` - Register
- `/faq` - FAQ
- `/contact` - Contact
- `/playerterms` - Player terms
- `/privacypolicy` - Privacy policy
- `/importantinfo` - Important information
- `/download` - Download

Protected routes (require login):

- `/dashboard`
- `/projects` and `/projects/:id` (+ `test`, `survey`)
- `/sessions`
- `/store`
- `/profile` (tabs: `library`, `rewards`, `account`)

Onboarding flow:

- `/onboarding` (index)
- `/onboarding/additional-info`
- `/onboarding/questionnaire`

New users are redirected to onboarding until both steps are completed. Users who
finish onboarding are redirected to `/dashboard` if they try to access
`/onboarding`.

## Auth and mock data

Authentication now uses the backend JWT endpoints (`/auth/login`, `/auth/register`,
`/auth/me`). The frontend stores the token in `localStorage` as `authToken`.
The frontend now uses real API calls for projects and questionnaires.

## i18n

Translations live in `client/src/locales`. The default language is English (`en`), and
Korean (`kr`) is also supported. The selected language is saved to
`localStorage.lang` and loaded on startup in `client/src/i18n.js`.

## Backend setup

1. Copy the example environment file:
   `server/.env.example` -> `server/.env`

2. Update `DATABASE_URL` and `JWT_SECRET`.

3. Generate Prisma client and run migrations:
   `npm run prisma:generate`
   `npm run prisma:migrate`
   `npm run prisma:seed`

## Docker (Postgres + API)

This setup runs Postgres and the API together on the internal server.

1. Make sure Docker Desktop is running.
2. Update secrets in `docker-compose.yml` (database password + `JWT_SECRET`).
2. Start services:
   `docker compose up -d --build`
   (server only: `docker compose up -d --build server`)
3. Run migrations + seed inside the server container:
   `docker compose exec server npm run prisma:generate`
   `docker compose exec server npm run docker:migrate`
   `docker compose exec server npm run prisma:seed`

The API will be available at `http://localhost:4000` by default.

## Frontend environment

The frontend reads the API base URL from `client/.env`:

```
VITE_API_URL=http://localhost:4000
```

## Ops: Backup / Restore (Docker)

Backups use the Postgres custom format and store files in `./backups`.

- Backup:
  `powershell -ExecutionPolicy Bypass -File ops/backup-db.ps1`
- Restore:
  `powershell -ExecutionPolicy Bypass -File ops/restore-db.ps1 -BackupFile backups/FILE.dump`

## Seed data (lookup tables)

`npm run prisma:seed` populates deterministic IDs so defaults work consistently.

- Roles: admin=1, tester=2, client=3
- Community settings: Open=0, InviteOnly=1
- User statuses: Active=1, Suspended=2, Deleted=3
- Platform languages: en=1, ko=2, ja=3
- Questionnaire statuses: Draft=1, Published=2, Archived=3
- Question types: SHORT_TEXT=1, LONG_TEXT=2, SINGLE_CHOICE=3, MULTI_CHOICE=4, SCALE=5, NUMBER=6, DATE=7
- Response statuses: InProgress=1, Submitted=2, Abandoned=3
- Point transaction types: EARN_SURVEY=1, REDEEM_REWARD=2, ADJUSTMENT=3, REVERSAL=4
- Reward redemption statuses: Pending=1, Approved=2, Fulfilled=3, Rejected=4, Cancelled=5

Safety note: the seed script only inserts/updates lookup tables (no users or secrets)
and is idempotent. It is safe for dev and staging. For production, you can run it
once during setup; avoid changing IDs after you have real data.
