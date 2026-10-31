import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { PaymentMethod } from '@/constants/data';
import { radii } from '@/constants/theme';

/**
 * Official logo when the file is in the project (see `logo` in constants/data.ts),
 * otherwise a badge in the brand color with the initials.
 */
export function PaymentLogo({ method, size = 40 }: { method: Pick<PaymentMethod, 'name' | 'short' | 'bg' | 'logo'>; size?: number }) {
  const box = { width: size, height: size, borderRadius: radii.sm };
  if (method.logo) {
    return <Image source={method.logo} style={box} contentFit="contain" accessibilityLabel={method.name} />;
  }
  return (
    <View style={[box, styles.badge, { backgroundColor: method.bg }]} accessibilityLabel={method.name}>
      <Text style={[styles.text, { fontSize: size * 0.33 }]}>{method.short}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
