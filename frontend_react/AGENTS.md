# AGENTS.md — frontend_react

## Project Overview

Frontend application for the **Ilyzaelle** IoT SCADA/HMI platform (UNAB thesis project). This is a React SPA that allows users to:

- **Create and manage IoT projects** — each project connects to a gateway server with boards (Arduino, ESP32, HTTP, MQTT, FactoryIO controllers).
- **Monitor and control hardware in real time** via Socket.IO, with draggable dashboard components: charts, labels, inputs, toggles.
- **Build SCADA views** — drag components over a background image for visual process monitoring.
- **Edit board code** in-browser using Monaco Editor (VS Code's editor engine).
- **Generate AI-powered dashboards** — a chat interface sends prompts to the `cuki_api_ia` service, which returns standalone HTML dashboards with embedded Socket.IO client code.
- **Share public dashboards** — AI-generated dashboards are accessible via unique codes at `/shared/dashboard/:dashCode`.
- **Manage global variables (`gVar`)** — real-time variables polled every 500ms via Socket.IO.

The UI is in **Spanish**.

### Architecture

- **Views** (`src/views/`): Page-level components, one per route.
- **Components** (`src/components/`): Reusable UI components organized by domain (projects, boards, globalvars, dataVars, snippets, dashboard).
- **API layer** (`src/api/`): Centralized Axios-based HTTP functions per entity (ProjectApi, BoardApi, SnippetApi, DataVarApi).
- **Types** (`src/types/index.ts`): Zod schemas + derived TypeScript types for all entities and forms.
- **Context** (`src/context/SocketContext.tsx`): React Context providing Socket.IO instance, connection status, and RPC-like polling methods.
- **Hooks** (`src/hooks/`): `useSocket` for Socket.IO management, `useComponentManager` for dashboard component state.
- **Layouts** (`src/layouts/AppLayout.tsx`): Shared layout with header, footer, and toast notifications.

Entry point: `src/main.tsx` → React root with `QueryClientProvider` and `BrowserRouter`.

### Key Concepts

- **Server state**: TanStack Query (React Query v5) with `useQuery`/`useMutation` and query key invalidation.
- **Local persistent state**: `localStorage` for dashboard component layouts, unlocked API keys, and debug mode.
- **Modal pattern**: URL query parameter-based modals (e.g., `?newBoard=true`, `?newGlobalVar=true`).
- **Socket.IO rooms**: Keyed by `serverAPIKey`. Event naming: `f-b` = frontend-to-backend, `b-f` = backend-to-frontend. The `response-gVar-update-b-f` event carries `(data, serverAPIKey, projectId)` — listeners must filter by both `serverAPIKey` AND `projectId`.
- **Path aliases**: `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig.json`).

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5.2.2 |
| Framework | React | ^18.2.0 |
| Build Tool | Vite (SWC plugin) | ^5.0.0 |
| Routing | react-router-dom | ^6.20.1 |
| Server State | @tanstack/react-query | ^5.13.4 |
| Forms | react-hook-form | ^7.49.0 |
| Validation | Zod | ^3.22.4 |
| HTTP Client | Axios | ^1.6.2 |
| Real-time | socket.io-client | ^4.5.0 |
| UI Components | @headlessui/react | ^1.7.17 |
| Icons | @heroicons/react | ^2.0.18 |
| Code Editor | @monaco-editor/react | ^4.6.0 |
| Charts | Chart.js + react-chartjs-2 | ^4.3.2 / ^5.2.0 |
| Toasts | react-toastify | ^9.1.3 |
| CSS | Tailwind CSS | ^3.3.6 |
| CSS Processing | PostCSS + Autoprefixer | — |

---

## Setup Commands

```bash
# Install dependencies
npm install

# Start development server (Vite with HMR)
npm run dev

# Preview production build locally
npm run preview
```

### Environment Variables

