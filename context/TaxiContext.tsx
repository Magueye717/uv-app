import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { TAXI_LOCK_MIN, taxiMessages, taxiPeople, taxiTrips, type TaxiMessage, type TaxiTrip } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';
import { haptics } from '@/lib/haptics';
import { cancelTaxiReminder, scheduleTaxiReminder } from '@/lib/notifications';

type NewTrip = Pick<TaxiTrip, 'from' | 'to' | 'departureAt' | 'seats' | 'fare'>;

type TaxiValue = {
  me: string;
  trips: TaxiTrip[];
  messages: TaxiMessage[];
  /** Late cancellations over the last 30 days (mock). */
  strikes: number;
  /** Students whose messages I don't want to see. */
  blocked: string[];
  /** Other students' messages since I last opened this trip's chat. */
  unreadFor: (tripId: string) => number;
  /** Called while the chat is on screen. */
  markRead: (tripId: string) => void;
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
  const [lastRead, setLastRead] = useState<Record<string, number>>({});

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
      unreadFor: (tripId) =>
        messages.filter((m) => m.tripId === tripId && m.author && m.author !== me && m.at > (lastRead[tripId] ?? 0)).length,
      markRead: (tripId) => setLastRead((r) => ({ ...r, [tripId]: Date.now() })),
      nameOf,
      activeTrip,
      create: (trip) => {
        if (activeTrip()) return;
        const id = `t_${Date.now()}`;
        const organizer = { name: user ? `${user.firstName} ${user.lastName}` : 'Toi', initials: me, trips: 0, lateCancels: strikes };
        setTrips((ts) => [{ ...trip, id, organizer, passengers: [me], checkedIn: [] }, ...ts]);
        post(id, 'Trajet publié. La discussion est réservée aux passagers qui ont payé leur place.');
        scheduleTaxiReminder({ id, from: trip.from, departureAt: trip.departureAt }, TAXI_LOCK_MIN);
      },
      join: (id) => {
        if (activeTrip()) return;
        update(id, (t) => ({ passengers: [...t.passengers, me] }));
        haptics.success();
        post(id, `${nameOf(me)} a rejoint le trajet`);
        const trip = trips.find((t) => t.id === id);
        if (trip) scheduleTaxiReminder(trip, TAXI_LOCK_MIN);
      },
      leave: (id) => {
        update(id, (t) => ({ passengers: t.passengers.filter((p) => p !== me), checkedIn: t.checkedIn.filter((p) => p !== me) }));
        post(id, `${nameOf(me)} a quitté le trajet`);
        cancelTaxiReminder(id);
      },
      cancel: (id, late) => {
        setTrips((ts) => ts.filter((t) => t.id !== id));
        if (late) setStrikes((n) => n + 1);
        cancelTaxiReminder(id);
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
        cancelTaxiReminder(id);
      },
      checkIn: (id) => {
        // Once is enough, whichever button or quick reply was used.
        if (trips.find((t) => t.id === id)?.checkedIn.includes(me)) return;
        update(id, (t) => ({ checkedIn: [...t.checkedIn, me] }));
        haptics.success();
        post(id, `${nameOf(me)} est là ✓`);
        cancelTaxiReminder(id);
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
  }, [me, user, trips, messages, strikes, blocked, lastRead]);

  return <TaxiContext.Provider value={value}>{children}</TaxiContext.Provider>;
}

export function useTaxi() {
  const ctx = useContext(TaxiContext);
  if (!ctx) throw new Error('useTaxi must be used inside TaxiProvider');
  return ctx;
}
