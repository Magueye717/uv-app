import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Select } from '@/components/Select';
import { BackButton, LabeledField, PrimaryButton } from '@/components/ui';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCampus } from '@/context/CampusContext';
import { REGIONS, UFRS, ufrLabel } from '@/features/register/validation';
import { api, ApiError } from '@/lib/api';

/**
 * "Mon UFR et ma région": asked at sign-up, editable here (accounts created before, a change of UFR). Announcements
 * for one UFR or one region reach the student only once they're known.
 */
export default function MesEtudes() {
  const { user, reloadAccount } = useAuth();
  const { refresh } = useCampus();
  const [ufr, setUfr] = useState<string | null>(user?.ufrCode ?? null);
  const [region, setRegion] = useState<string | null>(user?.region ?? null);
  const [saving, setSaving] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profil'));

  const save = async () => {
    if (!ufr || !region) return;
    setSaving(true);
    try {
      await api('PUT', '/me/origin', { auth: true, body: { ufr, region } });
      await reloadAccount();
      // The home screen now shows this UFR's announcements.
      await refresh();
      back();
    } catch (err) {
      Alert.alert('Enregistrement impossible', err instanceof ApiError ? err.message : 'Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <BackButton onPress={back} />
        <Text style={styles.h1}>Mon UFR et ma région</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, shadow.card, styles.info]}>
          <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Les annonces de ton UFR (examens, élections des délégués…) et de ta région arrivent sur ton accueil une fois ces informations renseignées.</Text>
        </View>
        <LabeledField label="UFR">
          <Select
            icon="school-outline"
            title="Ton UFR"
            placeholder="Choisir ton UFR"
            value={ufr ? ufrLabel(ufr) : null}
            options={UFRS.map((u) => ufrLabel(u.code))}
            onChange={(label) => setUfr(UFRS.find((u) => ufrLabel(u.code) === label)?.code ?? null)}
          />
        </LabeledField>
        <LabeledField label="Région d’origine">
          <Select icon="map-outline" title="Ta région d’origine" placeholder="Choisir ta région" value={region} options={[...REGIONS]} onChange={setRegion} />
        </LabeledField>
        <PrimaryButton label="Enregistrer" disabled={!ufr || !region} loading={saving} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h3, color: colors.navy },
  body: { padding: 20, gap: 18 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14 },
  info: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoText: { ...typo.small, flex: 1, color: colors.text, lineHeight: 19 },
});
