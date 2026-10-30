import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaravanSummary } from '@/components/caravan';
import { ScreenHeader, Segmented } from '@/components/ui';
import { caravans, type CaravanDirection } from '@/constants/data';
import { colors, shadow } from '@/constants/theme';

export default function CaravanesScreen() {
  const [direction, setDirection] = useState<CaravanDirection>('aller');
  const list = caravans.filter((c) => c.direction === direction);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Caravanes" subtitle="Réserve ton billet en ligne" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Réserve ton ticket</Text>
            <Text style={styles.heroSub}>Voyage vers Dakar et les régions. Paie avec Wave ou Orange Money.</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="bus-outline" size={26} color="#fff" />
          </View>
        </View>

        <Segmented
          options={[
            { value: 'aller', label: 'Aller' },
            { value: 'retour', label: 'Retour' },
          ]}
          value={direction}
          onChange={setDirection}
        />

        {list.map((c) => {
          const booked = c.totalSeats - c.seats;
          return (
            <View key={c.id} style={[styles.card, shadow.card]}>
              <CaravanSummary caravan={c} />

              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${(booked / c.totalSeats) * 100}%` }]} />
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.seats}>
                  {booked}/{c.totalSeats} places
                </Text>
                <Pressable style={styles.book} onPress={() => router.push(`/caravane/${c.id}`)}>
                  <Text style={styles.bookText}>Réserver</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, lineHeight: 17 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 14, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.bg, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  seats: { fontSize: 13, fontWeight: '700', color: colors.navy },
  book: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { color: '#fff', fontWeight: '700' },
});
