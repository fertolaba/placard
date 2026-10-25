import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { readableOn } from '../../core/utils/color';
import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { makeStyles } from '../theme/makeStyles';

const ICONS: Record<GarmentCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  arriba: 'tshirt-crew-outline',
  top: 'tshirt-v-outline',
  abajo: 'hanger',
  pollera: 'hanger', // no hay ícono de pollera
  calzado: 'shoe-sneaker',
};

interface Props {
  garment: Garment;
  height: number;
  iconSize?: number;
}

/** Foto de la prenda; si no tiene, un bloque de su color con el ícono de su categoría. */
export function GarmentSwatch({ garment, height, iconSize = 40 }: Props) {
  const styles = useStyles();
  return (
    <View style={[styles.swatch, { backgroundColor: garment.colorHex, height }]}>
      {garment.imageUri ? (
        <Image
          source={{ uri: garment.imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel={garment.name}
        />
      ) : (
        <MaterialCommunityIcons name={ICONS[garment.category]} size={iconSize} color={readableOn(garment.colorHex)} />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  swatch: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.swatchBorder,
  },
}));