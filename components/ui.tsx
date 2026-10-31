import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import Animated, { FadeInDown, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radii } from '@/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  accent,
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Orange button of the welcome screen, for the sign-up / sign-in flow. */
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primary,
        accent && styles.accent,
        pressed && styles.pressed,
        disabled && !loading && styles.disabled,
        style,
      ]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryLabel}>{label}</Text>}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outline, pressed && styles.pressed]}>
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  icon,
  right,
  prefix,
  invalid,
  secure,
  accent = colors.primary,
  onFocus,
  onBlur,
  ...props
}: TextInputProps & {
  icon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  /** Fixed text before the input, e.g. a country code. */
  prefix?: string;
  invalid?: boolean;
  /** Password field with its own show / hide toggle. */
  secure?: boolean;
  /** Border and icon color while focused. */
  accent?: string;
}) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  // 0 → 1 while focused: the border takes the accent color and the field lifts a little.
  const focus = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    // Animated styles win over static ones, so the error color is decided here too.
    borderColor: invalid ? colors.danger : interpolateColor(focus.get(), [0, 1], [colors.border, accent]),
    backgroundColor: interpolateColor(focus.get(), [0, 1], [colors.input, colors.card]),
    shadowOpacity: focus.get() * 0.12,
  }));
  return (
    <Animated.View
      style={[
        styles.field,
        { shadowColor: accent, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
        animated,
        invalid && styles.fieldInvalid,
      ]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={invalid ? colors.danger : focused ? accent : colors.muted}
          style={styles.fieldIcon}
        />
      ) : null}
      {prefix ? (
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>{prefix}</Text>
        </View>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={secure ? hidden : undefined}
        selectionColor={accent}
        onFocus={(e) => {
          setFocused(true);
          focus.set(withTiming(1, { duration: 180 }));
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          focus.set(withTiming(0, { duration: 180 }));
          onBlur?.(e);
        }}
        {...props}
      />
      {secure ? (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} accessibilityLabel="Afficher le mot de passe">
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
        </Pressable>
      ) : null}
      {right}
    </Animated.View>
  );
}

export function LabeledField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? (
        <Animated.Text entering={FadeInDown.duration(180)} style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back}>
      <Ionicons name="arrow-back" size={20} color={colors.navy} />
    </Pressable>
  );
}

export function BellButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.bell}>
      <Ionicons name="notifications-outline" size={20} color={colors.navy} />
      <View style={styles.dot} />
    </Pressable>
  );
}

export function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const map = {
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    neutral: { bg: colors.bg, fg: colors.muted2 },
  }[tone];
  return (
    <View style={[styles.chip, { backgroundColor: map.bg }]}>
      <Text style={[styles.chipText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

/** Title + subtitle on the left, bell on the right (tab screens). */
export function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <View style={styles.screenHead}>
      {onBack ? <BackButton onPress={onBack} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSub}>{subtitle}</Text> : null}
      </View>
      <BellButton onPress={() => router.push('/notifications')} />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.segBtn, on && styles.segOn]}>
            <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.filter, on && styles.filterOn]}>
            <Text style={[styles.filterText, on && styles.filterTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  accent: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  outline: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  outlineLabel: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.45 },
  field: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fieldInvalid: { borderColor: colors.danger, borderWidth: 1.5 },
  fieldIcon: { marginRight: 10 },
  prefix: { paddingRight: 10, marginRight: 10, borderRightWidth: 1, borderRightColor: colors.border },
  prefixText: { fontSize: 15, fontWeight: '600', color: colors.text },
  error: { fontSize: 12, color: colors.danger },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 14 },
  label: { fontSize: 14, fontWeight: '700', color: colors.navy },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  chipText: { fontSize: 12, fontWeight: '600' },
  screenHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: colors.navy },
  screenSub: { color: colors.muted2, marginTop: 2 },
  segment: { backgroundColor: colors.primarySoft, borderRadius: radii.pill, flexDirection: 'row', padding: 4 },
  segBtn: { flex: 1, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.primary },
  segText: { fontWeight: '700', color: colors.muted2 },
  segTextOn: { color: '#fff' },
  filters: { gap: 8, paddingHorizontal: 20 },
  filter: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.muted2 },
  filterTextOn: { color: '#fff' },
});
