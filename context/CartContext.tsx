import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { findPrivateResto } from '@/constants/data';

/** Quantity per dish or drink id. */
type Items = Record<string, number>;

type CartValue = {
  /** Restaurant the basket belongs to: an order goes to a single restaurant. */
  restoId: string | null;
  items: Items;
  count: number;
  /** Sets a quantity (0 removes it). Asks before replacing a basket from another restaurant. */
  setQty: (restoId: string, itemId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ restoId: string | null; items: Items }>({ restoId: null, items: {} });

  const value = useMemo<CartValue>(() => {
    const count = Object.values(cart.items).reduce((a, b) => a + b, 0);

    const apply = (restoId: string, itemId: string, qty: number) =>
      setCart((c) => {
        const items = c.restoId === restoId ? { ...c.items } : {};
        if (qty <= 0) delete items[itemId];
        else items[itemId] = qty;
        return Object.keys(items).length ? { restoId, items } : { restoId: null, items: {} };
      });

    return {
      ...cart,
      count,
      setQty: (restoId, itemId, qty) => {
        if (count > 0 && cart.restoId && cart.restoId !== restoId && qty > 0) {
          const current = findPrivateResto(cart.restoId).resto.name;
          Alert.alert('Nouveau panier ?', `Ton panier chez ${current} sera vidé. Une commande ne concerne qu’un restaurant.`, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Vider et ajouter', style: 'destructive', onPress: () => apply(restoId, itemId, qty) },
          ]);
          return;
        }
        apply(restoId, itemId, qty);
      },
      clear: () => setCart({ restoId: null, items: {} }),
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
