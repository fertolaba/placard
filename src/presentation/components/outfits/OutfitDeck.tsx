import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { readableOn } from '../../../core/utils/color';
import { CATEGORY_ZONE, type Garment } from '../../../domain/entities/Garment';
import type { Outfit } from '../../../domain/entities/Outfit';
import { paletteDots } from '../../../domain/services/outfitPalette';
import { deckGradient, hexToRgba, paletteLabel } from '../../outfits/deckAppearance';
import { PAPER, useOutfitsTheme } from '../../outfits/outfitsTheme';
import { PressableScale } from '../PressableScale';
import { Silhouette } from './GarmentSilhouettes';
import { GradientFill } from './GradientFill';

const MAX_PALETTE_DOTS = 5; // tres prendas y hasta dos acentos de sus detalles

export type DeckDecision = 'save' | 'skip';

const CARD_WIDTH = 310;
const CARD_HEIGHT = 372;
const SHOE_EXTRA = 30; // con calzado, la zona del degradé pasa de 232 a 262
const VISIBLE_CARDS = 3;
const Y_STEP = 14;
const STACK_PEEK = (VISIBLE_CARDS - 1) * Y_STEP; // lo que asoman por debajo las cartas de atrás
const SCALE_STEP = 0.06;
const MAX_ROTATION = 18;
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 800;
const EXIT_X = 620;
const EXIT_MS = 360;
const ADVANCE_MS = 240;

const shoeOf = (outfit: Outfit) => outfit.garments.find((garment) => CATEGORY_ZONE[garment.category] === 'pies') ?? null;
const cardHeight = (outfit: Outfit) => CARD_HEIGHT + (shoeOf(outfit) ? SHOE_EXTRA : 0);

