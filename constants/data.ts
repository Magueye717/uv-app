import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './theme';

type Ionicon = ComponentProps<typeof Ionicons>['name'];

export const user = {
  firstName: 'Awa',
  lastName: 'Diop',
  initials: 'AD',
  campus: 'UGB · Campus social',
  /** Null when living off campus. */
  village: 'Village E' as string | null,
  room: '214' as string | null,
  studentId: '2023 0456 789',
  phone: '+221 77 123 45 67',
  ufr: 'UFR SAT',
  filiere: 'Informatique',
  niveau: 'L3',
};

export const services: {
  key: string;
  label: string;
  icon: Ionicon;
  bg: string;
  tint: string;
  href: string;
}[] = [
  { key: 'resto', label: 'Resto', icon: 'restaurant-outline', bg: colors.primarySoft, tint: colors.primary, href: '/(tabs)/resto' },
  { key: 'caravanes', label: 'Caravanes', icon: 'bus-outline', bg: '#FFE8D4', tint: colors.orange, href: '/(tabs)/caravanes' },
  { key: 'taxi', label: 'Sunu Taxi', icon: 'car-outline', bg: '#EEE8FF', tint: colors.purple, href: '/services/taxi' },
  { key: 'objets', label: 'Objets perdus', icon: 'cube-outline', bg: '#FFE4DC', tint: '#E86A3A', href: '/services/objets' },
  { key: 'bourses', label: 'Bourses', icon: 'school-outline', bg: '#E5F8EC', tint: colors.green, href: '/services/bourses' },
  { key: 'lieux', label: 'Lieux', icon: 'location-outline', bg: '#FFE8D4', tint: colors.orange, href: '/(tabs)/lieux' },
];

export const headlines: {
  id: string;
  tag: string;
  icon: Ionicon;
  tint: string;
  bg: string;
  title: string;
  subtitle: string;
  time: string;
  /** Needs attention now (sold out…): the only headlines shown in red. */
  urgent?: boolean;
}[] = [
  {
    id: 'h1',
    tag: 'Élections',
    icon: 'megaphone-outline',
    tint: colors.purpleText,
    bg: '#EEE8FF',
    title: 'Élections des délégués',
    subtitle: 'Vote jeudi 06 nov. · 8h-17h · salle polyvalente',
    time: 'Jeu. 06',
  },
  {
    id: 'h2',
    tag: 'Resto 1',
    icon: 'restaurant-outline',
    tint: colors.dangerText,
    bg: '#FDECEE',
    title: 'Thiébou dieun épuisé',
    urgent: true,
    subtitle: 'Plus de portions ce midi · Vermicelle et Mafé yap encore servis',
    time: '5 min',
  },
  {
    id: 'h3',
    tag: 'Resto 2',
    icon: 'restaurant-outline',
    tint: colors.orangeText,
    bg: '#FFE8D4',
    title: 'Omelette frites bientôt épuisée',
    subtitle: 'Plus que 12 portions pour le dîner',
    time: '20 min',
  },
  {
    id: 'h4',
    tag: 'Bourses',
    icon: 'wallet-outline',
    tint: colors.successText,
    bg: '#E5F8EC',
    title: 'Paiement des bourses le 05 nov.',
    subtitle: 'Virement sur Wave et Orange Money',
    time: 'Hier',
  },
];


export const campusAlert = {
  id: 'a1',
  href: '/notifications',
  icon: 'warning-outline' as Ionicon,
  title: "Coupure d'eau · Village E",
  subtitle: "Aujourd'hui de 10h à 16h",
};

// `href` = screen in the app, `url` = sponsor's website. With neither, the banner is display-only.
export const adBanners: {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  href?: string;
  url?: string;
}[] = [
  {
    id: 'ad1',
    title: '-20% sur tes forfaits\ninternet étudiants',
    subtitle: "Offre valable jusqu'au 30 nov.",
    cta: "J'en profite",
    bg: colors.purple,
  },
  {
    id: 'ad2',
    title: 'Chez Marie · Grillades',
    subtitle: 'Menu étudiant à 1 000 FCFA ce soir',
    cta: 'Voir',
    bg: colors.orange,
    href: '/resto/r2',
  },
  {
    id: 'ad3',
    title: 'Livraison au pavillon',
    subtitle: 'Gratuite pour ta première commande',
    cta: 'Commander',
    bg: colors.green,
    href: '/(tabs)/resto?vue=restos',
  },
];

export type CaravanDirection = 'aller' | 'retour';

// Mock: departures relative to app start so countdowns always have something to show.
const inDays = (d: number, h = 0, m = 0) => Date.now() + ((d * 24 + h) * 60 + m) * 60 * 1000;

/**
 * Verification level, earned trip after trip:
 * - nouveau: documents checked, paid only after arrival
 * - verifie: 3+ trips rated 4/5 or more
 * - confirme: 10+ trips without serious incident
 */
export type OrganizerLevel = 'nouveau' | 'verifie' | 'confirme';

export type CaravanOrganizer = {
  id: string;
  name: string;
  kind: 'Entreprise' | 'Amicale' | 'Transporteur';
  level: OrganizerLevel;
  /** Average rating out of 5, null before the first rated trip. */
  rating: number | null;
  trips: number;
};

export const organizers = {
  khoule: { id: 'khoule', name: 'Khoulé & Frère', kind: 'Entreprise', level: 'confirme', rating: 4.2, trips: 128 },
  globe: { id: 'globe', name: 'Globe One', kind: 'Entreprise', level: 'confirme', rating: 4.0, trips: 86 },
  amicaleZig: { id: 'amicaleZig', name: 'Amicale de Ziguinchor', kind: 'Amicale', level: 'verifie', rating: 4.7, trips: 5 },
  ndar: { id: 'ndar', name: 'GIE Ndar Transport', kind: 'Transporteur', level: 'nouveau', rating: null, trips: 0 },
} satisfies Record<string, CaravanOrganizer>;

export type Caravan = {
  id: string;
  organizer: CaravanOrganizer;
  /** Checked vehicle: seats are its registered capacity, nothing is sold beyond. */
  vehicle: { label: string; plate: string };
  direction: CaravanDirection;
  from: string;
  to: string;
  date: string;
  /** Leaves the first pickup point at this time. */
  time: string;
  /**
   * Where students can get on, in route order, with the bus's scheduled time at each.
   * The first one is the departure: its time is `time`.
   */
  pickups: CaravanStop[];
  /** Where students can get off, in route order. Times are estimates: traffic decides. */
  dropoffs: CaravanStop[];
  departureAt: number;
  /** Free seats. */
  seats: number;
  /** Registered capacity of the vehicle. */
  totalSeats: number;
  /** Bookings needed for the trip to go ahead; below that everyone is refunded. */
  minPassengers: number;
  /** Last moment to reach `minPassengers`. */
  confirmBy: number;
  price: number;
};

