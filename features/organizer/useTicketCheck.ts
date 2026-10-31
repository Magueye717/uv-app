import { caravans as allCaravans, type Caravan, type Passenger } from '@/constants/data';
import { useBoarding, useManifests } from './boarding';

export type ScanResult = {
  tone: 'success' | 'warning' | 'danger';
  title: string;
  text: string;
  /** The departure the ticket belongs to, to open its list. */
  caravanId?: string;
};

/**
 * Checks a scanned QR (UGB-CARAVANE:<ticket>:<caravan>:<seat>:<pickup>) or a typed ticket code
 * against the given departures, and boards the passenger when it's valid.
 * Mock: the real QR is signed by the server and checked offline with its public key.
 */
export function useTicketCheck(caravans: Caravan[]) {
  const manifests = useManifests(caravans);
  const { boarded, left, board } = useBoarding();

  return (raw: string): ScanResult => {
    const parts = raw.trim().split(':');
    const isQr = parts[0] === 'UGB-CARAVANE';
    if (parts.length > 1 && !isQr) {
      return { tone: 'danger', title: 'Pas un billet UGB Campus', text: 'Ce QR code ne vient pas de l’app. Le passager ne monte pas.' };
    }
    const code = (isQr ? parts[1] : parts[0]).toUpperCase();

    if (isQr && !caravans.some((c) => c.id === parts[2])) {
      const other = allCaravans.find((c) => c.id === parts[2]);
      return other
        ? {
            tone: 'danger',
            title: 'Autre départ',
            text: `Ce billet est pour ${other.organizer.name}, ${other.from} → ${other.to} du ${other.date}. Le passager ne monte pas.`,
          }
        : { tone: 'danger', title: 'Billet non valable', text: 'Départ inconnu : billet faux ou trop ancien.' };
    }

    let found: { c: Caravan; p: Passenger } | undefined;
    for (const c of caravans) {
      const p = manifests.get(c.id)?.find((x) => x.ticket === code);
      if (p) found = { c, p };
    }
    if (!found) {
      return { tone: 'danger', title: 'Billet non valable', text: `${code || 'Ce code'} n’est pas sur la liste : billet annulé, faux ou mal saisi.` };
    }

    const { c, p } = found;
    if (boarded[c.id]?.includes(p.ticket)) {
      return {
        tone: 'warning',
        title: 'Déjà à bord',
        text: `${p.name} est déjà monté(e) · place ${p.seat}. Vérifie qu’il n’y a pas deux personnes avec ce billet.`,
        caravanId: c.id,
      };
    }
    board(c.id, p.ticket);
    // Where the bus is now: the first pickup point it hasn't left.
    const here = c.pickups.find((s) => !left[c.id]?.includes(s.place));
    const elsewhere = here && here.place !== p.pickup.place;
    return {
      tone: elsewhere ? 'warning' : 'success',
      title: `${p.name} · place ${p.seat}`,
      text: elsewhere
        ? `Monte à ${here.place} au lieu de ${p.pickup.place}. Descend à ${p.dropoff.place}.`
        : `Descend à ${p.dropoff.place}. Vérifie le nom sur sa carte étudiant.`,
      caravanId: c.id,
    };
  };
}
