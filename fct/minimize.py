"""fct.minimize — DELTA-DEBUGGING for .motr transitions.

Debugging a whole transition (Wipes/Diagonal is 17,671 XML elements, 105 scenenodes,
15 filters, dozens of behaviours + masks) is intractable: too many interacting parts
to know WHICH one our TS engine renders wrong. This tool shrinks the .motr to the
MINIMAL subtree that still makes our engine diverge from the real FCP engine — the
exact node(s) to fix.

THE ORACLE — why this is legitimate and NOT the ROADMAP's forbidden "render-vs-render":
  The one-truth rule forbids using headless as a STAND-IN for the GUI GT when scoring
  the FULL shipped transitions (that was circular — a headless "ceiling" hid real bugs).
  Here the comparison is fundamentally different: `headless` IS the real FCP Motion
  engine (Ozone.framework + oz_render, in-process). We render the SAME reduced .motr
  through BOTH FCP and our engine and measure how far OUR output is from FCP's ACTUAL
  output on that exact input. We are localizing "which node makes our code diverge from
  FCP's code" — a debugging probe, not a correctness score. The GUI GT stays the only
  truth for the shipped-transition gate; minimized cases are a separate, additive
  objective (drive engine==FCP on each reduced repro).

ALGORITHM (ddmin, coarse-to-fine, single-frame):
  1. Render the ORIGINAL .motr through FCP + engine at the ONE worst-divergence frame
     (found by a 24-frame scan once). Baseline divergence D0 = 255-space MSE there.
     If the engine already matches FCP (PSNR >= --keep-above), there's nothing to
     minimize — abort (the discrepancy is vs the GUI, not vs FCP; different problem).
  2. STRUCT pass — enumerate removable STRUCTURAL nodes (scenenode/layer/group/filter/
     behavior/mask) — a few hundred, not 17k. Greedily try removing each subtree,
     deepest-first. ACCEPT a removal iff, after it: (a) FCP still renders a valid
     (non-black) frame, AND (b) the engine STILL diverges from FCP by >= D0*(1-slack).
     Else RESTORE. This localizes SOME divergence to a minimal set of nodes.
  3. LINE-MINIFICATION passes (always on) — the struct pass leaves ~70% of a .motr as
     boilerplate/UI-state XML it CAN'T reach (those tags aren't structural). Five
     render-gated passes then shrink the FILE itself:
       boiler    → unreferenced <factory> type decls (a Motion .motr always ships a
                   fixed 14-row factory table regardless of use), unwired footage
                   <clip>/<footage>, and scene metadata (publishSettings/curvesets/…).
       emptyfold → collapsed-panel <parameter> FOLDERS that hold only foldFlags and no
                   value/curve/child (Lighting/Shadows/Reflection/Crop UI stubs).
       param     → individual default-valued <parameter> value leaves.
       generic   → EVERY other non-envelope element the passes above can't reach
                   (<sceneSettings> scalars, behaviour plumbing, clip fields, scene meta).
       value     → simplify remaining attribute/text VALUES toward default / 0 / round.
     Each change is gated with require_engine=True (a change that breaks OUR engine is
     reverted — a repro that our engine can't even render is useless) AND keeps the
     divergence >= target. Iterated to a fixpoint.

  WE DO NOT TRY TO PRESERVE THE "SAME" BUG. The point of this tool is to shrink the
  document as far as possible so that ONE tiny, unambiguous divergence remains. If a
  removal changes the FLAVOUR of the divergence (e.g. the repro that used to show a
  "16%-too-narrow plate" now shows "engine renders black where FCP renders grey"), that
  is a WIN, not a regression — the smaller repro isolates a simpler, more fixable defect
  with fewer confounding effects. Per LOOP.md RULE 1, every divergence is its own real
  bug; you fix whatever the minimal repro shows, then re-minimize from source and repeat.
  So the gate only checks "still diverges enough" and "still renders" — there is
  deliberately NO upper bound and NO signature/identity check tying the shrunk repro to
  the original bug. Smaller-and-different is exactly the goal.

  Coarse struct removal collapses 17k elements to a tiny subtree in minutes; the line
  passes then strip it to a few dozen lines showing a single defect.


Both renderers share ONE FCP engine boot; trials render to a tmpdir. Nothing writes
the committed frame stores. Output → fct/minimized/<name>/ (case.motr + headless/ +
engine/ + manifest.json), consumed by the `fct min-*` gate commands.
"""
import os, sys, json, math, tempfile, shutil
import xml.etree.ElementTree as ET

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ozengine (the headless FCP boot) lives in tools/ — ensure it's importable.
sys.path.insert(0, os.path.join(REPO, "tools"))

# Structural nodes worth removing as whole subtrees (coarse pass). NOT <parameter>
# (that's the fine pass) and NOT low-level curve/flags noise.
_STRUCT_TAGS = {"scenenode", "layer", "group", "mask", "behavior", "filter"}
MIN_DIR = os.path.join(REPO, "fct", "minimized")


def _localname(tag):
    return tag.split('}')[-1] if '}' in tag else tag


def _link_siblings(src_motr, work_dir):
    """Symlink every sibling of `src_motr` (its bundle's Media/, small.png, .localized/,
    …) into `work_dir` so trial .motr files written there resolve bundled resources the
    SAME way the original does. FCP resolves those paths relative to the .motr dir, so
    without this a temp-dir copy renders differently (missing particle textures)."""
    srcdir = os.path.dirname(src_motr)
    for name in os.listdir(srcdir):
        if name.endswith(".motr"):
            continue  # the .motr itself is written fresh per trial
        link = os.path.join(work_dir, name)
        if os.path.lexists(link):
            continue
        try:
            os.symlink(os.path.join(srcdir, name), link)
        except OSError:
            pass



