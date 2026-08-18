import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { seedTickets } from './fixtures';
import { supportReducer } from './logic';
import { SupportMessage, TicketStatus } from './model';
import { loadTickets, saveTickets } from './storage';

const initialState = {
  tickets: seedTickets,
  selectedId: seedTickets[0]?.id ?? null,
};

export function useSupportDesk() {
  const [state, dispatch] = useReducer(supportReducer, initialState);
  const [isReady, setIsReady] = useState(false);
  const messageSequence = useRef(0);

  useEffect(() => {
    let active = true;
    loadTickets()
      .then((tickets) => {
        if (active && tickets?.length) dispatch({ type: 'hydrate', tickets });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveTickets(state.tickets).catch(() => undefined);
  }, [isReady, state.tickets]);

  const selectTicket = useCallback((ticketId: string) => {
    dispatch({ type: 'select', ticketId });
  }, []);

  const setStatus = useCallback((ticketId: string, status: TicketStatus) => {
    dispatch({ type: 'setStatus', ticketId, status });
  }, []);

  const reply = useCallback((ticketId: string, body: string) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) return false;

    messageSequence.current += 1;
    const message: SupportMessage = {
      id: `local-${Date.now()}-${messageSequence.current}`,
      author: 'agent',
      body: trimmedBody,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'reply', ticketId, message });
    return true;
  }, []);

  return {
    ...state,
    selectedTicket: state.tickets.find((ticket) => ticket.id === state.selectedId) ?? null,
    isReady,
    selectTicket,
    setStatus,
    reply,
  };
}
