import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui';
import { colors } from '@/constants/theme';
import { LostBoard } from '@/features/lost/LostBoard';

// Standalone page (deep links, notifications). Same content as Campus › Objets.
export default function ObjetsPerdusScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScreenHeader title="Objets perdus" subtitle="Retrouve ou déclare un objet" onBack={() => router.back()} />
      <LostBoard />
    </SafeAreaView>
  );
}
