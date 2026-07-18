"""Render a (possibly mutated) .motr through the oracle + TS engine — CORRECTLY.

KEY CONSTRAINT (discovered via self-test): a .motr references sibling resources by
RELATIVE url (Media/*.mov, Drop Zone *.tiff, small.png). Rendering a copy from an
arbitrary tmp dir breaks those refs and yields garbage (7.25 dB). FCP's bundle is
read-only, so we cannot write beside the original. Solution: a MIRROR DIR — symlink every
resource sibling of the original template dir into a writable dir, write the mutated
.motr there, and render from that path. Verified: byte-identical mirror copy -> 99.0 dB.
"""
import os, sys, shutil, tempfile, subprocess
sys.path.insert(0, 'tools')
import ozengine
IMG_A = 'images/start.jpg'; IMG_B = 'images/end.jpg'

# WATCHDOG: max wall-clock a single engine frame may take before it's treated as a hang.
# A normal frame is < 2s; a warm-worker frame < 0.5s. 45s is generous headroom for a big
# scene yet still reaps a pathological infinite/near-infinite render (see EngineWorker.render).
RENDER_TIMEOUT_S = float(os.environ.get('FCT_FAITHFUL_RENDER_TIMEOUT', '45'))

def make_mirror(orig_motr_path, mutated_text, workdir):
    """Create a mirror dir beside a writable location: symlink all siblings of the
    original .motr's dir, write mutated_text as the .motr. Return the mirror .motr path."""
    sdir = os.path.dirname(orig_motr_path)
    base = os.path.basename(orig_motr_path)
    mirror = os.path.join(workdir, 'mirror')
    os.makedirs(mirror, exist_ok=True)
    for entry in os.listdir(sdir):
        d = os.path.join(mirror, entry)
        if os.path.lexists(d):
            continue
        if entry == base:
            continue
        try: os.symlink(os.path.join(sdir, entry), d)
        except OSError: pass
    mp = os.path.join(mirror, base)
    with open(mp, 'w', encoding='utf-8') as f:
        f.write(mutated_text)
    return mp

def render_oracle(motr_path, tsec, out):
    ozengine.render_frame(ozengine.load_doc(motr_path), IMG_A, IMG_B, tsec, out)


