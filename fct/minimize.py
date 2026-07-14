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
  2. Enumerate removable STRUCTURAL nodes (scenenode/layer/group/filter/behavior/mask)
     — a few hundred, not 17k. Greedily try removing each subtree, deepest-first.
     ACCEPT a removal iff, after it: (a) FCP still renders a valid (non-black) frame,
     AND (b) the engine-vs-FCP MSE stays >= D0*(1-slack) — i.e. the bug is PRESERVED.
     Else RESTORE (the node is load-bearing for the repro).
  3. Iterate passes to a fixpoint. The survivors are the essential bug drivers.
  Coarse structural removal collapses 17k elements to a tiny subtree in minutes; the
  optional --params pass then strips individual <parameter> leaves within survivors.

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


def _link_siblings(src_motr, dest_dir):
    """Symlink every sibling of `src_motr` (Media/, small.png, .localized/, …) into
    `dest_dir`, so a trial .motr written in dest_dir resolves the SAME bundled resources
    FCP would find next to the original. Without this, FCP can't locate the particle
    textures and renders a different (brighter/incomplete) frame — a false divergence."""
    srcdir = os.path.dirname(os.path.abspath(src_motr))
    for name in os.listdir(srcdir):
        if name.endswith(".motr"):
            continue
        link = os.path.join(dest_dir, name)
        if os.path.lexists(link):
            continue
        try:
            os.symlink(os.path.join(srcdir, name), link)
        except OSError:
            pass



