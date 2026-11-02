"""Compara modelos de recorte sobre una foto. Uso: python comparar.py ruta\\a\\foto.jpg"""

import math
import sys
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, UnidentifiedImageError

from server import cut_out, load_session, prepare_image

MODELS = ["isnet-general-use", "birefnet-general-lite", "birefnet-general"]
HOLES_MODEL = "birefnet-general-lite"  # este modelo, sin matting, se prueba también quitando huecos
OUTPUT_DIR = Path(__file__).resolve().parent / "comparacion"
DARK_BACKGROUND = "#1a1a1a"

SHEET_COLUMNS = 2  # primera fila: sin y con quitar huecos; las demás: sin y con matting
CELL_SIZE = 480
LABEL_HEIGHT = 34
GAP = 8
SHEET_BACKGROUND = "#333333"
TEXT_COLOR = "#ffffff"


def on_dark(cutout):
    background = Image.new("RGBA", cutout.size, DARK_BACKGROUND)
    background.alpha_composite(cutout)
    return background.convert("RGB")


def build_sheet(results, path):
    font = ImageFont.load_default(size=16)
    rows = math.ceil(len(results) / SHEET_COLUMNS)
    width = SHEET_COLUMNS * (CELL_SIZE + GAP) + GAP
    height = rows * (CELL_SIZE + LABEL_HEIGHT + GAP) + GAP
    sheet = Image.new("RGB", (width, height), SHEET_BACKGROUND)
    draw = ImageDraw.Draw(sheet)

    for index, (label, preview) in enumerate(results):
        row, column = divmod(index, SHEET_COLUMNS)
        x = GAP + column * (CELL_SIZE + GAP)
        y = GAP + row * (CELL_SIZE + LABEL_HEIGHT + GAP)
        draw.text((x + 2, y + 6), label, fill=TEXT_COLOR, font=font)
        cell = Image.new("RGB", (CELL_SIZE, CELL_SIZE), DARK_BACKGROUND)
        if preview is not None:
            thumbnail = preview.copy()
            thumbnail.thumbnail((CELL_SIZE, CELL_SIZE), Image.Resampling.LANCZOS)
            cell.paste(thumbnail, ((CELL_SIZE - thumbnail.width) // 2, (CELL_SIZE - thumbnail.height) // 2))
        sheet.paste(cell, (x, y + LABEL_HEIGHT))

    sheet.save(path)


def yes_no(value):
    return "si" if value else "no"


def combination_label(model, matting, holes):
    return f"{model} | matting {yes_no(matting)} | huecos {yes_no(holes)}"


def run_combination(image, model, model_session, matting, holes):
    """Una combinación que falla se anota y no frena a las demás."""
    label = combination_label(model, matting, holes)
    name = f"{model}__matting-{yes_no(matting)}__huecos-{yes_no(holes)}"
    print(f"  {name}")
    try:
        start = time.perf_counter()
        cutout = cut_out(image, model_session, alpha_matting=matting, edge_cleanup=True, remove_holes=holes)
        seconds = time.perf_counter() - start
    except Exception as error:
        print(f"  {name}: falló ({error})")
        return f"{label} | ERROR", None

    preview = on_dark(cutout)
    cutout.save(OUTPUT_DIR / f"{name}.png")
    preview.save(OUTPUT_DIR / f"{name}__sobre-gris.png")
    print(f"  {name}: {seconds:.1f} s en total")
    return f"{label} | {seconds:.1f} s", preview


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python comparar.py ruta\\a\\foto.jpg")

    try:
        image = prepare_image(sys.argv[1])
    except (FileNotFoundError, UnidentifiedImageError, OSError) as error:
        sys.exit(f"No se pudo abrir la foto: {error}")

    OUTPUT_DIR.mkdir(exist_ok=True)
    holes_pair = []
    results = []

    # Un modelo que no carga se anota y no frena a los demás.
    for model in MODELS:
        print(f"\nCargando {model} (la primera vez lo descarga)...")
        try:
            model_session = load_session(model)
        except Exception as error:
            print(f"  No se pudo cargar: {error}")
            results.extend((f"{combination_label(model, matting, False)} | ERROR", None) for matting in (False, True))
            continue

        without_matting = run_combination(image, model, model_session, matting=False, holes=False)
        with_matting = run_combination(image, model, model_session, matting=True, holes=False)
        results.extend([without_matting, with_matting])
        if model == HOLES_MODEL:
            holes_pair = [without_matting, run_combination(image, model, model_session, matting=False, holes=True)]

    sheet_path = OUTPUT_DIR / "hoja.png"
    build_sheet(holes_pair + results, sheet_path)
    print(f"\nHoja de comparación: {sheet_path}")


if __name__ == "__main__":
    main()
