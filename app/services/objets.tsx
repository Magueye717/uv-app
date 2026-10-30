import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Segmented, StatusChip } from '@/components/ui';
import { lostItems, type LostStatus } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';

export default function ObjetsPerdusScreen() {
  const [tab, setTab] = useState<LostStatus>('found');
  const list = lostItems.filter((o) => o.status === tab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Objets perdus" subtitle="Retrouve ou déclare un objet" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Tu as perdu quelque chose ?</Text>
            <Text style={styles.bannerSub}>Déclare-le en 30 secondes</Text>
          </View>
          <Pressable
            style={styles.declare}
            onPress={() => Alert.alert('Déclarer un objet', 'Formulaire de déclaration (démo).')}>
            <Ionicons name="add" size={16} color={colors.orange} />
            <Text style={styles.declareText}>Déclarer</Text>
          </Pressable>
        </View>

        <Segmented
          options={[
            { value: 'found', label: 'Trouvés' },
            { value: 'lost', label: 'Perdus' },
          ]}
          value={tab}
          onChange={setTab}
        />

        <View style={styles.grid}>
          {list.map((o) => (
            <View key={o.id} style={[styles.card, shadow.card]}>
              <View style={[styles.visual, { backgroundColor: o.bg }]}>
                <Ionicons name={o.icon} size={30} color={o.tint} />
              </View>
              <Text style={styles.name}>{o.name}</Text>
              <View style={styles.where}>
                <Ionicons name="location-outline" size={12} color={colors.muted2} />
                <Text style={styles.whereText}>
                  {o.where} · {o.when}
                </Text>
              </View>
              <StatusChip
                label={o.pickup}
                tone={o.status === 'lost' ? 'danger' : o.pickup === 'Au bureau' ? 'warning' : 'success'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  banner: {
    backgroundColor: colors.orange,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },
  declare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radii.pill,
  },
  declareText: { color: colors.orange, fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 18, padding: 10, gap: 6, alignItems: 'flex-start' },
  visual: { alignSelf: 'stretch', height: 92, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '800', color: colors.navy, fontSize: 14, marginTop: 2 },
  where: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  whereText: { fontSize: 12, color: colors.muted2 },
});
