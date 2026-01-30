# Agent Relay Experiment - TL;DR

## What We Did
Used the Agent Relay protocol to create a swarm of AI agents that collaborated to build an animation app.

## Agents Involved
| Agent | Role | Key Contribution |
|-------|------|------------------|
| Architect | Lead designer | Proposed Svelte, defined architecture |
| UI-Agent | Animation expert | Initially proposed React, switched to Svelte |
| Backend-Agent | Backend eval | Determined no backend needed, facilitated consensus |
| DevOps-Agent | Build/deploy | Recommended Vite + Vercel |
| Lead | Coordinator | Auto-spawned to coordinate decisions |
| +5 others | Specialists | Auto-spawned for subtasks |

## The Debate
```
Architect:     "Use Svelte - better performance, built-in animations"
UI-Agent:      "Use React - bigger ecosystem, Framer Motion"
Backend-Agent: "Both work for me, no backend needed"
DevOps-Agent:  "Svelte = smaller bundles, faster builds"
UI-Agent:      "Actually, Architect is right. Svelte it is."
All Agents:    "CONSENSUS: Svelte + Vite + Vercel"
```

## Protocol Performance
| Metric | Result |
|--------|--------|
| Messages | 1,699 |
| Latency | <5ms |
| Agents | 4 → 10 (auto-spawned) |
| Consensus | Unanimous |
| Outcome | Working app |

## Issues Found
1. **Workspace detection** picked wrong directory (fixable)
2. **Socket path** confusion during spawn (needs docs)
3. **Processing timeouts** on some agents (minor)

## What Worked Great
- Real-time messaging
- Auto-spawning agents
- Channel broadcasts
- Message persistence
- Consensus building

## Verdict
**4.5/5 Stars** - Protocol works well for multi-agent coordination. Needs better error messages and workspace detection.

## Files
- `REPORT.md` - Full detailed report
- `CONVERSATION_LOG.md` - All 1,699 messages
- `../swarm-viz/` - The app the agents built
