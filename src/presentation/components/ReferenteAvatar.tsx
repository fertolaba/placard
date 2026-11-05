import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { readableOn } from '../../core/utils/color';
import { contentPositionOf, getReferenteImages } from './referenteImages';

interface Props {
  referenteId: string;
  iniciales: string;
  color: string;
  size: number;
}

/** La foto de portada en círculo; si no tiene, círculo de color con las iniciales. El nombre siempre está al lado. */
export function ReferenteAvatar({ referenteId, iniciales, color, size }: Props) {
  const { avatar } = getReferenteImages(referenteId);
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
        overflow: 'hidden',
      }}
    >
      {avatar !== undefined ? (
        <Image
          source={avatar.source}
          contentFit="cover"
          contentPosition={contentPositionOf(avatar)}
          cachePolicy="memory-disk"
          recyclingKey={referenteId}
          style={{ width: size, height: size }}
        />
      ) : (
        <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: readableOn(color) }}>{iniciales}</Text>
      )}
    </View>
  );
}
