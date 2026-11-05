/**
 * Encuadra las fotos de los referentes: Gemini marca la persona y la cara una sola vez por foto y, con esas cajas,
 * se generan recortes a la medida de cada cuadro de la app.
 *
 * Para fotos nuevas:
 *   node scripts/frame-referentes.js            analiza solo las fotos que no están en framing.json y rehace los recortes
 *   node scripts/generate-referente-images.js   actualiza src/data/seed/referenteImages.ts
 *
 * Opciones: --force vuelve a analizar todas las fotos; --offline no llama a Gemini (solo rehace los recortes).
 *
 * - Las cajas quedan en assets/referencia/framing.json (versionado), por id y nombre de archivo. Si una foto cambia
 *   de contenido con el mismo nombre, se vuelve a analizar.
 * - Los recortes van a assets/referencia/<id>/crops/: card.jpg y avatar.jpg salen de avatar.* (la portada) y
 *   looks/<nombre>.jpg de cada look. Las fotos originales no se tocan.
 * - La clave sale de EXPO_PUBLIC_GEMINI_API_KEY (.env.local o variable de entorno), igual que analyze-referentes.js.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'referencia');
const FRAMING_FILE = path.join(SOURCE_DIR, 'framing.json');
const FRAMING_VERSION = 1;

// Copiado de analyze-referentes.js.
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 60_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];
// Se le manda a Gemini una copia achicada: las cajas son relativas (0-1000) y así se gasta menos cuota.
const ANALYSIS_MAX_SIDE = 1024;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Los cuadros de la app donde se muestran fotos de referentes. Si cambia el tamaño de uno, cambiá su proporción acá.
 * maxWidth: ancho a 3x de densidad, sin agrandar nunca la foto original.
 */
const FRAMES = {
  // DestacadoCard: foto de 298 x 160 (tarjeta de 300 con borde de 1). Arriba van la etiqueta y el botón de guardar
  // (hasta ~44 pt de 160): air deja la cabeza por debajo de ellos.
  card: { ratio: 298 / 160, maxWidth: 900, air: 0.22 },
  // ReferenteAvatar: círculo de 48 (lista) y 96 (ficha).
  avatar: { ratio: 1, maxWidth: 384 },
  // ReferenteLooks: miniaturas de 220 x 290 en la ficha.
  look: { ratio: 220 / 290, maxWidth: 660, air: 0.08 },
};
const JPEG = { quality: 86, mozjpeg: true };
const MAX_CROP_BYTES = 400 * 1024;
// Debajo de este alto (en px de la foto), la cara del avatar se ve pixelada a 96 pt.
const SMALL_AVATAR_PX = 200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const relative = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

function parseArgs(argv) {
  const args = { force: false, offline: false };
  for (const arg of argv) {
    if (arg === '--force') args.force = true;
    else if (arg === '--offline') args.offline = true;
    else throw new Error(`Opción desconocida: ${arg}`);
  }
  if (args.force && args.offline) throw new Error('--force y --offline no van juntos.');
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

function loadFraming() {
  if (!fs.existsSync(FRAMING_FILE)) return { version: FRAMING_VERSION, photos: {} };
  const data = JSON.parse(fs.readFileSync(FRAMING_FILE, 'utf8'));
  return { version: FRAMING_VERSION, photos: data.photos ?? {} };
}

function saveFraming(framing) {
  // Ordenado por id y archivo, para que el diff de git sea estable.
  const photos = {};
  for (const id of Object.keys(framing.photos).sort()) {
    photos[id] = {};
    for (const file of Object.keys(framing.photos[id]).sort()) photos[id][file] = framing.photos[id][file];
  }
  fs.writeFileSync(FRAMING_FILE, `${JSON.stringify({ version: FRAMING_VERSION, photos }, null, 2)}\n`);
}

function listPhotos() {
  return fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((id) => ({
      id,
      files: fs
        .readdirSync(path.join(SOURCE_DIR, id), { withFileTypes: true })
        .filter((entry) => entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => entry.name)
        .sort(),
    }));
}

const hashOf = (data) => crypto.createHash('sha1').update(data).digest('hex').slice(0, 16);

const PROMPT = `Mirá esta foto de moda. NO identifiques a nadie por la cara: solo ubicá personas en la imagen.
Si hay varias personas, elegí a la principal (la más grande, nítida y centrada, la protagonista de la foto).
Devolvé cajas en formato box_2d [ymin, xmin, ymax, xmax] normalizadas de 0 a 1000:
- persona: la persona principal completa, incluido el pelo, la gorra y todo lo que se ve de su cuerpo y su ropa.
- cara: su cabeza completa (desde lo más alto del pelo o la gorra hasta la barbilla, de oreja a oreja).
Además:
- personas: cuántas personas se ven claramente.
- caraVisible: false si la cara está de espaldas, tapada o fuera de la foto (igual marcá dónde está la cabeza).
- dudas: una frase corta si dudaste de quién es la persona principal o de las cajas; "" si no.`;

const BOX = { type: 'ARRAY', minItems: 4, maxItems: 4, items: { type: 'INTEGER' } };
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    persona: BOX,
    cara: BOX,
    personas: { type: 'INTEGER' },
    caraVisible: { type: 'BOOLEAN' },
    dudas: { type: 'STRING' },
  },
  required: ['persona', 'cara', 'personas', 'caraVisible', 'dudas'],
  propertyOrdering: ['persona', 'cara', 'personas', 'caraVisible', 'dudas'],
};

