import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow, typo } from '@/constants/theme';

/** Grants: next payment and a reminder. Detailed tracking comes with the backend. */
export function BoursesBoard() {
  const [remind, setRemind] = useState(false);
  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, shadow.card]}>
        <View style={styles.icon}>
          <Ionicons name="wallet-outline" size={22} color={colors.successText} />
        </View>
        <Text style={styles.label}>Prochain paiement</Text>
        <Text style={styles.date}>Mercredi 05 novembre</Text>
        <Text style={styles.detail}>Virement sur Wave et Orange Money</Text>
        <Pressable
          onPress={() => setRemind((r) => !r)}
          style={[styles.remind, remind && styles.remindOn]}
          accessibilityRole="switch"
          accessibilityState={{ checked: remind }}>
          <Ionicons name={remind ? 'checkmark-circle' : 'notifications-outline'} size={18} color={remind ? colors.successText : colors.primary} />
          <Text style={[styles.remindText, remind && { color: colors.successText }]}>
            {remind ? 'Tu seras prévenu le jour du paiement' : 'Me prévenir le jour du paiement'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.info}>
        <Ionicons name="time-outline" size={16} color={colors.muted2} />
        <Text style={styles.infoText}>Le suivi détaillé de ta bourse arrive bientôt dans l’app.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 20, gap: 4 },
  icon: { width: 44, height: 44, borderRadius: radii.sm, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { ...typo.captionStrong, color: colors.muted2, textTransform: 'uppercase', letterSpacing: 0.5 },
  date: { ...typo.h2, color: colors.navy },
  detail: { ...typo.body, color: colors.muted2 },
  remind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  remindOn: { backgroundColor: colors.successBg },
  remindText: { ...typo.bodyStrong, flex: 1, color: colors.primary },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  infoText: { ...typo.small, flex: 1, color: colors.muted2 },
});
