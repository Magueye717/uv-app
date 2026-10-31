import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { colors, radii, typo } from '@/constants/theme';

type Props = {
  digits: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Increment to play the shake animation. */
  shakeKey?: number;
};

// One box per digit. Typing advances, Backspace on an empty box goes back, and pasting or
// SMS autofill (iOS oneTimeCode / Android sms-otp autofill) spreads the code across the boxes.
export function OtpInput({ digits, onChange, disabled, invalid, shakeKey = 0 }: Props) {
  const refs = useRef<(TextInputInstance | null)[]>([]);
  const [shake] = useState(() => new Animated.Value(0));
  const length = digits.length;

  useEffect(() => {
    if (!shakeKey) return;
    const step = (toValue: number) =>
      Animated.timing(shake, { toValue, duration: 50, useNativeDriver: Platform.OS !== 'web' });
    Animated.sequence([step(10), step(-10), step(8), step(-8), step(4), step(0)]).start();
  }, [shakeKey, shake]);

  // Refocus the first box when the code is cleared (wrong code, resend).
  useEffect(() => {
    if (!disabled && digits.every((d) => !d)) refs.current[0]?.focus();
  }, [digits, disabled]);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, text: string) => {
    const clean = text.replace(/\D/g, '');
    const next = [...digits];

    // Paste / autofill: several digits at once, spread from this box onward.
    if (clean.length > 2 || (clean.length === 2 && !digits[i])) {
      clean
        .slice(0, length - i)
        .split('')
        .forEach((d, k) => (next[i + k] = d));
      onChange(next);
      focus(i + clean.length);
      return;
    }

    // Typing over an existing digit: keep the new one.
    const digit = clean.length === 2 ? (clean.startsWith(digits[i]) ? clean[1] : clean[0]) : clean;
    next[i] = digit;
    onChange(next);
    if (digit && i < length - 1) focus(i + 1);
  };

  const handleKey = (i: number, key: string) => {
    if (key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      onChange(next);
      focus(i - 1);
    }
  };

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX: shake }] }]}>
      {digits.map((d, i) => (
        <View key={i} style={[styles.box, !!d && styles.boxFilled, invalid && styles.boxInvalid]}>
          <TextInput
            ref={(r) => {
              refs.current[i] = r;
            }}
            value={d}
            onChangeText={(t) => handleChange(i, t)}
            onKeyPress={(e) => handleKey(i, e.nativeEvent.key)}
            editable={!disabled}
            autoFocus={i === 0}
            keyboardType="number-pad"
            textContentType={i === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={i === 0 ? 'sms-otp' : 'off'}
            selectTextOnFocus
            maxLength={length}
            accessibilityLabel={`Chiffre ${i + 1} sur ${length}`}
            style={styles.input}
          />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  box: {
    width: 60,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  boxFilled: { borderColor: colors.orange },
  boxInvalid: { borderColor: colors.danger },
  input: { ...typo.h1, flex: 1, textAlign: 'center', color: colors.text },
});
