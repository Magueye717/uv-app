import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/states';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useCampus } from '@/context/CampusContext';
import { currentMeal, hmLabel, MEAL_LABEL, staffApi, type DishDto, type DishStatus, type Meal, type PublicRestoDto } from '@/features/restos/api';
import { ApiError } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { useNow } from '@/lib/useNow';

/** The four stock levels, as the students see them. */
const LEVELS: { status: DishStatus; label: string; bg: string; fg: string }[] = [
  { status: 'available', label: 'Dispo', bg: colors.successBg, fg: colors.successText },
  { status: 'low', label: 'Bientôt fini', bg: colors.warningBg, fg: colors.warningText },
  { status: 'out', label: 'Rupture', bg: colors.navy, fg: '#fff' },
];

/**
 * Restaurant staff during the service: today's menus, one tap per dish to say how much is left. "Rupture" puts an
 * alert on the students' home screen, with a notification to everyone if the staff choose so; back in stock
 * removes the alert. Menus are planned on the back office.
 */
export default function MenusDuJour() {
  const { restos, refresh } = useCampus();
  const meal = currentMeal(useNow(), restos?.restos ?? []);
  const [refreshing, setRefreshing] = useState(false);
  const pull = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={pull} />}>
        <Text style={styles.h1}>Menus du jour</Text>
        <View style={[styles.now, meal.live && styles.nowLive]}>
          <Ionicons name={meal.live ? 'restaurant' : 'time-outline'} size={18} color={meal.live ? colors.successText : colors.muted2} />
          <Text style={[styles.nowText, meal.live && { color: colors.successText }]}>
            {meal.label} · {meal.status}
          </Text>
        </View>
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted2} />
          <Text style={styles.hintText}>Touche le niveau de stock d’un plat. « Rupture » s’affiche sur l’accueil des étudiants pendant le service, avec ou sans notification.</Text>
        </View>

        {!restos && <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />}
        {restos?.restos.length === 0 && <EmptyState icon="restaurant-outline" title="Aucun restaurant" text="Les restaurants sont créés depuis la plateforme d’administration." />}
        {restos?.restos.map((r) => (
          <View key={r.id} style={[styles.card, shadow.card]}>
            <Text style={styles.name}>{r.name}</Text>
            {(meal.key === 'dinner' ? (['dinner', 'lunch'] as const) : (['lunch', 'dinner'] as const)).map((m) => (
              <MealBlock key={m} resto={r} meal={m} date={restos.date} current={m === meal.key} onChanged={refresh} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MealBlock({ resto, meal, date, current, onChanged }: { resto: PublicRestoDto; meal: Meal; date: string; current: boolean; onChanged: () => Promise<void> }) {
  const menu = resto.menus[meal];
  const service = resto.services[meal];
  return (
    <View style={[styles.meal, !current && { opacity: 0.75 }]}>
      <Text style={styles.mealTitle}>
        {MEAL_LABEL[meal]} · {hmLabel(service.start)}-{hmLabel(service.end)}
      </Text>
      {!menu?.dishes.length && <Text style={styles.muted}>Menu pas encore publié (plateforme d’administration).</Text>}
      {menu?.dishes.map((d) => (
        <DishRow key={d.id} dish={d} onSet={(status, notify) => staffApi.setDishStatus(resto.id, date, meal, d.id, status, notify).then(onChanged)} resto={resto.name} />
      ))}
    </View>
  );
}

function DishRow({ dish, resto, onSet }: { dish: DishDto; resto: string; onSet: (status: DishStatus, notify: boolean) => Promise<void> }) {
  const [saving, setSaving] = useState<DishStatus | null>(null);
  const set = (status: DishStatus) => {
    if (status === dish.status || saving) return;
    const go = (notify = false) => {
      setSaving(status);
      onSet(status, notify)
        .then(() => haptics.success())
        .catch((err) => Alert.alert('Mise à jour impossible', err instanceof ApiError ? err.message : 'Réessaie dans un instant.'))
        .finally(() => setSaving(null));
    };
    if (status !== 'out') return go();
    // The alert always shows on the home screen; the notification is the staff's call (busy service, popular dish…).
    Alert.alert(`Rupture de ${dish.name} au ${resto} ?`, `Une alerte s’affiche sur l’accueil des étudiants jusqu’à la fin du service. Envoyer aussi une notification à tout le monde ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Sans notification', onPress: () => go(false) },
      { text: 'Notifier', onPress: () => go(true) },
    ]);
  };

  return (
    <View style={styles.dish}>
      <Text style={[styles.dishName, dish.status === 'out' && styles.dishOut]}>{dish.name}</Text>
      <View style={styles.levels}>
        {LEVELS.map((l) => {
          const on = dish.status === l.status;
          return (
            <Pressable
              key={l.status}
              onPress={() => set(l.status)}
              style={[styles.level, on && { backgroundColor: l.bg, borderColor: l.bg }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${dish.name} : ${l.label}`}>
              {saving === l.status ? (
                <ActivityIndicator size="small" color={on ? l.fg : colors.primary} />
              ) : (
                <Text style={[styles.levelText, on && { color: l.fg }]} numberOfLines={1}>
                  {l.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  h1: { ...typo.h1, color: colors.navy },
  now: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radii.md, backgroundColor: colors.card },
  nowLive: { backgroundColor: colors.successBg },
  nowText: { ...typo.bodyStrong, color: colors.muted2 },
  hint: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  hintText: { ...typo.caption, flex: 1, color: colors.muted2, lineHeight: 17 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 16, gap: 14 },
  name: { ...typo.h3, color: colors.navy },
  meal: { gap: 12 },
  mealTitle: { ...typo.captionStrong, color: colors.muted2, textTransform: 'uppercase', letterSpacing: 0.5 },
  muted: { ...typo.caption, color: colors.muted2 },
  dish: { gap: 8 },
  dishName: { ...typo.title, color: colors.text },
  dishOut: { textDecorationLine: 'line-through', color: colors.muted },
  levels: { flexDirection: 'row', gap: 6 },
  level: { flex: 1, minHeight: 40, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  levelText: { ...typo.smallStrong, fontSize: 12, color: colors.muted2 },
});
