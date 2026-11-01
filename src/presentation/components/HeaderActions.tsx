import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { useProfile } from '../state/ProfileProvider';
import { Avatar } from './Avatar';
import { ThemeToggle } from './ThemeToggle';

/** El botón luna/sol con la paleta cálida. `seasonal` conserva los colores de la estación (Mi Pilchapp). */
export const AppThemeToggle = memo(function AppThemeToggle({ seasonal = false }: { seasonal?: boolean }) {
  const { tokens, transition } = useOutfitsTheme();
  if (seasonal) return <ThemeToggle style={styles.toggle} />;
  return (
    <ThemeToggle
      style={styles.toggle}
      colorsStyle={[{ backgroundColor: 'transparent', borderColor: tokens.cardBorder }, transition]}
      iconColor={tokens.text}
    />
  );
});

/** Arriba a la derecha de las pantallas principales: el avatar, que lleva al Perfil, y el botón luna/sol. */
export const HeaderActions = memo(function HeaderActions({ seasonal = false }: { seasonal?: boolean }) {
  const router = useRouter();
  const { profile } = useProfile();
  const openProfile = useCallback(() => router.push('/perfil'), [router]);
  return (
    <View style={styles.row}>
      <Pressable onPress={openProfile} accessibilityRole="button" accessibilityLabel="Ver mi perfil">
        <Avatar name={profile?.displayName ?? ''} photoUri={profile?.photoUri ?? null} size={44} fontSize={16} />
      </Pressable>
      <AppThemeToggle seasonal={seasonal} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggle: { width: 44, height: 44, borderRadius: 14 },
});
