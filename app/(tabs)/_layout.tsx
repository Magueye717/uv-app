import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  resto: 'restaurant-outline',
  caravanes: 'bus-outline',
  lieux: 'location-outline',
  profil: 'person-outline',
};

const activeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  resto: 'restaurant',
  caravanes: 'bus',
  lieux: 'location',
  profil: 'person',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused, color }) => {
          const name = focused ? activeIcons[route.name] : icons[route.name];
          return (
            <View style={[styles.iconWrap, focused && styles.iconOn]}>
              <Ionicons name={name ?? 'ellipse-outline'} size={22} color={color} />
            </View>
          );
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarLabel: ({ focused, color }) => Label('Accueil', focused, color) }} />
      <Tabs.Screen name="resto" options={{ title: 'Resto' }} />
      <Tabs.Screen name="caravanes" options={{ title: 'Caravanes' }} />
      <Tabs.Screen name="lieux" options={{ title: 'Lieux' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

function Label(title: string, focused: boolean, color: string) {
  return <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  bar: {
    height: 88,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 0,
    backgroundColor: colors.card,
    elevation: 12,
    shadowColor: '#1E2A5A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  label: { fontSize: 11, marginTop: 2 },
  iconWrap: {
    width: 42,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOn: { backgroundColor: colors.primarySoft },
});
