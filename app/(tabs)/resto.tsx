import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BellButton, StatusChip } from '@/components/ui';
import { privateCampuses, publicMenus, type DishStatus } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';

const tone: Record<DishStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  available: { label: 'Disponible', tone: 'success' },
  low: { label: 'Plus que 24', tone: 'warning' },
  critical: { label: 'Plus que 9', tone: 'danger' },
};

export default function RestoScreen() {
  const [tab, setTab] = useState<'public' | 'prive'>('public');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <View>
          <Text style={styles.h1}>Restaurants</Text>
          <Text style={styles.sub}>{tab === 'public' ? 'Menus du jour · Mer. 03 sept' : 'Commande depuis ton campus'}</Text>
        </View>
        <BellButton onPress={() => router.push('/notifications')} />
      </View>

      <View style={styles.switch}>
        <Pressable onPress={() => setTab('public')} style={[styles.swBtn, tab === 'public' && styles.swOn]}>
          <Text style={[styles.swText, tab === 'public' && styles.swTextOn]}>Public</Text>
        </Pressable>
        <Pressable onPress={() => setTab('prive')} style={[styles.swBtn, tab === 'prive' && styles.swOn]}>
          <Text style={[styles.swText, tab === 'prive' && styles.swTextOn]}>Privés</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {tab === 'public'
          ? publicMenus.map((menu) => (
              <View key={menu.id} style={[styles.card, shadow.card]}>
                <View style={styles.cardHead}>
                  <View>
                    <Text style={styles.cardTitle}>{menu.name}</Text>
                    <Text style={styles.muted}>
                      {menu.count} plats
                    </Text>
                  </View>
                  <StatusChip label={menu.hours} tone="success" />
                </View>
                {menu.dishes.map((d) => (
                  <View key={d.name} style={styles.dish}>
                    <View style={styles.dishIcon}>
                      <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dishName}>{d.name}</Text>
                      <Text style={styles.muted}>{d.detail}</Text>
                    </View>
                    <StatusChip {...tone[d.status]} />
                  </View>
                ))}
              </View>
            ))
          : privateCampuses.map((campus) => (
              <View key={campus.id} style={{ gap: 10 }}>
                <View style={styles.campusRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={styles.campus}>{campus.name}</Text>
                  </View>
                  <Text style={styles.muted}>{campus.count} restaurants</Text>
                </View>
                {campus.restaurants.map((r) => (
                  <Pressable key={r.id} style={[styles.resto, shadow.card]} onPress={() => router.push(`/resto/${r.id}`)}>
                    <View style={[styles.restoIcon, { backgroundColor: r.bg }]}>
                      <Ionicons name="fast-food-outline" size={20} color={r.tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dishName}>{r.name}</Text>
                      <Text style={styles.muted}>{r.kind}</Text>
                      <View style={styles.hoursRow}>
                        <Ionicons name="time-outline" size={12} color={colors.muted2} />
                        <Text style={styles.hours}>{r.hours}</Text>
                      </View>
                    </View>
                    <StatusChip label="Ouvert" tone="success" />
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                ))}
              </View>
            ))}

        {tab === 'public' && (
          <Pressable style={styles.banner} onPress={() => setTab('prive')}>
            <View style={styles.bannerIcon}>
              <Ionicons name="car-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Envie d’être livré ?</Text>
              <Text style={styles.bannerSub}>Commande dans les restaurants privés</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.navy },
  sub: { color: colors.muted2, marginTop: 2 },
  switch: {
    margin: 20,
    marginBottom: 8,
    backgroundColor: '#E9EDF8',
    borderRadius: radii.pill,
    flexDirection: 'row',
    padding: 4,
  },
  swBtn: { flex: 1, height: 42, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  swOn: { backgroundColor: colors.primary },
  swText: { fontWeight: '700', color: colors.muted2 },
  swTextOn: { color: '#fff' },
  body: { padding: 20, paddingTop: 8, gap: 14, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
  muted: { color: colors.muted2, fontSize: 13 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dishIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishName: { fontWeight: '800', color: colors.navy },
  campusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  campus: { fontSize: 16, fontWeight: '800', color: colors.navy },
  resto: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restoIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  hours: { color: colors.muted2, fontSize: 12 },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