Create a `.env.local` file in the project root with:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL (e.g., `https://undercromo.dev/api`) |
| `VITE_SOCKET_SERVER` | Socket.IO server URL (e.g., `https://undercromo.dev`) |
| `VITE_CUKI_IA_API` | AI API endpoint for dashboard generation (e.g., `https://undercromo.dev/cukiAPI`) |

All variables must be prefixed with `VITE_` to be accessible via `import.meta.env`.

---

## Build & Test Instructions

### Build

```bash
# Type-check with TypeScript, then build for production
npm run build
```

This runs `tsc && vite build`. Output goes to `dist/`.

### Test

There is **no testing framework** configured. No test files, no test dependencies, no test scripts.

### Lint

```bash
# Lint all .ts/.tsx files (zero-warning tolerance)
npm run lint
```

Runs ESLint with `@typescript-eslint`, `react-hooks`, and `react-refresh` plugins. Configuration is in `.eslintrc.cjs`.

---

## Code Style Guidelines

- **TypeScript strict mode** is enabled (`tsconfig.json`): `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- **Tailwind CSS only** — All styling is done via Tailwind utility classes in JSX. There are no custom CSS files, CSS modules, or CSS-in-JS. Do not introduce other styling approaches.
- **Path aliases** — Use `@/` imports (e.g., `@/components/Logo`, `@/api/ProjectApi`). Do not use relative paths like `../../`.
- **API layer** — All HTTP calls go through the centralized functions in `src/api/`. Do not make Axios calls directly from components.
- **Zod schemas** — Entity types are defined as Zod schemas in `src/types/index.ts` with inferred TypeScript types. Use `safeParse` for API response validation.
- **TanStack Query** — All server state uses `useQuery`/`useMutation`. Do not use `useState` + `useEffect` for data fetching.
- **react-hook-form** — All forms use `react-hook-form` with Zod resolvers. Do not use uncontrolled forms or manual state management for form data.
- **Component organization** — Views (pages) go in `src/views/`, reusable components in `src/components/` organized by domain subdirectory.

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `DashboardView` | Home: project list with API key unlock |
| `/projects/create` | `CreateProjectView` | Create new project |
| `/projects/:projectId` | `ProjectDetailsView` | Project detail (boards, data vars) |
| `/projects/:projectId/edit` | `EditProjectView` | Edit project |
| `/projects/:projectId/dashboard` | `ProjectDashboardView` | Real-time dashboard |
| `/projects/:projectId/dashboard-zone` | `DashboardZoneView` | HMI & SCADA builder |
| `/projects/:projectId/boards/:boardId/code-editor` | `CodeEditorBoardView` | Monaco code editor |
| `/projects/:projectId/ai-dashboard` | `AIDashboardView` | AI dashboard generator (Cuki chat) |
| `/shared/dashboard/:dashCode` | `PublicDashboardView` | Public standalone dashboard |

---

## Guardrails

- **NEVER commit `.env.local` or files containing API keys/URLs with embedded credentials.** The `.gitignore` already excludes `*.local` files.
- **Do not modify Socket.IO event names** without coordinating with `backend_dash` and `backend_local` — they rely on exact event name matching.
- **Do not remove or rename Zod schemas** in `src/types/index.ts` without updating all API functions and components that depend on them.
- **Do not introduce new CSS approaches** — stick to Tailwind utility classes. No CSS modules, styled-components, or inline `style` objects.
- **Do not bypass TanStack Query** for data fetching — all server state must go through `useQuery`/`useMutation` for cache consistency.
- **The `@` path alias must be maintained** in both `vite.config.ts` and `tsconfig.json` — changing one without the other will break either runtime or type checking.
- **The lint script has `--max-warnings 0`** — any ESLint warning will cause the command to fail. Do not downgrade errors to warnings to bypass this.
- **Dashboard component state is persisted to localStorage** — changes to the component data structures in `useComponentManager` / `componentStorage.ts` may break existing saved dashboards for users.

---

## Recent Changes

### Socket & Data Flow Fixes
- **`ProjectDashboardView.tsx`**: `response-gVar-update-b-f` handler now filters by both `serverAPIKey` AND `projectId` (previously only `serverAPIKey`). Fixes bug where two projects from the same gateway would see each other's data. Removed unused `StatusBoardLocalModal` import and dead `handleNoServer` function.
- **`AIDashboardView.tsx`**: Same `response-gVar-update-b-f` filter fix (both `useEffect` handler and AI system prompt template code).
- **`SaveGlobalVarModal.tsx`**: Removed dead `socket.emit('request-gVar-update-f-b', projectId)` that was missing `serverAPIKey` and never produced a response. The handler relied on the existing 500ms polling from `ProjectDashboardView`. Added `serverAPIKey` + `projectId` filter to the handler. Removed unused `useEffect` import.

### UI/UX & Mobile Responsiveness
- **`DashboardZoneView.tsx`**: Mobile responsive action buttons.
- **`GlobalVarList.tsx`**: Horizontal scroll fix for variable tables.
- **`DataVarList.tsx`**: Horizontal scroll fix + date format change + refactored from `localStorage` to props for passing time vector data to `DataVarChartModal`.
- **`CodeEditorForm.tsx`**: Mobile responsive header layout.
- **`ProjectDashboardView.tsx`**: Gateway API key display added to project header.
- **`ProjectDetailsView.tsx`**: `overflow-hidden` fix.
- **`ScadaDraggableComponent.tsx`**: Touch event support for mobile SCADA interaction.

### Chart & Data Visualization
- **`DataVarChartModal.tsx`**: Introduced `ScrollableChart` component. Removed `localStorage` usage (now receives time data via props). Added `Math.min` alignment fix for Y data vs time vector length mismatch.
- **`ScrollableChart.tsx`**: New component with `title` and `baseEarliestTime` props.

### Refactoring & Cleanup
- **`useComponentManager.ts`**: Consolidated two duplicate SCADA loading `useEffect` hooks into one with complete validation (checks `id`, `position`, numeric types). Removed `console.log`.
- **`componentStorage.ts`**: Added `clearComponents(projectId, 'toggles')` to `clearAllComponents()` — was previously missing, leaving orphaned localStorage keys. Removed `console.log`.
- **`Input.tsx` / `ScadaInputComponent.tsx`**: Fixed leading-zero bug — changed `useState<number>` to `useState<string>`, converting to number only on submit. Typing `120` no longer shows `0120`.
- **`ScadaBackground.tsx`**: Removed debug `console.log`.
- **`Chart.tsx`**: Removed debug `console.log`.

### Fullscreen View Fixes & Code Editor Improvements
- **`main.tsx`**: Removed `ReactQueryDevtools` import and `<ReactQueryDevtools />` component. Uninstalled `@tanstack/react-query-devtools` package. ReactQueryDevtools rendered as a sibling inside `#root`, adding DOM content that caused unwanted scroll on fullscreen views.
- **`AIDashboardView.tsx`**: Changed root container from `h-dvh` to `fixed inset-0` (viewport-fixed, ignores siblings/document flow). Added `useLayoutEffect` + `rootRef` + `window.visualViewport.resize` listener to keep the input bar above the mobile virtual keyboard.
- **`CodeEditorBoardView.tsx`**: Changed root container from `h-dvh` to `fixed inset-0`. Added `useQuery` to fetch project data by `projectId` and `useEffect` to call `setServerAPI(projectData.serverAPIKey)` — this was missing, so the socket never connected and `pollingCodesViaSocket` always failed. Added a dog icon button (placeholder, no function yet) to the top bar, left of the console toggle.
- **`CodeEditorModal.tsx`**: Renamed "Ejecutar" button text to "BURN". Changed "Guardar" button to icon-only (removed text, changed padding from `px-5 py-2` to `p-2`, added `title="Guardar"`). Removed 3 debug `console.log`/`console.error` statements.

