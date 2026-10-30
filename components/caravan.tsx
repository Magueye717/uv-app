import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { formatFcfa, type caravans } from '@/constants/data';
import { colors, radii } from '@/constants/theme';

type Caravan = (typeof caravans)[number];

/** Company badge + price, route line, and date / time / meeting point. */
export function CaravanSummary({ caravan: c }: { caravan: Caravan }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.rowBetween}>
        <View style={styles.company}>
          <Text style={styles.companyText}>{c.company}</Text>
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
          <Text style={styles.cityLabel}>Arrivée</Text>
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  company: { backgroundColor: '#E8F0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  companyText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
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
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaText: { fontSize: 12, color: colors.muted2 },
});
