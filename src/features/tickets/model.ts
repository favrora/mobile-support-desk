export type TicketPriority = 'urgent' | 'high' | 'normal';
export type TicketStatus = 'open' | 'pending' | 'resolved';
export type TicketFilter = 'all' | TicketStatus;
export type MessageAuthor = 'customer' | 'agent' | 'system';

export type SupportMessage = {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  customer: string;
  initials: string;
  country: string;
  subject: string;
  preview: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: 'in-app' | 'email';
  assignee: string;
  createdAt: string;
  slaMinutes: number;
  tags: string[];
  messages: SupportMessage[];
};

export type SupportState = {
  tickets: Ticket[];
  selectedId: string | null;
};

export type SupportAction =
  | { type: 'hydrate'; tickets: Ticket[] }
  | { type: 'select'; ticketId: string }
  | { type: 'setStatus'; ticketId: string; status: TicketStatus }
  | { type: 'reply'; ticketId: string; message: SupportMessage };
