import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { realtime } from '@/features/chat/realtime';
import { api } from '@/lib/api';

type NotificationsValue = {
  /** Not read yet (the bell's dot, the profile badge). */
  unreadCount: number;
  /** The notifications screen opened: everything is read. */
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsValue | null>(null);

/** The bell, from the backend. A new notification updates it live (my real-time channel). */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const signedIn = status === 'signedIn';
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!signedIn) return;
    try {
      setUnreadCount((await api<{ count: number }>('GET', '/notifications/unread-count', { auth: true })).count);
    } catch {
      // Offline: the bell keeps its last state.
    }
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) {
      setUnreadCount(0);
      return;
    }
    refresh();
    const off = realtime.onMine((event) => event === 'notification.created' && refresh());
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      off();
      sub.remove();
    };
  }, [signedIn, refresh]);

  const value = useMemo<NotificationsValue>(
    () => ({
      unreadCount,
      refresh,
      markAllRead: async () => {
        setUnreadCount(0);
        await api('POST', '/notifications/read', { auth: true, body: { all: true } }).catch(() => undefined);
      },
    }),
    [unreadCount, refresh],
  );
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}

/** Accessible name for a bell button: "Notifications, 3 non lues". */
export const bellLabel = (count: number) =>
  count ? `Notifications, ${count} non lue${count > 1 ? 's' : ''}` : 'Notifications';
