import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';

/**
 * Where the Wave / Orange Money page sends the student back (ugbcampus://paiement/retour?ref=…).
 * The screen that opened the payment is already waiting for the server's answer: just return to it.
 */
export default function PaymentReturn() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/(tabs)/caravanes', params: { vue: 'taxi' } });
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