/** A pickup or drop-off point and the bus's time there ("06h15"). */
export type CaravanStop = { place: string; time: string };

const ugbPickups: CaravanStop[] = [
  { place: 'UGB · Village E', time: '' },
  { place: 'UGB · Entrée principale', time: '+10' },
  { place: 'Saint-Louis · Gare routière', time: '+40' },
];
const toDakar: CaravanStop[] = [
  { place: 'Louga · Station Total', time: '+130' },
  { place: 'Kébémer · Carrefour', time: '+160' },
  { place: 'Tivaouane · EDK', time: '+210' },
  { place: 'Thiès · Mairie', time: '+240' },
  { place: 'Rufisque · En face Sococim', time: '+290' },
  { place: 'Dakar · Patte d’Oie', time: '+320' },
  { place: 'Dakar · Colobane', time: '+335' },
];
const fromDakar: CaravanStop[] = [
  { place: 'Dakar · École normale', time: '' },
  { place: 'Pikine · Station Total Bountou', time: '+30' },
  { place: 'Fass Mbao · Arrêt ICS', time: '+45' },
  { place: 'Rufisque · En face Sococim', time: '+70' },
  { place: 'Diamniadio · Hôpital des enfants', time: '+90' },
  { place: 'Thiès · Mairie', time: '+135' },
  { place: 'Tivaouane · EDK', time: '+165' },
  { place: 'Louga · Station Total', time: '+225' },
];
const toUgb: CaravanStop[] = [
  { place: 'UGB · Entrée principale', time: '+300' },
  { place: 'UGB · Village E', time: '+310' },
];

/** Mock schedules: offsets in minutes ("+40") from the departure time become clock times ("15h30"). */
function timetable(time: string, stops: CaravanStop[]): CaravanStop[] {
  const start = toMinutes(time);
  return stops.map((s) => ({ place: s.place, time: fromMinutes(start + Number(s.time || 0)) }));
}

