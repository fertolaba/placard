/**
 * Convierte las carpetas de assets/referencia/ en src/data/seed/referenteImages.ts.
 *
 * Cada subcarpeta es un referente: su nombre es el id, `avatar.*` es la portada y el resto son looks, ordenados
 * por nombre de archivo. Los archivos sueltos de assets/referencia/ son mockups de diseño y no se tocan.
 *
 * Además de las fotos originales, cada cuadro de la app recibe su recorte de <id>/crops/ (card, avatar y looks/),
 * que genera scripts/frame-referentes.js. Si falta el recorte, va la foto original con el centro de la cara
 * (focus, de framing.json) para alinearla; si la foto tampoco está en framing.json, sin focus.
 *
 * Uso: node scripts/frame-referentes.js && node scripts/generate-referente-images.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'referencia');
const FRAMING_FILE = path.join(SOURCE_DIR, 'framing.json');
const OUTPUT = path.join(ROOT, 'src', 'data', 'seed', 'referenteImages.ts');
// En minúscula a propósito: Metro distingue mayúsculas y no resolvería un require a un .JPG.
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const round3 = (value) => Math.round(value * 1000) / 1000;

const framing = fs.existsSync(FRAMING_FILE) ? (JSON.parse(fs.readFileSync(FRAMING_FILE, 'utf8')).photos ?? {}) : {};

function imagesOf(id) {
  const files = fs
    .readdirSync(path.join(SOURCE_DIR, id), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(byName);
  for (const file of files) {
    if (!EXTENSIONS.has(path.extname(file))) console.warn(`Se ignora ${id}/${file}: extensión no admitida`);
  }
  return files.filter((file) => EXTENSIONS.has(path.extname(file)));
}

const requireOf = (id, file) => `require('../../../assets/referencia/${id}/${file}')`;

let missingCrops = 0;

/** El cuadro de una foto: su recorte si existe; si no, la original con el centro de la cara para alinearla. */
function framedOf(id, file, crop) {
  if (fs.existsSync(path.join(SOURCE_DIR, id, 'crops', crop))) return `{ source: ${requireOf(id, `crops/${crop}`)} }`;
  missingCrops += 1;
  const face = framing[id]?.[file]?.face;
  if (!face) return `{ source: ${requireOf(id, file)} }`;
  const [x0, y0, x1, y1] = face;
  return `{ source: ${requireOf(id, file)}, focus: { x: ${round3((x0 + x1) / 2)}, y: ${round3((y0 + y1) / 2)} } }`;
}

function entryOf(id) {
  const images = imagesOf(id);
  const portada = images.find((file) => path.parse(file).name === 'avatar');
  const looks = images.filter((file) => file !== portada);
  const lines = [`  '${id}': {`];
  if (portada) {
    lines.push(`    portada: ${requireOf(id, portada)},`);
    lines.push(`    card: ${framedOf(id, portada, 'card.jpg')},`);
    lines.push(`    avatar: ${framedOf(id, portada, 'avatar.jpg')},`);
  }
  lines.push('    looks: [', ...looks.map((file) => `      ${requireOf(id, file)},`), '    ],');
  lines.push(
    '    lookThumbs: [',
    ...looks.map((file) => `      ${framedOf(id, file, `looks/${path.parse(file).name}.jpg`)},`),
    '    ],',
    '  },',
  );
  return lines.join('\n');
}

const ids = fs
  .readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort(byName);

const output = `// Generado por scripts/generate-referente-images.js: no editar a mano.
// Metro no admite rutas dinámicas, por eso cada require queda escrito.

/** Una foto lista para su cuadro: el recorte a medida o, si falta, la original con focus (centro de la cara, 0-1). */
export interface FotoEncuadrada {
  source: number;
  focus?: { x: number; y: number };
}

export interface ReferenteImages {
  /** avatar.* original. */
  portada?: number;
  /** Foto apaisada de la tarjeta de destacados. */
  card?: FotoEncuadrada;
  /** Avatar redondo. */
  avatar?: FotoEncuadrada;
  /** Originales, para verlos a pantalla completa. */
  looks: number[];
  /** Miniaturas del carrusel de looks, en el mismo orden que looks. */
  lookThumbs: FotoEncuadrada[];
}

export const REFERENTE_IMAGES: Record<string, ReferenteImages> = {
${ids.map(entryOf).join('\n')}
};
`;

fs.writeFileSync(OUTPUT, output);
console.log(`${path.relative(ROOT, OUTPUT)}: ${ids.length} referente(s)`);
if (missingCrops > 0) {
  console.warn(`${missingCrops} cuadro(s) sin recorte usan la foto original: corré node scripts/frame-referentes.js.`);
}
