/**
 * Convierte assets/scenes/*.svg en src/presentation/scenes/generated/sceneData.ts.
 *
 * Separa cada SVG en capas, en su orden original: lo quieto por un lado y cada elemento con data-anim por otro.
 * Los dibujos se copian tal cual; lo único que se calcula es el recuadro de cada capa animada, para que la
 * vista que la mueve mida lo justo. Ese cálculo lo hace Chrome (getBBox).
 *
 * Uso: node scripts/generate-scenes.js        (ruta de Chrome opcional en la variable CHROME_PATH)
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'scenes');
const OUTPUT = path.join(ROOT, 'src', 'presentation', 'scenes', 'generated', 'sceneData.ts');
const SCENES = ['verano-dia', 'verano-noche', 'entretiempo-dia', 'entretiempo-noche', 'invierno-dia', 'invierno-noche'];
const BOX_PADDING = 4; // getBBox no cuenta el grosor del trazo
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function parse(xml) {
  const root = { tag: 'root', attrs: '', children: [] };
  const stack = [root];
  for (const [, closing, tag, attrs, selfClosed] of xml.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    if (closing) {
      stack.pop();
      continue;
    }
    const node = { tag, attrs: attrs.trim(), children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosed) stack.push(node);
  }
  return root.children[0];
}

const animOf = (node) => node.attrs.match(/data-anim="([a-zA-Z]+)"/)?.[1] ?? null;
const hasAnim = (node) => animOf(node) !== null || node.children.some(hasAnim);

function serialize(node) {
  const attrs = node.attrs.replace(/\s*data-anim="[a-zA-Z]+"/, '').trim();
  const open = attrs ? `${node.tag} ${attrs}` : node.tag;
  // Estos SVG no tienen nodos de texto: alcanza con reescribir los elementos.
  return node.children.length ? `<${open}>${node.children.map(serialize).join('')}</${node.tag}>` : `<${open}/>`;
}

function wrap(ancestors, xml) {
  return ancestors.reduceRight((inner, { attrs }) => `<g${attrs ? ` ${attrs}` : ''}>${inner}</g>`, xml);
}

/** Recorre el dibujo en orden: junta lo quieto consecutivo y separa cada elemento animado. */
function splitLayers(svg) {
  const layers = [];
  let still = '';
  const flush = () => {
    if (still) layers.push({ anim: null, xml: still });
    still = '';
  };
  const walk = (nodes, ancestors) => {
    for (const node of nodes) {
      if (node.tag === 'defs') continue;
      if (animOf(node)) {
        flush();
        layers.push({ anim: animOf(node), xml: wrap(ancestors, serialize(node)) });
      } else if (hasAnim(node)) {
        walk(node.children, [...ancestors, node]);
      } else {
        still += wrap(ancestors, serialize(node));
      }
    }
  };
  walk(svg.children, []);
  flush();
  return layers;
}

function measureBoxes(layers) {
  const items = layers.map((xml, index) => `<svg viewBox="0 0 390 210" width="390" height="210"><g id="m${index}">${xml}</g></svg>`);
  const html = `<!doctype html><body>${items.join('')}<pre id="out"></pre><script>
    const boxes = [...document.querySelectorAll('g[id^=m]')].map((g) => { const b = g.getBBox(); return [b.x, b.y, b.width, b.height]; });
    document.getElementById('out').textContent = btoa(JSON.stringify(boxes));
  </script></body>`;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'scenes-')), 'measure.html');
  fs.writeFileSync(file, html);
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--virtual-time-budget=2000', '--dump-dom', `file:///${file.replace(/\\/g, '/')}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 1 << 26,
  });
  const encoded = dom.match(/<pre id="out">([^<]+)<\/pre>/)[1];
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
}

const round = (value) => Math.round(value * 100) / 100;

const scenes = {};
for (const name of SCENES) {
  const svg = parse(fs.readFileSync(path.join(SOURCE_DIR, `${name}.svg`), 'utf8'));
  const defs = svg.children.find((node) => node.tag === 'defs');
  const defsById = new Map((defs?.children ?? []).map((node) => [node.attrs.match(/id="([^"]+)"/)[1], serialize(node)]));
  // Cada capa lleva solo las definiciones que usa.
  const withDefs = (xml) => {
    const used = [...xml.matchAll(/url\(#([^)]+)\)/g)].map((match) => defsById.get(match[1]));
    return used.length ? `<defs>${[...new Set(used)].join('')}</defs>${xml}` : xml;
  };

  const layers = splitLayers(svg);
  const boxes = measureBoxes(layers.map((layer) => withDefs(layer.xml)));
  const sky = (defs?.children ?? [])
    .find((node) => node.tag === 'linearGradient')
    .children.map((stop) => stop.attrs.match(/stop-color="([^"]+)"/)[1]);

  scenes[name] = {
    sky,
    layers: layers.map((layer, index) => {
      if (!layer.anim) return { anim: null, xml: withDefs(layer.xml) };
      const [x, y, width, height] = boxes[index];
      return {
        anim: layer.anim,
        xml: withDefs(layer.xml),
        box: [round(x - BOX_PADDING), round(y - BOX_PADDING), round(width + BOX_PADDING * 2), round(height + BOX_PADDING * 2)],
      };
    }),
  };
}

const output = `// Generado por scripts/generate-scenes.js a partir de assets/scenes/*.svg. No editar a mano.
import type { SceneData } from '../parts/sceneTypes';

export const SCENE_DATA: Record<string, SceneData> = ${JSON.stringify(scenes, null, 2)};
`;
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, output);
for (const [name, { layers }] of Object.entries(scenes)) {
  const animated = layers.filter((layer) => layer.anim);
  console.log(`${name}: ${layers.length} capas, ${animated.length} animadas`);
}
