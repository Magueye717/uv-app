import { TabScreen } from '@/components/TabScreen';
import { RestoBoard } from '@/features/food/RestoBoard';
import { RestoUBoard } from '@/features/food/RestoUBoard';

// Manger: public (university) restaurants first, the everyday meal, then private restaurants.
export default function MangerScreen() {
  return (
    <TabScreen
      title="Manger"
      views={[
        { key: 'publics', label: 'Restos publics', subtitle: 'Menus des restaurants universitaires', render: () => <RestoUBoard /> },
        { key: 'restos', label: 'Restos privés', subtitle: 'Menus du jour · commande et livraison', render: () => <RestoBoard /> },
      ]}
    />
  );
}
