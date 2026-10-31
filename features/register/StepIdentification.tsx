import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, LabeledField, PrimaryButton } from '@/components/ui';
import { colors, radii, typo } from '@/constants/theme';
import {
  formatPhone,
  normalizeStudentId,
  PHONE_PREFIX,
  phoneDigits,
  validatePhone,
  validateStudentId,
} from './validation';

export type IdentificationValues = { studentId: string; phone: string };
export type IdentificationError = 'exists' | 'network' | null;

type Props = {
  values: IdentificationValues;
  onChange: (patch: Partial<IdentificationValues>) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: IdentificationError;
};

export function StepIdentification({ values, onChange, onSubmit, submitting, submitError }: Props) {
  const [touched, setTouched] = useState({ studentId: false, phone: false });
  const errors = { studentId: validateStudentId(values.studentId), phone: validatePhone(values.phone) };
  const valid = !errors.studentId && !errors.phone;
  const touch = (k: keyof typeof touched) => setTouched((t) => ({ ...t, [k]: true }));

  return (
    <View style={{ gap: 20 }}>
      <LabeledField label="Numéro étudiant" error={touched.studentId ? errors.studentId : null}>
        <Field
          accent={colors.orange}
          icon="school-outline"
          placeholder="P232055"
          value={values.studentId}
          onChangeText={(t) => onChange({ studentId: normalizeStudentId(t) })}
          onBlur={() => touch('studentId')}
          invalid={touched.studentId && !!errors.studentId}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          returnKeyType="next"
        />
      </LabeledField>

      <LabeledField label="Numéro de téléphone" error={touched.phone ? errors.phone : null}>
        <Field
          accent={colors.orange}
          icon="phone-portrait-outline"
          prefix={PHONE_PREFIX}
          placeholder="77 790 28 80"
          value={formatPhone(values.phone)}
          onChangeText={(t) => onChange({ phone: phoneDigits(t) })}
          onBlur={() => touch('phone')}
          invalid={touched.phone && !!errors.phone}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={12}
        />
      </LabeledField>

      {submitError === 'exists' && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Ionicons name="person-outline" size={18} color={colors.danger} />
          <Text style={styles.bannerText}>Ce compte existe déjà.</Text>
          <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
            <Text style={styles.bannerLink}>Se connecter</Text>
          </Pressable>
        </View>
      )}
      {submitError === 'network' && (
        <View style={styles.banner} accessibilityLiveRegion="polite">
          <Text style={styles.bannerText}>Une erreur est survenue. Réessaie.</Text>
        </View>
      )}

      <PrimaryButton accent label="Continuer" onPress={onSubmit} disabled={!valid} loading={submitting} />

      <View style={styles.login}>
        <Text style={styles.muted}>Déjà un compte ?</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
          <Text style={styles.link}>Se connecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.dangerBg,
  },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.danger },
  bannerLink: { ...typo.smallStrong, color: colors.orangeText, textDecorationLine: 'underline' },
  login: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  muted: { ...typo.body, color: colors.muted2 },
  link: { ...typo.bodyStrong, color: colors.orangeText },
});
