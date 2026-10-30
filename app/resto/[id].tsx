import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatFcfa, menuOfDay, privateCampuses } from '@/constants/data';
import { colors, radii, shadow } from '@/constants/theme';

export default function RestoMenu() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const campus = privateCampuses.find((c) => c.restaurants.some((r) => r.id === id)) ?? privateCampuses[0];
  const resto = campus.restaurants.find((r) => r.id === id) ?? campus.restaurants[0];
  const [cart, setCart] = useState<Record<string, number>>({});

  const setQty = (dishId: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[dishId];
      else next[dishId] = qty;
      return next;
    });

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = menuOfDay.reduce((sum, d) => sum + (cart[d.id] ?? 0) * d.price, 0);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{resto.name}</Text>
            <View style={styles.campusChip}>
              <Text style={styles.campusText}>{campus.name}</Text>
            </View>
          </View>
        </View>
        <Info icon="location-outline" text={resto.location} />
        <Info icon="call-outline" text={resto.phone} />
        <Info icon="time-outline" text={resto.hours} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: count ? 110 : 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Menu du jour</Text>
          <Text style={styles.muted}>{menuOfDay.length} plats</Text>
        </View>
        {menuOfDay.map((d) => {
          const qty = cart[d.id] ?? 0;
          return (
            <View key={d.id} style={[styles.dish, shadow.card]}>
              <View style={[styles.dishIcon, { backgroundColor: d.bg }]}>
                <Ionicons name="fast-food" size={28} color={d.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dishName}>{d.name}</Text>
                <Text style={styles.muted}>{d.detail}</Text>
                <View style={styles.dishBottom}>
                  <Text style={styles.price}>{formatFcfa(d.price)}</Text>
                  {qty ? (
                    <View style={styles.stepper}>
                      <Pressable onPress={() => setQty(d.id, qty - 1)} style={styles.stepMinus} hitSlop={6}>
                        <Ionicons name="remove" size={16} color={colors.navy} />
                      </Pressable>
                      <Text style={styles.qty}>{qty}</Text>
                      <Pressable onPress={() => setQty(d.id, qty + 1)} style={styles.stepPlus} hitSlop={6}>
                        <Ionicons name="add" size={16} color="#fff" />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => setQty(d.id, 1)} style={styles.add}>
                      <Ionicons name="add" size={14} color={colors.primary} />
                      <Text style={styles.addText}>Ajouter</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {count > 0 && (
        <View style={[styles.cartWrap, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            style={styles.cart}
            onPress={() => Alert.alert('Panier', `${count} article${count > 1 ? 's' : ''} · ${formatFcfa(total)}`)}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.cartText}>
              Voir le panier · {count} article{count > 1 ? 's' : ''} · {formatFcfa(total)}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Info({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.85)" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 6,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  campusChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  campusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  body: { padding: 20, gap: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontSize: 18, fontWeight: '800', color: colors.navy },
  muted: { color: colors.muted2, fontSize: 12, marginTop: 1 },
  dish: { backgroundColor: '#fff', borderRadius: 18, padding: 12, flexDirection: 'row', gap: 12 },
  dishIcon: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dishName: { fontWeight: '800', color: colors.navy, fontSize: 15 },
  dishBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontWeight: '800', color: colors.primary, fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepMinus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontWeight: '800', color: colors.navy, minWidth: 12, textAlign: 'center' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: radii.pill,
  },
  addText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  cartWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12 },
  cart: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  cartText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
