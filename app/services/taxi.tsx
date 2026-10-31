import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui';
import { colors } from '@/constants/theme';
import { SunuTaxiBoard } from '@/features/taxi/SunuTaxiBoard';

// Standalone page (deep links, notifications). Same content as Trajets › Sunu Taxi.
export default function SunuTaxiScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScreenHeader title="Sunu Taxi" subtitle="Partage un taxi entre étudiants" onBack={() => router.back()} />
      <SunuTaxiBoard />
    </SafeAreaView>
  );
}
