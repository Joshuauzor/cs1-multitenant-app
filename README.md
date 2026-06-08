# CaseForm — Multi-tenant incident reports

React + TypeScript frontend for the [accident-scene-api](https://github.com/) NestJS backend. Users register or sign in, then create and view tenant-scoped incident reports via a two-step form.

## Features

- **Multi-tenant auth** — Register with `tenant_slug` + email/password; login with email/password only.
- **Tenant lookup** — Public `GET /tenants/:slug` validates workspace before registration.
- **Session persistence** — `access_token` and user profile in `localStorage`.
- **Incident dashboard** — Tenant-scoped report list (agents see own reports; admins see all in tenant).
- **Two-step report flow** — `POST /reports` (step 1) then `PATCH /reports/:id/step-2` (intervention type).

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- Backend running at `http://localhost:3000` — see `/Users/joshuauzor/APIs/accident-scene-api`

### Backend setup

```bash
cd /Users/joshuauzor/APIs/accident-scene-api
npm install
npm run migrate:run
npm run seed:run
npm run start:dev
```

Seed data: tenant slug `default`, admin `admin@example.com`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Vite proxies `/api` → `http://localhost:3000`, so leave `VITE_API_URL` empty for local dev.

## Environment variables

Create `.env` at the project root:

```env
# Leave empty in dev (uses Vite proxy). Set for production builds.
VITE_API_URL=
```

| Variable       | Required | Description |
|----------------|----------|-------------|
| `VITE_API_URL` | No       | API origin (e.g. `http://localhost:3000`). Empty = same-origin `/api/v1/...` |

Restart `npm run dev` after changing `.env`.

## npm scripts

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Dev server on port **5173** |
| `npm run build`   | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint`    | ESLint |

## Backend API contract

Base path: `/api/v1`. All responses use an envelope; the client unwraps `data`:

```json
{
  "status_code": 200,
  "status": "Success",
  "message": "...",
  "data": { },
  "time": "...",
  "request": { "method": "GET", "path": "/api/v1/reports" }
}
```

Errors return `message` in the envelope (`status`: `"Failed"` or `"Error"`).

Protected routes: `Authorization: Bearer <access_token>`.

### Auth

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/auth/register` | No | `{ email, tenant_slug, password, confirm_password }` |
| `POST` | `/auth/login` | No | `{ email, password }` |

Register does **not** return a token — the frontend logs in after successful registration.

Login `data`:

```json
{
  "user": { "id", "email", "tenant_id", "role" },
  "tokens": { "access_token", "refresh_token" }
}
```

### Tenants

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/tenants/:slug` | Public |
| `GET` | `/tenants` | Admin |
| `POST` | `/tenants` | Admin |

### Reports

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/reports` | Bearer | `{ first_name, last_name, location }` |
| `PATCH` | `/reports/:id/step-2` | Bearer | `{ intervention_type }` |
| `GET` | `/reports` | Bearer | — |
| `GET` | `/reports/:id` | Bearer | — |

`intervention_type`: `medical` | `fire` | `traffic` | `structural` | `other`

### Users

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/users/current-user` | Bearer |
| `DELETE` | `/users/account` | Bearer |

## Project structure

```
src/
├── api/api.ts              # Fetch client, envelope unwrap, all endpoints
├── components/MultiStepForm.tsx
├── context/
│   ├── auth-context.ts
│   ├── AuthContext.tsx
│   └── useAuth.ts
├── pages/
│   ├── AuthPage.tsx
│   └── DashboardPage.tsx
├── types/index.ts
└── vite-env.d.ts
```

## Tech stack

- React 19, TypeScript, Vite 8
- Backend: NestJS (`accident-scene-api`)

## Troubleshooting

| Issue | Check |
|-------|-------|
| Network errors | Backend on port 3000; `vite.config.ts` proxy `/api` → `3000` |
| Registration 404 | Tenant slug exists (seed: `default`) |
| Login 400 | Valid credentials; password rules (6–20 chars, upper+lower+digit/special) |
| CORS in production | Set `VITE_API_URL`; configure backend CORS |
