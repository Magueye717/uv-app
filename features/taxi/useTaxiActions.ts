import { Alert } from 'react-native';

import { formatFcfa, TAXI_LOCK_MIN, TAXI_STRIKES_LIMIT, taxiSeatPrice, type TaxiTrip } from '@/constants/data';
import { useTaxi } from '@/context/TaxiContext';

/** Sunu Taxi actions with their confirmations, shared by the trip list and the trip screen. */
export function useTaxiActions() {
  const taxi = useTaxi();
  const { me, strikes } = taxi;
  const suspended = strikes >= TAXI_STRIKES_LIMIT;

  const join = (t: TaxiTrip) => {
    const price = formatFcfa(taxiSeatPrice(t));
    const pay = (method: string) => {
      taxi.join(t.id);
      Alert.alert('Place réservée', `Valide ${price} sur ${method}. Remboursé si tu quittes plus de ${TAXI_LOCK_MIN} min avant le départ.`);
    };
    Alert.alert(`Payer ta place · ${price}`, `Ton argent est bloqué jusqu’au départ. Places verrouillées ${TAXI_LOCK_MIN} min avant.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Wave', onPress: () => pay('Wave') },
      { text: 'Orange Money', onPress: () => pay('Orange Money') },
    ]);
  };

  const leave = (t: TaxiTrip, locked: boolean) =>
    Alert.alert(
      'Quitter le trajet ?',
      locked
        ? `Moins de ${TAXI_LOCK_MIN} min avant le départ : ta place (${formatFcfa(taxiSeatPrice(t))}) n’est pas remboursée, elle sert à payer le taxi.`
        : `Tu es remboursé de ${formatFcfa(taxiSeatPrice(t))}.`,
      [
        { text: 'Rester', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => taxi.leave(t.id),
        },
      ],
    );

  const cancel = (t: TaxiTrip, locked: boolean) => {
    const others = t.passengers.length - 1;
    if (others === 0) {
      Alert.alert('Annuler le trajet ?', 'Personne ne t’a encore rejoint.', [
        { text: 'Garder le trajet', style: 'cancel' },
        { text: 'Annuler le trajet', style: 'destructive', onPress: () => taxi.cancel(t.id, false) },
      ]);
      return;
    }
    // Students are counting on this trip: handing it over comes first, so nobody is left without a taxi.
    const next = taxi.nameOf(t.passengers[1]);
    const late = locked;
    Alert.alert(
      'Tu ne peux plus partir ?',
      `Passe le relais : ${next}, premier inscrit, organise le trajet à ta place. Pas de pénalité.\n\n` +
        `Ou annule : les ${others} étudiant${others > 1 ? 's' : ''} inscrit${others > 1 ? 's' : ''} ${others > 1 ? 'sont remboursés' : 'est remboursé'} à 100 %.` +
        (late ? ` Annulation tardive : ${strikes + 1}/${TAXI_STRIKES_LIMIT}. À ${TAXI_STRIKES_LIMIT}, Sunu Taxi est suspendu 7 jours.` : ''),
      [
        { text: 'Garder le trajet', style: 'cancel' },
        { text: `Passer le relais à ${next}`, onPress: () => taxi.handOver(t.id) },
        { text: 'Annuler le trajet', style: 'destructive', onPress: () => taxi.cancel(t.id, late) },
      ],
    );
  };

  // One trip at a time, organized or joined: no seats held "just in case" in two taxis.
  const current = taxi.activeTrip();
  const busy = () =>
    Alert.alert(
      'Tu as déjà un trajet',
      `Tu es inscrit sur ${current?.from.split(' · ').pop()} → ${current?.to.split(' · ').pop()}. Quitte-le ou attends le départ pour en proposer ou en rejoindre un autre.`,
    );


  const depart = (t: TaxiTrip) => {
    const paid = (t.passengers.length - 1) * taxiSeatPrice(t);
    const missing = t.passengers.filter((p) => !t.checkedIn.includes(p) && p !== me).length;
    Alert.alert(
      'Vous êtes partis ?',
      `${formatFcfa(paid)} versés sur ton compte pour payer le taxi.` +
        (missing ? `\n${missing} absent${missing > 1 ? 's' : ''} : ${missing > 1 ? 'leurs places restent payées' : 'sa place reste payée'}.` : ''),
      [
        { text: 'Pas encore', style: 'cancel' },
        { text: 'On est partis', onPress: () => taxi.depart(t.id) },
      ],
    );
  };

  return { join, leave, cancel, busy, depart, current, suspended };
}
