"""fct.config — the single source of truth for paths, constants, slug map.

No logic here beyond loading the slug map. Import these everywhere instead of
hardcoding paths or re-declaring the color model.
"""
import os, json

HOME = os.path.expanduser("~")
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- frame geometry / cadence (identical for all three renderers) ---
N_FRAMES = 24            # frames per transition
SIZE = (1920, 1080)      # output (w, h)

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

# --- slug -> .motr path.  Persistent copy in the repo; also mirrored to /tmp for legacy. ---
_SLUG_MAP_REPO = os.path.join(REPO, "fct", "slug_map.json")
_SLUG_MAP_TMP = "/tmp/slug_map.json"

def _load_slug_map():
    for p in (_SLUG_MAP_REPO, _SLUG_MAP_TMP):
        if os.path.exists(p):
            return json.load(open(p))
    raise FileNotFoundError(
        f"slug map not found at {_SLUG_MAP_REPO} or {_SLUG_MAP_TMP}")

SLUG_MAP = _load_slug_map()
SLUGS = sorted(SLUG_MAP.keys())

def slug_motr(slug: str) -> str:
    """Return the .motr path for a slug (raises KeyError if unknown)."""
    return SLUG_MAP[slug]

def frames_dir(source: str, slug: str) -> str:
    """Directory holding a source's frames for a slug.
    source in {'gui','headless','engine'}."""
    if source == "gui":
        return os.path.join(GUI_GT_DIR, slug)
    if source == "headless":
        return os.path.join(HEADLESS_DIR, slug)
    if source == "engine":
        return os.path.join(ENGINE_DIR, slug)
    raise ValueError(f"unknown source {source!r} (want gui|headless|engine)")

def frame_path(source: str, slug: str, i: int) -> str:
    return os.path.join(frames_dir(source, slug), f"frame_{i:04d}.png")
