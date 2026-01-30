# relay-pty data & integration layer (design)
Date: 2026-01-30

> **MVP scope (Lead-confirmed)**: Frontend-only SvelteKit app with **simulated relay-pty events**; no backend services, no persistence, no auth. Use the simulator path only. Everything below about live/replay/API/SQLite is **future/optional** if scope expands.

## Goals & scope
- Stream real relay traffic to the visualization UI with the same semantics as the agent-relay protocol.  
  - **MVP:** simulate only (in-app generator).  
  - **Future:** live tail + replay via sidecar if approved.
- Support three modes (future-ready): **live** (tail daemon output), **replay** (persisted sessions), **simulate** (scripted scenarios for demos/tests).
- Expose a narrow HTTP + WebSocket surface the UI can bind to without additional transforms (future).
- Stay local-first: zero external services; optional SQLite only if live/replay is later enabled.

## Sources of truth (ingest connectors)
1) **relay JSONL tail (preferred)** – tail `~/.agent-relay/messages/<YYYY-MM-DD>.jsonl`; each line already has `type`, `ts`, `id`, `from`, `to`, `kind`, `status`, `deliverySeq`, `sessionId`, etc. Translate directly to events.
2) **fs watch fallback** – watch `$AGENT_RELAY_OUTBOX/*` and `$AGENT_RELAY_INBOX/*` for new `msg/spawn/release` files; parse headers until blank line, infer `from` from path.
3) **pty tap (optional)** – hook the relay CLI PTY (e.g., using `node-pty`) to emit `pty/io` events for full terminal playback (stdin/out chunks, open/exit).
4) **replay loader** – read stored SQLite/JSONL sessions and re-emit with controlled speed.
5) **simulator** – generate synthetic sessions from scenario JSON (list of events + relative delays) to unblock UI while relay is offline.

## Event schema v1 (wire format for REST/WS)
Base fields for every event:
```
id: string              # unique per event
ts: number              # ms since epoch
sessionId: string       # relay deliverySessionId if present; else generated
kind: "pty" | "agent" | "relay" | "daemon" | "system"
subtype: string         # e.g., io/open/exit for pty, msg/status/ack/spawn/release for relay
source: string          # agent, ptyId, daemon component, or "__system__"
target?: string         # agent, channel, or ptyId when applicable
payload: object         # shape depends on kind/subtype
raw?: object | string   # original JSONL line or file contents for debugging
seq?: number            # monotonic per session when available (deliverySeq)
thread?: string         # THREAD header when present
channel?: string        # e.g., #general
status?: string         # acked/read/unread/etc when subtype=status
```

Key subtype payloads
- **pty/open**: `{ ptyId, cmd, cwd, env?: string[] }`
- **pty/io**: `{ ptyId, stream: "stdout" | "stdin", data: string, len: number }`
- **pty/exit**: `{ ptyId, code: number, signal?: string }`
- **agent/msg** (from relay JSONL `type:"message"`): `{ body, text?, isBroadcast, isUrgent }` plus headers (thread, channel).
- **relay/status** (from JSONL `type:"status"`): `{ status }` referencing `id` of prior message.
- **relay/spawn|release**: `{ name, cli, reason? }` parsed from file headers `KIND: spawn|release`.
- **daemon/status**: `{ component, status, detail? }` (for relay daemon health events if/when emitted).
- **system/state**: `{ action, member }` for channel join/leave lines (seen as `kind:"state"` in JSONL).

TypeScript interfaces (library export)
```
export type EventKind = "pty" | "agent" | "relay" | "daemon" | "system";

export interface BaseEvent {
  id: string;
  ts: number;
  sessionId: string;
  kind: EventKind;
  subtype: string;
  source: string;
  target?: string;
  payload: Record<string, unknown>;
  raw?: unknown;
  seq?: number;
  thread?: string;
  channel?: string;
  status?: string;
}
```

### Mapping from relay JSONL → wire event
- JSONL `{"type":"message", "message":{...}}` → `kind:"agent"`, `subtype:"msg"`, `source: message.from`, `target: message.to`, `payload.body: message.body || message.text`, `seq: deliverySeq`, `sessionId: deliverySessionId || sessionId`.
- JSONL `{"type":"status", ...}` → `kind:"relay"`, `subtype:"status"`, `payload.status`, `target: id` (the message being acked).
- JSONL `kind:"state"` with `body:"join:<name>"` → `kind:"system"`, `subtype:"channel"`, `payload.action:"join"`, `payload.member:<name>`.
- FS `KIND: spawn` file → `kind:"relay"`, `subtype:"spawn"`, `payload:{ name, cli }`, `source: inferred agent (parent dir)`.

