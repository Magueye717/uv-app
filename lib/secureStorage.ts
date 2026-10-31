import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keychain (iOS) / Keystore (Android). expo-secure-store has no web implementation: the web build falls back to
// localStorage, which is fine for development only.
const web = Platform.OS === 'web';

export async function getSecure(key: string): Promise<string | null> {
  if (web) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

export async function setSecure(key: string, value: string): Promise<void> {
  if (web) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecure(key: string): Promise<void> {
  if (web) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
