# AGENTS.md — backend_local

## Project Overview

Local IoT hardware bridge server for the **Ilyzaelle** platform. This service runs on the same machine as the physical hardware and acts as an intermediary between microcontroller boards (Arduino, ESP32, etc.) and the remote cloud backend (`backend_dash`).

Core responsibilities:

- **Connects to physical boards** via USB serial (Firmata protocol), WiFi TCP/IP, HTTP REST, or MQTT.
- **Executes dynamic board code** received from the remote backend using `eval()` — this is an intentional design decision for runtime flexibility.
- **Manages global variables (`gVar`)** per project — shared state objects that board code reads/writes and that the frontend polls to display sensor data and control actuators.
- **Maintains time vectors** for array-type variables (timestamps for charting on the frontend).
- **Communicates bi-directionally** with `backend_dash` via Socket.IO (as a **client**, not a server).
- **Exposes a local REST API** for polling board status and triggering connections/code updates.

### Supported Board Types

| Type | Protocol | Transport |
|---|---|---|
| Type 2 | Firmata | USB serial or WiFi/UDP virtual serial |
| Type 3 | Firmata | TCP/IP sockets (ESP32) |
| Type 4 | Custom HTTP REST | HTTP (via `xelHTTP` library) |
| Type 5 | MQTT | MQTT protocol (via `xelMQTT` library) |

### Architecture

Loosely MVC-inspired layered architecture:

- `src/config/Server.js` — Class-based Express + Socket.IO client setup.
- `src/config/Sockets.js` — Socket.IO client connecting to the remote `backend_dash` server. Handles all real-time events.
- `src/config/generate.js` — Board connection factory — bridges board types and communication protocols.
- `src/controllers/` — Business logic: board generation, code execution, polling, timer management.
- `src/routes/pollingRoutes.js` — Express router for local REST endpoints.
- `src/utils/` — Reusable libraries: `xelHTTP.js` (ESP32 HTTP client), `xelMQTT.js` (MQTT client).
- `src/models/GlobalVars.js` — Currently empty; `gVar` state lives in `UpdateCodeBoardController.js`.

Entry point: `src/index.js` → instantiates `ServerApp` and calls `execute()`.

### Key Concepts

- **In-memory state only** — No database. All state (`gVar` object) is held in memory and lost on restart.
- **Global timer patching** — `ClearTimers.js` overrides `global.setTimeout` and `global.setInterval` to track timers per board ID (plain `_id` string), enabling cleanup when boards disconnect or code is updated.
- **Auto-injected `_id` in board code** — `UpdateCodeBoardController.js` creates scoped `setTimeout`/`setInterval` before `eval(boardCode)` that auto-append the board's `_id` to every call. Board code does not need to pass `_id` manually.
- **`varG` and `board` aliases** — Before `eval(boardCode)`, local variables `const varG = gVar[project]` and `const board = boards[_id]` are created. Board code can write `varG.sensor = 5` instead of `gVar[project].sensor = 5`, and `board.pinMode(...)` instead of `boards[_id].pinMode(...)`. These are references, not copies — writes to `varG` directly modify `gVar[project]`.
- **Socket.IO client** — This server connects **to** `backend_dash` as a client (not a server). It joins a room identified by `SERVERAPI_KEY`.
- **Event naming convention** — `b-b` suffix means backend-to-backend communication.
- **`hex/` directory** — Contains pre-compiled Arduino firmware (`.ino.hex`) for Uno and Mega boards (USB and WiFi variants).

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | JavaScript (ES Modules) | — |
| Runtime | Node.js | — |
| Framework | Express.js | ^4.18.2 |
| Real-time | Socket.IO Client | ^4.5.0 |
| HTTP Client | Axios | ^1.6.2 |
| IoT/Hardware | Firmata | ^2.3.0 |
| Serial | udp-serial, etherport | ^0.2.0 |
| MQTT | mqtt | ^5.12.0 |
| Env Config | dotenv | ^16.4.7 |

---

## Setup Commands

```bash
# Install dependencies
npm install

# Start the server (no hot-reload)
npm run dev
```

The server listens on the port defined in `.env` (`PORT`, default `4040`).

**Note**: There is no `nodemon` or hot-reload configured. The `dev` script runs plain `node ./src/index.js`.

### Environment Variables

Create a `.env` file in the project root with:

