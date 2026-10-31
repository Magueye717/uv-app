import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// `useSyncExternalStore` uses `getServerSnapshot` during server rendering and
// hydration, then switches to the client snapshot, so we can use it to
// determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore<S | C>(
    subscribe,
    () => client,
    () => server
  );
}
