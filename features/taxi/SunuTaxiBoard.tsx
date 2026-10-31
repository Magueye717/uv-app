import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field, LabeledField, PrimaryButton } from '@/components/ui';
import { formatFcfa, TAXI_CHAT_HOURS, TAXI_LOCK_MIN, TAXI_STRIKES_LIMIT, taxiSeatPrice, type TaxiTrip } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useTaxi } from '@/context/TaxiContext';

const LEAVE_IN = [15, 30, 60, 120]; // minutes
const SEAT_OPTIONS = [2, 3, 4];

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatDeparture(at: number, now: number) {
  const mins = Math.round((at - now) / 60_000);
  if (mins <= 0) return 'Départ imminent';
  if (mins < 60) return `Dans ${mins} min`;
  const d = new Date(at);
  return `Aujourd’hui ${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
}

const leaveLabel = (m: number) => (m < 60 ? `${m} min` : `${m / 60} h`);

const LOCK_MS = TAXI_LOCK_MIN * 60_000;

// Sunu Taxi: a student proposes a trip, others pay their seat to join.
// Seats are locked 30 min before departure so nobody is left paying for someone else.
/** Screen content without header or safe area: used by a tab and by its standalone page. */
export function SunuTaxiBoard() {
  const taxi = useTaxi();
  const { me, trips, strikes } = taxi;
  const now = useNow();
  const [creating, setCreating] = useState(false);
  const suspended = strikes >= TAXI_STRIKES_LIMIT;

  // Open trips, plus my departed ones while their chat is still open.
  const upcoming = trips
    .filter((t) =>
      t.departed
        ? t.passengers.includes(me) && now < t.departureAt + TAXI_CHAT_HOURS * 3_600_000
        : t.departureAt > now - 15 * 60_000,
    )
    .sort((a, b) => a.departureAt - b.departureAt);

  const join = (t: TaxiTrip) => {
    const price = formatFcfa(taxiSeatPrice(t));
    const pay = (method: string) => {
      taxi.join(t.id);
      Alert.alert('Place réservée', `Valide ${price} sur ${method}. Remboursé si tu quittes plus de ${TAXI_LOCK_MIN} min avant le départ.`);
    };
    Alert.alert(`Payer ta place · ${price}`, `Ton argent est bloqué jusqu’au départ. Places verrouillées ${TAXI_LOCK_MIN} min avant.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Wave', onPress: () => pay('Wave') },
      { text: 'Orange Money', onPress: () => pay('Orange Money') },
    ]);
  };

  const leave = (t: TaxiTrip, locked: boolean) =>
    Alert.alert(
      'Quitter le trajet ?',
      locked
        ? `Moins de ${TAXI_LOCK_MIN} min avant le départ : ta place (${formatFcfa(taxiSeatPrice(t))}) n’est pas remboursée, elle sert à payer le taxi.`
        : `Tu es remboursé de ${formatFcfa(taxiSeatPrice(t))}.`,
      [
        { text: 'Rester', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => taxi.leave(t.id),
        },
      ],
    );

  const cancel = (t: TaxiTrip, locked: boolean) => {
    const others = t.passengers.length - 1;
    if (others === 0) {
      Alert.alert('Annuler le trajet ?', 'Personne ne t’a encore rejoint.', [
        { text: 'Garder le trajet', style: 'cancel' },
        { text: 'Annuler le trajet', style: 'destructive', onPress: () => taxi.cancel(t.id, false) },
      ]);
      return;
    }
    // Students are counting on this trip: handing it over comes first, so nobody is left without a taxi.
    const next = taxi.nameOf(t.passengers[1]);
    const late = locked;
    Alert.alert(
      'Tu ne peux plus partir ?',
      `Passe le relais : ${next}, premier inscrit, organise le trajet à ta place. Pas de pénalité.\n\n` +
        `Ou annule : les ${others} étudiant${others > 1 ? 's' : ''} inscrit${others > 1 ? 's' : ''} ${others > 1 ? 'sont remboursés' : 'est remboursé'} à 100 %.` +
        (late ? ` Annulation tardive : ${strikes + 1}/${TAXI_STRIKES_LIMIT}. À ${TAXI_STRIKES_LIMIT}, Sunu Taxi est suspendu 7 jours.` : ''),
      [
        { text: 'Garder le trajet', style: 'cancel' },
        { text: `Passer le relais à ${next}`, onPress: () => taxi.handOver(t.id) },
        { text: 'Annuler le trajet', style: 'destructive', onPress: () => taxi.cancel(t.id, late) },
      ],
    );
  };

  // One trip at a time, organized or joined: no seats held "just in case" in two taxis.
  const current = taxi.activeTrip();
  const busy = () =>
    Alert.alert(
      'Tu as déjà un trajet',
      `Tu es inscrit sur ${current?.from.split(' · ').pop()} → ${current?.to.split(' · ').pop()}. Quitte-le ou attends le départ pour en proposer ou en rejoindre un autre.`,
    );


  const depart = (t: TaxiTrip) => {
    const paid = (t.passengers.length - 1) * taxiSeatPrice(t);
    const missing = t.passengers.filter((p) => !t.checkedIn.includes(p) && p !== me).length;
    Alert.alert(
      'Vous êtes partis ?',
      `${formatFcfa(paid)} versés sur ton compte pour payer le taxi.` +
        (missing ? `\n${missing} absent${missing > 1 ? 's' : ''} : ${missing > 1 ? 'leurs places restent payées' : 'sa place reste payée'}.` : ''),
      [
        { text: 'Pas encore', style: 'cancel' },
        { text: 'On est partis', onPress: () => taxi.depart(t.id) },
      ],
    );
  };

  return (
    <>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Tu pars quelque part ?</Text>
            <Text style={styles.heroSub}>Propose un trajet, d’autres étudiants paient leur place et vous partagez le prix.</Text>
          </View>
          <Pressable
            style={[styles.heroBtn, suspended && { opacity: 0.5 }]}
            disabled={suspended}
            onPress={() => (current ? busy() : setCreating(true))}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.heroBtnText}>Proposer</Text>
          </Pressable>
        </View>

        <View style={[styles.rules, shadow.card]}>
          <Rule icon="wallet-outline" text="Tu paies ta place en rejoignant : prix fixe, connu d’avance." />
          <Rule icon="lock-closed-outline" text={`Places verrouillées ${TAXI_LOCK_MIN} min avant : quitter n’est plus remboursé.`} />
          <Rule icon="shield-checkmark-outline" text="Trajet annulé par l’organisateur : remboursé à 100 %." />
        </View>

        {strikes > 0 && (
          <View style={[styles.strikes, suspended && { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="alert-circle" size={18} color={suspended ? colors.danger : colors.warning} />
            <Text style={[styles.strikesText, suspended && { color: colors.dangerText }]}>
              {suspended
                ? 'Sunu Taxi suspendu 7 jours après 3 annulations tardives.'
                : `${strikes} annulation${strikes > 1 ? 's' : ''} tardive${strikes > 1 ? 's' : ''} sur ${TAXI_STRIKES_LIMIT}. À ${TAXI_STRIKES_LIMIT}, Sunu Taxi est suspendu 7 jours.`}
            </Text>
          </View>
        )}

        <Text style={styles.section}>Trajets ouverts</Text>
        {upcoming.length === 0 && <Text style={styles.empty}>Aucun trajet pour le moment. Propose le premier !</Text>}

        {upcoming.map((t) => (
          <TripCard
            key={t.id}
            trip={t}
            me={me}
            now={now}
            suspended={suspended}
            busy={!!current && current.id !== t.id}
            onBusy={busy}
            onJoin={() => join(t)}
            onLeave={(locked) => leave(t, locked)}
            onCancel={(locked) => cancel(t, locked)}
            onCheckIn={() => taxi.checkIn(t.id)}
            onDepart={() => depart(t)}
            messageCount={taxi.messages.filter((m) => m.tripId === t.id && m.author && m.author !== me).length}
            onChat={() => router.push(`/trajet/${t.id}`)}
          />
        ))}
      </ScrollView>

      <NewTripSheet
        visible={creating}
        onClose={() => setCreating(false)}
        onCreate={(trip) => {
          taxi.create(trip);
          setCreating(false);
        }}
      />
    </>
  );
}

function TripCard({
  trip: t,
  me,
  now,
  suspended,
  busy,
  onBusy,
  onJoin,
  onLeave,
  onCancel,
  onCheckIn,
  onDepart,
  messageCount,
  onChat,
}: {
  trip: TaxiTrip;
  me: string;
  now: number;
  suspended: boolean;
  /** I'm already in another trip. */
  busy: boolean;
  onBusy: () => void;
  onJoin: () => void;
  onLeave: (locked: boolean) => void;
  onCancel: (locked: boolean) => void;
  onCheckIn: () => void;
  onDepart: () => void;
  messageCount: number;
  onChat: () => void;
}) {
  const isOrganizer = t.passengers[0] === me;
  const isIn = t.passengers.includes(me);
  const full = t.passengers.length >= t.seats;
  const left = t.departureAt - now;
  const locked = left <= LOCK_MS;
  const here = t.checkedIn.includes(me);
  const lockIn = Math.max(0, Math.ceil((left - LOCK_MS) / 60_000));
  const { trips, lateCancels } = t.organizer;

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.rowBetween}>
        <View style={styles.organizer}>
          <Avatar initials={t.organizer.initials} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.organizerName}>{isOrganizer ? 'Toi' : t.organizer.name}</Text>
            {lateCancels > 0 ? (
              <Text style={[styles.organizerRole, { color: colors.warningText }]}>
                {lateCancels} annulation{lateCancels > 1 ? 's' : ''} tardive{lateCancels > 1 ? 's' : ''} récente{lateCancels > 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={[styles.organizerRole, trips > 0 && { color: colors.successText }]}>
                {trips > 0 ? `Fiable · ${trips} trajets` : 'Nouvel organisateur'}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.departure}>{formatDeparture(t.departureAt, now)}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeLine}>
          <View style={styles.routeFrom} />
          <View style={styles.routeBar} />
          <Ionicons name="location" size={14} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={styles.place} numberOfLines={1}>
            {t.from}
          </Text>
          <Text style={styles.place} numberOfLines={1}>
            {t.to}
          </Text>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.seatsRow}>
          {Array.from({ length: t.seats }, (_, i) =>
            t.passengers[i] ? (
              <Avatar
                key={i}
                initials={t.passengers[i]}
                small
                highlight={t.passengers[i] === me}
                here={t.checkedIn.includes(t.passengers[i])}
              />
            ) : (
              <View key={i} style={styles.freeSeat} />
            ),
          )}
          <Text style={styles.seatsText}>
            {t.passengers.length}/{t.seats}
          </Text>
        </View>
        <Text style={styles.share}>{formatFcfa(taxiSeatPrice(t))} / place</Text>
      </View>

      {t.taxi && (
        <View style={styles.taxiLine}>
          <Ionicons name="car-outline" size={14} color={colors.navy} />
          <Text style={styles.taxiText} numberOfLines={1}>
            {t.taxi}
          </Text>
        </View>
      )}

      {t.departed ? (
        <View style={[styles.lock, styles.lockGo]}>
          <Ionicons name="car" size={13} color={colors.successText} />
          <Text style={[styles.lockText, { color: colors.successText }]}>En route · bon trajet !</Text>
        </View>
      ) : (
        <View style={[styles.lock, locked && styles.lockOn]}>
          <Ionicons name={locked ? 'lock-closed' : 'lock-open-outline'} size={13} color={locked ? colors.warningText : colors.muted2} />
          <Text style={[styles.lockText, locked && { color: colors.warningText }]}>
            {locked ? 'Places verrouillées · quitter n’est plus remboursé' : `Verrouillage dans ${lockIn} min · quitter est remboursé`}
          </Text>
        </View>
      )}

      {isIn && (
        <Pressable style={styles.chat} onPress={onChat} accessibilityRole="button" accessibilityLabel="Ouvrir la discussion du trajet">
          <Ionicons name="chatbubbles-outline" size={16} color={colors.primary} />
          <Text style={styles.chatText}>Discussion</Text>
          {messageCount > 0 && (
            <View style={styles.chatCount}>
              <Text style={styles.chatCountText}>{messageCount}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={14} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </Pressable>
      )}

      {t.departed ? null : isOrganizer ? (
        locked ? (
          <View style={styles.actions}>
            <Pressable style={[styles.action, { flex: 1 }]} onPress={onDepart}>
              <Ionicons name="car" size={16} color="#fff" />
              <Text style={styles.actionText}>On est partis</Text>
            </Pressable>
            <Pressable style={[styles.action, styles.actionOutline, styles.actionSmall]} onPress={() => onCancel(true)}>
              <Text style={[styles.actionText, { color: colors.dangerText }]}>Annuler</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.action, styles.actionOutline]} onPress={() => onCancel(false)}>
            <Text style={[styles.actionText, { color: colors.dangerText }]}>Annuler le trajet</Text>
          </Pressable>
        )
      ) : isIn ? (
        locked ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.action, { flex: 1 }, here && styles.actionDone]}
              disabled={here}
              onPress={onCheckIn}
              accessibilityState={{ disabled: here }}>
              <Ionicons name={here ? 'checkmark-circle' : 'hand-left-outline'} size={16} color={here ? colors.successText : '#fff'} />
              <Text style={[styles.actionText, here && { color: colors.successText }]}>{here ? 'Tu es au rendez-vous' : 'Je suis là'}</Text>
            </Pressable>
            <Pressable style={[styles.action, styles.actionOutline, styles.actionSmall]} onPress={() => onLeave(true)}>
              <Text style={[styles.actionText, { color: colors.muted2 }]}>Quitter</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.action, styles.actionOutline]} onPress={() => onLeave(false)}>
            <Ionicons name="checkmark-circle" size={16} color={colors.successText} />
            <Text style={[styles.actionText, { color: colors.successText }]}>Place payée · Quitter</Text>
          </Pressable>
        )
      ) : (
        <Pressable
          style={[styles.action, (full || suspended || busy) && styles.actionDisabled]}
          disabled={full || suspended}
          onPress={busy ? onBusy : onJoin}>
          <Text style={styles.actionText}>
            {full ? 'Complet' : suspended ? 'Suspendu' : busy ? 'Déjà dans un trajet' : `Rejoindre · ${formatFcfa(taxiSeatPrice(t))}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function Rule({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.rule}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

function Avatar({ initials, small, highlight, here }: { initials: string; small?: boolean; highlight?: boolean; here?: boolean }) {
  return (
    <View style={[styles.avatar, small && styles.avatarSmall, highlight && styles.avatarMe, here && styles.avatarHere]}>
      <Text style={[styles.avatarText, small && { fontSize: 9 }]}>{initials}</Text>
    </View>
  );
}

function NewTripSheet({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (trip: Pick<TaxiTrip, 'from' | 'to' | 'departureAt' | 'seats' | 'fare'>) => void;
}) {
  const [from, setFrom] = useState('UGB · Village E');
  const [to, setTo] = useState('');
  const [leaveIn, setLeaveIn] = useState(30);
  const [seats, setSeats] = useState(4);
  const [fare, setFare] = useState('');

  const fareValue = Number(fare.replace(/\D/g, ''));
  const valid = from.trim().length > 1 && to.trim().length > 1 && fareValue > 0;

  const submit = () => {
    onCreate({ from: from.trim(), to: to.trim(), departureAt: Date.now() + leaveIn * 60_000, seats, fare: fareValue });
    setTo('');
    setFare('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Proposer un trajet</Text>
          <ScrollView contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled">
            <LabeledField label="Départ">
              <Field icon="radio-button-on-outline" placeholder="UGB · Village E" value={from} onChangeText={setFrom} />
            </LabeledField>
            <LabeledField label="Destination">
              <Field icon="location-outline" placeholder="Saint-Louis · Gare routière" value={to} onChangeText={setTo} />
            </LabeledField>
            <LabeledField label="Départ dans">
              <Chips options={LEAVE_IN} value={leaveIn} onChange={setLeaveIn} label={leaveLabel} />
            </LabeledField>
            <LabeledField label="Places dans le taxi (toi compris)">
              <Chips options={SEAT_OPTIONS} value={seats} onChange={setSeats} label={String} />
            </LabeledField>
            <LabeledField label="Prix total du taxi">
              <Field
                icon="cash-outline"
                placeholder="3000"
                keyboardType="number-pad"
                value={fare}
                onChangeText={setFare}
                right={<Text style={styles.fcfa}>FCFA</Text>}
              />
            </LabeledField>
            {fareValue > 0 && (
              <Text style={styles.hint}>
                Chaque passager paie {formatFcfa(taxiSeatPrice({ fare: fareValue, seats }))} en rejoignant. Tu couvres les places vides.
              </Text>
            )}
            <PrimaryButton label="Publier le trajet" onPress={submit} disabled={!valid} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Chips<T extends number>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label: (v: T) => string;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{label(o)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, lineHeight: 17 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radii.pill,
  },
  heroBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  section: { fontSize: 18, fontWeight: '800', color: colors.navy, marginTop: 8 },
  empty: { color: colors.muted2, textAlign: 'center', paddingVertical: 24 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  organizer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  organizerName: { fontSize: 14, fontWeight: '700', color: colors.navy },
  organizerRole: { fontSize: 11, color: colors.muted2 },
  departure: { fontSize: 12, fontWeight: '700', color: colors.primary },
  route: { flexDirection: 'row', gap: 10 },
  routeLine: { alignItems: 'center', paddingTop: 4, width: 14 },
  routeFrom: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.primary },
  routeBar: { width: 2, height: 14, backgroundColor: colors.border, marginVertical: 2 },
  place: { fontSize: 14, fontWeight: '600', color: colors.text },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatsText: { fontSize: 12, color: colors.muted2, marginLeft: 4 },
  freeSeat: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  share: { fontSize: 13, fontWeight: '700', color: colors.navy },
  action: {
    flexDirection: 'row',
    gap: 6,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutline: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  actionDisabled: { backgroundColor: colors.tabInactive },
  actionDone: { backgroundColor: colors.successBg },
  actionSmall: { paddingHorizontal: 16 },
  actions: { flexDirection: 'row', gap: 8 },
  rules: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14, gap: 10 },
  rule: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  ruleText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },
  strikes: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radii.md, backgroundColor: colors.warningBg },
  strikesText: { flex: 1, fontSize: 13, color: colors.warningText, lineHeight: 18 },
  lock: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.sm, backgroundColor: colors.bg },
  lockOn: { backgroundColor: colors.warningBg },
  lockGo: { backgroundColor: colors.successBg },
  taxiLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taxiText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.navy },
  chat: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  chatText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  chatCount: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  chatCountText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  lockText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.muted2 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: { width: 22, height: 22, borderRadius: 11 },
  avatarMe: { backgroundColor: colors.primary },
  // Green ring: at the meeting point.
  avatarHere: { borderWidth: 2, borderColor: colors.success },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,27,76,0.4)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    maxHeight: 640,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.navy, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '600', color: colors.navy },
  chipTextOn: { color: '#fff' },
  fcfa: { color: colors.muted2, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.muted2, marginTop: -6 },
});
