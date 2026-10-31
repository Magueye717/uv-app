import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaravanSummary, FillBar, OrganizerLine } from '@/components/caravan';
import { BackButton } from '@/components/ui';
import { caravanState, formatDateTime, formatFcfa, paymentMethods, type Caravan, type CaravanStop } from '@/constants/data';
import { PaymentLogo } from '@/components/PaymentLogo';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useCaravans, type BookingOutcome } from '@/context/CaravansContext';
import { caravansApi, toCaravan, type SeatMap } from '@/features/caravans/api';
import type { PaymentMethod } from '@/features/payments/checkout';
import { ApiError } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { scheduleCaravanReminder } from '@/lib/notifications';

const SERVICE_FEE = 0;
/** The app's payment choices, as the API names them. */
const METHOD: Record<string, PaymentMethod> = { wave: 'wave', om: 'orange_money' };

export default function CaravaneReservation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { caravans, book, resume, release, refresh } = useCaravans();
  // From the list, or straight from a link (notification): then fetched.
  const [fetched, setFetched] = useState<Caravan | null>(null);
  const c = caravans.find((x) => x.id === id) ?? fetched;
  const [map, setMap] = useState<SeatMap | null>(null);
  const [seat, setSeat] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [pickedUp, setPickup] = useState<CaravanStop | null>(null);
  const [droppedOff, setDropoff] = useState<CaravanStop | null>(null);
  // A single choice is made for the student.
  const pickup = pickedUp ?? (c?.pickups.length === 1 ? c.pickups[0]! : null);
  const dropoff = droppedOff ?? (c?.dropoffs.length === 1 ? c.dropoffs[0]! : null);
  const [payment, setPayment] = useState(paymentMethods[0].id);
  const [paying, setPaying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSeats = useCallback(() => {
    if (!id) return;
    caravansApi.seats(id).then(setMap, () => undefined);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadSeats();
    if (!caravans.some((x) => x.id === id)) {
      caravansApi.departure(id).then(
        (d) => setFetched(toCaravan(d)),
        (err) => setLoadError(err instanceof ApiError ? err.message : 'Départ introuvable.'),
      );
    }
  }, [id, caravans, loadSeats]);


  const perRow = map?.seatsPerRow ?? 4;
  // First and last seat of each row are by the window.
  const isWindow = (n: number) => (n - 1) % perRow === 0 || (n - 1) % perRow === perRow - 1;
  const taken = useMemo(() => new Set([...(map?.taken ?? []), ...(map?.blocked ?? [])]), [map]);

  if (!c) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.head}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.h1}>Réserver ma place</Text>
          <View style={{ width: 44 }} />
        </View>
        {loadError ? <Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>{loadError}</Text> : <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}
      </SafeAreaView>
    );
  }

  // Front-most free window seat, else the front-most free seat (the server suggests the same).
  const pickForMe = () => {
    const free = Array.from({ length: map?.capacity ?? c.totalSeats }, (_, i) => i + 1).filter((n) => !taken.has(n));
    setSeat(free.find(isWindow) ?? free[0] ?? null);
  };
  const { confirmed } = caravanState(c);
  const rows = Array.from({ length: Math.ceil((map?.capacity ?? 0) / perRow) }, (_, r) =>
    Array.from({ length: perRow }, (_, i) => r * perRow + i + 1).filter((n) => n <= (map?.capacity ?? 0)),
  );
  const total = c.price + SERVICE_FEE;
  const ready = !!seat && !!pickup && !!dropoff && !paying;
  const existing = c.myTicketId;

  const finish = (outcome: BookingOutcome, stop: CaravanStop | null) => {
    if (outcome.status === 'confirmed') {
      haptics.success();
      if (stop) scheduleCaravanReminder(c, stop);
      router.replace({ pathname: '/billet/[id]', params: { id: outcome.ticketId, nouveau: '1' } });
    } else if (outcome.status === 'refunded') {
      Alert.alert('Place perdue', `Le paiement est arrivé après la fin de la réservation et la place a été reprise. ${formatFcfa(total)} te sont remboursés.`);
    } else if (outcome.status === 'pending') {
      Alert.alert('Paiement en attente', 'Ta place est gardée 10 minutes. Termine le paiement depuis cet écran.');
    } else {
      Alert.alert('Paiement non effectué', 'Ta place a été libérée. Tu peux réessayer.');
    }
    loadSeats();
  };

  const pay = async () => {
    if (!seat || !pickup || !dropoff) return;
    setPaying(true);
    try {
      finish(await book(c.id, { seat, pickupStopId: pickup.stopId, dropoffStopId: dropoff.stopId, method: METHOD[payment] ?? 'wave' }), pickup);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SEAT_TAKEN') {
        setSeat(null);
        loadSeats();
      }
      Alert.alert('Réservation impossible', err instanceof ApiError ? err.message : 'Réessaie dans un instant.');
      refresh();
    } finally {
      setPaying(false);
    }
  };

  const resumePayment = async () => {
    setPaying(true);
    try {
      finish(await resume(c), c.pickups[0] ?? null);
    } catch (err) {
      Alert.alert('Paiement impossible', err instanceof ApiError ? err.message : 'Réessaie dans un instant.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.h1}>Réserver ma place</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, shadow.card, { gap: 14 }]}>
          {/* The organizer is detailed in the card below: no need to repeat it here. */}
          <CaravanSummary caravan={c} header="price" />
          <FillBar caravan={c} />
        </View>

        <View style={[styles.card, shadow.card, { gap: 10 }]}>
          <OrganizerLine organizer={c.organizer} />
          <Text style={styles.muted}>
            {c.organizer.kind} · {c.organizer.trips ? `${c.organizer.trips} trajets effectués` : 'Premier trajet sur l’app'} · {c.vehicle.label}
            {c.vehicle.plate ? ` (${c.vehicle.plate})` : ''}
          </Text>
          <View style={styles.divider} />
          <Guarantee icon="document-text-outline" text="Assurance, visite technique et permis du chauffeur vérifiés" />
          <Guarantee icon="person-outline" text={`${c.totalSeats} places assises, pas une de plus`} />
          <Guarantee
            icon="wallet-outline"
            text={
              confirmed
                ? 'Ton argent reste bloqué jusqu’au départ'
                : `Remboursé à 100 % si ${c.minPassengers} passagers ne sont pas atteints le ${formatDateTime(c.confirmBy)}`
            }
          />
          <Guarantee icon="refresh-outline" text="Annulation gratuite jusqu’à 24 h avant le départ, puis 10 % de frais" />
        </View>

        {existing || c.purchasedHere ? (
          <View style={[styles.card, shadow.card, styles.already]}>
            <Ionicons name="ticket-outline" size={28} color={colors.primary} />
            <Text style={styles.alreadyTitle}>{existing ? 'Tu as déjà un billet pour ce départ' : 'Tu as transféré ton billet'}</Text>
            <Text style={styles.alreadyText}>
              Un seul billet par étudiant et par caravane, pour que chaque place aille à un vrai voyageur.
            </Text>
            {existing && (
              <Pressable style={styles.alreadyBtn} onPress={() => router.replace(`/billet/${existing}`)}>
                <Text style={styles.alreadyBtnText}>Voir mon billet</Text>
              </Pressable>
            )}
          </View>
        ) : c.myBooking ? (
          <View style={[styles.card, shadow.card, styles.already]}>
            <Ionicons name="time-outline" size={28} color={colors.primary} />
            <Text style={styles.alreadyTitle}>Place n° {c.myBooking.seat} gardée pour toi</Text>
            <Text style={styles.alreadyText}>Termine le paiement avant {formatDateTime(Date.parse(c.myBooking.holdExpiresAt))}, sinon elle est rendue aux autres.</Text>
            <Pressable style={styles.alreadyBtn} onPress={resumePayment} disabled={paying}>
              <Text style={styles.alreadyBtnText}>{paying ? 'Paiement…' : `Payer ${formatFcfa(total)}`}</Text>
            </Pressable>
            <Pressable
              onPress={() => release(c.myBooking!.id).then(loadSeats, () => undefined)}
              hitSlop={8}
              accessibilityRole="button">
              <Text style={styles.change}>Libérer la place</Text>
            </Pressable>
          </View>
        ) : !c.bookingOpen ? (
          <View style={[styles.card, shadow.card, styles.already]}>
            <Ionicons name="lock-closed-outline" size={28} color={colors.muted} />
            <Text style={styles.alreadyTitle}>{c.seats ? 'Réservations fermées' : 'Départ complet'}</Text>
          </View>
        ) : (
          <>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Ta place</Text>
            <Text style={styles.free}>{c.seats} places libres</Text>
          </View>

          {/* The 64-seat plan is long: folded by default, one tap picks a good seat. */}
          {!showMap ? (
            <View style={[styles.card, shadow.card, { gap: 12 }]}>
              {seat ? (
                <View style={styles.picked}>
                  <View style={styles.pickedSeat}>
                    <Text style={styles.pickedSeatText}>{seat}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payName}>Place n° {seat}</Text>
                    <Text style={styles.muted}>
                      {isWindow(seat) ? 'Fenêtre' : 'Couloir'} · rangée {Math.ceil(seat / perRow)}
                    </Text>
                  </View>
                  <Pressable onPress={() => setShowMap(true)} hitSlop={10} accessibilityRole="button">
                    <Text style={styles.change}>Changer</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.muted}>Laisse-nous choisir, ou regarde le plan du bus.</Text>
              )}
              {!seat && (
                <View style={styles.seatActions}>
                  <Pressable style={[styles.seatAction, styles.seatActionMain]} onPress={pickForMe} accessibilityRole="button">
                    <Ionicons name="sparkles-outline" size={16} color="#fff" />
                    <Text style={[styles.seatActionText, { color: '#fff' }]}>Choisis pour moi</Text>
                  </Pressable>
                  <Pressable style={styles.seatAction} onPress={() => setShowMap(true)} accessibilityRole="button">
                    <Ionicons name="grid-outline" size={16} color={colors.primary} />
                    <Text style={styles.seatActionText}>Voir le plan</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <>
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
                {!map && <ActivityIndicator color={colors.primary} />}
                {rows.map((row) => (
                  <View key={row[0]} style={styles.seatRow}>
                    {row.map((n, i) => {
                      const isTaken = taken.has(n);
                      const isSelected = seat === n;
                      return (
                        <Pressable
                          key={n}
                          disabled={isTaken}
                          onPress={() => {
                            setSeat(n);
                            setShowMap(false);
                          }}
                          accessibilityLabel={isTaken ? `Place ${n}, occupée` : `Place ${n}`}
                          style={[
                            styles.seat,
                            i === Math.floor(perRow / 2) && styles.afterAisle,
                            isTaken ? styles.seatTaken : isSelected ? styles.seatSelected : styles.seatFree,
                          ]}>
                          {isTaken ? (
                            <Ionicons name="close" size={16} color={colors.muted} />
                          ) : (
                            <Text style={[styles.seatText, isSelected && { color: '#fff' }]}>{n}</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Like the organizers' own timetables: every stop with the bus's time there. */}
          <StopPicker
            title="Où montes-tu ?"
            hint="Sois au point de montée 15 min avant l’heure : le bus n’attend pas."
            stops={c.pickups}
            value={pickup}
            onChange={setPickup}
          />
          <StopPicker
            title="Où descends-tu ?"
            hint="Heures d’arrivée estimées, selon la circulation."
            stops={c.dropoffs}
            value={dropoff}
            onChange={setDropoff}
            estimated
          />

          <Text style={styles.section}>Moyen de paiement</Text>
          {paymentMethods.map((m) => {
            const on = m.id === payment;
            return (
              <Pressable key={m.id} onPress={() => setPayment(m.id)} style={[styles.card, styles.payment, on && styles.paymentOn]}>
                <PaymentLogo method={m} />
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
              k={seat ? `Place n° ${seat} · Rangée ${Math.ceil(seat / perRow)}` : 'Aucune place choisie'}
              v={formatFcfa(c.price)}
            />
            <RecapRow k="Montée" v={pickup ? `${pickup.place} · ${pickup.time}` : 'À choisir'} />
            <RecapRow k="Descente" v={dropoff?.place ?? 'À choisir'} />
            <RecapRow k="Frais de service" v={formatFcfa(SERVICE_FEE)} />
            <View style={styles.divider} />
            <View style={styles.recapRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatFcfa(total)}</Text>
            </View>
          </View>

          <Pressable disabled={!ready} onPress={pay} style={[styles.pay, !ready && styles.payDisabled]}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.payText}>
              {paying
                ? 'Paiement en cours…'
                : !seat
                ? 'Choisis une place'
                : !pickup
                  ? 'Choisis ton point de montée'
                  : !dropoff
                    ? 'Choisis ta descente'
                    : `Payer ${formatFcfa(total)}`}
            </Text>
          </Pressable>
          <Text style={styles.note}>Billet avec QR code dans l’app après paiement</Text>
          </>
        )}
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

function Guarantee({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.guarantee}>
      <Ionicons name={icon} size={16} color={colors.success} />
      <Text style={styles.guaranteeText}>{text}</Text>
    </View>
  );
}

function StopPicker({
  title,
  hint,
  stops,
  value,
  onChange,
  estimated,
}: {
  title: string;
  hint: string;
  stops: CaravanStop[];
  value: CaravanStop | null;
  onChange: (s: CaravanStop) => void;
  estimated?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.section}>{title}</Text>
      <View style={[styles.card, shadow.card, styles.stopList]}>
        {stops.map((s, i) => {
          const on = s.stopId === value?.stopId;
          const only = stops.length === 1;
          return (
            <Pressable
              key={s.stopId}
              onPress={() => onChange(s)}
              disabled={only}
              style={[styles.stopRow, on && styles.stopRowOn]}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${s.place}, ${estimated ? 'vers ' : ''}${s.time}`}>
              {/* Route line: dots joined top to bottom, like a timetable. */}
              <View style={styles.rail}>
                <View style={[styles.railLine, i === 0 && { backgroundColor: 'transparent' }]} />
                <View style={[styles.railDot, on && styles.railDotOn]}>
                  {on && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>
                <View style={[styles.railLine, i === stops.length - 1 && { backgroundColor: 'transparent' }]} />
              </View>
              <Text style={[styles.stopPlace, on && styles.stopPlaceOn]}>{s.place}</Text>
              <Text style={[styles.stopTime, on && styles.stopPlaceOn]}>
                {estimated ? '~' : ''}
                {s.time}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.stopHint}>{hint}</Text>
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
  h1: { ...typo.h3, color: colors.navy },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  section: { ...typo.title, color: colors.navy, marginTop: 4 },
  free: { ...typo.captionStrong, color: colors.success },
  legend: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
  legendText: { ...typo.caption, color: colors.muted2 },
  busCard: { alignItems: 'center', gap: 8 },
  front: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: 4,
  },
  frontText: { ...typo.label, color: colors.primary },
  seatRow: { flexDirection: 'row', gap: 8 },
  seat: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  afterAisle: { marginLeft: 28 },
  seatFree: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  seatTaken: { backgroundColor: colors.border },
  seatSelected: { backgroundColor: colors.primary },
  seatText: { ...typo.smallStrong, color: colors.navy },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickedSeat: { width: 44, height: 44, borderRadius: radii.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  pickedSeatText: { ...typo.title, color: '#fff' },
  change: { color: colors.orangeText, fontWeight: '700' },
  seatActions: { flexDirection: 'row', gap: 10 },
  seatAction: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  seatActionMain: { backgroundColor: colors.primary },
  seatActionText: { ...typo.bodyStrong, color: colors.primary },
  payment: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: 'transparent' },
  paymentOn: { borderColor: colors.primary },
  payName: { fontWeight: '700', color: colors.navy },
  muted: { ...typo.caption, color: colors.muted2, marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border },
  recapTitle: { fontWeight: '700', color: colors.navy, marginBottom: 2 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recapKey: { ...typo.small, color: colors.muted2 },
  recapValue: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  totalLabel: { fontWeight: '700', color: colors.navy },
  totalValue: { ...typo.title, color: colors.primary },
  pay: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  payDisabled: { backgroundColor: colors.tabInactive },
  payText: { ...typo.title, color: '#fff' },
  note: { ...typo.caption, textAlign: 'center', color: colors.muted2 },
  guarantee: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  guaranteeText: { ...typo.small, flex: 1, color: colors.text, lineHeight: 18 },
  already: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  alreadyTitle: { ...typo.title, color: colors.navy, textAlign: 'center' },
  alreadyText: { ...typo.small, color: colors.muted2, textAlign: 'center', lineHeight: 18 },
  alreadyBtn: { marginTop: 6, backgroundColor: colors.accent, paddingHorizontal: 22, minHeight: 42, borderRadius: radii.pill, justifyContent: 'center' },
  alreadyBtnText: { color: '#fff', fontWeight: '700' },
  stopList: { paddingVertical: 4, paddingHorizontal: 0 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingRight: 14 },
  stopRowOn: { backgroundColor: colors.primarySoft },
  rail: { width: 34, alignSelf: 'stretch', alignItems: 'center' },
  railLine: { flex: 1, width: 2, backgroundColor: colors.border },
  railDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.muted,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railDotOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  stopPlace: { ...typo.body, flex: 1, color: colors.text, paddingVertical: 10 },
  stopPlaceOn: { fontWeight: '700', color: colors.navy },
  stopTime: { ...typo.smallStrong, color: colors.muted2, fontVariant: ['tabular-nums'] },
  stopHint: { ...typo.caption, color: colors.muted2, lineHeight: 17 },
});
