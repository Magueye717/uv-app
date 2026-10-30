import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './theme';

type Ionicon = ComponentProps<typeof Ionicons>['name'];

export const user = {
  firstName: 'Awa',
  lastName: 'Diop',
  initials: 'AD',
  campus: 'UGB · Campus social',
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
  { key: 'resto', label: 'Resto', icon: 'restaurant-outline', bg: '#E8F0FF', tint: colors.primary, href: '/(tabs)/resto' },
  { key: 'caravanes', label: 'Caravanes', icon: 'bus-outline', bg: '#FFE8D4', tint: colors.orange, href: '/(tabs)/caravanes' },
  { key: 'livraison', label: 'Livraison', icon: 'car-outline', bg: '#EEE8FF', tint: colors.purple, href: '/services/livraison' },
  { key: 'objets', label: 'Objets perdus', icon: 'cube-outline', bg: '#FFE4DC', tint: '#E86A3A', href: '/services/objets' },
  { key: 'bourses', label: 'Bourses', icon: 'school-outline', bg: '#E5F8EC', tint: colors.green, href: '/services/bourses' },
  { key: 'cours', label: 'Cours', icon: 'calendar-outline', bg: '#E8F0FF', tint: colors.primary, href: '/services/cours' },
  { key: 'lieux', label: 'Lieux', icon: 'location-outline', bg: '#FFE8D4', tint: colors.orange, href: '/(tabs)/lieux' },
  { key: 'inscription', label: 'Inscription', icon: 'book-outline', bg: '#EEE8FF', tint: colors.purple, href: '/services/inscription' },
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
    title: '-20% sur vos forfaits\ninternet étudiants',
    subtitle: "Offre valable jusqu'au 30 nov.",
    cta: "J'en profite",
    bg: colors.purple,
  },
  {
    id: 'ad2',
    title: 'Chez Marie · Grillades',
    subtitle: 'Menu étudiant à 1 000 F ce soir',
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
    href: '/services/livraison',
  },
];

export type CaravanDirection = 'aller' | 'retour';

// Mock: departures relative to app start so countdowns always have something to show.
const inDays = (d: number, h = 0, m = 0) => Date.now() + ((d * 24 + h) * 60 + m) * 60 * 1000;

// `seats` = free seats, `totalSeats` = bus capacity.
export const caravans: {
  id: string;
  company: string;
  direction: CaravanDirection;
  from: string;
  to: string;
  date: string;
  time: string;
  meetingPoint: string;
  departureAt: number;
  seats: number;
  totalSeats: number;
  price: number;
}[] = [
  { id: 'c1', company: 'Khoulé & Frère', direction: 'aller', from: 'UGB', to: 'Dakar', date: 'Mer. 03 sept', time: '14h50', meetingPoint: 'Devant village E', departureAt: inDays(2, 4, 37), seats: 30, totalSeats: 64, price: 3500 },
  { id: 'c2', company: 'Globe One', direction: 'aller', from: 'UGB', to: 'Ziguinchor', date: 'Mer. 03 sept', time: '14h50', meetingPoint: 'Devant village E', departureAt: inDays(2, 5), seats: 15, totalSeats: 64, price: 3500 },
  { id: 'c3', company: 'Khoulé & Frère', direction: 'retour', from: 'Dakar', to: 'UGB', date: 'Dim. 07 sept', time: '16h30', meetingPoint: 'Gare des Baux Maraîchers', departureAt: inDays(6, 6), seats: 22, totalSeats: 64, price: 3500 },
  { id: 'c4', company: 'Globe One', direction: 'retour', from: 'Ziguinchor', to: 'UGB', date: 'Dim. 07 sept', time: '08h00', meetingPoint: 'Gare routière', departureAt: inDays(5, 22), seats: 6, totalSeats: 64, price: 3500 },
  { id: 'c5', company: 'Globe One', direction: 'aller', from: 'UGB', to: 'Dakar', date: 'Ven. 05 sept', time: '07h30', meetingPoint: 'Devant village E', departureAt: inDays(4, 1), seats: 41, totalSeats: 64, price: 3500 },
  { id: 'c6', company: 'Khoulé & Frère', direction: 'aller', from: 'UGB', to: 'Kaolack', date: 'Sam. 06 sept', time: '10h00', meetingPoint: 'Entrée principale', departureAt: inDays(5, 3), seats: 18, totalSeats: 64, price: 3000 },
];

// Manual grouping: Hermes' Intl support for fr-FR varies by platform.
export const formatFcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;

