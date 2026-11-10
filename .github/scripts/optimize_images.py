"""
Shrinks and cleans photos in assets/images so the site stays fast.

For every JPG / PNG / WEBP:
  • turns it the right way up (phone photos are often stored sideways)
  • shrinks it to at most 1200 px on the longest side
  • re-saves it at a web-friendly size
  • removes hidden photo data (EXIF), including the GPS location phones add

The file name and type stay the same, so nothing on the website breaks.
Already-optimised files are left alone, so running it again changes nothing.
"""
import os
import sys
from PIL import Image, ImageOps

MAX_SIDE = 1200
MAX_BYTES = 350_000
FOLDER = sys.argv[1] if len(sys.argv) > 1 else "assets/images"


def needs_work(path, im):
    has_meta = bool(im.info.get("exif")) or bool(im.getexif())
    too_big = max(im.size) > MAX_SIDE or os.path.getsize(path) > MAX_BYTES
    return has_meta or too_big


def optimise(path):
    with Image.open(path) as im:
        if not needs_work(path, im):
            return False
        fmt = (im.format or "").upper()
        im = ImageOps.exif_transpose(im)          # fix rotation before dropping EXIF
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        if fmt in ("JPEG", "MPO"):
            im.convert("RGB").save(path, "JPEG", quality=82, optimize=True, progressive=True)
        elif fmt == "PNG":
            im.save(path, "PNG", optimize=True)
        elif fmt == "WEBP":
            im.save(path, "WEBP", quality=80, method=6)
        else:
            return False
    return True


changed = []
for name in sorted(os.listdir(FOLDER)):
    if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        p = os.path.join(FOLDER, name)
        try:
            before = os.path.getsize(p)
            if optimise(p):
                changed.append(f"{name}: {before // 1024} KB → {os.path.getsize(p) // 1024} KB")
        except Exception as e:  # never fail the whole run because of one odd file
            print(f"skipped {name}: {e}")

print("\n".join(changed) if changed else "All photos already optimised.")
