import { TabScreen } from '@/components/TabScreen';
import { BoursesBoard } from '@/features/campus/BoursesBoard';
import { LostBoard } from '@/features/lost/LostBoard';
import { PlacesBoard } from '@/features/places/PlacesBoard';

// Campus: places to know, lost and found, and grants.
export default function CampusScreen() {
  return (
    <TabScreen
      title="Campus"
      views={[
        { key: 'lieux', label: 'Lieux', subtitle: 'Les endroits à connaître', render: () => <PlacesBoard /> },
        { key: 'objets', label: 'Objets', subtitle: 'Perdus et trouvés sur le campus', render: () => <LostBoard /> },
        { key: 'bourses', label: 'Bourses', subtitle: 'Paiements et calendrier', render: () => <BoursesBoard /> },
      ]}
    />
  );
}
