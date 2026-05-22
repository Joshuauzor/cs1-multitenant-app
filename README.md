# CaseForm — Multi-tenant incident reports

A React + TypeScript frontend for a multi-tenant workspace. Users sign in or register against a tenant, then create and view incident reports on a dashboard.

## Features

- **Multi-tenant auth** - Login and register with email, password, and tenant selection (Acme Corp, Globex Ltd, Initech).
- **Session persistence** — Auth token and profile stored in `localStorage`; session survives page refresh.
- **Incident dashboard** — Table of reports scoped to the signed-in tenant.
- **Multi-step report form** — Two-step modal: contact/location details, then intervention type.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- npm (comes with Node.js)
- A backend API listening on **port 4000** (or another URL you configure — see [Environment variables](#environment-variables))

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional for local dev)

Create a `.env` file in the project root (see [Environment variables](#environment-variables)).

For local development with the default Vite proxy, you can leave `VITE_API_URL` unset.

### 3. Start the backend

Ensure your API server is running on `http://localhost:4000` (or update the proxy in `vite.config.ts`).

### 4. Run the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Vite only exposes variables prefixed with `VITE_` to the client.

Create `.env` at the project root (not under `src/`):

```env
# Base URL for API requests. Leave empty in dev to use same-origin + Vite proxy.
VITE_API_URL=
```

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_API_URL`  | No       | API origin (e.g. `http://localhost:4000`). If empty, requests use relative paths like `/api/forms`. |

**Where values vs types live**

- **Values** → `.env` (gitignored). Copy from a teammate or use the example above.
- **Types** → `src/vite-env.d.ts` (TypeScript only; does not store secrets).

Restart the dev server after changing `.env`.

### Local dev without `VITE_API_URL`

`vite.config.ts` proxies `/api` and `/auth` to `http://localhost:4000`. With an empty `VITE_API_URL`, the app calls `/auth/login`, `/api/forms`, etc. on port 3000 and Vite forwards them to the backend.

### Production / explicit API URL

Set the full API origin:

```env
VITE_API_URL=https://api.example.com
```

## npm scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Start Vite dev server (default port **3000**)   |
| `npm run build`   | Typecheck and production build → `dist/`        |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint on the project                        |

### Production build

```bash
npm run build
npm run preview
```

Preview typically serves on [http://localhost:4173](http://localhost:4173). Set `VITE_API_URL` before `build` if the app must call an absolute API URL in production.

## Backend API contract

The frontend expects a JSON API with these endpoints (Bearer token on protected routes):

| Method | Path               | Auth     | Body / response |
|--------|--------------------|----------|-----------------|
| `POST` | `/auth/register`   | No       | `{ email, password, tenantId }` → `AuthPayload` |
| `POST` | `/auth/login`      | No       | `{ email, password, tenantId }` → `AuthPayload` |
| `GET`  | `/api/forms`       | Bearer   | → `FormEntry[]` |
| `POST` | `/api/forms`       | Bearer   | `{ first_name, last_name, location, selection_value }` → `FormEntry` |

**AuthPayload**

```json
{
  "token": "string",
  "email": "string",
  "tenantId": "string",
  "tenantName": "string"
}
```

Errors should return JSON with a `message` field; the client surfaces that to the user.

## Project structure

```
src/
├── api/api.ts           # Fetch wrapper and API functions
├── components/
│   └── MultiStepForm.tsx
├── context/
│   ├── auth-context.ts  # React context definition
│   ├── AuthContext.tsx  # AuthProvider component
│   └── useAuth.ts       # useAuth hook
├── pages/
│   ├── AuthPage.tsx     # Login / register
│   └── DashboardPage.tsx
├── types/index.ts       # Shared types and constants
├── App.tsx              # Auth gate and routing
├── main.tsx
└── vite-env.d.ts        # Vite client types for import.meta.env
```

## Tech stack

- React 19
- TypeScript
- Vite 8
- ESLint (React Hooks, TypeScript ESLint, React Refresh)

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Network errors on login/forms | Backend running on port 4000; proxy in `vite.config.ts` matches your API port |
| `import.meta.env` TypeScript errors | `src/vite-env.d.ts` is present with `/// <reference types="vite/client" />` |
| Env changes not applied | Restart `npm run dev` after editing `.env` |
| CORS in production | Set `VITE_API_URL` to your API origin; ensure the API allows your frontend origin |

