import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { demoAccounts, organizers, user as demoUser, type CaravanOrganizer } from '@/constants/data';

type Profile = typeof demoUser;

/** Which part of the app is shown: students book, organizers check their passengers. */
export type Space = 'student' | 'organizer';

type AuthValue = {
  user: Profile | null;
  /** The company or association this account manages, if any. Set by the web platform. */
  organizer: CaravanOrganizer | null;
  /** Spaces this account may open: a student who also organizes has both. */
  spaces: Space[];
  space: Space | null;
  login: (phone?: string) => void;
  register: (partial?: Partial<Profile>) => void;
  /** Opens the other space, through the /espace transition screen. */
  switchSpace: () => void;
  /** Used by /espace only: flips the guards while no protected screen is focused. */
  setSpace: (space: Space) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

// Drop Welcome / Login / Register from history; the index route then opens the account's space.
function enterApp() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [organizer, setOrganizer] = useState<CaravanOrganizer | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [space, setSpace] = useState<Space | null>(null);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      organizer,
      spaces,
      space,
      login: (phone = '') => {
        const account = demoAccounts[phone.replace(/\D/g, '').replace(/^221/, '')];
        if (account) {
          // An organizer-only account has no student space: it opens straight on its own.
          const allowed: Space[] = account.kind === 'organizer' ? ['organizer'] : ['student', 'organizer'];
          setUser({ ...demoUser, firstName: account.firstName, lastName: account.lastName, initials: account.initials });
          setOrganizer(organizers[account.organizerId]);
          setSpaces(allowed);
          setSpace(allowed[0]);
        } else {
          setUser(demoUser);
          setOrganizer(null);
          setSpaces(['student']);
          setSpace('student');
        }
        enterApp();
      },
      // Sign-up in the app is for students; organizers are created on the web platform.
      register: (partial) => {
        setUser({ ...demoUser, ...partial });
        setOrganizer(null);
        setSpaces(['student']);
        setSpace('student');
        enterApp();
      },
      switchSpace: () => {
        const next = spaces.find((s) => s !== space);
        if (!next) return;
        router.replace({ pathname: '/espace', params: { vers: next } });
      },
      setSpace: (next) => {
        if (spaces.includes(next)) setSpace(next);
      },
      logout: () => {
        setUser(null);
        setOrganizer(null);
        setSpaces([]);
        setSpace(null);
        router.replace('/(auth)/login');
      },
    }),
    [user, organizer, spaces, space]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
