import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaravanSummary, FillBar } from '@/components/caravan';
import { ScreenHeader, Segmented } from '@/components/ui';
import { caravans, type CaravanDirection } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useTickets } from '@/context/TicketsContext';

export default function CaravanesScreen() {
  const [direction, setDirection] = useState<CaravanDirection>('aller');
  const list = caravans.filter((c) => c.direction === direction);
  const { tickets, ticketFor } = useTickets();
  const active = tickets.filter((t) => t.status === 'active');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Caravanes" subtitle="Réserve ton billet en ligne" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Réserve ton ticket</Text>
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
                      {c.date} · {c.time} · Place {t.seat}
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

        {list.map((c) => {
          const mine = ticketFor(c.id);
          return (
            <View key={c.id} style={[styles.card, shadow.card]}>
              <CaravanSummary caravan={c} />
              <FillBar caravan={c} />
              <View style={styles.rowBetween}>
                <Text style={styles.seats}>
                  {c.seats > 0 ? `${c.seats} places libres` : 'Complet'} · {c.vehicle.label}
                </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, lineHeight: 17 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 14, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seats: { flexShrink: 1, fontSize: 12, fontWeight: '600', color: colors.muted2 },
  bookOff: { backgroundColor: colors.tabInactive },
  bookMine: { flexDirection: 'row', gap: 5, backgroundColor: colors.primarySoft },
  section: { fontSize: 16, fontWeight: '800', color: colors.navy },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 12 },
  ticketIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  ticketRoute: { fontSize: 15, fontWeight: '800', color: colors.navy },
  ticketMeta: { fontSize: 12, color: colors.muted2, marginTop: 2 },
  book: {
    backgroundColor: colors.accent,
    paddingHorizontal: 22,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { color: '#fff', fontWeight: '700' },
});