const toMinutes = (t: string) => {
  const [h, m] = t.split('h').map(Number);
  return h * 60 + (m || 0);
};
const fromMinutes = (n: number) => {
  const m = ((n % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}h${String(m % 60).padStart(2, '0')}`;
};

/** When the bus reaches this stop: departure plus the scheduled gap (crosses midnight if needed). */
export function stopDepartureAt(c: Pick<Caravan, 'time' | 'departureAt'>, stop: CaravanStop) {
  const gap = (toMinutes(stop.time) - toMinutes(c.time) + 1440) % 1440;
  return c.departureAt + gap * 60_000;
}

export const caravans: Caravan[] = [
  { id: 'c1', organizer: organizers.khoule, vehicle: { label: 'Bus 64 places', plate: 'DK-4821-BF' }, direction: 'aller', from: 'UGB', to: 'Dakar', date: 'Mer. 03 sept', time: '14h50', pickups: timetable('14h50', ugbPickups), dropoffs: timetable('14h50', toDakar), departureAt: inDays(2, 4, 37), seats: 30, totalSeats: 64, minPassengers: 40, confirmBy: inDays(1, 4), price: 3500 },
  { id: 'c8', organizer: organizers.ndar, vehicle: { label: 'Minibus 30 places', plate: 'SL-2207-AC' }, direction: 'aller', from: 'UGB', to: 'Dakar', date: 'Mer. 03 sept', time: '15h30', pickups: timetable('15h30', ugbPickups.slice(0, 2)), dropoffs: timetable('15h30', toDakar.slice(3)), departureAt: inDays(2, 5, 17), seats: 18, totalSeats: 30, minPassengers: 22, confirmBy: inDays(1, 5), price: 3000 },
  { id: 'c2', organizer: organizers.globe, vehicle: { label: 'Bus 64 places', plate: 'DK-7710-AZ' }, direction: 'aller', from: 'UGB', to: 'Ziguinchor', date: 'Mer. 03 sept', time: '14h50', pickups: timetable('14h50', ugbPickups), dropoffs: timetable('14h50', [{ place: 'Kaolack · Gare routière', time: '+250' }, { place: 'Bignona · Carrefour', time: '+560' }, { place: 'Ziguinchor · Gare routière', time: '+600' }]), departureAt: inDays(2, 5), seats: 15, totalSeats: 64, minPassengers: 40, confirmBy: inDays(1, 5), price: 3500 },
  { id: 'c7', organizer: organizers.amicaleZig, vehicle: { label: 'Bus 60 places', plate: 'ZG-1934-BC' }, direction: 'aller', from: 'UGB', to: 'Ziguinchor', date: 'Jeu. 04 sept', time: '06h00', pickups: timetable('06h00', ugbPickups.slice(0, 1)), dropoffs: timetable('06h00', [{ place: 'Ziguinchor · Gare routière', time: '+600' }, { place: 'Ziguinchor · Boucotte', time: '+615' }, { place: 'Ziguinchor · Lyndiane', time: '+625' }]), departureAt: inDays(3, 1), seats: 34, totalSeats: 60, minPassengers: 40, confirmBy: inDays(2, 1), price: 3200 },
  { id: 'c3', organizer: organizers.khoule, vehicle: { label: 'Bus 64 places', plate: 'DK-4821-BF' }, direction: 'retour', from: 'Dakar', to: 'UGB', date: 'Dim. 07 sept', time: '16h30', pickups: timetable('16h30', fromDakar), dropoffs: timetable('16h30', toUgb), departureAt: inDays(6, 6), seats: 22, totalSeats: 64, minPassengers: 40, confirmBy: inDays(5, 6), price: 3500 },
  { id: 'c4', organizer: organizers.globe, vehicle: { label: 'Bus 64 places', plate: 'DK-7710-AZ' }, direction: 'retour', from: 'Ziguinchor', to: 'UGB', date: 'Dim. 07 sept', time: '08h00', pickups: timetable('08h00', [{ place: 'Ziguinchor · Gare routière', time: '' }, { place: 'Bignona · Carrefour', time: '+40' }]), dropoffs: timetable('08h00', toUgb.map((s) => ({ ...s, time: '+600' }))), departureAt: inDays(5, 22), seats: 6, totalSeats: 64, minPassengers: 40, confirmBy: inDays(4, 22), price: 3500 },
  { id: 'c5', organizer: organizers.globe, vehicle: { label: 'Bus 64 places', plate: 'DK-7710-AZ' }, direction: 'aller', from: 'UGB', to: 'Dakar', date: 'Ven. 05 sept', time: '07h30', pickups: timetable('07h30', ugbPickups), dropoffs: timetable('07h30', [toDakar[3], toDakar[5], toDakar[6]]), departureAt: inDays(4, 1), seats: 41, totalSeats: 64, minPassengers: 40, confirmBy: inDays(3, 1), price: 3500 },
  { id: 'c6', organizer: organizers.khoule, vehicle: { label: 'Bus 64 places', plate: 'DK-5502-BF' }, direction: 'aller', from: 'UGB', to: 'Kaolack', date: 'Sam. 06 sept', time: '10h00', pickups: timetable('10h00', [{ place: 'UGB · Entrée principale', time: '' }]), dropoffs: timetable('10h00', [{ place: 'Louga · Station Total', time: '+130' }, { place: 'Diourbel · Gare routière', time: '+230' }, { place: 'Kaolack · Gare routière', time: '+290' }]), departureAt: inDays(5, 3), seats: 18, totalSeats: 64, minPassengers: 40, confirmBy: inDays(4, 3), price: 3000 },
];

// Mock: spread the occupied seats across the bus, stable per caravan.
export function takenSeats(id: string, total: number, free: number) {
  const taken = new Set<number>();
  let n = id.charCodeAt(id.length - 1) % total;
  while (taken.size < total - free) {
    n = (n + 7) % total; // 7 is coprime with 64, so every seat is reached
    taken.add(n + 1);
  }
  return taken;
}

/** One line of the organizer's passenger list: what the driver needs at each stop. */
export type Passenger = { ticket: string; name: string; phone: string; seat: number; pickup: CaravanStop; dropoff: CaravanStop };

const FIRST = ['Awa', 'Moussa', 'Fatou', 'Ibrahima', 'Aminata', 'Cheikh', 'Mariama', 'Ousmane', 'Khady', 'Mamadou', 'Ndeye', 'Abdou', 'Coumba', 'Pape', 'Aïssatou', 'Babacar'];
const LAST = ['Ndiaye', 'Fall', 'Sow', 'Diallo', 'Sarr', 'Ba', 'Gueye', 'Faye', 'Mbaye', 'Cissé', 'Thiam', 'Seck', 'Kane', 'Diouf'];

/**
 * Mock passenger list for the booked seats. Most students get on at the first stop and get off at the last;
 * the others are spread along the route. Stable per caravan.
 */
export function caravanManifest(c: Caravan): Passenger[] {
  const seats = [...takenSeats(c.id, c.totalSeats, c.seats)].sort((a, b) => a - b);
  const pick = (stops: CaravanStop[], k: number, main: CaravanStop) => (k % 3 === 0 ? stops[k % stops.length] : main);
  return seats.map((seat, i) => {
    const k = seat * 7 + i;
    return {
      ticket: `T${c.id.toUpperCase()}${String(seat).padStart(2, '0')}`,
      name: `${FIRST[k % FIRST.length]} ${LAST[(k * 3) % LAST.length]}`,
      phone: `+221 7${k % 2 ? 7 : 8} ${String(100 + ((k * 37) % 900))} ${String(10 + (k % 89)).padStart(2, '0')} ${String(10 + ((k * 13) % 89)).padStart(2, '0')}`,
      seat,
      pickup: pick(c.pickups, k, c.pickups[0]),
      dropoff: pick(c.dropoffs, k + 1, c.dropoffs[c.dropoffs.length - 1]),
    };
  });
}

/**
 * Organizer accounts are created and verified on the web platform; the app only logs them in.
 * Mock: these phone numbers (digits only, without +221) stand for accounts the platform created.
 * - organizer: a company account, the app opens straight on the organizer space
 * - both: a student who also runs trips or events, switches space from the profile
 */
export type DemoAccount = { kind: 'organizer' | 'both'; organizerId: keyof typeof organizers; firstName: string; lastName: string; initials: string };
export const demoAccounts: Record<string, DemoAccount> = {
  '770000001': { kind: 'organizer', organizerId: 'khoule', firstName: 'Modou', lastName: 'Khoulé', initials: 'MK' },
  '770000002': { kind: 'both', organizerId: 'amicaleZig', firstName: 'Awa', lastName: 'Diop', initials: 'AD' },
};

/** Booked seats and whether the trip has enough passengers to go ahead. */
export function caravanState(c: Caravan) {
  const booked = c.totalSeats - c.seats;
  return { booked, confirmed: booked >= c.minPassengers, missing: Math.max(0, c.minPassengers - booked) };
}

/** Free cancellation until 24 h before departure, then a 10 % fee. Closed once the bus has left. */
export const FREE_CANCEL_MS = 24 * 60 * 60 * 1000;
export const LATE_CANCEL_FEE = 0.1;
export function cancellationRefund(price: number, departureAt: number, now: number) {
  if (now >= departureAt) return null;
  return departureAt - now >= FREE_CANCEL_MS ? price : Math.round(price * (1 - LATE_CANCEL_FEE));
}

// Manual grouping: Hermes' Intl support for fr-FR varies by platform.
export const formatFcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;

const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
/** "mar. 2 sept. à 18h05", built by hand for the same reason. */
export function formatDateTime(ts: number) {
  const d = new Date(ts);
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} à ${d.getHours()}h${min}`;
}

export type PaymentMethod = {
  id: string;
  name: string;
  detail: string;
  /** Initials on the brand-color badge, shown while there's no logo file. */
  short: string;
  bg: string;
  /**
   * Official logo from the provider's merchant / brand kit, e.g.
   * require('@/assets/images/payments/wave.png'). Use only files they provide, per their brand rules.
   */
  logo?: number;
};

export const paymentMethods: PaymentMethod[] = [
  { id: 'wave', name: 'Wave', detail: 'Compte lié · 77 ••• •• 28', short: 'W', bg: '#1DC8F2', logo: require('@/assets/images/payments/wave.jpg') },
  { id: 'om', name: 'Orange Money', detail: 'Paiement mobile instantané', short: 'OM', bg: '#FF7900', logo: require('@/assets/images/payments/orange-money.png') },
];

export type DishStatus = 'available' | 'low' | 'critical';

// Service hours of the public restaurants (24h clock).
export const mealTimes = {
  lunch: { label: 'Déjeuner', start: 12, end: 15 },
  dinner: { label: 'Dîner', start: 19, end: 21 },
};

export const publicMenus = [
  {
    id: 'resto1',
    name: 'Menu Resto 1',
    count: 3,
    hours: 'Ouvert · 12h-15h',
    dishes: [
      { name: 'Vermicelle', detail: 'Poulet · légumes', status: 'available' as DishStatus },
      { name: 'Mafé yap', detail: 'Riz · sauce arachide', status: 'low' as DishStatus },
      { name: 'Thiébou dieun', detail: 'Riz au poisson', status: 'critical' as DishStatus },
    ],
    dinner: [
      { name: 'Couscous poulet', detail: 'Semoule · légumes', status: 'available' as DishStatus },
      { name: 'Spaghetti viande', detail: 'Sauce tomate', status: 'available' as DishStatus },
      { name: 'Niébé', detail: 'Haricots · pain', status: 'low' as DishStatus },
    ],
  },
  {
    id: 'resto2',
    name: 'Menu Resto 2',
    count: 2,
    hours: 'Ouvert · 12h-15h',
    dishes: [
      { name: 'Pailla', detail: 'Riz · viande', status: 'available' as DishStatus },
      { name: 'Thiou Carry', detail: 'Riz · poulet', status: 'available' as DishStatus },
    ],
    dinner: [
      { name: 'Ndambé', detail: 'Haricots · pain', status: 'available' as DishStatus },
      { name: 'Omelette frites', detail: 'Œufs · pommes de terre', status: 'critical' as DishStatus },
    ],
  },
];

/** A dish or a drink. `photo` is a local file (require) or an image URL. */
export type RestoMenu = { id: string; name: string; detail: string; price: number; photo?: number | string };

export type PrivateResto = {
  id: string;
  name: string;
  kind: string;
  /** Display text, e.g. "13h-15h · 19h-21h". */
  hours: string;
  /** Same hours as numbers (24h clock), used to know if it's open now. */
  services: { start: number; end: number }[];
  /** Set by the restaurant, in FCFA: 0 means free delivery, null means no delivery. */
  deliveryFee: number | null;
  /** Shown when there's no photo; matches the kind of food. */
  icon: Ionicon;
  /** Cover photo: a local file, e.g. require('@/assets/images/restos/khoule.jpg'), or an image URL. */
  photo?: number | string;
  tint: string;
  bg: string;
  location: string;
  phone: string;
  /** Menus of the day (2 or 3 in practice). */
  menus: RestoMenu[];
  drinks: RestoMenu[];
};

// Placeholder stock photos until the restaurants send their own.
const stockPhoto = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;

// Drinks most campus restaurants sell; each restaurant lists the ones it has.
const drinks = {
  bissap: { id: 'bissap', name: 'Bissap', detail: 'Jus d’hibiscus · 33 cl', price: 300, photo: stockPhoto('1595981267035-7b04ca84a82d') },
  gingembre: { id: 'gingembre', name: 'Gingembre', detail: 'Jus de gingembre · 33 cl', price: 300, photo: stockPhoto('1513558161293-cdaf765ed2fd') },
  orange: { id: 'orange', name: 'Jus d’orange', detail: 'Pressé · 33 cl', price: 500, photo: stockPhoto('1600271886742-f049cd451bba') },
  ataya: { id: 'ataya', name: 'Ataya', detail: 'Thé à la menthe', price: 100, photo: stockPhoto('1571934811356-5cc061b6821f') },
  eau: { id: 'eau', name: 'Eau minérale', detail: 'Bouteille · 50 cl', price: 250, photo: stockPhoto('1548839140-29a749e1cf4d') },
} satisfies Record<string, RestoMenu>;

export const privateCampuses: { id: string; name: string; count: number; restaurants: PrivateResto[] }[] = [
  {
    id: 'campus1',
    name: 'Campus 1',
    count: 3,
    restaurants: [
      {
        id: 'r1', name: 'Khoulé & Frère', kind: 'Sénégalais', hours: '13h-15h · 19h-21h',
        services: [{ start: 13, end: 15 }, { start: 19, end: 21 }], deliveryFee: 200, icon: 'restaurant', photo: stockPhoto('1512058564366-18510be2db19'),
        tint: colors.primary, bg: colors.primarySoft, location: 'Près village E', phone: '+221 77 790 28 80',
        menus: [
          { id: 'r1m1', name: 'Mafé yap', detail: 'Riz · sauce arachide', price: 1500, photo: stockPhoto('1588166524941-3bf61a9c41db') },
          { id: 'r1m2', name: 'Thiébou dieun', detail: 'Riz au poisson', price: 1800, photo: stockPhoto('1559847844-5315695dadae') },
          { id: 'r1m3', name: 'Yassa poulet', detail: 'Riz · poulet · oignons', price: 1700, photo: stockPhoto('1604908176997-125f25cc6f3d') },
        ],
        drinks: [drinks.bissap, drinks.gingembre, drinks.ataya, drinks.eau],
      },
      {
        id: 'r2', name: 'Chez Marie', kind: 'Grillades', hours: '12h-15h · 19h-22h',
        services: [{ start: 12, end: 15 }, { start: 19, end: 22 }], deliveryFee: null, icon: 'flame', photo: stockPhoto('1555939594-58d7cb561ad1'),
        tint: colors.orange, bg: '#FFE8D4', location: 'Campus 1 · pavillon A', phone: '+221 77 412 10 55',
        menus: [
          { id: 'r2m1', name: 'Poulet braisé', detail: 'Frites · salade', price: 2000, photo: stockPhoto('1561651823-34feb02250e4') },
          { id: 'r2m2', name: 'Dibi agneau', detail: 'Oignons · moutarde', price: 2500, photo: stockPhoto('1529692236671-f1f6cf9683ba') },
        ],
        drinks: [drinks.bissap, drinks.orange, drinks.eau],
      },
      {
        id: 'r3', name: 'Le goût', kind: 'Plats du jour', hours: '12h-16h',
        services: [{ start: 12, end: 16 }], deliveryFee: 150, icon: 'fast-food', photo: stockPhoto('1504674900247-0877df9cc836'),
        tint: colors.green, bg: '#E5F8EC', location: 'Campus 1 · près de la BU', phone: '+221 76 220 41 07',
        menus: [
          { id: 'r3m1', name: 'Domoda', detail: 'Riz · sauce tomate', price: 1500, photo: stockPhoto('1574484284002-952d92456975') },
          { id: 'r3m2', name: 'Soupe kandia', detail: 'Riz · gombo', price: 1700, photo: stockPhoto('1547592180-85f173990554') },
          { id: 'r3m3', name: 'Riz au poisson', detail: 'Poisson frit · légumes', price: 1500, photo: stockPhoto('1580476262798-bddd9f4b7369') },
        ],
        drinks: [drinks.bissap, drinks.gingembre, drinks.eau],
      },
    ],
  },
  {
    id: 'campus2',
    name: 'Campus 2',
    count: 2,
    restaurants: [
      {
        id: 'r4', name: 'Chez Fatou', kind: 'Riz & sauces', hours: '12h-15h · 19h-21h',
        services: [{ start: 12, end: 15 }, { start: 19, end: 21 }], deliveryFee: 0, icon: 'restaurant', photo: stockPhoto('1585937421612-70a008356fbe'),
        tint: colors.purple, bg: '#EEE8FF', location: 'Campus 2 · entrée', phone: '+221 78 301 66 92',
        menus: [
          { id: 'r4m1', name: 'Mafé', detail: 'Riz · sauce arachide', price: 1500, photo: stockPhoto('1585937421612-70a008356fbe') },
          { id: 'r4m2', name: 'Thiou Carry', detail: 'Riz · poulet', price: 1600, photo: stockPhoto('1617093727343-374698b1b08d') },
        ],
        drinks: [drinks.bissap, drinks.gingembre, drinks.ataya, drinks.eau],
      },
      {
        id: 'r5', name: 'Le Coin du Village E', kind: 'Snacks', hours: '10h-22h',
        services: [{ start: 10, end: 22 }], deliveryFee: 100, icon: 'pizza', photo: stockPhoto('1568901346375-23c9450c58cd'),
        tint: colors.primary, bg: colors.primarySoft, location: 'Village E', phone: '+221 77 555 12 34',
        menus: [
          { id: 'r5m1', name: 'Chawarma', detail: 'Poulet · crudités', price: 1000, photo: stockPhoto('1633321702518-7feccafb94d5') },
          { id: 'r5m2', name: 'Burger frites', detail: 'Bœuf · fromage', price: 1500, photo: stockPhoto('1551782450-a2132b4ba21d') },
          { id: 'r5m3', name: 'Pain thon', detail: 'Thon · oignons', price: 500, photo: stockPhoto('1539252554453-80ab65ce3586') },
        ],
        drinks: [drinks.orange, drinks.bissap, drinks.gingembre, drinks.eau],
      },
    ],
  },
];

/** A private restaurant and its campus; falls back to the first one for unknown ids. */
export function findPrivateResto(id: string | null | undefined) {
  const campus = privateCampuses.find((c) => c.restaurants.some((r) => r.id === id)) ?? privateCampuses[0];
  const resto = campus.restaurants.find((r) => r.id === id) ?? campus.restaurants[0];
  return { campus, resto };
}

/** Opening state from a restaurant's service hours, e.g. "Ouvert · jusqu'à 15h" / "Fermé · ouvre à 19h". */
export function restoStatus(services: { start: number; end: number }[], now: number) {
  const d = new Date(now);
  const h = d.getHours() + d.getMinutes() / 60;
  const current = services.find((s) => h >= s.start && h < s.end);
  if (current) return { open: true, label: `Ouvert · jusqu'à ${current.end}h` };
  const next = services.find((s) => h < s.start);
  return { open: false, label: next ? `Fermé · ouvre à ${next.start}h` : `Fermé · demain ${services[0].start}h` };
}

export const placeCategories = ['Tout', 'Études', 'Restauration', 'Services', 'Sport', 'Santé'] as const;
export type PlaceCategory = Exclude<(typeof placeCategories)[number], 'Tout'>;

const placeTone: Record<PlaceCategory, { tint: string; bg: string; text: string }> = {
  Études: { tint: colors.purple, bg: '#EEE8FF', text: colors.purpleText },
  Restauration: { tint: colors.orange, bg: '#FFE8D4', text: colors.orangeText },
  Services: { tint: colors.primary, bg: colors.primarySoft, text: colors.primary },
  Sport: { tint: colors.green, bg: '#E5F8EC', text: colors.successText },
  Santé: { tint: colors.danger, bg: '#FDECEE', text: colors.dangerText },
};

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  /** Where it is, in words students use: "Campus social · près du Village E". */
  area: string;
  /** GPS point for directions. */
  coords: { lat: number; lng: number };
  /** 1 to 3 photos, the first one is the cover. Local files (require) or image URLs. */
  photos: (number | string)[];
  hours?: string;
  icon: Ionicon;
  tint: string;
  bg: string;
  /** Category color for small text (contrast on white). */
  text: string;
};