| Variable | Description |
|---|---|
| `PORT` | HTTP server listen port (default: `4040`) |
| `FRONTEND_URL` | Frontend origin URL (currently unused — CORS is `"*"`) |
| `SOCKETSERVER_URL` | Remote Socket.IO server URL (e.g., `https://undercromo.dev`) |
| `SERVERAPI_KEY` | API key to identify this server to the remote Socket.IO server |

---

## Build & Test Instructions

### Build

There is **no build step**. The project is plain JavaScript (ES Modules) and runs directly with `node`.

### Test

There is **no testing framework** configured. The `test` script is a placeholder:

```bash
npm test  # outputs "Error: no test specified" and exits
```

The `test.js` file at the project root is **not a test suite** — it is a standalone Firmata/EtherPort debugging script for ESP32 analog reading.

### Lint

There are **no linting or formatting tools** configured.

---

## REST API Endpoints

All under `/api/polling`:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/statusLocal` | Returns server online status |
| GET | `/boardStatus/:boardId` | Returns whether a specific board is ready |
| POST | `/boards` | Triggers board connection/disconnection |
| POST | `/codes` | Triggers code update on a connected board |

---

## Code Style Guidelines

- **JavaScript ES Modules** — Uses `"type": "module"` in `package.json`. All imports use `import` syntax, not `require()`.
- **Class-based server** — `ServerApp` class wraps Express setup.
- **Static method controllers** — `PollingController` uses static methods.
- **Factory pattern** — `generate.js` creates board connections based on `boardType` and `boardConnect` values.
- **Board code aliases** — Board code executed via `eval()` has access to `varG` (alias for `gVar[project]`), `board` (alias for `boards[_id]`), and auto-scoped `setTimeout`/`setInterval` (auto-append `_id`). All through lexical scoping of the closure created by `updateCodeBoardController`.
- **Array init regex** — `UpdateCodeBoardController.js` uses the pattern `/(?:varG|gVar\[project\])\.(\w+)\s*=\s*\[\]/g` to detect array resets and auto-clear the corresponding `_time` vectors. Supports both `varG.variable = []` and legacy `gVar[project].variable = []`.

---

## Guardrails

- **NEVER commit `.env` files or hardcoded credentials** (API keys, server URLs with embedded auth). If an `.env.example` is needed, use placeholder values only.
- **Do not modify Socket.IO event names** without updating `backend_dash` — they rely on exact event name matching (e.g., `request-polling-boards-b-b`, `response-gVar-update-b-b`). Note: there is an intentional typo in `request-gVarriable-initialize-b-b` that must be preserved for compatibility.
- **Do not remove or alter `ClearTimers.js` global timer patching** — it is critical for preventing timer leaks when boards disconnect or code is updated. The `global.setTimeout` and `global.setInterval` overrides track timers per board ID (plain `_id` string). The function accepts `_id` as a direct string argument.
- **The `gVar` object is the central state store** — it lives in `UpdateCodeBoardController.js` and is shared across the entire application. Changes to its structure affect board code execution, Socket.IO event handling, and the REST polling API.
- **`gVar[project]` is initialized with a guard** — `if (!gVar[project]) { gVar[project] = {}; }` runs before creating aliases. Do not remove this guard.
- **Do not modify `hex/` firmware files** unless you are deliberately updating Arduino firmware images. These are pre-compiled binaries.
- **Board code execution via `eval()` is intentional** — do not refactor it away without understanding that the system's core design relies on dynamically executing code strings received from the remote dashboard.
- **This server must run on the same machine as the physical hardware** — it accesses USB serial ports and local network devices directly.

---

## Recent Changes

- **`src/controllers/UpdateCodeBoardController.js`**: Auto-injects `_id` into `setTimeout`/`setInterval` calls via scoped local functions before `eval(boardCode)`. Board code no longer passes `_id` manually. Added `varG` and `board` aliases. Removed ~132 lines of dead/commented-out code (two `SAFEEXCEUTION` blocks) and a dead `getActiveTimersCount()` function. Added `gVar[project]` initialization guard. Updated array-init regex to support `varG.variable = []`.
- **`src/utils/xelTIME.js`**: **DELETED**. The `xelInterval`/`xelTimeout` wrappers only added try/catch and passed `_id`. Since `_id` is now auto-injected, they had no remaining purpose. All imports removed from `UpdateCodeBoardController.js` and `generate.js`.
- **`src/controllers/ClearTimers.js`**: Refactored to accept plain `_id` string instead of `{ _id }` object pattern.
- **`src/config/generate.js`**: Removed `xelTIME` import. Added log prefixes for clearer debugging.
- **`src/config/Sockets.js`**: Removed debug `console.log` statements.
