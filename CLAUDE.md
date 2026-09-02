# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Multi-tenant SaaS Institute Management System — an npm-workspaces monorepo. One backend REST API serves three tiers of clients: platform **SUPER_ADMIN** (SaaS operator), institute **ADMIN**, and **STUDENT**. Tenancy is per-`Institute`; nearly every domain row carries an `instituteId` and requests are scoped to it.

## Commands

Run from the repo root (workspace-aware). Node 20+ / npm 10+.

```bash
npm install                    # install all workspaces

npm run dev:backend            # backend API on :5000 (tsx watch)
npm run dev:web                # web portal on :3000 (Vite)
npm run dev:mobile             # Expo (mobile workspace is scaffold-only, see Status)

npm run build                  # build all workspaces (--if-present)
npm run build:packages         # build @ims/types + @ims/common first if consumers fail to resolve
npm run lint                   # every workspace's lint == tsc type-check, no ESLint configured
npm test                       # runs workspace `test` scripts — none defined yet, so this is a no-op
```

Backend-specific (run from `backend/` or via `npm run <script> --workspace=backend`):

```bash
npm run prisma:generate        # regenerate client after editing schema.prisma
npm run prisma:migrate         # prisma migrate dev (MySQL must be running)
npm run prisma:push            # push schema without a migration
npm run prisma:seed            # tsx prisma/seed.ts — seeds plans, super admin, demo tenant
npm run db:test                # tsx src/scripts/test-db.ts — checks MySQL reachability + `SELECT 1`
```

### Tests

There is no test framework. `backend/src/tests/*TestRunner.ts` are standalone scripts with hand-rolled `assert` counters. `systemTestRunner.ts` and the CBT/fee portions are pure-logic mocks (no DB); `saasTestRunner.ts` and `authSystemTestRunner.ts` hit the real DB via Prisma. Run one directly:

```bash
cd backend && npx tsx src/tests/systemTestRunner.ts
cd backend && npx tsx src/tests/saasTestRunner.ts      # needs MySQL + seeded data
```

## Environment

Copy `.env.example` to `.env` (repo root) or `backend/.env`. `backend/src/config/env.ts` loads `.env` from CWD, then `backend/.env`, then repo root — later files do not override earlier ones. Key vars: `DATABASE_URL` (MySQL), `PORT` (5000), `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN` (15m) / `JWT_REFRESH_EXPIRES_IN` (7d), `DEFAULT_INSTITUTE_CODE`, `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` (consumed by the seed). Web reads `VITE_API_URL` (defaults to `http://localhost:5000/api/v1`).

## Backend architecture

Request pipeline per feature: **route → middleware chain → controller → service → Prisma**.

- **`server.ts`** creates the HTTP server; **`src/app.ts`** (`createApp()`) wires CORS (allow-all for dev), JSON body parsing (10mb), request logger, a global in-memory rate limiter on `/api`, then mounts `apiRouter` at **both `/api/v1` and `/api`**. `src/routes/index.ts` is the single route registry.
- **Controllers** are classes of `static` handlers wrapped in `asyncHandler`. They pull `req.instituteId` / `req.user`, call a service, and return via `ResponseHandler` (`{ success, message, data, meta }`). They contain no business logic.
- **Services** are classes of `static` methods that always take `instituteId` as the first argument and own all Prisma access, uniqueness checks, and `AppError` throwing. Match this shape when adding modules.
- **Validation**: Zod schemas in `src/validations/*.validation.ts` shaped as `z.object({ body, query, params })`. `validateRequest(schema)` (in `auth.middleware.ts`) parses all three; each schema also exports inferred `Create*Input` / `Update*Input` types the services consume.
- **Errors**: throw `new AppError(message, httpStatus, details?)`. `errorHandler` (last middleware) classifies status → error code and maps Prisma known errors to 400. Use `HTTP_STATUS` from `@ims/common`, never bare numbers.

