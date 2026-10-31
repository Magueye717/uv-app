import { API_URL, session } from '@/lib/api';

/** What the server pushes on a topic. */
export type RealtimeHandler = (event: string, data: Record<string, unknown>) => void;

/** The server closes with this when the token is missing or expired: refresh it and reconnect. */
const UNAUTHORIZED = 4401;
const MAX_BACKOFF_MS = 30_000;

/**
 * One WebSocket for the whole app (server → app only; sending goes through REST). Reconnects with backoff,
 * re-authenticates, re-subscribes, and tells listeners so they can fetch what they missed: delivery over the
 * socket is best effort, the REST API is the source of truth.
 */
class RealtimeClient {
  private ws: WebSocket | null = null;
  private ready = false;
  /** Connected at least once: any later "ready" means messages may have been missed (offline, background). */
  private everReady = false;
  private enabled = false;
  private retry = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly topics = new Map<string, Set<RealtimeHandler>>();
  private readonly mine = new Set<RealtimeHandler>();
  private readonly reconnected = new Set<() => void>();

  /** Signed in and in the foreground. */
  start() {
    if (this.enabled) return;
    this.enabled = true;
    this.connect();
  }

  /** Signed out or in the background: the server is told nothing more, the socket just closes. */
  stop() {
    this.enabled = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.ws?.close();
    this.ws = null;
    this.ready = false;
  }

  /** Events of one topic (`conversation:<id>`). Returns the unsubscribe. */
  subscribe(topic: string, handler: RealtimeHandler) {
    let set = this.topics.get(topic);
    if (!set) {
      set = new Set();
      this.topics.set(topic, set);
      this.frame({ type: 'sub', topic });
    }
    set.add(handler);
    return () => {
      const current = this.topics.get(topic);
      if (!current?.delete(handler) || current.size) return;
      this.topics.delete(topic);
      this.frame({ type: 'unsub', topic });
    };
  }

  /** My own channel (`user:<me>`): badges and other "something changed for you" events. */
  onMine(handler: RealtimeHandler) {
    this.mine.add(handler);
    return () => void this.mine.delete(handler);
  }

  /** Called after every reconnection: time to fetch what was missed. */
  onReconnect(handler: () => void) {
    this.reconnected.add(handler);
    return () => void this.reconnected.delete(handler);
  }

  private frame(msg: object) {
    if (this.ready && this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  private connect() {
    if (!this.enabled || this.ws) return;
    const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws`);
    this.ws = ws;
    ws.onopen = async () => {
      const token = await session.accessToken().catch(() => null);
      if (!token) return ws.close();
      ws.send(JSON.stringify({ type: 'auth', accessToken: token }));
    };
    ws.onmessage = (e) => {
      let f: { type?: string; topic?: string; event?: string; data?: Record<string, unknown>; reason?: string };
      try {
        f = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (f.type === 'ready') {
        const first = !this.everReady;
        this.everReady = true;
        this.ready = true;
        this.retry = 0;
        for (const topic of this.topics.keys()) ws.send(JSON.stringify({ type: 'sub', topic }));
        if (!first) for (const h of this.reconnected) h();
        return;
      }
      if (f.type === 'event' && f.topic && f.event) {
        const handlers = f.topic.startsWith('user:') ? this.mine : this.topics.get(f.topic);
        for (const h of handlers ?? []) h(f.event, f.data ?? {});
        return;
      }
      // Lost access (left the trip…): the screen shows it.
      if (f.type === 'unsubscribed' && f.reason === 'revoked' && f.topic) {
        for (const h of this.topics.get(f.topic) ?? []) h('access.revoked', {});
      }
    };
    ws.onclose = async (e) => {
      if (this.ws === ws) this.ws = null;
      this.ready = false;
      if (!this.enabled) return;
      if (e.code === UNAUTHORIZED && !(await session.refresh().catch(() => true))) return this.stop();
      const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** this.retry) * (0.75 + Math.random() / 2);
      this.retry++;
      this.timer = setTimeout(() => {
        this.timer = null;
        this.connect();
      }, delay);
    };
  }
}

export const realtime = new RealtimeClient();
