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
import os, sys, json, subprocess, signal, atexit, threading
from .config import (N_FRAMES, IMG_A, IMG_B, REPO, frames_dir, slug_motr,
                     frame_path, FRAME_EXT, JPEG_QUALITY)

# --- ORPHAN-SAFE render subprocess launcher ---------------------------------
# ROOT CAUSE of the recurring swarm box-death (multi-tick merge blocker, load 194,
# 60 stranded `_fct_render` workers, swap over physical, node knocked OFFLINE): a
# render tsx child spawned by plain subprocess.run() lives in the PARENT's process
# group. When the parent python (a `gen --all` pass, or the swarm pool's per-agent
# wrapper) is killed — especially SIGKILL, which cannot be trapped — the tsx child
# is NOT signalled; it is reparented to init (ppid=1) and keeps rendering for 10+
# min, thrashing the box. N agents leaking a few of these each => the storm.
#
# Fix: launch every render in its OWN session/process-group (start_new_session=True)
# and TRACK it. On ANY parent exit path we can trap (normal return, exception,
# SIGTERM/SIGINT/SIGHUP from the pool teardown), reap the whole child group with
# killpg. This does NOT change render output (byte-identical) — it only guarantees
# children die WITH the parent instead of orphaning. (SIGKILL of the python still
# can't be trapped, but the pool teardown uses catchable signals + pkill; and a
# child in its own group is reapable by `kill -- -PGID`.)
_LIVE_CHILDREN = set()
_LIVE_LOCK = threading.Lock()

def _reap_live_children(*_a):
    with _LIVE_LOCK:
        pids = list(_LIVE_CHILDREN)
    for pid in pids:
        try:
            os.killpg(pid, signal.SIGKILL)  # pid == pgid because start_new_session
        except (ProcessLookupError, PermissionError, OSError):
            pass

def sweep_orphaned_renderers():
    """PRE-KILL sweep: reap EVERY leftover render worker before launching a new batch.

    The in-process reaper below only kills children of the CURRENTLY-live python (on
    any catchable exit). But a `gen --all` (or swarm wrapper) python that is SIGKILLed
    — OOM-killer, `kill -9`, a wedged box — cannot trap the signal, so ITS render tsx
    children are NOT reaped: they keep rendering for 10+ min, thrashing the box. The
    next batch then piles on top → the load-194 storm.

    This runs at the TOP of the `gen` batch entrypoint, BEFORE the current process has
    launched any render worker of its own — so killing EVERY matching render tsx
    process is safe: none of them belong to this run yet. We match ONLY our render tsx
    scripts by argv (test/_fct_render.ts / test/_fct_render_one.ts), so the navi-node
    CLI and any unrelated node/python process are NEVER touched. We also skip our own
    PID and our own process group defensively (they can't match the render argv, but
    belt-and-suspenders). This kills BOTH true orphans (ppid==1 from a prior killed
    parent) AND any still-running sibling batch's workers — the user asked for a clean
    slate every `gen`, so a previous batch is always superseded.
    """
    import re
    try:
        out = subprocess.run(["ps", "-Ao", "pid,ppid,command"],
                             capture_output=True, text=True, timeout=10).stdout
    except (subprocess.SubprocessError, OSError):
        return 0
    my_pid = os.getpid()
    try:
        my_pgid = os.getpgrp()
    except OSError:
        my_pgid = None
    killed = 0
    for line in out.splitlines()[1:]:
        m = re.match(r"\s*(\d+)\s+(\d+)\s+(.*)", line)
        if not m:
            continue
        pid, ppid, cmd = int(m.group(1)), int(m.group(2)), m.group(3)
        # Only OUR render tsx workers (never the navi-node CLI or other node procs).
        if "test/_fct_render.ts" not in cmd and "test/_fct_render_one.ts" not in cmd:
            continue
        # Never kill ourselves (defensive — the current python can't match the render
        # argv, but a render worker we just tracked shouldn't exist yet at sweep time).
        if pid == my_pid:
            continue
        try:
            os.kill(pid, signal.SIGKILL)
            killed += 1
        except (ProcessLookupError, PermissionError, OSError):
            pass
    if killed:
        print(f"[gen] swept {killed} leftover render worker(s) from a previous batch",
              file=sys.stderr, flush=True)
    return killed

atexit.register(_reap_live_children)
for _sig in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
    try:
        _prev = signal.getsignal(_sig)
        def _handler(signum, frame, _prev=_prev):
            _reap_live_children()
            if callable(_prev) and _prev not in (signal.SIG_DFL, signal.SIG_IGN):
                _prev(signum, frame)
            else:
                # restore default and re-raise so the process still dies as expected
                signal.signal(signum, signal.SIG_DFL)
                os.kill(os.getpid(), signum)
        signal.signal(_sig, _handler)
    except (ValueError, OSError):
        pass  # not in main thread (e.g. ThreadPoolExecutor worker) — atexit still covers it

def _run_render(argv, cwd, env):
    """subprocess.run for a render tsx, but in its own process group so a parent
    death reaps the child instead of orphaning it. check=True semantics preserved."""
    p = subprocess.Popen(argv, cwd=cwd, env=env, start_new_session=True)
    with _LIVE_LOCK:
        _LIVE_CHILDREN.add(p.pid)
    try:
        rc = p.wait()
    except BaseException:
        # parent thread interrupted/cancelled — kill the child group, don't leak it
        try: os.killpg(p.pid, signal.SIGKILL)
        except OSError: pass
        raise
    finally:
        with _LIVE_LOCK:
            _LIVE_CHILDREN.discard(p.pid)
    if rc != 0:
        raise subprocess.CalledProcessError(rc, argv)
    return rc

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
    # If the slug dir is a SYMLINK (swarm agents seed their private frames dir with
    # per-slug symlinks into the shared baseline store to avoid an 8x deep copy),
    # replace it with a real directory before writing so a re-render NEVER writes back
    # through the symlink into the shared store. Harmless for the normal (non-symlink)
    # single-agent case.
    if os.path.islink(out_dir):
        os.unlink(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    env = dict(os.environ, FCT_SLUG=slug, FCT_OUT=out_dir, FCT_N=str(N_FRAMES),
               FCT_EXT=FRAME_EXT, FCT_QUALITY=str(JPEG_QUALITY),
               FCT_SLUGMAP=os.path.join(REPO, "fct", "slug_map.json"))
    subprocess_env = env
    _run_render(
        ["node_modules/.bin/tsx", "test/_fct_render.ts"],
        cwd=os.path.join(REPO, "engine"), env=subprocess_env)
    return out_dir

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
    _run_render(
        ["node_modules/.bin/tsx", "test/_fct_render_one.ts"],
        cwd=os.path.join(REPO, "engine"), env=env)
    return out_file