def _render_headless(motr_path, out_path, frame_i, nframes):
    """Render ONE frame of motr_path through FCP-headless to out_path, in an ISOLATED
    subprocess. The FCP engine SIGSEGVs on some malformed reduced docs (routine during
    node-stripping), and an in-process crash would kill the whole minimizer; a subprocess
    contains it (the parent just sees a missing/failed frame → treats that trial as
    "broke headless" and restores the node). Returns True on a written frame.

    NB: this one-shot path re-boots the engine per call (~3.5s). The minimizer uses the
    PERSISTENT worker (_HeadlessWorker below) for the hot loop instead, which boots once
    and only respawns on an actual crash — ~10x fewer boots. This function is kept for
    the final case-frame render (_render_case_frames) where per-call isolation is fine."""
    import subprocess
    if os.path.exists(out_path):
        try: os.remove(out_path)
        except OSError: pass
    cli = os.path.join(REPO, "fct", "cli.py")
    # The child re-execs under venv+DYLD itself (see fct/cli.py _headless-frame).
    try:
        subprocess.run([sys.executable, cli, "_headless-frame",
                        os.path.abspath(motr_path), str(frame_i), str(nframes), os.path.abspath(out_path)],
                       env=dict(os.environ), timeout=90,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return False
    return os.path.exists(out_path)


class _HeadlessWorker:
    """A PERSISTENT FCP-headless render server, spawned once and reused across trials.

    WHY: the ddmin hot loop does hundreds of headless renders. Booting a fresh Ozone
    engine per trial (the `fct _headless-frame` one-shot) costs ~3.5s EACH — that boot
    dominates the runtime. This class boots the engine ONCE (`fct _headless-worker`,
    which stays alive reading requests off stdin) and streams every trial through the
    SAME live engine, so a clean trial costs only the load_doc + render (~0.3s).

    CRASH ISOLATION IS PRESERVED, just at a coarser grain: a malformed reduced doc can
    SIGSEGV the engine. When it does, the worker process dies mid-request; `render()`
    sees a closed pipe / short read, marks that ONE trial as "broke headless" (→ the
    minimizer restores the node, exactly as before), and TRANSPARENTLY RESPAWNS the
    worker for the next request. So we pay the ~3.5s boot once per CRASH, not once per
    trial — and reduced docs rarely crash, so this is ~10x fewer boots in practice.

    Protocol mirrors `fct _headless-worker`: send "<motr>\t<frame>\t<nframes>\t<out>\n",
    read one reply line ("OK"/"ERR"); no line == the worker crashed."""

    def __init__(self):
        self.proc = None

    def _spawn(self):
        import subprocess
        cli = os.path.join(REPO, "fct", "cli.py")
        self.proc = subprocess.Popen(
            [sys.executable, cli, "_headless-worker"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            env=dict(os.environ), text=True, bufsize=1)
        # Wait for the READY handshake (engine booted). If the boot itself fails,
        # the pipe closes with no READY -> proc is unusable; caller falls back.
        line = self.proc.stdout.readline()
        if line.strip() != "READY":
            self._kill()

    def _kill(self):
        if self.proc is not None:
            try: self.proc.kill()
            except Exception: pass
            try: self.proc.wait(timeout=5)
            except Exception: pass
            self.proc = None

    def render(self, motr_path, out_path, frame_i, nframes):
        """Render one frame via the persistent worker. Returns True iff out_path written.
        Respawns the worker transparently if it crashed on the PREVIOUS request."""
        if os.path.exists(out_path):
            try: os.remove(out_path)
            except OSError: pass
        # Retry once: the failure mode is "the previous doc crashed the engine", so a
        # fresh worker on retry renders THIS (different) doc fine. A doc that crashes
        # the engine ON ITS OWN request still returns False after the retry (the reduced
        # doc is invalid) — correct: the minimizer treats it as "broke headless".
        for attempt in range(2):
            if self.proc is None or self.proc.poll() is not None:
                self._spawn()
            if self.proc is None:
                return False  # boot failed entirely
            req = "\t".join([os.path.abspath(motr_path), str(frame_i),
                             str(nframes), os.path.abspath(out_path)]) + "\n"
            try:
                self.proc.stdin.write(req)
                self.proc.stdin.flush()
                reply = self.proc.stdout.readline()
            except (BrokenPipeError, ValueError, OSError):
                reply = ""
            if reply.strip() in ("OK", "ERR"):
                return os.path.exists(out_path)
            # No valid reply -> the worker crashed on this request. Reap it and, on the
            # first attempt, respawn + retry (handles "previous doc poisoned the engine").
            self._kill()
        return os.path.exists(out_path)

    def close(self):
        if self.proc is not None and self.proc.poll() is None:
            try:
                self.proc.stdin.write("QUIT\n"); self.proc.stdin.flush()
                self.proc.wait(timeout=5)
            except Exception:
                self._kill()
        self.proc = None


class _EngineWorker:
    """A PERSISTENT JS/TS-engine render server — the engine-side twin of _HeadlessWorker.

    WHY: the ddmin hot loop does hundreds of ENGINE renders too. The one-shot
    `_fct_render_one.ts` pays the Node boot + tsx/esbuild TypeScript transpile of the
    whole engine import graph (~1-2s) on EVERY trial — which dwarfs the actual render
    (~10-50ms). This boots that graph ONCE (`test/_fct_render_worker.ts`, which stays
    alive reading requests off stdin) and streams every trial through the SAME live
    process. Verified BIT-IDENTICAL to the one-shot renderer, and A-before-BC == A-after-BC
    (zero state leak) — the engine builds a fresh createTransition per call, so there is no
    drifting GPU/canvas state (unlike a naive persistent scorer, which can produce
    false-low PSNRs — see AUDIT 2026-07-26).

    Crash isolation preserved at process grain: a malformed .motr that throws is CAUGHT in
    the worker (replies "ERR"); one that hard-crashes the process is seen as a closed pipe,
    the trial is marked failed, and the worker is transparently respawned. Protocol:
    send "<motr>\t<frame>\t<nframes>\t<out>\n", read one reply line ("OK"/"ERR")."""

    def __init__(self):
        self.proc = None

    def _spawn(self):
        import subprocess
        from fct.config import ISOLATION_ID
        self.proc = subprocess.Popen(
            ["node_modules/.bin/tsx", "test/_fct_render_worker.ts", "--fct-iso", ISOLATION_ID],
            cwd=os.path.join(REPO, "engine"),
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            env=dict(os.environ), text=True, bufsize=1)
        line = self.proc.stdout.readline()
        if line.strip() != "READY":
            self._kill()

    def _kill(self):
        if self.proc is not None:
            try: self.proc.kill()
            except Exception: pass
            try: self.proc.wait(timeout=5)
            except Exception: pass
            self.proc = None

    def render(self, motr_path, out_path, frame_i, nframes):
        """Render one engine frame via the persistent worker. Returns True iff written.
        Respawns transparently if the worker crashed on the PREVIOUS request."""
        if os.path.exists(out_path):
            try: os.remove(out_path)
            except OSError: pass
        for attempt in range(2):
            if self.proc is None or self.proc.poll() is not None:
                self._spawn()
            if self.proc is None:
                return False
            req = "\t".join([os.path.abspath(motr_path), str(frame_i),
                             str(nframes), os.path.abspath(out_path)]) + "\n"
            try:
                self.proc.stdin.write(req)
                self.proc.stdin.flush()
                reply = self.proc.stdout.readline()
            except (BrokenPipeError, ValueError, OSError):
                reply = ""
            if reply.strip() in ("OK", "ERR"):
                return os.path.exists(out_path)
            # No valid reply -> the worker crashed on this request. Reap + respawn + retry.
            self._kill()
        return os.path.exists(out_path)

    def close(self):
        if self.proc is not None and self.proc.poll() is None:
            try:
                self.proc.stdin.write("QUIT\n"); self.proc.stdin.flush()
                self.proc.wait(timeout=5)
            except Exception:
                self._kill()
        self.proc = None


def _render_engine(motr_path, out_path, frame_i, nframes, eworker=None):
    """Render ONE engine frame (index frame_i of nframes) for an ARBITRARY motr path.
    If `eworker` (a persistent _EngineWorker) is given, stream through it (boots the
    engine graph ONCE); else fall back to the per-call isolated `tsx` subprocess."""
    if eworker is not None:
        return eworker.render(motr_path, out_path, frame_i, nframes)
    import subprocess
    smap = out_path + ".slugmap.json"
    json.dump({"_min": os.path.abspath(motr_path)}, open(smap, "w"))
    env = dict(os.environ, FCT_SLUG="_min", FCT_FRAME=str(frame_i), FCT_N=str(nframes),
               FCT_OUT=os.path.abspath(out_path), FCT_SLUGMAP=smap)
    # Tag the worker with this worktree's isolation id (same scheme as gen.py) so the
    # gen pre-batch kill-sweep only reaps OUR render workers, never a parallel agent's.
    from fct.config import ISOLATION_ID
    r = subprocess.run(["node_modules/.bin/tsx", "test/_fct_render_one.ts", "--fct-iso", ISOLATION_ID],
                       cwd=os.path.join(REPO, "engine"), env=env,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return r.returncode == 0 and os.path.exists(out_path)




def _mse_engine_vs_headless(motr_path, tmp, frame_i, nframes, worker=None,
                            require_engine=False, eworker=None):
    """255-space MSE between FCP-headless and engine at frame_i (both sRGB → no
    color conform). Returns (mse, valid).

    If `worker` (a _HeadlessWorker) is given, the headless render goes through the
    PERSISTENT engine (boots once, ~10x fewer boots); else it falls back to the
    per-call isolated `_render_headless` subprocess.

    `require_engine`: when True, a missing ENGINE frame makes the trial INVALID
    (valid=False) instead of reporting mse=1e9. The coarse structural pass keeps the
    old behavior (require_engine=False: an engine that crashes without the node still
    counts as "diverges"), but the FINE/AGGRESSIVE passes set require_engine=True so a
    removal that crashes the engine is REVERTED — we want the shrunk repro to still
    render CLEANLY in both engines, not to "shrink" by breaking our own renderer."""
    import numpy as np
    from fct.read import read_frame
    hp = os.path.join(tmp, "h.jpg"); ep = os.path.join(tmp, "e.jpg")
    for p in (hp, ep):
        if os.path.exists(p): os.remove(p)
    if worker is not None:
        hv = worker.render(motr_path, hp, frame_i, nframes)
    else:
        hv = _render_headless(motr_path, hp, frame_i, nframes)
    _render_engine(motr_path, ep, frame_i, nframes, eworker=eworker)
    if not hv or not os.path.exists(hp):
        return 0.0, False
    h = read_frame(hp, size=(480, 270))
    if h.mean() < 1.0:   # FCP rendered ~black → this reduced doc broke FCP
        return 0.0, False
    if not os.path.exists(ep):
        return (0.0, False) if require_engine else (1e9, True)
    e = read_frame(ep, size=(480, 270))
    return float(((h - e) ** 2).mean()), True


def _find_worst_frame(motr_path, tmp, nframes, worker=None, eworker=None):
    """Return (worst_frame_index, mse) for engine-vs-FCP divergence. Probes a COARSE
    subset of frames (not all N) — each probe is 2 subprocess renders (~a few s), so a
    full 24-frame scan is wasteful. The subset spans the transition (early/mid/late)
    which reliably brackets the peak-divergence frame; the ddmin loop then works that
    one frame. Override with --frame to skip the scan entirely."""
    # ~8 evenly-spaced probes across the transition.
    step = max(1, nframes // 8)
    cand = list(range(1, nframes, step))
    best_i, best_mse = cand[0], -1.0
    for i in cand:
        mse, ok = _mse_engine_vs_headless(motr_path, tmp, i, nframes, worker=worker, eworker=eworker)
        if ok and mse > best_mse:
            best_mse, best_i = mse, i
    return best_i, best_mse


def _factory_desc_map(root):
    """Map factory-id (int) -> description string from the .motr's <factory> table, so a
    scenenode's factoryID can be resolved to its Motion type (e.g. "Replicator"). Robust
    across files (ids are per-document; descriptions are stable Motion type names)."""
    m = {}
    for f in root.iter():
        if _localname(f.tag) != "factory":
            continue
        fid = f.get("id")
        if fid is None:
            continue
        desc_el = next((c for c in f if _localname(c.tag) == "description"), None)
        if desc_el is not None and desc_el.text:
            try:
                m[int(fid)] = desc_el.text.strip()
            except ValueError:
                pass
    return m


def _referenced_node_ids(root):
    """IDs of nodes REFERENCED BY VALUE elsewhere whose removal silently changes FCP's render
    while the ENGINE tolerates the dangling ref — the same 'engine-tolerates-but-FCP-depends'
    hazard as the scene-geometry tags. DECODED 2026-07-26 on Stylized/Center's _t_center_multi
    (the engine-MSE-gated struct pass stripped these → false divergence):
      • Image-Mask `Mask Source` (param id=1, name "Mask Source"): the shape/replicator/group
        that IS the reveal matte. Stripped → mask dangles → FCP vs engine diverge.
      • Drop-zone `Source Media` (param id=300): binds a Transition A/B drop-zone to its <clip>.
        Stripping the <clip> corrupts the A/B map → the drop zone mis-resolves (B → A / black).
    Returns the set of integer ids named as the VALUE of any such param."""
    ref_ids = set()
    # Build a child→parent-param-id lookup so a Source Media (id=300) can be recognized by its
    # id=324 "Media" wrapper parent even when the decorative name attribute was stripped (the
    # engine resolves it structurally too — see footage.ts findSourceMediaId). id=300 alone is
    # AMBIGUOUS (Color Solid / Gradient use it for Width), so require name OR the id=324 parent.
    parent_pid = {}
    for p in root.iter():
        if _localname(p.tag) != "parameter":
            continue
        for ch in p:
            if _localname(ch.tag) == "parameter":
                parent_pid[id(ch)] = p.get("id")
    # Collect every structural node id so a Target (id=200) reference is only honored when it
    # actually points at a real node (guards the stripped-name case from a coincidental id=200
    # scalar param).
    node_ids = set()
    for el in root.iter():
        if _localname(el.tag) in _STRUCT_TAGS:
            nid = el.get("id")
            if nid and nid.isdigit():
                node_ids.add(int(nid))
    for p in root.iter():
        if _localname(p.tag) != "parameter":
            continue
        pid = p.get("id")
        name = p.get("name") or ""
        is_mask_source = pid == "1" and name == "Mask Source"
        is_source_media = pid == "300" and (name == "Source Media" or parent_pid.get(id(p)) == "324")
        # A Clone Layer / Framing / Camera behavior binds to the node it clones or looks at via a
        # `Target` param (id=200). Stripping the target's subtree leaves a dangling reference (FCP
        # renders the clone/framed view of a now-absent source as nothing / off-screen, while the
        # engine may draw the bare source directly). DECODED on Replicator-Clones/Clone_Spin: node
        # 987618479 ("Transition B") is a Camera's Target; the minimizer stripped the Camera + spin
        # transforms, leaving bare drop-zone plates the engine drew full-frame while FCP (framing
        # the spun/edge-on plates) rendered black → false 7.4 dB divergence. Protect the Target's
        # subtree. Name-independent (minimizer strips names) but gated on the value being a REAL
        # node id below, so a coincidental scalar id=200 param never matches.
        is_clone_target = pid == "200" and (name == "Target" or name == "")
        if not (is_mask_source or is_source_media or is_clone_target):
            continue
        v = p.get("value")
        if v is None:
            continue
        try:
            iv = int(float(v))
        except ValueError:
            continue
        # A Target (id=200) must reference an existing node; Mask Source / Source Media always do.
        if is_clone_target and iv not in node_ids:
            continue
        if iv > 0:
            ref_ids.add(iv)
    return ref_ids


def _is_protected(el, factory_desc, protect):
    """A structural element is protected (never stripped) when its factoryID resolves to a
    Motion type in `protect` (e.g. {"Replicator","Sequence Replicator","Replicator Cell"}),
    so a re-minimized repro RETAINS the node that exercises the target subsystem. Also
    protects any structural descendant of a protected node (the cell/source must survive
    with its replicator) — checked by the caller via the ancestor set."""
    if not protect:
        return False
    fid = el.get("factoryID")
    if fid is None:
        return False
    try:
        return factory_desc.get(int(fid), "") in protect
    except ValueError:
        return False


def _protected_subtree(root, protect, factory_desc):
    """Set of elements that live INSIDE a protected subtree (a node whose factoryID
    resolves to a protected Motion type, plus all its descendants). The line-minification
    passes skip these so a `--protect Replicator` re-minimize keeps not just the replicator
    NODE but every <parameter>/curve inside it — otherwise stripping a leaf param would
    silently change the very subsystem the protected repro is meant to exercise. Returns an
    empty set when protect is falsy (line passes then range over everything)."""
    if not protect:
        return set()
    inside = set()
    def mark(e, under):
        p = under or _is_protected(e, factory_desc, protect)
        if p:
            inside.add(e)
        for c in list(e):
            mark(c, p)
    mark(root, False)
    return inside


def _iter_struct(root, protect=None, factory_desc=None):
    """(parent, child) for removable STRUCTURAL child elements, deepest-first.

    When `protect` is given (a set of Motion factory-description type names), any node
    whose factoryID resolves to a protected type — AND every structural descendant of such
    a node — is EXCLUDED from removal. This lets a re-minimize keep a live Replicator (and
    its cell/source subtree) so the reduced repro still exercises replicator.ts, instead of
    delta-debug stripping the replicator because the divergence has other contributors too.
    """
    factory_desc = factory_desc if factory_desc is not None else (_factory_desc_map(root) if protect else {})
    parent = {}
    order = []
    # Mark protected roots and all their descendants.
    protected = set()
    def mark(e, under_protected):
        p = under_protected or _is_protected(e, factory_desc, protect)
        if p:
            protected.add(e)
        for c in list(e):
            mark(c, p)
    if protect:
        mark(root, False)
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    # REFERENCED-NODE PROTECTION (always on, independent of --protect): a node whose id is the
    # VALUE of a `Mask Source` (id=1) or drop-zone `Source Media` (id=300) param must survive —
    # stripping it dangles the reference and silently changes FCP's render (the engine-MSE gate
    # can't catch it because the engine tolerates the dangling ref). Protect every element whose
    # own id is referenced, plus its descendants and ancestor chain. See _referenced_node_ids.
    ref_ids = _referenced_node_ids(root)
    if ref_ids:
        for e in order:
            eid = e.get("id")
            if eid is not None and eid.isdigit() and int(eid) in ref_ids:
                # protect the node + all descendants
                stack = [e]
                while stack:
                    n = stack.pop()
                    protected.add(n)
                    stack.extend(list(n))

    # Also protect the ANCESTOR CHAIN of every protected node: you cannot strip a container
    # (e.g. the plain <layer>/<group> holding the Clone Layers) without taking the protected
    # nodes with it. Without this, the minimizer removed the un-typed parent group and every
    # protected clone inside it (3D_Rectangle went 25 clones -> 0 despite --protect "Clone
    # Layer"). Walk each protected node up to the root and protect every ancestor. Runs whenever
    # anything is protected — via --protect OR the always-on referenced-node protection above.
    if protected:
        for c in list(protected):
            a = parent.get(c)
            while a is not None:
                protected.add(a)
                a = parent.get(a)
    for c in order:
        if _localname(c.tag) in _STRUCT_TAGS and c not in protected:
            yield parent[c], c


def _iter_params(root, protect=None, factory_desc=None):
    """(parent, child) for <parameter> leaves (fine pass), deepest-first. Only params
    that have NO child <parameter> (true leaves) so we strip settings, not folders.
    Params inside a protected subtree are skipped (see _protected_subtree)."""
    inside = _protected_subtree(root, protect, factory_desc)
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    for c in order:
        if c in inside:
            continue
        if _localname(c.tag) == "parameter" and not any(_localname(k.tag) == "parameter" for k in c):
            yield parent[c], c


# Non-<parameter> boilerplate that bloats a repro without carrying the bug: unreferenced
# <factory> type decls, footage <clip>/<footage> blocks whose media isn't wired in, and
# top-level scene metadata (publishSettings, curvesets, guides, markers, build/description).
# NOT hardcoded as "safe" — each is still individually render-gated (require_engine=True),
# so anything load-bearing is RESTORED. This just makes the minimizer TRY them, which the
# struct pass never did (they aren't in _STRUCT_TAGS). Reference-aware ordering (unreferenced
# ids first) makes the common wins cheap; the gate is the real safety net.
_BOILERPLATE_TAGS = {"factory", "clip", "footage", "publishSettings", "curvesets",
                     "guideset", "timemarkerset", "build"}


def _iter_boilerplate(root, protect=None, factory_desc=None):
    """(parent, child) for removable NON-parameter boilerplate, deepest-first, with
    unreferenced defs yielded FIRST (cheap wins), then the rest. The ddmin gate still
    render-tests every removal, so a referenced-but-actually-inert def can still go.
    Elements inside a protected subtree are skipped."""
    inside = _protected_subtree(root, protect, factory_desc)
    ref_ids = _referenced_node_ids(root)
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    # Factory ids referenced by ANY node's factoryID attribute — those <factory> type decls are
    # load-bearing for the engine's factoryID -> Motion-type resolution and must never be stripped.
    _factory_ref_ids = set()
    for el in root.iter():
        fattr = el.get("factoryID")
        if fattr is not None:
            _factory_ref_ids.add(fattr)
    def _ref_protected(c):
        # A <clip>/<footage> whose id is a drop-zone Source Media / Mask Source target must
        # survive (see _referenced_node_ids) — stripping it corrupts FCP's A/B clip binding.
        cid = c.get("id")
        if cid is not None and cid.isdigit() and int(cid) in ref_ids:
            return True
        # A <factory> whose id is referenced by ANY node's factoryID attribute is load-bearing:
        # it maps factoryID -> Motion type (Camera/Framing/Replicator/...). DECODED on
        # Replicator-Clones/Clone_Spin — the boiler pass stripped <factory id="11"> (Camera) even
        # though a scenenode uses factoryID="11"; the ENGINE-MSE gate accepted it because the
        # engine doesn't yet model the Camera (renders the plate flat either way), but the strip
        # DESTROYS the faithful repro (the Camera node degrades to a plain group, so a future
        # camera fix can't even be exercised). FCP resolves factoryID from its BUILT-IN registry
        # so it renders identically with/without the <factory> row — exactly the engine-tolerates-
        # (here: engine-ALSO-tolerates-but-only-because-unimplemented) hazard. Keep referenced
        # factory rows so re-minimized repros retain their true node types.
        if _localname(c.tag) == "factory" and cid is not None:
            if cid in _factory_ref_ids:
                return True
        return False
    cands = [c for c in order if _localname(c.tag) in _BOILERPLATE_TAGS and c not in inside and not _ref_protected(c)]
    blob = ET.tostring(root, encoding="unicode")
    def is_unref(c):
        cid = c.get("id")
        if cid is None:
            return True  # metadata blocks (publishSettings etc.) have no id → try freely
        # a <factory>/<clip> is "unreferenced" if its id token appears nowhere else
        return blob.count(f'"{cid}"') <= 1
    cands.sort(key=lambda c: 0 if is_unref(c) else 1)
    for c in cands:
        yield parent[c], c



def _iter_empty_param_folders(root, protect=None, factory_desc=None):
    """(parent, child) for <parameter> FOLDERS that are pure UI state — they contain only
    <foldFlags>/<flags> and NO value=, NO <curve>, NO child <parameter>, NO <keypoint>.
    These are collapsed-panel markers (Lighting/Shadows/Reflection/Crop stubs) that carry
    no render meaning. Deepest-first so nested empties collapse bottom-up. Skips folders
    inside a protected subtree."""
    inside = _protected_subtree(root, protect, factory_desc or {})
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    for c in order:
        if c in inside:
            continue
        if _localname(c.tag) != "parameter":
            continue
        if c.get("value") is not None:
            continue
        has_curve = any(_localname(k.tag) in ("curve", "keypoint") for k in c.iter())
        has_child_param = any(_localname(k.tag) == "parameter" for k in c)
        if not has_curve and not has_child_param:
            yield parent[c], c


# Document ENVELOPE: elements whose removal would make the .motr structurally invalid or
# would remove the very thing being localized. The generic pass ranges over everything
# EXCEPT these (and the struct/param/boilerplate tags, which their own passes own). The
# render gate is still the real safety net; this list just skips known-fatal removals so we
# don't waste a render trial proving that deleting <ozml> breaks the parser.
_ENVELOPE_TAGS = {"ozml", "scene", "layer", "scenenode", "footage", "clip", "behavior",
                  "factory", "parameter"}

# MEDIA-REFERENCE tags: a <clip>'s <relativeURL>/<pathURL> bind it to a BUNDLED MEDIA file
# (Media/…). Stripping them changes FCP's media resolution — the clip flips from "bundled
# media" to "bare clip", which the engine's A/B order-fallback then mis-maps to Transition A
# (FCP renders the media / black, never source A). DECODED 2026-07-26 on Stylized/Up-Over
# (_t_upover): stripping <relativeURL>Media/bg 6.jpg</relativeURL> turned the "bg 6" bundled
# background clip into a bare clip → false engine-vs-FCP divergence (engine warm-A vs FCP bg).
# Same engine-tolerates-dangling-but-FCP-depends class as sceneSettings/vertex-index/factory.
_MEDIA_REF_TAGS = {"relativeURL", "pathURL"}

# SCENE-GEOMETRY tags: elements that define FCP's render coordinate space. These MUST
# NEVER be stripped — FCP's headless render is scene-size-DEPENDENT. DECODED 2026-07-26 on
# _t_center3/_t_center_ss: a ±160 square renders ±474×±360 (scale ~2.96×, anisotropic) UNLESS
# the scene <width>/<height> AND — critically — a <frameRate> are present, at which point FCP
# honours the authored size and renders EXACTLY ±162 (scale 1.0), matching the engine.
# Controlled probe (with <width>1920</width><height>1080</height> present): adding <duration>
# alone leaves the 2.96× upscale; adding <frameRate> alone collapses it to 1.0× — so <frameRate>
# is the field that switches FCP into the authored scene size (without it FCP uses a small
# default scene and upscales the WHOLE scene — every shape/mask vertex — to the output).
# Our minimizer's passes are gated against the ENGINE only, and the engine ALWAYS defaults to
# 1920×1080 regardless — so stripping <sceneSettings>/<width>/<height>/<frameRate> silently
# changes FCP's render while passing the engine gate, manufacturing a FALSE divergence (the
# "shape geometry scale ×2.93/×2.22" bug that consumed a session was purely this artifact).
# Protect them everywhere. (<duration>/<pixelAspectRatio> kept too — harmless completeness.)
_SCENE_GEOMETRY_TAGS = {"sceneSettings", "width", "height", "pixelAspectRatio",
                        "duration", "frameRate"}

# MEDIA-REFERENCE tags: a <clip>'s <relativeURL>/<pathURL> bind it to a BUNDLED MEDIA file
# (e.g. Media/bg 6.jpg). This is LOAD-BEARING for FCP's media resolution — a clip WITH a media
# ref resolves to that image; a clip WITHOUT one falls to the Transition A/B order-fallback.
# DECODED 2026-07-26 on Stylized/Up-Over (_t_upover): stripping <relativeURL>Media/bg 6.jpg
# </relativeURL> turned the "bg 6" background clip into a bare clip that the engine mis-maps to
# Transition A (FCP renders the bundled media / black-when-absent, never source A) — a false
# engine-vs-FCP divergence that is purely the stripped media binding. Same engine-tolerates-
# dangling-but-FCP-depends class as _SCENE_GEOMETRY_TAGS / factory / vertex-index / Source-Media.
_MEDIA_REF_TAGS = {"relativeURL", "pathURL"}

# MEDIA-REFERENCE tags: a <clip>'s <relativeURL>/<pathURL> binds it to a BUNDLED template
# media file (Media/…). Stripping it silently changes FCP's resolution: the clip stops being
# bundled media and the engine's A/B order-fallback then mis-maps it to Transition A/B (FCP
# renders the media, or black when absent — never source A). DECODED 2026-07-26 on
# Stylized/Up-Over (_t_upover): stripping <relativeURL>Media/bg 6.jpg</relativeURL> turned the
# "bg 6" background-photo clip into a bare clip → engine showed source-A full-frame vs FCP's
# bg media. Same engine-tolerates-dangling-but-FCP-depends class as sceneSettings / vertex-index
# / factory / Source-Media. Never strip.
_MEDIA_REF_TAGS = {"relativeURL", "pathURL"}


def _iter_generic(root, protect=None, factory_desc=None):
    """(parent, child) for ARBITRARY leaf/config elements the other passes can't reach:
    <sceneSettings> scalar fields (motionBlurSamples, DRTSupport, glyphOSCMode, …),
    behaviour plumbing (<expressionChannels>, <dynamicChannelIDSet>, <channelBehavior>,
    <sourceParentChannelRef>), clip fields (<missingWidth>, <mediaID>, …), and scene
    metadata (<currentFrame>, <timeRange>, <playRange>, <flags>, <audioTracks>, …).

    Deepest-first. Skips the document ENVELOPE tags (whose own passes handle them or whose
    removal is structurally fatal) and anything inside a protected subtree. Every yield is
    still render-gated + in-band, so a field the render actually depends on is RESTORED —
    this just lets the minimizer TRY the ~40 boilerplate scalar/plumbing elements a Motion
    .motr always carries regardless of the scene."""
    inside = _protected_subtree(root, protect, factory_desc or {})
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    for c in order:
        if c in inside:
            continue
        if _localname(c.tag) in _ENVELOPE_TAGS:
            continue
        if _localname(c.tag) in _SCENE_GEOMETRY_TAGS:
            continue  # scene coordinate space — stripping it changes FCP's render (see note)
        if _localname(c.tag) in _MEDIA_REF_TAGS:
            continue  # a clip's media reference — stripping it changes FCP's media resolution (see note)
        yield parent[c], c


# Value simplifications tried by the value pass, in order. Each maps a current value to a
# SIMPLER candidate; the render gate keeps the swap only if it preserves the divergence
# in-band. "Simpler" = closer to Motion's own defaults / round numbers, so the repro reads
# clearly (e.g. a keyframed Z that could be a static 0, a flags="8589938704" that could be
# "0"). We never invent values the schema wouldn't accept — we snap toward 0 / the element's
# own default= attribute / round magnitudes.
def _iter_value_simplifications(root, protect=None, factory_desc=None):
    """Yield (element, attr, old_value, new_value) candidate attribute simplifications,
    and (element, None, old_text, new_text) candidate TEXT simplifications. The caller
    applies one, render-gates it, and reverts if the divergence isn't preserved.

    Strategies (only emitted when they actually change the value):
      • value="X"  → value=default (when a default= attr exists and differs)
      • value="X"  → value="0"     (snap numeric magic numbers toward zero)
      • flags/foldFlags/baseFlags large integer → "0"
      • scalar element text (e.g. <motionBlurSamples>8</motionBlurSamples>) → "0"
    Skips protected subtrees. Deepest-first is irrelevant here (independent leaves)."""
    inside = _protected_subtree(root, protect, factory_desc or {})
    def _is_num(s):
        try:
            float(s); return True
        except (TypeError, ValueError):
            return False
    for el in root.iter():
        if el in inside:
            continue
        tag = _localname(el.tag)
        # (a) attribute value → default, then → 0
        v = el.get("value")
        if v is not None and _is_num(v):
            d = el.get("default")
            if d is not None and d != v and _is_num(d):
                yield (el, "value", v, d)
            if v not in ("0", "0.0") and float(v) != 0.0:
                yield (el, "value", v, "0")
        # (b) flag attributes → 0 (huge bitfields that are usually UI/fold state)
        for fa in ("flags", "foldFlags", "baseFlags"):
            fv = el.get(fa)
            if fv is not None and _is_num(fv) and fv not in ("0",):
                yield (el, fa, fv, "0")
        # (c) scalar element text → 0 (leaf elements like <motionBlurSamples>8</…>)
        if tag not in _ENVELOPE_TAGS and tag not in _SCENE_GEOMETRY_TAGS and len(list(el)) == 0 and el.text and _is_num(el.text.strip()):
            t = el.text.strip()
            if t not in ("0", "0.0") and float(t) != 0.0:
                yield (el, None, t, "0")


# Attributes that are load-bearing for the PARSER/resolver and must never be dropped: an
# element's own id, the numeric factoryID that wires a scenenode to its <factory>, the
# Source Media `value` that points a drop-zone at its clip, and the id-carrying attrs the
# schema keys on. Everything else (cosmetic name=, plugin metadata, redundant default=,
# unreferenced uuid=, version=) is a removal CANDIDATE — still render-gated, so anything
# that turns out to matter is restored.
# Attributes NEVER dropped by the attribute pass: removing them changes identity/wiring or
# breaks the parse. `id`/`factoryID` identify nodes and are referenced elsewhere; `value`
# carries the actual parameter setting (that's the value pass's job, not removal); `uuid` on
# <factory> is how behaviors bind a factory. Everything else on an element (name=,
# pluginUUID=, pluginVersion=, pluginName=, version=, default=, round=, etc.) is fair game —
# each is still individually render-gated, so a genuinely-load-bearing attr is restored.
_KEEP_ATTRS = {"id", "factoryID", "value", "uuid"}


def _iter_attr_removals(root, protect=None, factory_desc=None):
    """Yield (element, attr, old_value, None) candidates that DELETE an optional attribute.
    (new_value=None is the sentinel for 'remove the attribute' in _run_value_pass.) Skips
    _KEEP_ATTRS and protected subtrees. This trims the many decorative attributes a Motion
    .motr carries (name/pluginName/pluginVersion/version/default/…) that don't affect the
    render — the struct/param/value passes never touch attributes, so without this they
    survive to the final repro as noise."""
    inside = _protected_subtree(root, protect, factory_desc or {})
    for el in root.iter():
        if el in inside:
            continue
        is_vertex = _localname(el.tag) == "vertex"
        for attr in list(el.attrib.keys()):
            if attr in _KEEP_ATTRS:
                continue
            # `index` on a <vertex> is LOAD-BEARING: it defines the vertex's position in the
            # shape's closed path, i.e. how curve_X[i] pairs with curve_Y[i] and the order the
            # contour connects points. FCP (OZChannelCurve::getVertexValue reads a 2D OZVertex2D
            # keyed by index) pairs/orders by this attribute; the engine sorts by it too but
            # FALLS BACK to document order when it is absent (all index=0). So dropping <vertex
            # index=> passes the engine-MSE gate while SILENTLY changing FCP's vertex pairing —
            # DECODED on Stylized/Center's held Shape 390117 (_t_center_faithful): with the index
            # attrs stripped, FCP fills a slant triangle (apex at TOP-Y) while the engine fills the
            # doc-order polygon (apex at MID) — a false ~1 dB divergence purely from the strip.
            # Same referenced/load-bearing-attribute class as the _SCENE_GEOMETRY_TAGS strips.
            if is_vertex and attr == "index":
                continue
            yield (el, attr, el.get(attr), None)



def minimize(slug, nframes=None, keep_above=25.0, slack=0.12, max_passes=6,
             out_name=None, do_params=False, probe_frame=None, protect=None):
    from fct.config import N_FRAMES, slug_motr
    # The ddmin hot loop drives every headless render through a SINGLE persistent worker
    # (_HeadlessWorker) that boots the FCP Ozone engine once and respawns only on an
    # actual crash — instead of the old "fresh isolated subprocess (and ~3.5s engine
    # boot) per trial". Crash-isolation is preserved (a SIGSEGV on a malformed reduced
    # doc kills only the worker, which is transparently respawned for the next trial).
    nframes = nframes or N_FRAMES
    src = slug_motr(slug)
    tree = ET.parse(src)
    root = tree.getroot()

    work = tempfile.mkdtemp(prefix="fctmin_")
    # CRITICAL: FCP resolves a transition's bundled resources (Media/ particle textures,
    # small.png, .localized/) RELATIVE TO THE .motr's DIRECTORY. A bare /tmp copy loses
    # them and renders WRONG (e.g. Diagonal's particle field brightens 146→161, a false
    # 21.8 dB "divergence"). So the work dir must symlink every sibling of the source
    # .motr; then trial motrs written here resolve textures identically to the original.
    _link_siblings(src, work)
    cur = os.path.join(work, "cur.motr")
    tree.write(cur, encoding="unicode")

    worker = _HeadlessWorker()
    eworker = _EngineWorker()
    try:
        return _minimize_body(slug, tree, root, work, cur, src, fi_probe=probe_frame,
                              nframes=nframes, keep_above=keep_above, slack=slack,
                              max_passes=max_passes, out_name=out_name,
                              do_params=do_params, worker=worker, protect=protect,
                              eworker=eworker)
    finally:
        worker.close()
        eworker.close()
        shutil.rmtree(work, ignore_errors=True)


def _minimize_body(slug, tree, root, work, cur, src, fi_probe, nframes, keep_above,
                   slack, max_passes, out_name, do_params, worker, protect=None,
                   eworker=None):
    # Resolve the protect set (Motion factory-description type names) to the factory map
    # ONCE — nodes of these types (+ their structural descendants) are never stripped, so
    # a re-minimize retains a live Replicator subtree (see _iter_struct docstring).
    protect = set(protect) if protect else None
    factory_desc = _factory_desc_map(root) if protect else {}
    def _struct_iter(r): return _iter_struct(r, protect=protect, factory_desc=factory_desc)
    # 1. worst frame + baseline divergence (skip the scan if --frame was given).
    if fi_probe is not None:
        fi = fi_probe
        d0, _ok = _mse_engine_vs_headless(cur, work, fi, nframes, worker=worker, eworker=eworker)
    else:
        fi, d0 = _find_worst_frame(cur, work, nframes, worker=worker, eworker=eworker)
    psnr0 = 99.0 if d0 <= 0 else 10.0 * math.log10(65025.0 / d0)
    print(f"[minimize] {slug}: worst frame f{fi}, engine-vs-FCP MSE={d0:.1f} (PSNR {psnr0:.2f} dB)", flush=True)
    if psnr0 >= keep_above:
        print(f"[minimize] engine already matches FCP headless (>= {keep_above} dB) here — "
              f"the discrepancy is vs the GUI, not vs FCP. Nothing to minimize.")
        return None
    target = d0 * (1.0 - slack)
    # There is deliberately NO upper bound. We do NOT try to keep the shrunk repro on the
    # SAME bug as the original — the whole point is to shrink maximally so ONE tiny defect
    # remains, even if that defect differs in flavour from where we started (see the module
    # docstring / LOOP.md RULE 1). A removal that makes the divergence BIGGER or DIFFERENT
    # is still a smaller repro of a real bug, so we accept it. The only gate is "the engine
    # still renders AND still diverges from FCP by >= target".

    def _count(it): return sum(1 for _ in it(root))
    n_struct0 = _count(_struct_iter)
    removed = 0

    require_engine_flag = [False]
    parent_of = {}

    def _try_remove_batch(cands):
        """Try to remove a BATCH of (parent, child) candidates at once, render ONCE, and
        KEEP the removal iff the engine still renders + still diverges >= target. Returns
        the number of elements actually removed-and-kept (0 if the batch was reverted, so
        the caller bisects).

        Only removes candidates that are still LIVE and whose ancestor isn't ALSO being
        removed in this same batch (a nested candidate would be double-handled); those are
        skipped this round and picked up when the caller bisects / on a later pass. Reverts
        in reverse order so element indices stay valid."""
        applied = []  # (parent, idx, child) in removal order
        chosen = set()
        for parent, child in cands:
            if child not in parent:            # already gone (removed via an ancestor)
                continue
            anc = parent_of.get(child); nested = False
            while anc is not None:
                if anc in chosen: nested = True; break
                anc = parent_of.get(anc)
            if nested:
                continue
            idx = list(parent).index(child)
            parent.remove(child)
            applied.append((parent, idx, child))
            chosen.add(child)
        if not applied:
            return 0
        trial = os.path.join(work, "trial.motr")
        try:
            tree.write(trial, encoding="unicode")
        except Exception:
            for parent, idx, child in reversed(applied):
                parent.insert(idx, child)
            return 0
        mse, ok = _mse_engine_vs_headless(trial, work, fi, nframes, worker=worker,
                                          require_engine=require_engine_flag[0], eworker=eworker)
        if ok and mse >= target:
            tree.write(cur, encoding="unicode")
            return len(applied)
        for parent, idx, child in reversed(applied):
            parent.insert(idx, child)
        return 0

    def _run_pass(iter_fn, label, require_engine=False):
        """ddmin-style BATCH removal. Instead of one render per candidate (O(n) renders),
        try removing the WHOLE candidate set at once; if the divergence survives, the entire
        set is gone for ONE render. On failure, bisect the set into halves and recurse — so a
        pass over n candidates of which k are load-bearing costs ~O(k·log n) renders, not
        O(n). Early struct/boiler passes strip the large majority of nodes, so most batches
        succeed whole and this is a big win on large sources. Correctness is identical to the
        old greedy loop: every ACCEPTED state is render-verified (still renders + still
        diverges >= target); a reverted batch never changes the doc. Deepest-first candidate
        order + the ancestor-nesting skip keep the remove/revert index-safe."""
        nonlocal removed, parent_of
        require_engine_flag[0] = require_engine
        # Snapshot the parent map once per pass for the nesting check.
        parent_of = {c: p for p in root.iter() for c in p}
        cands = list(iter_fn(root))
        if not cands:
            return False
        before = removed

        def rec(batch):
            nonlocal removed
            if not batch:
                return
            n = _try_remove_batch(batch)
            if n:
                removed += n            # whole (live subset of the) batch accepted
                return
            if len(batch) == 1:
                return                  # single load-bearing candidate → leave it in
            mid = len(batch) // 2
            rec(batch[:mid])
            rec(batch[mid:])

        rec(cands)
        return removed > before



    simplified = [0]  # value-simplifications applied (distinct from element removals)

    def _run_value_pass(iter_fn, label):
        """Try attribute/text VALUE simplifications AND attribute REMOVALS. For each candidate
        (el, attr, old, new): apply, render-gate, keep if the engine still renders and still
        diverges >= target, else revert. Semantics of (attr, new):
          • attr is not None, new is not None → set el[attr] = new   (value simplification)
          • attr is not None, new is None     → delete el[attr]       (attribute removal)
          • attr is None                      → set el.text = new     (text simplification)
        Returns count applied this pass."""
        applied = 0
        for el, attr, old, new in list(iter_fn(root)):
            # the element may have been removed/changed by an earlier pass; skip if stale
            if attr is not None:
                cur_val = el.get(attr)
            else:
                cur_val = el.text.strip() if el.text else None
            if cur_val != old:
                continue
            # apply
            if attr is not None and new is None:
                del el.attrib[attr]           # attribute removal
            elif attr is not None:
                el.set(attr, new)             # value simplification
            else:
                el.text = new                 # text simplification
            trial = os.path.join(work, "trial.motr")
            try:
                tree.write(trial, encoding="unicode")
            except Exception:
                if attr is not None and new is None: el.set(attr, old)
                elif attr is not None: el.set(attr, old)
                else: el.text = old
                continue
            mse, ok = _mse_engine_vs_headless(trial, work, fi, nframes, worker=worker,
                                              require_engine=True, eworker=eworker)
            if ok and mse >= target:
                applied += 1
                tree.write(cur, encoding="unicode")
            else:
                # revert
                if attr is not None: el.set(attr, old)
                else: el.text = old
        simplified[0] += applied
        return applied


    # 2. FIXPOINT of ALL passes (struct + line + attribute) — always on. Each pass can UNLOCK
    #    another: stripping a scenenode's params/transform empties it so the STRUCT pass can
    #    then remove the whole now-empty node/layer/behavior; dropping a value can make a
    #    <factory>/<clip> unreferenced so BOILER can remove it; etc. An EARLIER design ran the
    #    struct pass to a fixpoint ONCE up-front and only THEN the line passes — that left
    #    removable empty shells behind (Reflection's 34-line repro still had an emptied Color
    #    Solid, its wrapper <layer>, and an empty LinkPos <behavior>, all independently
    #    removable — proven by probe). So there is now ONE loop: struct runs FIRST inside every
    #    sweep (so big subtrees still get shrunk before the per-line/per-attr passes run — no
    #    separate coarse pre-pass is needed) and is RE-TRIED every sweep, catching nodes that
    #    only become empty/removable after the line passes strip their contents. We iterate the
    #    whole battery until a full sweep changes nothing.
    #      struct     → whole subtrees (re-tried every sweep, catching newly-emptied nodes)
    #      boiler     → unreferenced <factory>/<clip>/<footage> + scene metadata
    #      emptyfold  → fold-only <parameter> UI-stub folders
    #      param      → default-valued <parameter> value leaves
    #      generic    → EVERY other non-envelope element (sceneSettings scalars, behaviour
    #                   plumbing, clip fields, scene <currentFrame>/<timeRange>…)
    #      attr       → removable ELEMENT ATTRIBUTES (name=, pluginUUID/Name/Version, version,
    #                   default=, unreferenced uuid=) — the file also shrinks by attribute
    #      value      → simplify remaining attribute/text VALUES toward default / 0 / round
    #    Every change is render-gated with require_engine=True (anything the engine needs to
    #    RENDER is restored) and keeps SOME divergence >= target. No upper bound / no bug-
    #    identity check: shrinking to a smaller-and-possibly-different defect is the goal.
    for p in range(max_passes * 2):
        cs = _run_pass(_struct_iter, "struct")
        c1 = _run_pass(lambda r: _iter_boilerplate(r, protect=protect, factory_desc=factory_desc),
                       "boiler", require_engine=True)
        c2 = _run_pass(lambda r: _iter_empty_param_folders(r, protect=protect, factory_desc=factory_desc),
                       "emptyfold", require_engine=True)
        c3 = _run_pass(lambda r: _iter_params(r, protect=protect, factory_desc=factory_desc),
                       "param", require_engine=True)
        c4 = _run_pass(lambda r: _iter_generic(r, protect=protect, factory_desc=factory_desc),
                       "generic", require_engine=True)
        c6 = _run_value_pass(lambda r: _iter_attr_removals(r, protect=protect, factory_desc=factory_desc),
                             "attr")
        c5 = _run_value_pass(lambda r: _iter_value_simplifications(r, protect=protect, factory_desc=factory_desc),
                             "value")
        print(f"[minimize] fixpoint pass {p+1}: removed {removed} simplified {simplified[0]} "
              f"(struct={cs} boiler={c1} emptyfold={c2} param={c3} generic={c4} attr={c6} value={c5})", flush=True)
        if not (cs or c1 or c2 or c3 or c4 or c5 or c6):
            break





    tree.write(cur, encoding="unicode")
    # final divergence + write case
    mse_f, _ = _mse_engine_vs_headless(cur, work, fi, nframes, worker=worker, eworker=eworker)
    psnr_f = 99.0 if mse_f <= 0 else 10.0 * math.log10(65025.0 / mse_f)
    out_name = out_name or slug
    case = os.path.join(MIN_DIR, out_name)
    os.makedirs(case, exist_ok=True)
    shutil.copy(cur, os.path.join(case, "case.motr"))
    # render + store ALL frames both ways for the gate
    _render_case_frames(cur, case, nframes, worker=worker, eworker=eworker)
    man = {
        "slug": slug, "source_motr": src, "worst_frame": fi,
        "baseline_psnr": round(psnr0, 3), "final_psnr": round(psnr_f, 3),
        "struct_before": n_struct0, "struct_after": _count(_struct_iter),
        "removed": removed, "nframes": nframes, "slack": slack,
        "protect": sorted(protect) if protect else None,
    }
    json.dump(man, open(os.path.join(case, "manifest.json"), "w"), indent=2)
    print(f"[minimize] DONE {slug}: struct {n_struct0}->{man['struct_after']}, "
          f"engine-vs-FCP PSNR at f{fi} {psnr0:.2f}->{psnr_f:.2f} dB", flush=True)
    print(f"[minimize] wrote fct/minimized/{out_name}/", flush=True)
    shutil.rmtree(work, ignore_errors=True)
    return man


def _render_case_frames(motr_path, case_dir, nframes, worker=None, eworker=None):
    """Render all frames of the minimized case both ways into case_dir/{headless,engine}.
    Reuses the persistent `worker`/`eworker` (one engine boot for all N frames) when given;
    else falls back to the per-call isolated `_render_headless`/tsx subprocess."""
    hd = os.path.join(case_dir, "headless"); ed = os.path.join(case_dir, "engine")
    shutil.rmtree(hd, ignore_errors=True); shutil.rmtree(ed, ignore_errors=True)
    os.makedirs(hd, exist_ok=True); os.makedirs(ed, exist_ok=True)
    for i in range(nframes):
        hp = os.path.join(hd, f"frame_{i:04d}.jpg")
        if worker is not None:
            worker.render(motr_path, hp, i, nframes)
        else:
            _render_headless(motr_path, hp, i, nframes)
        _render_engine(motr_path, os.path.join(ed, f"frame_{i:04d}.jpg"), i, nframes, eworker=eworker)


def run(argv):
    if not argv:
        print("usage: fct minimize <slug> [--frames N] [--frame I] [--keep-above dB] "
              "[--slack F] [--name NAME] [--params] [--protect TYPE[,TYPE...]]")
        return 1
    slug = argv[0]
    def opt(name, default=None, cast=str):
        if name in argv:
            i = argv.index(name)
            if i + 1 < len(argv): return cast(argv[i + 1])
        return default
    # --protect keeps nodes of the named Motion factory types (and their subtrees) from
    # being stripped, so the reduced repro still EXERCISES that subsystem. Comma-separated
    # Motion type descriptions, e.g. --protect Replicator,Sequence Replicator,Replicator Cell.
    protect_arg = opt("--protect", None, str)
    protect = [t.strip() for t in protect_arg.split(",") if t.strip()] if protect_arg else None
    minimize(slug,
             nframes=opt("--frames", None, int),
             keep_above=opt("--keep-above", 25.0, float),
             slack=opt("--slack", 0.12, float),
             out_name=opt("--name", None, str),
             do_params="--params" in argv,
             probe_frame=opt("--frame", None, int),
             protect=protect)
    return 0
