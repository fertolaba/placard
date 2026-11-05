/**
 * Mira las fotos de un referente con Gemini y deja un BORRADOR en scripts/out/ para revisar y pegar a mano en el seed.
 * Nunca modifica src/data/seed/referentes.ts.
 *
 * Uso:
 *   node scripts/analyze-referentes.js rauw                              un referente (id = nombre de su carpeta)
 *   node scripts/analyze-referentes.js --all                             todas las carpetas de assets/referencia/
 *   node scripts/analyze-referentes.js otro-id --nombre "Otro Nombre"    un referente que todavía no está en el seed
 *   --force                                                              vuelve a pedir un borrador que ya existe
 *
 * El borrador también trae formality, formalityRange y graphics (formalidad y tolerancia a estampas), que usa el
 * matching de "Tus prendas" del referente: pegalos en su entrada del seed como el resto.
 *
 * La clave sale de EXPO_PUBLIC_GEMINI_API_KEY (.env.local o variable de entorno).
 * Para más precisión, elegí otro modelo con la variable GEMINI_MODEL.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'referencia');
const OUT_DIR = path.join(__dirname, 'out');
const SEED_FILE = path.join(ROOT, 'src', 'data', 'seed', 'referentes.ts');
const COLORS_FILE = path.join(ROOT, 'src', 'domain', 'services', 'garmentColors.ts');

// Copiado de GEMINI_MODEL en src/data/ai/detectGarmentCategory.ts (ese archivo es TypeScript y acá no se puede importar).
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 60_000;
const RETRY_DELAYS_MS = [2_000, 5_000];
const MAX_LOOKS = 8;
const WARN_FILE_BYTES = 1024 * 1024;

// Copiado de FORMALIDADES (src/domain/entities/Formality.ts) y TOLERANCIAS_GRAFICAS (src/domain/entities/Referente.ts).
const FORMALIDADES = ['clasico', 'casual', 'deportivo'];
const TOLERANCIAS_GRAFICAS = ['solo-liso', 'logo-ok', 'grafico-ok'];

const MIME_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Copiado de GARMENT_CUTS en src/domain/entities/Garment.ts.
const CUTS = {
  arriba: ['ajustado', 'regular', 'oversize', 'boxy', 'cropped'],
  top: ['ajustado', 'regular', 'oversize', 'cropped'],
  abajo: ['skinny', 'slim', 'straight', 'baggy', 'wide leg', 'flared'],
  pollera: ['lápiz', 'recta', 'acampanada', 'tableada', 'cruzada'],
  calzado: [],
};

// Colores que no están en la lista pero que un modelo puede nombrar: dan un RGB para buscar el más cercano.
const KNOWN_COLORS = { plateado: '#C0C0C0', plata: '#C0C0C0', dorado: '#D4AF37', oro: '#D4AF37', metalizado: '#A8A9AD' };

const normalizeName = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const oneLine = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(argv) {
  const args = { ids: [], all: false, force: false, nombre: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') args.all = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--nombre') {
      i += 1;
      if (!argv[i]) throw new Error('Falta el valor de --nombre.');
      args.nombre = argv[i];
    } else if (arg.startsWith('--')) throw new Error(`Opción desconocida: ${arg}`);
    else args.ids.push(arg);
  }
  if (args.all === (args.ids.length > 0) || args.ids.length > 1) {
    throw new Error('Indicá un id o --all. Ejemplo: node scripts/analyze-referentes.js rauw');
  }
  if (args.all && args.nombre) throw new Error('--nombre sirve para un solo referente, no con --all.');
  return args;
}

function loadApiKey() {
  try {
    process.loadEnvFile(path.join(ROOT, '.env.local'));
  } catch {
    // Sin .env.local: queda la variable de entorno.
  }
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('Falta EXPO_PUBLIC_GEMINI_API_KEY: agregala a .env.local o como variable de entorno.');
  return key;
}

function loadColors() {
  const source = fs.readFileSync(COLORS_FILE, 'utf8');
  const colors = [...source.matchAll(/\{\s*name:\s*'([^']+)',\s*hex:\s*'(#[0-9A-Fa-f]{6})'\s*\}/g)].map(([, name, hex]) => ({
    name,
    hex: hex.toUpperCase(),
  }));
  if (colors.length === 0) throw new Error(`No se encontraron colores en ${path.relative(ROOT, COLORS_FILE)}.`);
  return colors;
}

/** Las constantes de color del seed, por hex: { '#26262B': 'NEGRO', ... }. */
function loadSeedConstants(seedSource) {
  const constants = {};
  for (const [, name, hex] of seedSource.matchAll(/const ([A-Z_]+) = '(#[0-9A-Fa-f]{6})';/g)) constants[hex.toUpperCase()] = name;
  return constants;
}

