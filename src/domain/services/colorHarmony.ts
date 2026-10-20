/**
 * Reglas de teoría del color para decidir qué combina con qué.
 * Son funciones puras (sin React ni internet): fáciles de probar y de mejorar.
 */
export interface Hsl {
  h: number; // tono, 0 a 360
  s: number; // saturación, 0 a 1
  l: number; // luminosidad, 0 a 1
}

export function hexToHsl(hex: string): Hsl {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (Math.round(h * 60) + 360) % 360, s, l };
}

/** Neutros de la moda: negro, blanco, grises, tonos tierra suaves (beige, camel) y verdes apagados. */
export function isNeutral({ h, s, l }: Hsl): boolean {
  if (s < 0.18 || l < 0.12 || l > 0.92) return true;
  return h >= 20 && h <= 50 && s < 0.45;
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

/** Qué tan bien se llevan dos colores (de 0 a 1). */
function pairScore(a: Hsl, b: Hsl): number {
  const neutralA = isNeutral(a);
  const neutralB = isNeutral(b);
  if (neutralA && neutralB) return 0.85;
  if (neutralA || neutralB) return 0.8;

  const distance = hueDistance(a.h, b.h);
  if (distance <= 30) return 0.8; // análogos: tonos vecinos
  if (distance >= 150) return 0.75; // complementarios: opuestos
  if (distance >= 100 && distance <= 140) return 0.55; // tríada: funciona con cuidado
  return 0.35; // choque de tonos
}

/** Puntaje de un conjunto de colores, de 0 a 100. */
export function scoreOutfit(hexColors: string[]): number {
  const colors = hexColors.map(hexToHsl);
  if (colors.length < 2) return 0;

  let total = 0;
  let pairs = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      total += pairScore(colors[i], colors[j]);
      pairs++;
    }
  }
  let score = total / pairs;

  // Contraste de luminosidad: un look con claros y oscuros se ve más armado.
  const lightness = colors.map((color) => color.l);
  score += 0.1 * Math.min(1, (Math.max(...lightness) - Math.min(...lightness)) / 0.7);

  // Demasiados colores vivos a la vez le restan.
  if (colors.filter((color) => !isNeutral(color)).length >= 3) score -= 0.15;

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}