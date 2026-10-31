import { contrastRatio } from '../utils/color';
import { SEASON_THEMES, type SeasonScheme, type SeasonThemeColor } from './seasonThemes';

const MIN_CONTRAST = 4.5;

// [color de la letra o el ícono, fondo sobre el que se muestra]
const PAIRS: readonly [SeasonThemeColor, SeasonThemeColor][] = [
  ['text', 'background'],
  ['textMuted', 'background'],
  ['headerMuted', 'background'],
  ['text', 'card'],
  ['textMuted', 'card'],
  ['headerButtonColor', 'headerButtonBackground'],
  ['seasonIcon', 'seasonCircle'],
  ['seasonActiveIcon', 'seasonActive'],
  ['seasonLabel', 'background'],
  ['activeText', 'background'],
  ['categoryText', 'categoryTrack'],
  ['categorySelectedText', 'categorySelected'],
  ['tabActive', 'tabBar'],
  ['tabInactive', 'tabBar'],
  ['addButton', 'card'],
];

const COMBINATIONS = Object.entries(SEASON_THEMES).flatMap(([season, schemes]) =>
  (Object.keys(schemes) as SeasonScheme[]).map((scheme) => ({ name: `${season} ${scheme}`, theme: schemes[scheme] })),
);

describe('temas por estación', () => {
  it('son 4 estaciones por 2 modos', () => {
    expect(COMBINATIONS).toHaveLength(8);
  });

  it.each(COMBINATIONS)('$name cumple el contraste mínimo', ({ theme }) => {
    for (const [foreground, background] of PAIRS) {
      expect({ foreground, background, ok: contrastRatio(theme[foreground], theme[background]) >= MIN_CONTRAST }).toEqual({
        foreground,
        background,
        ok: true,
      });
    }
  });
});

describe('contrastRatio', () => {
  it('da 21 entre blanco y negro, sin importar el orden', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
  });

  it('da 1 entre dos colores iguales', () => {
    expect(contrastRatio('#FFD84D', '#FFD84D')).toBeCloseTo(1);
  });
});
