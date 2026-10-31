import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { SeasonScheme } from '../../core/theme/seasonThemes';
import type { SeasonSelection } from '../../domain/entities/Season';
import { useSeasonTheme } from '../theme/SeasonThemeProvider';
import { useTheme } from '../theme/ThemeProvider';
import { SCENE_DATA } from './generated/sceneData';
import { SceneLayers } from './parts/motion';
import { useSceneActive } from './useSceneActive';

const SCENE_HEIGHT = 222;
const FADE_STEP_MS = 350; // sale una y entra la otra: nunca hay dos escenas montadas a la vez

function sceneName(season: SeasonSelection, scheme: SeasonScheme): string | null {
  return season === 'todas' ? null : `${season}-${scheme === 'light' ? 'dia' : 'noche'}`; // "Todas" no tiene escena
}

interface Props {
  width: number;
  scrollY: SharedValue<number>;
}

/** Escena decorativa detrás del contenido: sube con el scroll y se funde al cambiar de estación o de modo. */
export function SeasonScene({ width, scrollY }: Props) {
  const { season } = useSeasonTheme();
  const { scheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const active = useSceneActive();

  const target = sceneName(season, scheme);
  const [shown, setShown] = useState(target);
  const opacity = useSharedValue(1);

  if (reducedMotion && shown !== target) setShown(target); // sin fundido: cambia directo

  useEffect(() => {
    if (shown === target) {
      opacity.set(reducedMotion ? 1 : withTiming(1, { duration: FADE_STEP_MS }));
      return;
    }
    if (reducedMotion) return;
    opacity.set(withTiming(0, { duration: FADE_STEP_MS }));
    const timer = setTimeout(() => setShown(target), FADE_STEP_MS);
    return () => clearTimeout(timer);
  }, [shown, target, reducedMotion, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: -interpolate(scrollY.get(), [0, SCENE_HEIGHT], [0, SCENE_HEIGHT], 'clamp') }],
  }));

  if (!shown) return null;

  return (
    <Animated.View style={[styles.frame, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SceneLayers scene={SCENE_DATA[shown]} width={width} height={SCENE_HEIGHT} active={active} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { position: 'absolute', top: 0, left: 0, right: 0, height: SCENE_HEIGHT, overflow: 'hidden', pointerEvents: 'none' },
});
