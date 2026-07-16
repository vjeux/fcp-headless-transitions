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
                     frame_path, FRAME_EXT, JPEG_QUALITY, ISOLATION_ID)

# Marker appended to every render-worker argv (`--fct-iso <ISOLATION_ID>`). The tsx
# render scripts read only env vars and ignore extra argv, so this is behavior-neutral
# for the render itself — its ONLY purpose is to make each worker self-identifying in
# `ps` so sweep_orphaned_renderers() can scope its kills to THIS worktree/agent and
# never reap a parallel agent's live workers. See config.ISOLATION_ID.
_ISO_FLAG = "--fct-iso"
_ISO_ARGS = [_ISO_FLAG, ISOLATION_ID]

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
    """PRE-KILL sweep: reap EVERY leftover render worker AND previous gen DRIVER for
    THIS ISOLATION SCOPE before launching a new batch.

    The in-process reaper below only kills children of the CURRENTLY-live python (on
    any catchable exit). But a `gen --all` (or swarm wrapper) python that is SIGKILLed
    — OOM-killer, `kill -9`, a wedged box — cannot trap the signal, so ITS render tsx
    children are NOT reaped: they keep rendering for 10+ min, thrashing the box. The
    next batch then piles on top → the load-194 storm. Worse, a STALE gen DRIVER that
    is still alive keeps SPAWNING new workers, so killing only the workers is futile —
    the driver respawns them. So we kill the previous driver(s) too.

    ⚠️ ISOLATION (2026-07-16): the sweep is SCOPED so PARALLEL WORKERS DO NOT CONFLICT
    — Agent A's pre-batch kill-sweep can NEVER reap Agent B's live workers/driver. Two
    complementary scoping mechanisms:
      • RENDER WORKERS are matched by argv tag: every worker we launch carries
        `--fct-iso <ISOLATION_ID>` (see _ISO_ARGS), and we only kill workers whose argv
        carries OUR exact id. (ISOLATION_ID defaults to a hash of the REPO path and is
        overridable via $FCT_ISOLATION_ID — e.g. `swarm-<agent>`.)
      • gen/min-gen DRIVERS are matched by working directory: fct.sh runs
        `python3 fct/cli.py` with a RELATIVE path after `cd`ing into the worktree, so a
        driver's argv alone can't distinguish worktrees — but its cwd (== REPO) can. We
        only kill a driver whose cwd equals OUR REPO.
    Because every isolation scope in practice has its OWN worktree (each swarm agent
    gets `~/fct-swarm/worktrees/<id>`, and separate checkouts are separate dirs), the
    REPO cwd is distinct per scope, so BOTH mechanisms isolate correctly. (The only
    untested edge — two scopes sharing ONE worktree but DIFFERENT ids — would let the
    driver-cwd match over-reach across those two; we don't run that config. Workers stay
    isolated by tag regardless.)

    This runs at the TOP of the `gen` batch entrypoint, BEFORE the current process has
    launched any render worker of its own — so a clean slate is safe: any render tsx
    process (with our id) belongs to a previous / superseded batch of OURS. We EXCLUDE
    our own PID and our PARENT PID so the sweep can never kill the invocation running
    it. Drivers are killed FIRST (so they stop spawning), then any remaining workers.
    """
    import re
    try:
        out = subprocess.run(["ps", "-Ao", "pid,ppid,command"],
                             capture_output=True, text=True, timeout=10).stdout
    except (subprocess.SubprocessError, OSError):
        return 0
    my_pid = os.getpid()
    try:
        my_ppid = os.getppid()
    except OSError:
        my_ppid = None

    # A render worker belongs to US iff its argv carries our `--fct-iso <ISOLATION_ID>`.
    iso_tag = f"{_ISO_FLAG} {ISOLATION_ID}"

    def _proc_cwd(pid):
        """This process's working directory (via lsof, ~0.2s), or None. Used to scope a
        gen/min-gen DRIVER to THIS worktree: fct.sh runs `python3 fct/cli.py` with a
        RELATIVE path after `cd`ing into the worktree, so the driver's argv alone can't
        distinguish worktrees — its cwd (the worktree root) can."""
        try:
            out = subprocess.run(["lsof", "-a", "-d", "cwd", "-p", str(pid), "-Fn"],
                                 capture_output=True, text=True, timeout=5).stdout
        except (subprocess.SubprocessError, OSError):
            return None
        for ln in out.splitlines():
            if ln.startswith("n"):
                return ln[1:]
        return None

    drivers, workers = [], []
    for line in out.splitlines()[1:]:
        m = re.match(r"\s*(\d+)\s+(\d+)\s+(.*)", line)
        if not m:
            continue
        pid, ppid, cmd = int(m.group(1)), int(m.group(2)), m.group(3)
        if pid == my_pid or pid == my_ppid:
            continue  # never kill ourselves or the launcher/nesting driver
        is_worker = (("test/_fct_render.ts" in cmd or "test/_fct_render_one.ts" in cmd)
                     and iso_tag in cmd)
        # A gen/min-gen DRIVER (`... fct/cli.py gen|min-gen ...`, path may be relative).
        # Confirm it belongs to THIS worktree by checking its cwd == our REPO — so a
        # driver in ANOTHER worktree (its own cwd) is NEVER matched.
        is_driver = False
        if re.search(r"(?:^|[/\s])fct/cli\.py\s+(?:gen|min-gen)\b", cmd):
            is_driver = _proc_cwd(pid) == REPO
        if is_driver:
            drivers.append(pid)
        elif is_worker:
            workers.append(pid)

    killed = 0
    for pid in drivers + workers:  # drivers first so they stop spawning, then workers
        try:
            os.kill(pid, signal.SIGKILL)
            killed += 1
        except (ProcessLookupError, PermissionError, OSError):
            pass
    if killed:
        print(f"[gen] swept {killed} leftover process(es) "
              f"({len(drivers)} driver(s) + {len(workers)} worker(s)) from a previous "
              f"batch [iso={ISOLATION_ID}]",
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
        ["node_modules/.bin/tsx", "test/_fct_render.ts", *_ISO_ARGS],
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
        ["node_modules/.bin/tsx", "test/_fct_render_one.ts", *_ISO_ARGS],
        cwd=os.path.join(REPO, "engine"), env=env)
    return out_file
