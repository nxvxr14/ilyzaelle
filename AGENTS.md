# AGENTS.md

This file provides essential commands, code-style conventions, and guidelines for agentic coding agents operating in this repository. It is the single source of truth for any coding automation or agent-based work—keep it up-to-date with any new conventions, scripts, or standards.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Build/Lint/Test Commands](#buildlinttest-commands)
    - [frontend_react](#frontend-frontend_react)
    - [backend_local](#backend-backend_local)
    - [backend_dash](#backend-backend_dash)
    - [cuki_api_ia](#cuki-api-ia)
    - [How to Run a Single Test](#how-to-run-a-single-test)
3. [Code Style Guidelines](#code-style-guidelines)
    - [Imports](#imports)
    - [Formatting](#formatting)
    - [Types](#types)
    - [Naming Conventions](#naming-conventions)
    - [Error Handling](#error-handling)
4. [Linting and TypeScript (Frontend)](#linting-and-typescript-frontend)
5. [Agent-Specific Guidelines](#agent-specific-guidelines)
6. [Contributing & Expansion](#contributing--expansion)
7. [Cursor / Copilot Rules](#cursor--copilot-rules)

---

## Project Structure

- `frontend_react/` — React + TypeScript, Vite for build/dev, ESLint for linting
- `backend_local/` — Node.js (JavaScript), Express server
- `backend_dash/` — Node.js (JS/TS), Express server with TypeScript and nodemon
- `cuki_api_ia/` — Bun runtime (TypeScript), standalone API agent

_No monorepo-wide test/lint/build commands exist; use each project's package manager and scripts._

---

## Build/Lint/Test Commands

### frontend_react
- **Install:**
  ```bash
  cd frontend_react && npm install
  ```
- **Start Dev Server:**
  ```bash
  npm run dev
  ```
- **Build:**
  ```bash
  npm run build
  ```
- **Lint:**
  ```bash
  npm run lint
  # Or directly:
  npx eslint . --ext ts,tsx
  ```
- **Preview:**
  ```bash
  npm run preview
  ```
- **Test:**
  _No default test script. Recommend adding Jest or Vitest for robust testing._

### backend_local
- **Install:**
  ```bash
  cd backend_local && npm install
  ```
- **Dev:**
  ```bash
  npm run dev
  ```
- **Test:**
  _No real test or lint script; recommend adding as project grows (e.g., Mocha/Jest and ESLint)._

### backend_dash
- **Install:**
  ```bash
  cd backend_dash && npm install
  ```
- **Dev (TypeScript):**
  ```bash
  npm run dev
  # Runs: nodemon --exec ts-node src/index.ts
  ```
- **Test:**
  _No current test script; recommend adding test framework and script._

### cuki_api_ia
- **Install:**
  ```bash
  cd cuki_api_ia && bun install
  ```
- **Run:**
  ```bash
  bun run index.ts
  ```
- **Dev:**
  ```bash
  bun --watch run index.ts
  ```
- **Test/Lint:**
  _No scripts by default; recommend Bun-compatible test framework._

---

### How to Run a Single Test
- _No projects currently have test runners set up. When test support is added, follow these typical patterns:_
  - **Jest/Vitest**: `npm test -- <pattern>`
  - **Mocha**: `npm test -- -g "pattern"`
  - **Bun test**: `bun test <pattern>`
  - _For example:_
    ```bash
    npm test -- userService    # Run tests for a file or test case containing 'userService'
    npm test -- -t "should render"   # Run Jest test with exact name match
    bun test login
    ```
- _Recommend documenting here the exact command once a framework is installed._

---

## Code Style Guidelines

### Imports
- Always use `import`/`export` ES module syntax.
- Prefer absolute imports via project config and path aliases (e.g., `@/components/*` in frontend_react with `tsconfig.json`).
- Group third-party imports first, then local imports; remove unused or wildcard imports.
- For new files, check for use of path aliases in tsconfig/json.

### Formatting
- 2-space indentation everywhere (JS/TS, React, etc).
- Lines ≤ 100 characters recommended.
- Trailing commas on multi-line arrays/objects where supported.
- Prefer single quotes `'`, except when using template literals.
- Always enable and use Prettier (via plugin or CLI; recommend VSCode extension).

### Types
- Use TypeScript throughout frontend and, where feasible, in all backend projects.
- Prefer explicit types for any exported function/module boundary.
- Use Zod or similar runtime schema for validating user/API input.
- `interface` for objects to extend; `type` for unions/intersections.
- Avoid `any`—prefer `unknown` and proper guards.
- Inherit/extend strict TS settings (e.g., `noUncheckedIndexedAccess`, strict null checks) as much as practical.

### Naming Conventions
- `camelCase` for variables, functions, props, regular parameters.
- `PascalCase` for React components, type/interface names, and classes.
- `SCREAMING_SNAKE_CASE` for global/shared constants.
- Be descriptive and semantic; no cryptic abbreviations except for widely understood terms (`id`, `req`, `res`).

### Error Handling
- Always wrap async code in try/catch blocks.
- Log errors with diagnostic details (avoid leaking sensitive data).
- Return user-facing errors in UI/API response, put stack traces and internal error details only in logs.
- REST: use correct HTTP status codes and JSON error response bodies.
- Never silently swallow exceptions—handle, log, or propagate them.

---

## Linting and TypeScript (Frontend)
- ESLint config (`.eslintrc.cjs`) extends:
  - `eslint:recommended`
  - `plugin:@typescript-eslint/recommended`
  - `plugin:react-hooks/recommended`
  - Plugin: `react-refresh/only-export-components` (for HMR safety)
- Suggestions for stricter linting (see `frontend_react/README.md`):
  - Add `parserOptions.project` and enable type-aware lint rules.
  - Use stricter configs: `plugin:@typescript-eslint/recommended-type-checked` or `strict-type-checked`.
  - Optionally include `plugin:@typescript-eslint/stylistic-type-checked`.
  - Install and extend with `eslint-plugin-react`.
- Ignore patterns: `/dist`, `.eslintrc.cjs`

---

## Agent-Specific Guidelines
- Always check for existing files before creating new files.
- Whenever adding new lint/test/formatting scripts, document the commands and update the relevant `package.json`.
- Always leverage `.env` for API keys, secrets, and all external credentials (never hardcode in code or configs).
- If adding support for a new dependency, script, or environment, update both code and this documentation accordingly.
- Refer to this file for any automation or code standard questions.

---

## Contributing & Expansion
- For significant changes: recommend updating and documenting lint/test scripts in the relevant sub-project (especially for backend and Bun-based projects).
- Encourage adoption of test (Jest/Vitest/Mocha/Bun, etc.), lint, and formatting as projects mature.
- When adding a test runner, include explicit instructions on how to run a single test and update this document immediately.
- Use end-to-end/component testing frameworks (e.g., Jest, Vitest, testing-library/react, Cypress) as project needs grow.
- Keep naming, formatting, and error handling crisp, consistent, and as strict as reasonable; favor explicitness and safety.

---

## Cursor / Copilot Rules
- No Cursor or Copilot custom rules currently exist in this repository.
- If files such as `.github/copilot-instructions.md`, `.cursor/rules/`, or `.cursorrules` are added, include a summary or direct reference to their standards here.

---

_Keep AGENTS.md up to date—this is the single source of truth for automated or agent-driven development work in this repository._
