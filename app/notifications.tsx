import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, FilterChips } from '@/components/ui';
import { notificationFilters, notifications } from '@/constants/data';
import { colors, shadow } from '@/constants/theme';

type Filter = (typeof notificationFilters)[number];

const groups = [
  { day: 'today', label: 'AUJOURD’HUI' },
  { day: 'yesterday', label: 'HIER' },
] as const;

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const list = filter === 'Tout' ? notifications : notifications.filter((n) => n.category === filter);
  const todayCount = notifications.filter((n) => n.day === 'today').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <BackButton onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Notifications</Text>
          <Text style={styles.sub}>{todayCount} nouvelles aujourd’hui</Text>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <FilterChips options={notificationFilters} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {groups.map((g) => {
          const items = list.filter((n) => n.day === g.day);
          if (!items.length) return null;
          return (
            <View key={g.day} style={{ gap: 10 }}>
              <Text style={styles.group}>{g.label}</Text>
              {items.map((n) => (
                <View key={n.id} style={[styles.card, shadow.card]}>
                  <View style={[styles.icon, { backgroundColor: n.bg }]}>
                    <Ionicons name={n.icon} size={18} color={n.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{n.title}</Text>
                    <Text style={styles.body2}>{n.body}</Text>
                  </View>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
              ))}
            </View>
          );
        })}
        {list.length === 0 && <Text style={styles.empty}>Aucune notification dans cette catégorie.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.navy },
  sub: { color: colors.muted2, marginTop: 2 },
  body: { padding: 20, gap: 16, paddingBottom: 32 },
  group: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', color: colors.navy, fontSize: 14 },
  body2: { color: colors.muted2, fontSize: 12, marginTop: 2 },
  time: { color: colors.muted, fontSize: 11, alignSelf: 'flex-start', marginTop: 2 },
  empty: { color: colors.muted2, textAlign: 'center', paddingVertical: 24 },
});