# --- Persistent TS-engine render worker -------------------------------------------------
# A one-shot `tsx test/_fct_render_motr.ts` per render pays ~2s of node/tsx cold-start; a
# full delta sweep is ~640 renders/primitive, so that startup dominated (~14 min/primitive).
# A persistent stdin-loop worker boots node + the A/B images ONCE and serves many renders,
# cutting engine cost ~10x. Crash-isolated: a malformed .motr replies "ERR" (worker
# survives); a hard crash (closed pipe / no reply) triggers a transparent respawn + retry,
# so a bad doc never poisons subsequent renders. Same pattern as fct/minimize.py's worker.
class EngineWorker:
    def __init__(self):
        self.proc = None

    def _spawn(self):
        # FRAME-CONFORMED SOURCE IMAGES (2026-07-18): the oracle (ozengine loadRGBA) applies a
        # Spatial-Conform-Fit of every source image to the 1920x1080 sequence frame, so its
        # "frame" is always 1920x1080. The TS engine has no explicit frame size — it uses
        # imageA's dims as the frame proxy. The stock test PNGs are 1854x1042, so a GENERATOR
        # (Color Solid/Noise/Clouds) — which fills imageA's dims — rendered at 1854x1042 inside a
        # 1920x1080 output, leaving a 33px/19px black border (coverage 0.932). That is NOT a
        # generator bug (interior color matches FCP at 54-70 dB); it is a source/frame size
        # MISMATCH in the harness. Feeding the engine the SAME 1920x1080-conformed images the
        # oracle uses internally makes imageA frame-sized, so generators fill the frame and the
        # delta-response isolates the primitive's math, not a coverage boundary. Drop-zone image
        # layers are unaffected (they conform-fit either way).
        env = dict(os.environ)
        _fa = os.path.abspath('engine/test/start_1920.png')
        _fb = os.path.abspath('engine/test/end_1920.png')
        if os.path.exists(_fa) and os.path.exists(_fb):
            env['FCT_RENDER_A_PNG'] = _fa
            env['FCT_RENDER_B_PNG'] = _fb
        self.proc = subprocess.Popen(
            ['node_modules/.bin/tsx', 'test/_fct_render_motr_worker.ts'], cwd='engine',
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            env=env, text=True, bufsize=1)
        if (self.proc.stdout.readline() or '').strip() != 'READY':
            self._kill()

    def _kill(self):
        if self.proc is not None:
            try: self.proc.kill()
            except Exception: pass
            try: self.proc.wait(timeout=5)
            except Exception: pass
            self.proc = None

    def render(self, motr_path, tsec, out):
        if os.path.exists(out):
            try: os.remove(out)
            except OSError: pass
        for _attempt in range(2):
            if self.proc is None or self.proc.poll() is not None:
                self._spawn()
            if self.proc is None:
                raise RuntimeError('engine worker failed to boot')
            req = '\t'.join([os.path.abspath(motr_path), str(tsec), os.path.abspath(out)]) + '\n'
            try:
                self.proc.stdin.write(req); self.proc.stdin.flush()
                reply = self._readline_timeout(RENDER_TIMEOUT_S)
            except (BrokenPipeError, ValueError, OSError):
                reply = ''
            if reply is None:
                # WATCHDOG (2026-07-18): the engine hung on this .motr for > RENDER_TIMEOUT_S
                # (a pathological param value can drive the TS render into a huge/looping
                # computation — observed a ColorSolid synth frame spinning a node worker 5+ min,
                # stalling the whole serialized sweep). Without a timeout a single bad input
                # freezes the run forever. Treat a hang exactly like a crash: kill + respawn +
                # retry once; a persistent hang raises (surfaced as a divergence with a cause,
                # not an infinite stall). readline() on a pipe has no native timeout, so we read
                # on a daemon thread and abandon it if it doesn't return in time.
                self._kill()
                continue
            if reply.startswith('OK'):
                if os.path.exists(out):
                    return
                raise RuntimeError('engine worker said OK but wrote no file')
            if reply.startswith('ERR'):
                raise RuntimeError('engine render error: %s' % reply[3:].strip()[:400])
            # No valid reply -> worker crashed on this request. Reap + respawn + retry once.
            self._kill()
        raise RuntimeError('engine worker crashed or hung (> %ds) rendering %s'
                           % (RENDER_TIMEOUT_S, motr_path))

    def _readline_timeout(self, timeout_s):
        """readline() from the worker with a wall-clock timeout. Returns the line, or None if
        the worker produced no reply within timeout_s (treated as a hang by the caller). A
        daemon reader thread is used because a pipe readline() cannot be interrupted; if it
        times out we abandon the thread and kill the worker so the stuck read is reaped."""
        import threading
        box = {}
        def _rd():
            try: box['line'] = self.proc.stdout.readline()
            except Exception: box['line'] = ''
        th = threading.Thread(target=_rd, daemon=True); th.start()
        th.join(timeout_s)
        if th.is_alive():
            return None
        return box.get('line', '')

    def close(self):
        if self.proc is not None and self.proc.poll() is None:
            try:
                self.proc.stdin.write('QUIT\n'); self.proc.stdin.flush()
                self.proc.wait(timeout=5)
            except Exception:
                self._kill()
        self.proc = None


# Module-level shared worker so callers (sweep, selftest) reuse ONE booted engine.
_worker = None
def _get_worker():
    global _worker
    if _worker is None:
        _worker = EngineWorker()
    return _worker

def render_engine(motr_path, tsec, out):
    """Render one engine frame via the shared persistent worker (fast path). Falls back to
    a one-shot subprocess only if the worker cannot boot."""
    try:
        _get_worker().render(motr_path, tsec, out)
        return
    except RuntimeError as e:
        if 'failed to boot' not in str(e):
            raise  # a real render error must propagate, not be masked by the fallback
    render_engine_oneshot(motr_path, tsec, out)

def render_engine_oneshot(motr_path, tsec, out):
    env = dict(os.environ, FCT_RENDER_MOTR=os.path.abspath(motr_path),
               FCT_RENDER_T=str(tsec), FCT_RENDER_OUT=os.path.abspath(out))
    # Same frame-conformed source images as the persistent worker (see _spawn): match the
    # oracle's 1920x1080 sequence frame so generators fill the frame (no coverage inset).
    _fa = os.path.abspath('engine/test/start_1920.png')
    _fb = os.path.abspath('engine/test/end_1920.png')
    if os.path.exists(_fa) and os.path.exists(_fb):
        env['FCT_RENDER_A_PNG'] = _fa
        env['FCT_RENDER_B_PNG'] = _fb
    r = subprocess.run(['node_modules/.bin/tsx', 'test/_fct_render_motr.ts'], cwd='engine',
                       env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode != 0 or not os.path.exists(out):
        # Surface the engine error (was swallowed to DEVNULL — R5). A silent engine crash
        # otherwise looked like a divergence with no cause.
        raise RuntimeError('engine render failed (rc=%d): %s' % (
            r.returncode, (r.stderr or b'').decode('utf-8', 'replace')[-500:]))
