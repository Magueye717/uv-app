import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Place } from '@/constants/data';
import { colors, radii } from '@/constants/theme';

/** react-native-maps has no web support: a plain placeholder keeps the web build working. */
export function PlacesMap({ places }: { places: Place[]; onOpen: (id: string) => void }) {
  return (
    <View style={styles.box}>
      <Ionicons name="map-outline" size={28} color={colors.primary} />
      <Text style={styles.text}>{places.length} lieux · carte disponible dans l’app mobile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 120, borderRadius: radii.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', gap: 6 },
  text: { fontSize: 13, fontWeight: '600', color: colors.muted2 },
});
