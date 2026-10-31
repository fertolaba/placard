import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { SCENE_VIEWBOX_HEIGHT, SCENE_VIEWBOX_WIDTH, type SceneAnim, type SceneData } from './sceneTypes';

// Tiempos del diseño (vuelta completa). Los de ida y vuelta se reparten por mitades.
const SPIN_MS = 30000;
const DRIFT_MS = [9000, 12000];
const DRIFT_DISTANCE = 36;
const WAVE_A_MS = 4000;
const WAVE_B_MS = 6000;
const WAVE_DISTANCE = 60; // las olas de los SVG se repiten justo cada 60
const BOB_MS = 3000;
const BOB_DISTANCE = 3;
const TWINKLE_MS = 3000;
const TWINKLE_MIN_OPACITY = 0.25;
const TWINKLE_STAGGER_MS = 430;
const AURORA_MS = 7000;
const AURORA_DISTANCE = 14;
const AURORA_MIN_OPACITY = 0.6;
const FALL_DISTANCE = 230;
const FALL_MS = 11000;
const SNOW_MS = 9000;
const GOLDEN_RATIO = 0.618; // reparte hojas y copos a lo alto, sin que coincidan

/** Las hojas y los copos arrancan repartidos: en el SVG están todos en la línea de arriba. */
function fallPhase(order: number): number {
  return (order * GOLDEN_RATIO) % 1;
}

/**
 * Progreso de 0 a 1 en el hilo nativo. Al pausar vuelve a su pose de reposo: la escena no está a la vista
 * (o tiene que quedar quieta), así que el salto no se nota.
 */
function useLoop(active: boolean, cycleMs: number, mode: 'loop' | 'backAndForth', delay: number, phase: number) {
  const progress = useSharedValue(phase);
  useEffect(() => {
    if (!active) {
      cancelAnimation(progress);
      progress.set(phase);
      return;
    }
    if (mode === 'backAndForth') {
      const half = withTiming(1, { duration: cycleMs / 2, easing: Easing.inOut(Easing.sin) });
      progress.set(withDelay(delay, withRepeat(half, -1, true)));
    } else {
      const lap = withTiming(1, { duration: cycleMs, easing: Easing.linear });
      const firstLap = withTiming(1, { duration: cycleMs * (1 - phase), easing: Easing.linear });
      progress.set(withSequence(firstLap, withRepeat(withSequence(withTiming(0, { duration: 0 }), lap), -1)));
    }
    return () => cancelAnimation(progress);
  }, [active, cycleMs, mode, delay, phase, progress]);
  return progress;
}

interface LayerProps {
  anim: SceneAnim;
  order: number; // cuántas capas con esta animación hay antes: varía tiempos y arranques
  active: boolean;
  scale: number;
  xml: string;
  box: number[];
  offsetX: number;
}

/*
 * Cada capa es un SVG que se dibuja una sola vez dentro de un Animated.View que solo cambia transform y opacity:
 * el dispositivo mueve la imagen ya dibujada. Animar el SVG lo redibujaría en cada cuadro.
 */
const AnimatedLayer = memo(function AnimatedLayer({ anim, order, active, scale, xml, box, offsetX }: LayerProps) {
  const falling = anim === 'fall' || anim === 'snow';
  const continuous = falling || anim === 'spin' || anim === 'waveA' || anim === 'waveB';

  let cycleMs = BOB_MS;
  if (anim === 'spin') cycleMs = SPIN_MS;
  else if (anim === 'drift') cycleMs = DRIFT_MS[order % DRIFT_MS.length];
  else if (anim === 'waveA') cycleMs = WAVE_A_MS;
  else if (anim === 'waveB') cycleMs = WAVE_B_MS;
  else if (anim === 'twinkle') cycleMs = TWINKLE_MS;
  else if (anim === 'aurora') cycleMs = AURORA_MS;
  else if (anim === 'fall') cycleMs = FALL_MS;
  else if (anim === 'snow') cycleMs = SNOW_MS;

  const delay = anim === 'twinkle' ? order * TWINKLE_STAGGER_MS : 0;
  const progress = useLoop(active, cycleMs, continuous ? 'loop' : 'backAndForth', delay, falling ? fallPhase(order) : 0);

  const style = useAnimatedStyle(() => {
    const value = progress.get();
    switch (anim) {
      case 'spin':
        return { transform: [{ rotate: `${value * 360}deg` }] };
      case 'drift':
        return { transform: [{ translateX: value * DRIFT_DISTANCE * scale }] };
      // Direcciones opuestas: cada ola se corre hacia el lado donde su dibujo todavía sobra.
      case 'waveA':
        return { transform: [{ translateX: value * WAVE_DISTANCE * scale }] };
      case 'waveB':
        return { transform: [{ translateX: -value * WAVE_DISTANCE * scale }] };
      case 'bob':
        return { transform: [{ translateY: -value * BOB_DISTANCE * scale }] };
      case 'twinkle':
        return { opacity: 1 - value * (1 - TWINKLE_MIN_OPACITY) };
      case 'aurora':
        return { opacity: 1 - value * (1 - AURORA_MIN_OPACITY), transform: [{ translateX: value * AURORA_DISTANCE * scale }] };
      case 'fall':
        return { transform: [{ translateY: value * FALL_DISTANCE * scale }, { rotate: `${value * 360}deg` }] };
      case 'snow':
        return { transform: [{ translateY: value * FALL_DISTANCE * scale }] };
    }
  });

  const [x, y, width, height] = box;
  return (
    <Animated.View
      style={[
        styles.layer,
        { left: offsetX + x * scale, top: y * scale, width: width * scale, height: height * scale },
        style,
      ]}
    >
      <SvgXml
        xml={`<svg viewBox="${x} ${y} ${width} ${height}">${xml}</svg>`}
        width={width * scale}
        height={height * scale}
      />
    </Animated.View>
  );
});

interface SceneLayersProps {
  scene: SceneData;
  width: number;
  height: number;
  active: boolean;
}

/** Dibuja la escena como el SVG original: slice uniforme, centrada a lo ancho y pegada arriba. */
export const SceneLayers = memo(function SceneLayers({ scene, width, height, active }: SceneLayersProps) {
  const scale = Math.max(width / SCENE_VIEWBOX_WIDTH, height / SCENE_VIEWBOX_HEIGHT);
  const offsetX = (width - SCENE_VIEWBOX_WIDTH * scale) / 2;
  const orders = new Map<string, number>();

  return scene.layers.map((layer, index) => {
    if (!layer.anim) {
      return (
        <SvgXml
          key={index}
          style={StyleSheet.absoluteFill}
          xml={`<svg viewBox="0 0 ${SCENE_VIEWBOX_WIDTH} ${SCENE_VIEWBOX_HEIGHT}" preserveAspectRatio="xMidYMin slice">${layer.xml}</svg>`}
          width={width}
          height={height}
        />
      );
    }
    const order = orders.get(layer.anim) ?? 0;
    orders.set(layer.anim, order + 1);
    return (
      <AnimatedLayer
        key={index}
        anim={layer.anim as SceneAnim}
        order={order}
        active={active}
        scale={scale}
        xml={layer.xml}
        box={layer.box}
        offsetX={offsetX}
      />
    );
  });
});

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