/** Los campos que se conservan del seed, tal como están escritos. null si el referente no existe. */
function findInSeed(seedSource, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = seedSource.match(new RegExp(`\\bid:\\s*'${escaped}',[\\s\\S]*?\\bdestacado:\\s*(?:true|false)`))?.[0];
  if (!block) return null;
  const raw = (field) => block.match(new RegExp(`\\b${field}:\\s*(.+?),?\\s*$`, 'm'))?.[1] ?? null;
  const nombre = raw('nombre')?.match(/^'(.*)'$/)?.[1];
  if (!nombre) return null;
  return {
    nombre,
    iniciales: raw('iniciales'),
    colorAvatar: raw('colorAvatar'),
    colorTarjeta: raw('colorTarjeta'),
    estilo: raw('estilo'),
    destacado: raw('destacado'),
  };
}

function listFolders() {
  return fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Hasta MAX_LOOKS fotos por orden alfabético, sin el avatar. */
function loadLooks(id) {
  const dir = path.join(SOURCE_DIR, id);
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((file) => MIME_TYPES[path.extname(file).toLowerCase()] && path.parse(file).name.toLowerCase() !== 'avatar')
    .sort();
  if (files.length > MAX_LOOKS) console.warn(`[${id}] Hay ${files.length} looks: se usan los primeros ${MAX_LOOKS}.`);
  return files.slice(0, MAX_LOOKS).map((file) => {
    const data = fs.readFileSync(path.join(dir, file));
    if (data.length > WARN_FILE_BYTES) {
      // El proyecto no tiene una librería para achicar imágenes desde Node y no se agregan dependencias.
      console.warn(`[${id}] ${file} pesa más de 1 MB y se manda tal cual: no hay librería de imágenes para reducirla.`);
    }
    return { mimeType: MIME_TYPES[path.extname(file).toLowerCase()], base64: data.toString('base64') };
  });
}

// Las definiciones de categoría y corte están copiadas del prompt de src/data/ai/detectGarmentCategory.ts.
function buildPrompt(nombre, colors) {
  const colorNames = colors.map((color) => `"${color.name}"`).join(', ');
  return `Te paso fotos de looks de ${nombre}. Ya sabemos quién es: NO intentes reconocer a nadie por la cara ni agregues datos que no se vean. Describí solo la ropa y los accesorios que se ven en las fotos, en español rioplatense (voseo, nombres comunes de Argentina).

Devolvé este JSON:
- resumen: una frase de hasta 90 caracteres sobre cómo se viste, sin repetir el nombre.
- claves: exactamente 3 objetos { titulo (máximo 5 palabras), descripcion (máximo 12 palabras) } sobre patrones que se repiten en varias fotos.
- paleta: 3 o 4 nombres de color de la lista, los que más aparecen en la ropa (no en el fondo ni en la piel).
- prendasClave: entre 5 y 8 prendas que se repitan o se destaquen, cada una con { nombre (por ejemplo "Chaqueta negra"), categoria, color (nombre de la lista), corte }. Los accesorios pueden aparecer en las claves, pero no en prendasClave.
- etiquetas: 3 palabras clave de estilo.
- formalidad: el nivel que predomina en la ropa de las fotos. "clasico": camisas, chombas, sacos, pilotos, sastrería, mocasines. "casual": jeans, remeras, buzos y camperas urbanas, zapatillas urbanas. "deportivo": ropa deportiva o técnica (camperas tipo Nike Tech o de nylon, conjuntos deportivos, joggers técnicos, camisetas de fútbol, botines).
- formalidadMin y formalidadMax: el rango que se ve en las fotos, de lo más formal a lo más deportivo, con los mismos valores. Si nunca aparece ropa deportiva o técnica, formalidadMax NO puede ser "deportivo". Si nunca aparece nada clásico, formalidadMin NO puede ser "clasico".
- graficos: cuánta estampa usa. "solo-liso": casi todo liso, sin logos ni letras a la vista. "logo-ok": logos o textos chicos sí, estampas grandes no. "grafico-ok": usa estampas, letras grandes o dibujos protagonistas.
- confianza: "alta", "media" o "baja" según cuánto se ve la ropa en las fotos (por ejemplo "baja" si la mayoría son retratos de la cara).
- notas: cualquier duda en una frase corta.

Lista de colores, escritos exactamente igual: ${colorNames}.

categoria: elegí uno de estos valores exactos.
- "top": prenda de arriba femenina, corta o de tiras, que suele dejar ver hombros, escote o cintura: top de tiras, crop top, top strapless o bandeau, corset, corpiño deportivo usado como prenda, body, top halter.
- "arriba": el resto de las prendas de arriba: remeras, musculosas comunes, camisas, chombas, buzos, sweaters, camperas, abrigos.
- "pollera": falda de cualquier largo (mini, midi o larga), también la pollera-short. Se reconoce porque es una sola pieza de tela que cae desde la cintura sin separarse en dos piernas.
- "abajo": pantalones, jeans, joggers, calzas, shorts y bermudas (todo lo que tiene dos piernas).
- "calzado": zapatillas, zapatos, botas, sandalias, ojotas.

corte: mirá la silueta de la prenda (qué tan pegada va al cuerpo, el ancho y el largo) y elegí uno de estos valores exactos de su categoría, o "" si no se puede ver.
- Arriba: "ajustado" (pegada al cuerpo), "regular" (calce clásico, ni pegada ni suelta), "oversize" (holgada, hombros caídos, más grande que el talle), "boxy" (recta y ancha, de forma cuadrada, largo hasta la cadera), "cropped" (corta, deja ver la cintura).
- Top: "ajustado" (pegado al cuerpo, como un corset o un body), "regular" (calce clásico), "oversize" (holgado), "cropped" (corto, deja ver la cintura).
- Abajo: "skinny" (pegado a toda la pierna), "slim" (angosto pero no pegado), "straight" (recto desde la cadera hasta el tobillo), "baggy" (holgado, con mucha tela, suele angostarse abajo), "wide leg" (ancho desde la cadera y en toda la pierna), "flared" (acampanado, oxford o pata de elefante: ajustado hasta la rodilla y se abre recién de la rodilla para abajo).
- Pollera: "lápiz" (angosta y pegada, se cierra hacia la rodilla), "recta" (cae derecha desde la cadera, sin abrirse), "acampanada" (se abre desde la cintura en forma de A, sin pliegues marcados), "tableada" (con tablas o pliegues planchados, como la de colegio o una plisada), "cruzada" (envolvente o wrap: una tela se cruza sobre la otra adelante).
- Calzado: siempre "".`;
}

function buildSchema(colors) {
  const colorEnum = colors.map((color) => color.name);
  return {
    type: 'OBJECT',
    properties: {
      resumen: { type: 'STRING' },
      claves: {
        type: 'ARRAY',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'OBJECT',
          properties: { titulo: { type: 'STRING' }, descripcion: { type: 'STRING' } },
          required: ['titulo', 'descripcion'],
        },
      },
      paleta: { type: 'ARRAY', minItems: 3, maxItems: 4, items: { type: 'STRING', enum: colorEnum } },
      prendasClave: {
        type: 'ARRAY',
        minItems: 5,
        maxItems: 8,
        items: {
          type: 'OBJECT',
          properties: {
            nombre: { type: 'STRING' },
            categoria: { type: 'STRING', enum: Object.keys(CUTS) },
            color: { type: 'STRING', enum: colorEnum },
            // El esquema no puede atar el corte a la categoría: eso lo revisa normalize.
            corte: { type: 'STRING' },
          },
          required: ['nombre', 'categoria', 'color', 'corte'],
          propertyOrdering: ['nombre', 'categoria', 'color', 'corte'],
        },
      },
      etiquetas: { type: 'ARRAY', minItems: 3, maxItems: 3, items: { type: 'STRING' } },
      formalidad: { type: 'STRING', enum: FORMALIDADES },
      formalidadMin: { type: 'STRING', enum: FORMALIDADES },
      formalidadMax: { type: 'STRING', enum: FORMALIDADES },
      graficos: { type: 'STRING', enum: TOLERANCIAS_GRAFICAS },
      confianza: { type: 'STRING', enum: ['alta', 'media', 'baja'] },
      notas: { type: 'STRING' },
    },
    required: ['resumen', 'claves', 'paleta', 'prendasClave', 'etiquetas', 'formalidad', 'formalidadMin', 'formalidadMax', 'graficos', 'confianza', 'notas'],
    propertyOrdering: ['resumen', 'claves', 'paleta', 'prendasClave', 'etiquetas', 'formalidad', 'formalidadMin', 'formalidadMax', 'graficos', 'confianza', 'notas'],
  };
}