### Middleware chain (order matters)

Typical protected route: `authenticate` → `resolveTenantContext` → `authorize(...roles)` → `validateRequest(schema)` → `enforce*Quota` → handler.

- **`authenticate`** — verifies the Bearer access token, loads the `User`, sets `req.user` and `req.instituteId`.
- **`resolveTenantContext`** — resolves the tenant from `req.user.instituteId` or the `X-Institute-Code` header; verifies the `Institute` is not suspended/inactive and the trial has not expired. `SUPER_ADMIN` bypasses this.
- **`authorize(...UserRole)`** — RBAC gate.
- **`enforceStudentQuota` / `enforceCourseQuota` / `enforceBatchQuota` / `enforceFeatureFlag(key)`** (`quota.middleware.ts`) — enforce the tenant's `SubscriptionPlan` limits; `SUPER_ADMIN` and tenants with no plan pass through. Add these to any create route that grows a metered resource.

### SaaS layer

`Institute` has a one-to-one `Subscription` → `SubscriptionPlan`, plus `PlatformInvoice` (B2B billing) and `TenantUsage` (denormalized counters). `/api/v1/saas/*` (`saas.routes.ts`) is entirely `SUPER_ADMIN`-only: tenant onboarding, status transitions, plan changes, platform invoices. `UsageTrackerService` maintains `TenantUsage`.

### Data model

`backend/prisma/schema.prisma` (MySQL) is the single source of truth — ~27 models, `@@map`ed to snake_case tables, string UUID PKs. Tenant-scoped uniqueness is compound (e.g. `@@unique([instituteId, code])`), so Prisma `where` clauses use keys like `instituteId_code`. `architecture/*.md` documents entities, relationships, and the intended module build order (Institute → Auth → Courses/Subjects → Teachers → Batches → Students → Timetable/Attendance/Materials → Question Bank → Tests → Attempts → Results → Fees → Notifications → Dashboards). `Teacher` is a directory record with **no** login `User`.

## Frontend (`web/`)

React 18 + Vite + React Router 6 + Tailwind + `lucide-react`. TS path aliases for `@ims/*` are set in both `tsconfig.json` and `vite.config.ts`.

- **`src/services/api.ts`** (`ApiService`) is the fetch wrapper: attaches the Bearer token from `localStorage` (`ims_access_token`), auto-refreshes once on 401, unwraps `data`, and dispatches a `ims_auth_unauthorized` window event on hard failure. Feature-specific API modules (`studentApi.ts`, `examApi.ts`, `feeApi.ts`, …) build on it.
- **`src/context/AuthContext.tsx`** holds `user` / `student` / `institute` / `role`, hydrated from `localStorage` then verified against `/auth/me`.
- **`src/App.tsx`** is the route table. `ProtectedRoute` gates auth; `RoleRoute allowedRole=...` gates by role. Three areas: `/superadmin/*` (SUPER_ADMIN, `SuperAdminLayout`), `/admin/*` (ADMIN), `/student/*` (STUDENT, `StudentLayout`; the exam attempt route is full-screen outside the layout).

Note: the root `package.json` lists a `superadmin` workspace, but there is no `superadmin/` directory — the super-admin UI currently lives under `web/src/pages/superadmin/`.

## Status / gotchas

- Only Phase 1 foundations plus much of the module roadmap are scaffolded; treat `architecture/` as the plan, not a description of finished work.
- The rate limiter and tenant-resolution caches are **in-memory** (`Map`) — fine for single-process dev, not for horizontal scaling.
- The `mobile/` workspace has `App.tsx` / screens / services written against React Native + Expo, but Expo/React Native are **not** in its `package.json` dependencies, so it will not run as-is.
- Prisma enum `UserRole` is `SUPER_ADMIN | ADMIN | STUDENT`; `User.instituteId` is nullable only for the global `SUPER_ADMIN`.
