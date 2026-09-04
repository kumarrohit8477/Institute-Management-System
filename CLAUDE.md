# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Multi-tenant SaaS Institute Management System — an npm-workspaces monorepo. One backend REST API serves three clients (admin/student/teacher web portal, superadmin console rendered inside the same web app, and an Expo student mobile app). Every tenant is an `Institute`; almost every table carries `instituteId` and data is isolated per tenant at the middleware layer.

## Workspaces

| Path | Package | Stack | Purpose |
|------|---------|-------|---------|
| `backend/` | `@ims/backend` | Express 4 + Prisma 5 (MySQL) + Zod + JWT, run with `tsx` | REST API, `/api/v1` (also mounted at `/api`) |
| `web/` | `@ims/web` | React 18 + Vite 5 + React Router 6 + Tailwind 3 | Landing page + Super Admin, Admin, Teacher, and Student portals (all roles in one SPA) |
| `mobile/` | `@ims/mobile` | React Native / Expo | Student mobile app |
| `packages/types/` | `@ims/types` | TS types only | Shared DTOs, `ApiResponse<T>` envelope, API contract types |
| `packages/common/` | `@ims/common` | TS | Shared constants, notably `HTTP_STATUS` |
| `packages/tsconfig/` | `@ims/tsconfig` | — | Base tsconfigs (`base.json`, `node.json`, `react.json`) |

Note: `superadmin/` is listed in the root `package.json` `workspaces` array but does not exist — the superadmin UI lives under `web/src/pages/superadmin/`.

## Commands

Run from repo root unless noted. There is no test framework, linter (ESLint), or formatter configured — `lint` is a type-check alias (`tsc --noEmit`).

```bash
npm install                      # install all workspaces

npm run dev:backend              # tsx watch, port 5000
npm run dev:web                  # vite, port 3000
npm run dev:mobile               # expo start

npm run build                    # build all workspaces
npm run build:backend            # tsc -> backend/dist
npm run build:web                # tsc && vite build

npm run lint                     # type-check every workspace (tsc --noEmit)
npm run prisma:validate          # validate backend/prisma/schema.prisma
```

Backend-specific (run in `backend/` or via `npm run <script> --workspace=backend`):

```bash
npm run prisma:generate          # regenerate Prisma client after schema.prisma edits
npm run prisma:push              # push schema to DB without a migration (dev)
npm run prisma:migrate           # create + apply a dev migration
npm run prisma:seed              # tsx prisma/seed.ts — seeds plans, a default institute, admin
npm run db:test                  # tsx src/scripts/test-db.ts — DB connectivity check
```

### "Tests"

There is no unit test runner. End-to-end verification scripts live in `backend/src/tests/` and are self-executing — run directly:

```bash
cd backend
npx tsx src/tests/systemTestRunner.ts   # full academic + CBT + fees + notifications flow
npx tsx src/tests/saasTestRunner.ts     # tenant provisioning, subscription, quota enforcement
```

Both require a running MySQL database (they hit the real DB via Prisma).

## Environment

Copy `.env.example` to `.env` (repo root) or `backend/.env` — `backend/src/config/env.ts` loads `.env` from CWD, then `backend/.env`, then repo-root `.env`. Key vars: `DATABASE_URL` (MySQL), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (default 5000), `CLIENT_URL`. The web client hardcodes the API base as `http://localhost:5000/api/v1` in `web/src/services/api.ts`.

## Backend architecture

Request pipeline per feature module: **route → middleware chain → controller → service → Prisma**.

- **`src/app.ts`** builds the Express app; **`server.ts`** wraps it in an HTTP server with graceful shutdown. `src/index.ts` is a barrel re-export.
- **Routes** (`src/routes/*.routes.ts`) are aggregated in `src/routes/index.ts` as `apiRouter`. Each route file `router.use(authenticate)` then `router.use(resolveTenantContext)` at the top, then per-endpoint `authorize(...roles)`, `validateRequest(schema)`, and quota middleware.
- **Controllers** (`src/controllers/*.controller.ts`) are classes of `static` handlers wrapped in `asyncHandler`. They pull `req.instituteId` / `req.user`, call a service, and return via `ResponseHandler.success/created` (`src/utils/apiResponse.ts`). All responses use the `ApiResponse<T>` envelope `{ success, message, data, meta, error }`.
- **Services** (`src/services/*.service.ts`) are classes of `static` methods holding all business logic and Prisma access. They throw `AppError(message, httpStatus, details?)` (`src/utils/appError.ts`); the global `errorHandler` middleware serializes these.
- **Validation** (`src/validations/*.validation.ts`) — Zod schemas shaped as `{ body, query, params }`, applied by `validateRequest` from `src/middleware/auth.middleware.ts`.

