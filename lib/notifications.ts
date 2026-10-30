import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { mealTimes } from '@/constants/data';

// Notifications carry the screen to open in `data.url` (see useNotificationRouting).
export type NotificationData = { url?: string };

const CHANNEL_ID = 'campus';

// Show notifications as banners even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let setupDone = false;
// Set once the Android channel exists; otherwise Android falls back to its default channel.
let channelId: string | undefined;

/**
 * Creates the Android channel, asks for permission once, then schedules the daily meal reminders.
 * Safe to call on every launch: it only prompts when the user hasn't answered yet.
 */
export async function setupNotifications() {
  if (setupDone) return;
  setupDone = true;
  // Notifications are a bonus: a failure here must never break the home screen.
  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === 'android') await createAndroidChannel();

    let { granted } = await Notifications.getPermissionsAsync();
    if (!granted) ({ granted } = await Notifications.requestPermissionsAsync());
    if (!granted) return;

    await scheduleMealReminders();
    await registerPushToken();
  } catch (e) {
    if (__DEV__) console.warn('Notifications setup failed', e);
  }
}

async function createAndroidChannel() {
  try {
    // Every field set explicitly: some Android builds reject a channel with unset optional fields.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Infos du campus',
      description: 'Menus, caravanes et alertes du campus',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E54D4',
      showBadge: true,
      enableVibrate: true,
      enableLights: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    channelId = CHANNEL_ID;
  } catch (e) {
    if (__DEV__) console.warn('Android notification channel not created, using the default one', e);
  }
}

// Fixed identifiers: rescheduling replaces the previous reminder instead of stacking duplicates.
async function scheduleMealReminders() {
  const meals = [
    { id: 'meal-lunch', meal: mealTimes.lunch, minutesBefore: 15 },
    { id: 'meal-dinner', meal: mealTimes.dinner, minutesBefore: 15 },
  ];
  for (const { id, meal, minutesBefore } of meals) {
    const at = meal.start * 60 - minutesBefore;
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `${meal.label} à ${meal.start}h · Resto 1 et Resto 2`,
        body: 'Regarde ce qui reste avant d’y aller.',
        data: { url: '/(tabs)' } satisfies NotificationData,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: Math.floor(at / 60),
        minute: at % 60,
        channelId,
      },
    });
  }
}

/** Reminds the student 2 hours before a booked caravan leaves. */
export async function scheduleCaravanReminder(caravan: {
  id: string;
  from: string;
  to: string;
  time: string;
  meetingPoint: string;
  departureAt: number;
}) {
  const remindAt = caravan.departureAt - 2 * 60 * 60 * 1000;
  if (remindAt <= Date.now()) return;
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      identifier: `caravan-${caravan.id}`,
      content: {
        title: `Ta caravane ${caravan.from} → ${caravan.to} part dans 2 h`,
        body: `Départ à ${caravan.time} · ${caravan.meetingPoint}`,
        data: { url: `/caravane/${caravan.id}` } satisfies NotificationData,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(remindAt),
        channelId,
      },
    });
  } catch (e) {
    if (__DEV__) console.warn('Caravan reminder not scheduled', e);
  }
}

/**
 * Gets this device's Expo push token so a server can send campus alerts (bourse payée, plat épuisé,
 * cours déplacé). Needs an EAS project ID (`eas init`) and a development build; Expo Go on Android
 * can't receive remote push. Returns null until both exist.
 */
export async function registerPushToken(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    // TODO: send `token` to the UV-APP backend once it exists.
    return token;
  } catch {
    // Network error or Expo Go on Android: try again on next launch.
    return null;
  }
}

/**
 * Opens the screen in `data.url` when a notification is tapped, whether the app was running or
 * was launched by the tap. Only navigates once the student is signed in.
 */
export function useNotificationRouting(signedIn: boolean) {
  useEffect(() => {
    if (!signedIn) return;
    let active = true;

    const open = (response: Notifications.NotificationResponse | null) => {
      const url = (response?.notification.request.content.data as NotificationData | undefined)?.url;
      if (typeof url === 'string') {
        router.push(url as never);
        Notifications.clearLastNotificationResponseAsync();
      }
    };

    Notifications.getLastNotificationResponseAsync().then((r) => active && open(r));
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => {
      active = false;
      sub.remove();
    };
  }, [signedIn]);
}
