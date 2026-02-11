# AGENTS.md

This file is the source of truth for agentic work in this repository.
Follow these instructions before modifying code.

## Quick Orientation

- This repo hosts multiple apps (frontend + backend variants).
- Use the correct subproject and its scripts.
- Do not invent commands that are not in package.json.
- No Cursor or Copilot custom rules are present.

## Projects

- `labFrontend/` — React + TypeScript + Vite + TailwindCSS (mobile-first, dark mode)
- `labBackend/` — Express + TypeScript + MongoDB (Mongoose)
- `frontend_react/` — React + TypeScript + Vite + TailwindCSS
- `backend_local/` — Node.js (ESM) Express + hardware/IoT integration
- `backend_dash/` — Node.js + TypeScript Express
- `cuki_api_ia/` — Bun runtime + TypeScript (AI API)

## Build / Lint / Test Commands

### labFrontend

```bash
cd labFrontend
npm install
npm run dev       # Vite dev server (port 6789)
npm run build     # tsc + vite build
npm run lint      # eslint . --ext ts,tsx --max-warnings 0
npm run preview
```

Single-test: no test runner configured.

### labBackend

```bash
cd labBackend
npm install
npm run dev       # nodemon + ts-node
npm run build     # tsc
npm start         # node dist/index.js
```

Single-test: no test runner configured.

### frontend_react

```bash
cd frontend_react
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Single-test: no test runner configured.

### backend_local

```bash
cd backend_local
npm install
npm run dev       # node ./src/index.js
```

`npm test` exits with error (placeholder).
Single-test: not available.

### backend_dash

```bash
cd backend_dash
npm install
npm run dev       # nodemon --exec ts-node src/index.ts
```

`npm test` exits with error (placeholder).
Single-test: not available.

### cuki_api_ia (Bun)

```bash
cd cuki_api_ia
bun install
bun run index.ts  # same as npm start
bun --watch run index.ts
```

Single-test: no test runner configured.

### If/When Tests Are Added

- Jest/Vitest: `npm test -- <pattern>`
- Mocha: `npm test -- -g "pattern"`
- Bun: `bun test <pattern>`

Add the exact command to this file after installing a test framework.

## Code Style Guidelines (All Projects)

### Imports

- Use ESM `import`/`export` syntax.
- Group imports: external first, then internal, then relative.
- Keep imports ordered and remove unused imports.
- Prefer alias imports when configured (`@/` in labFrontend).

### Formatting

- Indentation: 2 spaces.
- Line length: keep near 100 chars; wrap before 120.
- Use trailing commas on multi-line objects/arrays.
- Use single quotes for JS/TS, backticks for templates.
- Keep JSX props wrapped and aligned when long.

### Types

- Avoid `any`; use `unknown` + narrowing or precise types.
- Exported functions and public module boundaries must be typed.
- Prefer `interface` for extendable object shapes, `type` for unions.
- Validate runtime input with `zod` when used in the project.

### Naming

- `camelCase`: variables, functions, hooks, file names for utilities.
- `PascalCase`: React components, classes, types, files for components.
- `SCREAMING_SNAKE_CASE`: constants.
- Avoid abbreviations except common ones (`id`, `req`, `res`).

### Error Handling

- Always handle async errors with `try/catch` or middleware.
- Do not swallow errors; log and return clear, user-safe messages.
- APIs return JSON error payloads with correct HTTP status codes.
- Never log secrets or tokens.

### State / Data

- Keep side effects isolated (React hooks, Express middleware).
- Prefer pure helpers in `utils/` where available.
- If a file grows too large, split into focused modules.

## Frontend Rules (labFrontend)

These are mandatory and come from `labFrontend/AGENTS.md`.

- One component per file; keep components under ~150 lines.
- New pages go in `labFrontend/src/pages/` and route in `App.tsx`.
- API calls only via `labFrontend/src/api/endpoints.ts`.
- Shared types live in `labFrontend/src/types/index.ts`.
- Use React Query for server state and Context for auth.
- TailwindCSS only; dark mode by default; `lab-*` palette.
- Use GSAP for complex animations.
- Use `@/` path aliases for imports.
- Use `getImageUrl()` for server images.

## Backend Rules (labBackend)

These are mandatory and come from `labBackend/AGENTS.md`.

- One file per resource (model/controller/route).
- Split controllers > ~200 lines into helpers in `utils/`.
- Auth: use `authenticate`, add `requireAdmin` for admin routes.
- Image processing goes through `utils/imageProcessing.ts`.
- Use Multer memory storage -> Sharp -> `uploads/`.
- All secrets in `.env`, loaded via `config/constants.ts`.

## Linting / TypeScript Notes

- Frontends use ESLint with TypeScript + React hooks rules.
- Keep `eslint` errors at 0 before committing changes.

## Cursor / Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` present.

## Updating This File

- If you add scripts, tools, or frameworks, update commands here.
- Prefer concise, copy-pasteable commands and real script names.
