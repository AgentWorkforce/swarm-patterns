export interface Agent {
	id: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	role: 'lead' | 'worker' | 'coordinator' | 'specialist';
	color: string;
	connections: string[];
}

export interface SwarmPattern {
	id: string;
	name: string;
	description: string;
	update: (agents: Agent[], canvas: { width: number; height: number }) => void;
}

export interface Message {
	from: string;
	to: string;
	progress: number;
}
