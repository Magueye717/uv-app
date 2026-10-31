import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LivePulse, PopOnChange } from '@/components/motion';
import { EmptyState } from '@/components/states';
import { BackButton, OutlineButton } from '@/components/ui';
import { findPrivateResto, formatFcfa, paymentMethods } from '@/constants/data';
import { colors, motion, radii, shadow, typo } from '@/constants/theme';
import { orderSteps, useOrders } from '@/context/OrdersContext';
import { haptics } from '@/lib/haptics';

const STATUS_ICON = { received: 'receipt-outline', preparing: 'flame', ready: 'bicycle', done: 'checkmark-circle' } as const;

// Order tracking: where the order stands, what's in it, and how to reach the restaurant.
export default function CommandeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === id);
  const home = () => router.dismissTo('/(tabs)');
  const back = () => (router.canGoBack() ? router.back() : home());

  // Felt as well as seen: a tick at each step, a success buzz when it's ready or delivered.
  const status = order?.status;
  const prev = useRef(status);
  useEffect(() => {
    if (status && prev.current && status !== prev.current) {
      if (status === 'ready' || status === 'done') haptics.success();
      else haptics.select();
    }
    prev.current = status;
  }, [status]);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={back} />
        <EmptyState icon="receipt-outline" title="Commande introuvable" text="Elle a peut-être déjà été livrée." />
      </SafeAreaView>
    );
  }

  const { resto } = findPrivateResto(order.restoId);
  const steps = orderSteps(order.mode);
  const current = steps.findIndex((s) => s.key === order.status);
  const step = steps[current];
  const done = order.status === 'done';
  const payment = paymentMethods.find((p) => p.id === order.paymentId)?.name ?? 'Espèces';
  const cash = order.paymentId === 'cash';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Header onBack={back} code={order.id} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, done && { backgroundColor: colors.success }]} accessibilityLiveRegion="polite">
          <View style={styles.heroIcon}>
            <PopOnChange id={order.status}>
              <Ionicons name={order.mode === 'pickup' && order.status === 'ready' ? 'storefront' : STATUS_ICON[order.status]} size={28} color="#fff" />
            </PopOnChange>
          </View>
          <Text style={styles.heroTitle}>{step.title}</Text>
          <Text style={styles.heroText}>
            {resto.name} · {step.detail}
          </Text>
        </View>

        {!done && !cash && order.status === 'received' && (
          <View style={styles.note}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.warningText} />
            <Text style={styles.noteText}>
              Valide le paiement de {formatFcfa(order.total)} sur {payment} : le restaurant commence dès réception.
            </Text>
          </View>
        )}

        <View style={[styles.card, shadow.card]}>
          {steps.map((s, i) => {
            const reached = i <= current;
            const now = i === current && !done;
            return (
              <View key={s.key} style={styles.step}>
                <View style={styles.rail}>
                  <View>
                    {now && <LivePulse color={colors.accent} size={22} />}
                    <View style={[styles.dot, reached && styles.dotOn, now && styles.dotNow]}>
                      {reached && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                  </View>
                  {i < steps.length - 1 && (
                    <View style={styles.line}>
                      <LineFill on={i < current} />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
                  <Text style={[styles.stepTitle, !reached && { color: colors.muted2 }]}>{s.title}</Text>
                  {now && <Text style={styles.stepDetail}>{s.detail}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, shadow.card, { gap: 12 }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{order.mode === 'delivery' ? 'Livraison' : 'À récupérer'}</Text>
              <Text style={styles.value}>{order.mode === 'delivery' ? order.address : resto.location}</Text>
            </View>
            <Pressable
              style={styles.call}
              onPress={() => Linking.openURL(`tel:${resto.phone.replace(/\s/g, '')}`)}
              accessibilityRole="button"
              accessibilityLabel={`Appeler ${resto.name}`}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
          {order.note && <Text style={styles.muted}>Note : {order.note}</Text>}
          <View style={styles.divider} />
          {order.lines.map((l) => (
            <View key={l.id} style={styles.rowBetween}>
              <Text style={styles.item}>
                {l.qty} × {l.name}
              </Text>
              <Text style={styles.itemPrice}>{formatFcfa(l.qty * l.price)}</Text>
            </View>
          ))}
          {order.fee > 0 && (
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Livraison</Text>
              <Text style={styles.muted}>{formatFcfa(order.fee)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.total}>Total · {payment}</Text>
            <Text style={styles.totalValue}>{formatFcfa(order.total)}</Text>
          </View>
        </View>

        <OutlineButton label="Retour à l’accueil" onPress={home} />
        {!done && <Text style={styles.demo}>Démo : le statut avance tout seul en quelques secondes.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, code }: { onBack: () => void; code?: string }) {
  return (
    <View style={styles.head}>
      <BackButton onPress={onBack} />
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.h1}>Ma commande</Text>
        {code && <Text style={styles.code}>n° {code}</Text>}
      </View>
      <View style={{ width: 44 }} />
    </View>
  );
}

/** The rail between two steps fills top to bottom when the next step is reached. */
function LineFill({ on }: { on: boolean }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withTiming(on ? 100 : 0, { duration: motion.slow }));
  }, [on, h]);
  const fill = useAnimatedStyle(() => ({ height: `${h.get()}%` }));
  return <Animated.View style={[styles.lineFill, fill]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  h1: { ...typo.h3, color: colors.navy },
  code: { ...typo.caption, color: colors.muted2 },
  body: { padding: 20, gap: 14, paddingBottom: 32 },
  hero: { backgroundColor: colors.primary, borderRadius: radii.lg, padding: 20, alignItems: 'center', gap: 6 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroTitle: { ...typo.h2, color: '#fff' },
  heroText: { ...typo.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  note: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radii.md, backgroundColor: colors.warningBg },
  noteText: { ...typo.small, flex: 1, color: colors.warningText, lineHeight: 18 },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 16 },
  step: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 22 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.success, borderColor: colors.success },
  dotNow: { backgroundColor: colors.accent, borderColor: colors.accent },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  lineFill: { width: '100%', backgroundColor: colors.success },
  stepTitle: { ...typo.title, color: colors.navy, marginTop: 1 },
  stepDetail: { ...typo.small, color: colors.muted2, marginTop: 2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { ...typo.caption, color: colors.muted2 },
  value: { ...typo.title, color: colors.navy, marginTop: 1 },
  call: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  muted: { ...typo.small, color: colors.muted2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  item: { ...typo.body, flex: 1, color: colors.text },
  itemPrice: { ...typo.bodyStrong, color: colors.text },
  total: { ...typo.title, color: colors.navy },
  totalValue: { ...typo.h3, color: colors.navy },
  demo: { ...typo.caption, color: colors.muted2, textAlign: 'center' },
});
