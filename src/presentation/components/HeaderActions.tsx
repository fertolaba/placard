import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { useProfile } from '../state/ProfileProvider';
import { Avatar } from './Avatar';
import { ThemeToggle } from './ThemeToggle';

/** El botón luna/sol con la paleta cálida, para la pantalla Perfil. */
export const AppThemeToggle = memo(function AppThemeToggle() {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <ThemeToggle
      style={styles.toggle}
      colorsStyle={[{ backgroundColor: 'transparent', borderColor: tokens.cardBorder }, transition]}
      iconColor={tokens.text}
    />
  );
});

/** Arriba a la derecha de las pantallas principales: el avatar, que lleva al Perfil. */
export const HeaderActions = memo(function HeaderActions() {
  const router = useRouter();
  const { profile } = useProfile();
  const openProfile = useCallback(() => router.push('/perfil'), [router]);
  return (
    <Pressable onPress={openProfile} accessibilityRole="button" accessibilityLabel="Ver mi perfil">
      <Avatar name={profile?.displayName ?? ''} photoUri={profile?.photoUri ?? null} size={44} fontSize={16} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  toggle: { width: 44, height: 44, borderRadius: 14 },
});
