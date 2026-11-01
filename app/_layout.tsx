import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';
import { AuthProvider, spaceHome, useAuth } from '@/context/AuthContext';
import { CampusProvider } from '@/context/CampusContext';
import { CaravansProvider } from '@/context/CaravansContext';
import { CartProvider } from '@/context/CartContext';
import { LostProvider } from '@/context/LostContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { OfflineBanner } from '@/components/states';
import { TaxiProvider } from '@/context/TaxiContext';
import { ChatsProvider } from '@/features/chat/ChatContext';
import { useNotificationRouting } from '@/lib/notifications';

function NotificationRouter() {
  const { user } = useAuth();
  useNotificationRouting(!!user);
  return null;
}

// Each space only exists for accounts allowed in it: a student can't open the organizer screens,
// even from a link. Client-side only: the backend must check the role too.
function Screens() {
  const { space } = useAuth();
  // Where a blocked screen sends you: the other space when switching, sign-in when logged out.
  const home = spaceHome(space);
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="espace" options={{ animation: 'fade' }} />
      <Stack.Protected guard={space === 'student'} redirectTo={home}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="a-la-une" />
        <Stack.Screen name="mes-etudes" />
        <Stack.Screen name="services/[slug]" />
        <Stack.Screen name="services/cours" />
        <Stack.Screen name="services/objets" />
        <Stack.Screen name="services/taxi" />
        <Stack.Screen name="caravane/[id]" />
        <Stack.Screen name="resto/[id]" />
        <Stack.Screen name="panier" />
        <Stack.Screen name="commande/[id]" />
        <Stack.Screen name="billet/[id]" />
        <Stack.Screen name="taxi/[id]" />
        <Stack.Screen name="trajet/[id]" />
        <Stack.Screen name="paiement/retour" options={{ animation: 'none' }} />
        <Stack.Screen name="lieu/[id]" />
        <Stack.Screen name="objet/[id]" />
        <Stack.Screen name="objet/declarer" />
        <Stack.Screen name="objet/scanner" />
        <Stack.Screen name="objet/discussion/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'organizer'} redirectTo={home}>
        <Stack.Screen name="(organisateur)" />
        <Stack.Screen name="depart/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'resto' || space === 'alerts'} redirectTo={home}>
        <Stack.Screen name="(staff)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        {/* Restaurants' menus and the home screen's alerts. */}
        <CampusProvider>
          <CartProvider>
            <OrdersProvider>
              <CaravansProvider>
                {/* Every conversation (taxi now, lost & found next) and the app's WebSocket. */}
                <ChatsProvider>
                  <TaxiProvider>
                    <LostProvider>
                      <NotificationRouter />
                      <StatusBar style="light" />
                      <Screens />
                      {/* Above every screen while there's no connection. */}
                      <OfflineBanner />
                    </LostProvider>
                  </TaxiProvider>
                </ChatsProvider>
              </CaravansProvider>
            </OrdersProvider>
          </CartProvider>
        </CampusProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
