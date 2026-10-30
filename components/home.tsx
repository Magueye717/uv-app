import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';

import { adBanners, campusAlert, caravans, mealTimes, publicMenus, type DishStatus } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';

const BODY_PADDING = 20;
const AUTO_SCROLL_MS = 5000;

export function AlertStrip() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <View style={styles.alert}>
      <Ionicons name={campusAlert.icon} size={20} color={colors.warning} />
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>{campusAlert.title}</Text>
        <Text style={styles.alertSub}>{campusAlert.subtitle}</Text>
      </View>
      <Pressable onPress={() => setVisible(false)} hitSlop={10}>
        <Ionicons name="close" size={18} color={colors.muted} />
      </Pressable>
    </View>
  );
}

export function AdCarousel() {
  const { width } = useWindowDimensions();
  const slideWidth = width - BODY_PADDING * 2;
  const ref = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  // Restarts whenever the index changes, so a manual swipe resets the timer.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = (index + 1) % adBanners.length;
      ref.current?.scrollTo({ x: next * slideWidth, animated: true });
      setIndex(next);
    }, AUTO_SCROLL_MS);
    return () => clearTimeout(t);
  }, [index, slideWidth]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth));
  };

  return (
    <View style={{ gap: 10 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.bannerTrack}>
        {adBanners.map((ad) => (
          <Pressable
            key={ad.id}
            onPress={() => router.push(ad.href as never)}
            style={[styles.banner, { width: slideWidth, backgroundColor: ad.bg }]}>
            <View style={styles.decoLarge} />
            <View style={styles.decoSmall} />
            <View style={styles.tag}>
              <Text style={styles.tagText}>SPONSORISÉ</Text>
            </View>
            <View style={{ paddingRight: 96 }}>
              <Text style={styles.bannerTitle}>{ad.title}</Text>
              <Text style={styles.bannerSub}>{ad.subtitle}</Text>
            </View>
            <View style={styles.bannerBtn}>
              <Text style={[styles.bannerBtnText, { color: ad.bg }]}>{ad.cta}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {adBanners.map((ad, i) => (
          <View key={ad.id} style={[styles.dotItem, i === index && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function formatTimeLeft(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  if (mins === 0) return 'Départ imminent';
  if (days > 0) return `Dans ${days} j ${hours} h`;
  if (hours > 0) return `Dans ${hours} h ${minutes} min`;
  return `Dans ${minutes} min`;
}

export function CaravanCard() {
  const now = useNow();
  // Departures from campus that are still bookable, soonest first. Full buses are skipped.
  const upcoming = caravans
    .filter((c) => c.from === 'UGB' && c.seats > 0 && c.departureAt > now)
    .sort((a, b) => a.departureAt - b.departureAt);
  const next = upcoming[0];
  const othersThisWeek = upcoming.slice(1).filter((c) => c.departureAt - now < WEEK_MS).length;

  if (!next) {
    return (
      <Pressable style={[styles.infoCard, shadow.card]} onPress={() => router.push('/(tabs)/caravanes')}>
        <View style={styles.rowBetween}>
          <View style={styles.label}>
            <Ionicons name="bus" size={12} color={colors.orange} />
            <Text style={styles.labelText}>CARAVANES</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.muted} />
        </View>
        <Text style={styles.detail}>Aucun départ prévu pour le moment</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.infoCard, shadow.card]}>
      {/* What + when */}
      <View style={styles.rowBetween}>
        <View style={styles.label}>
          <Ionicons name="bus" size={12} color={colors.orange} />
          <Text style={styles.labelText}>PROCHAINE CARAVANE</Text>
        </View>
        <Text style={styles.timeLeft}>{formatTimeLeft(next.departureAt - now)}</Text>
      </View>

      {/* Where */}
      <View style={styles.route}>
        <Text style={styles.city}>{next.from}</Text>
        <View style={styles.link}>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </View>
        <Text style={styles.city}>{next.to}</Text>
      </View>

      {/* Details + action */}
      <View style={styles.rowBetween}>
        <View style={{ gap: 2 }}>
          <Text style={styles.detail}>
            {next.date} · {next.time}
          </Text>
          <Text style={styles.seats}>{next.seats} places disponibles</Text>
        </View>
        <Pressable style={styles.cta} onPress={() => router.push(`/caravane/${next.id}`)}>
          <Text style={styles.ctaText}>Réserver</Text>
        </Pressable>
      </View>

      {othersThisWeek > 0 && (
        <Pressable style={styles.more} onPress={() => router.push('/(tabs)/caravanes')}>
          <Text style={styles.moreText}>
            {othersThisWeek} autre{othersThisWeek > 1 ? 's' : ''} départ{othersThisWeek > 1 ? 's' : ''} cette semaine
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const dishDot: Record<DishStatus, string> = {
  available: colors.success,
  low: colors.warning,
  critical: colors.danger,
};

// Lunch until it ends, then dinner, then tomorrow's lunch.
function currentMeal(now: number) {
  const d = new Date(now);
  const h = d.getHours() + d.getMinutes() / 60;
  const { lunch, dinner } = mealTimes;
  if (h < lunch.end)
    return { key: 'lunch' as const, label: lunch.label, status: h < lunch.start ? `Dès ${lunch.start}h` : `Servi jusqu'à ${lunch.end}h`, live: h >= lunch.start };
  if (h < dinner.end)
    return { key: 'dinner' as const, label: dinner.label, status: h < dinner.start ? `Dès ${dinner.start}h` : `Servi jusqu'à ${dinner.end}h`, live: h >= dinner.start };
  return { key: 'lunch' as const, label: lunch.label, status: `Demain ${lunch.start}h`, live: false };
}

export function RestoCard() {
  const meal = currentMeal(useNow());

  return (
    <View style={[styles.infoCard, shadow.card]}>
      <View style={styles.rowBetween}>
        <View style={styles.label}>
          <Ionicons name="restaurant" size={12} color={colors.primary} />
          <Text style={styles.labelText}>RESTO U · {meal.label.toUpperCase()}</Text>
        </View>
        <Text style={[styles.mealStatus, { color: meal.live ? colors.success : colors.muted2 }]}>{meal.status}</Text>
      </View>

      {publicMenus.map((menu) => (
        <View key={menu.id} style={styles.restoRow}>
          <Text style={styles.restoName}>{menu.name.replace('Menu ', '')}</Text>
          <View style={styles.dishes}>
            {(meal.key === 'lunch' ? menu.dishes : menu.dinner).map((d) => (
              <View key={d.name} style={styles.dish}>
                <View style={[styles.dishDot, { backgroundColor: dishDot[d.status] }]} />
                <Text style={styles.dishName}>{d.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningBg,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  alertTitle: { fontWeight: '700', fontSize: 14, color: colors.navy },
  alertSub: { fontSize: 12, color: colors.muted2, marginTop: 2 },

  bannerTrack: { borderRadius: 22 },
  banner: {
    height: 140,
    borderRadius: 22,
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decoLarge: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  decoSmall: {
    position: 'absolute',
    right: 60,
    bottom: -40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  bannerTitle: { color: '#fff', fontSize: 19, fontWeight: '800', lineHeight: 23 },
  bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 },
  bannerBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  bannerBtnText: { fontWeight: '700', fontSize: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dotItem: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9D0E2' },
  dotOn: { width: 18, backgroundColor: colors.primary },

  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelText: { fontSize: 10, fontWeight: '700', color: colors.muted2, letterSpacing: 0.4 },
  timeLeft: { fontSize: 11, fontWeight: '700', color: colors.orange },
  route: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  city: { fontSize: 13, fontWeight: '800', color: colors.navy },
  link: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { fontSize: 11, color: colors.muted2 },
  seats: { fontSize: 11, fontWeight: '600', color: colors.success },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 2,
  },
  moreText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  mealStatus: { fontSize: 11, fontWeight: '700' },
  restoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  restoName: { width: 48, fontSize: 12, fontWeight: '800', color: colors.navy, paddingTop: 1 },
  dishes: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 4 },
  dish: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dishDot: { width: 6, height: 6, borderRadius: 3 },
  dishName: { fontSize: 12, color: colors.text },
  cta: {
    backgroundColor: colors.primary,
    height: 28,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