async function requestOnce(body, apiKey, model) {
  let response;
  try {
    // La clave va en un encabezado y no en la URL, así no queda en logs ni en mensajes de error.
    response = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new Error(`Gemini tardó más de ${TIMEOUT_MS / 1000} s en responder.`);
    throw new Error('No se pudo conectar con Gemini.');
  }
  const json = await response.json().catch(() => null);
  return { status: response.status, ok: response.ok, json };
}

/** Una sola llamada por referente; reintenta ante 429 o 5xx. */
async function callGemini(id, nombre, looks, colors, apiKey, model) {
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          ...looks.map((look) => ({ inline_data: { mime_type: look.mimeType, data: look.base64 } })),
          { text: buildPrompt(nombre, colors) },
        ],
      },
    ],
    generationConfig: { responseMimeType: 'application/json', responseSchema: buildSchema(colors) },
  });

  for (let attempt = 0; ; attempt += 1) {
    const { status, ok, json } = await requestOnce(body, apiKey, model);
    if (ok) {
      if (json?.promptFeedback?.blockReason) throw new Error(`Gemini no analizó las fotos (${json.promptFeedback.blockReason}).`);
      const candidate = json?.candidates?.[0];
      const text = candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
      if (text === '') throw new Error(`Gemini no devolvió ninguna respuesta (${candidate?.finishReason ?? 'sin motivo'}).`);
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Gemini devolvió un JSON inválido.');
      }
    }
    const retriable = status === 429 || status >= 500;
    if (!retriable || attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(json?.error?.message ?? `Gemini respondió ${status}.`);
    }
    console.warn(`[${id}] Gemini respondió ${status}: reintento en ${RETRY_DELAYS_MS[attempt] / 1000} s.`);
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
}

