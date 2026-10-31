import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findPrivateResto, formatFcfa, restoStatus, type RestoMenu } from '@/constants/data';
import { useCart } from '@/context/CartContext';
import { colors, radii, shadow } from '@/constants/theme';
import { useNow } from '@/lib/useNow';

const PADDING = 20;
const GRID_GAP = 12;

type Section = 'menus' | 'drinks';

export default function RestoMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { campus, resto } = findPrivateResto(id);
  const status = restoStatus(resto.services, useNow());
  const location = resto.location.startsWith(campus.name) ? resto.location : `${campus.name} · ${resto.location}`;

  const basket = useCart();
  // Quantities shown here only count when the basket is for this restaurant.
  const cart = basket.restoId === resto.id ? basket.items : {};
  const setQty = (itemId: string, qty: number) => basket.setQty(resto.id, itemId, qty);

  const items = [...resto.menus, ...resto.drinks];
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = items.reduce((sum, d) => sum + (cart[d.id] ?? 0) * d.price, 0);

  // Tabs jump to their section in the single scroll.
  const scroll = useRef<ScrollViewInstance>(null);
  // Section positions inside the body, plus the body's own offset in the scroll.
  const bodyY = useRef(0);
  const sectionY = useRef<Record<Section, number>>({ menus: 0, drinks: 0 });
  const [tab, setTab] = useState<Section>('menus');
  const goTo = (s: Section) => {
    setTab(s);
    scroll.current?.scrollTo({ y: bodyY.current + sectionY.current[s] - 12, animated: true });
  };

  const drinkWidth = (width - PADDING * 2 - GRID_GAP) / 2;

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={{ paddingBottom: count ? 110 : 32 }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: resto.bg }]}>
          {resto.photo ? (
            <Image source={resto.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <Ionicons name={resto.icon} size={56} color={resto.tint} />
          )}
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <RoundButton icon="arrow-back" label="Retour" onPress={() => router.back()} />
            <RoundButton
              icon="call"
              label={`Appeler ${resto.name}`}
              onPress={() => Linking.openURL(`tel:${resto.phone.replace(/\s/g, '')}`)}
            />
          </View>
        </View>

        <View style={[styles.infoCard, shadow.raised]}>
          <Text style={styles.name}>{resto.name}</Text>
          <Text style={styles.sub}>
            {resto.kind} · {location}
          </Text>
          {/* Status as the one pill; hours and delivery as a quiet info line. */}
          <View style={[styles.tag, styles.statusTag, { backgroundColor: status.open ? colors.successBg : colors.bg }]}>
            <View style={[styles.dot, { backgroundColor: status.open ? colors.success : colors.muted }]} />
            <Text style={[styles.tagText, { color: status.open ? colors.successText : colors.muted2 }]}>{status.label}</Text>
          </View>
          <View style={styles.metaLine}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.muted2} />
              <Text style={styles.metaText}>{resto.hours}</Text>
            </View>
            {resto.deliveryFee !== null && (
              <View style={styles.metaItem}>
                <Ionicons name="bicycle-outline" size={15} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary, fontWeight: '600' }]}>
                  {resto.deliveryFee ? `Livraison ${formatFcfa(resto.deliveryFee)}` : 'Livraison gratuite'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body} onLayout={(e) => (bodyY.current = e.nativeEvent.layout.y)}>
          {!status.open && (
            <View style={styles.closed}>
              <Ionicons name="moon-outline" size={16} color={colors.warningText} />
              <Text style={styles.closedText}>{status.label}. Tu peux consulter le menu, la commande ouvre avec le service.</Text>
            </View>
          )}

          <View style={styles.tabs}>
            <Tab label={`Plats · ${resto.menus.length}`} on={tab === 'menus'} onPress={() => goTo('menus')} />
            <Tab label={`Boissons · ${resto.drinks.length}`} on={tab === 'drinks'} onPress={() => goTo('drinks')} />
          </View>

          <View style={styles.section} onLayout={(e) => (sectionY.current.menus = e.nativeEvent.layout.y)}>
            <Text style={styles.sectionTitle}>Menus du jour</Text>
            {resto.menus.map((m) => (
              <View key={m.id} style={[styles.dish, shadow.card]}>
                <Photo item={m} icon={resto.icon} tint={resto.tint} bg={resto.bg} style={styles.dishPhoto} />
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text style={styles.muted} numberOfLines={2}>
                    {m.detail}
                  </Text>
                  <View style={styles.dishBottom}>
                    <Text style={styles.price}>{formatFcfa(m.price)}</Text>
                    <QtyControl qty={cart[m.id] ?? 0} disabled={!status.open} name={m.name} onChange={(q) => setQty(m.id, q)} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section} onLayout={(e) => (sectionY.current.drinks = e.nativeEvent.layout.y)}>
            <Text style={styles.sectionTitle}>Boissons</Text>
            <View style={styles.grid}>
              {resto.drinks.map((d) => (
                <View key={d.id} style={[styles.drink, shadow.card, { width: drinkWidth }]}>
                  <Photo item={d} icon="wine-outline" tint={colors.purple} bg="#EEE8FF" style={styles.drinkPhoto} />
                  <View style={styles.drinkInfo}>
                    <Text style={styles.drinkName} numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text style={styles.muted} numberOfLines={2}>
                      {d.detail}
                    </Text>
                    <Text style={styles.drinkPrice}>{formatFcfa(d.price)}</Text>
                    {/* Own row: the card is too narrow for the price and the stepper side by side. */}
                    <QtyControl
                      qty={cart[d.id] ?? 0}
                      disabled={!status.open}
                      name={d.name}
                      block
                      onChange={(q) => setQty(d.id, q)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {count > 0 && (
        <View style={[styles.cartWrap, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            style={styles.cart}
            onPress={() => router.push('/panier')}
            accessibilityRole="button">
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

function RoundButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.round, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={colors.navy} />
    </Pressable>
  );
}

function Tab({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
      <Text style={[styles.tabText, on && styles.tabTextOn]}>{label}</Text>
    </Pressable>
  );
}

/** Item photo, or the icon on a tinted tile while the restaurant hasn't sent one. */
function Photo({
  item,
  icon,
  tint,
  bg,
  style,
}: {
  item: RestoMenu;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  bg: string;
  style: object;
}) {
  return (
    <View style={[style, { backgroundColor: bg }]}>
      {item.photo ? (
        <Image source={item.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <Ionicons name={icon} size={28} color={tint} />
      )}
    </View>
  );
}

function QtyControl({
  qty,
  disabled,
  name,
  block,
  onChange,
}: {
  qty: number;
  disabled: boolean;
  name: string;
  /** Full-width control on its own row (drink cards). */
  block?: boolean;
  onChange: (qty: number) => void;
}) {
  if (qty) {
    return (
      <View style={[styles.stepper, block && styles.stepperBlock]}>
        <Pressable onPress={() => onChange(qty - 1)} style={[styles.stepMinus, block && { backgroundColor: colors.card }]} hitSlop={8} accessibilityLabel={`Retirer un ${name}`}>
          <Ionicons name="remove" size={16} color={colors.navy} />
        </Pressable>
        <Text style={styles.qty}>{qty}</Text>
        <Pressable onPress={() => onChange(qty + 1)} style={styles.stepPlus} hitSlop={8} accessibilityLabel={`Ajouter un ${name}`}>
          <Ionicons name="add" size={16} color="#fff" />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => onChange(1)}
      disabled={disabled}
      style={[styles.add, block && styles.addBlock, disabled && { opacity: 0.4 }]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Ajouter ${name}`}>
      <Ionicons name="add" size={14} color={colors.primary} />
      <Text style={styles.addText}>Ajouter</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { height: 240, alignItems: 'center', justifyContent: 'center' },
  heroBar: { position: 'absolute', left: PADDING, right: PADDING, flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  // Overlaps the photo a little so the page reads as one piece.
  infoCard: {
    marginTop: -28,
    marginHorizontal: PADDING,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
  },
  name: { fontSize: 22, fontWeight: '800', color: colors.navy },
  sub: { fontSize: 13, color: colors.muted2, marginTop: 2 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
  },
  statusTag: { alignSelf: 'flex-start', marginTop: 12 },
  metaLine: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: colors.muted2 },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.muted2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  body: { paddingHorizontal: PADDING, marginTop: 16, gap: 20 },
  closed: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.warningBg,
  },
  closedText: { flex: 1, fontSize: 13, color: colors.warningText },
  tabs: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radii.pill, padding: 4 },
  tab: { flex: 1, height: 38, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.card, ...shadow.card },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.muted2 },
  tabTextOn: { color: colors.navy },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
  muted: { color: colors.muted2, fontSize: 12, marginTop: 2 },
  dish: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 10, flexDirection: 'row', gap: 12 },
  dishPhoto: { width: 100, height: 100, borderRadius: radii.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  dishInfo: { flex: 1, paddingVertical: 2 },
  dishName: { fontWeight: '700', color: colors.navy, fontSize: 16 },
  dishBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 },
  price: { fontWeight: '700', color: colors.primary, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  drink: { backgroundColor: colors.card, borderRadius: radii.lg, overflow: 'hidden' },
  drinkPhoto: { height: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  drinkInfo: { padding: 10 },
  drinkName: { fontWeight: '700', color: colors.navy, fontSize: 14 },
  drinkPrice: { fontWeight: '700', color: colors.primary, fontSize: 14, marginTop: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // 32 px visible, 48 px to the touch with hitSlop.
  stepMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontWeight: '700', color: colors.navy, minWidth: 12, textAlign: 'center' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radii.pill,
  },
  // Same 32 px height in both states so the drink card doesn't jump.
  addBlock: { justifyContent: 'center', height: 40, marginTop: 8 },
  stepperBlock: { justifyContent: 'space-between', height: 40, marginTop: 8, paddingHorizontal: 2, borderRadius: radii.pill, backgroundColor: colors.bg },
  addText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  cartWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: PADDING, paddingTop: 12 },
  cart: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  cartText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
