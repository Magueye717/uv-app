import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { caravans, findPrivateResto } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useLost } from '@/context/LostContext';
import { useTaxi } from '@/context/TaxiContext';
import { useTickets } from '@/context/TicketsContext';
import { useNow } from '@/lib/useNow';

type Item = { key: string; icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; href: Href };

const hhmm = (at: number) => {
  const d = new Date(at);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

/** "En cours": tickets, taxi trip, basket and lost-and-found conversations, in one place. Hidden when empty. */
export function InProgress() {
  const now = useNow();
  const { tickets } = useTickets();
  const taxi = useTaxi();
  const cart = useCart();
  const lost = useLost();

  const items: Item[] = [];
  for (const t of tickets) {
    const c = caravans.find((x) => x.id === t.caravanId);
    if (t.status !== 'active' || !c || c.departureAt < now) continue;
    items.push({ key: t.id, icon: 'ticket-outline', title: `Caravane ${c.from} → ${c.to}`, detail: `${c.date} · ${c.time} · place ${t.seat}`, href: `/billet/${t.id}` });
  }
  const trip = taxi.activeTrip();
  if (trip) {
    items.push({
      key: trip.id,
      icon: 'car-outline',
      title: `Taxi vers ${trip.to.split(' · ').pop()}`,
      detail: `Départ ${hhmm(trip.departureAt)} · ${trip.passengers.length}/${trip.seats} places`,
      href: `/trajet/${trip.id}`,
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
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  label: { flex: 1, fontSize: 11, fontWeight: '700', color: colors.muted2, letterSpacing: 0.5 },
  count: { fontSize: 12, fontWeight: '700', color: colors.muted2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: colors.navy },
  detail: { fontSize: 12, color: colors.muted2, marginTop: 1 },
});
