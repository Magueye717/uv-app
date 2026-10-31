import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { caravanManifest, type Caravan, type Passenger } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketsContext';

type BoardingValue = {
  /** Scanned tickets, per caravan. */
  boarded: Record<string, string[]>;
  /** Pickup points the bus has left, per caravan: who wasn't scanned there is absent. */
  left: Record<string, string[]>;
  board: (caravanId: string, ticket: string) => void;
  unboard: (caravanId: string, ticket: string) => void;
  leave: (caravanId: string, place: string) => void;
};

const BoardingContext = createContext<BoardingValue | null>(null);

const add = (list: string[] = [], v: string) => (list.includes(v) ? list : [...list, v]);

// Mock store shared by the Scanner tab and the passenger lists. With a backend, scans sync between the
// organizer's phones and are queued while offline (no network between towns).
export function BoardingProvider({ children }: { children: ReactNode }) {
  const [boarded, setBoarded] = useState<Record<string, string[]>>({});
  const [left, setLeft] = useState<Record<string, string[]>>({});

  const value = useMemo<BoardingValue>(
    () => ({
      boarded,
      left,
      board: (id, ticket) => setBoarded((b) => ({ ...b, [id]: add(b[id], ticket) })),
      unboard: (id, ticket) => setBoarded((b) => ({ ...b, [id]: (b[id] ?? []).filter((t) => t !== ticket) })),
      leave: (id, place) => setLeft((l) => ({ ...l, [id]: add(l[id], place) })),
    }),
    [boarded, left],
  );

  return <BoardingContext.Provider value={value}>{children}</BoardingContext.Provider>;
}

export function useBoarding() {
  const ctx = useContext(BoardingContext);
  if (!ctx) throw new Error('useBoarding must be used inside BoardingProvider');
  return ctx;
}

/** Passenger lists of these caravans: the mock bookings plus the tickets booked in this app. */
export function useManifests(list: Caravan[]) {
  const { tickets } = useTickets();
  const { user } = useAuth();
  return useMemo(() => {
    const out = new Map<string, Passenger[]>();
    for (const c of list) {
      const mine: Passenger[] = tickets
        .filter((t) => t.caravanId === c.id && t.status !== 'cancelled')
        .map((t) => ({
          ticket: t.id,
          // A transferred ticket travels under the friend's number: the driver checks who shows up.
          name: t.status === 'transferred' ? 'Billet transféré' : `${user?.firstName ?? 'Toi'} ${user?.lastName ?? ''}`.trim(),
          phone: t.status === 'transferred' ? (t.transferredTo ?? '') : (user?.phone ?? ''),
          seat: t.seat,
          pickup: t.pickup,
          dropoff: t.dropoff,
        }));
      out.set(c.id, [...caravanManifest(c), ...mine].sort((a, b) => a.seat - b.seat));
    }
    return out;
  }, [list, tickets, user]);
}
