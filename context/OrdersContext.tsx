import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'done';

export type Order = {
  id: string;
  restoId: string;
  lines: { id: string; name: string; qty: number; price: number }[];
  subtotal: number;
  fee: number;
  total: number;
  mode: 'delivery' | 'pickup';
  address?: string;
  note?: string;
  paymentId: string;
  createdAt: number;
  status: OrderStatus;
};

type OrdersValue = {
  orders: Order[];
  /** Returns the new order id. */
  place: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
};

const OrdersContext = createContext<OrdersValue | null>(null);

// Mock: the status moves on by itself so the tracking can be seen. With a backend, the restaurant drives it.
const DEMO_STEPS: [OrderStatus, number][] = [
  ['preparing', 8_000],
  ['ready', 25_000],
  ['done', 45_000],
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const value = useMemo<OrdersValue>(
    () => ({
      orders,
      place: (o) => {
        const id = `C${Date.now().toString(36).toUpperCase().slice(-5)}`;
        setOrders((list) => [{ ...o, id, createdAt: Date.now(), status: 'received' }, ...list]);
        for (const [status, after] of DEMO_STEPS) {
          timers.current.push(setTimeout(() => setOrders((list) => list.map((x) => (x.id === id ? { ...x, status } : x))), after));
        }
        return id;
      },
    }),
    [orders],
  );
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider');
  return ctx;
}

/** Wording per step, depending on delivery or pickup. */
export function orderSteps(mode: Order['mode']) {
  return [
    { key: 'received' as const, title: 'Commande reçue', detail: 'Le restaurant a ta commande.' },
    { key: 'preparing' as const, title: 'En préparation', detail: 'Ton repas est en cuisine.' },
    mode === 'delivery'
      ? { key: 'ready' as const, title: 'En route', detail: 'Le livreur arrive vers toi.' }
      : { key: 'ready' as const, title: 'Prête à récupérer', detail: 'Passe la chercher au restaurant.' },
    mode === 'delivery'
      ? { key: 'done' as const, title: 'Livrée', detail: 'Bon appétit !' }
      : { key: 'done' as const, title: 'Récupérée', detail: 'Bon appétit !' },
  ];
}
