import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useNotificationRouting } from '@/lib/notifications';

function NotificationRouter() {
  const { user } = useAuth();
  useNotificationRouting(!!user);
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationRouter />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F3F5FB' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="services/[slug]" />
        <Stack.Screen name="caravane/[id]" />
        <Stack.Screen name="resto/[id]" />
      </Stack>
    </AuthProvider>
  );
}
