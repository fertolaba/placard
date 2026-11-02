"""Servidor local de recorte de fondo. SOLO para desarrollo: no tiene autenticación (ver README.md)."""

import io
import os
import threading
import time

import cv2
import numpy as np
from flask import Flask, jsonify, request, send_file
from PIL import Image, ImageOps, UnidentifiedImageError
from rembg import new_session, remove
from rembg.sessions import sessions
from scipy import ndimage

DEFAULT_MODEL = "birefnet-general-lite"
FALLBACK_MODEL = "u2net"
MAX_SIDE = 1280
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
PORT = 7000

# Alpha matting: recalcula la transparencia de una franja alrededor del borde. Más lento y usa más memoria.
# Un píxel de la máscara con un valor mayor a este se toma como prenda segura. Bajarlo da una franja más angosta.
ALPHA_MATTING_FOREGROUND_THRESHOLD = 240
# Un píxel con un valor menor a este se toma como fondo seguro. Subirlo descarta más fondo dudoso.
ALPHA_MATTING_BACKGROUND_THRESHOLD = 10
# Cuánto se achican esas dos zonas seguras: es el ancho de la franja a recalcular. Subirlo sirve para bordes muy irregulares.
ALPHA_MATTING_ERODE_SIZE = 10

# Limpieza de bordes (ver clean_edges).
EDGE_SOLID_ALPHA = 128  # desde este alfa, un píxel cuenta como parte firme de la prenda
EDGE_SOFT_ALPHA = 16  # por debajo de este alfa, un píxel es neblina y se borra
EDGE_CORE_ALPHA = 250  # desde este alfa, el color del píxel es de la prenda, sin mezcla con el fondo
EDGE_MIN_ISLAND_RATIO = 0.01  # se conservan las partes de más del 1 % del área de la prenda
EDGE_MAX_HOLE_RATIO = 0.003  # se rellenan los huecos de hasta 0,3 %: los mayores pueden ser reales (entre las piernas de un jean)
EDGE_ERODE_PX = 1
EDGE_BLUR_SIGMA = 0.7

# Quitar huecos de fondo (ver remove_background_holes). Las distancias de color son en Lab.
HOLE_BAND_INNER_PX = 10  # la franja que representa al fondo empieza a esta distancia de la prenda
HOLE_BAND_OUTER_PX = 25  # y termina a esta
HOLE_MIN_SAMPLE_PIXELS = 500  # con menos píxeles de prenda o de franja no hay datos para decidir: se saltea
HOLE_MAX_KMEANS_SAMPLES = 20000
HOLE_CLUSTERS = 3  # más de un color, porque el fondo puede tener sombras o cambios de luz
HOLE_MIN_CLUSTER_SHARE = 0.1  # un color con menos de este peso en la franja se ignora: puede ser una percha o un objeto
HOLE_TOLERANCE_STDS = 2.5  # cuánto se aleja un píxel de un color del fondo y sigue contando como fondo
HOLE_MIN_TOLERANCE = 6.0
HOLE_MAX_TOLERANCE = 16.0  # bajarlo protege más a la prenda; subirlo detecta más fondo en sombra
HOLE_OPEN_PX = 3  # abre los candidatos: saca costuras y el contorno de color mezclado que rodea a toda la prenda
HOLE_MIN_REGION_RATIO = 0.005  # solo regiones de más del 0,5 % de la prenda. Debe superar a EDGE_MAX_HOLE_RATIO o clean_edges las rellena
HOLE_MIN_GARMENT_CONTRAST = 12.0  # con menos distancia entre el color medio de la prenda y el fondo, se saltea
HOLE_MAX_CANDIDATE_RATIO = 0.4  # si más de esta parte de la prenda se parece al fondo, es una prenda de ese color: se saltea
HOLE_GRABCUT_ITERATIONS = 4
HOLE_GRABCUT_CONFIRM_RATIO = 0.7  # parte de la región que GrabCut debe considerar fondo para borrarla
HOLE_GROW_PX = 2  # el borde del hueco trae color mezclado que no se parece a ninguno de los dos

