import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states';
import { BackButton, Segmented } from '@/components/ui';
import { caravans, type Caravan, type CaravanStop, type Passenger } from '@/constants/data';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useBoarding, useManifests } from '@/features/organizer/boarding';
import { TicketScanner } from '@/features/organizer/TicketScanner';
import { useTicketCheck } from '@/features/organizer/useTicketCheck';

type Tab = 'pickups' | 'dropoffs';

/**
 * The driver's list, stop by stop: who gets on where, who is on board, who gets off where.
 * Boarding is checked by scanning the ticket's QR code (or typing its code), here or from the Scanner tab.
 */
export default function Manifest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { organizer } = useAuth();
  // Only the organizer's own departures: the list holds names and phone numbers.
  const c = caravans.find((x) => x.id === id && x.organizer.id === organizer?.id);
  const list = useMemo(() => (c ? [c] : []), [c]);
  const passengers = useManifests(list).get(c?.id ?? '') ?? [];
  const check = useTicketCheck(list);
  const boarding = useBoarding();
  const [view, setView] = useState<Tab>('pickups');
  const [scanning, setScanning] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/activites'));

  if (!c) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={back} />
        <EmptyState
          icon="bus-outline"
          title="Départ introuvable"
          text="Il a été supprimé, ou il appartient à un autre organisateur."
          action={{ label: 'Mes activités', onPress: () => router.replace('/activites') }}
        />
      </SafeAreaView>
    );
  }

  const boarded = boarding.boarded[c.id] ?? [];
  // Stops the bus has left: whoever wasn't scanned there is marked absent.
  const left = boarding.left[c.id] ?? [];
  const isBoarded = (p: Passenger) => boarded.includes(p.ticket);
  const isAbsent = (p: Passenger) => !isBoarded(p) && left.includes(p.pickup.place);
  const absents = passengers.filter(isAbsent).length;
  const board = (p: Passenger) => boarding.board(c.id, p.ticket);
  const unboard = (p: Passenger) => boarding.unboard(c.id, p.ticket);
  // First stop not left yet: where the bus is (or is heading).
  const current = c.pickups.find((s) => !left.includes(s.place));

  const leave = (stop: CaravanStop) => {
    const missing = passengers.filter((p) => p.pickup.place === stop.place && !isBoarded(p));
    const go = () => boarding.leave(c.id, stop.place);
    if (!missing.length) return go();
    Alert.alert(
      `${missing.length} passager${missing.length > 1 ? 's' : ''} pas encore monté${missing.length > 1 ? 's' : ''}`,
      `${missing.map((p) => `${p.name} (place ${p.seat})`).join('\n')}\n\nAppelle-les avant de partir. Si tu pars, ils sont marqués absents et prévenus.`,
      [
        { text: 'Attendre', style: 'cancel' },
        { text: 'Partir quand même', style: 'destructive', onPress: go },
      ],
    );
  };

  const share = () => Share.share({ message: manifestText(c, passengers) });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={back} onShare={share} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, shadow.card, { gap: 12 }]}>
          <View>
            <Text style={styles.route}>
              {c.from} → {c.to}
            </Text>
            <Text style={styles.muted}>
              {c.date} · {c.time} · {c.vehicle.label} {c.vehicle.plate}
            </Text>
          </View>
          <View style={styles.stats}>
            <Stat value={passengers.length} label="réservés" />
            <Stat value={boarded.length} label="à bord" tone={colors.successText} />
            <Stat value={absents} label={absents > 1 ? 'absents' : 'absent'} tone={absents ? colors.dangerText : undefined} />
          </View>
          {current && (
            <View style={styles.next}>
              <Ionicons name="navigate-outline" size={16} color={colors.primary} />
              <Text style={styles.nextText} numberOfLines={2}>
                Prochain arrêt : <Text style={{ fontWeight: '700' }}>{current.place}</Text> · {current.time} ·{' '}
                {passengers.filter((p) => p.pickup.place === current.place && !isBoarded(p)).length} à faire monter
              </Text>
            </View>
          )}
        </View>

        <Segmented
          options={[
            { value: 'pickups', label: `Montées · ${c.pickups.length}` },
            { value: 'dropoffs', label: `Descentes · ${c.dropoffs.length}` },
          ]}
          value={view}
          onChange={setView}
        />

        {view === 'pickups'
          ? c.pickups.map((stop) => {
              const list = passengers.filter((p) => p.pickup.place === stop.place);
              const done = left.includes(stop.place);
              const on = list.filter(isBoarded).length;
              return (
                <View key={stop.place} style={[styles.card, shadow.card, styles.stop, stop === current && styles.stopCurrent]}>
                  <StopHead
                    stop={stop}
                    count={list.length ? `${on}/${list.length} à bord` : 'Personne'}
                    badge={done ? 'Parti' : stop === current ? 'Ici' : undefined}
                  />
                  {list.length === 0 && <Text style={styles.muted}>Aucun passager ne monte ici : tu peux ne pas t’arrêter.</Text>}
                  {list.map((p) => (
                    <PassengerRow
                      key={p.ticket}
                      p={p}
                      detail={`Descend à ${p.dropoff.place}`}
                      status={isBoarded(p) ? 'boarded' : isAbsent(p) ? 'absent' : 'waiting'}
                      // Manual check for a phone that won't show its QR (battery, broken screen).
                      onToggle={() =>
                        isBoarded(p)
                          ? unboard(p)
                          : Alert.alert(`Faire monter ${p.name} sans scanner ?`, 'Vérifie son nom sur sa carte étudiant.', [
                              { text: 'Annuler', style: 'cancel' },
                              { text: 'Faire monter', onPress: () => board(p) },
                            ])
                      }
                    />
                  ))}
                  {!done && list.length > 0 && stop === current && (
                    <Pressable style={styles.leave} onPress={() => leave(stop)} accessibilityRole="button">
                      <Ionicons name="bus-outline" size={16} color={colors.primary} />
                      <Text style={styles.leaveText}>Le bus repart de cet arrêt</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          : c.dropoffs.map((stop) => {
              const list = passengers.filter((p) => p.dropoff.place === stop.place);
              return (
                <View key={stop.place} style={[styles.card, shadow.card, styles.stop]}>
                  <StopHead stop={stop} estimated count={list.length ? `${list.length} descente${list.length > 1 ? 's' : ''}` : 'Personne'} />
                  {list.length === 0 && <Text style={styles.muted}>Aucune descente : arrêt facultatif.</Text>}
                  {list.map((p) => (
                    <PassengerRow
                      key={p.ticket}
                      p={p}
                      detail={`Monté(e) à ${p.pickup.place}`}
                      status={isBoarded(p) ? 'boarded' : isAbsent(p) ? 'absent' : 'waiting'}
                    />
                  ))}
                </View>
              );
            })}
      </ScrollView>

      <ScanBar onPress={() => setScanning(true)} />
      <ScannerModal visible={scanning} onClose={() => setScanning(false)} check={check} />
    </SafeAreaView>
  );
}

/** Plain text for WhatsApp: the driver or a co-organizer keeps the list offline. */
function manifestText(c: Caravan, passengers: Passenger[]) {
  const lines = [
    `${c.organizer.name} · ${c.from} → ${c.to}`,
    `${c.date} · ${c.time} · ${c.vehicle.plate} · ${passengers.length} passagers`,
    '',
    'MONTÉES',
  ];
  for (const s of c.pickups) {
    const list = passengers.filter((p) => p.pickup.place === s.place);
    lines.push(`${s.time} · ${s.place} (${list.length})`);
    for (const p of list) lines.push(`  ${p.seat}. ${p.name} → ${p.dropoff.place} · ${p.phone}`);
  }
  lines.push('', 'DESCENTES');
  for (const s of c.dropoffs) {
    const list = passengers.filter((p) => p.dropoff.place === s.place);
    lines.push(`~${s.time} · ${s.place} (${list.length})${list.length ? ` : places ${list.map((p) => p.seat).join(', ')}` : ''}`);
  }
  return lines.join('\n');
}

function Header({ onBack, onShare }: { onBack: () => void; onShare?: () => void }) {
  return (
    <View style={styles.head}>
      <BackButton onPress={onBack} />
      <Text style={styles.h1}>Liste des passagers</Text>
      {onShare ? (
        <Pressable onPress={onShare} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Partager la liste">
          <Ionicons name="share-outline" size={20} color={colors.navy} />
        </Pressable>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, tone ? { color: tone } : null]}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function StopHead({ stop, count, badge, estimated }: { stop: CaravanStop; count: string; badge?: string; estimated?: boolean }) {
  return (
    <View style={styles.stopHead}>
      <Text style={styles.stopTime}>
        {estimated ? '~' : ''}
        {stop.time}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.stopPlace}>{stop.place}</Text>
        <Text style={styles.muted}>{count}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, badge === 'Parti' && { backgroundColor: colors.border }]}>
          <Text style={[styles.badgeText, badge === 'Parti' && { color: colors.muted2 }]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const STATUS = {
  boarded: { icon: 'checkmark-circle', color: colors.success, label: 'à bord' },
  absent: { icon: 'close-circle', color: colors.danger, label: 'absent' },
  waiting: { icon: 'ellipse-outline', color: colors.muted, label: 'attendu' },
} as const;

function PassengerRow({
  p,
  detail,
  status,
  onToggle,
}: {
  p: Passenger;
  detail: string;
  status: keyof typeof STATUS;
  onToggle?: () => void;
}) {
  const s = STATUS[status];
  return (
    <View style={styles.passenger}>
      <Pressable
        style={styles.passengerMain}
        onPress={onToggle}
        disabled={!onToggle}
        accessibilityRole={onToggle ? 'button' : undefined}
        accessibilityLabel={`Place ${p.seat}, ${p.name}, ${s.label}`}>
        <Ionicons name={s.icon} size={22} color={s.color} />
        <View style={styles.seat}>
          <Text style={styles.seatText}>{p.seat}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, status === 'absent' && { color: colors.dangerText }]} numberOfLines={1}>
            {p.name}
          </Text>
          <Text style={styles.muted} numberOfLines={1}>
            {detail}
          </Text>
        </View>
      </Pressable>
      {!!p.phone && status !== 'boarded' && (
        <Pressable
          style={styles.call}
          onPress={() => Linking.openURL(`tel:${p.phone.replace(/\s/g, '')}`)}
          accessibilityRole="button"
          accessibilityLabel={`Appeler ${p.name}`}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function ScanBar({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.scanBar, { paddingBottom: 12 + insets.bottom }]}>
      <Pressable style={styles.scanBtn} onPress={onPress} accessibilityRole="button">
        <Ionicons name="qr-code-outline" size={20} color="#fff" />
        <Text style={styles.scanText}>Scanner un billet</Text>
      </Pressable>
    </View>
  );
}

function ScannerModal({ visible, onClose, check }: { visible: boolean; onClose: () => void; check: ReturnType<typeof useTicketCheck> }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.scanSafe}>
        <View style={styles.head}>
          <Pressable onPress={onClose} style={styles.iconBtnDark} accessibilityRole="button" accessibilityLabel="Fermer">
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={[styles.h1, { color: '#fff' }]}>Embarquement</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scanBody} keyboardShouldPersistTaps="handled">
          <TicketScanner check={check} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h3, color: colors.navy },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  iconBtnDark: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 12, paddingBottom: 120 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14 },
  route: { ...typo.h3, color: colors.navy },
  muted: { ...typo.caption, color: colors.muted2, marginTop: 1 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.bg, borderRadius: radii.sm, paddingVertical: 10, alignItems: 'center' },
  statValue: { ...typo.h2, color: colors.navy },
  next: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: radii.sm, padding: 10 },
  nextText: { ...typo.small, flex: 1, color: colors.primary },
  stop: { gap: 4 },
  stopCurrent: { borderWidth: 1.5, borderColor: colors.primary },
  stopHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  stopTime: { ...typo.bodyStrong, color: colors.primary, minWidth: 48, fontVariant: ['tabular-nums'] },
  stopPlace: { ...typo.bodyStrong, color: colors.navy },
  badge: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { ...typo.label, color: '#fff' },
  passenger: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  passengerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 },
  seat: { width: 32, height: 32, borderRadius: radii.xs, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  seatText: { ...typo.smallStrong, color: colors.primary },
  name: { ...typo.bodyStrong, color: colors.text },
  call: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  leave: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 6,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  leaveText: { ...typo.bodyStrong, color: colors.primary },
  scanBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.bg },
  scanBtn: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: { ...typo.title, color: '#fff' },
  scanSafe: { flex: 1, backgroundColor: colors.navy },
  scanBody: { padding: 20, gap: 16 },
});