/** Espera sugerida por Gemini en un 429 ("retryDelay": "12s"), si viene. */
function retryDelayOf(json) {
  const info = json?.error?.details?.find((detail) => typeof detail?.retryDelay === 'string');
  const seconds = info ? parseFloat(info.retryDelay) : NaN;
  return Number.isFinite(seconds) ? Math.min(seconds * 1000 + 500, 60_000) : null;
}

async function callGemini(label, jpeg, apiKey, model) {
  const body = JSON.stringify({
    contents: [{ parts: [{ inline_data: { mime_type: 'image/jpeg', data: jpeg.toString('base64') } }, { text: PROMPT }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0 },
  });
  for (let attempt = 0; ; attempt += 1) {
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
      response = null;
      if (attempt >= RETRY_DELAYS_MS.length) {
        throw new Error(error.name === 'TimeoutError' ? 'Gemini no respondió a tiempo.' : 'No se pudo conectar con Gemini.');
      }
    }
    const json = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      const text = json?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
      if (text === '') throw new Error(`Gemini no devolvió respuesta (${json?.candidates?.[0]?.finishReason ?? json?.promptFeedback?.blockReason ?? 'sin motivo'}).`);
      return JSON.parse(text);
    }
    const retriable = !response || response.status === 429 || response.status >= 500;
    if (!retriable || attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(json?.error?.message ?? `Gemini respondió ${response?.status}.`);
    }
    const wait = (response?.status === 429 && retryDelayOf(json)) || RETRY_DELAYS_MS[attempt];
    console.warn(`  ${label}: ${response ? `Gemini respondió ${response.status}` : 'sin conexión'}, reintento en ${Math.round(wait / 1000)} s.`);
    await sleep(wait);
  }
}

/** [ymin, xmin, ymax, xmax] 0-1000 → { x0, y0, x1, y1 } 0-1, ordenada y dentro de la foto. null si no sirve. */
function toBox(raw) {
  if (!Array.isArray(raw) || raw.length !== 4 || raw.some((value) => !Number.isFinite(value))) return null;
  const [a, b, c, d] = raw.map((value) => clamp(value / 1000, 0, 1));
  const box = { x0: Math.min(b, d), y0: Math.min(a, c), x1: Math.max(b, d), y1: Math.max(a, c) };
  return box.x1 - box.x0 > 0.01 && box.y1 - box.y0 > 0.01 ? box : null;
}

const round3 = (value) => Math.round(value * 1000) / 1000;
const boxToJson = (box) => [box.x0, box.y0, box.x1, box.y1].map(round3);
const boxFromJson = ([x0, y0, x1, y1]) => ({ x0, y0, x1, y1 });

