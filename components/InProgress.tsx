import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { findPrivateResto } from '@/constants/data';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useLost } from '@/context/LostContext';
import { orderSteps, useOrders } from '@/context/OrdersContext';
import { useTaxi } from '@/context/TaxiContext';
import { useCaravans } from '@/context/CaravansContext';
import { dayLabel, hourLabel } from '@/features/caravans/api';
import { useNow } from '@/lib/useNow';

type Item = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  href: Href;
  /** Quick action right in the row (e.g. check in at the taxi meeting point). */
  action?: { label: string; onPress: () => void };
};

const hhmm = (at: number) => {
  const d = new Date(at);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

/** "En cours": tickets, taxi trip, basket and lost-and-found conversations, in one place. Hidden when empty. */
export function InProgress() {
  const now = useNow();
  const { tickets } = useCaravans();
  const taxi = useTaxi();
  const cart = useCart();
  const lost = useLost();
  const { orders } = useOrders();

  const items: Item[] = [];
  // Food orders first: they move fastest.
  for (const o of orders) {
    if (o.status === 'done') continue;
    const step = orderSteps(o.mode).find((x) => x.key === o.status)!;
    items.push({ key: o.id, icon: 'receipt-outline', title: `Commande · ${findPrivateResto(o.restoId).resto.name}`, detail: step.title, href: `/commande/${o.id}` });
  }
  for (const t of tickets) {
    const at = Date.parse(t.event.startsAt);
    if (t.status !== 'active' || at < now) continue;
    const pickup = Date.parse(t.details.pickup.at);
    items.push({ key: t.id, icon: 'ticket-outline', title: `Caravane ${t.event.title}`, detail: `${dayLabel(at)} · ${hourLabel(pickup)} · ${t.details.pickup.place}`, href: `/billet/${t.id}` });
  }
  const trip = taxi.activeTrip();
  if (trip) {
    items.push({
      key: trip.id,
      icon: 'car-outline',
      title: `Taxi vers ${trip.to.split(' · ').pop()}`,
      detail: (() => {
        const unread = taxi.unreadFor(trip.id);
        if (trip.myStatus === 'pending_payment') return `Place gardée · paiement à terminer`;
        const base = `Départ ${hhmm(trip.departureAt)} · ${trip.seatsTaken}/${trip.seats} places`;
        return unread ? `${base} · ${unread} nouveau${unread > 1 ? 'x' : ''} message${unread > 1 ? 's' : ''}` : base;
      })(),
      href: `/taxi/${trip.id}`,
      // Seats locked and not checked in yet: one tap from home.
      action:
        trip.myStatus === 'joined' && trip.passengers[0] !== taxi.me && now >= trip.lockAt && !trip.checkedIn.includes(taxi.me)
          ? { label: 'Je suis là', onPress: () => taxi.checkIn(trip.id).catch(() => undefined) }
          : undefined,
    });
  }
  if (cart.count && cart.restoId) {
    items.push({
      key: 'cart',
      icon: 'bag-handle-outline',
      title: `Panier · ${findPrivateResto(cart.restoId).resto.name}`,
      detail: `${cart.count} article${cart.count > 1 ? 's' : ''} · à finaliser`,
      href: '/panier',
    });
  }
  for (const i of lost.items) {
    if (i.returned || !lost.messages.some((m) => m.itemId === i.id)) continue;
    items.push({ key: i.id, icon: 'chatbubbles-outline', title: i.name, detail: 'Discussion objet perdu en cours', href: `/objet/discussion/${i.id}` });
  }

  if (!items.length) return null;
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.head}>
        <View style={styles.live} />
        <Text style={styles.label}>EN COURS</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>
      {items.slice(0, 3).map((it, i) => (
        <Pressable
          key={it.key}
          onPress={() => router.push(it.href)}
          style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`${it.title}, ${it.detail}`}>
          <View style={styles.icon}>
            <Ionicons name={it.icon} size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {it.title}
            </Text>
            <Text style={styles.detail} numberOfLines={1}>
              {it.detail}
            </Text>
          </View>
          {it.action ? (
            <Pressable style={styles.action} onPress={it.action.onPress} hitSlop={6} accessibilityRole="button">
              <Ionicons name="hand-left-outline" size={14} color="#fff" />
              <Text style={styles.actionText}>{it.action.label}</Text>
            </Pressable>
          ) : (
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  label: { ...typo.label, flex: 1, color: colors.muted2, letterSpacing: 0.5 },
  count: { ...typo.captionStrong, color: colors.muted2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...typo.title, color: colors.navy },
  detail: { ...typo.caption, color: colors.muted2, marginTop: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: colors.accent },
  actionText: { ...typo.smallStrong, color: '#fff' },
});
