import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChips, ScreenHeader } from '@/components/ui';
import { placeCategories, places } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';

type Filter = (typeof placeCategories)[number];

// Static illustration until a real map is wired in.
const pins = [
  { top: '28%', left: '18%', color: colors.purple },
  { top: '14%', left: '50%', color: colors.primary },
  { top: '38%', left: '76%', color: colors.orange },
  { top: '68%', left: '28%', color: colors.green },
] as const;

export default function LieuxScreen() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const list = filter === 'Tout' ? places : places.filter((p) => p.category === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Lieux du campus" subtitle="Les endroits à connaître" />
      <View style={{ marginTop: 14 }}>
        <FilterChips options={placeCategories} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.map}>
          <View style={[styles.road, { top: '45%', left: 0, right: 0, height: 14 }]} />
          <View style={[styles.road, { left: '40%', top: 0, bottom: 0, width: 14 }]} />
          <View style={[styles.block, { top: '10%', left: '6%', width: '26%', height: '26%' }]} />
          <View style={[styles.block, { top: '62%', left: '56%', width: '30%', height: '26%' }]} />
          <View style={[styles.green, { top: '60%', left: '6%', width: '24%', height: '30%' }]} />
          {pins.map((p, i) => (
            <View key={i} style={[styles.pin, { top: p.top, left: p.left, backgroundColor: p.color }]}>
              <View style={styles.pinDot} />
            </View>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Lieux incontournables</Text>
          <Pressable onPress={() => setFilter('Tout')}>
            <Text style={styles.link}>Tout voir</Text>
          </Pressable>
        </View>

        {list.map((p) => (
          <View key={p.id} style={[styles.card, shadow.card]}>
            <View style={[styles.icon, { backgroundColor: p.bg }]}>
              <Ionicons name={p.icon} size={22} color={p.tint} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>{p.name}</Text>
              <View style={[styles.cat, { backgroundColor: p.bg }]}>
                <Text style={[styles.catText, { color: p.tint }]}>{p.category}</Text>
              </View>
              <View style={styles.walk}>
                <Ionicons name="time-outline" size={12} color={colors.muted2} />
                <Text style={styles.walkText}>{p.walk}</Text>
              </View>
            </View>
            <Pressable style={styles.nav} hitSlop={6}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  map: { height: 170, borderRadius: 20, backgroundColor: '#E6ECF7', overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: '#fff' },
  block: { position: 'absolute', backgroundColor: '#D4DDF0', borderRadius: 8 },
  green: { position: 'absolute', backgroundColor: '#D3EEDC', borderRadius: 8 },
  pin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pinDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  section: { fontSize: 18, fontWeight: '800', color: colors.navy },
  link: { color: colors.primary, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', color: colors.navy, fontSize: 15 },
  cat: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  catText: { fontSize: 11, fontWeight: '700' },
  walk: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  walkText: { fontSize: 12, color: colors.muted2 },
  nav: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
