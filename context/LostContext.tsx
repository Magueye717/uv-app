import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { lostItems, type LostItem, type LostMessage } from '@/constants/data';
import { useAuth } from '@/context/AuthContext';

type LostValue = {
  items: LostItem[];
  messages: LostMessage[];
  /** "Awa D.": how my name appears to other students. */
  me: string;
  /** Returns the new item's id. */
  declare: (item: Omit<LostItem, 'id' | 'by' | 'mine'>) => string;
  /** "C'est à moi": opens the conversation with the finder, starting with my proof. */
  claim: (itemId: string, proof: string) => void;
  /** "Je l'ai trouvé" on a lost item: opens the conversation with its owner. */
  reportFound: (itemId: string) => void;
  send: (itemId: string, text: string) => void;
  markReturned: (itemId: string) => void;
};

const LostContext = createContext<LostValue | null>(null);

// Mock store for lost and found items and their conversations, until there's a backend.
export function LostProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const me = user ? `${user.firstName} ${user.lastName.charAt(0)}.` : 'Toi';
  const [items, setItems] = useState<LostItem[]>(lostItems);
  const [messages, setMessages] = useState<LostMessage[]>([]);

  const value = useMemo<LostValue>(() => {
    const post = (itemId: string, text: string, author?: LostMessage['author']) =>
      setMessages((ms) => [...ms, { id: `lm_${Date.now()}_${ms.length}`, itemId, author, text, at: Date.now() }]);
    // Mock: the other student answers a moment later, so the conversation can be tried alone.
    const replyLater = (itemId: string, text: string) => setTimeout(() => post(itemId, text, 'them'), 1500);

    return {
      items,
      messages,
      me,
      declare: (item) => {
        const id = `o_${Date.now()}`;
        setItems((list) => [{ ...item, id, by: me, mine: true }, ...list]);
        return id;
      },
      claim: (itemId, proof) => {
        post(itemId, `${me} pense que c’est à lui ou à elle.`);
        post(itemId, `Détail pour prouver que c’est à moi : ${proof}`, 'me');
        replyLater(itemId, 'Ça correspond, merci ! Quand es-tu disponible ?');
      },
      reportFound: (itemId) => {
        post(itemId, `${me} pense avoir trouvé ton objet.`);
        post(itemId, 'Bonjour, je crois que j’ai trouvé ton objet !', 'me');
        replyLater(itemId, 'Super, merci beaucoup ! Il y a un détail pour vérifier ?');
      },
      send: (itemId, text) => post(itemId, text.trim(), 'me'),
      markReturned: (itemId) => {
        setItems((list) => list.map((i) => (i.id === itemId ? { ...i, returned: true } : i)));
        post(itemId, 'Objet rendu à son propriétaire ✓ Discussion fermée.');
      },
    };
  }, [items, messages, me]);

  return <LostContext.Provider value={value}>{children}</LostContext.Provider>;
}

export function useLost() {
  const ctx = useContext(LostContext);
  if (!ctx) throw new Error('useLost must be used inside LostProvider');
  return ctx;
}