### Console, Toast & AI Prompt Fixes
- **`Console.tsx`**: Refactored from self-contained component (internal socket listener + state) to presentational component receiving `lines: string[]` and `onClear: () => void` as props. No longer manages its own state — log accumulation is handled by the parent.
- **`CodeEditorBoardView.tsx`**: (1) Lifted console log accumulation to parent — socket listener for `response-server-log-b-f` runs regardless of console visibility, logs persist when console is toggled off. (2) Added `useLayoutEffect` + `rootRef` + `window.visualViewport.resize` listener for mobile keyboard adaptation (same pattern as `AIDashboardView`). (3) Auto-closes console panel when mobile keyboard opens (viewport < 85% of `innerHeight`). (4) Added `<ToastContainer />` — was missing because the view is outside `AppLayout` which is the only place `ToastContainer` was rendered. Toast calls from `CodeEditorModal` (BURN/save) queued internally but never appeared.
- **`AIDashboardView.tsx`**: Restored expanded AI system prompt (was previously minified to save tokens, but caused AI to rewrite boilerplate with bugs). Three fixes applied: (1) `response-gVar-update-b-f` handler now filters by both `serverAPIKey` AND `projectId` (3-arg signature). (2) Added "VECTORES DE TIEMPO PARA ARRAYS" section documenting `_time` suffix convention so AI uses real time vectors when graphing arrays. (3) Added explicit "COPIA EXACTAMENTE" instruction — AI must paste the boilerplate verbatim and only implement `onDataReceived(data)` body.

