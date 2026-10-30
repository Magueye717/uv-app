import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, Field, LabeledField, PrimaryButton } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function ForgotScreen() {
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <BackButton onPress={() => router.back()} />
      </View>
      <View style={styles.body}>
        <Text style={styles.h1}>Mot de passe oublié</Text>
        <Text style={styles.sub}>Entre ton numéro, on t’envoie un code SMS pour réinitialiser.</Text>
        <LabeledField label="Numéro de téléphone">
          <Field
            icon="phone-portrait-outline"
            placeholder="+221 7X XXX XX XX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </LabeledField>
        <PrimaryButton
          label="Envoyer le code"
          onPress={() => {
            Alert.alert('Code envoyé', 'Vérifie tes SMS (démo).');
            router.back();
          }}
          style={{ marginTop: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FD' },
  body: { padding: 24, gap: 16 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.navy },
  sub: { color: colors.muted2, lineHeight: 22, marginTop: -4 },
});
