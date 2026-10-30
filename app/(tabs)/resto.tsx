import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BellButton, StatusChip } from '@/components/ui';
import { privateCampuses } from '@/constants/data';
import { colors, shadow } from '@/constants/theme';

// Private restaurants only: the public Resto U menus are on the home screen.
export default function RestoScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <View>
          <Text style={styles.h1}>Restaurants</Text>
          <Text style={styles.sub}>Restos privés · commande depuis ton campus</Text>
        </View>
        <BellButton onPress={() => router.push('/notifications')} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {privateCampuses.map((campus) => (
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
                  <Text style={styles.restoName}>{r.name}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.navy },
  sub: { color: colors.muted2, marginTop: 2 },
  body: { padding: 20, paddingTop: 16, gap: 14, paddingBottom: 32 },
  muted: { color: colors.muted2, fontSize: 13 },
  restoName: { fontWeight: '800', color: colors.navy },
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
});