def _link_siblings(src_motr, work_dir):
    """Symlink every sibling of the source .motr (Media/, small.png, .localized/, …)
    into work_dir so trial motrs written there resolve FCP's bundled resources exactly
    as the original does. Skips other .motr files. Idempotent."""
    srcdir = os.path.dirname(os.path.abspath(src_motr))
    for name in os.listdir(srcdir):
        if name.endswith(".motr"):
            continue
        dst = os.path.join(work_dir, name)
        if os.path.lexists(dst):
            continue
        try:
            os.symlink(os.path.join(srcdir, name), dst)
        except OSError:
            pass


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
    "broke headless" and restores the node). Returns True on a written frame."""
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


def _render_engine(motr_path, out_path, frame_i, nframes):
    """Render ONE engine frame (index frame_i of nframes) for an ARBITRARY motr path."""
    import subprocess
    smap = out_path + ".slugmap.json"
    json.dump({"_min": os.path.abspath(motr_path)}, open(smap, "w"))
    env = dict(os.environ, FCT_SLUG="_min", FCT_FRAME=str(frame_i), FCT_N=str(nframes),
               FCT_OUT=os.path.abspath(out_path), FCT_SLUGMAP=smap)
    r = subprocess.run(["node_modules/.bin/tsx", "test/_fct_render_one.ts"],
                       cwd=os.path.join(REPO, "engine"), env=env,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return r.returncode == 0 and os.path.exists(out_path)


def _mse_engine_vs_headless(motr_path, tmp, frame_i, nframes):
    """255-space MSE between FCP-headless and engine at frame_i (both sRGB → no
    color conform). Returns (mse, headless_valid)."""
    import numpy as np
    from fct.read import read_frame
    hp = os.path.join(tmp, "h.jpg"); ep = os.path.join(tmp, "e.jpg")
    for p in (hp, ep):
        if os.path.exists(p): os.remove(p)
    hv = _render_headless(motr_path, hp, frame_i, nframes)
    _render_engine(motr_path, ep, frame_i, nframes)
    if not hv or not os.path.exists(hp):
        return 0.0, False
    h = read_frame(hp, size=(480, 270))
    if h.mean() < 1.0:   # FCP rendered ~black → this reduced doc broke FCP
        return 0.0, False
    if not os.path.exists(ep):
        return 1e9, True
    e = read_frame(ep, size=(480, 270))
    return float(((h - e) ** 2).mean()), True


def _find_worst_frame(motr_path, tmp, nframes):
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
        mse, ok = _mse_engine_vs_headless(motr_path, tmp, i, nframes)
        if ok and mse > best_mse:
            best_mse, best_i = mse, i
    return best_i, best_mse


def _iter_struct(root):
    """(parent, child) for removable STRUCTURAL child elements, deepest-first."""
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    for c in order:
        if _localname(c.tag) in _STRUCT_TAGS:
            yield parent[c], c


def _iter_params(root):
    """(parent, child) for <parameter> leaves (fine pass), deepest-first. Only params
    that have NO child <parameter> (true leaves) so we strip settings, not folders."""
    parent = {}
    order = []
    def walk(e):
        for c in list(e):
            parent[c] = e
            walk(c)
            order.append(c)
    walk(root)
    for c in order:
        if _localname(c.tag) == "parameter" and not any(_localname(k.tag) == "parameter" for k in c):
            yield parent[c], c


def minimize(slug, nframes=None, keep_above=25.0, slack=0.12, max_passes=6,
             out_name=None, do_params=False, probe_frame=None):
    from fct.config import N_FRAMES, slug_motr
    # NB: no in-process ozengine boot — every headless render is an ISOLATED subprocess
    # (fct _headless-frame) so a malformed reduced doc that SIGSEGVs the FCP engine only
    # kills that trial, not the whole minimizer.
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

    # 1. worst frame + baseline divergence (skip the scan if --frame was given).
    if probe_frame is not None:
        fi = probe_frame
        d0, _ok = _mse_engine_vs_headless(cur, work, fi, nframes)
    else:
        fi, d0 = _find_worst_frame(cur, work, nframes)
    psnr0 = 99.0 if d0 <= 0 else 10.0 * math.log10(65025.0 / d0)
    print(f"[minimize] {slug}: worst frame f{fi}, engine-vs-FCP MSE={d0:.1f} (PSNR {psnr0:.2f} dB)", flush=True)
    if psnr0 >= keep_above:
        print(f"[minimize] engine already matches FCP headless (>= {keep_above} dB) here — "
              f"the discrepancy is vs the GUI, not vs FCP. Nothing to minimize.")
        shutil.rmtree(work, ignore_errors=True); return None
    target = d0 * (1.0 - slack)

    def _count(it): return sum(1 for _ in it(root))
    n_struct0 = _count(_iter_struct)
    removed = 0

    def _run_pass(iter_fn, label):
        nonlocal removed
        changed = False
        for parent, child in list(iter_fn(root)):
            if child not in list(parent):
                continue
            idx = list(parent).index(child)
            parent.remove(child)
            trial = os.path.join(work, "trial.motr")
            try:
                tree.write(trial, encoding="unicode")
            except Exception:
                parent.insert(idx, child); continue
            mse, ok = _mse_engine_vs_headless(trial, work, fi, nframes)
            if ok and mse >= target:
                removed += 1; changed = True
                tree.write(cur, encoding="unicode")
            else:
                parent.insert(idx, child)
        return changed

    # 2. coarse structural passes
    for p in range(max_passes):
        changed = _run_pass(_iter_struct, "struct")
        rem = _count(_iter_struct)
        print(f"[minimize] struct pass {p+1}: removed {removed}/{n_struct0}, remaining {rem}", flush=True)
        if not changed:
            break
    # 3. optional fine param pass
    if do_params:
        for p in range(max_passes):
            changed = _run_pass(_iter_params, "param")
            print(f"[minimize] param pass {p+1}: removed total {removed}", flush=True)
            if not changed:
                break

    tree.write(cur, encoding="unicode")
    # final divergence + write case
    mse_f, _ = _mse_engine_vs_headless(cur, work, fi, nframes)
    psnr_f = 99.0 if mse_f <= 0 else 10.0 * math.log10(65025.0 / mse_f)
    out_name = out_name or slug
    case = os.path.join(MIN_DIR, out_name)
    os.makedirs(case, exist_ok=True)
    shutil.copy(cur, os.path.join(case, "case.motr"))
    # render + store ALL frames both ways for the gate
    _render_case_frames(cur, case, nframes)
    man = {
        "slug": slug, "source_motr": src, "worst_frame": fi,
        "baseline_psnr": round(psnr0, 3), "final_psnr": round(psnr_f, 3),
        "struct_before": n_struct0, "struct_after": _count(_iter_struct),
        "removed": removed, "nframes": nframes, "slack": slack,
    }
    json.dump(man, open(os.path.join(case, "manifest.json"), "w"), indent=2)
    print(f"[minimize] DONE {slug}: struct {n_struct0}->{man['struct_after']}, "
          f"engine-vs-FCP PSNR at f{fi} {psnr0:.2f}->{psnr_f:.2f} dB", flush=True)
    print(f"[minimize] wrote fct/minimized/{out_name}/", flush=True)
    shutil.rmtree(work, ignore_errors=True)
    return man


def _render_case_frames(motr_path, case_dir, nframes):
    """Render all frames of the minimized case both ways into case_dir/{headless,engine}."""
    hd = os.path.join(case_dir, "headless"); ed = os.path.join(case_dir, "engine")
    shutil.rmtree(hd, ignore_errors=True); shutil.rmtree(ed, ignore_errors=True)
    os.makedirs(hd, exist_ok=True); os.makedirs(ed, exist_ok=True)
    for i in range(nframes):
        _render_headless(motr_path, os.path.join(hd, f"frame_{i:04d}.jpg"), i, nframes)
        _render_engine(motr_path, os.path.join(ed, f"frame_{i:04d}.jpg"), i, nframes)


def run(argv):
    if not argv:
        print("usage: fct minimize <slug> [--frames N] [--frame I] [--keep-above dB] "
              "[--slack F] [--name NAME] [--params]")
        return 1
    slug = argv[0]
    def opt(name, default=None, cast=str):
        if name in argv:
            i = argv.index(name)
            if i + 1 < len(argv): return cast(argv[i + 1])
        return default
    minimize(slug,
             nframes=opt("--frames", None, int),
             keep_above=opt("--keep-above", 25.0, float),
             slack=opt("--slack", 0.12, float),
             out_name=opt("--name", None, str),
             do_params="--params" in argv,
             probe_frame=opt("--frame", None, int))
    return 0