export const paymentMethods = [
  { id: 'wave', name: 'Wave', detail: 'Compte lié · 77 ••• •• 28', short: 'W', bg: '#1DC8F2' },
  { id: 'om', name: 'Orange Money', detail: 'Paiement mobile instantané', short: 'OM', bg: '#FF7900' },
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

export const privateCampuses = [
  {
    id: 'campus1',
    name: 'Campus 1',
    count: 7,
    restaurants: [
      { id: 'r1', name: 'Khoulé & Frère', kind: 'Sénégalais · près village E', hours: '13h-15h · 19h-21h', open: true, tint: colors.primary, bg: '#E8F0FF', location: 'Près village E', phone: '+221 77 790 28 80' },
      { id: 'r2', name: 'Chez Marie', kind: 'Sénégalais · grillades', hours: '12h-15h · 19h-22h', open: true, tint: colors.orange, bg: '#FFE8D4', location: 'Campus 1 · pavillon A', phone: '+221 77 412 10 55' },
      { id: 'r3', name: 'Le goût', kind: 'Plats du jour', hours: '12h-16h', open: true, tint: colors.green, bg: '#E5F8EC', location: 'Campus 1 · près de la BU', phone: '+221 76 220 41 07' },
    ],
  },
  {
    id: 'campus2',
    name: 'Campus 2',
    count: 2,
    restaurants: [
      { id: 'r4', name: 'Chez Fatou', kind: 'Sénégalais · riz & sauces', hours: '12h-15h · 19h-21h', open: true, tint: colors.purple, bg: '#EEE8FF', location: 'Campus 2 · entrée', phone: '+221 78 301 66 92' },
      { id: 'r5', name: 'Le Coin du Village E', kind: 'Snacks · sandwiches', hours: '10h-22h', open: true, tint: colors.primary, bg: '#E8F0FF', location: 'Village E', phone: '+221 77 555 12 34' },
    ],
  },
];

export const menuOfDay = [
  { id: 'd1', name: 'Mafé yap', detail: 'Riz · sauce arachide', price: 1500, tint: colors.primary, bg: '#E8F0FF' },
  { id: 'd2', name: 'Thiébou dieun', detail: 'Riz au poisson', price: 1800, tint: colors.orange, bg: '#FFE8D4' },
  { id: 'd3', name: 'Yassa dieun', detail: 'Riz · poulet · oignons', price: 1700, tint: colors.green, bg: '#E5F8EC' },
  { id: 'd4', name: 'Bissap', detail: 'Jus frais · 50 cl', price: 500, tint: colors.purple, bg: '#EEE8FF' },
];

export const placeCategories = ['Tout', 'Études', 'Restauration', 'Sport', 'Santé'] as const;
export type PlaceCategory = Exclude<(typeof placeCategories)[number], 'Tout'>;

const placeTone: Record<PlaceCategory, { tint: string; bg: string }> = {
  Études: { tint: colors.purple, bg: '#EEE8FF' },
  Restauration: { tint: colors.orange, bg: '#FFE8D4' },
  Sport: { tint: colors.green, bg: '#E5F8EC' },
  Santé: { tint: colors.danger, bg: '#FDECEE' },
};

export const places = (
  [
    { id: 'p1', name: 'Bibliothèque universitaire', category: 'Études', walk: '4 min à pied', icon: 'book-outline' },
    { id: 'p2', name: 'Amphithéâtre A', category: 'Études', walk: '6 min à pied', icon: 'school-outline' },
    { id: 'p3', name: 'Terrain de sport', category: 'Sport', walk: '9 min à pied', icon: 'pulse-outline' },
    { id: 'p4', name: 'Centre médical', category: 'Santé', walk: '7 min à pied', icon: 'medkit-outline' },
    { id: 'p5', name: 'Resto 1', category: 'Restauration', walk: '3 min à pied', icon: 'restaurant-outline' },
  ] as { id: string; name: string; category: PlaceCategory; walk: string; icon: Ionicon }[]
).map((p) => ({ ...p, ...placeTone[p.category] }));

export type LostStatus = 'found' | 'lost';

export const lostItems: {
  id: string;
  name: string;
  where: string;
  when: string;
  status: LostStatus;
  pickup: string;
  icon: Ionicon;
  tint: string;
  bg: string;
}[] = [
  { id: 'o1', name: 'Carte étudiant', where: 'BU', when: '2 h', status: 'found', pickup: 'À récupérer', icon: 'card-outline', tint: colors.primary, bg: '#E8F0FF' },
  { id: 'o2', name: 'Clés + porte-clé', where: 'Amphi B', when: 'Hier', status: 'found', pickup: 'À récupérer', icon: 'key-outline', tint: colors.orange, bg: '#FFE8D4' },
  { id: 'o3', name: 'Sac à dos noir', where: 'Resto U', when: 'Hier', status: 'found', pickup: 'Au bureau', icon: 'briefcase-outline', tint: colors.purple, bg: '#EEE8FF' },
  { id: 'o4', name: 'Téléphone', where: 'Pavillon E', when: 'Lun.', status: 'found', pickup: 'À récupérer', icon: 'phone-portrait-outline', tint: colors.green, bg: '#E5F8EC' },
  { id: 'o5', name: 'Calculatrice Casio', where: 'Salle 12', when: 'Hier', status: 'lost', pickup: 'Recherché', icon: 'calculator-outline', tint: colors.primary, bg: '#E8F0FF' },
  { id: 'o6', name: 'Lunettes de vue', where: 'Resto 2', when: 'Mar.', status: 'lost', pickup: 'Recherché', icon: 'glasses-outline', tint: colors.orange, bg: '#FFE8D4' },
];

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
  { id: 'n5', title: 'Caravane confirmée', body: 'UGB → Dakar · Mer. 03 sept', time: 'Hier', day: 'yesterday', category: 'Paiements', icon: 'bus-outline', tint: colors.primary, bg: '#E8F0FF' },
  { id: 'n6', title: 'Cours déplacé', body: 'Algorithmique · 11h, Salle 12', time: 'Hier', day: 'yesterday', category: 'Cours', icon: 'calendar-outline', tint: colors.primary, bg: '#E8F0FF' },
];

export const ufrs = ['UFR SAT', 'UFR LSH', 'UFR SES', 'UFR 2S', 'UFR CRAC'];
export const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
