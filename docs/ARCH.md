# relay-pty visualization architecture (v2026-01-30)

This note captures the end-to-end plan for the relay-pty visualization app. It reflects the team/Lead consensus on stack and scope: **SvelteKit + TypeScript + Svelvet; Svelte transitions + GSAP for sequences; Pixi/WebGL only when node count > 300; adapter-static on Vercel; no auth; data can be mocked.**

## Scope & modes
- **Phase 1 (current)**: Static build with bundled fixtures and a client-side mock WebSocket that emits events. Targets modern desktop/mobile browsers.
- **Phase 2 (optional)**: Drop-in real data via SvelteKit `+server` routes (or external collector) without changing UI components. Same contracts.

## Data model (shared contracts)
- `Session { id, startedAt, endedAt?, command, tags: string[], agents: string[], stats: { eventCount, ioBytes, errorCount? }, lastEventAt? }`
- `Event { id?, ts, sessionId, kind: 'daemon' | 'relay' | 'pty' | 'agent', subtype, source, target?, payload }`
- Payload variants:
  - `pty/open { ptyId, cmd, cwd }`
  - `pty/io { ptyId, stream: 'stdout' | 'stdin', data, len }`
  - `agent/msg { from, to, channel?, thread?, text, meta? }`
  - `daemon/status { component, status: 'ok' | 'warn' | 'error', detail? }`

## API surface (future-friendly, used by mocks today)
- `GET /sessions?limit&page&agent&from&to` → `[Session]`
- `GET /sessions/:id` → `Session + lastEventAt`
- `GET /sessions/:id/events?cursor&types` → `{ cursorNext, events: Event[] }` (JSON or JSONL)
- `WS /ws/sessions/:id` → ordered `Event` stream; client may send `{ type: 'filter', types?: string[], cursor?: string }`
- Cursor may be ISO timestamp or opaque token; UI only needs `cursorNext` passthrough.

## Frontend architecture
- **Routing**: `/sessions` (list), `/sessions/[id]` (detail timeline + graph), optional `/live` alias.
- **State**: Svelte stores per session (`sessionStore`), events (`eventStore` with capped buffer), connection (`connectionStore` for WS status & filters). Merge WS + backfill by `ts`/`id`.
- **Visualization**: Svelvet graph for daemon/relay-pty/agent/channel nodes; GSAP for orchestrated sequences; Pixi dynamically imported when node count > 300. Virtualized timeline for events. Motion honors `prefers-reduced-motion`.
- **Safety**: Escape PTY text, cap chunk length, no clickable links by default. Show truncation indicator.
- **Performance budgets**: <80KB gzip total JS; manual chunks for gsap/svelvet; lazy Pixi; debounce layout; buffer cap ~2–5k events.

## Mock-first delivery (Phase 1)
- Fixtures live under `src/lib/fixtures/` (sample sessions + events). A `createMockWs` helper in `src/lib/mock/mockWs.ts` emits the same `Event` shape on an interval. `src/lib/mock/mockApi.ts` provides REST-compatible stubs.
- UI chooses provider based on environment flag (e.g., `VITE_USE_MOCK=1`): SSR loads fixture data; client `onMount` starts the mock WS emitter.

## Optional real data path (Phase 2)
- Collector (Node/TS) ingests gRPC or HTTP chunked POST from daemon/relay-pty → normalizes to `Event` → Redis Streams for fan-out → Postgres/Timescale for history → SvelteKit +server routes/WS serve the contracts above. Adapter switches from `static` to `vercel` or runs externally.
- Reliability knobs: ordered per-session stream, heartbeat, cursor for resume, backpressure caps.

## Files added for Phase 1
- `src/lib/types/contracts.ts` — shared Session/Event types.
- `src/lib/fixtures/sessions.json`, `events.sess-001.json`, `events.sess-002.json` — sample data (steady-state + multi-agent run).
- `src/lib/mock/mockApi.ts`, `src/lib/mock/mockWs.ts` — REST stubs and mock WS emitter.

Questions? Ping #general. Future backend spec remains in `docs/relay-pty-backend.md` if we decide to ship ingest/storage.
