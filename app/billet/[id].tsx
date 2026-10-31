import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrganizerLine } from '@/components/caravan';
import { BackButton, Field, LabeledField, PrimaryButton } from '@/components/ui';
import {
  cancellationRefund,
  caravanState,
  caravans,
  formatDateTime,
  formatFcfa,
  FREE_CANCEL_MS,
  paymentMethods,
} from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTickets } from '@/context/TicketsContext';
import { useNow } from '@/lib/useNow';

export default function Billet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tickets, cancel, transfer } = useTickets();
  const { user } = useAuth();
  const now = useNow();
  const [transferOpen, setTransferOpen] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/(tabs)/caravanes', params: { vue: 'caravanes' } }));
  const ticket = tickets.find((t) => t.id === id);
  const c = ticket && caravans.find((x) => x.id === ticket.caravanId);

  if (!ticket || !c) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={back} />
        <View style={styles.missing}>
          <Ionicons name="ticket-outline" size={32} color={colors.muted} />
          <Text style={styles.muted}>Billet introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { confirmed, missing } = caravanState(c);
  const active = ticket.status === 'active';
  const departed = now >= c.departureAt;
  const method = paymentMethods.find((m) => m.id === ticket.paymentId)?.name ?? 'ton compte';

  const askCancel = () => {
    const refund = cancellationRefund(ticket.price, c.departureAt, now);
    if (refund === null) return;
    const free = c.departureAt - now >= FREE_CANCEL_MS;
    Alert.alert(
      'Annuler ce billet ?',
      free
        ? `Annulation gratuite : ${formatFcfa(refund)} remboursés sur ${method}.`
        : `Moins de 24 h avant le départ : 10 % de frais. ${formatFcfa(refund)} remboursés sur ${method}.`,
      [
        { text: 'Garder mon billet', style: 'cancel' },
        { text: 'Annuler le billet', style: 'destructive', onPress: () => cancel(ticket.id, refund) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header onBack={back} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <StatusBanner
          {...(ticket.status === 'cancelled'
            ? { tone: 'neutral', icon: 'close-circle', text: `Billet annulé · ${formatFcfa(ticket.refund ?? 0)} remboursés sur ${method}` }
            : ticket.status === 'transferred'
              ? { tone: 'neutral', icon: 'swap-horizontal', text: `Billet transféré au ${ticket.transferredTo}` }
              : confirmed
                ? { tone: 'success', icon: 'checkmark-circle', text: 'Départ confirmé · rendez-vous 30 min avant' }
                : {
                    tone: 'warning',
                    icon: 'hourglass-outline',
                    text: `En attente de ${missing} passager${missing > 1 ? 's' : ''} d’ici le ${formatDateTime(c.confirmBy)}. Sinon tu es remboursé à 100 %.`,
                  })}
        />

        <View style={[styles.ticket, shadow.raised, !active && { opacity: 0.6 }]}>
          <View style={styles.top}>
            <OrganizerLine organizer={c.organizer} />
            <View style={styles.route}>
              <Text style={styles.city}>{c.from}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              <Text style={styles.city}>{c.to}</Text>
            </View>
            {user && (
              <Text style={styles.passenger}>
                {user.firstName} {user.lastName}
              </Text>
            )}
            <View style={styles.grid}>
              <Cell label="Date" value={c.date} />
              <Cell label="Heure" value={c.time} />
              <Cell label="Place" value={`n° ${ticket.seat}`} />
              <Cell label="Rendez-vous" value={c.meetingPoint} />
              <Cell label="Descente" value={ticket.stop} />
              <Cell label="Bus" value={c.vehicle.plate} />
            </View>
          </View>

          {/* Tear line between the trip and the code. */}
          <View style={styles.tear}>
            <View style={[styles.notch, { left: -12 }]} />
            <View style={styles.dashes} />
            <View style={[styles.notch, { right: -12 }]} />
          </View>

          <View style={styles.bottom}>
            {active ? (
              <>
                <QRCode value={`UV-CARAVANE:${ticket.id}:${c.id}:${ticket.seat}`} size={170} color={colors.navy} backgroundColor={colors.card} />
                <Text style={styles.code}>{ticket.id}</Text>
                <Text style={styles.muted}>Montre ce code au chauffeur à l’embarquement</Text>
              </>
            ) : (
              <View style={styles.void}>
                <Ionicons name="ban-outline" size={36} color={colors.muted} />
                <Text style={styles.muted}>Ce billet n’est plus valable</Text>
              </View>
            )}
          </View>
        </View>

        {active && !departed && (
          <View style={{ gap: 10 }}>
            <Pressable style={[styles.action, shadow.card]} onPress={() => setTransferOpen(true)} accessibilityRole="button">
              <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Transférer à un ami</Text>
                <Text style={styles.actionSub}>Ton ami reçoit le billet, ta place lui revient</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
            <Pressable style={[styles.action, shadow.card]} onPress={askCancel} accessibilityRole="button">
              <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.dangerText }]}>Annuler le billet</Text>
                <Text style={styles.actionSub}>
                  {c.departureAt - now >= FREE_CANCEL_MS ? 'Gratuit jusqu’à 24 h avant le départ' : '10 % de frais à moins de 24 h du départ'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      <TransferSheet
        visible={transferOpen}
        onClose={() => setTransferOpen(false)}
        onConfirm={(phone) => {
          transfer(ticket.id, phone);
          setTransferOpen(false);
          Alert.alert('Billet transféré', `Le billet est envoyé au ${phone}. Il apparaîtra dans son app.`);
        }}
      />
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.head}>
      <BackButton onPress={onBack} />
      <Text style={styles.h1}>Mon billet</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

const TONES = {
  success: { fg: colors.successText, bg: colors.successBg, icon: colors.success },
  warning: { fg: colors.warningText, bg: colors.warningBg, icon: colors.warning },
  neutral: { fg: colors.muted2, bg: colors.card, icon: colors.muted },
};

function StatusBanner({ tone, icon, text }: { tone: keyof typeof TONES; icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const t = TONES[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }]} accessibilityLiveRegion="polite">
      <Ionicons name={icon} size={18} color={t.icon} />
      <Text style={[styles.bannerText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function TransferSheet({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: (phone: string) => void }) {
  const [digits, setDigits] = useState('');
  // Senegalese mobile numbers: 9 digits, starting with 7.
  const valid = /^7\d{8}$/.test(digits);
  const shown = digits.replace(/^(\d{2})(\d{0,3})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Transférer le billet</Text>
          <Text style={styles.actionSub}>Ton billet devient le sien. Tu ne pourras plus l’utiliser.</Text>
          <LabeledField label="Numéro de ton ami" error={digits.length >= 9 && !valid ? 'Numéro invalide' : null}>
            <Field
              prefix="+221"
              placeholder="77 123 45 67"
              keyboardType="phone-pad"
              value={shown}
              onChangeText={(t) => setDigits(t.replace(/\D/g, '').slice(0, 9))}
              invalid={digits.length >= 9 && !valid}
            />
          </LabeledField>
          <PrimaryButton label="Transférer" disabled={!valid} onPress={() => onConfirm(`+221 ${shown}`)} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 18, fontWeight: '800', color: colors.navy },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: colors.muted2, fontSize: 12, textAlign: 'center' },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: radii.md },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  ticket: { backgroundColor: colors.card, borderRadius: radii.xl },
  top: { padding: 18, gap: 12 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  city: { fontSize: 24, fontWeight: '800', color: colors.navy },
  passenger: { fontSize: 14, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  cell: { width: '33.33%', paddingRight: 8 },
  cellLabel: { fontSize: 11, color: colors.muted2 },
  cellValue: { fontSize: 14, fontWeight: '700', color: colors.navy, marginTop: 2 },
  tear: { height: 24, justifyContent: 'center' },
  dashes: { marginHorizontal: 18, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  notch: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg },
  bottom: { alignItems: 'center', gap: 8, padding: 18, paddingTop: 8 },
  code: { fontSize: 15, fontWeight: '700', color: colors.navy, letterSpacing: 2 },
  void: { height: 170, alignItems: 'center', justifyContent: 'center', gap: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 14 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  actionSub: { fontSize: 12, color: colors.muted2, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,27,76,0.35)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 20, paddingBottom: 36, gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
});
