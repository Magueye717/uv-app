import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaravanSummary } from '@/components/caravan';
import { BackButton } from '@/components/ui';
import { caravans, formatFcfa, paymentMethods } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { scheduleCaravanReminder } from '@/lib/notifications';

const SEATS_PER_ROW = 4;
const SERVICE_FEE = 0;

// Mock: spread the occupied seats across the bus, stable per caravan.
function takenSeats(id: string, total: number, free: number) {
  const taken = new Set<number>();
  let n = id.charCodeAt(id.length - 1) % total;
  while (taken.size < total - free) {
    n = (n + 7) % total; // 7 is coprime with 64, so every seat is reached
    taken.add(n + 1);
  }
  return taken;
}

export default function CaravaneReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = caravans.find((x) => x.id === id) ?? caravans[0];
  const taken = useMemo(() => takenSeats(c.id, c.totalSeats, c.seats), [c.id, c.totalSeats, c.seats]);
  const [seat, setSeat] = useState<number | null>(null);
  const [payment, setPayment] = useState(paymentMethods[0].id);

  const rows = Array.from({ length: c.totalSeats / SEATS_PER_ROW }, (_, r) =>
    Array.from({ length: SEATS_PER_ROW }, (_, i) => r * SEATS_PER_ROW + i + 1),
  );
  const total = c.price + SERVICE_FEE;

  const pay = () => {
    scheduleCaravanReminder(c);
    const method = paymentMethods.find((m) => m.id === payment)?.name;
    Alert.alert('Paiement envoyé', `Valide le paiement de ${formatFcfa(total)} sur ${method}. Ton ticket arrivera par notification.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.h1}>Réserver ma place</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, shadow.card]}>
          <CaravanSummary caravan={c} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Choisis ta place</Text>
          <Text style={styles.free}>{c.seats} places libres</Text>
        </View>
        <View style={styles.legend}>
          <Legend style={styles.seatFree} label="Libre" />
          <Legend style={styles.seatTaken} label="Occupée" />
          <Legend style={styles.seatSelected} label="Choisie" />
        </View>

        <View style={[styles.card, styles.busCard, shadow.card]}>
          <View style={styles.front}>
            <Ionicons name="bus-outline" size={12} color={colors.primary} />
            <Text style={styles.frontText}>Avant du bus</Text>
          </View>
          {rows.map((row) => (
            <View key={row[0]} style={styles.seatRow}>
              {row.map((n, i) => {
                const isTaken = taken.has(n);
                const isSelected = seat === n;
                return (
                  <Pressable
                    key={n}
                    disabled={isTaken}
                    onPress={() => setSeat(isSelected ? null : n)}
                    style={[
                      styles.seat,
                      i === 2 && styles.afterAisle,
                      isTaken ? styles.seatTaken : isSelected ? styles.seatSelected : styles.seatFree,
                    ]}>
                    <Text style={[styles.seatText, isTaken && { color: colors.muted }, isSelected && { color: '#fff' }]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.section}>Moyen de paiement</Text>
        {paymentMethods.map((m) => {
          const on = m.id === payment;
          return (
            <Pressable key={m.id} onPress={() => setPayment(m.id)} style={[styles.card, styles.payment, on && styles.paymentOn]}>
              <View style={[styles.payLogo, { backgroundColor: m.bg }]}>
                <Text style={styles.payLogoText}>{m.short}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payName}>{m.name}</Text>
                <Text style={styles.muted}>{m.detail}</Text>
              </View>
              {on ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}

        <View style={[styles.card, shadow.card, { gap: 8 }]}>
          <Text style={styles.recapTitle}>Récapitulatif</Text>
          <RecapRow
            k={seat ? `Place n° ${seat} · Rangée ${Math.ceil(seat / SEATS_PER_ROW)}` : 'Aucune place choisie'}
            v={formatFcfa(c.price)}
          />
          <RecapRow k="Frais de service" v={formatFcfa(SERVICE_FEE)} />
          <View style={styles.divider} />
          <View style={styles.recapRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatFcfa(total)}</Text>
          </View>
        </View>

        <Pressable disabled={!seat} onPress={pay} style={[styles.pay, !seat && styles.payDisabled]}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.payText}>{seat ? `Payer ${formatFcfa(total)}` : 'Choisis une place'}</Text>
        </Pressable>
        <Text style={styles.note}>Ticket envoyé par notification après paiement</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ style, label }: { style: StyleProp<ViewStyle>; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, style]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function RecapRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapKey}>{k}</Text>
      <Text style={styles.recapValue}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  h1: { fontSize: 18, fontWeight: '800', color: colors.navy },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  section: { fontSize: 16, fontWeight: '800', color: colors.navy, marginTop: 4 },
  free: { fontSize: 12, fontWeight: '700', color: colors.success },
  legend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.muted2 },
  busCard: { alignItems: 'center', gap: 8 },
  front: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: 4,
  },
  frontText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  seatRow: { flexDirection: 'row', gap: 8 },
  seat: { width: 36, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  afterAisle: { marginLeft: 36 },
  seatFree: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  seatTaken: { backgroundColor: colors.border },
  seatSelected: { backgroundColor: colors.primary },
  seatText: { fontSize: 11, fontWeight: '700', color: colors.navy },
  payment: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: 'transparent' },
  paymentOn: { borderColor: colors.primary },
  payLogo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  payLogoText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  payName: { fontWeight: '800', color: colors.navy },
  muted: { color: colors.muted2, fontSize: 12, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border },
  recapTitle: { fontWeight: '800', color: colors.navy, marginBottom: 2 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recapKey: { color: colors.muted2, fontSize: 13 },
  recapValue: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  totalLabel: { fontWeight: '800', color: colors.navy },
  totalValue: { fontWeight: '800', color: colors.primary, fontSize: 16 },
  pay: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  payDisabled: { backgroundColor: colors.tabInactive },
  payText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  note: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
