import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHOTO_VIEWER_BACKGROUND } from '../../core/theme/palettes';
import { makeStyles } from '../theme/makeStyles';
import { getReferenteImages } from './referenteImages';

const LOOK_WIDTH = 220;
const LOOK_HEIGHT = 290;
const LOOK_GAP = 12;
const LOOK_INTERVAL = LOOK_WIDTH + LOOK_GAP;

interface Props {
  referenteId: string;
  nombre: string;
  sidePadding: number; // el carrusel llega hasta los bordes de la pantalla
}

/** Carrusel de looks con vista a pantalla completa. Si el referente no tiene looks, no se muestra. */
export function ReferenteLooks({ referenteId, nombre, sidePadding }: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { looks } = getReferenteImages(referenteId);
  const [openLook, setOpenLook] = useState<number | null>(null);

  const renderLook = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <Pressable
        onPress={() => setOpenLook(item)}
        accessibilityRole="imagebutton"
        accessibilityLabel={`Ver el look ${index + 1} de ${nombre} a pantalla completa`}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Image
          source={item}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${referenteId}-${index}`}
          transition={150}
          style={styles.look}
        />
      </Pressable>
    ),
    [referenteId, nombre, styles],
  );

  if (looks.length === 0) return null;

  return (
    <>
      <Text style={styles.title} accessibilityRole="header">
        Looks
      </Text>
      <FlatList
        horizontal
        data={looks}
        keyExtractor={(_, index) => `${referenteId}-${index}`}
        renderItem={renderLook}
        ItemSeparatorComponent={LookGap}
        getItemLayout={(_, index) => ({ length: LOOK_WIDTH, offset: sidePadding + LOOK_INTERVAL * index, index })}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        showsHorizontalScrollIndicator={false}
        snapToInterval={LOOK_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        style={{ marginHorizontal: -sidePadding }}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
      />

      <Modal visible={openLook !== null} animationType="fade" onRequestClose={() => setOpenLook(null)}>
        <View style={fullScreen.screen}>
          {openLook !== null && (
            <Image
              source={openLook}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={150}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Pressable
            onPress={() => setOpenLook(null)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar foto"
            style={({ pressed }) => [fullScreen.close, { top: insets.top + 8 }, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

function LookGap() {
  return <View style={{ width: LOOK_GAP }} />;
}

const useStyles = makeStyles((colors) => ({
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10 },
  look: { width: LOOK_WIDTH, height: LOOK_HEIGHT, borderRadius: 16, backgroundColor: colors.surface },
  pressed: { opacity: 0.7 },
}));

// El visor es oscuro en modo claro y oscuro: no depende del tema.
const fullScreen = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PHOTO_VIEWER_BACKGROUND },
  close: {
    position: 'absolute',
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
