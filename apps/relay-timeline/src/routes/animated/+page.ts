import type { PageLoad } from './$types';
import { parseMessages, getAgentColors } from '$lib/data/parser';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/messages.jsonl');
	const content = await response.text();

	const messages = parseMessages(content);
	const agentColors = getAgentColors(messages);

	// Extract unique agents
	const agents = new Set<string>();
	for (const msg of messages) {
		agents.add(msg.from);
		if (!msg.to.startsWith('#')) {
			agents.add(msg.to);
		}
	}

	return {
		messages,
		agents: Array.from(agents).sort(),
		agentColors: Object.fromEntries(agentColors)
	};
};
