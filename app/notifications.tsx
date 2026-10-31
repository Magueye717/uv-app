import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, FilterChips } from '@/components/ui';
import { EmptyState } from '@/components/states';
import { notificationFilters, notifications } from '@/constants/data';
import { colors, shadow, radii, typo } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationsContext';

type Filter = (typeof notificationFilters)[number];

const groups = [
  { day: 'today', label: 'AUJOURD’HUI' },
  { day: 'yesterday', label: 'HIER' },
] as const;

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const list = filter === 'Tout' ? notifications : notifications.filter((n) => n.category === filter);
  const { unread, markAllRead } = useNotifications();
  // What was new when the screen opened stays highlighted while it's open; the bell clears right away.
  const [fresh] = useState(unread);
  useEffect(() => {
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on opening
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <BackButton onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Notifications</Text>
          <Text style={styles.sub}>
            {fresh.length ? `${fresh.length} nouvelle${fresh.length > 1 ? 's' : ''}` : 'Tout est lu'}
          </Text>
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
                <View
                  key={n.id}
                  style={[styles.card, shadow.card, fresh.includes(n.id) && styles.cardNew]}
                  accessibilityLabel={fresh.includes(n.id) ? `Nouveau : ${n.title}` : undefined}>
                  <View style={[styles.icon, { backgroundColor: n.bg }]}>
                    <Ionicons name={n.icon} size={18} color={n.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{n.title}</Text>
                    <Text style={styles.body2}>{n.body}</Text>
                  </View>
                  <View style={styles.side}>
                    <Text style={styles.time}>{n.time}</Text>
                    {fresh.includes(n.id) && <View style={styles.newDot} />}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
        {list.length === 0 && (
          <EmptyState
            icon="notifications-outline"
            title="Rien dans cette catégorie"
            action={{ label: 'Tout voir', onPress: () => setFilter('Tout') }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h1, color: colors.navy },
  sub: { color: colors.muted2, marginTop: 2 },
  body: { padding: 20, gap: 16, paddingBottom: 32 },
  group: { ...typo.label, color: colors.muted2, letterSpacing: 0.5 },
  card: { backgroundColor: colors.card, borderRadius: radii.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  title: { ...typo.bodyStrong, color: colors.navy },
  body2: { ...typo.caption, color: colors.muted2, marginTop: 2 },
  time: { color: colors.muted2, fontSize: 11, marginTop: 2 },
  side: { alignSelf: 'stretch', alignItems: 'flex-end', gap: 8 },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  // New ones get a light accent border.
  cardNew: { borderWidth: 1, borderColor: colors.accentSoft, backgroundColor: colors.card },
});
