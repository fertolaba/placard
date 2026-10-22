import { GARMENT_COLORS, type GarmentColor } from './garmentColors';

type Lab = readonly [number, number, number];
type Rgb = readonly [number, number, number];

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Pasa un color RGB (0 a 255) a CIELAB, un espacio donde la distancia numérica se parece a la que ve el ojo. */
export function rgbToLab(r: number, g: number, b: number): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '');
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const part = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function distanceSquared(a: Lab, b: Lab): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/** El color de la lista más parecido a un color RGB cualquiera (se usa para ponerle nombre). */
export function nearestGarmentColor(
  r: number,
  g: number,
  b: number,
  palette: readonly GarmentColor[] = GARMENT_COLORS,
): GarmentColor {
  const target = rgbToLab(r, g, b);
  let best = palette[0];
  let bestDistance = Infinity;
  for (const color of palette) {
    const distance = distanceSquared(target, rgbToLab(...hexToRgb(color.hex)));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = color;
    }
  }
  return best;
}

// Qué tan concentrado en el centro es el análisis: la prenda suele estar al medio y el fondo en los bordes.
const CENTER_SIGMA = 0.22;
const MIN_ALPHA = 128;
// Colores más cercanos que esto (en unidades de CIELAB) se consideran "el mismo color" (luces y sombras de la tela).
const BANDWIDTH = 16;
const SEED_CELL = 12;
const MAX_ITERATIONS = 15;

interface Sample {
  lab: Lab;
  rgb: Rgb;
  weight: number;
}

function collectSamples(pixels: ArrayLike<number>, width: number, height: number): Sample[] {
  const samples: Sample[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (pixels[i + 3] < MIN_ALPHA) continue; // píxel transparente
      const dx = (x + 0.5) / width - 0.5;
      const dy = (y + 0.5) / height - 0.5;
      samples.push({
        lab: rgbToLab(pixels[i], pixels[i + 1], pixels[i + 2]),
        rgb: [pixels[i], pixels[i + 1], pixels[i + 2]],
        weight: Math.exp(-(dx * dx + dy * dy) / (2 * CENTER_SIGMA * CENTER_SIGMA)),
      });
    }
  }
  return samples;
}

/** El color que más se repite en la foto (con los píxeles del centro valiendo más), como RGB exacto. */
function dominantRgb(samples: Sample[]): Rgb | null {
  if (samples.length === 0) return null;

  // 1) Semilla: la celda de color con más peso.
  const cells = new Map<string, { weight: number; sum: [number, number, number] }>();
  for (const s of samples) {
    const key = `${Math.floor(s.lab[0] / SEED_CELL)},${Math.floor(s.lab[1] / SEED_CELL)},${Math.floor(s.lab[2] / SEED_CELL)}`;
    const cell = cells.get(key) ?? { weight: 0, sum: [0, 0, 0] };
    cell.weight += s.weight;
    cell.sum[0] += s.lab[0] * s.weight;
    cell.sum[1] += s.lab[1] * s.weight;
    cell.sum[2] += s.lab[2] * s.weight;
    cells.set(key, cell);
  }
  let seed: { weight: number; sum: [number, number, number] } | null = null;
  for (const cell of cells.values()) if (!seed || cell.weight > seed.weight) seed = cell;
  if (!seed) return null;
  let center: Lab = [seed.sum[0] / seed.weight, seed.sum[1] / seed.weight, seed.sum[2] / seed.weight];

  // 2) Se corre el centro hacia el medio de los colores parecidos hasta que se estabiliza.
  const limit = BANDWIDTH * BANDWIDTH;
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let weight = 0;
    const sum = [0, 0, 0];
    for (const s of samples) {
      if (distanceSquared(s.lab, center) > limit) continue;
      weight += s.weight;
      sum[0] += s.lab[0] * s.weight;
      sum[1] += s.lab[1] * s.weight;
      sum[2] += s.lab[2] * s.weight;
    }
    if (weight === 0) break;
    const next: Lab = [sum[0] / weight, sum[1] / weight, sum[2] / weight];
    const moved = distanceSquared(next, center);
    center = next;
    if (moved < 0.0625) break;
  }

  // 3) El color final es el promedio (en RGB) de los píxeles parecidos al centro.
  let weight = 0;
  const rgb = [0, 0, 0];
  for (const s of samples) {
    if (distanceSquared(s.lab, center) > limit) continue;
    weight += s.weight;
    rgb[0] += s.rgb[0] * s.weight;
    rgb[1] += s.rgb[1] * s.weight;
    rgb[2] += s.rgb[2] * s.weight;
  }
  if (weight === 0) return null;
  return [rgb[0] / weight, rgb[1] / weight, rgb[2] / weight];
}

/**
 * Detecta el color de la prenda a partir de los píxeles de una foto chica (RGBA, 4 valores por píxel).
 * Devuelve el color real (hex exacto) con el nombre del color de la lista que más se le parece,
 * o null si la imagen es inválida o transparente.
 */
export function detectGarmentColorFromPixels(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  palette: readonly GarmentColor[] = GARMENT_COLORS,
): GarmentColor | null {
  if (width <= 0 || height <= 0 || palette.length === 0 || pixels.length < width * height * 4) return null;
  const rgb = dominantRgb(collectSamples(pixels, width, height));
  if (!rgb) return null;
  return { name: nearestGarmentColor(rgb[0], rgb[1], rgb[2], palette).name, hex: rgbToHex(rgb[0], rgb[1], rgb[2]) };
}