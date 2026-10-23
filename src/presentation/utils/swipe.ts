export type SwipeDirection = 'left' | 'right';

const MIN_DISTANCE = 50; // píxeles que hay que recorrer con el dedo
const MIN_FLICK_DISTANCE = 20; // recorrido mínimo para un gesto rápido
const MIN_FLICK_SPEED = 0.5; // píxeles por milisegundo

/**
 * Decide si un gesto fue un deslizamiento horizontal y hacia dónde.
 * Devuelve null si fue más vertical que horizontal (es scroll) o si fue muy corto y lento.
 * dx y dy son lo que se movió el dedo; vx es la velocidad horizontal.
 */
export function resolveSwipe(dx: number, dy: number, vx: number): SwipeDirection | null {
  if (Math.abs(dx) < Math.abs(dy) * 1.5) return null;
  const farEnough = Math.abs(dx) >= MIN_DISTANCE;
  const fastEnough = Math.abs(dx) >= MIN_FLICK_DISTANCE && Math.abs(vx) >= MIN_FLICK_SPEED;
  if (!farEnough && !fastEnough) return null;
  return dx < 0 ? 'left' : 'right';
}

/**
 * El elemento vecino de una lista según hacia dónde se deslizó. En los extremos no da la vuelta.
 * Por defecto, deslizar el dedo hacia la izquierda avanza (como pasar páginas); con rightGoesNext se invierte.
 */
export function neighbor<T>(items: readonly T[], current: T, direction: SwipeDirection, rightGoesNext = false): T {
  const index = items.indexOf(current);
  if (index === -1) return current;
  const goesNext = (direction === 'left') !== rightGoesNext;
  const target = goesNext ? index + 1 : index - 1;
  return items[Math.min(Math.max(target, 0), items.length - 1)];
}