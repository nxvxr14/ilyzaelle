# AGENTS.md — cuki_api_ia

## Project Overview

AI chatbot API backend for the **Ilyzaelle** platform. This is a lightweight TypeScript service that exposes a single HTTP endpoint for streaming AI chat completions. It acts as an AI inference gateway, round-robining requests between two cloud LLM providers.

The frontend sends chat messages (user/assistant/system roles) and receives a streaming SSE response with the AI-generated text.

### Architecture

Minimal **Service-based architecture** with interface abstraction:

- `index.ts` — Entry point. HTTP server via `Bun.serve()`, route handling, round-robin service selection.
- `types.ts` — TypeScript interfaces (`ChatMessage`, `IAService`).
- `services/groq.ts` — Groq AI service implementation.
- `services/cerebras.ts` — Cerebras AI service implementation.

### Key Concepts

- **Round-Robin Load Balancing**: Alternates between Groq and Cerebras on each request via `getNextService()`.
- **Streaming with Async Generators**: Both services use `async function*()` generators to stream AI response chunks, piped directly as SSE (`text/event-stream`).
- **`IAService` Interface**: Both providers implement `{ name: string, chat(): AsyncGenerator }`, making them interchangeable.

Total source files: **4** (index.ts, types.ts, services/groq.ts, services/cerebras.ts).

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5+ |
| Runtime | **Bun** (not Node.js) | ^1.3.6 |
| HTTP Server | `Bun.serve()` (built-in) | — |
| AI Provider 1 | Groq (groq-sdk) | ^0.37.0 |
| AI Provider 2 | Cerebras (@cerebras/cerebras_cloud_sdk) | ^1.64.1 |
| Module System | ES Modules | — |

### AI Models

| Provider | Model | Temperature | Max Tokens |
|---|---|---|---|
| Groq | `moonshotai/kimi-k2-instruct-0905` | 0.6 | 4,096 |
| Cerebras | `zai-glm-4.7` | 1.0 | 65,000 |

These are cloud-hosted LLM inference APIs — no local model files or ML frameworks are involved.

---

## Setup Commands

```bash
# Install dependencies (Bun, not npm)
bun install

# Start development server (with file watching / hot-reload)
bun run dev

# Start production server
bun run start
```

The server listens on the port defined in `.env` (`PORT`, default `3001`).

**Important**: This project uses **Bun** as both runtime and package manager. Do not use `npm`, `yarn`, or `pnpm`.

### Environment Variables

Create a `.env` file in the project root with:

| Variable | Description |
|---|---|
| `PORT` | HTTP server listen port (default: `3001`) |
| `GROQ_API_KEY` | API key for the Groq inference service |
| `CEREBRAS_API_KEY` | API key for the Cerebras inference service |

Both SDKs auto-detect their respective API keys from environment variables — no explicit key passing is done in the code.

---

## Build & Test Instructions

### Build

There is **no build step**. Bun runs TypeScript directly without compilation.

### Test

There is **no testing framework** configured. No test files, no test dependencies, no test scripts.

### Lint

There are **no linting or formatting tools** configured.

---

## API Endpoint

### `POST /cukiAPI`

Accepts a JSON body with an array of chat messages and returns a streaming SSE response.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:** `text/event-stream` (Server-Sent Events) — chunks of AI-generated text streamed as they arrive from the provider.

**CORS:** Enabled for all origins (`Access-Control-Allow-Origin: *`).

---

## Code Style Guidelines

- **TypeScript with strict mode** enabled in `tsconfig.json`. Target: ESNext, Module: ESNext, Module Resolution: bundler.
- **Bun-native APIs** — Use `Bun.serve()` for the HTTP server. Do not introduce Express, Hono, or other frameworks.
- **`IAService` interface** — All AI provider implementations must conform to the `IAService` interface defined in `types.ts`. This ensures they are interchangeable in the round-robin.
- **Async generators** — AI streaming responses must use `async function*()` generators. Do not buffer full responses before sending.
- **ES Modules** — `"type": "module"` in `package.json`. Use `import` syntax exclusively.

---

## Guardrails

- **NEVER commit `.env` files or hardcoded API keys** (Groq keys start with `gsk_`, Cerebras keys start with `csk-`). If an `.env.example` is needed, use placeholder values only.
- **Do not change the endpoint path `/cukiAPI`** without updating `frontend_react` (`VITE_CUKI_IA_API` env variable) and any reverse proxy configuration.
- **Do not replace Bun with Node.js** — the project uses `Bun.serve()` and Bun-specific APIs. Running with `node` will not work.
- **Maintain the round-robin pattern** — if adding new AI providers, implement the `IAService` interface and add them to the services array in `index.ts`.
- **Do not break the SSE streaming format** — the frontend expects `text/event-stream` responses. Switching to JSON or buffered responses will break the AI chat UI.
- **Known TODO**: `cerebras.ts` has `any` types for `chunk` and `messages` parameters that need proper typing (noted in a Spanish comment in the source code).
