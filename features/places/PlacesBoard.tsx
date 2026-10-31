import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PlacesMap } from '@/components/PlacesMap';
import { Field, FilterChips } from '@/components/ui';
import { EmptyState } from '@/components/states';
import { placeCategories, places } from '@/constants/data';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { openDirections } from '@/lib/maps';
import { matches } from '@/lib/search';

type Filter = (typeof placeCategories)[number];

/** Screen content without header or safe area: used by a tab and by its standalone page. */
export function PlacesBoard() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const [query, setQuery] = useState('');
  const q = query.trim();
  const list = places.filter(
    (p) => (filter === 'Tout' || p.category === filter) && matches(q, [p.name, p.area, p.category, p.description]),
  );
  const open = (id: string) => router.push(`/lieu/${id}`);

  return (
    <>
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
          <EmptyState
            icon="search-outline"
            title={`Aucun lieu pour « ${query.trim()} »${filter !== 'Tout' ? ` dans ${filter}` : ''}`}
            text="Vérifie l’orthographe ou cherche un autre mot."
            action={{
              label: 'Effacer la recherche',
              onPress: () => {
                setQuery('');
                setFilter('Tout');
              },
            }}
          />
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
                  <Text style={styles.countText} maxFontSizeMultiplier={1.2}>{p.photos.length}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <View style={[styles.cat, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon} size={11} color={p.text} />
                <Text style={[styles.catText, { color: p.text }]}>{p.category}</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {p.name}
              </Text>
              <View style={styles.meta}>
                <Ionicons name="location-outline" size={12} color={colors.muted2} />
                <Text style={styles.metaText} numberOfLines={2}>
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
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 12, paddingBottom: 32 },
  search: { paddingHorizontal: 20, marginTop: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  section: { ...typo.h3, color: colors.navy },
  link: { color: colors.primary, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 88, height: 88, borderRadius: radii.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  title: { ...typo.title, color: colors.navy },
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
  countText: { ...typo.label, color: '#fff' },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  catText: { ...typo.label },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typo.caption, flex: 1, color: colors.muted2 },
  nav: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