### Mobile Scroll Lock for Fullscreen Views
- **`CodeEditorBoardView.tsx`**: Added `touchmove` event listener on `document` that calls `preventDefault()` for touch gestures outside scrollable children (Monaco editor, console). Walk up the DOM from `event.target` — if any ancestor has `scrollHeight > clientHeight` or is a `.monaco-scrollable-element`, allow natural scroll; otherwise block it. Also added `overscroll-none touch-manipulation` Tailwind classes to the root container. Replaces a previous `body overflow:hidden / position:fixed` approach that did not work on mobile browsers.
- **`AIDashboardView.tsx`**: Same `touchmove` prevention pattern applied — blocks page-level scroll escape while allowing scroll inside the chat container and textarea.

### Cuki Code Assistant (Code Editor AI Chat)
- **`CukiChat.tsx`** (NEW): Reusable ephemeral chat component in `src/components/cuki/`. Accepts props: `getSystemPrompt()` (called on every send), `onAIResponse(fullText)` (callback after streaming), `placeholder`, `emptyTitle`, `emptyDescription`, `inputBarExtra`, `chatContainerRef`. Manages its own message state, streaming, errors, retry. Uses `CukiMessage` for rendering assistant responses. Calls `VITE_CUKI_IA_API` with streaming. No backend persistence (ephemeral).
- **`CukiMessage.tsx`** (UPDATED): Now supports multiple marker pairs: `---INICIOHTML---`/`---FINHTML---` (label "HTML generado:") and `---INICIOCODE---`/`---FINCODE---` (label "Codigo generado:"). Uses a generic `MARKERS` array with earliest-match scanning. Segment type renamed from `"html-raw"` to `"code-raw"` with dynamic label.
- **`CodeEditorBoardView.tsx`** (MAJOR UPDATE): 
  - Dog icon button now toggles `CukiChat` panel (was placeholder).
  - Chat panel layout: desktop shows as 1/3 width side panel to the right (`md:w-1/3 md:min-w-[280px] md:max-w-[400px]`); mobile shows as fullscreen overlay (`fixed inset-0 z-50`) with close button. Panel uses `hidden`/`flex` toggle (not mount/unmount) to preserve chat state.
  - System prompt for Firmata.js/Arduino context: includes current code, board type, explains `board`/`varG`/`gVar` are pre-defined, instructs AI to return full code between `---INICIOCODE---`/`---FINCODE---` markers.
  - `onAIResponse` callback extracts code from markers and sets `proposedCode` state.
  - When `proposedCode` is set, the regular Monaco `Editor` swaps to `DiffEditor` (inline mode, read-only) showing original vs proposed code with green/red diff highlights.
  - Purple banner appears above editor with "Aceptar" (applies proposed code) and "Rechazar" (discards) buttons.
  - BURN and Save buttons use `proposedCode ?? code` so executing during diff review uses the proposed code.
  - Editor changed from `defaultValue` to controlled `value={code}` prop to reflect accepted changes immediately.

