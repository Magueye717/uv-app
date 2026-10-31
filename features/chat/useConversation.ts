import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api';
import { chatApi, newClientMessageId, type ChatIdentity, type ConversationDto, type MessageDto } from './api';
import { useChats } from './ChatContext';
import { realtime } from './realtime';

/** A message on screen. `pending`: sent from this phone, not confirmed by the server yet (or failed). */
export type ChatMessage = {
  id: string;
  kind: MessageDto['kind'];
  body: string;
  author: ChatIdentity | null;
  at: number;
  clientMessageId: string | null;
  pending?: 'sending' | 'failed';
};

const toMessage = (m: MessageDto): ChatMessage => ({
  id: m.id,
  kind: m.kind,
  body: m.body,
  author: m.author,
  at: Date.parse(m.createdAt),
  clientMessageId: m.clientMessageId,
});

/** Adds server messages, replacing my pending copies (same clientMessageId) and skipping ones already shown. */
function merge(list: ChatMessage[], incoming: ChatMessage[]) {
  let next = list;
  for (const m of incoming) {
    if (next.some((x) => x.id === m.id)) continue;
    const local = m.clientMessageId ? next.findIndex((x) => x.pending && x.clientMessageId === m.clientMessageId) : -1;
    next = local >= 0 ? next.map((x, i) => (i === local ? m : x)) : [...next, m];
  }
  return next.sort((a, b) => Number(!!a.pending) - Number(!!b.pending) || a.at - b.at);
}

/**
 * One conversation, for any feature's chat screen: history, live messages, sending with retry, read marker,
 * report and block. Who may read or write is decided by the server (the owning feature sets the members).
 */
export function useConversation(conversationId: string | null | undefined) {
  const chats = useChats();
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(!!conversationId);
  const [error, setError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(false);
  const blocked = useRef<string[]>([]);
  const lastRead = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const visible = (m: ChatMessage) => !m.author || !blocked.current.includes(m.author.key);

  const reloadConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      const conv = await chatApi.get(conversationId);
      blocked.current = conv.blockedKeys;
      setConversation(conv);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setRevoked(true);
    }
  }, [conversationId]);

  /** What arrived while the socket was down (offline, background). */
  const catchUp = useCallback(async () => {
    if (!conversationId) return;
    const last = [...messagesRef.current].reverse().find((m) => !m.pending);
    try {
      const page = await chatApi.messages(conversationId, last ? { after: last.id } : {});
      setMessages((list) => merge(list, page.items.map(toMessage).filter(visible)));
    } catch {
      // Next reconnection will try again.
    }
    reloadConversation();
  }, [conversationId, reloadConversation]);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setLoading(true);
    setRevoked(false);
    (async () => {
      try {
        const [conv, page] = await Promise.all([chatApi.get(conversationId), chatApi.messages(conversationId)]);
        if (cancelled) return;
        blocked.current = conv.blockedKeys;
        setConversation(conv);
        setMessages(page.items.map(toMessage));
        setHasMore(page.hasMore);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setRevoked(true);
        else setError(err instanceof ApiError ? err.message : 'Impossible de charger la discussion.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const off = realtime.subscribe(`conversation:${conversationId}`, (event, data) => {
      if (event === 'message.created') {
        const m = toMessage(data.message as MessageDto);
        if (visible(m)) setMessages((list) => merge(list, [m]));
      } else if (event === 'conversation.updated') reloadConversation();
      else if (event === 'access.revoked') setRevoked(true);
    });
    const offReconnect = realtime.onReconnect(catchUp);
    return () => {
      cancelled = true;
      off();
      offReconnect();
    };
  }, [conversationId, reloadConversation, catchUp]);

  /** Marks the newest message read (call while the screen is shown). */
  const markRead = useCallback(() => {
    const newest = [...messages].reverse().find((m) => !m.pending);
    if (!conversationId || !newest || newest.id === lastRead.current) return;
    lastRead.current = newest.id;
    chats.markSeen(conversationId);
    chatApi.read(conversationId, newest.id).catch(() => {
      lastRead.current = null;
    });
  }, [conversationId, messages, chats]);

  const post = useCallback(
    async (m: ChatMessage) => {
      if (!conversationId) return;
      try {
        const saved = toMessage(await chatApi.send(conversationId, { body: m.body, kind: m.kind === 'quick_reply' ? 'quick_reply' : 'text', clientMessageId: m.clientMessageId! }));
        setMessages((list) => merge(list, [saved]));
      } catch (err) {
        setMessages((list) => list.map((x) => (x.clientMessageId === m.clientMessageId ? { ...x, pending: 'failed' } : x)));
        // Read-only now (trip over, left…): the screen updates its composer.
        if (err instanceof ApiError && err.code === 'CHAT_READ_ONLY') reloadConversation();
        else if (err instanceof ApiError && err.status === 404) setRevoked(true);
      }
    },
    [conversationId, reloadConversation],
  );

  /** Shown at once, confirmed by the server; a failed message can be sent again with `retry`. */
  const send = useCallback(
    (body: string, kind: 'text' | 'quick_reply' = 'text') => {
      const text = body.trim();
      if (!text || !conversation) return;
      const m: ChatMessage = { id: `local-${newClientMessageId()}`, kind, body: text, author: conversation.me, at: Date.now(), clientMessageId: newClientMessageId(), pending: 'sending' };
      setMessages((list) => [...list, m]);
      post(m);
    },
    [conversation, post],
  );

  const retry = useCallback(
    (m: ChatMessage) => {
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, pending: 'sending' } : x)));
      post({ ...m, pending: 'sending' });
    },
    [post],
  );

  const loadOlder = useCallback(async () => {
    const oldest = messages.find((m) => !m.pending);
    if (!conversationId || !oldest || !hasMore) return;
    const page = await chatApi.messages(conversationId, { before: oldest.id });
    setMessages((list) => merge(list, page.items.map(toMessage)));
    setHasMore(page.hasMore);
  }, [conversationId, messages, hasMore]);

  const report = useCallback((m: ChatMessage) => (conversationId ? chatApi.report(conversationId, m.id) : Promise.resolve()), [conversationId]);

  /** Hides this person everywhere, now (here) and for good (server). */
  const blockAuthor = useCallback(
    async (m: ChatMessage) => {
      if (!conversationId || !m.author) return;
      await chatApi.blockAuthor(conversationId, m.id);
      const key = m.author.key;
      blocked.current = [...blocked.current, key];
      setMessages((list) => list.filter((x) => x.author?.key !== key));
    },
    [conversationId],
  );

  return { conversation, messages, hasMore, loading, error, revoked, me: conversation?.me.key ?? null, send, retry, markRead, loadOlder, report, blockAuthor };
}
