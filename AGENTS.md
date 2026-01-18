# AGENTS.md

This file provides essential commands, code-style conventions, and guidelines for agentic coding agents operating in this repository. Follow these standards when making changes, writing features, or running validation tasks.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Build/Lint/Test Commands](#buildlinttest-commands)
    - [Frontend (frontend_react)](#frontend-frontend_react)
    - [Backend (backend_local)](#backend-backend_local)
    - [Backend (backend_dash)](#backend-backend_dash)
3. [Code Style Guidelines](#code-style-guidelines)
    - [Imports](#imports)
    - [Formatting](#formatting)
    - [Types](#types)
    - [Naming Conventions](#naming-conventions)
    - [Error Handling](#error-handling)
4. [Additional Notes](#additional-notes)

---

## Project Structure

- `frontend_react/` — React + TypeScript, Vite for build/dev, ESLint for linting
- `backend_local/` — Node.js (JavaScript), Express server
- `backend_dash/` — Node.js (JS/TS), Express server with TypeScript and nodemon

---

## Build/Lint/Test Commands

### Frontend (`frontend_react`)

- **Install Dependencies:**
  ```bash
  cd frontend_react && npm install
  ```
- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Lint Code:**
  ```bash
  npm run lint
  # Or run ESLint directly:
  npx eslint . --ext ts,tsx
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```
- **Testing:**
  - No testing script is present by default. Consider integrating Jest or Vitest if test coverage is required.

### Backend (`backend_local`)

- **Install Dependencies:**
  ```bash
  cd backend_local && npm install
  ```
- **Start in Development Mode:**
  ```bash
  npm run dev
  ```
- **Testing:**
  - No test or lint scripts are specified. Add as project grows.

### Backend (`backend_dash`)

- **Install Dependencies:**
  ```bash
  cd backend_dash && npm install
  ```
- **Start in Development Mode (TypeScript):**
  ```bash
  npm run dev
  # Underlying: nodemon --exec ts-node src/index.ts
  ```
- **Testing:**
  - No test script is currently defined. Add appropriate framework if test coverage is needed.

---

## Code Style Guidelines

### Imports
- Always use `import`/`export` syntax for ES modules (default in frontend, recommended in backend).
- Prefer absolute imports if supported by project config; use relative imports only within feature boundaries.
- Group all third-party imports first, followed by local modules.
- Remove unused imports and avoid wildcard imports unless strictly necessary.

### Formatting
- Use the formatting configured by your code editor (recommend VSCode + Prettier plugin).
- Maintain a consistent indentation (usually 2 spaces in JS/TS & React projects).
- Lines should be ≤ 100 characters where possible for readability.
- Add trailing commas to multiline objects and arrays where supported by linter/prettier rules.
- Prefer single quotes `'` for strings, unless interpolating or specified otherwise by the linter.

### Types
- Use TypeScript throughout the frontend and where possible in backends.
- Always prefer explicit types for function arguments, return values, and exported variables.
- Use type-safe validation (e.g., with Zod) for user or API input.
- Use interfaces for objects intended for extension or with multiple implementers; use `type` for unions or composition.
- Avoid using `any` unless absolutely necessary—prefer `unknown` and check types at the boundary.

### Naming Conventions
- Use `camelCase` for variables, functions, and non-component objects.
- Use `PascalCase` for component names, classes, and types/interfaces.
- Constants should use `SCREAMING_SNAKE_CASE` if shared, otherwise use `camelCase` in local scopes.
- Use descriptive, semantically meaningful names; avoid abbreviations except for contextually obvious terms (e.g., `id`, `req`, `res`).

### Error Handling
- Use try/catch blocks for async code (especially network or file operations).
- Always log errors with enough detail to identify root causes, but avoid exposing sensitive data.
- Surface user-facing error messages in the UI/response and detailed stack traces in development logs only.
- For REST APIs, return appropriate HTTP status codes and meaningful error messages in JSON.
- Never silently swallow exceptions.

---

## Linting and ESLint/TypeScript Integration (Frontend)
- ESLint configuration (`.eslintrc.cjs`) extends:
  - `eslint:recommended`
  - `plugin:@typescript-eslint/recommended`
  - `plugin:react-hooks/recommended`
- Additional ESLint suggestions (see `frontend_react/README.md`):
  - Enable `parserOptions.project` for type-aware lint rules.
  - Consider stricter configs: `plugin:@typescript-eslint/recommended-type-checked` or `strict-type-checked`.
  - Optionally, add `plugin:@typescript-eslint/stylistic-type-checked`.
  - Install and configure `eslint-plugin-react`.
- Ignore patterns: `/dist`, `.eslintrc.cjs`

---

## Agent-Specific Guidelines
- Always check for existing files before creating new ones.
- Suggest new lint/test setups if not present (especially for backend).
- If adding new dependencies or scripts, update the relevant `package.json`.
- If integrating with external APIs/services, use environment variables loaded via `dotenv`.

---

## Contributing & Project Expansion
- For significant changes, recommend creating or updating lint/test scripts in the backend codebases.
- Encourage use of end-to-end or component testing frameworks (e.g., Jest, Vitest, testing-library/react) as the project scales.
- Promptly document new conventions or scripts in this file.

---

_Keep AGENTS.md updated with relevant commands and conventions. This file is the single source of truth for automated or agent-driven development work in this repository._
