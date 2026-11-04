import type { BodyZone } from '../../domain/entities/Garment';
import type { StyleId } from '../../domain/entities/StyleReference';

export interface SilhouetteShape {
  vb: string;
  w: number; // tamaño base, antes de la escala de la zona y del `size` de cada pantalla
  h: number;
  main: string; // contorno
  det: string; // detalles internos; vacío = no se dibuja
}

/**
 * Escala de cada zona sobre `w`/`h`. Arriba y abajo conservan la que tenían (el cuadro no cambia);
 * los calzados ya traen su `w`/`h` en puntos de pantalla a 1×.
 */
export const ZONE_SCALE: Record<BodyZone, number> = { torso: 0.56, piernas: 0.62, pies: 1 };

/** Las siluetas de siempre: para cuando no hay estilo o el estilo no tiene la suya. */
export const GENERIC_SHAPES: Record<BodyZone, SilhouetteShape> = {
  torso: {
    vb: '0 0 120 120',
    w: 120,
    h: 120,
    main: 'M30 22L48 14Q60 24 72 14L90 22L112 44L98 58L88 52L88 98L32 98L32 52L22 58L8 44Z',
    det: '',
  },
  piernas: { vb: '0 0 80 100', w: 80, h: 100, main: 'M16 6H64L70 94H46L40 40L34 94H10Z', det: '' },
  // 44×20 a escala 1,5: el cuadro de 66×30 que ya tenía.
  pies: { vb: '0 0 44 20', w: 66, h: 30, main: 'M1 14Q1 6 8 5L16 1Q20 8 30 9Q40 10 43 14V18H1Z', det: '' },
};

