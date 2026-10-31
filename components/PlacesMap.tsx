import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Place } from '@/constants/data';
import { radii } from '@/constants/theme';

// Whole UGB campus on first load.
const CAMPUS = { latitude: 16.0607, longitude: -16.4245, latitudeDelta: 0.012, longitudeDelta: 0.012 };
const PADDING = { top: 50, right: 40, bottom: 30, left: 40 };

/** Real map with one pin per place; tapping a pin's bubble opens the place. Native only (see PlacesMap.web.tsx). */
export function PlacesMap({ places, onOpen }: { places: Place[]; onOpen: (id: string) => void }) {
  const ref = useRef<MapView>(null);
  // Refit only when the set of places changes, not on every render.
  const ids = places.map((p) => p.id).join(',');

  useEffect(() => {
    const map = ref.current;
    if (!map || !places.length) return;
    if (places.length === 1) {
      const { lat, lng } = places[0].coords;
      map.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.004, longitudeDelta: 0.004 }, 400);
    } else {
      map.fitToCoordinates(
        places.map((p) => ({ latitude: p.coords.lat, longitude: p.coords.lng })),
        { edgePadding: PADDING, animated: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the ids on purpose
  }, [ids]);

  return (
    <MapView ref={ref} style={styles.map} initialRegion={CAMPUS} showsPointsOfInterests={false} toolbarEnabled={false}>
      {places.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.coords.lat, longitude: p.coords.lng }}
          title={p.name}
          description={`${p.category} · ${p.area}`}
          pinColor={p.tint}
          onCalloutPress={() => onOpen(p.id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 220, borderRadius: radii.lg, overflow: 'hidden' },
});
