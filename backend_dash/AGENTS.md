# AGENTS.md — backend_dash

## Project Overview

Cloud-hosted backend API and real-time WebSocket relay server for the **Ilyzaelle** IoT/SCADA platform (UNAB thesis project). This service is the central hub in a three-tier architecture:

- **REST API** (Express): Full CRUD for Projects, Boards, DataVars, Snippets, AI-generated dashboards (HTML), and AI chat history.
- **WebSocket Relay** (Socket.IO): Acts as a broker between frontend clients and `backend_local` instances. Routes messages via rooms keyed by `serverAPIKey`.
- **Public Dashboard Access**: Serves AI-generated HTML dashboards via unique 8-character hex codes without authentication.

### Architecture

The project follows an **MVC pattern**:

- `src/models/` — Mongoose schemas and TypeScript interfaces (Project, Board, DataVar, Snippet).
- `src/controllers/` — Static class methods handling business logic.
- `src/routes/` — Express Router files mapping endpoints to controller methods with validation middleware.
- `src/middleware/` — Reusable middleware for input validation (`express-validator`) and entity existence checks. Augments `Express.Request` via TypeScript declaration merging.
- `src/config/` — Server setup (`ServerApp` class), MongoDB connection, CORS config, and Socket.IO handler (`Sockets` class).

Entry point: `src/index.ts` → instantiates `ServerApp` and calls `execute()`.

### Key Concepts

- **Nested Resource Routing**: Boards and DataVars are nested under Projects (`/api/projects/:projectId/boards`, `/api/projects/:projectId/datavars`).
- **Relay/Broker Pattern**: The Socket.IO server relays events between frontend (`f-b` suffix) and backend_local (`b-b` suffix) using room-based routing.
- **`connectedServers` Set**: Tracks which `backend_local` instances are currently online.
- **Per-project gVar routing**: The `response-gVar-update-b-f` event includes both `serverAPIKey` and `projectId` so frontend tabs can filter responses per-project (not just per-gateway). This prevents data cross-contamination when multiple projects sharing the same gateway are open simultaneously.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5.3.3 |
| Runtime | Node.js | — |
| Framework | Express.js | ^4.18.2 |
| Database | MongoDB Atlas (cloud) via Mongoose | ^8.0.3 |
| Real-time | Socket.IO (server) | ^4.5.0 |
| Validation | express-validator | ^7.0.1 |
| Logging | morgan | ^1.10.0 |
| Env Config | dotenv | ^16.4.7 |
| TS Execution | ts-node | ^10.9.1 |
| Dev Server | nodemon | ^3.0.2 |

---

## Setup Commands

```bash
# Install dependencies
npm install

# Start development server (with hot-reload via nodemon + ts-node)
npm run dev
```

The server listens on the port defined in `.env` (`PORT`, default `3030`).

### Environment Variables

Create a `.env` file in the project root with:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `PORT` | HTTP server listen port (default: `3030`) |
| `FRONTEND_URL` | Frontend origin URL (currently unused — CORS is set to `"*"`) |

---

## Build & Test Instructions

### Build

There is **no build script** configured. The project runs exclusively via `ts-node` in development mode. The `tsconfig.json` defines `outDir: ./dist` but no `tsc` compilation step is wired up.

### Test

There is **no testing framework** configured. The `test` script is a placeholder:

```bash
npm test  # outputs "Error: no test specified" and exits
```

### Lint

There are **no linting or formatting tools** configured (no ESLint, Prettier, etc.).

---

## Code Style Guidelines

- **TypeScript** with `strict: false` in `tsconfig.json`. Target: ESNext, Module: NodeNext.
- **Controllers** use static class methods (no instantiation).
- **Middleware** augments `Express.Request` using `declare global` TypeScript declaration merging to attach entities like `req.project`, `req.board`, `req.dataVar`, `req.snippet`.
- **Route validation** uses `express-validator` with a shared `handleInputErrors` middleware.
- **Database models** use Mongoose schemas with TypeScript interfaces exported alongside them (e.g., `IProject`, `IBoard`).
- **Socket events** follow the naming convention: `request-<action>-f-b` (frontend → backend) and `response-<action>-b-b` (backend_local → backend_dash → frontend).

---

## Socket.IO Event Signatures

Key relay events handled in `src/config/sockets.ts`:

| Direction | Event | Signature |
|---|---|---|
| frontend → backend_dash | `request-gVar-update-f-b` | `(projectId, clientServerAPIKey)` |
| backend_dash → backend_local | `request-gVar-update-b-b` | `(projectId)` |
| backend_local → backend_dash | `response-gVar-update-b-b` | `(data, projectId)` |
| backend_dash → frontend | `response-gVar-update-b-f` | `(data, serverAPIKey, projectId)` |

**Important**: The `response-gVar-update-b-f` event includes `projectId` as the third argument. All frontend listeners must filter by both `serverAPIKey` AND `projectId` to prevent cross-project data leaks when multiple projects share the same gateway.

---

## API Endpoints

