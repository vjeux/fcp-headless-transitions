"""fct.gen — the SINGLE way to generate frames to disk for any source.

    gen_headless(slug)   render via the FCP headless shim (tools/ozengine + oz_render.dylib)
    gen_engine(slug)     render via the TS engine (engine/, node tsx)
    (gui frames are produced by fct.slice_gui from the recorded GUI .mov — see fct/slice_gui.py)

All three write N_FRAMES (24) frames at the SAME half-open i/N progress, 1920x1080,
to the canonical dir for that source: frame_0000.<ext> .. frame_0023.<ext>, where
<ext> is fct.config.FRAME_EXT (jpg q=90 by default).

Headless requires the FCP engine (DYLD + venv python on the Mac). Engine requires node.
These are the only two renderers fct drives; GUI GT is sliced from the recorded .mov.
"""
import os, sys, json, subprocess
from .config import (N_FRAMES, IMG_A, IMG_B, REPO, frames_dir, slug_motr,
                     frame_path, FRAME_EXT, JPEG_QUALITY)

# --- headless (FCP shim) ---
def gen_headless(slug: str, out_dir: str = None) -> str:
    """Render `slug` via the FCP headless engine to `out_dir` (default canonical).
    Must run under the venv python with DYLD_FRAMEWORK_PATH set (see fct/cli.py)."""
    out_dir = out_dir or frames_dir("headless", slug)
    os.makedirs(out_dir, exist_ok=True)
    sys.path.insert(0, os.path.join(REPO, "tools"))
    import ozengine
    from . import timing
    motr = slug_motr(slug)
    doc = ozengine.load_doc(motr)
    span = timing.scene_duration_seconds(motr) or 2.0
    for i in range(N_FRAMES):
        t = timing.sample_time(i, N_FRAMES, span)
        # oz_render.mm picks its encoder (PNG vs JPEG q=90) from the output extension.
        out = os.path.join(out_dir, f"frame_{i:04d}.{FRAME_EXT}")
        rc = ozengine.render_frame(doc, IMG_A, IMG_B, t, out)
        if rc != 0:
            print(f"  [headless] {slug} f{i}: rc={rc}", file=sys.stderr)
    return out_dir

# --- engine (TS) ---
def gen_engine(slug: str, out_dir: str = None) -> str:
    """Render `slug` via the TS engine (node tsx). Writes 24 frames at i/N.
    Runs engine/test/_fct_render.ts (a committed script)."""
    out_dir = out_dir or frames_dir("engine", slug)
    os.makedirs(out_dir, exist_ok=True)
    env = dict(os.environ, FCT_SLUG=slug, FCT_OUT=out_dir, FCT_N=str(N_FRAMES),
               FCT_EXT=FRAME_EXT, FCT_QUALITY=str(JPEG_QUALITY),
               FCT_SLUGMAP=os.path.join(REPO, "fct", "slug_map.json"))
    subprocess.run(
        ["node_modules/.bin/tsx", "test/_fct_render.ts"],
        cwd=os.path.join(REPO, "engine"), env=env, check=True)
    return out_dir

# --- engine single-frame (fast iteration) ---
def gen_engine_frame(slug: str, frame: int, out_file: str) -> str:
    """Render ONE engine frame (index `frame` of N_FRAMES, at progress frame/N) to
    `out_file`. For fast iteration: a full 24-frame gen_engine re-render is ~5s for a
    simple slug but MINUTES for a heavy one (360°/Bloom), which murders the
    edit->score loop. This renders just the frame you care about (typically a
    mid-transition frame) so `fct probe` returns in seconds. Same committed
    engine/test/_fct_render_one.ts path as gen_engine -> byte-identical to that frame
    of a full render."""
    env = dict(os.environ, FCT_SLUG=slug, FCT_FRAME=str(frame), FCT_N=str(N_FRAMES),
               FCT_OUT=os.path.abspath(out_file),
               FCT_SLUGMAP=os.path.join(REPO, "fct", "slug_map.json"))
    subprocess.run(["node_modules/.bin/tsx", "test/_fct_render_one.ts"],
                   cwd=os.path.join(REPO, "engine"), env=env, check=True)
    return out_file

# --- engine single-frame (fast iteration) ---
def gen_engine_frame(slug: str, frame: int, out_file: str) -> str:
    """Render ONE engine frame (index `frame` of N_FRAMES, at progress frame/N) to
    `out_file`. For fast iteration: a full 24-frame gen_engine re-render is ~5 s for a
    simple slug but MINUTES for a heavy one (360°/Bloom), which murders the
    edit->score loop. This renders just the frame you care about (typically a
    mid-transition frame), so `fct probe` returns in seconds. Uses the same committed
    engine/test/_fct_render_one.ts createBenchTransition path as gen_engine, so it is
    byte-identical to the corresponding frame of a full render."""
    env = dict(os.environ, FCT_SLUG=slug, FCT_FRAME=str(frame), FCT_N=str(N_FRAMES),
               FCT_OUT=os.path.abspath(out_file),
               FCT_SLUGMAP=os.path.join(REPO, "fct", "slug_map.json"))
    subprocess.run(
        ["node_modules/.bin/tsx", "test/_fct_render_one.ts"],
        cwd=os.path.join(REPO, "engine"), env=env, check=True)
    return out_file

# --- engine single-frame (fast iteration) ---
def gen_engine_frame(slug: str, frame: int, out_file: str) -> str:
    """Render ONE engine frame (index `frame` of N_FRAMES, progress frame/N) to
    `out_file`. Fast-iteration path: a full 24-frame gen_engine is minutes for a
    heavy slug (360°/Bloom), so `fct probe` renders just the frame under study and
    returns in seconds. Same committed engine/test/_fct_render_one.ts path as
    gen_engine → byte-identical to that frame of a full render."""
    env = dict(os.environ, FCT_SLUG=slug, FCT_FRAME=str(frame), FCT_N=str(N_FRAMES),
               FCT_OUT=os.path.abspath(out_file),
               FCT_SLUGMAP=os.path.join(REPO, "fct", "slug_map.json"))
    subprocess.run(
        ["node_modules/.bin/tsx", "test/_fct_render_one.ts"],
        cwd=os.path.join(REPO, "engine"), env=env, check=True)
    return out_file
