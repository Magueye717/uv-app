import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdCarousel, AlertStrip, CaravanCard, RestoCard, TaxiCard } from '@/components/home';
import { InProgress } from '@/components/InProgress';
import { headlines } from '@/constants/data';
import { colors, shadow, radii, typo } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { bellLabel, useNotifications } from '@/context/NotificationsContext';
import { setupNotifications } from '@/lib/notifications';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { unread } = useNotifications();
  const name = user?.firstName ?? 'Awa';

  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.initials ?? 'AD'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Bonjour, {name}</Text>
            <Text style={styles.campus}>{user?.campus ?? 'UGB · Campus social'}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel={bellLabel(unread.length)}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unread.length > 0 && <View style={styles.dot} />}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AlertStrip />
        {/* What the student has going on comes first; the tabs cover the rest (no services grid). */}
        <InProgress />
        <CaravanCard />
        <TaxiCard />
        <RestoCard />

        <AdCarousel />

        <Text style={styles.section}>À la une</Text>
        {headlines.map((h) => (
          <View key={h.id} style={[styles.news, shadow.card]}>
            {/* One neutral style; red only for what is urgent (a dish running out…). */}
            <View style={[styles.newsIcon, { backgroundColor: h.urgent ? colors.dangerBg : colors.primarySoft }]}>
              <Ionicons name={h.icon} size={18} color={h.urgent ? colors.dangerText : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.newsTop}>
                <Text style={[styles.newsTag, { color: h.urgent ? colors.dangerText : colors.muted2 }]}>{h.tag.toUpperCase()}</Text>
                <Text style={styles.newsTime}>{h.time}</Text>
              </View>
              <Text style={styles.newsTitle}>{h.title}</Text>
              <Text style={styles.muted} numberOfLines={2}>
                {h.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  hello: { ...typo.h2, color: '#fff' },
  campus: { color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  body: { padding: 20, paddingBottom: 32, gap: 14 },
  muted: { ...typo.small, color: colors.muted2, marginTop: 2 },
  section: { ...typo.h2, color: colors.navy, marginTop: 8 },
  news: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  newsIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  newsTag: { ...typo.label, letterSpacing: 0.4 },
  newsTime: { fontSize: 11, color: colors.muted2 },
  newsTitle: { ...typo.bodyStrong, color: colors.navy },
});
