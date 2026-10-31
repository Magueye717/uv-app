import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlacesMap } from '@/components/PlacesMap';
import { Field, FilterChips, ScreenHeader } from '@/components/ui';
import { placeCategories, places } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';
import { openDirections } from '@/lib/maps';
import { matches } from '@/lib/search';

type Filter = (typeof placeCategories)[number];

export default function LieuxScreen() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const [query, setQuery] = useState('');
  const q = query.trim();
  const list = places.filter(
    (p) => (filter === 'Tout' || p.category === filter) && matches(q, [p.name, p.area, p.category, p.description]),
  );
  const open = (id: string) => router.push(`/lieu/${id}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Lieux du campus" subtitle="Les endroits à connaître" />
      <View style={styles.search}>
        <Field
          icon="search"
          placeholder="Bibliothèque, barbier, Village E…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Rechercher un lieu"
          right={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Effacer la recherche">
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null
          }
        />
      </View>
      <View style={{ marginTop: 12 }}>
        <FilterChips options={placeCategories} value={filter} onChange={setFilter} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <PlacesMap places={list} onOpen={open} />

        <View style={styles.sectionRow}>
          <Text style={styles.section}>
            {q ? `${list.length} résultat${list.length > 1 ? 's' : ''}` : 'Lieux incontournables'}
          </Text>
          {(q || filter !== 'Tout') && (
            <Pressable
              onPress={() => {
                setFilter('Tout');
                setQuery('');
              }}>
              <Text style={styles.link}>Tout voir</Text>
            </Pressable>
          )}
        </View>

        {list.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={26} color={colors.muted} />
            <Text style={styles.emptyText}>Aucun lieu pour « {query.trim()} »{filter !== 'Tout' ? ` dans ${filter}` : ''}.</Text>
          </View>
        )}

        {list.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [styles.card, shadow.card, pressed && { transform: [{ scale: 0.99 }] }]}
            onPress={() => open(p.id)}
            accessibilityRole="button"
            accessibilityLabel={`${p.name}, ${p.category}, ${p.area}`}>
            <View style={[styles.photo, { backgroundColor: p.bg }]}>
              {p.photos.length ? (
                <Image source={p.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              ) : (
                <Ionicons name={p.icon} size={26} color={p.tint} />
              )}
              {p.photos.length > 1 && (
                <View style={styles.count}>
                  <Ionicons name="images" size={10} color="#fff" />
                  <Text style={styles.countText}>{p.photos.length}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <View style={[styles.cat, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon} size={11} color={p.text} />
                <Text style={[styles.catText, { color: p.text }]}>{p.category}</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {p.name}
              </Text>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={12} color={colors.muted2} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {p.area}
                </Text>
              </View>
              {p.hours && (
                <View style={styles.meta}>
                  <Ionicons name="time-outline" size={12} color={colors.muted2} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {p.hours}
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              style={styles.nav}
              hitSlop={6}
              onPress={() => openDirections(p.coords, p.name)}
              accessibilityRole="link"
              accessibilityLabel={`Itinéraire vers ${p.name}`}>
              <Ionicons name="navigate" size={18} color={colors.primary} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  search: { paddingHorizontal: 20, marginTop: 14 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  emptyText: { color: colors.muted2, textAlign: 'center' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  section: { fontSize: 18, fontWeight: '800', color: colors.navy },
  link: { color: colors.primary, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 88, height: 88, borderRadius: radii.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', color: colors.navy, fontSize: 15 },
  // Number of photos, on the cover's corner.
  count: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(15,27,76,0.65)',
  },
  countText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  catText: { fontSize: 11, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { flex: 1, fontSize: 12, color: colors.muted2 },
  nav: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
