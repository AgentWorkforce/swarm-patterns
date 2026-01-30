import type { PageLoad } from './$types';
import { parseMessages, getAgentColors } from '$lib/data/parser';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/messages.jsonl');
	const content = await response.text();

	const messages = parseMessages(content);
	const agentColors = getAgentColors(messages);

	// Wrap messages in the format expected by Timeline component
	const wrappedMessages = messages.map((message) => ({
		type: 'message' as const,
		message
	}));

	return {
		messages: wrappedMessages,
		agentColors: Object.fromEntries(agentColors)
	};
};
