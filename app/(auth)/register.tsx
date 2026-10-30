import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { accountExists, createAccount, getLinkedEmail, sendOtp } from '@/features/register/auth';
import {
  StepIdentification,
  type IdentificationError,
  type IdentificationValues,
} from '@/features/register/StepIdentification';
import { StepOtp } from '@/features/register/StepOtp';
import { StepProfile, type ProfileValues } from '@/features/register/StepProfile';
import { CAMPUSES } from '@/features/register/validation';

type Step = 1 | 2 | 3;
const TOTAL_STEPS = 3;

const headings: Record<Step, { title: string; subtitle?: string }> = {
  1: { title: 'Identification', subtitle: 'Saisissez votre numéro étudiant et votre numéro de téléphone.' },
  2: { title: 'Vérification' },
  3: { title: 'Profil', subtitle: 'Dernière étape : complétez votre profil.' },
};

// Inscription in 3 steps. All values live here so they survive going back and forth.
export default function RegisterScreen() {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [identity, setIdentity] = useState<IdentificationValues>({ studentId: '', phone: '' });
  const [profile, setProfile] = useState<ProfileValues>({
    firstName: '',
    lastName: '',
    campus: null,
    village: null,
    password: '',
    confirm: '',
    accepted: false,
  });
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  // Student ID + phone pair that passed OTP verification; editing either requires a new code.
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [identError, setIdentError] = useState<IdentificationError>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const identityKey = `${identity.studentId}|${identity.phone}`;
  const verified = verifiedFor === identityKey;

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as Step);
    else router.back();
    return true;
  }, [step]);

  // Android hardware back follows the steps too.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => sub.remove();
  }, [goBack]);

  const submitIdentification = async () => {
    setSubmitting(true);
    setIdentError(null);
    try {
      if (verified) {
        setStep(2);
        return;
      }
      if (await accountExists(identity.studentId, identity.phone)) {
        setIdentError('exists');
        return;
      }
      const [email] = await Promise.all([getLinkedEmail(identity.studentId), sendOtp(identity.phone, 'sms')]);
      setLinkedEmail(email);
      setStep(2);
    } catch {
      setIdentError('network');
    } finally {
      setSubmitting(false);
    }
  };

  const submitProfile = async () => {
    if (!profile.campus || !profile.village) return;
    setSubmitting(true);
    setProfileError(null);
    try {
      const campus = CAMPUSES.find((c) => c.key === profile.campus)!.label;
      const user = await createAccount({
        studentId: identity.studentId,
        phone: identity.phone,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        campus,
        village: profile.village,
        password: profile.password,
      });
      register({
        studentId: user.studentId,
        phone: `+221 ${user.phone}`,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase(),
        campus: `UGB · ${campus} · ${user.village}`,
      });
    } catch {
      setProfileError('Impossible de créer le compte. Réessayez.');
      setSubmitting(false);
    }
  };

  const heading = headings[step];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.stepLabel}>
          Étape {step} sur {TOTAL_STEPS}
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <View
        style={styles.bars}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && { backgroundColor: colors.primary }]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{ gap: 4 }}>
            <Text style={styles.h1}>{heading.title}</Text>
            {heading.subtitle && <Text style={styles.subtitle}>{heading.subtitle}</Text>}
          </View>

          {step === 1 && (
            <StepIdentification
              values={identity}
              onChange={(patch) => {
                setIdentity((v) => ({ ...v, ...patch }));
                setIdentError(null);
              }}
              onSubmit={submitIdentification}
              submitting={submitting}
              submitError={identError}
            />
          )}
          {step === 2 && (
            <StepOtp
              phone={identity.phone}
              linkedEmail={linkedEmail}
              verified={verified}
              onEditPhone={() => setStep(1)}
              onVerified={() => {
                setVerifiedFor(identityKey);
                setStep(3);
              }}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepProfile
              values={profile}
              onChange={(patch) => setProfile((v) => ({ ...v, ...patch }))}
              onSubmit={submitProfile}
              submitting={submitting}
              submitError={profileError}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepLabel: { fontSize: 15, fontWeight: '700', color: colors.navy },
  bars: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 14 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#DDE3F2' },
  content: { padding: 24, paddingTop: 24, paddingBottom: 40, gap: 24 },
  h1: { fontSize: 30, fontWeight: '800', color: colors.navy },
  subtitle: { fontSize: 15, color: colors.muted2 },
});
