import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, Field, PrimaryButton, Segmented } from '@/components/ui';
import { findPrivateResto, formatFcfa, paymentMethods, restoStatus } from '@/constants/data';
import { PaymentLogo } from '@/components/PaymentLogo';
import { colors, radii, shadow, typo } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrdersContext';
import { useNow } from '@/lib/useNow';

type Mode = 'delivery' | 'pickup';

// Mobile money plus cash, paid when the order is handed over.
const PAYMENTS = [...paymentMethods, { id: 'cash', name: 'Espèces', detail: 'Payer en main propre', short: 'F', bg: colors.green }];

export default function Panier() {
  const cart = useCart();
  const orders = useOrders();
  const now = useNow();
  const { resto } = findPrivateResto(cart.restoId);
  const status = restoStatus(resto.services, now);

  const canDeliver = resto.deliveryFee !== null;
  const [mode, setMode] = useState<Mode>(canDeliver ? 'delivery' : 'pickup');
  const { user } = useAuth();
  // Pre-filled with the room given at sign-up; still editable (delivery to a friend, the BU…).
  const [address, setAddress] = useState(user?.village && user.room ? `${user.village}, chambre ${user.room}` : '');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState(PAYMENTS[0].id);

  const lines = [...resto.menus, ...resto.drinks]
    .filter((i) => cart.items[i.id])
    .map((i) => ({ ...i, qty: cart.items[i.id] }));
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const delivery = mode === 'delivery';
  // Fee set by the restaurant, shown before the student chooses.
  const fee = delivery ? (resto.deliveryFee ?? 0) : 0;
  const feeLabel = resto.deliveryFee ? `Livraison · ${formatFcfa(resto.deliveryFee)}` : 'Livraison gratuite';
  const total = subtotal + fee;

  const missingAddress = delivery && !address.trim();
  const blocker = !status.open ? status.label : missingAddress ? 'Indique où te livrer' : null;

  const back = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/(tabs)/resto', params: { vue: 'restos' } }));

  const order = () => {
    // A real order with its own tracking screen, instead of a message that disappears.
    const id = orders.place({
      restoId: resto.id,
      lines: lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price })),
      subtotal,
      fee,
      total,
      mode,
      address: delivery ? address.trim() : undefined,
      note: note.trim() || undefined,
      paymentId: payment,
    });
    cart.clear();
    router.replace(`/commande/${id}`);
  };

  if (!cart.count) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={back} />
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Ton panier est vide</Text>
          <Text style={styles.emptyText}>Choisis un restaurant et ajoute des plats ou des boissons.</Text>
          <PrimaryButton label="Voir les restaurants" onPress={() => router.dismissTo({ pathname: '/(tabs)/resto', params: { vue: 'restos' } })} style={{ alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Header onBack={back} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.card, styles.resto, shadow.card]}>
            <View style={[styles.restoPhoto, { backgroundColor: resto.bg }]}>
              {resto.photo ? (
                <Image source={resto.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <Ionicons name={resto.icon} size={22} color={resto.tint} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.restoName} numberOfLines={1}>
                {resto.name}
              </Text>
              <View style={styles.status}>
                <View style={[styles.dot, { backgroundColor: status.open ? colors.success : colors.muted }]} />
                <Text style={[styles.statusText, { color: status.open ? colors.successText : colors.muted2 }]}>{status.label}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.section}>Articles · {cart.count}</Text>
          <View style={[styles.card, shadow.card, { paddingVertical: 4 }]}>
            {lines.map((l, i) => (
              <View key={l.id} style={[styles.line, i > 0 && styles.lineDivider]}>
                <View style={[styles.thumb, { backgroundColor: resto.bg }]}>
                  {l.photo ? (
                    <Image source={l.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Ionicons name="fast-food" size={18} color={resto.tint} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Text style={styles.linePrice}>{formatFcfa(l.qty * l.price)}</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => cart.setQty(resto.id, l.id, l.qty - 1)}
                    style={styles.stepMinus}
                    hitSlop={8}
                    accessibilityLabel={l.qty === 1 ? `Retirer ${l.name} du panier` : `Retirer un ${l.name}`}>
                    <Ionicons name={l.qty === 1 ? 'trash-outline' : 'remove'} size={15} color={l.qty === 1 ? colors.danger : colors.navy} />
                  </Pressable>
                  <Text style={styles.qty}>{l.qty}</Text>
                  <Pressable
                    onPress={() => cart.setQty(resto.id, l.id, l.qty + 1)}
                    style={styles.stepPlus}
                    hitSlop={8}
                    accessibilityLabel={`Ajouter un ${l.name}`}>
                    <Ionicons name="add" size={15} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable style={[styles.line, styles.lineDivider]} onPress={back} accessibilityRole="button">
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addMore}>Ajouter des articles</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Récupération</Text>
          {canDeliver ? (
            <Segmented<Mode>
              options={[
                { value: 'delivery', label: feeLabel },
                { value: 'pickup', label: 'À emporter' },
              ]}
              value={mode}
              onChange={setMode}
            />
          ) : (
            <View style={styles.info}>
              <Ionicons name="walk-outline" size={16} color={colors.muted2} />
              <Text style={styles.infoText}>À emporter uniquement · {resto.location}</Text>
            </View>
          )}
          {delivery ? (
            <Field
              icon="location-outline"
              placeholder="Ex. Village E, pavillon C, chambre 12"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="sentences"
              accessibilityLabel="Adresse de livraison"
            />
          ) : (
            canDeliver && (
              <View style={styles.info}>
                <Ionicons name="storefront-outline" size={16} color={colors.muted2} />
                <Text style={styles.infoText}>À récupérer sur place · {resto.location}</Text>
              </View>
            )
          )}
          <Field
            icon="chatbubble-ellipses-outline"
            placeholder="Note pour le restaurant (ex. sans piment)"
            value={note}
            onChangeText={setNote}
            autoCapitalize="sentences"
            accessibilityLabel="Note pour le restaurant"
          />

          <Text style={styles.section}>Paiement</Text>
          {PAYMENTS.map((m) => {
            const on = m.id === payment;
            return (
              <Pressable
                key={m.id}
                onPress={() => setPayment(m.id)}
                style={[styles.card, styles.payment, on && styles.paymentOn]}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}>
                <PaymentLogo method={m} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payName}>{m.name}</Text>
                  <Text style={styles.muted}>
                    {m.id === 'cash' ? (delivery ? 'À la livraison' : 'Au retrait') : m.detail}
                  </Text>
                </View>
                {on ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : <View style={styles.radio} />}
              </Pressable>
            );
          })}

          <View style={[styles.card, shadow.card, { gap: 8 }]}>
            <RecapRow k="Sous-total" v={formatFcfa(subtotal)} />
            {delivery && <RecapRow k="Livraison" v={fee ? formatFcfa(fee) : 'Gratuite'} />}
            <View style={styles.divider} />
            <View style={styles.recapRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatFcfa(total)}</Text>
            </View>
          </View>

          <PrimaryButton label={blocker ?? `Commander · ${formatFcfa(total)}`} onPress={order} disabled={!!blocker} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.head}>
      <BackButton onPress={onBack} />
      <Text style={styles.h1}>Mon panier</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

function RecapRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapKey}>{k}</Text>
      <Text style={styles.recapValue}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h3, color: colors.navy },
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14 },
  section: { ...typo.title, color: colors.navy, marginTop: 6 },
  muted: { ...typo.caption, color: colors.muted2, marginTop: 1 },
  resto: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  restoPhoto: { width: 52, height: 52, borderRadius: radii.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  restoName: { ...typo.title, color: colors.navy },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { ...typo.captionStrong },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  lineDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  thumb: { width: 48, height: 48, borderRadius: radii.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  lineName: { ...typo.bodyStrong, color: colors.text },
  linePrice: { ...typo.smallStrong, color: colors.primary, marginTop: 2 },
  addMore: { ...typo.bodyStrong, color: colors.primary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // 32 px visible, 48 px to the touch with hitSlop.
  stepMinus: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  stepPlus: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  qty: { fontWeight: '700', color: colors.navy, minWidth: 14, textAlign: 'center' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  infoText: { ...typo.small, flex: 1, color: colors.muted2 },
  payment: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: 'transparent' },
  paymentOn: { borderColor: colors.primary },
  payName: { ...typo.title, color: colors.navy },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recapKey: { ...typo.body, color: colors.muted2 },
  recapValue: { ...typo.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  totalLabel: { ...typo.title, color: colors.navy },
  totalValue: { ...typo.h3, color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { ...typo.h3, color: colors.navy },
  emptyText: { ...typo.body, color: colors.muted2, textAlign: 'center', marginBottom: 10 },
});