CONNECT_DIAGONALS = np.ones((3, 3), dtype=bool)


def env_flag(name, default):
    value = os.environ.get(name)
    return default if value is None or value == "" else value == "1"


def load_session(model_name):
    """Crea la sesión del modelo. La primera vez lo descarga."""
    if model_name not in sessions:
        valid = ", ".join(sorted(sessions))
        raise SystemExit(f'El modelo "{model_name}" no existe en esta versión de rembg. Modelos válidos: {valid}')
    return new_session(model_name)


def load_configured_session():
    """Un modelo pedido a mano no se reemplaza por otro: comparar modelos con un cambio silencioso daría conclusiones falsas."""
    requested = os.environ.get("REMBG_MODEL", "").strip()
    model_name = requested or DEFAULT_MODEL
    try:
        loaded = load_session(model_name)
    except Exception as error:
        if requested:
            raise SystemExit(f'No se pudo cargar el modelo "{model_name}": {error}') from error
        print(f"No se pudo cargar {model_name} ({error}). Probando con {FALLBACK_MODEL}.")
        model_name = FALLBACK_MODEL
        loaded = load_session(model_name)
    print(f"Modelo cargado: {model_name}")
    return loaded


def prepare_image(source):
    """Abre la foto, respeta la orientación con la que se sacó y la achica (nunca la agranda)."""
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    return image


def ellipse_kernel(radius):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius * 2 + 1, radius * 2 + 1))


