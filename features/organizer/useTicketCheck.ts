import { useAuth } from '@/context/AuthContext';
import { caravansApi, newScanId } from '@/features/caravans/api';
import { checkOffline } from '@/features/organizer/offline';
import { ApiError } from '@/lib/api';

export type ScanResult = {
  tone: 'success' | 'warning' | 'danger';
  title: string;
  text: string;
  /** The departure the ticket belongs to, to open its list. */
  caravanId?: string;
};

/**
 * Checks a scanned QR code or a typed ticket code on the server, which boards the passenger when it's valid.
 * The QR is signed by the server: a screenshot of a transferred or cancelled ticket is refused.
 * `departureId`: the list the scanner was opened from (a ticket for another departure is refused).
 */
export function useTicketCheck(departureId?: string) {
  const { organizer } = useAuth();

  return async (raw: string): Promise<ScanResult> => {
    const value = raw.trim();
    if (!organizer?.orgId) return { tone: 'danger', title: 'Pas d’organisation', text: 'Ce compte ne gère aucun départ.' };
    // Signed QR payloads have three dot-separated parts; anything short is a typed code.
    const isQr = value.split('.').length === 3;
    try {
      const r = await caravansApi.scan(organizer.orgId, {
        ...(isQr ? { qr: value } : { code: value }),
        ...(departureId ? { eventId: departureId } : {}),
        clientScanId: newScanId(),
      });
      return { tone: r.tone, title: r.title, text: r.text, caravanId: r.eventId ?? undefined };
    } catch (err) {
      // No network on the road: the phone checks the QR itself with the list it keeps.
      if (err instanceof ApiError && err.isNetwork) return checkOffline(value, organizer.orgId, departureId);
      return {
        tone: 'danger',
        title: err instanceof ApiError && err.isNetwork ? 'Pas de connexion' : 'Vérification impossible',
        text: err instanceof ApiError ? err.message : 'Réessaie dans un instant.',
      };
    }
  };
}
