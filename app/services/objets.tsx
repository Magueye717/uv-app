import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Field, ScreenHeader, Segmented, StatusChip } from '@/components/ui';
import { lostCategory, type LostItem, type LostStatus } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { useLost } from '@/context/LostContext';
import { matches } from '@/lib/search';

type Tab = LostStatus | 'mine';
const TAB_LABELS: Record<Tab, string> = { found: 'Trouvés', lost: 'Perdus', mine: 'Mes objets' };

/** Where the item stands, in one word. */
function chip(o: LostItem): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } {
  if (o.returned) return { label: 'Rendu ✓', tone: 'neutral' };
  if (o.status === 'lost') return { label: 'Recherché', tone: 'danger' };
  return o.holder === 'office' ? { label: 'Au bureau', tone: 'warning' } : { label: 'Chez l’étudiant', tone: 'success' };
}

export default function ObjetsPerdusScreen() {
  const [tab, setTab] = useState<Tab>('found');
  const { items } = useLost();
  // Open cases first; returned items stay visible, at the end.
  const [query, setQuery] = useState('');
  // A card can be found by the name on it: type your first name to find your student card.
  const search = (o: LostItem) => matches(query, [o.name, o.details, o.where, o.spot, lostCategory(o.category).label, o.owner]);
  const inTab = (o: LostItem, t: Tab) => (t === 'mine' ? !!o.mine : o.status === t);
  const list = items
    .filter((o) => inTab(o, tab) && search(o))
    .sort((a, b) => Number(!!a.returned) - Number(!!b.returned));
  // Nothing here but results elsewhere: say where, rather than a dead end.
  const elsewhere = (['found', 'lost', 'mine'] as Tab[])
    .filter((t) => t !== tab)
    .map((t) => ({ t, n: items.filter((o) => inTab(o, t) && search(o)).length }))
    .filter((x) => x.n > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Objets perdus" subtitle="Retrouve ou déclare un objet" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Perdu ou trouvé quelque chose ?</Text>
          <Text style={styles.bannerSub}>Déclare-le en 30 secondes</Text>
          <View style={styles.bannerActions}>
            <Pressable style={styles.declare} onPress={() => router.push('/objet/declarer?mode=found')} accessibilityRole="button">
              <Ionicons name="hand-left-outline" size={16} color={colors.orange} />
              <Text style={styles.declareText}>J’ai trouvé</Text>
            </Pressable>
            <Pressable style={styles.declare} onPress={() => router.push('/objet/declarer?mode=lost')} accessibilityRole="button">
              <Ionicons name="search-outline" size={16} color={colors.orange} />
              <Text style={styles.declareText}>J’ai perdu</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={[styles.scan, shadow.card]} onPress={() => router.push('/objet/scanner')} accessibilityRole="button">
          <View style={styles.scanIcon}>
            <Ionicons name="scan" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanTitle}>Carte étudiant trouvée ?</Text>
            <Text style={styles.scanText}>Scanne-la : son propriétaire est prévenu tout de suite</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <Field
          icon="search"
          placeholder="Téléphone, sac bleu, BU, ton prénom…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Rechercher un objet"
          right={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Effacer la recherche">
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null
          }
        />

        <Segmented
          options={[
            { value: 'found', label: TAB_LABELS.found },
            { value: 'lost', label: TAB_LABELS.lost },
            { value: 'mine', label: TAB_LABELS.mine },
          ]}
          value={tab}
          onChange={setTab}
        />

        {query.trim() !== '' && list.length > 0 && (
          <Text style={styles.results}>
            {list.length} résultat{list.length > 1 ? 's' : ''}
          </Text>
        )}

        {list.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>
              {query.trim()
                ? `Aucun objet pour « ${query.trim()} » ici.`
                : tab === 'mine'
                  ? 'Tu n’as encore rien déclaré.'
                  : 'Rien pour le moment.'}
            </Text>
            {elsewhere.map(({ t, n }) => (
              <Pressable key={t} onPress={() => setTab(t)} hitSlop={6}>
                <Text style={styles.elsewhere}>
                  {n} résultat{n > 1 ? 's' : ''} dans « {TAB_LABELS[t]} » →
                </Text>
              </Pressable>
            ))}
            {query.trim() !== '' && tab === 'found' && (
              <Pressable onPress={() => router.push('/objet/declarer?mode=lost')} hitSlop={6}>
                <Text style={styles.elsewhere}>Déclarer une perte →</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.grid}>
          {list.map((o) => (
            <Pressable
              key={o.id}
              style={({ pressed }) => [styles.card, shadow.card, o.returned && { opacity: 0.55 }, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => router.push(`/objet/${o.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${o.name}, ${o.where}, ${o.when}`}>
              {/* Cards are never shown in photo: only an icon and a masked name. */}
              <View style={[styles.visual, { backgroundColor: o.bg }]}>
                {o.kind === 'object' && o.photo ? (
                  <Image source={o.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                ) : (
                  <Ionicons name={lostCategory(o.category).icon} size={30} color={o.tint} />
                )}
                {o.kind !== 'object' && (
                  <View style={styles.private}>
                    <Ionicons name="eye-off-outline" size={10} color={colors.muted2} />
                    <Text style={styles.privateText}>Pas de photo</Text>
                  </View>
                )}
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {o.name}
              </Text>
              {o.owner && (
                <Text style={styles.owner} numberOfLines={1}>
                  {o.ownerNotified ? `✓ ${o.owner} prévenu(e)` : `Au nom de ${o.owner}`}
                </Text>
              )}
              <View style={styles.where}>
                <Ionicons name="location-outline" size={12} color={colors.muted2} />
                <Text style={styles.whereText}>
                  {o.where} · {o.when}
                </Text>
              </View>
              <StatusChip {...chip(o)} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  banner: { backgroundColor: colors.orange, borderRadius: 20, padding: 16 },
  bannerActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },
  declare: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radii.pill,
  },
  declareText: { color: colors.orange, fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  card: { width: '48%', backgroundColor: colors.card, borderRadius: 18, padding: 10, gap: 6, alignItems: 'flex-start' },
  visual: { alignSelf: 'stretch', height: 92, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  private: { position: 'absolute', bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: colors.card },
  privateText: { fontSize: 10, fontWeight: '700', color: colors.muted2 },
  owner: { fontSize: 12, fontWeight: '700', color: colors.successText },
  scan: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 14 },
  scanIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  scanText: { fontSize: 12, color: colors.muted2, marginTop: 2 },
  name: { fontWeight: '800', color: colors.navy, fontSize: 14, marginTop: 2 },
  where: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  whereText: { fontSize: 12, color: colors.muted2 },
  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  empty: { color: colors.muted2, textAlign: 'center' },
  elsewhere: { color: colors.primary, fontWeight: '700' },
  results: { fontSize: 13, fontWeight: '700', color: colors.muted2 },
});
