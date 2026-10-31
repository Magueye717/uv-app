import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, OutlineButton, PrimaryButton } from '@/components/ui';
import { lostCategory, lostOffice, lostSafetyTip } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useLost } from '@/context/LostContext';
import { openDirections } from '@/lib/maps';

// One lost or found item: what, where, where it is now, and how to reach the person — always inside the app.
export default function ObjetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lost = useLost();
  const [claiming, setClaiming] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/services/objets'));
  const item = lost.items.find((i) => i.id === id);
  if (!item) {
    return (
      <View style={[styles.root, styles.missing, { paddingTop: insets.top }]}>
        <Ionicons name="help-circle-outline" size={32} color={colors.muted} />
        <Text style={styles.muted}>Objet introuvable.</Text>
        <OutlineButton label="Retour" onPress={back} />
      </View>
    );
  }

  const cat = lostCategory(item.category);
  const found = item.status === 'found';
  const isCard = item.kind !== 'object';
  const talking = lost.messages.some((m) => m.itemId === item.id);
  const openChat = () => router.push(`/objet/discussion/${item.id}`);
  const status = item.returned
    ? { label: 'Rendu', fg: colors.muted2, bg: colors.bg }
    : found
      ? { label: 'Trouvé', fg: colors.successText, bg: colors.successBg }
      : { label: 'Perdu', fg: colors.orangeText, bg: '#FFE8D4' };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: item.bg }]}>
          {item.photo && !isCard ? (
            <Image source={item.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name={cat.icon} size={56} color={item.tint} />
              <Text style={styles.noPhotoText}>{isCard ? 'Pièce personnelle : jamais en photo' : 'Pas de photo'}</Text>
            </View>
          )}
          <Pressable
            onPress={back}
            style={[styles.back, { top: insets.top + 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={20} color={colors.navy} />
          </Pressable>
        </View>

        <View style={[styles.card, shadow.raised]}>
          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: status.bg }]}>
              <Text style={[styles.pillText, { color: status.fg }]}>{status.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.bg }]}>
              <Ionicons name={cat.icon} size={12} color={colors.muted2} />
              <Text style={[styles.pillText, { color: colors.muted2 }]}>{cat.label}</Text>
            </View>
          </View>
          <Text style={styles.name}>{item.name}</Text>
          {item.details && <Text style={styles.details}>{item.details}</Text>}
          {item.owner && (
            <Text style={styles.owner}>
              {item.ownerNotified ? `✓ ${item.owner} a été prévenu(e)` : `Au nom de ${item.owner}`}
            </Text>
          )}
        </View>

        <View style={styles.body}>
          <View style={[styles.infoCard, shadow.card]}>
            <Info icon="location" label={found ? 'Trouvé à' : 'Perdu à'} value={item.spot ? `${item.where} · ${item.spot}` : item.where} />
            <View style={styles.divider} />
            <Info icon="time" label="Quand" value={item.when} />
            <View style={styles.divider} />
            <Info icon="person" label={found ? 'Trouvé par' : 'Perdu par'} value={item.mine ? `Toi (${item.by})` : item.by} />
          </View>

          {item.returned ? (
            <View style={[styles.notice, { backgroundColor: colors.successBg }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.noticeText, { color: colors.successText }]}>Rendu à son propriétaire. Affaire réglée !</Text>
            </View>
          ) : (
            <>
              {found && (
                <>
                  <Text style={styles.section}>Où le récupérer ?</Text>
                  {item.holder === 'office' ? (
                    <View style={[styles.infoCard, shadow.card]}>
                      <Info icon="business" label={lostOffice.name} value={`${lostOffice.area} · ${lostOffice.hours}`} />
                      <Text style={styles.hint}>Présente-toi avec ta carte étudiant ou une pièce d’identité.</Text>
                      <OutlineButton label="Itinéraire vers le bureau" onPress={() => openDirections(lostOffice.coords, lostOffice.name)} />
                    </View>
                  ) : (
                    <View style={[styles.infoCard, shadow.card]}>
                      <Info icon="hand-left" label={item.mine ? 'Tu le gardes' : `Chez ${item.by}`} value="Rendez-vous à convenir dans l’app" />
                      <View style={styles.tip}>
                        <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted2} />
                        <Text style={styles.tipText}>{lostSafetyTip}</Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Actions: claim, report found, or manage my own declaration. */}
              {talking ? (
                <PrimaryButton label="Ouvrir la discussion" onPress={openChat} />
              ) : item.mine ? null : found ? (
                item.holder === 'finder' && <PrimaryButton label="C’est à moi" onPress={() => setClaiming(true)} />
              ) : (
                <PrimaryButton
                  label="Je l’ai trouvé"
                  onPress={() => {
                    lost.reportFound(item.id);
                    openChat();
                  }}
                />
              )}

              {item.mine && (
                <OutlineButton
                  label={found ? 'Marquer comme rendu' : 'Je l’ai retrouvé'}
                  onPress={() =>
                    Alert.alert(found ? 'Objet rendu ?' : 'Objet retrouvé ?', 'L’annonce sera fermée.', [
                      { text: 'Pas encore', style: 'cancel' },
                      { text: 'Oui', onPress: () => lost.markReturned(item.id) },
                    ])
                  }
                />
              )}
              {item.mine && item.secret && (
                <View style={styles.tip}>
                  <Ionicons name="lock-closed-outline" size={14} color={colors.muted2} />
                  <Text style={styles.tipText}>Ton détail de vérification (privé) : {item.secret}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <ClaimSheet
        visible={claiming}
        placeholder={cat.secretHint ?? 'Un détail qui ne se voit pas sur la photo…'}
        onClose={() => setClaiming(false)}
        onSend={(proof) => {
          lost.claim(item.id, proof);
          setClaiming(false);
          openChat();
        }}
      />
    </View>
  );
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

/** "C'est à moi": a detail only the owner knows, so the finder can check before meeting. */
function ClaimSheet({
  visible,
  placeholder,
  onClose,
  onSend,
}: {
  visible: boolean;
  placeholder: string;
  onClose: () => void;
  onSend: (proof: string) => void;
}) {
  const [proof, setProof] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setProof('')}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Prouve que c’est à toi</Text>
          <Text style={styles.sheetText}>
            Décris un détail qui ne se voit pas sur la photo. La personne qui l’a trouvé vérifie avant de te le rendre.
          </Text>
          <Field
            icon="key-outline"
            placeholder={placeholder}
            value={proof}
            onChangeText={setProof}
            autoCapitalize="sentences"
            maxLength={140}
            autoFocus
          />
          <PrimaryButton label="Envoyer et ouvrir la discussion" disabled={proof.trim().length < 3} onPress={() => onSend(proof.trim())} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  missing: { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  muted: { color: colors.muted2 },
  hero: { height: 260 },
  noPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  noPhotoText: { fontSize: 12, fontWeight: '700', color: colors.muted2 },
  back: {
    position: 'absolute',
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  card: { marginTop: -28, marginHorizontal: 20, backgroundColor: colors.card, borderRadius: radii.lg, padding: 16, gap: 6 },
  pills: { flexDirection: 'row', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radii.pill },
  pillText: { fontSize: 12, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '800', color: colors.navy, marginTop: 4 },
  details: { fontSize: 14, color: colors.muted2, lineHeight: 20 },
  owner: { fontSize: 13, fontWeight: '700', color: colors.successText },
  body: { paddingHorizontal: 20, marginTop: 16, gap: 12 },
  section: { fontSize: 16, fontWeight: '800', color: colors.navy, marginTop: 4 },
  infoCard: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14, gap: 12 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12, color: colors.muted2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.navy, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  hint: { fontSize: 13, color: colors.muted2 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  tipText: { flex: 1, fontSize: 12, color: colors.muted2, lineHeight: 17 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: radii.md },
  noticeText: { flex: 1, fontSize: 14, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,27,76,0.35)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 20, paddingBottom: 36, gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
  sheetText: { fontSize: 13, color: colors.muted2, lineHeight: 18 },
});
