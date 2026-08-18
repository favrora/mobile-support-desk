import {
  SupportAction,
  SupportState,
  Ticket,
  TicketFilter,
  TicketPriority,
} from './model';

const priorityRank: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
};

export function supportReducer(state: SupportState, action: SupportAction): SupportState {
  switch (action.type) {
    case 'hydrate':
      return {
        tickets: action.tickets,
        selectedId: action.tickets.some((ticket) => ticket.id === state.selectedId)
          ? state.selectedId
          : (action.tickets[0]?.id ?? null),
      };
    case 'select':
      return { ...state, selectedId: action.ticketId };
    case 'setStatus':
      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          ticket.id === action.ticketId ? { ...ticket, status: action.status } : ticket,
        ),
      };
    case 'reply':
      return {
        ...state,
        tickets: state.tickets.map((ticket) =>
          ticket.id === action.ticketId
            ? {
                ...ticket,
                preview: action.message.body,
                status: ticket.status === 'resolved' ? 'open' : ticket.status,
                messages: [...ticket.messages, action.message],
              }
            : ticket,
        ),
      };
  }
}

export function selectTickets(tickets: Ticket[], filter: TicketFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return tickets
    .filter((ticket) => filter === 'all' || ticket.status === filter)
    .filter((ticket) => {
      if (!normalizedQuery) return true;
      return [ticket.id, ticket.customer, ticket.subject, ticket.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (a.status === 'resolved' && b.status !== 'resolved') return 1;
      if (b.status === 'resolved' && a.status !== 'resolved') return -1;
      const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
      return priorityDifference || b.createdAt.localeCompare(a.createdAt);
    });
}

export function getSlaState(ticket: Ticket, now = Date.now()) {
  if (ticket.status === 'resolved') return { label: 'Resolved', tone: 'neutral' as const };

  const elapsedMinutes = Math.max(0, (now - new Date(ticket.createdAt).getTime()) / 60_000);
  const remaining = Math.ceil(ticket.slaMinutes - elapsedMinutes);
  if (remaining <= 0) return { label: `${Math.abs(remaining)}m overdue`, tone: 'danger' as const };
  if (remaining <= 15) return { label: `${remaining}m left`, tone: 'warning' as const };
  return { label: `${remaining}m left`, tone: 'neutral' as const };
}

export function getMetrics(tickets: Ticket[]) {
  const active = tickets.filter((ticket) => ticket.status !== 'resolved');
  const urgent = active.filter((ticket) => ticket.priority === 'urgent').length;
  const pending = tickets.filter((ticket) => ticket.status === 'pending').length;
  const resolved = tickets.filter((ticket) => ticket.status === 'resolved').length;
  const responseTimes = tickets.flatMap((ticket) => {
    const firstCustomerMessage = ticket.messages.find((message) => message.author === 'customer');
    const firstAgentReply = ticket.messages.find((message) => message.author === 'agent');
    if (!firstCustomerMessage || !firstAgentReply) return [];

    const elapsed = new Date(firstAgentReply.createdAt).getTime() - new Date(firstCustomerMessage.createdAt).getTime();
    return elapsed >= 0 ? [elapsed / 60_000] : [];
  });
  const responseMinutes = responseTimes.length
    ? Math.round(responseTimes.reduce((total, minutes) => total + minutes, 0) / responseTimes.length)
    : 0;

  return { active: active.length, urgent, pending, resolved, responseMinutes };
}

export function createReplySuggestion(ticket: Ticket) {
  const firstName = ticket.customer.split(' ')[0];
  if (ticket.tags.includes('billing')) {
    return `Hi ${firstName}, I can see why this is frustrating. I am checking the store receipt and account entitlement separately so we can restore access without asking you to purchase again.`;
  }
  if (ticket.tags.includes('generation')) {
    return `Hi ${firstName}, thanks for explaining where the process stopped. I am checking the generation status and your attempt balance. Please do not retry yet, so we can avoid using another attempt.`;
  }
  if (ticket.tags.includes('sync')) {
    return `Hi ${firstName}, thanks for reporting this. I am checking the latest wardrobe sync from both devices before we remove the duplicate safely.`;
  }
  return `Hi ${firstName}, thanks for reaching out. I reviewed the details you shared and will help you resolve this.`;
}
