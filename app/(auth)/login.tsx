import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, OutlineButton, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/theme';

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
        <View style={styles.logoWrap}>
          <Ionicons name="school" size={36} color={colors.primary} />
        </View>
        <Text style={styles.brand}>UV-APP</Text>
        <Text style={styles.tagline}>Le campus dans votre poche</Text>
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
              <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
                <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
              </Pressable>
            }
          />

          <Pressable onPress={() => router.push('/(auth)/forgot')} style={styles.forgotWrap}>
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </Pressable>

          <PrimaryButton label="Se connecter" onPress={login} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>ou</Text>
            <View style={styles.line} />
          </View>

          <OutlineButton label="Créer un compte" onPress={() => router.push('/(auth)/register')} />

          <Text style={styles.footer}>Une application au service des étudiants</Text>
          <SafeAreaView edges={['bottom']} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  hero: { alignItems: 'center', paddingBottom: 48, paddingHorizontal: 24 },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 0.4 },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 15 },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  sheetInner: { padding: 24, gap: 14, paddingTop: 28 },
  title: { fontSize: 30, fontWeight: '800', color: colors.navy },
  subtitle: { fontSize: 15, color: colors.muted2, marginTop: -6, marginBottom: 6 },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgot: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.muted, fontSize: 13 },
  footer: { textAlign: 'center', color: colors.muted, marginTop: 8, fontSize: 13 },
});
