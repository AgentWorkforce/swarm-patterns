# Trajectory: Infrastructure: Monorepo Setup and Project Organization

> **Status:** ✅ Completed
> **Confidence:** 95%
> **Started:** January 30, 2026 at 09:34 AM
> **Completed:** January 30, 2026 at 09:35 AM

---

## Summary

Organized project as npm workspaces monorepo with apps/swarm-viz and apps/relay-timeline. Resolved nested git issues, created root convenience scripts, included relay-feedback analysis directory.

**Approach:** Post-development reorganization: moved apps into apps/ directory, consolidated package.json, removed nested .git directories, created comprehensive README with original prompt and agent team documentation.

---

## Key Decisions

### Reorganize into apps/ directory structure for monorepo
- **Chose:** Reorganize into apps/ directory structure for monorepo
- **Rejected:** Keep separate directories, Use pnpm workspaces, Use Turborepo
- **Reasoning:** Both apps (swarm-viz and relay-timeline) were initially created in separate locations. Reorganized into apps/ subdirectory following npm workspaces convention. This allows shared root package.json, single npm install, and consistent script naming.

### Use npm workspaces with 'apps/*' glob pattern
- **Chose:** Use npm workspaces with 'apps/*' glob pattern
- **Rejected:** Lerna for versioning, Turborepo for caching, pnpm workspaces, Yarn workspaces
- **Reasoning:** npm workspaces is built into npm 7+ with no additional tooling needed. The apps/* glob pattern automatically includes any new apps added to the apps/ directory. Simpler than Lerna or Turborepo for a two-app monorepo.

### Create root scripts: dev:swarm (5173), dev:timeline (5174)
- **Chose:** Create root scripts: dev:swarm (5173), dev:timeline (5174)
- **Rejected:** Single dev script with prompts, Make users cd into apps, Use concurrently to run both
- **Reasoning:** Root package.json includes convenience scripts that delegate to workspaces: 'npm run dev:swarm' runs swarm-viz on port 5173, 'npm run dev:timeline' runs relay-timeline on port 5174. Different ports allow running both simultaneously.

### Remove nested .git directories from apps to enable monorepo git
- **Chose:** Remove nested .git directories from apps to enable monorepo git
- **Rejected:** Keep as git submodules, Use git subtree, Separate repositories
- **Reasoning:** Each SvelteKit app was scaffolded with its own .git directory. These nested repos prevented 'git add' from working at the root level. Removed .git from apps/swarm-viz and apps/relay-timeline to have single root-level git repository.

### Include relay-feedback/ directory with experiment analysis
- **Chose:** Include relay-feedback/ directory with experiment analysis
- **Rejected:** Only include in README, Separate documentation repo, No documentation
- **Reasoning:** Created relay-feedback/ directory containing REPORT.md (full technical analysis), CONVERSATION_LOG.md (raw message export), and SUMMARY.md (TL;DR). Documents issues encountered, recommendations for protocol improvements, and lessons learned.

---

## Chapters

### 1. Initial work
*Agent: Orchestrator*

- Reorganize into apps/ directory structure for monorepo: Reorganize into apps/ directory structure for monorepo
- Use npm workspaces with 'apps/*' glob pattern: Use npm workspaces with 'apps/*' glob pattern
- Create root scripts: dev:swarm (5173), dev:timeline (5174): Create root scripts: dev:swarm (5173), dev:timeline (5174)
- Remove nested .git directories from apps to enable monorepo git: Remove nested .git directories from apps to enable monorepo git
- Include relay-feedback/ directory with experiment analysis: Include relay-feedback/ directory with experiment analysis