### Multi-tenancy & RBAC (critical)

- **`authenticate`** (`src/middleware/auth.middleware.ts`) verifies the JWT access token, loads the `User`, and sets `req.user` + `req.instituteId`.
- **`resolveTenantContext`** (`src/middleware/tenant.middleware.ts`) resolves the tenant (from `req.user.instituteId` or `x-institute-code` header), then **blocks the request** if the institute is `SUSPENDED`/`INACTIVE`/`ARCHIVED` or the subscription trial has expired. `SUPER_ADMIN` bypasses tenant restrictions entirely.
- **`authorize(...UserRole)`** enforces RBAC. Roles: `SUPER_ADMIN` (platform, no institute), `ADMIN` (institute owner), `TEACHER`, `STUDENT`.
- **Quota middleware** (`src/middleware/quota.middleware.ts`) — `enforceStudentQuota`, `enforceCourseQuota`, `enforceBatchQuota`, and `enforceFeatureFlag(planFeature)` check the tenant's `SubscriptionPlan` limits before create operations and throw `PLAN_LIMIT_EXCEEDED` / `FEATURE_NOT_INCLUDED`.
- **When adding any query in a service, always filter by `instituteId`** (usually `prisma.model.findFirst({ where: { id, instituteId } })`) — this is the tenant isolation boundary and is not enforced by Prisma automatically.

### Data model

Single Prisma schema: `backend/prisma/schema.prisma` (MySQL, `@@map`ed snake_case tables). Domains:

- **SaaS/platform**: `Institute`, `SubscriptionPlan`, `Subscription`, `PlatformInvoice`, `TenantUsage`
- **Identity**: `User` (only `ADMIN`/`STUDENT`/`TEACHER`/`SUPER_ADMIN` have login rows; `@@unique([instituteId, email])`), `PasswordResetToken`
- **Academics**: `Course`, `Subject`, `CourseSubject`, `Teacher` (optional `userId` — faculty may have no login), `TeacherSubject`, `Batch`, `BatchSubject` (central unit: subject + assigned teacher per batch), `StudentBatch`, `TeacherAssignment`, `Room`, `Timetable`, `StudyMaterial`
- **Attendance**: `Attendance` (`@@unique([batchId, studentId, date])`)
- **CBT exam engine**: `Question` + `QuestionOption` → `Test` + `TestQuestion` → `TestAttempt` + `StudentAnswer` → `Result` (auto-graded, ranked)
- **Finance**: `Fee` → `Payment`
- **Comms**: `Notification`

Prose specs for the schema live in `architecture/` (`database-entities.md`, `entity-relationships.md`, `module-dependency-order.md`). The module build order in `module-dependency-order.md` reflects how the codebase is layered.

## Web architecture

- **`src/App.tsx`** — all routing. `AuthProvider` wraps everything; `ProtectedRoute` gates auth, `RoleRoute allowedRole="..."` gates by role. Four route trees: `/superadmin/*`, `/admin/*`, `/teacher/*`, `/student/*`, each with its own `*Layout` component; `/` and `/login` are public.
- **`src/services/`** — one API module per domain (`adminApi.ts`, `studentApi.ts`, `teacherApi.ts`, `examApi.ts`, `feeApi.ts`, `saasApi.ts`, ...). `api.ts` `ApiService` is the core fetch wrapper: injects the `Bearer` token from `localStorage` (`ims_access_token`), auto-refreshes on 401 once, unwraps the `ApiResponse` envelope to return `data.data`, and fires an `ims_auth_unauthorized` window event on refresh failure.
- **Path aliases** (Vite + tsconfig): `@/*` → `web/` root (so imports look like `@/src/pages/...`), plus `@ims/common` and `@ims/types` resolve to the packages' `src/`.
- Icons: `lucide-react`. Styling: Tailwind utility classes, `clsx` for conditionals. No component library.

## Conventions

- Two API path prefixes are served identically: `/api/v1` and `/api`.
- Controllers/services are classes with only `static` members — follow that pattern for new modules.
- New backend feature module = add `*.validation.ts` (Zod), `*.service.ts`, `*.controller.ts`, `*.routes.ts`, then register the router in `src/routes/index.ts`.
- After editing `schema.prisma`, run `npm run prisma:generate` (and `prisma:push` or `prisma:migrate`) or `@prisma/client` types will be stale.
- Uploaded files are served from `backend/uploads/` at `/uploads`.
