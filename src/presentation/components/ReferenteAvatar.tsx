import { Text, View } from 'react-native';
import { readableOn } from '../../core/utils/color';

interface Props {
  iniciales: string;
  color: string;
  size: number;
}

/** Círculo de color con las iniciales: no se usan fotos reales de personas. El nombre siempre está al lado. */
export function ReferenteAvatar({ iniciales, color, size }: Props) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: readableOn(color) }}>{iniciales}</Text>
    </View>
  );
}
