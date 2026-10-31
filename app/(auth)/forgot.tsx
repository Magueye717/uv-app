import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, LabeledField, PrimaryButton } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { colors, radii, typo } from '@/constants/theme';
import { formatPhone, PHONE_PREFIX, phoneDigits, validatePhone } from '@/features/register/validation';

// Same look as sign-up: navy header with the brand, form on a white sheet.
export default function ForgotScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const error = validatePhone(phone);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Retour">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View style={styles.brand}>
            <BrandLogo size={28} />
            <Text style={styles.brandText}>UGB Campus</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.heading}>
          <Text style={styles.h1}>Mot de passe oublié</Text>
          <Text style={styles.sub}>Entre ton numéro, on t’envoie un code SMS pour le réinitialiser.</Text>
        </View>
      </SafeAreaView>

      <View style={styles.sheet}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: 48 + insets.bottom }]}
            keyboardShouldPersistTaps="handled">
            <LabeledField label="Numéro de téléphone" error={touched ? error : null}>
              <Field
                accent={colors.orange}
                icon="phone-portrait-outline"
                prefix={PHONE_PREFIX}
                placeholder="77 790 28 80"
                keyboardType="number-pad"
                value={formatPhone(phone)}
                onChangeText={(t) => setPhone(phoneDigits(t))}
                onBlur={() => setTouched(true)}
                invalid={touched && !!error}
                maxLength={12}
              />
            </LabeledField>
            <PrimaryButton
              accent
              label="Envoyer le code"
              disabled={!!error}
              onPress={() => {
                Alert.alert('Code envoyé', `Vérifie tes SMS au ${PHONE_PREFIX} ${formatPhone(phone)} (démo).`);
                router.back();
              }}
            />
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ alignSelf: 'center' }}>
              <Text style={styles.link}>Je me souviens, me connecter</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandText: { ...typo.smallStrong, color: '#fff', letterSpacing: 0.4 },
  heading: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 26, gap: 6 },
  h1: { ...typo.display, color: '#fff', letterSpacing: -0.5 },
  sub: { ...typo.body, color: 'rgba(255,255,255,0.75)', lineHeight: 21 },
  sheet: { flex: 1, backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, overflow: 'hidden' },
  content: { padding: 24, paddingTop: 28, gap: 20 },
  link: { ...typo.bodyStrong, color: colors.orangeText },
});
