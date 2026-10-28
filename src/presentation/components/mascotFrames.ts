import type { ImageProps } from 'expo-image';

// Para cambiar de mascota: reemplazá las imágenes de assets/mascot/ y editá solo estas dos listas.
// React Native necesita un require estático por imagen, no se pueden armar los nombres en tiempo de ejecución.

/** Mientras escribe el email: del primer cuadro (correo vacío) al último (correo largo). */
export const watchFrames: ImageProps['source'][] = [
  require('../../../assets/mascot/watch_bear_0.png'),
  require('../../../assets/mascot/watch_bear_1.png'),
  require('../../../assets/mascot/watch_bear_2.png'),
  require('../../../assets/mascot/watch_bear_3.png'),
  require('../../../assets/mascot/watch_bear_4.png'),
  require('../../../assets/mascot/watch_bear_5.png'),
  require('../../../assets/mascot/watch_bear_6.png'),
  require('../../../assets/mascot/watch_bear_7.png'),
  require('../../../assets/mascot/watch_bear_8.png'),
  require('../../../assets/mascot/watch_bear_9.png'),
  require('../../../assets/mascot/watch_bear_10.png'),
  require('../../../assets/mascot/watch_bear_11.png'),
  require('../../../assets/mascot/watch_bear_12.png'),
  require('../../../assets/mascot/watch_bear_13.png'),
  require('../../../assets/mascot/watch_bear_14.png'),
  require('../../../assets/mascot/watch_bear_15.png'),
  require('../../../assets/mascot/watch_bear_16.png'),
  require('../../../assets/mascot/watch_bear_17.png'),
  require('../../../assets/mascot/watch_bear_18.png'),
  require('../../../assets/mascot/watch_bear_19.png'),
  require('../../../assets/mascot/watch_bear_20.png'),
];

/** Al enfocar la contraseña: se reproducen en orden y queda el último (ojos tapados). */
export const hideFrames: ImageProps['source'][] = [
  require('../../../assets/mascot/hide_bear_0.png'),
  require('../../../assets/mascot/hide_bear_1.png'),
  require('../../../assets/mascot/hide_bear_2.png'),
  require('../../../assets/mascot/hide_bear_3.png'),
  require('../../../assets/mascot/hide_bear_4.png'),
  require('../../../assets/mascot/hide_bear_5.png'),
];
