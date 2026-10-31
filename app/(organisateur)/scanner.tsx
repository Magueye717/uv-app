import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { caravans } from '@/constants/data';
import { colors, typo } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { TicketScanner } from '@/features/organizer/TicketScanner';
import { useTicketCheck } from '@/features/organizer/useTicketCheck';

/** Scans any ticket of the organizer's departures: the QR says which one, nothing to pick first. */
export default function Scanner() {
  const { organizer } = useAuth();
  const mine = useMemo(() => caravans.filter((c) => c.organizer.id === organizer?.id), [organizer]);
  const check = useTicketCheck(mine);
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Embarquement</Text>
        <TicketScanner active={focused} check={check} onOpenList={(id) => router.push(`/depart/${id}`)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  body: { padding: 20, gap: 16, paddingBottom: 32 },
  h1: { ...typo.h1, color: '#fff' },
});
