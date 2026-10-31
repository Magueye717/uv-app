import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typo } from '@/constants/theme';
import { TicketScanner } from '@/features/organizer/TicketScanner';
import { useTicketCheck } from '@/features/organizer/useTicketCheck';

/** Scans any ticket of the organizer's departures: the server reads which one from the QR, nothing to pick first. */
export default function Scanner() {
  const check = useTicketCheck();
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
