import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Linking,
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

import {
  adBanners,
  campusAlert,
  caravans,
  formatFcfa,
  mealTimes,
  publicMenus,
  schedule,
  taxiSeatPrice,
  weekDays,
  type DishStatus,
} from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useTaxi } from '@/context/TaxiContext';

const BODY_PADDING = 20;
const AUTO_SCROLL_MS = 5000;

export function AlertStrip() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <Pressable style={styles.alert} onPress={() => router.push(campusAlert.href as never)}>
      <Ionicons name={campusAlert.icon} size={20} color={colors.warning} />
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>{campusAlert.title}</Text>
        <Text style={styles.alertSub}>{campusAlert.subtitle}</Text>
      </View>
      <Pressable onPress={() => setVisible(false)} hitSlop={10} accessibilityLabel="Masquer l’alerte">
        <Ionicons name="close" size={18} color={colors.muted} />
      </Pressable>
    </Pressable>
  );
}

function openAd(ad: (typeof adBanners)[number]) {
  if (ad.href) router.push(ad.href as never);
  else if (ad.url) Linking.openURL(ad.url);
}

export function AdCarousel() {
  const { width } = useWindowDimensions();
  const slideWidth = width - BODY_PADDING * 2;
  const ref = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);
  const multiple = adBanners.length > 1;

  // Restarts whenever the index changes, so a manual swipe resets the timer.
  // Only runs when there is more than one ad to rotate.
  useEffect(() => {
    if (!multiple) return;
    const t = setTimeout(() => {
      const next = (index + 1) % adBanners.length;
      ref.current?.scrollTo({ x: next * slideWidth, animated: true });
      setIndex(next);
    }, AUTO_SCROLL_MS);
    return () => clearTimeout(t);
  }, [index, slideWidth, multiple]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth));
  };

  // No sponsor right now: leave no gap on the home screen.
  if (adBanners.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        scrollEnabled={multiple}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.bannerTrack}>
        {adBanners.map((ad) => (
          <Pressable
            key={ad.id}
            disabled={!ad.href && !ad.url}
            onPress={() => openAd(ad)}
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
            {(ad.href || ad.url) && (
              <View style={styles.bannerBtn}>
                <Text style={[styles.bannerBtnText, { color: ad.bg }]}>{ad.cta}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
      {multiple && (
        <View style={styles.dots}>
          {adBanners.map((ad, i) => (
            <View key={ad.id} style={[styles.dotItem, i === index && styles.dotOn]} />
          ))}
        </View>
      )}
    </View>
  );
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const URGENT_MS = 2 * 60 * 60 * 1000;

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
      <Pressable style={[styles.infoCard, shadow.card]} onPress={() => router.push({ pathname: '/(tabs)/caravanes', params: { vue: 'caravanes' } })}>
        <View style={styles.rowBetween}>
          <View style={styles.label}>
            <Ionicons name="bus" size={12} color={colors.primary} />
            <Text style={styles.labelText}>CARAVANES</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.muted} />
        </View>
        <Text style={styles.detail}>Aucun départ prévu pour le moment</Text>
      </Pressable>
    );
  }

  const urgent = next.departureAt - now < URGENT_MS;

  return (
    <View style={[styles.infoCard, shadow.card]}>
      {/* What + when */}
      <View style={styles.rowBetween}>
        <View style={styles.label}>
          <Ionicons name="bus" size={12} color={colors.primary} />
          <Text style={styles.labelText}>PROCHAINE CARAVANE</Text>
        </View>
        <Text style={[styles.timeLeft, urgent && { color: colors.orangeText }]}>
          {formatTimeLeft(next.departureAt - now)}
        </Text>
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
        <Pressable style={styles.more} onPress={() => router.push({ pathname: '/(tabs)/caravanes', params: { vue: 'caravanes' } })}>
          <Text style={styles.moreText}>
            {othersThisWeek} autre{othersThisWeek > 1 ? 's' : ''} départ{othersThisWeek > 1 ? 's' : ''} cette semaine
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const dayName = (short: string) => short.charAt(0) + short.slice(1).toLowerCase() + '.';

// First course that hasn't ended today, otherwise the first course of the next school day.
function findNextCourse(now: number) {
  const d = new Date(now);
  const today = d.getDay() - 1; // weekDays starts on Monday; Sunday gives -1
  const mins = d.getHours() * 60 + d.getMinutes();
  for (let offset = 0; offset < 7; offset++) {
    const i = today + offset;
    if (i < 0 || i >= weekDays.length) continue;
    const list = schedule[weekDays[i].id] ?? [];
    const course = offset === 0 ? list.find((c) => toMinutes(c.end) > mins) : list[0];
    if (!course) continue;
    if (offset === 0) {
      const startsIn = toMinutes(course.start) - mins;
      if (startsIn <= 0) return { course, status: `En cours · fin ${course.end}`, tone: colors.successText };
      const h = Math.floor(startsIn / 60);
      return { course, status: h ? `Dans ${h} h ${startsIn % 60} min` : `Dans ${startsIn} min`, tone: colors.orangeText };
    }
    const when = offset === 1 ? 'Demain' : dayName(weekDays[i].short);
    return { course, status: `${when} ${course.start}`, tone: colors.muted2 };
  }
  return null;
}

/** Sunu Taxi on the home screen: the next open shared ride, one tap to join. */
export function TaxiCard() {
  const now = useNow();
  const { trips, me } = useTaxi();
  const open = trips
    .filter((t) => !t.departed && t.departureAt > now && !t.passengers.includes(me) && t.passengers.length < t.seats)
    .sort((a, b) => a.departureAt - b.departureAt);
  const next = open[0];
  const go = () => router.push({ pathname: '/(tabs)/caravanes', params: { vue: 'taxi' } });

  return (
    <View style={[styles.infoCard, shadow.card]}>
      <View style={styles.rowBetween}>
        <View style={styles.label}>
          <Ionicons name="car" size={12} color={colors.primary} />
          <Text style={styles.labelText}>SUNU TAXI</Text>
        </View>
        {next && <Text style={styles.timeLeft}>{formatTimeLeft(next.departureAt - now)}</Text>}
      </View>

      {next ? (
        <>
          <View style={styles.route}>
            <Text style={styles.city} numberOfLines={1}>
              {next.from.split(' · ').pop()}
            </Text>
            <View style={styles.link}>
              <Ionicons name="arrow-forward" size={12} color={colors.primary} />
            </View>
            <Text style={[styles.city, { flexShrink: 1 }]} numberOfLines={1}>
              {next.to.split(' · ').pop()}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Text style={styles.detail}>{formatFcfa(taxiSeatPrice(next))} / place</Text>
              <Text style={styles.seats}>
                {next.seats - next.passengers.length} place{next.seats - next.passengers.length > 1 ? 's' : ''} libre
                {next.seats - next.passengers.length > 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable style={styles.cta} onPress={go} accessibilityRole="button">
              <Text style={styles.ctaText}>Rejoindre</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.rowBetween}>
          <Text style={[styles.detail, { flexShrink: 1 }]}>Aucun trajet ouvert. Partage le prix d’un taxi avec d’autres étudiants.</Text>
          <Pressable style={styles.cta} onPress={go} accessibilityRole="button">
            <Text style={styles.ctaText}>Proposer</Text>
          </Pressable>
        </View>
      )}

      {open.length > 1 && (
        <Pressable style={styles.more} onPress={go}>
          <Text style={styles.moreText}>
            {open.length - 1} autre{open.length > 2 ? 's' : ''} trajet{open.length > 2 ? 's' : ''} ouvert{open.length > 2 ? 's' : ''}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

export function CourseCard() {
  const next = findNextCourse(useNow());

  return (
    <Pressable style={[styles.infoCard, shadow.card]} onPress={() => router.push('/services/cours')}>
      <View style={styles.rowBetween}>
        <View style={styles.label}>
          <Ionicons name="calendar" size={12} color={colors.purple} />
          <Text style={styles.labelText}>PROCHAIN COURS</Text>
        </View>
        {next && <Text style={[styles.mealStatus, { color: next.tone }]}>{next.status}</Text>}
      </View>

      {next ? (
        <>
          <View style={styles.courseTitleRow}>
            <Text style={styles.courseTitle} numberOfLines={1}>
              {next.course.title}
            </Text>
            <View style={[styles.kind, next.course.movedFrom && styles.kindMoved]}>
              <Text style={[styles.kindText, next.course.movedFrom && { color: colors.warningText }]}>
                {next.course.movedFrom ? 'Déplacé' : next.course.kind}
              </Text>
            </View>
          </View>
          <Text style={styles.detail}>
            {next.course.start} – {next.course.end} · {next.course.room} · {next.course.teacher}
          </Text>
        </>
      ) : (
        <Text style={styles.detail}>Aucun cours prévu cette semaine</Text>
      )}
    </Pressable>
  );
}

const dishDot: Record<DishStatus, string> = {
  available: colors.success,
  low: colors.warning,
  critical: colors.danger,
};

// Lunch until it ends, then dinner, then tomorrow's lunch.
export function currentMeal(now: number) {
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
        <Text style={[styles.mealStatus, { color: meal.live ? colors.successText : colors.muted2 }]}>{meal.status}</Text>
      </View>

      {publicMenus.map((menu) => (
        <View key={menu.id} style={styles.restoRow}>
          <Text style={styles.restoName}>{menu.name.replace('Menu ', '')}</Text>
          {/* One line per restaurant: the text shrinks a little rather than wrapping. */}
          <Text style={styles.dishLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {(meal.key === 'lunch' ? menu.dishes : menu.dinner).map((d, i) => (
              <Text key={d.name}>
                {i > 0 ? '   ' : ''}
                <Text style={[styles.dishDot, { color: dishDot[d.status] }]}>●</Text> {d.name}
              </Text>
            ))}
          </Text>
        </View>
      ))}

      <Pressable style={styles.more} onPress={() => router.push({ pathname: '/(tabs)/resto', params: { vue: 'restos' } })}>
        <Text style={styles.moreText}>Voir les restos privés</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>
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

  bannerTrack: { borderRadius: radii.lg },
  banner: {
    height: 140,
    borderRadius: radii.lg,
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

  infoCard: { backgroundColor: colors.card, borderRadius: radii.md, padding: 12, gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelText: { fontSize: 10, fontWeight: '700', color: colors.muted2, letterSpacing: 0.4 },
  timeLeft: { fontSize: 11, fontWeight: '700', color: colors.primary },
  route: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  city: { fontSize: 15, fontWeight: '700', color: colors.navy },
  link: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { fontSize: 12, color: colors.muted2 },
  seats: { fontSize: 12, fontWeight: '600', color: colors.successText },
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
  courseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseTitle: { flexShrink: 1, fontSize: 13, fontWeight: '700', color: colors.navy },
  kind: { backgroundColor: '#EEE8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill },
  kindMoved: { backgroundColor: colors.warningBg },
  kindText: { fontSize: 10, fontWeight: '700', color: colors.purpleText },
  restoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restoName: { width: 54, fontSize: 12, fontWeight: '700', color: colors.navy },
  dishLine: { flex: 1, fontSize: 12, color: colors.text },
  dishDot: { fontSize: 9 },
  cta: {
    backgroundColor: colors.accent,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
