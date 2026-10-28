import { Image, type ImageProps } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { hideFrames, watchFrames } from './mascotFrames';

export type MascotFocus = 'email' | 'password' | 'none';

const HIDE_FRAME_MS = 50;
// Ancho aproximado de una letra del email, en px. Si la mirada se adelanta al texto, subilo; si se atrasa, bajalo.
const CHAR_WIDTH = 8;

/**
 * Cuadro que mira el email: avanza con lo que ocupa el texto dentro del campo, hasta el último.
 * El primer cuadro mira al frente, así que con el campo enfocado se arranca del segundo (ya mirando hacia abajo).
 */
function watchFrameIndex(emailLength: number, fieldWidth: number): number {
  if (fieldWidth <= 0) return 1; // todavía no se midió el campo
  const index = 1 + Math.floor(((emailLength * CHAR_WIDTH) / fieldWidth) * (watchFrames.length - 1));
  return Math.min(index, watchFrames.length - 1);
}

interface Props {
  focus: MascotFocus;
  emailLength: number;
  fieldWidth: number; // ancho donde se escribe el email, medido con onLayout
  size?: number;
}

/** Mascota del login: sigue el email con la mirada y se tapa los ojos en la contraseña. */
export function MascotAvatar({ focus, emailLength, fieldWidth, size = 130 }: Props) {
  const styles = useStyles();
  const [hideFrame, setHideFrame] = useState(0);

  useEffect(() => {
    if (focus !== 'password') return;
    const timers = hideFrames.map((_, index) => setTimeout(() => setHideFrame(index), index * HIDE_FRAME_MS));
    // Al cambiar de campo o desmontar, la animación se corta y la próxima arranca del primer cuadro.
    return () => {
      timers.forEach(clearTimeout);
      setHideFrame(0);
    };
  }, [focus]);

  let source: ImageProps['source'];
  if (focus === 'password') source = hideFrames[hideFrame];
  else if (focus === 'email') source = watchFrames[watchFrameIndex(emailLength, fieldWidth)];
  else source = watchFrames[0];

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]} accessible={false}>
      <Image source={source} style={{ width: size, height: size }} contentFit="cover" transition={null} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  circle: { backgroundColor: colors.primaryFill, overflow: 'hidden' },
}));
