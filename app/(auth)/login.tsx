import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/BrandLogo';
import { Field, OutlineButton, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors, radii, typo } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 28 }]}>
        {/* The logo carries the name: no separate title. */}
        <BrandLogo size={112} />
        <Text style={styles.tagline}>Ton campus dans ta poche</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetInner} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Se connecter</Text>
          <Text style={styles.subtitle}>Bon retour sur le campus !</Text>

          <Field
            icon="phone-portrait-outline"
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Mot de passe"
            secureTextEntry={hidden}
            value={password}
            onChangeText={setPassword}
            right={
              <Pressable
                onPress={() => setHidden((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}>
                <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
              </Pressable>
            }
          />

          <Pressable onPress={() => router.push('/(auth)/forgot')} style={styles.forgotWrap}>
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </Pressable>

          <PrimaryButton accent label="Se connecter" onPress={() => login(phone)} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>ou</Text>
            <View style={styles.line} />
          </View>

          <OutlineButton label="Créer un compte" onPress={() => router.push('/(auth)/register')} />

          <Text style={[styles.footer, { marginBottom: insets.bottom + 8 }]}>Une application au service des étudiants</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  hero: { alignItems: 'center', paddingBottom: 48, paddingHorizontal: 24 },
  tagline: { ...typo.body, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  sheet: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    marginTop: -16,
  },
  sheetInner: { padding: 24, gap: 14, paddingTop: 28 },
  title: { ...typo.display, color: colors.navy },
  subtitle: { ...typo.body, color: colors.muted2, marginTop: -6, marginBottom: 6 },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgot: { ...typo.bodyStrong, color: colors.orangeText },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { ...typo.small, color: colors.muted2 },
  footer: { ...typo.small, textAlign: 'center', color: colors.muted2, marginTop: 8 },
});