const CardPhoto = memo(function CardPhoto({
  garment,
  side,
  compact,
}: {
  garment: Garment;
  side: 'left' | 'right';
  compact: boolean; // con calzado debajo, las dos fotos van más chicas y más arriba
}) {
  // Con foto no se pinta fondo: detrás de un recorte transparente tiene que verse el fondo de la carta.
  const backgroundColor = garment.imageUri ? 'transparent' : garment.colorHex;
  const position = compact
    ? side === 'left'
      ? styles.photoLeftCompact
      : styles.photoRightCompact
    : side === 'left'
      ? styles.photoLeft
      : styles.photoRight;
  return (
    <View style={[styles.photo, compact && styles.photoCompact, position, { backgroundColor }]}>
      {garment.imageUri ? (
        <Image source={{ uri: garment.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={garment.id} />
      ) : (
        <Ionicons name="shirt-outline" size={44} color="rgba(255,255,255,0.85)" />
      )}
    </View>
  );
});

/** Cuadro ancho del calzado: la foto entera (contain) o, sin foto, la silueta punteada de calzado. */
const ShoePhoto = memo(function ShoePhoto({ garment }: { garment: Garment }) {
  const backgroundColor = garment.imageUri ? 'transparent' : garment.colorHex;
  return (
    <View style={[styles.shoe, { backgroundColor }]}>
      {garment.imageUri ? (
        <Image source={{ uri: garment.imageUri }} style={StyleSheet.absoluteFill} contentFit="contain" recyclingKey={garment.id} />
      ) : (
        <Silhouette zone="pies" color={null} size={1.4} dashColor={readableOn(garment.colorHex)} />
      )}
    </View>
  );
});

const CardFace = memo(function CardFace({ outfit }: { outfit: Outfit }) {
  const { bg1, bg2 } = deckGradient(outfit);
  const shoe = shoeOf(outfit);
  const [first, second] = outfit.garments.filter((garment) => garment !== shoe);
  const compact = shoe !== null;
  return (
    <View style={styles.face}>
      <View style={[styles.faceTop, compact && styles.faceTopWithShoe]}>
        <GradientFill from={bg1} to={bg2} />
        {first ? <CardPhoto garment={first} side="left" compact={compact} /> : null}
        {second ? <CardPhoto garment={second} side="right" compact={compact} /> : null}
        <View style={[styles.plus, compact && styles.plusCompact]}>
          <Ionicons name="add" size={20} color={PAPER.heart} />
        </View>
        {shoe ? (
          <>
            <ShoePhoto garment={shoe} />
            <View style={[styles.plus, styles.plusShoe]}>
              <Ionicons name="add" size={16} color={PAPER.heart} />
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.faceBottom}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {outfit.title}
          </Text>
          <View style={styles.matchPill}>
            <Text style={styles.matchLabel} maxFontSizeMultiplier={1.2}>
              {outfit.matchPercent}% match
            </Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2} maxFontSizeMultiplier={1.2}>
          {outfit.description}
        </Text>
        <View style={styles.paletteRow}>
          {/* El principal de cada prenda y sus secundarios vivos: lo mismo que se evalúa en el color del look. */}
          {paletteDots(outfit.garments)
            .slice(0, MAX_PALETTE_DOTS)
            .map((color, index) => (
              <View key={`${color.hex}-${index}`} style={[styles.paletteDot, { backgroundColor: color.hex }]} />
            ))}
          <Text style={styles.paletteLabel} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {outfit.sharedStyle ? `${paletteLabel(outfit)} · ${outfit.sharedStyle}` : paletteLabel(outfit)}
          </Text>
        </View>
      </View>
    </View>
  );
});

interface SlotHandle {
  fly: (direction: 1 | -1) => void;
}

interface SlotProps {
  outfit: Outfit;
  position: number; // 0 = la carta de arriba
  reducedMotion: boolean;
  onDecide: (outfit: Outfit, decision: DeckDecision) => void;
  onGone: () => void;
  ref?: Ref<SlotHandle>;
}

const DeckSlot = memo(function DeckSlot({ outfit, position, reducedMotion, onDecide, onGone, ref }: SlotProps) {
  const translateX = useSharedValue(0);
  const animatedPosition = useSharedValue(position);
  const leaving = useSharedValue(false);

  useEffect(() => {
    animatedPosition.set(reducedMotion ? position : withTiming(position, { duration: ADVANCE_MS }));
  }, [position, reducedMotion, animatedPosition]);

  const decide = useCallback(
    (direction: 1 | -1) => onDecide(outfit, direction === 1 ? 'save' : 'skip'),
    [onDecide, outfit],
  );

  const leave = (direction: 1 | -1) => {
    'worklet';
    if (leaving.get()) return;
    leaving.set(true);
    scheduleOnRN(decide, direction);
    if (reducedMotion) {
      scheduleOnRN(onGone);
      return;
    }
    translateX.set(
      withTiming(direction * EXIT_X, { duration: EXIT_MS }, (finished) => {
        if (finished) scheduleOnRN(onGone);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ fly: (direction) => scheduleOnUI(leave, direction) }));

  const pan = usePanGesture({
    enabled: position === 0,
    // Solo toma el arrastre si es claramente horizontal: el scroll vertical de la pantalla sigue funcionando.
    activeOffsetX: [-12, 12],
    failOffsetY: [-12, 12],
    onUpdate: (event) => {
      if (!leaving.get()) translateX.set(event.translationX);
    },
    onDeactivate: (event) => {
      if (leaving.get()) return;
      const farEnough = Math.abs(event.translationX) > SWIPE_DISTANCE;
      if (farEnough || Math.abs(event.velocityX) > SWIPE_VELOCITY) {
        const towards = farEnough ? event.translationX : event.velocityX;
        leave(towards > 0 ? 1 : -1);
      } else {
        translateX.set(reducedMotion ? 0 : withSpring(0));
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const x = translateX.get();
    const stack = animatedPosition.get();
    return {
      transform: [
        { translateX: x },
        { translateY: stack * Y_STEP },
        { rotate: `${(x / CARD_WIDTH) * MAX_ROTATION}deg` },
        { scale: 1 - stack * SCALE_STEP },
      ],
    };
  });
  const saveStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.get(), [0, SWIPE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));
  const skipStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.get(), [-SWIPE_DISTANCE, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const isTop = position === 0;
  return (
    <GestureDetector gesture={pan} touchAction="pan-y">
      <Animated.View
        style={[styles.card, { height: cardHeight(outfit), zIndex: VISIBLE_CARDS - position }, cardStyle]}
        accessible={isTop}
        accessibilityLabel={`${outfit.title}, ${outfit.matchPercent}% match. ${outfit.description}`}
        accessibilityElementsHidden={!isTop}
        importantForAccessibility={isTop ? 'yes' : 'no-hide-descendants'}
      >
        <CardFace outfit={outfit} />
        <Animated.View style={[styles.stamp, styles.saveStamp, saveStampStyle]} pointerEvents="none">
          <Text style={[styles.stampLabel, styles.saveStampLabel]}>GUARDADO</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.skipStamp, skipStampStyle]} pointerEvents="none">
          <Text style={[styles.stampLabel, styles.skipStampLabel]}>OTRA IDEA</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

interface Props {
  outfits: readonly Outfit[];
  index: number;
  savedCount: number;
  onDecide: (outfit: Outfit, decision: DeckDecision) => void;
  onAdvance: () => void;
  onExplain: (outfit: Outfit) => void;
  onRestart: () => void;
}

export function OutfitDeck({ outfits, index, savedCount, onDecide, onAdvance, onExplain, onRestart }: Props) {
  const { tokens, scheme, transition, reducedMotion } = useOutfitsTheme();
  const topRef = useRef<SlotHandle>(null);
  const visible = useMemo(() => outfits.slice(index, index + VISIBLE_CARDS), [outfits, index]);
  const top = visible[0];
  const panelGradient = useMemo(() => (top ? deckGradient(top).bg1 : null), [top]);

  if (!top || !panelGradient) {
    return (
      <Animated.View style={[styles.empty, { borderColor: tokens.line }, transition]}>
        <Ionicons name="checkmark-circle-outline" size={36} color={tokens.accent} />
        <Animated.Text style={[styles.emptyTitle, { color: tokens.text }, transition]} accessibilityRole="header">
          Viste todas las ideas
        </Animated.Text>
        <Animated.Text style={[styles.emptyDetail, { color: tokens.sub }, transition]}>
          Guardaste {savedCount}. Sumá más prendas a tu placard para recibir combinaciones nuevas.
        </Animated.Text>
        <PressableScale
          onPress={onRestart}
          accessibilityRole="button"
          accessibilityLabel="Volver a mirar las ideas"
          style={[styles.restart, { backgroundColor: tokens.primary }]}
        >
          <Text style={[styles.restartLabel, { color: tokens.onPrimary }]}>Volver a mirar</Text>
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <View style={styles.deck}>
      <View style={[styles.stage, { height: cardHeight(top) + STACK_PEEK }]}>
        <Animated.View
          style={[
            styles.panel,
            { backgroundColor: hexToRgba(panelGradient, scheme === 'dark' ? 0.28 : 0.2) },
            reducedMotion ? null : styles.panelTransition,
          ]}
        />
        {/* Las cartas conservan su key al avanzar: así suben de posición animadas, sin volver a montarse. */}
        {visible.map((outfit, position) => (
          <DeckSlot
            key={outfit.id}
            ref={position === 0 ? topRef : undefined}
            outfit={outfit}
            position={position}
            reducedMotion={reducedMotion}
            onDecide={onDecide}
            onGone={onAdvance}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <RoundButton
          size={60}
          icon="close"
          color={tokens.xButton}
          label="Otra idea"
          background={tokens.card}
          border={tokens.cardBorder}
          onPress={() => topRef.current?.fly(-1)}
        />
        <RoundButton
          size={72}
          icon="heart"
          color={tokens.onPrimary}
          label="Guardar outfit"
          background={tokens.primary}
          onPress={() => topRef.current?.fly(1)}
        />
        <RoundButton
          size={60}
          icon="information-circle-outline"
          color={tokens.info}
          label="Ver por qué combina"
          background={tokens.card}
          border={tokens.cardBorder}
          onPress={() => onExplain(top)}
        />
      </View>
      <Animated.Text style={[styles.help, { color: tokens.sub }, transition]}>
        Deslizá a la derecha para guardar, a la izquierda para otra idea
      </Animated.Text>
    </View>
  );
}

interface RoundButtonProps {
  size: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  background: string;
  border?: string;
  onPress: () => void;
}

const RoundButton = memo(function RoundButton({ size, icon, color, label, background, border, onPress }: RoundButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.round,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        border ? { borderWidth: 1, borderColor: border } : null,
      ]}
    >
      <Ionicons name={icon} size={size * 0.42} color={color} />
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  deck: { alignItems: 'center' },
  stage: { width: CARD_WIDTH, marginTop: 24, marginBottom: 22 }, // alto: la carta de arriba + lo que asoman las de atrás
  panel: { position: 'absolute', top: -22, bottom: -22, left: -22, right: -22, borderRadius: 38 },
  panelTransition: { transitionProperty: 'backgroundColor', transitionDuration: 300 },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    borderRadius: 28,
    backgroundColor: PAPER.background,
    boxShadow: '0px 10px 24px rgba(0,0,0,0.22)',
    transformOrigin: 'center bottom', // las cartas de abajo asoman por debajo: alto de la carta + STACK_PEEK = el contenedor
  },
  face: { flex: 1, borderRadius: 28, overflow: 'hidden' },
  faceTop: { height: 232 },
  faceTopWithShoe: { height: 232 + SHOE_EXTRA },
  photo: {
    position: 'absolute',
    width: 124,
    height: 168,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 14px rgba(0,0,0,0.2)',
  },
  photoLeft: { left: 22, top: 30, transform: [{ rotate: '-4deg' }] },
  photoRight: { right: 22, top: 34, transform: [{ rotate: '4deg' }] },
  photoCompact: { width: 116, height: 140 },
  photoLeftCompact: { left: 24, top: 16, transform: [{ rotate: '-4deg' }] },
  photoRightCompact: { right: 24, top: 20, transform: [{ rotate: '4deg' }] },
  shoe: {
    position: 'absolute',
    left: (CARD_WIDTH - 160) / 2,
    top: 176,
    width: 160,
    height: 68,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 14px rgba(0,0,0,0.2)',
    transform: [{ rotate: '-2deg' }],
  },
  plus: {
    position: 'absolute',
    left: CARD_WIDTH / 2 - 16,
    top: 100,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCompact: { top: 72 },
  plusShoe: { left: CARD_WIDTH / 2 - 13, top: 176 - 13, width: 26, height: 26, borderRadius: 13 },
  faceBottom: { height: 140, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: PAPER.background, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 22, lineHeight: 25, fontWeight: '700', color: PAPER.text },
  matchPill: { backgroundColor: PAPER.matchFill, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  matchLabel: { fontSize: 12, fontWeight: '700', color: PAPER.matchText },
  description: { fontSize: 14, lineHeight: 18, color: PAPER.sub },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 'auto' },
  paletteDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  paletteLabel: { flex: 1, marginLeft: 5, fontSize: 13, color: PAPER.sub },
  stamp: { position: 'absolute', top: 22, borderWidth: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.88)' },
  saveStamp: { left: 18, borderColor: PAPER.matchText, transform: [{ rotate: '-8deg' }] },
  skipStamp: { right: 18, borderColor: PAPER.skipStamp, transform: [{ rotate: '8deg' }] },
  stampLabel: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  saveStampLabel: { color: PAPER.matchText },
  skipStampLabel: { color: PAPER.skipStamp },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 8 },
  round: { alignItems: 'center', justifyContent: 'center' },
  help: { fontSize: 13, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
  empty: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyDetail: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  restart: { marginTop: 8, minHeight: 44, paddingHorizontal: 22, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  restartLabel: { fontSize: 15, fontWeight: '600' },
});