## Storage (SQLite, optional / future)
- `sessions(id TEXT PRIMARY KEY, started_at INTEGER, status TEXT, agent_count INTEGER, command TEXT, tags TEXT, last_event_ts INTEGER)`
- `events(id TEXT PRIMARY KEY, session_id TEXT, ts INTEGER, kind TEXT, subtype TEXT, source TEXT, target TEXT, payload JSON, raw JSON, seq INTEGER, thread TEXT, channel TEXT, status TEXT, FOREIGN KEY(session_id) REFERENCES sessions(id))`
- Indexes: `(session_id, ts)`, `(session_id, seq)`, `(kind, ts)`, `(source, ts)`; optional FTS virtual table on `payload->>'body'` for search.
- Retention: configurable max days or max rows with vacuum.

## API surface (future if backend approved)
- `GET /health` – daemon + connector status.
- `GET /config` – paths, modes enabled, session counts.
- `GET /sessions?limit=&page=&agent=&from=&to=&status=` – list with pagination.
- `GET /sessions/:id` – session metadata + stats (counts by kind/subtype).
- `GET /sessions/:id/events?cursor=&limit=&types=&sources=&subtypes=` – paginated; supports `Accept: application/json` (paged) or `application/x-ndjson` (streamed JSONL).
- `WS /ws/sessions/:id` – live push; query params `types`, `subtypes`, `sources`, `sinceTs`. Sends backlog N (configurable) then live tail.
- `POST /simulate` – body `{ scenario: "busy"|"light"|"error", speed?: number }` returns `{ sessionId }` and starts emitting.
- `POST /sessions/:id/control` – `{ action: "pause"|"resume"|"stop"|"seek", speed?: number, ts?: number }` for replay and simulator sessions.

## Runtime architecture
- **Ingestor**: pluggable connectors (JSONL tail, fs watch, pty tap, replay, simulator) push raw events into an in-memory bus (RxJS Subject).
- **Normalizer**: validates with zod, enriches (sessionId, seq, thread), and fans out to storage + broadcaster.
- **Storage writer**: synchronous SQLite writes using `better-sqlite3` (simple, safe in single process).
- **Broadcaster**: pushes to WebSocket clients; also supports SSE fallback.
- **API server**: Fastify + `@fastify/websocket`; schema-first routes; CORS enabled for localhost dev.
- **Config**: `.relay-pty.json` with paths (daemon logs, outbox), mode toggles, retention, default simulation scenario.
- **CLI**: `relay-pty serve` (start API/WS), `relay-pty simulate <scenario>`, `relay-pty replay <sessionId> --speed 2x`, `relay-pty doctor` (check paths/permissions).

## Stack choices
- **Language**: TypeScript (Node 20+) to share types with SvelteKit UI; build via `tsup` or `esbuild`.
- **HTTP/WS**: Fastify (`@fastify/websocket`, `@fastify/ajv-compiler`). Alternative: NestJS if DI/modules desired.
- **FS/PTY**: `chokidar` for watch; `node-pty` for PTY tapping; `readline`/`fs.createReadStream` for JSONL tailing with backpressure.
- **Data**: SQLite (`better-sqlite3`) with WAL for durability; in-memory mode for demo.
- **Validation**: `zod` schemas shared with UI via a small `@relay-pty/contracts` package.
- **Observability**: `pino` logs; `prom-client` metrics (counters for events ingested/emitted; gauges for lag/backlog).
- **Testing**: `vitest` + tmp dirs; golden JSONL fixtures to ensure parser fidelity to relay files.

## Modes & flow control
- **Live**: tail JSONL; keep file handle open; detect day rollover and reopen.
- **Replay**: read stored events ordered by `ts`/`seq`; support `speed` multiplier and `pause/seek` via control API.
- **Simulate**: fire scenario events with `setTimeout` or RxJS scheduler; same pipeline as live so UI code is unchanged.
- **Backpressure**: cap backlog per WS client; drop or sample when >10k pending; expose metrics.

## Alignment with relay protocol
- Preserve `deliverySeq`, `deliverySessionId`, `status` values from daemon logs.
- Honor `KIND` header semantics (`spawn`, `release`) and pass through unknown headers in `payload.headers` for forward compatibility.
- Do not mutate message text; keep raw copy for auditing/replay.
- Use the same channel syntax (`#general`) and thread headers; leave untouched for UI rendering.

## Suggested implementation increments
1) Parse + normalize JSONL (`type: message/status/state`) into BaseEvent; write to SQLite; expose `GET /sessions` + `GET /sessions/:id/events`.
2) Add WebSocket broadcaster with backlog + live tail.
3) Add simulator (prebaked scenarios drawn from today's JSONL) and `/simulate` endpoint.
4) Add fs-watch + pty connectors as optional modules.
5) Harden with metrics, config, and CLI UX.