### Cuki Code Assistant Bug Fixes (Bugs 1-7)
- **`CodeEditorBoardView.tsx`** — System prompt rewrite: removed all johnny-five references, added explicit "API FIRMATA DISPONIBLE" section listing valid `board.*` methods, added "FUNCIONES Y METODOS PROHIBIDOS" section forbidding `board.loop()`, `board.wait()`, `new five.*`. Added "INICIALIZACION DE VARIABLES GLOBALES" section showing correct `varG.x = 0` pattern and forbidding `typeof` guard checks. Changed empty state description to "Describe lo que necesitas y te ayudo a programar tu controlador."
- **`CodeEditorBoardView.tsx`** — `extractCodeFromResponse()` now strips markdown fenced code block wrapping (```` ``` ````) after extracting from `---INICIOCODE---`/`---FINCODE---` markers.
- **`CodeEditorBoardView.tsx`** — Chat blocked during diff review: passes `disabled={proposedCode !== null}` and `disabledMessage` to CukiChat. On rejection, sets `rejectionNote` state which is passed as `contextNote` prop — prepended as `[NOTA DEL SISTEMA: ...]` to the next user message.
- **`CodeEditorBoardView.tsx`** — Board-level chat persistence: added `useQuery` for `getBoardAIChatHistory`, `handleMessagesChange` callback (calls `addBoardAIChatMessages` with full array), `handleClearChatHistory` callback. All three props now wired to `<CukiChat>` JSX: `initialMessages`, `onMessagesChange`, `onClearHistory`.
- **`CukiChat.tsx`** — Changed `buildContext()` from sliding window (`messages.slice(-contextWindowSize)`) to exact 3-message pattern: previous user message → last assistant message → current user message. Removed `contextWindowSize` prop.
- **`CukiChat.tsx`** — Added `disabled`, `disabledMessage` props to block input during diff review. Added `contextNote` and `onContextNoteConsumed` props for rejection context injection.
- **`CukiChat.tsx`** — Added `initialMessages`, `onMessagesChange`, `onClearHistory` props for optional persistence. Uses `initializedRef` to load history once. Calls `onMessagesChange` inside the `setMessages` updater after assistant message is added. Calls `onClearHistory` in `handleNewChat`.
- **`BoardApi.ts`** — Added `BoardAIChatMessage` type, `getBoardAIChatHistory`, `addBoardAIChatMessages`, `clearBoardAIChatHistory` API functions for board-level chat persistence.

### Cuki Code Assistant Bug Fixes (Bugs 1-5, Session 2)
- **`CukiChat.tsx`** — **Bug 1 (textarea not visible on first load)**: Removed the `useLayoutEffect` + `rootRef` + `visualViewport.resize` handler that was incorrectly setting `rootRef.style.height` to the full viewport height. CukiChat is a nested component, not a root view — setting full viewport height caused overflow and pushed the textarea out of view. CukiChat now relies purely on CSS `h-full` from its parent. Removed `useLayoutEffect` from imports.
- **`CukiChat.tsx`** — **Bug 5 (debug token logging)**: Added `estimateTokens(text)` utility (averages `length/4` char-based and `words*1.3` word-based) and `calculateTotalTokens(messages)` (sums per-message + 4 token overhead each). Added `console.group` debug logging before API call (per-message token breakdown, total input tokens) and after streaming completes (output tokens, total input+output). Matches AIDashboardView pattern.
- **`CodeEditorBoardView.tsx`** — **Bug 3 (chat not saving / 500 errors)**: Fixed `initialMessages` data shape — changed `chatHistory?.AIChatHistory?.map(...)` to `chatHistory?.map(...)` because `getBoardAIChatHistory()` in `BoardApi.ts` already unwraps the response (returns the array directly, not `{ AIChatHistory: [...] }`). The double-unwrap always resolved to `undefined`, so chat history never loaded on refresh.
- **`CodeEditorBoardView.tsx`** — **Bug 4 (mobile chat keyboard)**: Added `chatOverlayRef` on the mobile chat overlay container (`fixed inset-0 z-50`). The existing `useLayoutEffect` viewport resize handler now updates BOTH `rootRef` AND `chatOverlayRef` heights on `visualViewport.resize`. Added `chatContainerRef` passed to CukiChat for auto-scroll on keyboard open, using `requestAnimationFrame` for reliable scroll timing (matching AIDashboardView pattern).

### Cuki Code Assistant Bug Fixes (Session 3)
- **`CodeEditorBoardView.tsx`** — **Chat panel disappears on second navigation (desktop)**: Added `md:min-h-0 md:overflow-hidden` to the chat overlay div so it respects flex constraints on desktop. The `useLayoutEffect` viewport resize handler now only sets inline `style.height` on the chat overlay when it's in `fixed` position (mobile); on desktop (`md:static`), it clears the inline height to let flexbox handle it. Moved code initialization from inline state-during-render to `useEffect` to avoid re-render timing issues with cached TanStack Query data.
- **`BoardController.ts`** — **500 VersionError on second chat save**: Changed `addAIChatMessages` and `clearAIChatHistory` from `req.board.set()` + `req.board.save()` to `Board.findByIdAndUpdate()` with `$set`. The `boardExist` middleware loads `req.board` with a version number; rapid saves (BURN + chat) increment the DB version, making the stale `req.board` cause `VersionError` on `.save()`. Atomic `findByIdAndUpdate` bypasses Mongoose optimistic concurrency entirely.
- **`router.tsx`** — **Vite public dir collision**: Renamed frontend route from `/public/dashboard/:dashCode` to `/shared/dashboard/:dashCode`. Updated all frontend links in `AIDashboardView.tsx` and `DashboardZoneView.tsx`. Backend API endpoint `/api/public/dashboard/:dashCode` unchanged (not affected — it's an API call via axios, not a frontend route).
- **`CukiChat.tsx`** — **Debug logging improvement**: System prompt log now shows embedded code length (`codigo embebido: N chars`) to confirm the editor code is included in the AI context.

### Cuki Code Assistant Bug Fixes (Session 4)
- **`CodeEditorBoardView.tsx`** — **Chat history not loading on re-entry**: Added `useQueryClient` import and `queryClient.setQueryData(['boardChatHistory', boardId], ...)` calls in both `handleMessagesChange` (syncs full message array to cache after each exchange) and `handleClearChatHistory` (sets cache to `[]`). Root cause: `onMessagesChange` saved messages to backend but did NOT update the TanStack Query cache. On re-entry, TanStack Query served stale cached data (empty/partial) immediately, CukiChat's `initializedRef` loaded it, then background refetch returned fresh data but `initializedRef` was already `true` — blocking the update. With cache kept in sync, re-entry gets correct data from cache on mount. No changes needed in CukiChat — `initializedRef` pattern is correct once cache stays current.
- **`CodeEditorBoardView.tsx`** — **Empty-content messages defense**: `handleMessagesChange` now filters out messages with `content.trim() === ''` before persisting to backend and cache. Prevents empty chat messages from entering the DB (which would cause Mongoose `required: true` validation failures on any subsequent `req.board.save()` call).
- **`CukiChat.tsx`** — **Empty AI response guard**: After streaming completes, checks `fullText.trim()`. If empty, throws an error (`'La IA devolvio una respuesta vacia'`) instead of saving an empty assistant message. This prevents the root cause of the `AIChatHistory.N.content: Path 'content' is required` validation error chain.
