import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { popIn, riseIn } from '@/components/motion';
import { Field } from '@/components/ui';
import { colors, motion, radii, typo } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import type { ScanResult } from './useTicketCheck';

const TONES = {
  success: { color: colors.success, icon: 'checkmark-circle', feel: haptics.success },
  warning: { color: colors.warning, icon: 'alert-circle', feel: haptics.warning },
  danger: { color: colors.danger, icon: 'close-circle', feel: haptics.error },
} as const;

/**
 * Camera + typed-code fallback + verdict card, on a dark background (used at night, in the bus).
 * The verdict is felt and seen at a glance: a vibration (Android; iOS mutes haptics while the camera runs)
 * and a green / orange / red flash over the camera, then the card with the details.
 * `onOpenList`: shows a link to the departure's passenger list under the verdict.
 * `active`: false turns the camera off (a tab that isn't on screen), to save battery.
 */
export function TicketScanner({
  check,
  onOpenList,
  active = true,
}: {
  check: (raw: string) => ScanResult;
  onOpenList?: (caravanId: string) => void;
  active?: boolean;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [code, setCode] = useState('');
  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));

  const read = (raw: string) => {
    if (result || !raw.trim()) return; // the camera keeps firing while the code is in view
    const r = check(raw);
    TONES[r.tone].feel();
    flash.set(withSequence(withTiming(0.55, { duration: motion.fast }), withTiming(0, { duration: motion.slow })));
    setResult(r);
    setCode('');
  };
  const tone = result && TONES[result.tone];

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.camera}>
        {permission?.granted
          ? active && (
              <>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={result ? undefined : ({ data }: BarcodeScanningResult) => read(data)}
                />
                <View style={styles.frame} pointerEvents="none" />
              </>
            )
          : permission && (
              <View style={styles.permission}>
                <Ionicons name="camera-outline" size={32} color="#fff" />
                <Text style={styles.permissionText}>La caméra sert à lire le QR code des billets.</Text>
                <Pressable
                  style={styles.permissionBtn}
                  onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
                  accessibilityRole="button">
                  <Text style={styles.permissionBtnText}>{permission.canAskAgain ? 'Autoriser la caméra' : 'Ouvrir les réglages'}</Text>
                </Pressable>
              </View>
            )}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: tone?.color ?? 'transparent' }, flashStyle]} pointerEvents="none" />
      </View>

      {result && tone ? (
        <Animated.View entering={riseIn} style={[styles.result, { borderColor: tone.color }]} accessibilityLiveRegion="assertive">
          <Animated.View entering={popIn.delay(motion.fast)}>
            <Ionicons name={tone.icon} size={44} color={tone.color} />
          </Animated.View>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultText}>{result.text}</Text>
          <Pressable style={styles.next} onPress={() => setResult(null)} accessibilityRole="button">
            <Ionicons name="qr-code-outline" size={18} color="#fff" />
            <Text style={styles.nextText}>Billet suivant</Text>
          </Pressable>
          {onOpenList && result.caravanId && (
            <Pressable onPress={() => onOpenList(result.caravanId!)} hitSlop={8} accessibilityRole="link">
              <Text style={styles.link}>Voir la liste des passagers</Text>
            </Pressable>
          )}
        </Animated.View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={styles.hint}>Vise le QR code du billet. Téléphone éteint ? Saisis le code écrit sous le QR.</Text>
          <Field
            icon="ticket-outline"
            placeholder="Code du billet, ex. TC305"
            autoCapitalize="characters"
            autoCorrect={false}
            value={code}
            onChangeText={setCode}
            returnKeyType="done"
            onSubmitEditing={() => read(code)}
            right={
              code ? (
                <Pressable onPress={() => read(code)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Vérifier le code">
                  <Ionicons name="arrow-forward-circle" size={26} color={colors.accent} />
                </Pressable>
              ) : null
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: { aspectRatio: 1, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center' },
  frame: { position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', borderWidth: 3, borderColor: colors.orange, borderRadius: radii.md },
  permission: { alignItems: 'center', gap: 12, padding: 24 },
  permissionText: { ...typo.body, color: '#fff', textAlign: 'center' },
  permissionBtn: { backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  permissionBtnText: { ...typo.bodyStrong, color: '#fff' },
  hint: { ...typo.small, color: 'rgba(255,255,255,0.8)', lineHeight: 19 },
  result: { backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 2, padding: 18, gap: 8, alignItems: 'center' },
  resultTitle: { ...typo.h3, color: colors.navy, textAlign: 'center' },
  resultText: { ...typo.body, color: colors.text, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  next: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { ...typo.title, color: '#fff' },
  link: { ...typo.bodyStrong, color: colors.orangeText, paddingVertical: 6 },
});