const hexToRgb = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

function nearestColor(hex, colors) {
  const [r, g, b] = hexToRgb(hex);
  let best = colors[0];
  let bestDistance = Infinity;
  for (const color of colors) {
    const [cr, cg, cb] = hexToRgb(color.hex);
    const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (distance < bestDistance) {
      best = color;
      bestDistance = distance;
    }
  }
  return best;
}

/** El hex de la lista para lo que dijo Gemini; null si no hay un RGB del cual partir para buscar el más cercano. */
function resolveColor(value, colors) {
  const text = oneLine(value);
  const key = normalizeName(text);
  const exact = colors.find((color) => normalizeName(color.name) === key);
  if (exact) return exact.hex;
  const reference = /^#[0-9a-f]{6}$/.test(key) ? key : KNOWN_COLORS[key];
  return reference ? nearestColor(reference, colors).hex : null;
}

/** Deja la respuesta en el formato del seed y anota lo que haya que revisar a mano. */
function normalize(raw, colors) {
  const avisos = [];

  const paleta = [];
  for (const value of Array.isArray(raw.paleta) ? raw.paleta : []) {
    const hex = resolveColor(value, colors);
    if (!hex) avisos.push(`Color de paleta descartado: "${oneLine(value)}".`);
    else if (!paleta.includes(hex)) paleta.push(hex);
  }

  const prendasClave = [];
  for (const prenda of Array.isArray(raw.prendasClave) ? raw.prendasClave : []) {
    const nombre = oneLine(prenda?.nombre);
    const colorHex = resolveColor(prenda?.color, colors);
    if (!CUTS[prenda?.categoria]) {
      avisos.push(`Prenda descartada por categoría inválida: "${nombre}".`);
    } else if (!colorHex) {
      avisos.push(`Prenda descartada por color desconocido: "${nombre}" (${oneLine(prenda?.color)}).`);
    } else {
      const corte = CUTS[prenda.categoria].includes(prenda.corte) ? prenda.corte : undefined;
      prendasClave.push({ nombre, categoria: prenda.categoria, colorHex, ...(corte ? { corte } : {}) });
    }
  }

  const claves = (Array.isArray(raw.claves) ? raw.claves : []).map((clave) => ({
    titulo: oneLine(clave?.titulo),
    descripcion: oneLine(clave?.descripcion),
  }));
  const etiquetas = (Array.isArray(raw.etiquetas) ? raw.etiquetas : []).map(oneLine);
  const resumen = oneLine(raw.resumen);

  if (resumen.length > 90) avisos.push(`El resumen tiene ${resumen.length} caracteres (máximo 90).`);
  if (claves.length !== 3) avisos.push(`Hay ${claves.length} claves (se pidieron 3).`);
  for (const clave of claves) {
    if (countWords(clave.titulo) > 5) avisos.push(`Título largo: "${clave.titulo}".`);
    if (countWords(clave.descripcion) > 12) avisos.push(`Descripción larga: "${clave.descripcion}".`);
  }
  if (paleta.length < 3 || paleta.length > 4) avisos.push(`La paleta tiene ${paleta.length} colores (se pidieron 3 o 4).`);
  if (prendasClave.length < 5 || prendasClave.length > 8) avisos.push(`Hay ${prendasClave.length} prendas (se pidieron entre 5 y 8).`);
  if (etiquetas.length !== 3) avisos.push(`Hay ${etiquetas.length} etiquetas (se pidieron 3).`);

  // Formalidad: un valor fuera de la lista se descarta (el referente queda sin filtro de formalidad).
  const formality = FORMALIDADES.includes(raw.formalidad) ? raw.formalidad : null;
  if (!formality) avisos.push(`Formalidad descartada: "${oneLine(raw.formalidad)}".`);
  let formalityRange = null;
  if (FORMALIDADES.includes(raw.formalidadMin) && FORMALIDADES.includes(raw.formalidadMax)) {
    const rank = (level) => FORMALIDADES.indexOf(level);
    let [min, max] = [raw.formalidadMin, raw.formalidadMax];
    if (rank(min) > rank(max)) [min, max] = [max, min];
    if (formality && (rank(formality) < rank(min) || rank(formality) > rank(max))) {
      avisos.push(`La formalidad predominante (${formality}) quedaba fuera del rango ${min}-${max}: se amplió el rango.`);
      if (rank(formality) < rank(min)) min = formality;
      else max = formality;
    }
    formalityRange = [min, max];
  } else {
    avisos.push('Rango de formalidad descartado: sin rango, se usa un nivel para cada lado del predominante.');
  }
  const graphics = TOLERANCIAS_GRAFICAS.includes(raw.graficos) ? raw.graficos : null;
  if (!graphics) avisos.push(`Tolerancia a estampas descartada: "${oneLine(raw.graficos)}".`);

  const confianza = ['alta', 'media', 'baja'].includes(raw.confianza) ? raw.confianza : 'desconocida';
  return {
    resumen,
    claves,
    paleta,
    prendasClave,
    etiquetas,
    formality,
    formalityRange,
    graphics,
    confianza,
    notas: oneLine(raw.notas),
    avisos,
  };
}

