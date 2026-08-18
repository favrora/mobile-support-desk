import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ticket } from './model';

const storageKey = 'relaydesk:tickets:v1';

function isStoredTicket(value: unknown): value is Ticket {
  if (!value || typeof value !== 'object') return false;
  const ticket = value as Partial<Ticket>;
  return (
    typeof ticket.id === 'string' &&
    typeof ticket.customer === 'string' &&
    typeof ticket.subject === 'string' &&
    Array.isArray(ticket.tags) &&
    Array.isArray(ticket.messages)
  );
}

export async function loadTickets() {
  const value = await AsyncStorage.getItem(storageKey);
  if (!value) return null;

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isStoredTicket)) return null;
  return parsed;
}

export function saveTickets(tickets: Ticket[]) {
  return AsyncStorage.setItem(storageKey, JSON.stringify(tickets));
}
