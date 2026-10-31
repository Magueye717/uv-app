import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { notifications } from '@/constants/data';

type NotificationsValue = {
  /** Ids not seen yet. */
  unread: string[];
  markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsValue | null>(null);

// Mock: today's notifications start unread. A backend would keep this per student.
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [unread, setUnread] = useState(() => notifications.filter((n) => n.day === 'today').map((n) => n.id));
  const value = useMemo<NotificationsValue>(() => ({ unread, markAllRead: () => setUnread([]) }), [unread]);
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