// Approximate points around UGB (Sanar) for the mock: replace with GPS readings taken on site.
const ugb = (dLat: number, dLng: number) => ({ lat: 16.0617 + dLat, lng: -16.4236 + dLng });

export const places: Place[] = (
  [
    { id: 'p1', name: 'Bibliothèque universitaire', category: 'Études', area: 'Campus pédagogique · face à l’amphi A', coords: ugb(0.0012, 0.0004), hours: '8h-22h · lun.-sam.', icon: 'book-outline', photos: [stockPhoto('1521587760476-6c12a4b040da'), stockPhoto('1481627834876-b7833e8f5570'), stockPhoto('1568667256549-094345857637')], description: 'Salles de lecture, wifi et prêt de livres avec la carte étudiant. Calme garanti pour réviser.' },
    { id: 'p6', name: 'Rectorat · Scolarité', category: 'Études', area: 'Entrée principale', coords: ugb(-0.0021, 0.0015), hours: '8h-16h · lun.-ven.', icon: 'business-outline', photos: [stockPhoto('1562774053-701939374585'), stockPhoto('1586773860418-d37222d8fce3')], description: 'Inscriptions, attestations et relevés de notes. Viens tôt en période d’inscription.' },
    { id: 'p2', name: 'Amphithéâtre A', category: 'Études', area: 'Campus pédagogique', coords: ugb(0.0016, -0.0003), icon: 'school-outline', photos: [stockPhoto('1524178232363-1fb2b075b655'), stockPhoto('1606761568499-6d2451b23c66'), stockPhoto('1541829070764-84a7d30dd3f3')], description: 'Le plus grand amphi du campus, utilisé pour les cours magistraux et les conférences.' },
    { id: 'p5', name: 'Resto 1', category: 'Restauration', area: 'Campus social · près du Village A', coords: ugb(-0.0008, -0.0019), hours: '12h-15h · 19h-21h', icon: 'restaurant-outline', photos: [stockPhoto('1567521464027-f127ff144326'), stockPhoto('1555396273-367ea4eb4db5')], description: 'Restaurant universitaire : menus du jour au ticket. Les menus sont sur l’accueil de l’app.' },
    { id: 'p7', name: 'Barbier du Village E', category: 'Services', area: 'Campus social · Village E', coords: ugb(-0.0014, -0.0028), hours: '9h-21h · tous les jours', icon: 'cut-outline', photos: [stockPhoto('1585747860715-2ba37e788b70'), stockPhoto('1599351431202-1e0f0137899a'), stockPhoto('1621605815971-fbc98d665033')], description: 'Coupe, dégradé et barbe. Tarif étudiant sur présentation de la carte.' },
    { id: 'p8', name: 'Copy Center', category: 'Services', area: 'Campus pédagogique · sous la BU', coords: ugb(0.001, 0.0007), hours: '8h-20h · lun.-sam.', icon: 'print-outline', photos: [stockPhoto('1612815154858-60aa4c59eaa6'), stockPhoto('1497633762265-9d179a990aa6')], description: 'Photocopies, impression de mémoires, reliure et plastification.' },
    { id: 'p9', name: 'Boutique du campus', category: 'Services', area: 'Campus social · entre les villages C et D', coords: ugb(-0.0019, -0.0011), hours: '7h-23h · tous les jours', icon: 'storefront-outline', photos: [stockPhoto('1604719312566-8912e9227c6a'), stockPhoto('1534723452862-4c874018d66d')], description: 'Produits du quotidien, crédit téléphone, boissons fraîches et fournitures.' },
    { id: 'p3', name: 'Terrain de sport', category: 'Sport', area: 'Derrière le Village G', coords: ugb(-0.0031, -0.0006), hours: '7h-20h', icon: 'football-outline', photos: [stockPhoto('1574629810360-7efbbe195018'), stockPhoto('1551958219-acbc608c6377'), stockPhoto('1461896836934-ffe607ba8211')], description: 'Terrain de foot et piste d’athlétisme. Matchs inter-UFR le week-end.' },
    { id: 'p4', name: 'Centre médical', category: 'Santé', area: 'Campus social · près de l’entrée', coords: ugb(-0.0017, 0.0009), hours: '8h-18h · urgences 24h/24', icon: 'medkit-outline', photos: [stockPhoto('1519494026892-80bbd2d6fd0d'), stockPhoto('1538108149393-fbbd81895907')], description: 'Consultations gratuites pour les étudiants inscrits, pharmacie de base et urgences.' },
  ] as Omit<Place, 'tint' | 'bg' | 'text'>[]
).map((p) => ({ ...p, ...placeTone[p.category] }));