def background_clusters(band_lab):
    """Resume el color de la franja en unos pocos centroides, cada uno con su tolerancia."""
    samples = band_lab[:: max(1, len(band_lab) // HOLE_MAX_KMEANS_SAMPLES)]
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.5)
    _, labels, centers = cv2.kmeans(samples, HOLE_CLUSTERS, None, criteria, 3, cv2.KMEANS_PP_CENTERS)
    labels = labels.ravel()

    clusters = []
    for index, center in enumerate(centers):
        members = samples[labels == index]
        if len(members) < len(samples) * HOLE_MIN_CLUSTER_SHARE:
            continue
        distances = np.linalg.norm(members - center, axis=1)
        tolerance = distances.mean() + HOLE_TOLERANCE_STDS * distances.std()
        clusters.append((center, float(np.clip(tolerance, HOLE_MIN_TOLERANCE, HOLE_MAX_TOLERANCE))))
    return clusters


def grabcut_background(colors, garment, outside):
    """Devuelve lo que GrabCut considera fondo. Lejos de la prenda no se calcula: es fondo seguro."""
    near = outside <= HOLE_BAND_OUTER_PX
    rows, columns = np.nonzero(near)
    top, bottom, left, right = rows.min(), rows.max() + 1, columns.min(), columns.max() + 1

    mask = np.full(garment.shape, cv2.GC_BGD, dtype=np.uint8)
    mask[near] = cv2.GC_PR_BGD
    mask[garment] = cv2.GC_PR_FGD
    crop_mask = mask[top:bottom, left:right].copy()
    crop_bgr = cv2.cvtColor(colors[top:bottom, left:right], cv2.COLOR_RGB2BGR)

    cv2.grabCut(
        crop_bgr,
        crop_mask,
        None,
        np.zeros((1, 65), np.float64),
        np.zeros((1, 65), np.float64),
        HOLE_GRABCUT_ITERATIONS,
        cv2.GC_INIT_WITH_MASK,
    )

    background = np.zeros(garment.shape, dtype=bool)
    background[top:bottom, left:right] = (crop_mask == cv2.GC_BGD) | (crop_mask == cv2.GC_PR_BGD)
    return background


def find_background_holes(alpha, colors):
    """Busca fondo que el modelo tomó como prenda. Devuelve la máscara de esos píxeles (o None) y un resumen."""
    cv2.setRNGSeed(0)  # k-means y GrabCut parten de valores al azar: así dos corridas de una foto se pueden comparar

    solid = alpha >= EDGE_SOLID_ALPHA
    # La neblina cuenta como prenda: si no, un fondo donde el modelo dudó quedaría flotando dentro del hueco.
    garment = alpha >= EDGE_SOFT_ALPHA
    garment_area = int(solid.sum())
    if garment_area < HOLE_MIN_SAMPLE_PIXELS:
        return None, "salteado, casi no hay prenda"

    outside = cv2.distanceTransform((~garment).astype(np.uint8), cv2.DIST_L2, 5)
    band = (outside >= HOLE_BAND_INNER_PX) & (outside <= HOLE_BAND_OUTER_PX)
    if band.sum() < HOLE_MIN_SAMPLE_PIXELS:
        return None, "salteado, la prenda no deja fondo visible alrededor"

    lab = cv2.cvtColor(colors.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
    clusters = background_clusters(lab[band])

    garment_mean = lab[solid].mean(axis=0)
    contrast = min(np.linalg.norm(garment_mean - center) for center, _ in clusters)
    if contrast < HOLE_MIN_GARMENT_CONTRAST:
        return None, f"salteado, prenda y fondo de color parecido (distancia {contrast:.1f})"

    near_background = np.zeros(alpha.shape, dtype=bool)
    for center, tolerance in clusters:
        near_background |= np.linalg.norm(lab - center, axis=2) <= tolerance
    candidates = near_background & garment
    candidates = cv2.morphologyEx(candidates.astype(np.uint8), cv2.MORPH_OPEN, ellipse_kernel(HOLE_OPEN_PX)).astype(bool)

    candidate_ratio = (candidates & solid).sum() / garment_area
    if candidate_ratio > HOLE_MAX_CANDIDATE_RATIO:
        return None, f"salteado, el {candidate_ratio:.0%} de la prenda se parece al fondo"

    labels, count = ndimage.label(candidates, structure=CONNECT_DIAGONALS)
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    regions = np.flatnonzero(sizes[1:] > garment_area * HOLE_MIN_REGION_RATIO) + 1
    if regions.size == 0:
        return None, "sin regiones candidatas"

    background = grabcut_background(colors, garment, outside)
    agreeing = np.bincount(labels[background], minlength=count + 1)
    confirmed = regions[agreeing[regions] / sizes[regions] >= HOLE_GRABCUT_CONFIRM_RATIO]
    summary = f"GrabCut confirmó {confirmed.size} de {regions.size} regiones candidatas"
    if confirmed.size == 0:
        return None, summary

    holes = cv2.dilate(np.isin(labels, confirmed).astype(np.uint8), ellipse_kernel(HOLE_GROW_PX)).astype(bool)
    return holes, f"{summary}, {holes.sum() / garment_area:.1%} de la prenda"


def remove_background_holes(cutout, original):
    """Borra el fondo encerrado por la prenda, como el espacio entre las piernas de un jean."""
    start = time.perf_counter()
    cutout = cutout.convert("RGBA")
    alpha = np.array(cutout.getchannel("A"))
    colors = np.array(original.convert("RGB").resize(cutout.size))

    holes, summary = find_background_holes(alpha, colors)
    if holes is not None:
        alpha[holes] = 0
        cutout.putalpha(Image.fromarray(alpha))

    print(f"Quitar huecos: {time.perf_counter() - start:.2f} s | {summary}")
    return cutout


def clean_edges(cutout, original):
    """Limpia un recorte: saca islas, rellena huecos chicos, sana el color del borde y afina la máscara."""
    cutout = cutout.convert("RGBA")
    alpha = np.array(cutout.getchannel("A"))
    colors = np.array(original.convert("RGB").resize(cutout.size))

    # Islas: se miden sobre la parte firme, para que una neblina tenue no las una a la prenda.
    solid = alpha >= EDGE_SOLID_ALPHA
    labels, count = ndimage.label(solid, structure=CONNECT_DIAGONALS)
    if count == 0:
        return cutout
    sizes = np.bincount(labels.ravel())[1:]
    keep = np.flatnonzero(sizes > sizes.sum() * EDGE_MIN_ISLAND_RATIO) + 1
    if keep.size == 0:
        keep = np.array([sizes.argmax() + 1])
    kept = np.isin(labels, keep)

    # El borde suave se conserva solo si toca una parte que quedó.
    allowed = (alpha >= EDGE_SOFT_ALPHA) & ~(solid & ~kept)
    kept_with_edge = ndimage.binary_propagation(kept, structure=CONNECT_DIAGONALS, mask=allowed)
    alpha = np.where(kept_with_edge, alpha, 0).astype(np.uint8)

    # Huecos: los chicos son errores del modelo, por ejemplo un logo que tomó como fondo.
    holes = ndimage.binary_fill_holes(kept) & ~kept
    hole_labels, hole_count = ndimage.label(holes)
    if hole_count > 0:
        hole_sizes = np.bincount(hole_labels.ravel())[1:]
        small = np.flatnonzero(hole_sizes <= kept.sum() * EDGE_MAX_HOLE_RATIO) + 1
        alpha[np.isin(hole_labels, small)] = 255

    # Color: rembg oscurece los píxeles semitransparentes y además traen mezclado el fondo. Eso es el halo.
    # El color sale de la foto original; en el borde se reemplaza por el del píxel seguro de la prenda más cercano.
    core = ndimage.binary_erosion(alpha >= EDGE_CORE_ALPHA)
    if not core.any():
        core = kept
    nearest = ndimage.distance_transform_edt(~core, return_distances=False, return_indices=True)
    colors = colors[nearest[0], nearest[1]]

    # Máscara: se achica para sacar el borde contaminado y se suaviza para que no quede dentado.
    size = EDGE_ERODE_PX * 2 + 1
    alpha = ndimage.grey_erosion(alpha, size=(size, size))
    alpha = ndimage.gaussian_filter(alpha.astype(np.float32), sigma=EDGE_BLUR_SIGMA)
    alpha = np.clip(np.rint(alpha), 0, 255).astype(np.uint8)

    return Image.fromarray(np.dstack((colors, alpha)))


def cut_out(image, model_session, alpha_matting, edge_cleanup, remove_holes):
    options = {}
    if alpha_matting:
        options = {
            "alpha_matting": True,
            "alpha_matting_foreground_threshold": ALPHA_MATTING_FOREGROUND_THRESHOLD,
            "alpha_matting_background_threshold": ALPHA_MATTING_BACKGROUND_THRESHOLD,
            "alpha_matting_erode_size": ALPHA_MATTING_ERODE_SIZE,
        }
    result = remove(image, session=model_session, **options)
    if remove_holes:
        result = remove_background_holes(result, image)
    return clean_edges(result, image) if edge_cleanup else result


session = None  # se carga una sola vez, al arrancar el servidor
alpha_matting_enabled = env_flag("REMBG_ALPHA_MATTING", False)
edge_cleanup_enabled = env_flag("REMBG_EDGE_CLEANUP", True)
remove_holes_enabled = env_flag("REMBG_REMOVE_HOLES", True)
# Flask atiende cada pedido en su propio hilo: /health sigue respondiendo y los recortes van de a uno.
session_lock = threading.Lock()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES


@app.get("/health")
def health():
    return "ok"


@app.post("/remove")
def remove_background():
    upload = request.files.get("file")
    if upload is None:
        return jsonify(error="Falta la imagen en el campo 'file'."), 400

    try:
        image = prepare_image(upload.stream)
    except (UnidentifiedImageError, OSError):
        return jsonify(error="El archivo no es una imagen válida."), 400

    with session_lock:
        result = cut_out(image, session, alpha_matting_enabled, edge_cleanup_enabled, remove_holes_enabled)

    output = io.BytesIO()
    result.save(output, format="PNG")
    output.seek(0)
    return send_file(output, mimetype="image/png")


if __name__ == "__main__":
    session = load_configured_session()
    print(
        f"Alpha matting: {'sí' if alpha_matting_enabled else 'no'}"
        f" | Quitar huecos: {'sí' if remove_holes_enabled else 'no'}"
        f" | Limpieza de bordes: {'sí' if edge_cleanup_enabled else 'no'}"
    )
    app.run(host="0.0.0.0", port=PORT, threaded=True)