const quote = (text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function buildSeedText(id, nombre, seedEntry, draft, constants) {
  const color = (hex) => constants[hex] ?? `'${hex}'`;
  const kept = (field, placeholder) => (seedEntry?.[field] ? `${seedEntry[field]},` : `${placeholder}, // completar`);
  const lines = [
    `// BORRADOR de Gemini para revisar. Confianza: ${draft.confianza}.`,
    `// Notas: ${draft.notas || 'sin notas'}`,
    ...draft.avisos.map((aviso) => `// Revisar: ${oneLine(aviso)}`),
    '{',
    `  id: ${quote(id)},`,
    `  nombre: ${seedEntry ? `'${seedEntry.nombre}'` : quote(nombre)},`,
    `  iniciales: ${kept('iniciales', "''")}`,
    `  colorAvatar: ${kept('colorAvatar', "'#000000'")}`,
    `  colorTarjeta: ${kept('colorTarjeta', "'#000000'")}`,
    `  estilo: ${kept('estilo', "'Minimal'")}`,
    `  etiquetas: [${draft.etiquetas.map(quote).join(', ')}],`,
    `  resumen: ${quote(draft.resumen)},`,
    '  claves: [',
    ...draft.claves.map((clave) => `    { titulo: ${quote(clave.titulo)}, descripcion: ${quote(clave.descripcion)} },`),
    '  ],',
    `  paleta: [${draft.paleta.map(color).join(', ')}],`,
    '  prendasClave: [',
    ...draft.prendasClave.map(
      (prenda) =>
        `    { nombre: ${quote(prenda.nombre)}, categoria: '${prenda.categoria}', colorHex: ${color(prenda.colorHex)}${
          prenda.corte ? `, corte: ${quote(prenda.corte)}` : ''
        } },`,
    ),
    '  ],',
    `  destacado: ${kept('destacado', 'false')}`,
    ...(draft.formality ? [`  formality: ${quote(draft.formality)},`] : []),
    ...(draft.formalityRange ? [`  formalityRange: [${draft.formalityRange.map(quote).join(', ')}],`] : []),
    ...(draft.graphics ? [`  graphics: ${quote(draft.graphics)},`] : []),
    '},',
  ];
  return `${lines.join('\n')}\n`;
}

async function analyze(id, { force, nombreArg, seedSource, constants, colors, apiKey, model }) {
  const jsonPath = path.join(OUT_DIR, `${id}.json`);
  const seedPath = path.join(OUT_DIR, `${id}.seed.txt`);
  const relative = (file) => path.relative(ROOT, file);

  if (!force && fs.existsSync(jsonPath) && fs.existsSync(seedPath)) {
    console.log(`${id}: ya tiene borrador (${relative(jsonPath)}). Usá --force para pedirlo de nuevo.`);
    return;
  }
  if (!fs.existsSync(path.join(SOURCE_DIR, id))) throw new Error(`No existe la carpeta assets/referencia/${id}/.`);

  const seedEntry = findInSeed(seedSource, id);
  const nombre = seedEntry?.nombre.replace(/\\'/g, "'") ?? nombreArg;
  if (!nombre) throw new Error(`No está en el seed: indicá el nombre con --nombre "Nombre Apellido".`);

  const looks = loadLooks(id);
  if (looks.length === 0) throw new Error(`No hay looks en assets/referencia/${id}/ (el avatar no cuenta).`);

  const raw = await callGemini(id, nombre, looks, colors, apiKey, model);
  const draft = normalize(raw, colors);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify({ id, nombre, modelo: model, fotos: looks.length, ...draft }, null, 2)}\n`);
  fs.writeFileSync(seedPath, buildSeedText(id, nombre, seedEntry, draft, constants));

  console.log(`${id}: ${looks.length} foto(s), confianza ${draft.confianza}`);
  const range = draft.formalityRange ? ` (rango ${draft.formalityRange.join('-')})` : '';
  console.log(`  formalidad ${draft.formality ?? 'sin dato'}${range} · estampas ${draft.graphics ?? 'sin dato'}`);
  console.log(`  ${relative(jsonPath)}`);
  console.log(`  ${relative(seedPath)}`);
  if (draft.avisos.length > 0) console.warn(`  ${draft.avisos.length} aviso(s) para revisar: están en el borrador.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = loadApiKey();
  const context = {
    force: args.force,
    nombreArg: args.nombre,
    seedSource: fs.readFileSync(SEED_FILE, 'utf8'),
    colors: loadColors(),
    apiKey,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  };
  context.constants = loadSeedConstants(context.seedSource);

  // Un referente que falla no frena a los demás.
  for (const id of args.all ? listFolders() : args.ids) {
    try {
      await analyze(id, context);
    } catch (error) {
      console.error(`${id}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
