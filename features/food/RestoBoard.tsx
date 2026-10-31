import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterChips } from '@/components/ui';
import { formatFcfa, privateCampuses, restoStatus, type PrivateResto } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useNow } from '@/lib/useNow';

const FILTERS = ['Campus 1', 'Campus 2', 'Tous'] as const;
type Filter = (typeof FILTERS)[number];

// Menus shown per card; the rest are on the restaurant page.
const MAX_MENUS = 3;


type ListedResto = PrivateResto & { campus: string; status: ReturnType<typeof restoStatus> };

// Private restaurants with their menus of the day. Public Resto U menus are on the home screen.
/** Screen content without header or safe area: used by a tab and by its standalone page. */
export function RestoBoard() {
  const now = useNow();
  const [filter, setFilter] = useState<Filter>('Tous');

  const all: ListedResto[] = privateCampuses.flatMap((c) =>
    c.restaurants.map((r) => ({ ...r, campus: c.name, status: restoStatus(r.services, now) })),
  );
  const openCount = all.filter((r) => r.status.open).length;

  const restaurants = all
    .filter((r) => filter === 'Tous' || r.campus === filter)
    // Open restaurants first; the list order is kept otherwise.
    .sort((a, b) => Number(b.status.open) - Number(a.status.open));

  return (
    <>
      <View style={{ marginTop: 14 }}>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={[styles.dot, { backgroundColor: openCount ? colors.success : colors.muted }]} />
          <Text style={styles.summaryText}>
            {openCount} ouvert{openCount > 1 ? 's' : ''} maintenant · {all.length} restaurants
          </Text>
        </View>

        {restaurants.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={28} color={colors.muted} />
            <Text style={styles.emptyText}>Aucun restaurant pour ce filtre.</Text>
          </View>
        )}

        {restaurants.map((r) => (
          <RestoCard key={r.id} resto={r} />
        ))}
      </ScrollView>
    </>
  );
}

function RestoCard({ resto: r }: { resto: ListedResto }) {
  const open = r.status.open;
  const hidden = r.menus.length - MAX_MENUS;
  const from = Math.min(...r.menus.map((m) => m.price));
  const openMenu = () => router.push(`/resto/${r.id}`);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, shadow.raised, pressed && styles.pressed]}
      onPress={openMenu}
      accessibilityRole="button"
      accessibilityLabel={`${r.name}, ${r.status.label}, menus dès ${formatFcfa(from)}`}>
      {/* Inner layer clips the cover to the rounded corners; the outer one keeps the shadow. */}
      <View style={styles.clip}>
        <View style={[styles.cover, { backgroundColor: r.bg }]}>
          {r.photo ? (
            <Image source={r.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <Ionicons name={r.icon} size={40} color={r.tint} />
          )}
          <View style={[styles.pill, styles.status]}>
            <View style={[styles.dot, { backgroundColor: open ? colors.success : colors.muted }]} />
            <Text style={[styles.pillText, { color: open ? colors.successText : colors.muted2 }]}>{r.status.label}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.order, !open && styles.orderClosed, pressed && { opacity: 0.86 }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={open ? `Commander chez ${r.name}` : `Voir le menu de ${r.name}`}
            onPress={openMenu}>
            <Ionicons name={open ? 'bag-handle' : 'restaurant-outline'} size={14} color={open ? '#fff' : colors.navy} />
            <Text style={[styles.orderText, !open && { color: colors.navy }]}>{open ? 'Commander' : 'Voir le menu'}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {r.name}
              </Text>
              {/* Location and delivery on separate lines: neither gets cut. */}
              <Text style={styles.sub} numberOfLines={1}>
                {/* Some locations already name the campus ("Campus 1 · pavillon A"). */}
                {r.kind} · {r.location.startsWith(r.campus) ? r.location : `${r.campus} · ${r.location}`}
              </Text>
              {r.deliveryFee !== null && (
                  <View style={styles.delivery}>
                    <Ionicons name="bicycle-outline" size={13} color={colors.primary} />
                    <Text style={styles.deliveryText}>{r.deliveryFee ? `Livraison ${formatFcfa(r.deliveryFee)}` : 'Livraison gratuite'}</Text>
                  </View>
                )}
            </View>
            <Pressable
              style={styles.call}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={`Appeler ${r.name}`}
              onPress={() => Linking.openURL(`tel:${r.phone.replace(/\s/g, '')}`)}>
              <Ionicons name="call" size={16} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.menus}>
            <View style={styles.menusHead}>
              <Text style={styles.menusTitle}>Menus du jour</Text>
              <Text style={styles.from}>dès {formatFcfa(from)}</Text>
            </View>
            {/* One line per menu: name, then the detail in grey. */}
            {r.menus.slice(0, MAX_MENUS).map((m, i) => (
              <View key={m.id} style={[styles.menuRow, i > 0 && styles.menuDivider]}>
                <Text style={styles.menuName} numberOfLines={1}>
                  {m.name}
                  <Text style={styles.menuDetail}> · {m.detail}</Text>
                </Text>
                <Text style={[styles.price, !open && { color: colors.muted2 }]}>{formatFcfa(m.price)}</Text>
              </View>
            ))}
            {hidden > 0 && (
              <Text style={styles.more}>
                + {hidden} autre{hidden > 1 ? 's' : ''} menu{hidden > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingTop: 16, gap: 14, paddingBottom: 32 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 13, fontWeight: '600', color: colors.muted2 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyText: { color: colors.muted2 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg },
  clip: { borderRadius: radii.lg, overflow: 'hidden' },
  pressed: { transform: [{ scale: 0.99 }] },
  cover: { height: 100, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 12, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 16, fontWeight: '700', color: colors.navy },
  sub: { flexShrink: 1, fontSize: 12, color: colors.muted2 },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  deliveryText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  // White pills on the photo so they stay readable on any image.
  pill: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
  },
  status: { left: 8 },
  // Layered on the photo: orders without making the card taller. Closed restaurants only show the menu.
  order: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  orderClosed: { backgroundColor: colors.card },
  orderText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pillText: { fontSize: 11, fontWeight: '700' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  menus: { backgroundColor: colors.input, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 8 },
  menusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  menusTitle: { fontSize: 11, fontWeight: '700', color: colors.muted2, textTransform: 'uppercase', letterSpacing: 0.6 },
  from: { fontSize: 12, fontWeight: '700', color: colors.navy },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  menuDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  menuName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  menuDetail: { fontSize: 12, fontWeight: '400', color: colors.muted2 },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary },
  more: { fontSize: 12, fontWeight: '600', color: colors.muted2, paddingTop: 4 },
  call: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
