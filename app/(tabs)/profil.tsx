import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const rows = [
  { icon: 'person-outline' as const, label: 'Informations personnelles' },
  { icon: 'card-outline' as const, label: 'Carte étudiant' },
  { icon: 'ticket-outline' as const, label: 'Mes tickets caravane' },
  { icon: 'notifications-outline' as const, label: 'Notifications' },
  { icon: 'help-circle-outline' as const, label: 'Aide & support' },
];

export default function ProfilScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.h1}>Profil</Text>
        <View style={[styles.hero, shadow.card]}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{user?.initials ?? 'AD'}</Text>
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.meta}>{user?.studentId}</Text>
          <Text style={styles.meta}>
            {user?.ufr} · {user?.filiere} · {user?.niveau}
          </Text>
        </View>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={r.icon} size={18} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        ))}
        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 10, paddingBottom: 40 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.navy, marginBottom: 8 },
  hero: { backgroundColor: colors.card, borderRadius: 22, padding: 24, alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  initials: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: colors.navy },
  meta: { color: colors.muted2, marginTop: 4 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontWeight: '600', color: colors.navy },
  logout: { marginTop: 12, alignItems: 'center', padding: 16 },
  logoutText: { color: colors.danger, fontWeight: '700' },
});