export type LostStatus = 'found' | 'lost';

/**
 * Cards are never photographed (name, face and number would be public):
 * a student card is scanned to warn its owner, an ID card only shows a first name and initial.
 */
export type LostKind = 'student-card' | 'id-card' | 'object';

/** What the item is. Hints adapt the form to the type of object. */
export type LostCategory = {
  id: string;
  label: string;
  icon: Ionicon;
  kind: LostKind;
  /** Placeholder for the public description. */
  hint?: string;
  /** Placeholder for the private detail the finder uses to check the owner. */
  secretHint?: string;
};

export const lostCategories: LostCategory[] = [
  { id: 'student-card', label: 'Carte étudiant', icon: 'card-outline', kind: 'student-card' },
  { id: 'id-card', label: 'Carte d’identité', icon: 'id-card-outline', kind: 'id-card' },
  { id: 'phone', label: 'Téléphone', icon: 'phone-portrait-outline', kind: 'object', hint: 'Marque, couleur, coque…', secretHint: 'Fond d’écran, autocollant au dos…' },
  { id: 'keys', label: 'Clés', icon: 'key-outline', kind: 'object', hint: 'Nombre de clés, porte-clé…', secretHint: 'Forme ou inscription du porte-clé…' },
  { id: 'bag', label: 'Sac', icon: 'bag-handle-outline', kind: 'object', hint: 'Type, couleur, marque…', secretHint: 'Ce qu’il y a dedans…' },
  { id: 'wallet', label: 'Portefeuille', icon: 'wallet-outline', kind: 'object', hint: 'Couleur, matière…', secretHint: 'Contenu, nom sur une carte…' },
  { id: 'earphones', label: 'Écouteurs', icon: 'headset-outline', kind: 'object', hint: 'Marque, couleur, boîtier…', secretHint: 'Marque ou rayure sur le boîtier…' },
  { id: 'glasses', label: 'Lunettes', icon: 'glasses-outline', kind: 'object', hint: 'Monture, couleur, étui…', secretHint: 'Étui, inscription sur la branche…' },
  { id: 'clothes', label: 'Vêtement', icon: 'shirt-outline', kind: 'object', hint: 'Type, couleur, taille…', secretHint: 'Taille, étiquette, objet dans la poche…' },
  { id: 'calculator', label: 'Calculatrice', icon: 'calculator-outline', kind: 'object', hint: 'Marque, modèle…', secretHint: 'Nom gravé, autocollant…' },
  { id: 'other', label: 'Autre', icon: 'cube-outline', kind: 'object', hint: 'Couleur, marque, signes distinctifs…', secretHint: 'Un détail qui ne se voit pas sur la photo…' },
];

