import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/states';
import { StatusChip } from '@/components/ui';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useCampus } from '@/context/CampusContext';
import { currentMeal, hmLabel, MEAL_LABEL, type DishStatus } from '@/features/restos/api';
import { useNow } from '@/lib/useNow';

const STATUS: Record<DishStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  available: { label: 'Disponible', tone: 'success' },
  low: { label: 'Bientôt fini', tone: 'warning' },
  out: { label: 'Rupture', tone: 'neutral' },
};

/** University restaurants: today's lunch and dinner menus with stock levels, current meal first. */
export function RestoUBoard() {
  const { restos: data, refresh } = useCampus();
  const meal = currentMeal(useNow(), data?.restos ?? []);
  const order = meal.key === 'dinner' ? (['dinner', 'lunch'] as const) : (['lunch', 'dinner'] as const);
  const [refreshing, setRefreshing] = useState(false);
  const pull = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={pull} />}>
      <View style={[styles.now, meal.live && styles.nowLive]}>
        <Ionicons name={meal.live ? 'restaurant' : 'time-outline'} size={18} color={meal.live ? colors.successText : colors.muted2} />
        <Text style={[styles.nowText, meal.live && { color: colors.successText }]}>
          {meal.label} · {meal.status}
        </Text>
      </View>

      {!data && <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />}
      {data?.restos.length === 0 && <EmptyState icon="restaurant-outline" title="Aucun restaurant" text="Les menus des restaurants universitaires apparaîtront ici." />}

      {data?.restos.map((r) => (
        <View key={r.id} style={[styles.card, shadow.card]}>
          <View style={styles.head}>
            <View style={styles.icon}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{r.name}</Text>
              {!!r.location && <Text style={styles.dishDetail}>{r.location}</Text>}
            </View>
          </View>
          {order.map((key) => {
            const service = r.services[key];
            const dishes = r.menus[key]?.dishes ?? [];
            const current = key === meal.key;
            return (
              <View key={key} style={[styles.meal, !current && { opacity: 0.7 }]}>
                <Text style={styles.mealTitle}>
                  {MEAL_LABEL[key]} · {hmLabel(service.start)}-{hmLabel(service.end)}
                </Text>
                {dishes.length === 0 && <Text style={styles.dishDetail}>Menu pas encore publié.</Text>}
                {dishes.map((d) => (
                  <View key={d.id} style={styles.dish}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dishName, d.status === 'out' && styles.dishOut]}>{d.name}</Text>
                      {!!d.detail && <Text style={styles.dishDetail}>{d.detail}</Text>}
                    </View>
                    <StatusChip label={STATUS[d.status].label} tone={STATUS[d.status].tone} />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}
      <Text style={styles.note}>Au ticket, sur présentation de la carte étudiant.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  now: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radii.md, backgroundColor: colors.card },
  nowLive: { backgroundColor: colors.successBg },
  nowText: { ...typo.bodyStrong, color: colors.muted2 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 16, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { ...typo.h3, color: colors.navy },
  meal: { gap: 10 },
  mealTitle: { ...typo.captionStrong, color: colors.muted2, textTransform: 'uppercase', letterSpacing: 0.5 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dishName: { ...typo.title, color: colors.text },
  dishOut: { textDecorationLine: 'line-through', color: colors.muted },
  dishDetail: { ...typo.caption, color: colors.muted2, marginTop: 1 },
  note: { ...typo.caption, color: colors.muted2, textAlign: 'center' },
});
