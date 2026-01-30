# Agent Swarm Visualizations

> **The Original Prompt:**
>
> *"Look at this repo https://github.com/AgentWorkforce/relay and create a swarm of agents using the relay protocol to create an app where a user can see and experience animations of different agent swarming techniques. The agents should communicate via the relay protocol and the agents should decide on what technology choices they want to make to build the app. Install any skills you need via prpm cli. Record the prompt and create a transcript to monitor the conversations. Note any blockers or issues with the protocol."*

---

## What Happened

This entire project was built by **AI agents talking to each other** using the [Agent Relay Protocol](https://github.com/AgentWorkforce/relay). No human wrote the application code directly.

### The Agent Team

**Wave 1 - Technology Decision:**
| Agent | Role | Contribution |
|-------|------|--------------|
| Architect | System Design | Proposed Svelte, provided performance rationale |
| UI-Agent | Frontend Specialist | Initially proposed React, changed mind after debate |
| Backend-Agent | Backend & Coordination | Facilitated consensus, created vote summaries |
| DevOps-Agent | Build & Deploy | Recommended Vite, defined CI/CD pipeline |

**Wave 2 - Swarm Patterns App:**
| Agent | Role | Contribution |
|-------|------|--------------|
| SwarmDev | Algorithm Specialist | Implemented 6 swarm pattern algorithms |
| UIBuilder | Component Builder | Created SwarmCanvas visualization |
| Scaffolder | Project Setup | SvelteKit scaffolding |

**Wave 3 - Timeline Visualization:**
| Agent | Role | Contribution |
|-------|------|--------------|
| Lead | Coordinator | Assigned tasks, tracked progress |
| DataParser | Data Specialist | Built JSONL parser with TypeScript |
| Designer | UI/UX | Created Timeline, MessageCard, AnimatedFlow |
| Developer | Integration | Wired everything together |

### The Debate

The agents actually **disagreed** on the tech stack:

```
T+0:00   Architect proposes Svelte
T+0:15   UI-Agent proposes React + Framer Motion (disagreement!)
T+0:30   Backend-Agent notes the framework mismatch
T+0:45   DevOps-Agent supports Svelte (Vite-native)
T+1:00   UI-Agent reconsiders, changes position to Svelte
T+1:15   Backend-Agent confirms unanimous consensus
```

**Final Vote:** 4-0 for SvelteKit

---

## The Apps

### 1. Swarm Patterns (`apps/swarm-viz`)

Interactive visualization of 6 classic agent swarm algorithms:

| Pattern | Description |
|---------|-------------|
| **Boids Flocking** | Craig Reynolds' classic - separation, alignment, cohesion |
| **Hub & Spoke** | Central lead with orbiting workers |
| **Hierarchical Tree** | Multi-level structure with coordinators |
| **Mesh Network** | Grid-based neighbor connections |
| **Spiral Swirl** | Agents following spiral patterns |
| **Consensus Formation** | Scatter then converge behavior |

**Features:**
- 60fps Canvas rendering
- Adjustable agent count (5-50)
- Toggle connections and messages
- Role-based coloring

### 2. Relay Timeline (`apps/relay-timeline`)

Visualize the actual agent conversations that built this project.

**Timeline View (`/`):**
- Vertical timeline of 1,709 messages
- Color-coded sender badges
- Filter by agent
- Expandable message cards

**Animated Flow (`/animated`):**
- Network graph with agents as nodes
- Messages animate as glowing particles
- Real-time message feed with snippets
- Speed controls and particle trails

---

## Quick Start

```bash
# Clone and enter
git clone <repo-url>
cd swarm-patterns

# Install dependencies
npm install

# Run Swarm Patterns (port 5173)
npm run dev:swarm

# Run Timeline Visualization (port 5174)
npm run dev:timeline
```

---

## Project Structure

```
swarm-patterns/
├── apps/
│   ├── swarm-viz/                 # Swarm pattern animations
│   │   └── src/lib/swarm/
│   │       └── patterns.ts        # 6 algorithm implementations
│   │
│   └── relay-timeline/            # Message visualization
│       ├── src/lib/components/
│       │   ├── AnimatedFlow.svelte   # Particle animation
│       │   └── Timeline.svelte       # Message timeline
│       └── static/
│           └── messages.jsonl     # 1,709 agent messages
│
├── relay-feedback/                # Experiment analysis
│   ├── REPORT.md                  # Full technical report
│   ├── CONVERSATION_LOG.md        # Raw message export
│   └── SUMMARY.md                 # TL;DR
│
├── trajectories/                  # Decision documentation (38 decisions)
│   ├── 00-complete-build.md       # Overall project trajectory
│   ├── 01-wave1-tech-decision.md  # Svelte vs React debate
│   ├── 02-wave2-swarm-patterns.md # Algorithm decisions
│   ├── 03-wave3-timeline-viz.md   # Timeline app decisions
│   ├── 04-infrastructure.md       # Monorepo setup
│   └── 05-issues-resolutions.md   # Problems & fixes
│
└── package.json                   # Monorepo root
```

---

## Key Findings

### What Worked Well

| Aspect | Result |
|--------|--------|
| Message Latency | Sub-5ms |
| Message Delivery | 100% (no loss) |
| Auto-spawning | Agents referenced "Lead" → Lead was auto-created |
| Consensus | Achieved through natural debate |
| Total Messages | 1,709 |

### Issues Encountered

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Workspace Detection | Daemon found wrong root | Add `--project` flag |
| Task Ambiguity | Agents built wrong app initially | Add task contracts/specs |
| No Sync Primitives | Manual coordination needed | Add barriers/semaphores |
| File Loss | Crash deleted source files | Add checkpoints/rollback |

### Recommended Protocol Additions

1. **Shared Workspace Context** - All agents see same project root
2. **Task Contracts** - Formal specs with expected outputs
3. **Coordination Barriers** - `agent-relay barrier wait scaffolding-done`
4. **Agent Constraints** - `--cwd` and `--file-scope` flags
5. **Progress Verification** - Automated completion checking
6. **Shared State Store** - Persist decisions across agents
7. **Rollback/Checkpoint** - Recovery from failures

See [relay-feedback/REPORT.md](relay-feedback/REPORT.md) for the complete analysis.

---

## Decision Trajectories

Every significant decision made during development has been documented using [agent-trajectories](https://www.npmjs.com/package/agent-trajectories):

| Trajectory | Decisions | Key Insight |
|------------|-----------|-------------|
| [Complete Build](trajectories/00-complete-build.md) | 6 | Overall architecture and tech choices |
| [Wave 1: Tech Decision](trajectories/01-wave1-tech-decision.md) | 6 | How agents debated and reached consensus |
| [Wave 2: Swarm Patterns](trajectories/02-wave2-swarm-patterns.md) | 8 | Why each algorithm was chosen |
| [Wave 3: Timeline Viz](trajectories/03-wave3-timeline-viz.md) | 5 | Role-based task assignment |
| [Infrastructure](trajectories/04-infrastructure.md) | 4 | Monorepo organization decisions |
| [Issues & Resolutions](trajectories/05-issues-resolutions.md) | 9 | Every problem and how it was fixed |

**Total: 38 documented decisions with reasoning and alternatives considered.**

See [trajectories/README.md](trajectories/README.md) for the complete index.

---

## Stats

```
Agents Spawned:        12
Messages Exchanged:    1,709
Decisions Documented:  38
Consensus Reached:     Unanimous (4-0)
Tech Stack:            SvelteKit + TypeScript + Tailwind
Session Duration:      ~7.5 hours (01:10 - 08:45)
Human Code Written:    0 lines (just the prompt)
```

---

## Tech Stack

- **Framework:** SvelteKit 2 + Svelte 5
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** HTML5 Canvas, Svelte transitions
- **Build:** Vite
- **Agent Protocol:** [Agent Relay](https://github.com/AgentWorkforce/relay) v2.1.4

---

## License

MIT

---

*Built entirely by AI agents coordinating via the [Agent Relay Protocol](https://github.com/AgentWorkforce/relay)*
