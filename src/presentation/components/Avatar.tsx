import { Image, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

function initials(name: string): string {
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
  size?: number;
}

/** Foto de perfil en círculo; si no hay foto, las iniciales del nombre. */
export function Avatar({ name, photoUri, size = 84 }: Props) {
  const styles = useStyles();
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessible
      accessibilityLabel={photoUri ? 'Foto de perfil' : `Avatar de ${name}`}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  circle: { backgroundColor: colors.primaryFill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { fontWeight: '700', color: colors.link },
}));