async function analyzePhoto(id, file, data, apiKey, model) {
  const image = sharp(data).rotate();
  const { width, height } = await image.metadata().then((meta) =>
    // rotate() sin argumentos aplica el EXIF: si la foto está girada 90°, ancho y alto se invierten.
    (meta.orientation ?? 1) >= 5 ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height },
  );
  const jpeg = await image
    .resize({ width: ANALYSIS_MAX_SIDE, height: ANALYSIS_MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  const raw = await callGemini(`${id}/${file}`, jpeg, apiKey, model);
  const person = toBox(raw.persona);
  let face = toBox(raw.cara);
  if (!person) throw new Error('Gemini no devolvió una caja válida para la persona.');
  const dudas = [];
  if (raw.dudas?.trim()) dudas.push(raw.dudas.trim());
  if (!face) {
    // Sin cara: se estima la cabeza como el octavo superior de la persona.
    const headH = (person.y1 - person.y0) / 8;
    const cx = (person.x0 + person.x1) / 2;
    face = { x0: cx - headH * (height / width) * 0.4, y0: person.y0, x1: cx + headH * (height / width) * 0.4, y1: person.y0 + headH };
    dudas.push('Sin caja de cara: se estimó desde la persona.');
  }
  return {
    hash: hashOf(data),
    width,
    height,
    // Formato propio: [x0, y0, x1, y1] de 0 a 1 (Gemini responde [ymin, xmin, ymax, xmax] de 0 a 1000).
    person: boxToJson(person),
    face: boxToJson(face),
    personas: Number.isInteger(raw.personas) ? raw.personas : null,
    caraVisible: raw.caraVisible !== false,
    dudas: dudas.join(' '),
    model,
  };
}

// ---------- Ventanas de recorte (en px de la foto) ----------

/** Corre la ventana para que quede dentro de la foto sin cambiar su tamaño. */
function fitInside(win, W, H) {
  return {
    left: clamp(win.left, 0, W - win.width),
    top: clamp(win.top, 0, H - win.height),
    width: win.width,
    height: win.height,
  };
}

/**
 * Para la tarjeta y los looks: la persona entera si entra; si no, cabeza completa con aire arriba (air, parte del alto) y el torso que
 * quepa. Nunca deja la cara cortada: si ni la cabeza entra en alto, se centra en ella.
 */
function bodyWindow(W, H, face, person, { ratio, air: airShare }) {
  const faceH = face.y1 - face.y0;
  const headTop = Math.min(face.y0, person.y0);
  const maxH = Math.min(H, W / ratio);
  const air = (h) => Math.max(faceH * 0.3, h * airShare);

  // Alto para la persona entera (con aire arriba y un margen abajo) y para su ancho.
  const fullH = Math.max(person.y1 - headTop + air(person.y1 - headTop) + H * 0.02, ((person.x1 - person.x0) * 1.12) / ratio);
  // No acercar tanto que la cara ocupe más de un tercio del alto.
  const minH = Math.min(maxH, faceH * 3);
  const h = clamp(fullH, minH, maxH);
  const w = h * ratio;

  let top;
  if (faceH * 1.15 > h) top = (face.y0 + face.y1) / 2 - h / 2; // la cabeza sola no entra: centrada
  else if (fullH <= h) top = (headTop - air(h) + person.y1 + H * 0.02) / 2 - h / 2; // entra entera: centrada
  else top = headTop - air(h); // no entra entera: cabeza arriba, el torso que quepa
  // Si la ventana se pasa de la foto por abajo, sube; pero sin dejar la cabeza afuera.
  top = Math.min(top, face.y0);

  // En ancho: centrada en el torso (entre la cara y el centro de la persona), siempre con la cara adentro.
  const faceCx = (face.x0 + face.x1) / 2;
  const personCx = (person.x0 + person.x1) / 2;
  let left = (fullH <= h ? personCx : (faceCx + personCx) / 2) - w / 2;
  left = clamp(left, face.x1 + (face.x1 - face.x0) * 0.1 - w, face.x0 - (face.x1 - face.x0) * 0.1);

  return fitInside({ left, top, width: w, height: h }, W, H);
}

/** Para el avatar: cuadrado centrado en la cabeza, que ocupa ~60% del alto (el círculo no corta frente ni barbilla). */
function avatarWindow(W, H, face) {
  const faceH = face.y1 - face.y0;
  const faceW = face.x1 - face.x0;
  const side = Math.min(W, H, Math.max(faceH / 0.6, faceW / 0.6));
  const cx = (face.x0 + face.x1) / 2;
  const cy = (face.y0 + face.y1) / 2;
  return fitInside({ left: cx - side / 2, top: cy - side / 2, width: side, height: side }, W, H);
}

const toPixels = (box, W, H) => ({ x0: box.x0 * W, y0: box.y0 * H, x1: box.x1 * W, y1: box.y1 * H });
const roundWindow = (win) => ({
  left: Math.round(win.left),
  top: Math.round(win.top),
  width: Math.max(1, Math.round(win.width)),
  height: Math.max(1, Math.round(win.height)),
});

/** Corta, achica a la medida del cuadro y baja la calidad si se pasa del peso máximo. */
async function writeCrop(sourcePath, win, frame, outPath, W, H) {
  const safe = roundWindow(win);
  safe.width = Math.min(safe.width, W - safe.left);
  safe.height = Math.min(safe.height, H - safe.top);
  const width = Math.min(frame.maxWidth, safe.width);
  for (let quality = JPEG.quality; ; quality -= 8) {
    const buffer = await sharp(sourcePath)
      .rotate()
      .extract(safe)
      .resize({ width, height: Math.round(width / frame.ratio), fit: 'cover', withoutEnlargement: false })
      .jpeg({ ...JPEG, quality })
      .toBuffer();
    if (buffer.length <= MAX_CROP_BYTES || quality <= 60) {
      fs.writeFileSync(outPath, buffer);
      return { width, bytes: buffer.length };
    }
  }
}

async function cropPhoto(id, file, entry, report) {
  const dir = path.join(SOURCE_DIR, id);
  const cropsDir = path.join(dir, 'crops');
  fs.mkdirSync(path.join(cropsDir, 'looks'), { recursive: true });
  const { width: W, height: H } = entry;
  const face = toPixels(boxFromJson(entry.face), W, H);
  const person = toPixels(boxFromJson(entry.person), W, H);
  const name = path.parse(file).name;
  const outputs =
    name === 'avatar'
      ? [
          ['card.jpg', FRAMES.card, bodyWindow(W, H, face, person, FRAMES.card)],
          ['avatar.jpg', FRAMES.avatar, avatarWindow(W, H, face)],
        ]
      : [[`looks/${name}.jpg`, FRAMES.look, bodyWindow(W, H, face, person, FRAMES.look)]];

  const notes = [];
  if (entry.dudas) notes.push(entry.dudas);
  if (entry.personas > 1) notes.push(`${entry.personas} personas en la foto`);
  if (!entry.caraVisible) notes.push('cara tapada o de espaldas');
  const made = [];
  for (const [outName, frame, win] of outputs) {
    const result = await writeCrop(path.join(dir, file), win, frame, path.join(cropsDir, outName), W, H);
    made.push(`${outName} ${result.width}px ${Math.round(result.bytes / 1024)} KB`);
    if (result.bytes > MAX_CROP_BYTES) notes.push(`${outName} pesa más de 400 KB`);
    if (outName === 'avatar.jpg' && win.height < SMALL_AVATAR_PX) notes.push(`cara chica: el avatar sale de ${Math.round(win.height)} px`);
    if (outName === 'avatar.jpg' && (face.y1 - face.y0) / win.height > 0.7) notes.push('cara muy cerca: ocupa más del 70% del avatar');
    if (outName === 'card.jpg' && (face.y1 - face.y0) * 1.15 > win.height) notes.push('la cabeza no entra entera en la tarjeta');
  }
  report.push({ photo: `${id}/${file}`, made, notes });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const framing = loadFraming();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const folders = listPhotos();

  // 1) Analizar solo lo que falta (o lo que cambió de contenido).
  const pending = [];
  for (const { id, files } of folders) {
    for (const file of files) {
      const data = fs.readFileSync(path.join(SOURCE_DIR, id, file));
      const cached = framing.photos[id]?.[file];
      if (args.force || !cached || cached.hash !== hashOf(data)) pending.push({ id, file, data });
    }
  }
  // Se borran del JSON las fotos que ya no existen.
  for (const id of Object.keys(framing.photos)) {
    const folder = folders.find((item) => item.id === id);
    for (const file of Object.keys(framing.photos[id])) if (!folder?.files.includes(file)) delete framing.photos[id][file];
    if (Object.keys(framing.photos[id]).length === 0) delete framing.photos[id];
  }

  let failed = 0;
  if (pending.length === 0) console.log('Todas las fotos ya están en framing.json: no se llama a Gemini.');
  else if (args.offline) console.log(`--offline: quedan ${pending.length} foto(s) sin analizar.`);
  else {
    const apiKey = loadApiKey();
    console.log(`Analizando ${pending.length} foto(s) con ${model}...`);
    for (const { id, file, data } of pending) {
      try {
        const entry = await analyzePhoto(id, file, data, apiKey, model);
        framing.photos[id] = { ...framing.photos[id], [file]: entry };
        saveFraming(framing); // después de cada foto: si algo falla más adelante, lo hecho queda guardado
        console.log(`  ${id}/${file}: listo${entry.dudas ? ` (duda: ${entry.dudas})` : ''}`);
      } catch (error) {
        failed += 1;
        console.error(`  ${id}/${file}: ${error.message}`);
      }
    }
  }
  saveFraming(framing);

  // 2) Recortes, para todas las fotos analizadas (es local y rápido).
  const report = [];
  for (const { id, files } of folders) {
    for (const file of files) {
      const entry = framing.photos[id]?.[file];
      if (!entry) report.push({ photo: `${id}/${file}`, made: [], notes: ['sin analizar: la app usa la foto original'] });
      else await cropPhoto(id, file, entry, report);
    }
  }

  console.log(`\nReporte (${relative(FRAMING_FILE)}):`);
  for (const { photo, made, notes } of report) {
    console.log(`${notes.length > 0 ? '!' : ' '} ${photo}: ${made.join(', ') || 'sin recortes'}`);
    for (const note of notes) console.log(`    - ${note}`);
  }
  if (failed > 0) {
    console.error(`\n${failed} foto(s) fallaron: corré el script de nuevo para reintentar solo esas.`);
    process.exitCode = 1;
  }
  console.log('\nSiguiente paso: node scripts/generate-referente-images.js');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
