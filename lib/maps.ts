import { Linking, Platform } from 'react-native';

/** Walking directions in the phone's map app: Apple Plans on iOS, Google Maps elsewhere (app or browser). */
export function openDirections({ lat, lng }: { lat: number; lng: number }, label: string) {
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&q=${encodeURIComponent(label)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  Linking.openURL(url);
}
