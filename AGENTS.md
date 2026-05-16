# AGENTS.md — AI Agent Context & Rules for `jesti-recipe-web`

> **This file is the single source of truth for all AI development agents (Google Jules, Antigravity, GitHub Copilot, etc.) working on this repository.**
> Read this entire file before making any changes. Do not deviate from the rules defined here.

---

## 1. Project Context & Purpose

**`jesti-recipe-web`** is a self-hosted recipe display web application built with Next.js. It fetches recipe content from one or more external GitHub repositories (which store recipes as Markdown files) and renders them as a browsable, searchable web interface.

Key characteristics:
- **Not a static site** — it is a full Next.js server-side application running as a persistent Node.js process.
- **Authentication-protected** — all routes (except the login page, health check, and a few API endpoints) are guarded by JWT-based auth with a fallback to HTTP Basic Auth.
- **Data source is GitHub** — recipes live in separate GitHub repositories (configured via environment variables), not in this codebase.
- **Deployed on Railway** — the only supported deployment target is [Railway (railway.app)](https://railway.app). See Section 3 for critical constraints.

---

## 2. Architecture & Tech Stack

### Languages & Frameworks

| Technology | Version | Role |
|---|---|---|
| TypeScript | 5.9.3 | Primary language (81% of codebase) |
| Next.js | 15.5.15 | Full-stack React framework (App Router) |
| React | 19.x | UI rendering |
| CSS Modules | — | Component-scoped styling (18.6% of codebase) |
| ESLint | 9.x | Linting (`eslint-config-next`) |

### Key Libraries

| Library | Purpose |
|---|---|
| `jose` | JWT signing and verification (auth middleware) |
| `marked` | Markdown → HTML rendering for recipe content |
| `fuse.js` | Client-side fuzzy search across recipes |
| `fraction.js` | Fraction formatting for ingredient quantities |
| `languagedetect` | Detect the language of recipe content |
| `zod` | Runtime schema validation |
| `@svgr/webpack` | SVG import as React components |

### Folder Structure

```
/
├── railway.toml              # Railway deployment config (DO NOT DELETE OR MODIFY)
├── RAILWAY.md                # Railway env var documentation
├── next.config.ts            # Next.js configuration (DO NOT add `output: 'export'`)
├── eslint.config.mjs         # ESLint flat config
├── tsconfig.json             # TypeScript config (strict mode enabled)
├── package.json              # Scripts: dev, build, start, lint
├── public/                   # Static assets
└── src/
    ├── middleware.ts          # Global auth middleware (JWT + Basic Auth)
    └── app/                  # Next.js App Router root
        ├── layout.tsx         # Root layout
        ├── page.tsx           # Home page (recipe list)
        ├── not-found.tsx      # 404 page
        ├── globals.css        # Global styles
        ├── resets.css         # CSS resets
        ├── page.module.css    # Home page CSS module
        ├── [author]/          # Dynamic route: recipes per author/repo
        ├── login/             # Login page (public, auth-exempt)
        ├── api/
        │   ├── auth/          # Auth check endpoint
        │   ├── health/        # Health check → GET /api/health (Railway uses this)
        │   ├── image/         # Image proxy endpoint
        │   ├── login/         # Login POST endpoint (issues JWT cookie)
        │   ├── logout/        # Logout endpoint (clears cookie)
        │   ├── recipe-temp/   # Temporary recipe share URLs (auth-exempt)
        │   └── revalidate/    # On-demand ISR revalidation
        ├── components/        # Reusable React components
        │   ├── Recipe.tsx     # Main recipe display component
        │   ├── List.tsx       # Recipe list/grid component
        │   ├── Search.tsx     # Search input component
        │   ├── BringButton.tsx # Share/export button
        │   ├── Shuffle.tsx    # Random recipe button
        │   ├── LazyImage.tsx  # Lazy-loaded image component
        │   ├── ImageFallback.tsx
        │   └── AddLink.tsx
        ├── context/           # React Context providers
        ├── lib/               # Shared utilities and custom hooks
        │   ├── Recipedata.ts  # Core: fetches recipes from GitHub API
        │   ├── marked.ts      # Markdown parsing configuration
        │   ├── useFavorite.ts # Favorites hook (localStorage)
        │   ├── useLocalStorage.ts
        │   └── useMarkdown.ts
        ├── styles/            # Shared CSS modules
        └── svg/               # SVG assets
```

### Auth Flow

```
Request
  └─► middleware.ts
        ├─ Is path exempt? (login, /api/auth, /api/login, /api/health, etc.) → allow
        ├─ Has valid JWT cookie (`auth-token`)? → allow
        ├─ Has valid Basic Auth header? → allow
        └─ Else → redirect to /login?returnUrl=...
```

---

## 3. ⚠️ Deployment Constraints — RAILWAY (CRITICAL)

> **Railway is the ONLY supported deployment target. All changes must remain Railway-compatible.**

### Existing Railway Configuration

**`railway.toml`** (root of repo — DO NOT DELETE OR MODIFY WITHOUT EXPLICIT INSTRUCTION):
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
```

- **Builder:** Nixpacks (Railway's auto-detection). No `Dockerfile` is used. Nixpacks detects `package.json`, runs `npm install` and `npm run build` automatically.
- **Start command:** `npm start` → executes `next start` (Node.js server mode).
- **Health check:** Railway pings `GET /api/health` to determine if the service is alive.

### Build & Start Commands

| Phase | Command | Notes |
|---|---|---|
| Install | `npm install` | Run by Nixpacks automatically |
| Build | `npm run build` | Runs `next build` |
| Start | `npm start` | Runs `next start` (server mode) |
| Dev | `npm run dev` | Local only, NOT used in Railway |

### Required Environment Variables

Configure these in the Railway dashboard under **Variables**:

| Variable | Required | Description |
|---|---|---|
| `REPOSITORIES` | ✅ Yes | JSON array of recipe repository sources. Example: `[{"author":"okneze","repository":"jesti-rezepte","branch":"main"}]` |
| `JWT_SECRET` | ✅ Yes | Secret key for signing/verifying JWT auth tokens. Must be a long, random string. |
| `BASIC_AUTH_USER` | ✅ Yes | Username for Basic Auth login fallback. |
| `BASIC_AUTH_PASSWORD` | ✅ Yes | Password for Basic Auth login fallback. |
| `GITHUB_TOKEN` | ⚠️ Conditional | GitHub Personal Access Token. Required if any recipe repository is **private**. Needs `repo` scope. |

> **NEVER hardcode secrets in source code.** The fallback `'your-secret-key-change-in-production'` in `middleware.ts` is for local dev only. In Railway, `JWT_SECRET` must always be set.

### Agent Rules for Railway Compatibility

1. **DO NOT** add `output: 'export'` to `next.config.ts`. Static export mode breaks server-side features (API routes, middleware, ISR) and makes Railway deployment non-functional.
2. **DO NOT** delete or rename `railway.toml`. It must remain in the repository root.
3. **DO NOT** change the `startCommand` away from `npm start` without explicit instruction.
4. **DO NOT** add a `Dockerfile` unless explicitly requested — Nixpacks handles the build.
5. **DO NOT** remove or alter the `/api/health` route. Railway uses it as a health check; removing it will cause Railway to consider the service unhealthy and restart it.
6. **DO NOT** make changes that require environment variables not listed above without documenting them in this file and in `RAILWAY.md`.
7. **DO NOT** add server-only Node.js APIs (e.g., `fs`, `path`) in client components. Next.js will fail to build.
8. The application must remain a **Node.js server process** (not a static export, not an edge-only runtime).

---

## 4. Coding Conventions & Rules

### TypeScript

- **Strict mode is enabled** (`"strict": true` in `tsconfig.json`). All code must pass strict TypeScript checks.
- Do **not** use `any` as a type unless absolutely unavoidable; prefer `unknown` with type guards.
- Use the `@/*` path alias (maps to `src/*`) for all internal imports. Example: `import { something } from '@/app/lib/Recipedata'`.
- All new files must be `.ts` or `.tsx`. Do not introduce `.js` files in `src/`.

### React & Next.js

- Use the **App Router** (`src/app/`) exclusively. Do not create a `pages/` directory.
- Prefer **Server Components** by default. Only add `'use client'` when the component requires browser APIs, event handlers, or React hooks (`useState`, `useEffect`, etc.).
- Custom hooks live in `src/app/lib/` and must be prefixed with `use` (e.g., `useFavorite.ts`).
- Reusable UI components live in `src/app/components/`.
- CSS styling uses **CSS Modules** (`.module.css` files co-located or in `src/app/styles/`). Do not introduce CSS-in-JS libraries.

### API Routes

- All API routes are under `src/app/api/` using the App Router convention (`route.ts`).
- Exempt routes from auth by updating the `matcher` in `src/middleware.ts` (already excludes `api/auth`, `api/login`, `api/logout`, `api/health`, `api/image`, `api/recipe-temp`).
- Always return proper HTTP status codes. Use `NextResponse.json({ error: '...' }, { status: XXX })` for error responses.

### Error Handling

- **API routes:** Always wrap logic in try/catch. Return a JSON error response with an appropriate HTTP status code (400, 401, 403, 404, 500).
- **Server Components:** Let Next.js error boundaries handle thrown errors, or use `notFound()` for 404 cases.
- **Client Components:** Handle fetch errors gracefully; display user-friendly messages, do not expose internal error details.

### Linting

- ESLint is configured via `eslint.config.mjs` using `next/core-web-vitals` and `next/typescript` rulesets.
- All code must pass `npm run lint` without errors before being considered done.
- Do not disable ESLint rules inline (`// eslint-disable-next-line`) unless there is a documented reason.

### Formatting

- No Prettier config is present; follow the existing code style visible in the repository (2-space indentation, single quotes in TSX/TS).

---

## 5. Workflow Instructions

All agents must follow this workflow before marking any task as complete:

### Step 1 — Understand Before Changing
- Read the relevant existing code files before making changes.
- Understand the auth middleware (`src/middleware.ts`) before touching any route — you may inadvertently break access control.

### Step 2 — Type-Check
- All TypeScript must be valid under strict mode.
- Mentally verify (or run) `npx tsc --noEmit` to catch type errors.

### Step 3 — Lint
- All code must pass ESLint: `npm run lint`.
- Fix all errors (not just warnings from `next/core-web-vitals`) before finishing.

### Step 4 — Build Verification
- The critical gate is: `npm run build` must succeed without errors.
- A failed build = a failed Railway deployment. **A task is NOT complete if the build is broken.**
- Pay special attention to: dynamic imports in Server Components, missing `'use client'` directives, and invalid environment variable access patterns.

### Step 5 — Railway Constraint Check
Before finalizing, answer these questions:
- [ ] Does `railway.toml` still exist and is it unchanged (unless the task explicitly required modifying it)?
- [ ] Is `/api/health` still reachable without authentication?
- [ ] Is `output: 'export'` absent from `next.config.ts`?
- [ ] Are all newly required environment variables documented in this file and in `RAILWAY.md`?
- [ ] Does `npm start` still correctly start the application?

If any answer is **No**, fix it before completing the task.

### Step 6 — Do Not Break Auth
- Any new page route (non-API) will automatically be protected by `src/middleware.ts`.
- If a new route needs to be **public** (auth-exempt), add it explicitly to the `matcher` exclusion pattern in `src/middleware.ts`.
- Never remove or weaken the authentication middleware.

---

## 6. Out of Scope / Do Not Do

- Do **not** migrate to a different hosting platform (Vercel, Netlify, Cloudflare, etc.).
- Do **not** add a database (PostgreSQL, SQLite, etc.) without explicit instruction — the data source is GitHub repositories via the GitHub API.
- Do **not** replace the CSS Modules approach with Tailwind, Emotion, or other CSS-in-JS without explicit instruction.
- Do **not** upgrade Next.js major versions without explicit instruction.
- Do **not** publish this package (it is `"private": true` in `package.json`).