import type { Agent, SwarmPattern } from './types';

// Constants for physics simulation
const MAX_SPEED = 4;
const MAX_FORCE = 0.15;
const DAMPING = 0.98;

// Helper functions
function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function limitMagnitude(vx: number, vy: number, max: number): { vx: number; vy: number } {
	const mag = Math.sqrt(vx * vx + vy * vy);
	if (mag > max && mag > 0) {
		return { vx: (vx / mag) * max, vy: (vy / mag) * max };
	}
	return { vx, vy };
}

function distance(a: Agent, b: Agent): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function normalize(vx: number, vy: number): { vx: number; vy: number } {
	const mag = Math.sqrt(vx * vx + vy * vy);
	if (mag === 0) return { vx: 0, vy: 0 };
	return { vx: vx / mag, vy: vy / mag };
}

// 1. Boids Flocking - Classic Craig Reynolds algorithm
const boidsFlocking: SwarmPattern = {
	id: 'boids',
	name: 'Boids Flocking',
	description: 'Classic flocking with separation, alignment, and cohesion behaviors',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const PERCEPTION_RADIUS = 80;
		const SEPARATION_RADIUS = 30;
		const SEPARATION_WEIGHT = 1.5;
		const ALIGNMENT_WEIGHT = 1.0;
		const COHESION_WEIGHT = 1.0;
		const EDGE_MARGIN = 50;
		const EDGE_FORCE = 0.5;

		for (const agent of agents) {
			let separationX = 0, separationY = 0, separationCount = 0;
			let alignmentX = 0, alignmentY = 0, alignmentCount = 0;
			let cohesionX = 0, cohesionY = 0, cohesionCount = 0;

			for (const other of agents) {
				if (other.id === agent.id) continue;
				const d = distance(agent, other);

				// Separation - avoid crowding
				if (d < SEPARATION_RADIUS && d > 0) {
					const diffX = agent.x - other.x;
					const diffY = agent.y - other.y;
					separationX += diffX / d;
					separationY += diffY / d;
					separationCount++;
				}

				// Alignment and cohesion within perception radius
				if (d < PERCEPTION_RADIUS) {
					alignmentX += other.vx;
					alignmentY += other.vy;
					alignmentCount++;

					cohesionX += other.x;
					cohesionY += other.y;
					cohesionCount++;
				}
			}

			let forceX = 0, forceY = 0;

			// Apply separation
			if (separationCount > 0) {
				separationX /= separationCount;
				separationY /= separationCount;
				const sepNorm = normalize(separationX, separationY);
				forceX += sepNorm.vx * SEPARATION_WEIGHT;
				forceY += sepNorm.vy * SEPARATION_WEIGHT;
			}

			// Apply alignment
			if (alignmentCount > 0) {
				alignmentX /= alignmentCount;
				alignmentY /= alignmentCount;
				const alignNorm = normalize(alignmentX - agent.vx, alignmentY - agent.vy);
				forceX += alignNorm.vx * ALIGNMENT_WEIGHT;
				forceY += alignNorm.vy * ALIGNMENT_WEIGHT;
			}

			// Apply cohesion
			if (cohesionCount > 0) {
				cohesionX /= cohesionCount;
				cohesionY /= cohesionCount;
				const toCenter = normalize(cohesionX - agent.x, cohesionY - agent.y);
				forceX += toCenter.vx * COHESION_WEIGHT;
				forceY += toCenter.vy * COHESION_WEIGHT;
			}

			// Edge avoidance
			if (agent.x < EDGE_MARGIN) forceX += EDGE_FORCE;
			if (agent.x > canvas.width - EDGE_MARGIN) forceX -= EDGE_FORCE;
			if (agent.y < EDGE_MARGIN) forceY += EDGE_FORCE;
			if (agent.y > canvas.height - EDGE_MARGIN) forceY -= EDGE_FORCE;

			// Apply forces
			const limited = limitMagnitude(forceX, forceY, MAX_FORCE);
			agent.vx = (agent.vx + limited.vx) * DAMPING;
			agent.vy = (agent.vy + limited.vy) * DAMPING;

			const speedLimited = limitMagnitude(agent.vx, agent.vy, MAX_SPEED);
			agent.vx = speedLimited.vx;
			agent.vy = speedLimited.vy;

			// Update position
			agent.x = clamp(agent.x + agent.vx, 10, canvas.width - 10);
			agent.y = clamp(agent.y + agent.vy, 10, canvas.height - 10);
		}
	}
};

