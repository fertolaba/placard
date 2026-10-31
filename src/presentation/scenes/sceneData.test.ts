import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'react-native-svg';
import { SEASON_THEMES, type SeasonScheme } from '../../core/theme/seasonThemes';
import { contrastRatio } from '../../core/utils/color';
import type { Season } from '../../domain/entities/Season';
import { SCENE_DATA } from './generated/sceneData';

const SCENES_DIR = path.join(__dirname, '..', '..', '..', 'assets', 'scenes');
const SHAPES = /<(?:path|circle|rect|ellipse)\b[^>]*?\/?>/g;

/** Las formas del dibujo, en orden y con sus atributos exactos (data-anim no es parte del dibujo). */
function shapesOf(xml: string): string[] {
  const withoutDefs = xml.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  return (withoutDefs.match(SHAPES) ?? []).map((shape) => shape.replace(/\s*data-anim="[a-zA-Z]+"/, '').replace(/\s*\/?>$/, ''));
}

describe('escenas generadas', () => {
  it.each(Object.keys(SCENE_DATA))('%s conserva cada forma del SVG, en el mismo orden', (name) => {
    const source = fs.readFileSync(path.join(SCENES_DIR, `${name}.svg`), 'utf8');
    const generated = SCENE_DATA[name].layers.map((layer) => layer.xml).join('');
    expect(shapesOf(generated)).toEqual(shapesOf(source));
  });

  it.each(Object.keys(SCENE_DATA))('%s tiene capas que SvgXml puede leer', (name) => {
    for (const layer of SCENE_DATA[name].layers) {
      expect(parse(`<svg viewBox="0 0 390 210">${layer.xml}</svg>`)).not.toBeNull();
    }
  });

  it.each(Object.keys(SCENE_DATA))('%s conserva cada animación marcada', (name) => {
    const source = fs.readFileSync(path.join(SCENES_DIR, `${name}.svg`), 'utf8');
    const marked = (source.match(/data-anim="([a-zA-Z]+)"/g) ?? []).map((mark) => mark.slice(11, -1));
    expect(SCENE_DATA[name].layers.flatMap((layer) => (layer.anim ? [layer.anim] : []))).toEqual(marked);
  });
});

// El encabezado ocupa de 56 a 118 px de una escena de 222: el cielo se evalúa en esa franja.
const HEADER_TOP = 56 / 222;
const HEADER_BOTTOM = 118 / 222;

function mix(from: string, to: string, amount: number): string {
  const channel = (hex: string, start: number) => parseInt(hex.slice(start, start + 2), 16);
  const part = (start: number) =>
    Math.round(channel(from, start) + (channel(to, start) - channel(from, start)) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${part(1)}${part(3)}${part(5)}`;
}

const HEADERS = Object.keys(SCENE_DATA).map((name) => {
  const [season, moment] = name.split('-');
  const scheme: SeasonScheme = moment === 'dia' ? 'light' : 'dark';
  return { name, sky: SCENE_DATA[name].sky, theme: SEASON_THEMES[season as Season][scheme] };
});

describe('contraste del encabezado sobre el cielo', () => {
  it.each(HEADERS)('$name deja leer título y contador', ({ sky, theme }) => {
    for (const amount of [HEADER_TOP, HEADER_BOTTOM]) {
      const background = mix(sky[0], sky[1], amount);
      for (const color of [theme.text, theme.headerMuted]) {
        expect({ background, color, ok: contrastRatio(color, background) >= 4.5 }).toEqual({ background, color, ok: true });
      }
    }
  });
});