### Projects (`/api/projects`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create project |
| GET | `/` | Get all projects |
| GET | `/:projectId` | Get project by ID (populated) |
| PUT | `/:projectId` | Update project |
| POST | `/:projectId/status` | Update project status |
| DELETE | `/:projectId` | Delete project |
| POST | `/:projectId/aidash` | Save AI dashboard HTML |
| GET | `/:projectId/aidash` | Get AI dashboard |
| POST | `/:projectId/aidash-with-code` | Save AI dashboard + generate access code |
| GET | `/:projectId/ai-chat-history` | Get AI chat history |
| POST | `/:projectId/ai-chat-history` | Add chat message |
| POST | `/:projectId/ai-chat-history/bulk` | Add multiple chat messages |
| DELETE | `/:projectId/ai-chat-history` | Clear chat history |

### Boards (`/api/projects/:projectId/boards`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create board |
| GET | `/` | Get project boards |
| GET | `/:boardId` | Get board by ID |
| PUT | `/:boardId` | Update board |
| POST | `/:boardId/active` | Update active status |
| POST | `/:boardId/code` | Update board code |
| DELETE | `/:boardId` | Delete board |
| GET | `/:boardId/ai-chat-history` | Get board AI chat history |
| POST | `/:boardId/ai-chat-history` | Replace board AI chat history (bulk) |
| DELETE | `/:boardId/ai-chat-history` | Clear board AI chat history |

### DataVars (`/api/projects/:projectId/datavars`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create data variable |
| GET | `/` | Get project data variables |
| GET | `/:dataVarId` | Get data variable by ID |
| DELETE | `/:dataVarId` | Delete data variable |

### Snippets (`/api/snippets`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create snippet |
| GET | `/` | Get all snippets |
| GET | `/:snippetId` | Get snippet by ID |
| PUT | `/:snippetId` | Update snippet |
| POST | `/:snippetId/busy` | Update busy status |
| DELETE | `/:snippetId` | Delete snippet |

### Public (`/api/public`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/:dashCode` | Get public dashboard by code |

---

## Guardrails

- **NEVER commit `.env` files or hardcoded credentials** (database connection strings, API keys, passwords). If an `.env.example` is needed, use placeholder values only.
- **Do not modify CORS configuration** to restrict origins without coordinating with the frontend and backend_local deployments.
- **Do not remove or rename Socket.IO event names** without updating both `frontend_react` and `backend_local` — they rely on exact event name matching (e.g., `request-gVar-update-f-b`).
- **Maintain the nested resource routing pattern** — Boards and DataVars are always scoped under a Project.
- **Do not break the `serverAPIKey`-based room routing** in `src/config/sockets.ts` — it is the core mechanism for isolating communication between different project instances.
- **Mongoose schemas have no migration system** — schema changes take effect on next document write. Be careful with destructive schema changes (removing fields, renaming collections).
- **No authentication layer exists** — there is no user auth, JWT, or session management. The `serverAPIKey` is the only access control mechanism.

---

## Recent Changes

- **`src/config/sockets.ts`**: `response-gVar-update-b-f` now forwards `projectId` (third argument) to the frontend. Previously only sent `serverAPIKey`, causing data cross-contamination when two projects from the same gateway were open simultaneously.
- **`src/config/sockets.ts`**: Removed debug `console.log` statements from socket event handlers.

### Board-level AI Chat History
- **`src/models/Board.ts`**: Added `IAIChatMessage` interface and `AIChatHistory` embedded subdocument array field to the Board schema. Each message stores `role` (user/assistant), `content`, and `timestamp`.
- **`src/controllers/BoardController.ts`**: Added three static methods: `getAIChatHistory` (returns `req.board.AIChatHistory`), `addAIChatMessages` (replaces entire chat history — receives full messages array, clears existing and writes new), `clearAIChatHistory` (sets `AIChatHistory` to empty array). Both `addAIChatMessages` and `clearAIChatHistory` use `Board.findByIdAndUpdate()` with `$set` to bypass Mongoose optimistic concurrency — `req.board` from middleware becomes stale after concurrent writes (e.g. BURN + chat save), causing `VersionError` on `.save()`. Retained `console.log` error logging in `addAIChatMessages` for debugging.
- **`src/routes/projectRoutes.ts`**: Added 3 routes under `/:projectId/boards/:boardId/ai-chat-history` — GET (retrieve), POST (bulk replace), DELETE (clear). Uses existing `boardExist` and `boardBelongsToProject` middleware via `router.param`.

### Board controller — eliminate req.board.save() pattern
- **`src/controllers/BoardController.ts`** — `updateCode`, `updateActive`, `updateBoard`: Changed from `req.board.save()` to `Board.findByIdAndUpdate()` with `$set`. The old pattern ran full-document Mongoose validation on `.save()`, which failed with `AIChatHistory.N.content: Path 'content' is required` if any chat message had empty content (empty strings fail `required: true`). Since `addAIChatMessages` uses `findByIdAndUpdate` (which skips validators by default), empty-content messages could slip into the DB undetected, then break all subsequent `.save()` calls on that board. `findByIdAndUpdate` with `$set` updates only the targeted field without validating unrelated fields.
- **`src/controllers/BoardController.ts`** — `updateCode`, `updateActive`: Added `res.status(500).json(...)` in catch blocks. Previously only had `console.log(error)` with no response, causing HTTP connections to hang until nginx returned 504 Gateway Timeout.
