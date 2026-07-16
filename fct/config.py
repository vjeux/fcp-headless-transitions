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
# GUI GT is the shared, read-only ground truth (never written) — always $HOME.
GUI_GT_DIR = os.path.join(HOME, "fct-gui-gt")          # the ONLY real ground truth
# FRAMES_DIR (rendered headless/ and engine/ frames) is WRITTEN by `fct gen`, so
# parallel agents in separate git worktrees MUST NOT share it or they corrupt each
# other's renders (a race that silently mixes two builds' frames under one baseline).
# It honors $FCT_FRAMES_DIR so each worktree can point at its own scratch dir; the
# default is the shared $HOME/fct-frames (unchanged single-agent behavior).
FRAMES_DIR = os.environ.get("FCT_FRAMES_DIR") or os.path.join(HOME, "fct-frames")
HEADLESS_DIR = os.path.join(FRAMES_DIR, "headless")
ENGINE_DIR = os.path.join(FRAMES_DIR, "engine")

# --- ISOLATION ID: the token that scopes a `gen` batch's processes to THIS worktree/
#     agent so parallel workers never clobber each other. It flows two ways:
#       (1) it is appended to every render-worker argv as `--fct-iso <ID>` (the tsx
#           scripts ignore extra args, but it makes each worker self-identifying in
#           `ps`), and
#       (2) gen.sweep_orphaned_renderers() only kills render workers / gen drivers whose
#           argv carries the SAME `--fct-iso <ID>`.
#     So Agent A's pre-batch kill-sweep can NEVER reap Agent B's live workers/driver.
#     Default = a short stable hash of the REPO path, so each git worktree is isolated
#     automatically with no config; override with $FCT_ISOLATION_ID for finer scoping
#     (e.g. one id per swarm agent sharing a worktree). Single-agent behavior unchanged.
import hashlib as _hashlib
ISOLATION_ID = os.environ.get("FCT_ISOLATION_ID") or (
    "wt-" + _hashlib.sha1(REPO.encode()).hexdigest()[:12]
)

# --- FCP source images fed to every renderer ---
IMG_A = os.path.join(REPO, "images", "start.jpg")
IMG_B = os.path.join(REPO, "images", "end.jpg")

# --- sRGB -> bt709 color model (headless/engine render sRGB; GUI GT is bt709).
#     out = 255 * gain * (in/255) ** gamma.  Apply to a source BEFORE comparing to GUI GT.
#
#     These are NOT hand-tuned magic numbers: they are DERIVED and AUDITED by
#     `python3 -m fct.fit_color`, which fits the per-channel power law to MAXIMIZE the
#     gate's own objective (the mean of per-frame PSNR over the full 65x24 set vs the
#     GUI GT). Two measured facts justify this specific objective (not plain MSE, not a
#     physical transfer function) — see fct/fit_color.py for the numbers. The derivation
#     reproduces the values below to within ~0.06 dB (well under the 0.30 dB gate tol),
#     which is the evidence they are gate-near-optimal rather than arbitrary. Re-run
#     fit_color after any frame refresh to reconfirm; only change GAM (and re-baseline)
#     if it reports a delta above the gate tolerance. ---
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
