import sessions from '$lib/fixtures/sessions.json';
import eventsSess1 from '$lib/fixtures/events.sess-001.json';
import eventsSess2 from '$lib/fixtures/events.sess-002.json';
import type { Event, Session } from '$lib/types/contracts';

const eventsBySession: Record<string, Event[]> = {
  'sess-001': eventsSess1 as Event[],
  'sess-002': eventsSess2 as Event[]
};

export const getSessions = async (): Promise<Session[]> => sessions as Session[];

export const getSession = async (id: string): Promise<Session | null> => {
  const all = sessions as Session[];
  return all.find((s) => s.id === id) ?? null;
};

export const getSessionEvents = async (
  id: string,
  _cursor?: string | null
): Promise<{ cursorNext: string | null; events: Event[] }> => {
  const events = eventsBySession[id] ?? [];
  return { cursorNext: null, events };
};