// 2. Hub & Spoke - Central lead with orbiting workers
const hubAndSpoke: SwarmPattern = {
	id: 'hub-spoke',
	name: 'Hub & Spoke',
	description: 'Central lead agent with workers orbiting around it',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const ORBIT_SPEED = 0.02;
		const ORBIT_RADIUS_BASE = 100;
		const ORBIT_RADIUS_STEP = 50;

		// Find lead agent or use first agent
		const lead = agents.find(a => a.role === 'lead') || agents[0];
		const workers = agents.filter(a => a.id !== lead.id);

		// Move lead toward center
		const toCenter = normalize(centerX - lead.x, centerY - lead.y);
		lead.vx = toCenter.vx * 2;
		lead.vy = toCenter.vy * 2;
		lead.x += lead.vx;
		lead.y += lead.vy;

		// Orbit workers around the lead
		workers.forEach((worker, index) => {
			const orbitIndex = Math.floor(index / 6);
			const positionInOrbit = index % 6;
			const orbitRadius = ORBIT_RADIUS_BASE + orbitIndex * ORBIT_RADIUS_STEP;
			const agentsInOrbit = Math.min(6, workers.length - orbitIndex * 6);
			const angleOffset = (2 * Math.PI * positionInOrbit) / agentsInOrbit;

			// Use time-based angle for smooth rotation
			const time = Date.now() * ORBIT_SPEED * 0.001;
			const angle = time * (1 + orbitIndex * 0.3) + angleOffset;

			const targetX = lead.x + Math.cos(angle) * orbitRadius;
			const targetY = lead.y + Math.sin(angle) * orbitRadius;

			// Smooth movement toward orbit position
			const dx = targetX - worker.x;
			const dy = targetY - worker.y;
			worker.vx = dx * 0.1;
			worker.vy = dy * 0.1;
			worker.x += worker.vx;
			worker.y += worker.vy;

			// Update connections
			worker.connections = [lead.id];
		});

		lead.connections = workers.map(w => w.id);
	}
};

// 3. Hierarchical - Tree structure with multiple levels
const hierarchical: SwarmPattern = {
	id: 'hierarchical',
	name: 'Hierarchical Tree',
	description: 'Tree structure with leads, coordinators, and workers',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const LEVEL_HEIGHT = 120;
		const TOP_MARGIN = 80;

		// Sort agents by role hierarchy
		const leads = agents.filter(a => a.role === 'lead');
		const coordinators = agents.filter(a => a.role === 'coordinator');
		const specialists = agents.filter(a => a.role === 'specialist');
		const workers = agents.filter(a => a.role === 'worker');

		const levels = [
			leads.length > 0 ? leads : [agents[0]],
			coordinators.length > 0 ? coordinators : [],
			specialists.length > 0 ? specialists : [],
			workers.length > 0 ? workers : agents.slice(1)
		].filter(level => level.length > 0);

		// Position each level
		levels.forEach((level, levelIndex) => {
			const y = TOP_MARGIN + levelIndex * LEVEL_HEIGHT;
			const spacing = canvas.width / (level.length + 1);

			level.forEach((agent, agentIndex) => {
				const targetX = spacing * (agentIndex + 1);
				const targetY = y;

				// Smooth movement
				const dx = targetX - agent.x;
				const dy = targetY - agent.y;
				agent.vx = dx * 0.08;
				agent.vy = dy * 0.08;
				agent.x += agent.vx;
				agent.y += agent.vy;

				// Set connections to parent level
				agent.connections = [];
				if (levelIndex > 0) {
					const parentLevel = levels[levelIndex - 1];
					const parentIndex = Math.floor(agentIndex * parentLevel.length / level.length);
					const parent = parentLevel[Math.min(parentIndex, parentLevel.length - 1)];
					if (parent) {
						agent.connections = [parent.id];
					}
				}
			});
		});
	}
};

// 4. Mesh Network - Grid with neighbor connections
const meshNetwork: SwarmPattern = {
	id: 'mesh',
	name: 'Mesh Network',
	description: 'Grid layout with connections to nearest neighbors',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const PADDING = 60;
		const CONNECTION_DISTANCE = 150;

		// Calculate grid dimensions
		const count = agents.length;
		const cols = Math.ceil(Math.sqrt(count * (canvas.width / canvas.height)));
		const rows = Math.ceil(count / cols);

		const cellWidth = (canvas.width - PADDING * 2) / Math.max(cols - 1, 1);
		const cellHeight = (canvas.height - PADDING * 2) / Math.max(rows - 1, 1);

		// Add slight oscillation for liveliness
		const time = Date.now() * 0.001;

		agents.forEach((agent, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);

			// Grid position with slight wave motion
			const waveX = Math.sin(time + row * 0.5) * 5;
			const waveY = Math.cos(time + col * 0.5) * 5;

			const targetX = PADDING + col * cellWidth + waveX;
			const targetY = PADDING + row * cellHeight + waveY;

			// Smooth movement to grid position
			const dx = targetX - agent.x;
			const dy = targetY - agent.y;
			agent.vx = dx * 0.1;
			agent.vy = dy * 0.1;
			agent.x += agent.vx;
			agent.y += agent.vy;

			// Connect to nearby agents
			agent.connections = agents
				.filter(other => {
					if (other.id === agent.id) return false;
					const d = distance(agent, other);
					return d < CONNECTION_DISTANCE;
				})
				.map(other => other.id);
		});
	}
};

