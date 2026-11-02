/**
 * Convierte las carpetas de assets/referencia/ en src/data/seed/referenteImages.ts.
 *
 * Cada subcarpeta es un referente: su nombre es el id, `avatar.*` es la portada y el resto son looks, ordenados
 * por nombre de archivo. Los archivos sueltos de assets/referencia/ son mockups de diseño y no se tocan.
 *
 * Uso: node scripts/generate-referente-images.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'referencia');
const OUTPUT = path.join(ROOT, 'src', 'data', 'seed', 'referenteImages.ts');
// En minúscula a propósito: Metro distingue mayúsculas y no resolvería un require a un .JPG.
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

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

function entryOf(id) {
  const images = imagesOf(id);
  const avatar = images.find((file) => path.parse(file).name === 'avatar');
  const looks = images.filter((file) => file !== avatar);
  const lines = [`  '${id}': {`];
  if (avatar) lines.push(`    avatar: ${requireOf(id, avatar)},`);
  lines.push('    looks: [', ...looks.map((file) => `      ${requireOf(id, file)},`), '    ],', '  },');
  return lines.join('\n');
}

const ids = fs
  .readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort(byName);

const output = `// Generado por scripts/generate-referente-images.js: no editar a mano.
// Metro no admite rutas dinámicas, por eso cada require queda escrito.
export const REFERENTE_IMAGES: Record<string, { avatar?: number; looks: number[] }> = {
${ids.map(entryOf).join('\n')}
};
`;

fs.writeFileSync(OUTPUT, output);
console.log(`${path.relative(ROOT, OUTPUT)}: ${ids.length} referente(s)`);
