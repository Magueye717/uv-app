import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { restosApi, type AlertDto, type RestosDayDto } from '@/features/restos/api';

type CampusValue = {
  /** Today's menus of the university restaurants; null until loaded. */
  restos: RestosDayDto | null;
  /** The home screen's alert strip: campus notices and dishes sold out right now. */
  alerts: AlertDto[];
  refresh: () => Promise<void>;
};

const CampusContext = createContext<CampusValue | null>(null);

const REFRESH_MS = 60_000;

/**
 * Campus life from the backend: the public restaurants' menus with their stock levels, and the alerts. Refreshed
 * every minute while the app is open (a "rupture" shows within a minute; the push tells the others).
 */
export function CampusProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const enabled = status === 'signedIn';
  const [restos, setRestos] = useState<RestosDayDto | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const [day, list] = await Promise.allSettled([restosApi.day(), restosApi.alerts()]);
    // Offline: keep what's shown.
    if (day.status === 'fulfilled') setRestos(day.value);
    if (list.status === 'fulfilled') setAlerts(list.value.items);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setRestos(null);
      setAlerts([]);
      return;
    }
    refresh();
    const timer = setInterval(() => AppState.currentState === 'active' && refresh(), REFRESH_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [enabled, refresh]);

  const value = useMemo(() => ({ restos, alerts, refresh }), [restos, alerts, refresh]);
  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider');
  return ctx;
}
