import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CATEGORY_ZONE } from '../../domain/entities/Garment';
import type { Referente } from '../../domain/entities/Referente';

const WIDTH = 120;
const HEIGHT = 180;

/** Remera y pantalón con los colores del look del referente. */
export function LookIllustration({ referente, height }: { referente: Referente; height: number }) {
  const { prendasClave, paleta, nombre } = referente;
  const remera = prendasClave.find((prenda) => CATEGORY_ZONE[prenda.categoria] === 'torso')?.colorHex ?? paleta[0];
  const pantalon = prendasClave.find((prenda) => CATEGORY_ZONE[prenda.categoria] === 'piernas')?.colorHex ?? paleta[1];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Ilustración del look de ${nombre}: remera y pantalón`}>
      <Svg width={(height * WIDTH) / HEIGHT} height={height} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Path d="M42 10 L24 18 L6 40 L20 52 L30 42 L30 92 L90 92 L90 42 L100 52 L114 40 L96 18 L78 10 Q60 22 42 10 Z" fill={remera} />
        <Path d="M32 96 L88 96 L94 176 L68 176 L60 122 L52 176 L26 176 Z" fill={pantalon} />
      </Svg>
    </View>
  );
}
