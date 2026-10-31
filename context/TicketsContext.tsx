import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Ticket = {
  id: string;
  caravanId: string;
  seat: number;
  /** Where the student gets off at arrival. */
  stop: string;
  paymentId: string;
  /** Ticket price, without service fee: the base for refunds. */
  price: number;
  status: 'active' | 'cancelled' | 'transferred';
  /** Amount sent back to the payment method after a cancellation. */
  refund?: number;
  /** Phone number of the friend who received the ticket. */
  transferredTo?: string;
};

type TicketsValue = {
  tickets: Ticket[];
  /**
   * The student's ticket for a caravan, if any. Transferred tickets count too:
   * otherwise one student could fill a bus by booking and transferring again and again.
   */
  ticketFor: (caravanId: string) => Ticket | undefined;
  /** Books a seat; returns null when the student already holds a ticket for this caravan. */
  book: (t: Omit<Ticket, 'id' | 'status'>) => Ticket | null;
  cancel: (id: string, refund: number) => void;
  transfer: (id: string, phone: string) => void;
};

const TicketsContext = createContext<TicketsValue | null>(null);

// Mock store: tickets live in memory until there's a backend.
export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const value = useMemo<TicketsValue>(() => {
    const update = (id: string, patch: Partial<Ticket>) =>
      setTickets((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const ticketFor = (caravanId: string) => tickets.find((t) => t.caravanId === caravanId && t.status !== 'cancelled');
    return {
      tickets,
      ticketFor,
      book: (t) => {
        // One ticket per student and per caravan: no hoarding, reselling or fake bookings to reach the minimum.
        if (ticketFor(t.caravanId)) return null;
        const ticket: Ticket = { ...t, id: `T${Date.now().toString(36).toUpperCase()}`, status: 'active' };
        setTickets((list) => [ticket, ...list]);
        return ticket;
      },
      cancel: (id, refund) => update(id, { status: 'cancelled', refund }),
      transfer: (id, phone) => update(id, { status: 'transferred', transferredTo: phone }),
    };
  }, [tickets]);

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error('useTickets must be used inside TicketsProvider');
  return ctx;
}
