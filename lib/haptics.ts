import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Vibration for moments that matter (a seat paid, a ticket scanned), never on every tap.
// Android uses its system haptics (no VIBRATE needed); iOS skips them in Low Power Mode and while the camera runs.
const run = (android: Haptics.AndroidHaptics, ios: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  (Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(android) : ios()).catch(() => {});
};

export const haptics = {
  /** A choice changed: switch, stepper. */
  select: () => run(Haptics.AndroidHaptics.Segment_Tick, () => Haptics.selectionAsync()),
  success: () => run(Haptics.AndroidHaptics.Confirm, () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(Haptics.AndroidHaptics.Long_Press, () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(Haptics.AndroidHaptics.Reject, () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
