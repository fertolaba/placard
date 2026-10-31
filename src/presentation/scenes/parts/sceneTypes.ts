export type SceneAnim = 'spin' | 'drift' | 'waveA' | 'waveB' | 'bob' | 'twinkle' | 'aurora' | 'fall' | 'snow';

/** Una parte del dibujo, en el orden del SVG original. Las animadas traen su recuadro [x, y, ancho, alto]. */
export type SceneLayerData =
  | { anim: null; xml: string }
  | { anim: string; xml: string; box: number[] };

export interface SceneData {
  sky: string[]; // gradiente del cielo, de arriba hacia abajo
  layers: SceneLayerData[];
}

/** Lienzo de los SVG originales. */
export const SCENE_VIEWBOX_WIDTH = 390;
export const SCENE_VIEWBOX_HEIGHT = 210;
