"""fct.config — the single source of truth for paths, constants, slug map.

No logic here beyond lazily loading the slug map. Import these everywhere instead
of hardcoding paths, re-declaring the color model, or re-deciding per-source color.
"""
import os, json, functools

HOME = os.path.expanduser("~")
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- frame geometry / cadence (identical for all three renderers) ---
N_FRAMES = 24            # frames per transition
SIZE = (1920, 1080)      # output (w, h)

# --- frame file format (single source of truth). JPEG q=90 is plenty for this
#     comparison work (the GUI GT is already ProRes-lossy) and ~10-20x smaller than
#     PNG for these 1920x1080 frames. All three renderers + the thumbnail cache emit
#     this. The C++ shim (oz_render.mm) picks its encoder from the output extension. ---
FRAME_EXT = "jpg"        # "jpg" or "png"
JPEG_QUALITY = 90

# --- canonical on-disk locations (ONE place each) ---
GUI_GT_DIR = os.path.join(HOME, "fct-gui-gt")          # the ONLY real ground truth
FRAMES_DIR = os.path.join(HOME, "fct-frames")          # headless/ and engine/ live here
HEADLESS_DIR = os.path.join(FRAMES_DIR, "headless")
ENGINE_DIR = os.path.join(FRAMES_DIR, "engine")

# --- FCP source images fed to every renderer ---
IMG_A = os.path.join(REPO, "images", "start.jpg")
IMG_B = os.path.join(REPO, "images", "end.jpg")

# --- sRGB -> bt709 color model (headless/engine render sRGB; GUI GT is bt709).
#     out = 255 * gain * (in/255) ** gamma.  Apply to a source BEFORE comparing to GUI GT. ---
GAM = {"R": (1.095, 0.977), "G": (1.070, 0.963), "B": (1.074, 0.966)}

# --- the three frame sources, in ONE place. `color` is the frame's native color
#     space: "bt709" (the GUI GT, matches FCP's ProRes export) or "srgb" (what the
#     headless shim + TS engine emit). To compare an srgb source to the bt709 GUI GT,
#     the sRGB->bt709 model is applied (see fct.color). This is the single source of
#     truth for "which sources need color-conforming" — do not re-decide it elsewhere. ---
SOURCES = {
    "gui":      {"dir": GUI_GT_DIR,   "color": "bt709"},
    "headless": {"dir": HEADLESS_DIR, "color": "srgb"},
    "engine":   {"dir": ENGINE_DIR,   "color": "srgb"},
}

def needs_bt709(source: str) -> bool:
    """True if this source is sRGB and must be color-conformed to compare to GUI GT."""
    return _source(source)["color"] == "srgb"

def _source(source: str) -> dict:
    try:
        return SOURCES[source]
    except KeyError:
        raise ValueError(f"unknown source {source!r} (want {'|'.join(SOURCES)})")

# --- slug -> .motr path. Committed at fct/slug_map.json; loaded lazily + cached. ---
_SLUG_MAP_REPO = os.path.join(REPO, "fct", "slug_map.json")

@functools.cache
def slug_map() -> dict:
    if not os.path.exists(_SLUG_MAP_REPO):
        raise FileNotFoundError(f"slug map not found at {_SLUG_MAP_REPO}")
    return json.load(open(_SLUG_MAP_REPO))

@functools.cache
def slugs() -> list:
    return sorted(slug_map().keys())

# Backwards-compatible module attributes (evaluated lazily on first attribute access)
# so callers can keep using fct.config.SLUGS / SLUG_MAP without an import-time file read.
def __getattr__(name: str):
    if name == "SLUG_MAP":
        return slug_map()
    if name == "SLUGS":
        return slugs()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

def slug_motr(slug: str) -> str:
    """Return the .motr path for a slug (raises KeyError if unknown)."""
    return slug_map()[slug]

def frames_dir(source: str, slug: str) -> str:
    """Directory holding a source's frames for a slug. source in SOURCES."""
    return os.path.join(_source(source)["dir"], slug)

def frame_path(source: str, slug: str, i: int) -> str:
    return os.path.join(frames_dir(source, slug), f"frame_{i:04d}.{FRAME_EXT}")
