import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, Field, LabeledField, PrimaryButton } from '@/components/ui';
import { lostPlaces, studentDirectory } from '@/constants/data';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useLost } from '@/context/LostContext';

// Barcode formats a student card may carry; the reader ignores the others.
const BARCODE_TYPES = ['code128', 'code39', 'qr', 'pdf417', 'datamatrix', 'ean13', 'itf14'] as const;
type HandOver = 'office' | 'keep';

// Found a student card: scan it (or type the number), the owner is warned in the app. Nothing is published.
export default function ScanCard() {
  const { declare } = useLost();
  const [permission, requestPermission] = useCameraPermissions();
  const [number, setNumber] = useState('');
  // Once a number is read: the masked owner, or null when the number isn't known.
  const [result, setResult] = useState<{ number: string; owner: string | null } | null>(null);
  const [where, setWhere] = useState<string | null>(null);
  const [handOver, setHandOver] = useState<HandOver>('office');

  const back = () => (router.canGoBack() ? router.back() : router.replace('/services/objets'));

  const lookup = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 6) return;
    setResult({ number: digits, owner: studentDirectory[digits]?.owner ?? null });
  };

  // The camera keeps firing while the code is in view: only the first read counts.
  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (!result) lookup(data);
  };

  const submit = () => {
    if (!result || !where) return;
    const owner = result.owner;
    const id = declare({
      category: 'student-card',
      kind: 'student-card',
      name: 'Carte étudiant',
      where,
      when: 'À l’instant',
      status: 'found',
      // Unknown owner: the card has to go to the office to be found again.
      holder: owner ? (handOver === 'office' ? 'office' : 'finder') : 'office',
      owner: owner ?? undefined,
      ownerNotified: !!owner,
      tint: colors.primary,
      bg: colors.primarySoft,
    });
    Alert.alert(
      'Merci !',
      owner
        ? `${owner} est prévenu(e) dans l’app. ${handOver === 'office' ? 'Dépose la carte au bureau des objets trouvés.' : 'Il ou elle te contactera via l’app pour la récupérer.'}`
        : 'Dépose la carte au bureau des objets trouvés : son propriétaire pourra la récupérer là-bas.',
      [{ text: 'Voir l’annonce', onPress: () => router.replace(`/objet/${id}`) }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <BackButton onPress={back} />
        <Text style={styles.h1}>Carte étudiant trouvée</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!result ? (
            <>
              <View style={styles.camera}>
                {!permission ? null : permission.granted ? (
                  <>
                    <CameraView
                      style={StyleSheet.absoluteFill}
                      facing="back"
                      barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
                      onBarcodeScanned={onScanned}
                    />
                    <View style={styles.frame} pointerEvents="none" />
                  </>
                ) : (
                  <View style={styles.permission}>
                    <Ionicons name="camera-outline" size={32} color="#fff" />
                    <Text style={styles.permissionText}>La caméra sert à lire le code-barres de la carte.</Text>
                    <Pressable
                      style={styles.permissionBtn}
                      onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}>
                      <Text style={styles.permissionBtnText}>{permission.canAskAgain ? 'Autoriser la caméra' : 'Ouvrir les réglages'}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
              <Text style={styles.hint}>Vise le code-barres de la carte. Le propriétaire est prévenu, tu ne vois jamais ses coordonnées.</Text>

              <LabeledField label="Pas de code-barres ? Saisis le numéro étudiant">
                <Field
                  icon="card-outline"
                  placeholder="Ex. 2023 0456 789"
                  keyboardType="number-pad"
                  value={number}
                  onChangeText={setNumber}
                  returnKeyType="search"
                  onSubmitEditing={() => lookup(number)}
                />
              </LabeledField>
              <PrimaryButton label="Chercher le propriétaire" disabled={number.replace(/\D/g, '').length < 6} onPress={() => lookup(number)} />
            </>
          ) : (
            <>
              <View style={[styles.card, shadow.card]}>
                <View style={[styles.resultIcon, { backgroundColor: result.owner ? colors.successBg : colors.warningBg }]}>
                  <Ionicons
                    name={result.owner ? 'person-circle' : 'help-circle'}
                    size={30}
                    color={result.owner ? colors.success : colors.warning}
                  />
                </View>
                {result.owner ? (
                  <>
                    <Text style={styles.resultTitle}>Propriétaire trouvé : {result.owner}</Text>
                    <Text style={styles.resultText}>On le ou la prévient dès que tu valides. Ses coordonnées restent privées.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.resultTitle}>Numéro pas encore dans l’app</Text>
                    <Text style={styles.resultText}>Déclare quand même la carte : elle sera signalée au bureau des objets trouvés.</Text>
                  </>
                )}
                <Pressable onPress={() => setResult(null)} hitSlop={8}>
                  <Text style={styles.rescan}>Scanner une autre carte</Text>
                </Pressable>
              </View>

              <Text style={styles.section}>Où l’as-tu trouvée ?</Text>
              <View style={styles.chips}>
                {lostPlaces.map((w) => (
                  <Pressable
                    key={w}
                    onPress={() => setWhere(w)}
                    style={[styles.chip, where === w && styles.chipOn]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: where === w }}>
                    <Text style={[styles.chipText, where === w && { color: '#fff' }]}>{w}</Text>
                  </Pressable>
                ))}
              </View>

              {result.owner && (
                <>
                  <Text style={styles.section}>Comment la rendre ?</Text>
                  <Choice
                    on={handOver === 'office'}
                    icon="business-outline"
                    title="Je la dépose au bureau des objets trouvés"
                    detail="Recommandé : pas besoin de se rencontrer"
                    onPress={() => setHandOver('office')}
                  />
                  <Choice
                    on={handOver === 'keep'}
                    icon="hand-left-outline"
                    title="Je la garde pour la remettre"
                    detail="Le propriétaire te contacte via l’app"
                    onPress={() => setHandOver('keep')}
                  />
                </>
              )}

              <PrimaryButton
                label={!where ? 'Indique où tu l’as trouvée' : result.owner ? `Prévenir ${result.owner}` : 'Déclarer la carte'}
                disabled={!where}
                onPress={submit}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Choice({
  on,
  icon,
  title,
  detail,
  onPress,
}: {
  on: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, on && styles.choiceOn]}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDetail}>{detail}</Text>
      </View>
      {on ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : <View style={styles.radio} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h3, color: colors.navy },
  body: { padding: 20, gap: 14, paddingBottom: 40 },
  camera: { height: 260, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  // Card-shaped target in the middle of the camera.
  frame: { width: '80%', height: 120, borderRadius: radii.md, borderWidth: 3, borderColor: '#fff' },
  permission: { alignItems: 'center', gap: 10, padding: 24 },
  permissionText: { ...typo.body, color: '#fff', textAlign: 'center' },
  permissionBtn: { backgroundColor: '#fff', paddingHorizontal: 16, minHeight: 38, borderRadius: radii.pill, justifyContent: 'center' },
  permissionBtnText: { color: colors.navy, fontWeight: '700' },
  hint: { ...typo.small, color: colors.muted2, textAlign: 'center', lineHeight: 18 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 18, alignItems: 'center', gap: 8 },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { ...typo.title, color: colors.navy, textAlign: 'center' },
  resultText: { ...typo.small, color: colors.muted2, textAlign: 'center', lineHeight: 18 },
  rescan: { color: colors.primary, fontWeight: '700', marginTop: 4 },
  section: { ...typo.title, color: colors.navy, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, minHeight: 40, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '600', color: colors.navy },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 14, borderWidth: 1.5, borderColor: 'transparent' },
  choiceOn: { borderColor: colors.primary },
  choiceTitle: { ...typo.bodyStrong, color: colors.navy },
  choiceDetail: { ...typo.caption, color: colors.muted2, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border },
});
