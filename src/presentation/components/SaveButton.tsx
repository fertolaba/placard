import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

interface Props {
  nombre: string;
  saved: boolean;
  color: string;
  onPress: () => void;
}

/** Marcador de guardar, con área táctil de 44 px. */
export function SaveButton({ nombre, saved, color, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Quitar a ${nombre} de guardados` : `Guardar a ${nombre}`}
      accessibilityState={{ selected: saved }}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={color} />
    </Pressable>
  );
}
