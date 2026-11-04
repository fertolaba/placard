import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BodyZone, Garment } from '../../../domain/entities/Garment';
import type { StyleId } from '../../../domain/entities/StyleReference';
import { STYLE_DASH_COLORS } from '../../outfits/styleGradients';
import { Silhouette, zoneDimensions } from './GarmentSilhouettes';

/** El recorte es el único camino que guarda un PNG a propósito: lo demás se trata como foto con fondo. */
const isCutout = (photoRef: string | null) => photoRef !== null && /\.png$/i.test(photoRef);

interface ZoneProps {
  zone: BodyZone;
  garment: Garment | null;
  size: number;
  styleId?: StyleId | null; // elige la silueta punteada de la prenda faltante
  dashColor?: string; // para el contorno sobre fondos claros
}

export const ZoneGarment = memo(function ZoneGarment({ zone, garment, size, styleId, dashColor }: ZoneProps) {
  // Se guarda la dirección que falló, no un sí o no: si la prenda cambia de foto, se vuelve a intentar sola.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const uri = garment?.imageUri ?? null;

  if (!garment || uri === null || uri === failedUri) return (
      <Silhouette
        zone={zone}
        color={null}
        size={size}
        styleId={styleId}
        dashColor={dashColor ?? (styleId ? STYLE_DASH_COLORS[styleId] : undefined)}
      />
    );

  const dimensions = zoneDimensions(zone, size);
  const image = (
    <Image
      // En la nube la dirección firmada cambia a diario: con la referencia, la caché sigue sirviendo.
      source={{ uri, cacheKey: garment.photoRef ?? garment.id }}
      style={isCutout(garment.photoRef) ? dimensions : styles.cardPhoto}
      contentFit="contain"
      transition={150}
      cachePolicy="memory-disk"
      recyclingKey={garment.id}
      accessibilityElementsHidden
      onError={() => setFailedUri(uri)}
    />
  );
  if (isCutout(garment.photoRef)) return image;
  // La sombra va en una vista aparte y con fondo: sin fondo, Android no la dibuja y "contain" dejaría bandas vacías.
  return <View style={[styles.card, dimensions]}>{image}</View>;
});

interface Props {
  garments: Record<BodyZone, Garment | null>; // null = no hay prenda de ese tipo: va solo el contorno punteado
  size?: number;
  styleId?: StyleId | null; // el estilo en el que se muestra el look; sin él, siluetas genéricas
}

/** Fotos de las prendas de un look, apoyadas sobre la misma línea que las siluetas a las que reemplazan. */
export const StyleGarmentsRow = memo(function StyleGarmentsRow({ garments, size = 1, styleId }: Props) {
  return (
    <View
      style={[styles.row, { gap: 6 * size }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <ZoneGarment zone="torso" garment={garments.torso} size={size} styleId={styleId} />
      <ZoneGarment zone="piernas" garment={garments.piernas} size={size} styleId={styleId} />
      <ZoneGarment zone="pies" garment={garments.pies} size={size} styleId={styleId} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  card: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardPhoto: { flex: 1, borderRadius: 10 },
});
