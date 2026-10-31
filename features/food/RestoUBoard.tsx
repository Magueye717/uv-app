import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { currentMeal } from '@/components/home';
import { StatusChip } from '@/components/ui';
import { mealTimes, publicMenus, type DishStatus } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useNow } from '@/lib/useNow';

const STATUS: Record<DishStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  available: { label: 'Disponible', tone: 'success' },
  low: { label: 'Bientôt épuisé', tone: 'warning' },
  critical: { label: 'Presque fini', tone: 'danger' },
};

/** University restaurants: lunch and dinner menus with stock levels, current meal first. */
export function RestoUBoard() {
  const meal = currentMeal(useNow());
  const order = meal.key === 'dinner' ? (['dinner', 'lunch'] as const) : (['lunch', 'dinner'] as const);

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={[styles.now, meal.live && styles.nowLive]}>
        <Ionicons name={meal.live ? 'restaurant' : 'time-outline'} size={18} color={meal.live ? colors.successText : colors.muted2} />
        <Text style={[styles.nowText, meal.live && { color: colors.successText }]}>
          {meal.label} · {meal.status}
        </Text>
      </View>

      {publicMenus.map((m) => (
        <View key={m.id} style={[styles.card, shadow.card]}>
          <View style={styles.head}>
            <View style={styles.icon}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.name}>{m.name.replace('Menu ', '')}</Text>
          </View>
          {order.map((key) => {
            const t = mealTimes[key];
            const dishes = key === 'lunch' ? m.dishes : m.dinner;
            const current = key === meal.key;
            return (
              <View key={key} style={[styles.meal, !current && { opacity: 0.7 }]}>
                <Text style={styles.mealTitle}>
                  {t.label} · {t.start}h-{t.end}h
                </Text>
                {dishes.map((d) => (
                  <View key={d.name} style={styles.dish}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dishName}>{d.name}</Text>
                      <Text style={styles.dishDetail}>{d.detail}</Text>
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
  nowText: { fontSize: 14, fontWeight: '700', color: colors.muted2 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 16, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '800', color: colors.navy },
  meal: { gap: 10 },
  mealTitle: { fontSize: 12, fontWeight: '700', color: colors.muted2, textTransform: 'uppercase', letterSpacing: 0.5 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dishName: { fontSize: 15, fontWeight: '700', color: colors.text },
  dishDetail: { fontSize: 12, color: colors.muted2, marginTop: 1 },
  note: { fontSize: 12, color: colors.muted2, textAlign: 'center' },
});
