import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { taxiMessages, taxiPeople, taxiTrips, type TaxiMessage, type TaxiTrip } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';

type NewTrip = Pick<TaxiTrip, 'from' | 'to' | 'departureAt' | 'seats' | 'fare'>;

type TaxiValue = {
  me: string;
  trips: TaxiTrip[];
  messages: TaxiMessage[];
  /** Late cancellations over the last 30 days (mock). */
  strikes: number;
  /** Students whose messages I don't want to see. */
  blocked: string[];
  nameOf: (initials: string) => string;
  create: (trip: NewTrip) => void;
  join: (id: string) => void;
  leave: (id: string) => void;
  cancel: (id: string, late: boolean) => void;
  /** Organizer leaves; the first passenger who joined organizes the trip instead. No strike. */
  handOver: (id: string) => void;
  /** The trip I organize or ride in, not departed yet: a student is in one trip at a time. */
  activeTrip: () => TaxiTrip | undefined;
  checkIn: (id: string) => void;
  depart: (id: string) => void;
  send: (tripId: string, text: string) => void;
  pinTaxi: (tripId: string, taxi: string) => void;
  block: (initials: string) => void;
};

const TaxiContext = createContext<TaxiValue | null>(null);

// Mock store for Sunu Taxi trips and their chats, until there's a realtime backend.
export function TaxiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const me = user?.initials ?? 'AD';
  const [trips, setTrips] = useState<TaxiTrip[]>(taxiTrips);
  const [messages, setMessages] = useState<TaxiMessage[]>(taxiMessages);
  const [strikes, setStrikes] = useState(0);
  const [blocked, setBlocked] = useState<string[]>([]);

  const value = useMemo<TaxiValue>(() => {
    const nameOf = (initials: string) => (initials === me ? (user?.firstName ?? 'Toi') : (taxiPeople[initials] ?? initials));
    const update = (id: string, patch: (t: TaxiTrip) => Partial<TaxiTrip>) =>
      setTrips((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch(t) } : t)));
    const post = (tripId: string, text: string, author?: string) =>
      setMessages((ms) => [...ms, { id: `m_${Date.now()}_${ms.length}`, tripId, author, text, at: Date.now() }]);
    // Trips stay "active" up to 15 min after their time, like the list on the Sunu Taxi screen.
    const activeTrip = () =>
      trips.find((t) => !t.departed && t.passengers.includes(me) && t.departureAt > Date.now() - 15 * 60_000);

    return {
      me,
      trips,
      messages,
      strikes,
      blocked,
      nameOf,
      activeTrip,
      create: (trip) => {
        if (activeTrip()) return;
        const id = `t_${Date.now()}`;
        const organizer = { name: user ? `${user.firstName} ${user.lastName}` : 'Toi', initials: me, trips: 0, lateCancels: strikes };
        setTrips((ts) => [{ ...trip, id, organizer, passengers: [me], checkedIn: [] }, ...ts]);
        post(id, 'Trajet publié. La discussion est réservée aux passagers qui ont payé leur place.');
      },
      join: (id) => {
        if (activeTrip()) return;
        update(id, (t) => ({ passengers: [...t.passengers, me] }));
        post(id, `${nameOf(me)} a rejoint le trajet`);
      },
      leave: (id) => {
        update(id, (t) => ({ passengers: t.passengers.filter((p) => p !== me), checkedIn: t.checkedIn.filter((p) => p !== me) }));
        post(id, `${nameOf(me)} a quitté le trajet`);
      },
      cancel: (id, late) => {
        setTrips((ts) => ts.filter((t) => t.id !== id));
        if (late) setStrikes((n) => n + 1);
      },
      handOver: (id) => {
        const trip = trips.find((t) => t.id === id);
        const next = trip?.passengers.find((p) => p !== me);
        if (!trip || !next) return;
        // Mock: the new organizer accepts at once. A real flow asks them first.
        update(id, (t) => ({
          organizer: { name: nameOf(next), initials: next, trips: 0, lateCancels: 0 },
          passengers: [next, ...t.passengers.filter((p) => p !== me && p !== next)],
          checkedIn: t.checkedIn.filter((p) => p !== me),
        }));
        post(id, `${nameOf(me)} a passé le relais. ${nameOf(next)} organise maintenant le trajet.`);
      },
      checkIn: (id) => {
        update(id, (t) => ({ checkedIn: [...t.checkedIn, me] }));
        post(id, `${nameOf(me)} est là ✓`);
      },
      depart: (id) => {
        update(id, () => ({ departed: true }));
        post(id, 'Vous êtes partis 🚕 Bon trajet !');
      },
      send: (tripId, text) => post(tripId, text.trim(), me),
      pinTaxi: (tripId, taxi) => {
        update(tripId, () => ({ taxi }));
        post(tripId, `Taxi indiqué : ${taxi}`);
      },
      block: (initials) => setBlocked((b) => (b.includes(initials) ? b : [...b, initials])),
    };
  }, [me, user, trips, messages, strikes, blocked]);

  return <TaxiContext.Provider value={value}>{children}</TaxiContext.Provider>;
}

export function useTaxi() {
  const ctx = useContext(TaxiContext);
  if (!ctx) throw new Error('useTaxi must be used inside TaxiProvider');
  return ctx;
}
