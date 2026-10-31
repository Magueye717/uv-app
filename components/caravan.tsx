import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { caravanState, formatFcfa, type Caravan, type CaravanOrganizer, type OrganizerLevel } from '@/constants/data';
import { colors, radii } from '@/constants/theme';

const LEVELS: Record<OrganizerLevel, { label: string; icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string }> = {
  confirme: { label: 'Confirmé', icon: 'shield-checkmark', fg: colors.successText, bg: colors.successBg },
  verifie: { label: 'Vérifié', icon: 'shield-checkmark-outline', fg: colors.primary, bg: colors.primarySoft },
  nouveau: { label: 'Nouveau', icon: 'sparkles-outline', fg: colors.purpleText, bg: '#EEE8FF' },
};

/** Organizer name, verification level and rating. */
export function OrganizerLine({ organizer: o }: { organizer: CaravanOrganizer }) {
  const level = LEVELS[o.level];
  return (
    <View style={styles.organizer}>
      <Text style={styles.organizerName} numberOfLines={1}>
        {o.name}
      </Text>
      <View style={[styles.level, { backgroundColor: level.bg }]}>
        <Ionicons name={level.icon} size={11} color={level.fg} />
        <Text style={[styles.levelText, { color: level.fg }]}>{level.label}</Text>
      </View>
      {o.rating !== null && (
        <View style={styles.rating}>
          <Ionicons name="star" size={11} color={colors.warning} />
          <Text style={styles.ratingText}>{o.rating.toFixed(1)}</Text>
        </View>
      )}
    </View>
  );
}

/** Organizer + price, route line, and date / time / meeting point. */
export function CaravanSummary({ caravan: c }: { caravan: Caravan }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <OrganizerLine organizer={c.organizer} />
        </View>
        <Text style={styles.price}>{formatFcfa(c.price)}</Text>
      </View>

      <View style={styles.route}>
        <View>
          <Text style={styles.city}>{c.from}</Text>
          <Text style={styles.cityLabel}>Départ</Text>
        </View>
        <View style={styles.track}>
          <View style={styles.line} />
          <View style={styles.busDot}>
            <Ionicons name="bus" size={13} color={colors.primary} />
          </View>
          <View style={styles.line} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.city}>{c.to}</Text>
          <Text style={styles.cityLabel}>
            {c.stops.length > 1 ? `${c.stops.length} arrêts` : c.stops[0]}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Meta icon="calendar-outline" text={c.date} />
        <Meta icon="time-outline" text={c.time} />
        <Meta icon="location-outline" text={c.meetingPoint} />
      </View>
    </View>
  );
}

/** Booked seats with a mark at the confirmation threshold. */
export function FillBar({ caravan: c }: { caravan: Caravan }) {
  const { booked, confirmed, missing } = caravanState(c);
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            { width: `${(booked / c.totalSeats) * 100}%`, backgroundColor: confirmed ? colors.success : colors.primary },
          ]}
        />
        {!confirmed && <View style={[styles.threshold, { left: `${(c.minPassengers / c.totalSeats) * 100}%` }]} />}
      </View>
      <View style={styles.rowBetween}>
        {confirmed ? (
          <View style={styles.state}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.stateText, { color: colors.successText }]}>Départ confirmé</Text>
          </View>
        ) : (
          <View style={styles.state}>
            <Ionicons name="hourglass-outline" size={13} color={colors.warningText} />
            {/* Short on purpose: the refund promise is in the banner and on the booking screen. */}
            <Text style={[styles.stateText, { color: colors.warningText }]} numberOfLines={1}>
              Encore {missing} pour confirmer
            </Text>
          </View>
        )}
        <Text style={styles.count}>
          {booked}/{c.totalSeats} places
        </Text>
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.muted2} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  organizer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  organizerName: { flexShrink: 1, fontSize: 13, fontWeight: '800', color: colors.navy },
  level: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill },
  levelText: { fontSize: 10, fontWeight: '800' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '700', color: colors.muted2 },
  price: { fontSize: 17, fontWeight: '800', color: colors.primary },
  route: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  city: { fontSize: 17, fontWeight: '800', color: colors.navy },
  cityLabel: { fontSize: 11, color: colors.muted2, marginTop: 1 },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  line: { flex: 1, height: 1.5, backgroundColor: colors.border },
  busDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { fontSize: 12, color: colors.muted2 },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.bg },
  barFill: { height: '100%', borderRadius: 3 },
  // Tick where the trip becomes confirmed.
  threshold: { position: 'absolute', top: -3, width: 2, height: 12, marginLeft: -1, borderRadius: 1, backgroundColor: colors.navy },
  state: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  stateText: { fontSize: 12, fontWeight: '700' },
  // Never squeezed by the status text.
  count: { flexShrink: 0, fontSize: 12, fontWeight: '700', color: colors.muted2 },
});
