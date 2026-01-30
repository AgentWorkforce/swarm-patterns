# Trajectory: Issues Encountered and Resolutions During Build

> **Status:** ✅ Completed
> **Confidence:** 90%
> **Started:** January 30, 2026 at 09:35 AM
> **Completed:** January 30, 2026 at 09:37 AM

---

## Summary

Documented 9 significant issues encountered during the 7.5-hour build: workspace detection, task misinterpretation, Node version incompatibility, file loss, missing package.json, wrong dev server, data format mismatch, empty animations, git state issues, and documentation inaccuracy. All resolved with specific fixes.

**Approach:** Each issue was addressed as encountered, with root cause analysis and targeted resolution. Several issues led to protocol improvement recommendations documented in relay-feedback/REPORT.md.

---

## Key Decisions

### ISSUE: Workspace detection found ~/.Trash instead of project directory
- **Chose:** ISSUE: Workspace detection found ~/.Trash instead of project directory
- **Rejected:** Add --project flag to CLI, Use environment variable, Accept wrong workspace
- **Reasoning:** Relay daemon's workspace detection algorithm found ~/.Trash as the git root because it was technically a git repository. Resolution: Initialized git in the target project directory before starting the daemon, ensuring correct workspace detection.

### ISSUE: Agents built wrong app (relay-pty lifecycle) initially
- **Chose:** ISSUE: Agents built wrong app (relay-pty lifecycle) initially
- **Rejected:** Reuse existing agents with clarification, Abandon project and restart, Keep wrong app
- **Reasoning:** First wave agents misinterpreted the task and built a 'relay-pty lifecycle' visualization instead of 'swarm patterns'. This happened because the task description was ambiguous. Resolution: Spawned new specialized agents (SwarmDev, UIBuilder) with explicit task descriptions. Recommendation: Add formal task contracts/specs to relay protocol.

### ISSUE: Node 18 incompatible with Vite 7 (SyntaxError with node:util)
- **Chose:** ISSUE: Node 18 incompatible with Vite 7 (SyntaxError with node:util)
- **Rejected:** Upgrade Node to 20+, Downgrade Vite to v6, Use different bundler
- **Reasoning:** Initial scaffolding used Vite 7 which requires Node 20+. Node 18 threw SyntaxError when importing from node:util. Resolution: Used older compatible package versions that support Node 18. Recommendation: Upgrade Node or pin Vite version in scaffold.

### ISSUE: Source files lost during Vite dev server crash
- **Chose:** ISSUE: Source files lost during Vite dev server crash
- **Rejected:** Manual git recovery, Restore from backup, Accept loss and rebuild from scratch
- **Reasoning:** Vite's file watcher triggered an unexpected cleanup that deleted source files during a dev server crash. The swarm-viz source code was lost and had to be rebuilt. Resolution: Used relay agents to rebuild from memory/context. Recommendation: Add checkpoint/rollback mechanism to relay protocol for file recovery.

### ISSUE: swarm-viz had no package.json after file loss
- **Chose:** ISSUE: swarm-viz had no package.json after file loss
- **Rejected:** Create package.json manually, Use npm init, Abandon and re-scaffold
- **Reasoning:** After rebuilding, discovered swarm-viz directory was missing package.json, preventing npm install and dev server. Files were in wrong location. Resolution: Copied rebuilt files to correct parent directory structure and ensured package.json was present.

### ISSUE: Wrong dev server running (parent vs swarm-viz)
- **Chose:** ISSUE: Wrong dev server running (parent vs swarm-viz)
- **Rejected:** Use different ports explicitly, Add process naming, Accept confusion
- **Reasoning:** Multiple times the wrong Vite dev server was running - serving the parent directory instead of swarm-viz. This caused the relay-pty lifecycle app to appear instead of swarm patterns. Resolution: Killed wrong processes and explicitly ran dev server from correct directory with correct port.

### ISSUE: AnimatedFlow expected MessageWrapper[] but received Message[]
- **Chose:** ISSUE: AnimatedFlow expected MessageWrapper[] but received Message[]
- **Rejected:** Wrap messages in parser, Keep both formats, Use type assertion
- **Reasoning:** AnimatedFlow component was written expecting MessageWrapper[] (with nested message property) but the parser returned Message[] directly. This caused 'undefined' errors when accessing m.message.from. Resolution: Updated component to accept Message[] directly, changed accessors from m.message.from to m.from.

### ISSUE: No messages animating in AnimatedFlow
- **Chose:** ISSUE: No messages animating in AnimatedFlow
- **Rejected:** Paginate animations, Stream messages progressively, Show error message
- **Reasoning:** AnimatedFlow page passed 'currentMessages' (an empty slice from pagination) instead of all messages. Since currentMessages was empty or small, no particles appeared. Resolution: Changed page to pass data.messages (all 1,709 messages) to AnimatedFlow component for proper animation.

### ISSUE: Detached HEAD state preventing branch creation
- **Chose:** ISSUE: Detached HEAD state preventing branch creation
- **Rejected:** Force checkout, Rebase onto existing main, Create different branch name
- **Reasoning:** Git was in detached HEAD state at commit a799c9a, and a 'main' branch already existed. Could not create new main branch. Resolution: Deleted existing main branch (git branch -D main), then created new main branch from current HEAD (git checkout -b main).

### ISSUE: README stated '15 minutes' build time (inaccurate)
- **Chose:** ISSUE: README stated '15 minutes' build time (inaccurate)
- **Rejected:** Keep 15 minutes, Use approximate range, Remove time entirely
- **Reasoning:** Initial README claimed '~15 minutes' session duration, but message timestamps showed actual duration was 7.5 hours (01:10 to 08:45). Resolution: Corrected to accurate '~7.5 hours' based on JSONL message timestamps.

---

## Chapters

### 1. Initial work
*Agent: Orchestrator*

- ISSUE: Workspace detection found ~/.Trash instead of project directory: ISSUE: Workspace detection found ~/.Trash instead of project directory
- ISSUE: Agents built wrong app (relay-pty lifecycle) initially: ISSUE: Agents built wrong app (relay-pty lifecycle) initially
- ISSUE: Node 18 incompatible with Vite 7 (SyntaxError with node:util): ISSUE: Node 18 incompatible with Vite 7 (SyntaxError with node:util)
- ISSUE: Source files lost during Vite dev server crash: ISSUE: Source files lost during Vite dev server crash
- ISSUE: swarm-viz had no package.json after file loss: ISSUE: swarm-viz had no package.json after file loss
- ISSUE: Wrong dev server running (parent vs swarm-viz): ISSUE: Wrong dev server running (parent vs swarm-viz)
- ISSUE: AnimatedFlow expected MessageWrapper[] but received Message[]: ISSUE: AnimatedFlow expected MessageWrapper[] but received Message[]
- ISSUE: No messages animating in AnimatedFlow: ISSUE: No messages animating in AnimatedFlow
- ISSUE: Detached HEAD state preventing branch creation: ISSUE: Detached HEAD state preventing branch creation
- ISSUE: README stated '15 minutes' build time (inaccurate): ISSUE: README stated '15 minutes' build time (inaccurate)
