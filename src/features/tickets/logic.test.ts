import { describe, expect, it } from 'vitest';

import { createReplySuggestion, getMetrics, getSlaState, selectTickets, supportReducer } from './logic';
import { Ticket } from './model';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'SUP-1',
  customer: 'Maya Chen',
  initials: 'MC',
  country: 'Singapore',
  subject: 'Purchase is not active',
  preview: 'Annual plan is missing',
  priority: 'normal',
  status: 'open',
  channel: 'in-app',
  assignee: 'David',
  createdAt: '2026-08-18T08:00:00.000Z',
  slaMinutes: 30,
  tags: ['billing', 'ios'],
  messages: [],
  ...overrides,
});

describe('ticket selection', () => {
  it('filters, searches, and prioritizes active urgent conversations', () => {
    const tickets = [
      makeTicket({ id: 'SUP-1', status: 'resolved' }),
      makeTicket({ id: 'SUP-2', customer: 'Elena Rossi', tags: ['android'], priority: 'urgent' }),
      makeTicket({ id: 'SUP-3', customer: 'Noah Williams', tags: ['profile'] }),
    ];

    expect(selectTickets(tickets, 'all', '').map((ticket) => ticket.id)).toEqual(['SUP-2', 'SUP-3', 'SUP-1']);
    expect(selectTickets(tickets, 'open', 'android').map((ticket) => ticket.id)).toEqual(['SUP-2']);
  });
});

describe('support reducer', () => {
  it('adds a reply and reopens a resolved conversation', () => {
    const ticket = makeTicket({ status: 'resolved' });
    const state = supportReducer(
      { tickets: [ticket], selectedId: ticket.id },
      {
        type: 'reply',
        ticketId: ticket.id,
        message: { id: 'm-1', author: 'agent', body: 'I can help.', createdAt: '2026-08-18T09:00:00.000Z' },
      },
    );

    expect(state.tickets[0].status).toBe('open');
    expect(state.tickets[0].messages).toHaveLength(1);
    expect(state.tickets[0].preview).toBe('I can help.');
  });
});

describe('queue health', () => {
  it('computes SLA states and aggregate metrics', () => {
    const now = new Date('2026-08-18T08:35:00.000Z').getTime();
    const urgent = makeTicket({ priority: 'urgent' });
    const resolved = makeTicket({ id: 'SUP-2', status: 'resolved' });

    expect(getSlaState(urgent, now)).toEqual({ label: '5m overdue', tone: 'danger' });
    expect(getMetrics([urgent, resolved])).toMatchObject({ active: 1, urgent: 1, resolved: 1 });
  });

  it('creates a context-aware billing draft', () => {
    expect(createReplySuggestion(makeTicket())).toContain('store receipt');
  });
});
