import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CaravanSummary, FillBar } from '@/components/caravan';
import { EmptyState } from '@/components/states';
import { Field, Segmented } from '@/components/ui';
import { caravans, formatFcfa, type Caravan, type CaravanDirection } from '@/constants/data';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useTickets } from '@/context/TicketsContext';
import { matches } from '@/lib/search';

/**
 * Buses stop along the way: a student from Thiès takes the UGB → Dakar bus too.
 * Returns the stop that matched (drop-offs first on the way out, pickups first on the way back), or null.
 */
function findStop(c: Caravan, query: string) {
  const hit = (kind: 'pickup' | 'dropoff') => {
    const stop = (kind === 'pickup' ? c.pickups : c.dropoffs).find((s) => matches(query, [s.place]));
    return stop ? { kind, stop } : null;
  };
  return c.direction === 'aller' ? (hit('dropoff') ?? hit('pickup')) : (hit('pickup') ?? hit('dropoff'));
}

/** Screen content without header or safe area: used by a tab and by its standalone page. */
export function CaravanBoard() {
  const [direction, setDirection] = useState<CaravanDirection>('aller');
  const [query, setQuery] = useState('');
  const q = query.trim();
  const list = caravans
    .filter((c) => c.direction === direction)
    .map((c) => ({ c, via: q ? findStop(c, q) : null }))
    .filter(({ c, via }) => !q || via || matches(q, [c.from, c.to, c.organizer.name]));
  const { tickets, ticketFor } = useTickets();
  const active = tickets.filter((t) => t.status === 'active');

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Réserve ton billet</Text>
            <Text style={styles.heroSub}>Place assise garantie · remboursé si le départ est annulé · Wave ou Orange Money.</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="bus-outline" size={26} color="#fff" />
          </View>
        </View>

        {active.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.section}>Mes billets</Text>
            {active.map((t) => {
              const c = caravans.find((x) => x.id === t.caravanId);
              if (!c) return null;
              return (
                <Pressable
                  key={t.id}
                  style={[styles.ticket, shadow.card]}
                  onPress={() => router.push(`/billet/${t.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Billet ${c.from} vers ${c.to}, ${c.date}, place ${t.seat}`}>
                  <View style={styles.ticketIcon}>
                    <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketRoute}>
                      {c.from} → {c.to}
                    </Text>
                    <Text style={styles.ticketMeta}>
                      {c.date} · {t.pickup.time} · Place {t.seat}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        )}

        <Segmented
          options={[
            { value: 'aller', label: 'Aller' },
            { value: 'retour', label: 'Retour' },
          ]}
          value={direction}
          onChange={setDirection}
        />

        <Field
          icon="search"
          placeholder={direction === 'aller' ? 'Où descends-tu ? Louga, Thiès, Dakar…' : 'Où montes-tu ? Pikine, Rufisque, Thiès…'}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Rechercher une ville ou un arrêt"
          right={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Effacer la recherche">
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null
          }
        />

        {list.length === 0 && (
          <EmptyState
            icon="bus-outline"
            title={`Aucune caravane ne passe par « ${q} »`}
            text={direction === 'aller' ? 'Essaie la grande ville la plus proche, ou regarde les retours.' : 'Essaie la grande ville la plus proche, ou regarde les allers.'}
            action={{ label: 'Effacer la recherche', onPress: () => setQuery('') }}
          />
        )}

        {list.map(({ c, via }) => {
          const mine = ticketFor(c.id);
          return (
            <View key={c.id} style={[styles.card, shadow.card]}>
              <CaravanSummary caravan={c} via={via ?? undefined} />
              <FillBar caravan={c} />
              <View style={styles.rowBetween}>
                {/* Price next to the action: what you pay, right where you decide. */}
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.price}>{formatFcfa(c.price)}</Text>
                  <Text style={styles.seats} numberOfLines={1}>
                    {c.seats > 0 ? `${c.seats} libres` : 'Complet'} · {c.vehicle.label}
                  </Text>
                </View>
                {mine ? (
                  <Pressable style={[styles.book, styles.bookMine]} onPress={() => router.push(`/billet/${mine.id}`)}>
                    <Ionicons name="ticket-outline" size={14} color={colors.primary} />
                    <Text style={[styles.bookText, { color: colors.primary }]}>Mon billet</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.book, !c.seats && styles.bookOff]}
                    disabled={!c.seats}
                    onPress={() => router.push(`/caravane/${c.id}`)}>
                    <Text style={styles.bookText}>Réserver</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: { ...typo.h3, color: '#fff' },
  heroSub: { ...typo.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 17 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { ...typo.h3, color: colors.navy },
  seats: { fontSize: 12, fontWeight: '600', color: colors.muted2, marginTop: 1 },
  bookOff: { backgroundColor: colors.tabInactive },
  bookMine: { flexDirection: 'row', gap: 5, backgroundColor: colors.primarySoft },
  section: { ...typo.title, color: colors.navy },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 12 },
  ticketIcon: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  ticketRoute: { ...typo.title, color: colors.navy },
  ticketMeta: { ...typo.caption, color: colors.muted2, marginTop: 2 },
  book: {
    backgroundColor: colors.accent,
    paddingHorizontal: 22,
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { color: '#fff', fontWeight: '700' },
});
