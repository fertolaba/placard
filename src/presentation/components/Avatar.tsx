import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { GradientFill } from './outfits/GradientFill';

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return letters === '' ? '?' : letters;
}

interface Props {
  name: string;
  photoUri: string | null;
  size: number;
  fontSize: number;
}

/** Foto de perfil en círculo; si no hay foto, las iniciales sobre el degradé. La etiqueta accesible la pone quien lo envuelve. */
export const Avatar = memo(function Avatar({ name, photoUri, size, fontSize }: Props) {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <Animated.View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderColor: tokens.avatarBorder }, transition]}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : (
        <>
          <GradientFill from="#D9482B" to="#F4A259" />
          <Text style={[styles.initials, { fontSize }]} maxFontSizeMultiplier={1}>
            {initials(name)}
          </Text>
        </>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  circle: { borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { fontWeight: '700', color: '#2B1810' },
});
