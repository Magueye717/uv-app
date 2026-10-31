import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdCarousel, AlertStrip, CaravanCard, RestoCard } from '@/components/home';
import { headlines, services } from '@/constants/data';
import { colors, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { setupNotifications } from '@/lib/notifications';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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
          <Pressable onPress={() => router.push('/notifications')} style={styles.bell}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.dot} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AlertStrip />
        <CaravanCard />
        <RestoCard />

        <Text style={styles.section}>Services</Text>
        <View style={styles.grid}>
          {services.map((s) => (
            <Pressable key={s.key} style={styles.service} onPress={() => router.push(s.href as never)}>
              <View style={styles.serviceIcon}>
                <Ionicons name={s.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <AdCarousel />

        <Text style={styles.section}>À la une</Text>
        {headlines.map((h) => (
          <View key={h.id} style={[styles.news, shadow.card]}>
            <View style={[styles.newsIcon, { backgroundColor: h.bg }]}>
              <Ionicons name={h.icon} size={18} color={h.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.newsTop}>
                <Text style={[styles.newsTag, { color: h.tint }]}>{h.tag.toUpperCase()}</Text>
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  avatarText: { color: '#fff', fontWeight: '800' },
  hello: { color: '#fff', fontSize: 20, fontWeight: '800' },
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
  muted: { color: colors.muted2, fontSize: 13, marginTop: 2 },
  section: { fontSize: 20, fontWeight: '800', color: colors.navy, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  // 3 per row: 6 services fill two full rows.
  service: { width: '31%', alignItems: 'center', gap: 8, marginBottom: 14 },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: { fontSize: 12, color: colors.navy, fontWeight: '600', textAlign: 'center' },
  news: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  newsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  newsTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  newsTime: { fontSize: 11, color: colors.muted },
  newsTitle: { fontWeight: '800', color: colors.navy, fontSize: 14 },
});