// 5. Spiral Swirl - Agents follow spiral pattern
const spiralSwirl: SwarmPattern = {
	id: 'spiral',
	name: 'Spiral Swirl',
	description: 'Agents flow in a mesmerizing spiral pattern',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const SPIRAL_SPEED = 0.015;
		const RADIAL_SPACING = 25;
		const MIN_RADIUS = 30;

		const time = Date.now() * 0.001;

		agents.forEach((agent, index) => {
			// Each agent has a unique position on the spiral
			const spiralPosition = index / agents.length;
			const baseAngle = spiralPosition * Math.PI * 4; // Two full spirals
			const radius = MIN_RADIUS + index * RADIAL_SPACING / 2;

			// Animate along the spiral
			const angle = baseAngle + time * SPIRAL_SPEED * (1 + spiralPosition * 0.5);

			// Spiral motion with pulsing radius
			const pulseRadius = radius + Math.sin(time * 2 + index) * 10;
			const targetX = centerX + Math.cos(angle) * pulseRadius;
			const targetY = centerY + Math.sin(angle) * pulseRadius;

			// Smooth following
			const dx = targetX - agent.x;
			const dy = targetY - agent.y;
			agent.vx = dx * 0.12;
			agent.vy = dy * 0.12;
			agent.x += agent.vx;
			agent.y += agent.vy;

			// Connect to adjacent agents in spiral
			agent.connections = [];
			if (index > 0) {
				agent.connections.push(agents[index - 1].id);
			}
			if (index < agents.length - 1) {
				agent.connections.push(agents[index + 1].id);
			}
		});
	}
};

// 6. Consensus Formation - Scatter then converge
const consensusFormation: SwarmPattern = {
	id: 'consensus',
	name: 'Consensus Formation',
	description: 'Agents scatter, discuss, then converge to agreement',
	update: (agents: Agent[], canvas: { width: number; height: number }) => {
		const CYCLE_DURATION = 8000; // 8 seconds per cycle
		const SCATTER_PHASE = 0.4; // 40% of cycle is scattering
		const CONVERGE_PHASE = 0.7; // After 70% we converge

		const time = Date.now();
		const cycleProgress = (time % CYCLE_DURATION) / CYCLE_DURATION;

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		// Calculate consensus point (could be dynamic based on "voting")
		const consensusX = centerX + Math.sin(time * 0.0003) * 50;
		const consensusY = centerY + Math.cos(time * 0.0004) * 30;

		agents.forEach((agent, index) => {
			let targetX: number, targetY: number;

			if (cycleProgress < SCATTER_PHASE) {
				// Scatter phase - move to random-ish positions
				const scatterAngle = (index / agents.length) * Math.PI * 2;
				const scatterRadius = 150 + (index % 3) * 40;
				targetX = centerX + Math.cos(scatterAngle + index) * scatterRadius;
				targetY = centerY + Math.sin(scatterAngle + index) * scatterRadius;

				// No connections during scatter
				agent.connections = [];
			} else if (cycleProgress < CONVERGE_PHASE) {
				// Discussion phase - small random movements, forming connections
				const discussionAngle = (index / agents.length) * Math.PI * 2;
				const discussionRadius = 120 + Math.sin(time * 0.005 + index) * 20;
				targetX = centerX + Math.cos(discussionAngle) * discussionRadius;
				targetY = centerY + Math.sin(discussionAngle) * discussionRadius;

				// Connect to nearby agents during discussion
				agent.connections = agents
					.filter(other => {
						if (other.id === agent.id) return false;
						return distance(agent, other) < 100;
					})
					.slice(0, 3)
					.map(other => other.id);
			} else {
				// Convergence phase - all move toward consensus point
				const convergeFactor = (cycleProgress - CONVERGE_PHASE) / (1 - CONVERGE_PHASE);
				const spreadRadius = 80 * (1 - convergeFactor);
				const agentAngle = (index / agents.length) * Math.PI * 2;

				targetX = consensusX + Math.cos(agentAngle) * spreadRadius;
				targetY = consensusY + Math.sin(agentAngle) * spreadRadius;

				// All connected during consensus
				agent.connections = agents
					.filter(other => other.id !== agent.id)
					.map(other => other.id);
			}

			// Smooth movement with easing
			const easing = cycleProgress > CONVERGE_PHASE ? 0.15 : 0.08;
			const dx = targetX - agent.x;
			const dy = targetY - agent.y;
			agent.vx = dx * easing;
			agent.vy = dy * easing;
			agent.x += agent.vx;
			agent.y += agent.vy;

			// Keep within bounds
			agent.x = clamp(agent.x, 20, canvas.width - 20);
			agent.y = clamp(agent.y, 20, canvas.height - 20);
		});
	}
};

// Export all patterns as an array
export const patterns: SwarmPattern[] = [
	boidsFlocking,
	hubAndSpoke,
	hierarchical,
	meshNetwork,
	spiralSwirl,
	consensusFormation
];

export default patterns;
