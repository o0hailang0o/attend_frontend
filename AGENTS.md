# AGENTS.md — attend_frontend

企业考勤管理系统 (Enterprise Attendance Management System).

## Stack

- **Build**: Vite 6 + TypeScript 5.7 (strict)
- **UI**: React 19, React Router 7 (BrowserRouter), Tailwind CSS 3
- **No test framework** — no tests exist
- **No component library** — pure Tailwind utility classes

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` — TS errors **block** the build |
| `npm run lint` | `eslint .` — no eslint config file found in repo; may fail |

## Architecture

- **Entry**: `src/main.tsx` → `src/App.tsx` → routes (`/login`, `/dashboard`)
- **Dashboard** (`src/pages/Dashboard.tsx`) is the layout orchestrator — owns all shared state, sidebar, and header. Each tab is a separate page component in `src/pages/` (`Overview`, `Attendance`, `Personal`, `LeaveApply`, `MyLeaves`, `Approval`, `Users`, `Rules`, `Settings`).
- **Sidebar** extracted to `src/components/Sidebar.tsx` (desktop sidebar + mobile bottom nav).
- No component library — pure Tailwind utility classes.
- **Only real API call**: `POST /api/sysuser/login` (all dashboard data is hardcoded mock data).
- **API proxy** in `vite.config.ts`: `/api/*` → `http://localhost:8080/` (path prefix stripped).
- **No assets** yet (`src/assets/` is empty).
- All UI text is **Chinese (zh-CN)**.

## Conventions & gotchas

- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` — unused imports/vars cause build failure.
- No CSS files outside `src/index.css` (only `@tailwind` directives).
- No `.env` files, no codegen steps, no migrations, no CI/CD workflows.
- ESM-only (`"type": "module"` in package.json).
