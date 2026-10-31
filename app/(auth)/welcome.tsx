import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii } from '@/constants/theme';

type Slide = { key: string; title: string; highlight: string; text: string };

const slides: Slide[] = [
  {
    key: 'campus',
    title: 'Ta vie de campus,',
    highlight: 'tout en un seul endroit.',
    text: 'Restos, caravanes, taxis et lieux du campus : tout ce dont tu as besoin à l’UGB, dans ta poche.',
  },
  {
    key: 'caravane',
    title: 'Réserve ta caravane',
    highlight: 'en quelques secondes.',
    text: 'Choisis ta place dans le bus et paie avec Wave ou Orange Money, sans faire la queue.',
  },
  {
    key: 'alertes',
    title: 'Ne rate plus',
    highlight: 'aucune info.',
    text: 'Menus du jour, départs de caravanes, objets retrouvés : reçois les alertes en temps réel.',
  },
];

const features: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Resto', icon: 'restaurant-outline' },
  { label: 'Caravanes', icon: 'bus-outline' },
  { label: 'Sunu Taxi', icon: 'car-outline' },
  { label: 'Lieux', icon: 'location-outline' },
  { label: 'Objets perdus', icon: 'cube-outline' },
];

// Photo framing: keep the student's face (at ~47% / 40% of the 1024×1536 image) in the upper part
// of the screen, whatever the phone size. The lower part may slide under the navy fade.
const PHOTO = require('@/assets/images/welcome-girl.jpg');
const PHOTO_RATIO = 1536 / 1024;
const FACE = { x: 0.47, y: 0.4 };
const FACE_SCREEN_Y = 0.3;
// < 1 zooms out: the photo is shorter than the screen and the navy fade fills the bottom.
const PHOTO_ZOOM = 0.92;

function photoFrame(width: number, height: number) {
  const h = Math.max(height * PHOTO_ZOOM, width * PHOTO_RATIO);
  const w = h / PHOTO_RATIO;
  const top = Math.min(0, FACE_SCREEN_Y * height - FACE.y * h);
  const left = Math.min(0, Math.max(width - w, width / 2 - FACE.x * w));
  return { position: 'absolute' as const, width: w, height: h, top, left };
}

const avatars = [
  { initials: 'AD', color: colors.orange },
  { initials: 'MS', color: colors.purple },
  { initials: 'FN', color: colors.success },
];

// Onboarding, shown before Connexion / Inscription.
export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [slideHeight, setSlideHeight] = useState(0);
  const list = useRef<FlatList<Slide>>(null);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const goTo = (i: number) => {
    list.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={PHOTO} style={photoFrame(width, height)} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(15,27,76,0.4)', 'rgba(15,27,76,0)', 'rgba(15,27,76,0)', 'rgba(15,27,76,0.88)', colors.navy]}
        locations={[0, 0.14, 0.42, 0.62, 0.8]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandLogo}>
                <Ionicons name="school" size={15} color="#fff" />
              </View>
              <Text style={styles.brandText}>UV-APP</Text>
            </View>
            <View style={styles.proof}>
              <View style={{ flexDirection: 'row' }}>
                {avatars.map((a, i) => (
                  <View key={a.initials} style={[styles.avatar, { backgroundColor: a.color, marginLeft: i ? -6 : 0 }]}>
                    <Text style={styles.avatarText}>{a.initials}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.proofText}>Tes camarades sont là</Text>
            </View>
          </View>

          <FlatList
            ref={list}
            style={{ flex: 1 }}
            onLayout={(e) => setSlideHeight(e.nativeEvent.layout.height)}
            data={slides}
            keyExtractor={(s) => s.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width, height: slideHeight }]}>
                <Text style={styles.title}>
                  {item.title}
                  {'\n'}
                  <Text style={{ color: colors.orange }}>{item.highlight}</Text>
                </Text>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            )}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.features}
            style={{ flexGrow: 0 }}>
            {features.map((f) => (
              <View key={f.label} style={styles.feature}>
                <Ionicons name={f.icon} size={16} color="#fff" />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.panel}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => goTo(i)}
              hitSlop={6}
              accessibilityLabel={`Diapositive ${i + 1}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
          <Text style={styles.primaryText}>Créer un compte</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}>
          <Text style={styles.secondaryText}>J’ai déjà un compte</Text>
        </Pressable>
        <Text style={styles.terms}>
          En continuant, tu acceptes nos <Text style={styles.termsLink}>Conditions</Text> et notre{' '}
          <Text style={styles.termsLink}>Politique de confidentialité</Text>
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(15,27,76,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  slide: { justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 8 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
  },
  text: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  proof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: radii.pill,
    backgroundColor: '#fff',
  },
  // 28 px with a small overlap: the initials stay readable.
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  proofText: { fontSize: 12, fontWeight: '600', color: colors.text },
  features: { gap: 8, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 14 },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  featureText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  panel: { paddingHorizontal: 24, paddingTop: 6, gap: 12 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 28, backgroundColor: colors.orange },
  primary: {
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondary: {
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  terms: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  termsLink: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
