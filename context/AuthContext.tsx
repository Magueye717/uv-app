import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { user as demoUser } from '@/constants/data';

type Profile = typeof demoUser;

type AuthValue = {
  user: Profile | null;
  login: () => void;
  register: (partial?: Partial<Profile>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

// Drop Welcome / Login / Register from history so Back doesn't return to the sign-in flow.
function enterApp() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/(tabs)');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      login: () => {
        setUser(demoUser);
        enterApp();
      },
      register: (partial) => {
        setUser({ ...demoUser, ...partial });
        enterApp();
      },
      logout: () => {
        setUser(null);
        router.replace('/(auth)/login');
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