export const lostCategory = (id: string) => lostCategories.find((c) => c.id === id) ?? lostCategories[lostCategories.length - 1];

/** Lost and found office: where found items can be dropped and collected. Details to confirm with the university. */
export const lostOffice = {
  name: 'Bureau des objets trouvés',
  area: 'Rectorat · rez-de-chaussée',
  hours: '8h-16h · lun.-ven.',
  coords: { lat: 16.0596, lng: -16.4221 },
};

export type LostItem = {
  id: string;
  category: string;
  kind: LostKind;
  name: string;
  /** Public description: color, brand… */
  details?: string;
  where: string;
  /** More precise spot: "2e étage, près de la fenêtre". */
  spot?: string;
  when: string;
  status: LostStatus;
  /** Found items only: dropped at the office or kept by the finder. */
  holder?: 'office' | 'finder';
  /** Required for found objects, optional for lost ones, never for cards. */
  photo?: number | string;
  /** Who declared it, masked: the finder for found items, the owner for lost ones. */
  by: string;
  /** Declared by me. */
  mine?: boolean;
  /** Private check detail, only kept on the declarer's side. */
  secret?: string;
  /** Cards only: "Awa D." — never the full name or the number. */
  owner?: string;
  /** Student card scanned and owner warned in the app. */
  ownerNotified?: boolean;
  /** Back with its owner: the case is closed. */
  returned?: boolean;
  tint: string;
  bg: string;
};

