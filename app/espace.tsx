import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typo } from '@/constants/theme';
import { useAuth, type Space } from '@/context/AuthContext';

/**
 * Switching space goes through this neutral screen: the guards flip while it's on screen, never under
 * a screen they protect (the router loops when the focused screen loses its guard mid-redirect).
 * It also makes the change visible: different tabs, different job.
 */
export default function SwitchSpace() {
  const { vers } = useLocalSearchParams<{ vers?: Space }>();
  const { space, spaces, setSpace, organizer } = useAuth();
  const target = vers && spaces.includes(vers) ? vers : space;

  useEffect(() => {
    if (target && target !== space) setSpace(target);
  }, [target, space, setSpace]);

  if (!target) return <Redirect href="/(auth)/welcome" />;
  if (target === space) return <Redirect href={target === 'organizer' ? '/activites' : '/(tabs)'} />;

  return (
    <View style={styles.root}>
      <Ionicons name={target === 'organizer' ? 'bus' : 'school'} size={40} color="#fff" />
      <Text style={styles.text}>{target === 'organizer' ? `Espace ${organizer?.name ?? 'organisateur'}` : 'Espace étudiant'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { ...typo.h3, color: '#fff' },
});
