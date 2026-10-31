import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// Entry point: the account's current space, or the welcome screen.
export default function Index() {
  const { user, space } = useAuth();
  if (!user) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={space === 'organizer' ? '/activites' : '/(tabs)'} />;
}