export const lostItems: LostItem[] = [
  { id: 'o1', category: 'student-card', kind: 'student-card', name: 'Carte étudiant', where: 'BU', when: 'Il y a 2 h', status: 'found', holder: 'office', by: 'Aminata B.', owner: 'Cheikh N.', ownerNotified: true, tint: colors.primary, bg: colors.primarySoft },
  { id: 'o7', category: 'id-card', kind: 'id-card', name: 'Carte d’identité', where: 'Resto 1', when: 'Hier', status: 'found', holder: 'office', by: 'Ousmane F.', owner: 'Mariama S.', tint: colors.purple, bg: '#EEE8FF' },
  { id: 'o2', category: 'bag', kind: 'object', name: 'Sac en toile', details: 'Beige, sans marque', where: 'Amphi A', spot: 'Dernier rang', when: 'Hier', status: 'found', holder: 'finder', by: 'Moussa S.', photo: stockPhoto('1544816155-12df9643f363'), tint: colors.orange, bg: '#FFE8D4' },
  { id: 'o3', category: 'bag', kind: 'object', name: 'Sac à dos bleu', details: 'Bleu nuit, logo jaune', where: 'Resto 1', when: 'Hier', status: 'found', holder: 'office', by: 'Moussa S.', photo: stockPhoto('1553062407-98eeb64c6a62'), tint: colors.purple, bg: '#EEE8FF' },
  { id: 'o4', category: 'phone', kind: 'object', name: 'Téléphone', details: 'Coque transparente', where: 'Village E', spot: 'Banc devant le pavillon', when: 'Lun.', status: 'found', holder: 'finder', by: 'Khadim K.', photo: stockPhoto('1511707171634-5f897ff02aa9'), tint: colors.green, bg: '#E5F8EC' },
  { id: 'o5', category: 'calculator', kind: 'object', name: 'Calculatrice Casio', details: 'fx-92, nom au dos', where: 'Amphi A', when: 'Hier', status: 'lost', by: 'Ibrahima D.', tint: colors.primary, bg: colors.primarySoft },
  { id: 'o6', category: 'glasses', kind: 'object', name: 'Lunettes de vue', details: 'Monture écaille, étui noir', where: 'Resto 2', when: 'Mar.', status: 'lost', by: 'Fatou N.', photo: stockPhoto('1591076482161-42ce6da69f67'), tint: colors.orange, bg: '#FFE8D4' },
];

/** Shown on found items kept by a student, and in every conversation. */
export const lostSafetyTip = 'Retrouvez-vous dans un lieu public du campus (BU, Resto 1). Ne partage pas ton numéro.';

export const lostQuickReplies = ['Je suis disponible maintenant', 'On se retrouve à la BU ?', 'Devant le Resto 1 ?', 'Merci beaucoup !'];

export type LostMessage = {
  id: string;
  itemId: string;
  /** 'me', 'them' (the other student), or none for system lines. */
  author?: 'me' | 'them';
  text: string;
  at: number;
};

/** Where students usually lose things: quick choices in the forms. */
export const lostPlaces = ['BU', 'Resto 1', 'Resto 2', 'Amphi A', 'Village E', 'Autre'];

/**
 * Mock student directory, by student number (digits only), as the card's barcode would give it.
 * The real lookup happens on the server: the app only ever gets back a first name and initial.
 */
export const studentDirectory: Record<string, { owner: string }> = {
  '20230456789': { owner: 'Awa D.' },
  '20210112233': { owner: 'Cheikh N.' },
  '20220987654': { owner: 'Fatou N.' },
};

export const weekDays = [
  { id: 'mon', short: 'LUN', day: '27' },
  { id: 'tue', short: 'MAR', day: '28' },
  { id: 'wed', short: 'MER', day: '29' },
  { id: 'thu', short: 'JEU', day: '30' },
  { id: 'fri', short: 'VEN', day: '31' },
  { id: 'sat', short: 'SAM', day: '01' },
];

export type CourseKind = 'CM' | 'TD' | 'TP';

export const schedule: Record<
  string,
  { id: string; start: string; end: string; title: string; room: string; teacher: string; kind: CourseKind; movedFrom?: string }[]
> = {
  mon: [
    { id: 's1', start: '08:00', end: '10:00', title: 'Analyse 2', room: 'Amphi B', teacher: 'Pr. Diop', kind: 'CM' },
    { id: 's2', start: '11:00', end: '13:00', title: 'Algorithmique', room: 'Salle 12', teacher: 'Dr. Ba', kind: 'TD', movedFrom: '10h' },
    { id: 's3', start: '14:30', end: '17:30', title: 'TP Réseaux', room: 'Labo Info 3', teacher: 'M. Fall', kind: 'TP' },
  ],
  tue: [
    { id: 's4', start: '08:00', end: '10:00', title: 'Bases de données', room: 'Amphi A', teacher: 'Dr. Sow', kind: 'CM' },
    { id: 's5', start: '10:30', end: '12:30', title: 'Anglais', room: 'Salle 4', teacher: 'Mme Ndiaye', kind: 'TD' },
  ],
  wed: [{ id: 's6', start: '09:00', end: '12:00', title: 'Programmation web', room: 'Labo Info 1', teacher: 'M. Gueye', kind: 'TP' }],
  thu: [
    { id: 's7', start: '08:00', end: '10:00', title: 'Analyse 2', room: 'Amphi B', teacher: 'Pr. Diop', kind: 'TD' },
    { id: 's8', start: '15:00', end: '17:00', title: 'Systèmes', room: 'Amphi C', teacher: 'Dr. Kane', kind: 'CM' },
  ],
  fri: [{ id: 's9', start: '10:00', end: '12:00', title: 'Algorithmique', room: 'Amphi A', teacher: 'Dr. Ba', kind: 'CM' }],
  sat: [],
};