/** Calzados calcados de fotos de referencia: solo contorno. */
export const STYLE_SHAPES: Record<StyleId, Record<BodyZone, SilhouetteShape>> = {
  'old-money': {
    torso: {
      vb: '0 0 120 120',
      w: 120,
      h: 120,
      main: 'M30 24L46 14L54 22L60 30L66 22L74 14L90 24L112 46L98 60L88 54L88 100L32 100L32 54L22 60L8 46Z',
      det: 'M46 14L54 22L60 16L66 22L74 14M60 30V58M56 40H64M56 48H64',
    },
    piernas: {
      vb: '0 0 80 100',
      w: 80,
      h: 100,
      main: 'M18 6H62L66 94H44L40 36L36 94H14Z',
      det: 'M18 14H62M27 24V94M53 24V94M30 6V22M50 6V22',
    },
    // Mocasín
    pies: {
      vb: '0 0 140 53',
      w: 64,
      h: 24.2,
      main: 'M3.1 8.4L0.5 22.5L1.5 33.6L0.0 46.7L0.6 48.4L2.1 49.3L19.9 51.9L36.2 52.4L43.6 50.6L41.8 48.1L41.8 46.3L43.5 45.2L47.2 45.1L52.6 46.2L54.7 50.2L61.3 50.9L106.4 50.3L126.9 48.5L137.4 45.5L139.1 43.9L136.7 32.5L134.9 29.5L132.1 27.0L129.5 26.2L122.7 26.2L111.2 24.9L99.1 21.7L92.8 18.9L89.1 16.5L83.2 11.1L81.9 7.5L80.6 6.1L75.5 4.3L70.3 4.0L63.4 0.5L61.2 1.6L59.3 7.8L57.2 9.4L43.0 8.4L7.3 4.0L4.7 4.9Z',
      det: '',
    },
  },
  streetwear: {
    torso: {
      vb: '0 0 120 120',
      w: 120,
      h: 120,
      main: 'M38 20Q46 10 60 12Q74 10 82 20L106 30L116 82L100 84L94 54L94 106L26 106L26 54L20 84L4 82L14 30Z',
      det: 'M46 16Q60 40 74 16M38 84H82L86 106M38 84L34 106M60 52V84',
    },
    piernas: { vb: '0 0 80 100', w: 80, h: 100, main: 'M11 6H69L79 94H46L40 46L34 94H1Z', det: 'M11 14H69M3 84H34M46 84H77' },
    // Zapatilla alta
    pies: {
      vb: '0 0 140 84',
      w: 60,
      h: 36,
      main: 'M11.8 10.1L9.2 22.2L7.8 25.3L6.9 30.6L5.8 32.7L4.0 39.9L1.4 58.3L1.3 65.6L0.0 67.5L1.2 69.5L1.1 74.9L0.0 76.8L0.4 82.2L21.0 83.4L89.8 83.5L116.7 82.6L132.5 77.9L137.9 71.9L139.7 66.2L139.7 63.5L135.6 58.7L134.4 54.7L129.7 51.7L108.7 49.5L99.9 47.5L85.7 41.1L83.9 38.9L79.5 36.8L77.4 33.8L73.3 31.4L72.0 29.7L67.4 28.1L64.2 25.7L62.3 20.6L58.3 15.3L56.7 9.3L54.1 6.5L52.6 2.9L49.4 0.3L47.6 0.2L43.9 2.4L38.7 3.4L23.1 8.9L13.5 9.3Z',
      det: '',
    },
  },
  y2k: {
    torso: {
      vb: '0 0 120 120',
      w: 120,
      h: 120,
      main: 'M36 30L50 22Q60 36 70 22L84 30L104 46L94 58L84 52V80H36V52L26 58L16 46Z',
      det: 'M50 22Q60 40 70 22M36 74H84',
    },
    piernas: { vb: '0 0 80 100', w: 80, h: 100, main: 'M14 12H66L70 52L78 94H46L40 46L34 94H2L10 52Z', det: 'M14 20H66M40 20V46' },
    // Bota de trabajo
    pies: {
      vb: '0 0 140 104',
      w: 56,
      h: 41.6,
      main: 'M4.3 16.8L8.1 34.9L8.1 43.5L3.0 79.4L0.5 87.4L0.0 97.0L1.7 100.3L19.7 102.6L43.0 102.6L44.3 101.6L43.5 98.1L44.5 95.7L54.1 95.0L67.7 97.3L68.7 98.6L69.0 102.4L70.3 103.1L113.2 103.1L117.3 102.2L118.8 97.6L133.4 93.0L139.1 89.8L138.4 82.5L135.8 79.9L133.1 74.3L129.8 71.4L125.3 69.7L104.1 69.7L98.6 68.9L83.5 61.8L80.3 56.6L69.2 47.5L61.2 37.3L56.5 15.7L49.5 0.3L46.3 1.0L36.4 9.6L11.1 14.0Z',
      det: '',
    },
  },
  techwear: {
    torso: {
      vb: '0 0 120 120',
      w: 120,
      h: 120,
      main: 'M40 18L48 10H72L80 18L100 28L108 86L96 88L90 54L88 104H32L30 54L24 88L12 86L20 28Z',
      det: 'M60 10V104M48 10L44 26M72 10L76 26M68 44H82V54H68M32 80H44',
    },
    piernas: {
      vb: '0 0 80 100',
      w: 80,
      h: 100,
      main: 'M18 6H62L66 70L62 94H46L40 40L34 94H18L14 70Z',
      det: 'M18 14H62M14 84H34M46 84H66M52 36H62V50H52Z',
    },
    // Bota táctica
    pies: {
      vb: '0 0 140 112',
      w: 52,
      h: 41.6,
      main: 'M11.6 16.2L10.8 17.9L10.7 20.0L12.1 24.7L14.3 28.7L14.3 33.2L16.9 44.2L16.9 48.5L16.0 52.5L15.9 58.8L8.6 73.9L6.8 80.0L4.8 81.4L3.5 83.5L0.6 91.8L0.1 97.6L0.9 101.6L2.4 104.5L4.9 107.3L5.7 110.0L13.9 111.1L39.8 110.6L52.9 111.3L72.0 110.6L97.4 111.5L124.2 109.6L129.6 108.7L129.6 105.6L134.6 102.4L139.6 96.1L139.7 91.8L136.9 86.4L130.4 83.0L100.7 71.8L98.1 68.3L89.2 64.5L86.1 61.1L80.4 58.6L78.0 56.3L77.1 54.0L74.6 53.0L71.1 49.6L69.5 44.0L67.4 42.3L65.8 38.1L65.2 32.5L63.0 30.8L60.5 25.2L59.6 19.1L56.4 15.8L52.2 0.3L43.3 1.5L40.9 4.8L37.4 5.3L19.3 11.9L14.1 14.2Z',
      det: '',
    },
  },
  blokecore: {
    torso: {
      vb: '0 0 120 120',
      w: 120,
      h: 120,
      main: 'M30 22L46 14L60 28L74 14L90 22L112 44L98 58L88 52L88 100L32 100L32 52L22 58L8 44Z',
      det: 'M46 14L60 28L74 14M24 54L36 48M96 54L84 48M50 40H64',
    },
    piernas: { vb: '0 0 80 100', w: 80, h: 100, main: 'M17 6H63L67 94H45L40 38L35 94H13Z', det: 'M17 14H63M40 14V38M24 22H32M56 22H48' },
    // Zapatilla baja de suela de goma
    pies: {
      vb: '0 0 140 59.7',
      w: 64,
      h: 27.3,
      main: 'M0.7 31.3L0.6 43.8L0.1 46.0L0.8 53.1L2.1 55.2L4.4 56.7L8.9 57.3L33.5 59.1L39.1 59.1L40.5 58.4L43.0 59.0L45.1 58.5L48.6 59.1L52.5 58.4L55.4 59.1L60.7 58.6L63.7 59.1L65.3 58.5L67.1 59.1L68.8 58.5L71.0 59.1L90.8 59.5L101.0 58.6L108.0 58.9L109.4 58.2L115.6 57.8L117.0 57.0L122.5 56.5L130.9 54.4L137.4 52.0L138.8 50.4L139.8 46.1L139.5 43.6L137.3 39.1L135.1 36.5L131.5 34.2L112.2 29.0L103.6 24.8L100.1 24.4L94.9 21.6L92.1 20.9L87.8 18.2L84.6 17.2L82.1 15.4L78.7 15.0L76.1 11.9L73.0 11.7L70.0 8.2L65.1 6.7L54.7 0.0L52.6 0.0L50.4 1.4L46.6 7.1L45.6 11.2L45.9 17.0L42.9 18.7L37.0 20.6L25.8 20.7L20.2 19.5L17.4 17.5L14.3 9.2L12.5 8.1L10.3 8.0L8.8 9.6L5.1 19.6L3.0 21.9Z',
      det: '',
    },
  },
};

/** La silueta de una zona en un estilo; `generic` = la de siempre, que se dibuja con el punteado anterior. */
export function silhouetteShape(
  zone: BodyZone,
  styleId?: StyleId | null,
): { shape: SilhouetteShape; generic: boolean } {
  const own = styleId ? STYLE_SHAPES[styleId]?.[zone] : undefined;
  return own ? { shape: own, generic: false } : { shape: GENERIC_SHAPES[zone], generic: true };
}

/** Tamaño en pantalla de una silueta: `w`/`h` por la escala de su zona y el `size` de la pantalla. */
export function silhouetteBox(shape: SilhouetteShape, zone: BodyZone, size: number): { width: number; height: number } {
  const scale = ZONE_SCALE[zone] * size;
  return { width: shape.w * scale, height: shape.h * scale };
}
