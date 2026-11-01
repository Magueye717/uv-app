import { Redirect } from 'expo-router';

import { spaceHome, useAuth } from '@/context/AuthContext';

// Entry point: the account's current space, or the welcome screen.
export default function Index() {
  const { status, user, space } = useAuth();
  // The saved session is being checked: stay on the splash background for that moment.
  if (status === 'restoring') return null;
  if (!user) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={spaceHome(space)} />;
}
