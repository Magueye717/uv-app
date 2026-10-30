import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Select } from '@/components/Select';
import { Field, LabeledField, PrimaryButton, Segmented } from '@/components/ui';
import { colors } from '@/constants/theme';
import {
  CAMPUSES,
  passwordRules,
  validateConfirm,
  validateName,
  validatePassword,
  VILLAGES,
  type CampusKey,
} from './validation';

export type ProfileValues = {
  firstName: string;
  lastName: string;
  campus: CampusKey | null;
  village: string | null;
  password: string;
  confirm: string;
  accepted: boolean;
};

type Props = {
  values: ProfileValues;
  onChange: (patch: Partial<ProfileValues>) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
};

type FieldKey = 'firstName' | 'lastName' | 'campus' | 'village' | 'password' | 'confirm' | 'accepted';

const campusOptions = CAMPUSES.map((c) => ({ value: c.key, label: c.label }));

export function StepProfile({ values, onChange, onSubmit, submitting, submitError }: Props) {
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const touch = (k: FieldKey) => setTouched((t) => ({ ...t, [k]: true }));

  const errors: Record<FieldKey, string | null> = {
    firstName: validateName(values.firstName, 'prénom'),
    lastName: validateName(values.lastName, 'nom'),
    campus: values.campus ? null : 'Choisissez votre campus',
    village: values.village ? null : 'Choisissez votre village ou pavillon',
    password: validatePassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
    accepted: values.accepted ? null : 'Vous devez accepter les conditions pour continuer',
  };
  const valid = Object.values(errors).every((e) => !e);
  const shown = (k: FieldKey) => (touched[k] ? errors[k] : null);

  return (
    <View style={{ gap: 20 }}>
      <LabeledField label="Prénom" error={shown('firstName')}>
        <Field
          icon="person-outline"
          placeholder="Awa"
          value={values.firstName}
          onChangeText={(firstName) => onChange({ firstName })}
          onBlur={() => touch('firstName')}
          invalid={!!shown('firstName')}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
        />
      </LabeledField>

      <LabeledField label="Nom" error={shown('lastName')}>
        <Field
          icon="person-outline"
          placeholder="Diop"
          value={values.lastName}
          onChangeText={(lastName) => onChange({ lastName })}
          onBlur={() => touch('lastName')}
          invalid={!!shown('lastName')}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
        />
      </LabeledField>

      <LabeledField label="Campus" error={shown('campus')}>
        <Segmented
          options={campusOptions}
          value={values.campus}
          onChange={(campus) => {
            // Changing campus resets the village, since the list differs.
            if (campus !== values.campus) onChange({ campus, village: null });
            touch('campus');
          }}
        />
      </LabeledField>

      <LabeledField label="Village / Pavillon" error={values.campus ? shown('village') : null}>
        <Select
          icon="location-outline"
          title="Choisissez votre village"
          placeholder={values.campus ? 'Sélectionner un village' : 'Choisissez d’abord un campus'}
          value={values.village}
          options={values.campus ? VILLAGES[values.campus] : []}
          onChange={(village) => onChange({ village })}
          onClose={() => touch('village')}
          disabled={!values.campus}
          invalid={!!values.campus && !!shown('village')}
        />
      </LabeledField>

      <LabeledField label="Mot de passe">
        <Field
          icon="lock-closed-outline"
          placeholder="••••••••"
          secure
          value={values.password}
          onChangeText={(password) => onChange({ password })}
          onBlur={() => touch('password')}
          invalid={!!shown('password')}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <View style={styles.rules}>
          {passwordRules.map((r) => {
            const ok = r.test(values.password);
            return (
              <View key={r.label} style={styles.rule}>
                <View style={[styles.ruleDot, ok && styles.ruleDotOk]}>
                  {ok && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>
                <Text style={[styles.ruleText, ok && { color: colors.success }]}>{r.label}</Text>
              </View>
            );
          })}
        </View>
      </LabeledField>

      <LabeledField label="Confirmer le mot de passe" error={shown('confirm')}>
        <Field
          icon="lock-closed-outline"
          placeholder="••••••••"
          secure
          value={values.confirm}
          onChangeText={(confirm) => onChange({ confirm })}
          onBlur={() => touch('confirm')}
          invalid={!!shown('confirm')}
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </LabeledField>

      <View style={{ gap: 6 }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: values.accepted }}
          onPress={() => {
            onChange({ accepted: !values.accepted });
            touch('accepted');
          }}
          style={styles.checkRow}>
          <View
            style={[styles.checkbox, values.accepted && styles.checkboxOn, !!shown('accepted') && styles.checkboxInvalid]}>
            {values.accepted && <Ionicons name="checkmark" size={15} color="#fff" />}
          </View>
          <Text style={styles.checkText}>
            J’accepte les <Text style={styles.link}>Conditions d’utilisation</Text> et la{' '}
            <Text style={styles.link}>Politique de confidentialité</Text>
          </Text>
        </Pressable>
        {shown('accepted') && <Text style={styles.error}>{errors.accepted}</Text>}
      </View>

      {submitError && <Text style={[styles.error, { textAlign: 'center' }]}>{submitError}</Text>}

      <PrimaryButton label="Créer mon compte" onPress={onSubmit} disabled={!valid} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  rules: { gap: 6, marginTop: 4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleDotOk: { backgroundColor: colors.success, borderColor: colors.success },
  ruleText: { fontSize: 12, color: colors.muted2 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxInvalid: { borderColor: colors.danger },
  checkText: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.text },
  link: { fontWeight: '700', color: colors.primary },
  error: { fontSize: 12, color: colors.danger },
});
