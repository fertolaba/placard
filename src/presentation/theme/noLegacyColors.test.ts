import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { contrastRatio } from '../../core/utils/color';
import { darkPalette, lightPalette, type Palette } from '../../core/theme/palettes';

const ROOT = join(__dirname, '..', '..', '..');
const SCANNED = [join(ROOT, 'src', 'presentation'), join(ROOT, 'src', 'app')];

/** Colores del diseño viejo (azul de iOS, grises y negro de fondo). Todo sale de useTheme()/makeStyles. */
const LEGACY: readonly { name: string; pattern: RegExp }[] = [
  { name: 'azul iOS #0A84FF', pattern: /#0A84FF\b/i },
  { name: 'azul iOS #007AFF', pattern: /#007AFF\b/i },
  { name: 'azul de la paleta vieja', pattern: /#(0A60D6|005FCC|0A6CE0|5AA9FF)\b/i },
  { name: 'gris iOS #1C1C1E', pattern: /#1C1C1E\b/i },
  { name: 'fondo negro', pattern: /backgroundColor:\s*['"](#000|#000000|black)['"]/i },
  { name: 'paleta fija vieja', pattern: /core\/theme\/colors['"]/ },
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('colores del diseño viejo', () => {
  it('no aparecen en src/presentation ni en src/app', () => {
    const hits = SCANNED.flatMap(sourceFiles).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          LEGACY.filter(({ pattern }) => pattern.test(line)).map(({ name }) => `${relative(ROOT, file)}:${index + 1} (${name})`),
        ),
    );
    expect(hits).toEqual([]);
  });
});

// [texto, fondo] que se ven en las tarjetas y pantallas
const PAIRS: readonly [keyof Palette, keyof Palette][] = [
  ['text', 'background'],
  ['textMuted', 'background'],
  ['text', 'surface'],
  ['textMuted', 'surface'],
  ['sub2', 'surface'],
  ['sub2', 'background'],
  ['link', 'background'],
  ['link', 'surface'],
  ['link', 'primaryFill'],
  ['textMuted', 'fillMuted'],
  ['onPrimary', 'primary'],
  ['tabActive', 'tabBar'],
  ['sub2', 'tabBar'],
  ['danger', 'background'],
];

describe.each([
  ['noche', darkPalette],
  ['día', lightPalette],
])('paleta %s', (_, palette) => {
  it.each(PAIRS)('%s se lee sobre %s', (foreground, background) => {
    expect(contrastRatio(palette[foreground], palette[background])).toBeGreaterThanOrEqual(4.5);
  });
});
