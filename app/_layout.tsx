import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LostProvider } from '@/context/LostContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { TaxiProvider } from '@/context/TaxiContext';
import { TicketsProvider } from '@/context/TicketsContext';
import { useNotificationRouting } from '@/lib/notifications';

function NotificationRouter() {
  const { user } = useAuth();
  useNotificationRouting(!!user);
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <CartProvider>
          <TicketsProvider>
            <TaxiProvider>
              <LostProvider>
                <NotificationRouter />
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="services/[slug]" />
                  <Stack.Screen name="caravane/[id]" />
                  <Stack.Screen name="resto/[id]" />
                  <Stack.Screen name="panier" />
                  <Stack.Screen name="billet/[id]" />
                  <Stack.Screen name="trajet/[id]" />
                  <Stack.Screen name="lieu/[id]" />
                  <Stack.Screen name="objet/declarer" />
                  <Stack.Screen name="objet/scanner" />
                </Stack>
              </LostProvider>
            </TaxiProvider>
          </TicketsProvider>
        </CartProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
