import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useTheme } from '../../presentation/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

// La barra pasa el color como ColorValue y los íconos esperan texto: los colores de la paleta siempre son texto.
const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.link,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.swatchBorder },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pilchapp',
          tabBarIcon: tabIcon('shirt-outline'),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: tabIcon('sparkles-outline'),
        }}
      />
      <Tabs.Screen
        name="inspiracion"
        options={{
          title: 'Inspiración',
          tabBarIcon: tabIcon('star-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: tabIcon('person-outline'),
        }}
      />
    </Tabs>
  );
}