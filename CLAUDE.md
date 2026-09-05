# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Multi-tenant SaaS Institute Management System — split into three independent applications (Backend REST API, React Web Portal, and Expo Mobile App). Every tenant is an `Institute`; almost every table carries `instituteId` and data is isolated per tenant at the middleware layer.

## Applications

| Directory | Package | Stack | Purpose |
|-----------|---------|-------|---------|
| `backend/` | `institute-backend` | Express 4 + Prisma 5 (MySQL) + Zod + JWT, run with `tsx` | REST API, `/api/v1` (also mounted at `/api`) |
| `web/` | `institute-web` | React 18 + Vite 5 + React Router 6 + Tailwind 3 | Landing page + Super Admin, Admin, Teacher, and Student portals |
| `mobile/` | `institute-mobile` | React Native / Expo | Student mobile app |

## Commands

Run commands inside each application directory independently.

### Backend (`cd backend`)
```bash
npm install                      # install backend dependencies
npm run dev                      # tsx watch, port 5000
npm run build                    # tsc -> backend/dist
npm run lint                     # type-check (tsc --noEmit)
npm run prisma:validate          # validate prisma/schema.prisma
npm run prisma:generate          # regenerate Prisma client after schema.prisma edits
npm run prisma:push              # push schema to DB without a migration (dev)
npm run prisma:migrate           # create + apply a dev migration
npm run prisma:seed              # tsx prisma/seed.ts — seeds plans, default institute, admin
npm run db:test                  # tsx src/scripts/test-db.ts — DB connectivity check
```

### Web (`cd web`)
```bash
npm install                      # install web dependencies
npm run dev                      # vite, port 3000
npm run build                    # tsc && vite build
npm run lint                     # type-check (tsc --noEmit)
```

### Mobile (`cd mobile`)
```bash
npm install                      # install mobile dependencies
npm run start                    # expo start
npm run lint                     # type-check (tsc --noEmit)
```

### Tests

End-to-end verification scripts live in `backend/src/tests/`:

```bash
cd backend
npx tsx src/tests/systemTestRunner.ts   # full academic + CBT + fees + notifications flow
npx tsx src/tests/saasTestRunner.ts     # tenant provisioning, subscription, quota enforcement
```

## Environment

Copy `.env.example` or set env vars in `backend/.env`. Key vars: `DATABASE_URL` (MySQL), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (default 5000), `CLIENT_URL`.

## Architecture & Conventions

- Each application contains its own copy of core TypeScript interfaces and common constants under `src/types/` and `src/common/`.
- No root monorepo or workspace dependencies are required.