export const notificationFilters = ['Tout', 'Social', 'Cours', 'Paiements'] as const;
export type NotificationCategory = Exclude<(typeof notificationFilters)[number], 'Tout'>;

export const notifications: {
  id: string;
  title: string;
  body: string;
  time: string;
  day: 'today' | 'yesterday';
  category: NotificationCategory;
  icon: Ionicon;
  tint: string;
  bg: string;
}[] = [
  { id: 'n1', title: 'Menu resto : stock limité', body: 'Thiébou dieun · plus que 9', time: '5 min', day: 'today', category: 'Social', icon: 'restaurant-outline', tint: colors.orange, bg: '#FFE8D4' },
  { id: 'n2', title: 'Réunion urgente', body: 'Amphi A · aujourd’hui à 17h', time: '12 min', day: 'today', category: 'Social', icon: 'megaphone-outline', tint: colors.purple, bg: '#EEE8FF' },
  { id: 'n3', title: 'Bourse : paiement disponible', body: 'Ton virement est prêt sur Wave', time: '1 h', day: 'today', category: 'Paiements', icon: 'wallet-outline', tint: colors.green, bg: '#E5F8EC' },
  { id: 'n4', title: 'Carte étudiant retrouvée', body: 'Récupère-la à la scolarité', time: '2 h', day: 'today', category: 'Social', icon: 'cube-outline', tint: colors.danger, bg: '#FDECEE' },
  { id: 'n5', title: 'Caravane confirmée', body: 'UGB → Dakar · Mer. 03 sept', time: 'Hier', day: 'yesterday', category: 'Paiements', icon: 'bus-outline', tint: colors.primary, bg: colors.primarySoft },
  { id: 'n6', title: 'Cours déplacé', body: 'Algorithmique · 11h, Salle 12', time: 'Hier', day: 'yesterday', category: 'Cours', icon: 'calendar-outline', tint: colors.primary, bg: colors.primarySoft },
];

export const ufrs = ['UFR SAT', 'UFR LSH', 'UFR SES', 'UFR 2S', 'UFR CRAC'];
export const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];

// Sunu Taxi: a student proposes a trip, others join and split the fare.
const inMinutes = (m: number) => Date.now() + m * 60 * 1000;

export type TaxiTrip = {
  id: string;
  organizer: {
    name: string;
    initials: string;
    trips: number;
    /** Cancellations in the last 30 days less than TAXI_LOCK_MIN before departure, with passengers in. */
    lateCancels: number;
  };
  from: string;
  to: string;
  departureAt: number;
  /** Seats in the taxi, organizer included. */
  seats: number;
  /** Initials of everyone already in, organizer first. Each passenger has paid their seat. */
  passengers: string[];
  /** Passengers who said they're at the meeting point. */
  checkedIn: string[];
  /** Whole fare in FCFA. */
  fare: number;
  departed?: boolean;
  /** Pinned by the organizer in the chat, e.g. "Peugeot 406 jaune · DK-1234-A". */
  taxi?: string;
};

/** First names of the mock students, by initials (messages show names, never phone numbers). */
export const taxiPeople: Record<string, string> = {
  MS: 'Moussa',
  FN: 'Fatou',
  ID: 'Ibrahima',
  AB: 'Aminata',
  KS: 'Khadim',
};

/** Trip chat stays open this long after departure, then becomes read-only. */
export const TAXI_CHAT_HOURS = 2;

export const taxiQuickReplies = [
  'J’arrive dans 5 min',
  'Je suis au point de rendez-vous',
  'Je suis en retard',
  'Je ne trouve pas le taxi',
];

export type TaxiMessage = {
  id: string;
  tripId: string;
  /** Initials of the author; system messages have none. */
  author?: string;
  text: string;
  at: number;
};

export const taxiMessages: TaxiMessage[] = [
  { id: 'm1', tripId: 't1', text: 'Fatou a rejoint le trajet', at: inMinutes(-40) },
  { id: 'm2', tripId: 't1', author: 'MS', text: 'Salut ! Je serai devant le Village E, à côté de la boutique.', at: inMinutes(-35) },
  { id: 'm3', tripId: 't1', author: 'FN', text: 'Parfait, merci 👍', at: inMinutes(-33) },
  { id: 'm4', tripId: 't3', text: 'Ibrahima est là ✓', at: inMinutes(-5) },
];

/** Seats are locked this many minutes before departure: leaving is no longer refunded. */
export const TAXI_LOCK_MIN = 30;
/** Late cancellations (30 days) before Sunu Taxi is suspended for 7 days. */
export const TAXI_STRIKES_LIMIT = 3;

/**
 * Fixed price per seat, paid when joining: the fare split as if the taxi were full.
 * The organizer covers empty seats, so passengers always know what they pay.
 */
export const taxiSeatPrice = (t: Pick<TaxiTrip, 'fare' | 'seats'>) => Math.ceil(t.fare / t.seats / 50) * 50;

export const taxiTrips: TaxiTrip[] = [
  {
    id: 't1',
    organizer: { name: 'Moussa Sow', initials: 'MS', trips: 23, lateCancels: 0 },
    from: 'UGB · Village E',
    to: 'Saint-Louis · Gare routière',
    departureAt: inMinutes(45),
    seats: 4,
    passengers: ['MS', 'FN'],
    checkedIn: [],
    fare: 3000,
  },
  {
    id: 't2',
    organizer: { name: 'Fatou Ndiaye', initials: 'FN', trips: 8, lateCancels: 0 },
    from: 'UGB · Campus 2',
    to: 'Saint-Louis · Centre-ville',
    departureAt: inMinutes(130),
    seats: 4,
    passengers: ['FN'],
    checkedIn: [],
    fare: 2500,
  },
  {
    id: 't3',
    organizer: { name: 'Ibrahima Diallo', initials: 'ID', trips: 4, lateCancels: 2 },
    from: 'UGB · Entrée principale',
    to: 'Gandon · Marché',
    departureAt: inMinutes(20),
    seats: 4,
    passengers: ['ID', 'AB', 'KS'],
    checkedIn: ['ID'],
    fare: 2000,
  },
];
