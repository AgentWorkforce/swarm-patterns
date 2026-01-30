# Agent Decision Trajectories

This directory contains comprehensive documentation of every significant decision made during the development of the Agent Swarm Visualization Suite, captured using [agent-trajectories](https://www.npmjs.com/package/agent-trajectories).

## What Are Trajectories?

Trajectories capture the **train of thought** behind development decisions - not just what was decided, but why, what alternatives were considered, and who made each decision. This creates an auditable record of AI agent collaboration.

---

## Trajectory Index

| File | Description | Agent | Confidence |
|------|-------------|-------|------------|
| [00-complete-build.md](./00-complete-build.md) | Overall project trajectory | Orchestrator | 90% |
| [01-wave1-tech-decision.md](./01-wave1-tech-decision.md) | Technology stack debate (Svelte vs React) | Architect | 95% |
| [02-wave2-swarm-patterns.md](./02-wave2-swarm-patterns.md) | Swarm visualization algorithms | SwarmDev | 88% |
| [03-wave3-timeline-viz.md](./03-wave3-timeline-viz.md) | Timeline & AnimatedFlow apps | Lead | 92% |
| [04-infrastructure.md](./04-infrastructure.md) | Monorepo setup & organization | Orchestrator | 95% |
| [05-issues-resolutions.md](./05-issues-resolutions.md) | Problems encountered & fixes | Orchestrator | 90% |

---

## Key Decisions Summary

### Wave 1: Technology Stack (6 decisions)
- Architect proposed SvelteKit for performance
- UI-Agent counter-proposed React (disagreement!)
- Backend-Agent facilitated discussion
- DevOps-Agent supported Svelte (Vite-native)
- UI-Agent changed position after debate
- **Final vote: 4-0 unanimous for SvelteKit**

### Wave 2: Swarm Patterns (8 decisions)
- Scaffolder set up SvelteKit project
- SwarmDev implemented 6 algorithms:
  - Boids Flocking (emergent behavior)
  - Hub-Spoke (centralized control)
  - Hierarchical Tree (delegation)
  - Mesh Network (decentralized P2P)
  - Spiral Swirl (artistic motion)
  - Consensus Formation (collective decision)
- UIBuilder created interactive SwarmCanvas
- requestAnimationFrame for 60fps rendering

### Wave 3: Timeline Visualization (5 decisions)
- Lead assigned role-based tasks
- DataParser chose JSONL format
- Designer created vertical Timeline
- Designer built particle-based AnimatedFlow
- Designer added Live Message Feed (user request)
- Developer wired routes (/ and /animated)

### Infrastructure (4 decisions)
- Reorganized into apps/ directory
- Used npm workspaces with apps/* glob
- Created root convenience scripts
- Included relay-feedback/ documentation

### Issues Resolved (9 decisions)
- Workspace detection (found ~/.Trash)
- Task misinterpretation (wrong app built)
- Node 18 vs Vite 7 incompatibility
- Source file loss during crash
- Missing package.json
- Wrong dev server running
- Data format mismatch
- Empty animation bug
- Git detached HEAD state
- Inaccurate documentation (15min vs 7.5hrs)

---

## File Formats

Each trajectory is exported in two formats:
- **Markdown (.md)** - Human-readable documentation
- **JSON (.json)** - Programmatic access for analysis

---

## Viewing Trajectories

```bash
# List all trajectories
npx agent-trajectories list

# Show specific trajectory
npx agent-trajectories show traj_akyw13ohfjwb

# Export to HTML with interactive timeline
npx agent-trajectories export traj_akyw13ohfjwb -f html --open
```

---

## Stats

```
Total Trajectories:     6
Total Decisions:        38
Agents Involved:        12
Average Confidence:     92%
```

---

*Captured using [agent-trajectories](https://www.npmjs.com/package/agent-trajectories) v0.2.3*
