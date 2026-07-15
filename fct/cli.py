#!/usr/bin/env python3
"""fct — one CLI for the whole toolkit. Run from the repo root with the venv python.

  fct gen  <gui|headless|engine> [slug ...|--all]   generate frames to disk
  fct read <file.png>                               print shape/mean of one frame
  fct cmp  <a.png> <b.png> [--color-b bt709] [--out diff.png]   compare two files
  fct score   [slug ...|--all] [--source headless|engine] [--frames] [--fast]   score vs GUI GT
  fct probe   <slug> [frame=12]                     fast: render+PSNR ONE engine frame vs GUI GT
  fct census  [slug ...|--all]                      decode a slug's REAL scene graph
                                                    (filters/links/emitters/generators) from its
                                                    .motr — VERIFY a task premise BEFORE writing
                                                    engine code (decode-don't-fit forcing function)
  fct baseline <source>                             freeze current scores (gate-res) -> the gate
  fct regress  <source> [--verbose]                 re-score vs baseline (fast); exit 1 on regression
  fct gate    [engine|headless] [slug ...|--all] [--no-render]   render source then run the gate (lockfile-guarded)
  fct montage [slug ...|--all] [--sources gui,headless,engine] [--out m.mp4]
  fct roadmap-sync                                  flip ROADMAP TODO->DONE markers to match the
                                                    authoritative done set (commit-log scan); safe,
                                                    monotonic, never un-marks or touches PARTIAL/DROPPED
  fct minimize <slug> [--frames N] [--slack F] [--name NAME] [--params]
                                                    DELTA-DEBUG a transition: strip .motr nodes while
                                                    the TS engine still DIVERGES from real FCP
                                                    (headless), leaving the MINIMAL repro of the bug.
                                                    Writes fct/minimized/<slug>/ (case.motr + frames).
  fct min-gen   [case ...|--all]                    re-render the ENGINE frames for each minimized case
  fct min-score [case ...|--all] [--frames]         per-case engine-vs-FCP PSNR (99 dB = bug fixed)
  fct min-baseline                                  freeze per-case engine-vs-FCP PSNR -> the min-gate
  fct min-regress                                   re-score; exit 1 if any minimized case got WORSE

Headless needs the FCP engine: this CLI auto-re-execs under the venv python with
DYLD_FRAMEWORK_PATH set (SIP strips DYLD from child processes, so we exec, not spawn).
"""
import os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
VENV_PY = os.path.join(REPO, "venv", "bin", "python3")

def _reexec_under_venv_if_needed():
    """Headless rendering needs venv python + DYLD. Re-exec once if we're not there."""
    need = os.environ.get("DYLD_FRAMEWORK_PATH") != FW or sys.executable != VENV_PY
    if need and not os.environ.get("_FCT_REEXEC"):
        os.environ["DYLD_FRAMEWORK_PATH"] = FW
        os.environ["_FCT_REEXEC"] = "1"
        os.execv(VENV_PY, [VENV_PY, "-u", os.path.abspath(__file__)] + sys.argv[1:])

def main():
    argv = sys.argv[1:]
    if not argv:
        print(__doc__); return 1
    cmd, rest = argv[0], argv[1:]
    sys.path.insert(0, REPO)

    # numpy/score/baseline (and the FCP headless engine) live in the venv. Invoking
    # via ./fct.sh uses the system python3 (no numpy), so every numpy-dependent
    # command must re-exec under the venv python. `gen engine` is pure node (no numpy
    # import) so it's exempt; `gen headless` re-execs below for the DYLD framework path.
    if cmd in ("score", "regress", "gate", "cmp", "probe", "baseline", "census", "montage", "read",
               "minimize", "min-gen", "min-score", "min-regress", "min-baseline", "caps"):
        _reexec_under_venv_if_needed()

    if cmd == "gen":
        source = rest[0]
        slugs = _resolve_slugs(rest[1:])
        if source == "headless":
            _reexec_under_venv_if_needed()
        from fct.config import SLUGS
        from fct import gen, slice_gui
        # PRE-KILL any render workers orphaned by a prior SIGKILLed batch (OOM/kill -9)
        # before piling a new batch on top — this is the load-194 storm guard. Only
        # reaps true orphans (ppid==1) running our render tsx; never touches a live
        # sibling batch or the navi-node CLI. See gen.sweep_orphaned_renderers.
        gen.sweep_orphaned_renderers()
        # Headless batch (>1 slug) renders each slug in an ISOLATED subprocess:
        # the FCP GL master context can wedge/poison across slugs, so one bad
        # .motr must not kill the batch. Single-slug runs render in-process.
        if source == "headless" and len(slugs) > 1:
            import subprocess
            from fct.config import N_FRAMES, frames_dir
            for s in slugs:
                subprocess.run([VENV_PY, "-u", os.path.abspath(__file__), "gen", "headless", s],
                               env=dict(os.environ, _FCT_REEXEC="1"),
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                # The FCP engine SIGSEGVs on teardown AFTER writing frames (harmless),
                # so trust the frame count on disk, not the subprocess exit code.
                d = frames_dir("headless", s)
                have = len([f for f in os.listdir(d) if f.startswith("frame_")]) if os.path.isdir(d) else 0
                print(f"{'OK' if have == N_FRAMES else 'ERR'} headless {s} ({have}/{N_FRAMES})", flush=True)
            return 0
        # Engine + GUI batches are embarrassingly parallel: each slug renders in an
        # independent tsx subprocess (engine) / decode (gui) with its own I/O and NO
        # shared state (the compositor/evaluator/parser module globals were removed in
        # ROADMAP item 4). Unlike headless — which serializes on the single FCP GL
        # master context above — these saturate all cores. A single serial pass over
        # 65 slugs is ~15 min (360°_Bloom alone is ~260s at its 4096-wide equirect
        # resolution); a pool cuts that to a few minutes. Longest-first scheduling
        # keeps the Bloom tail from dominating wall time. Set FCT_JOBS=1 to force
        # serial (debugging).
        def _render_one(s):
            if source == "gui":       return s, slice_gui.slice_gui(s), None
            elif source == "engine":  return s, gen.gen_engine(s), None
            elif source == "headless":return s, gen.gen_headless(s), None
            else: raise ValueError(f"unknown source {source}")
        jobs_env = os.environ.get("FCT_JOBS")
        # Per-`gen --all` parallelism. Renders are embarrassingly parallel with NO shared
        # state (see above), so job count is behavior-NEUTRAL — output is byte-identical at
        # any job count; this only trades wall-time for RAM/core pressure. Default capped at
        # 4 (was min(8,cpu)): on the shared swarm box MULTIPLE agents run `gen --all` at once,
        # and 8×N tsx renderers on a 10-core / 25GB-swap Mac drives swap OVER physical →
        # thrash → the CLI node is starved OFFLINE (observed load 194, 60 render workers, the
        # multi-tick merge blocker). 4 keeps a solo run fast while leaving headroom for a
        # couple of concurrent agents. A solo/quiet run can still bump it: FCT_JOBS=8.
        default_jobs = min(4, (os.cpu_count() or 4)) if source in ("engine", "gui") and len(slugs) > 1 else 1
        jobs = int(jobs_env) if jobs_env else default_jobs
        # Longest-known-slow slugs first so they don't tail the batch (best-effort;
        # unknown slugs keep their given order after the known-slow ones).
        _SLOW_FIRST = ["360°__360°_Bloom", "Movements__Pinwheel", "Stylized__Slide",
                       "Replicator-Clones__Concentric", "Stylized__Color_Panels",
                       "Replicator-Clones__3D_Rectangle", "Lights__Bloom", "Stylized__Up-Over"]
        if jobs > 1 and len(slugs) > 1:
            ordered = [s for s in _SLOW_FIRST if s in slugs] + [s for s in slugs if s not in _SLOW_FIRST]
            import concurrent.futures as _cf
            with _cf.ThreadPoolExecutor(max_workers=jobs) as ex:
                futs = {ex.submit(_render_one, s): s for s in ordered}
                for fut in _cf.as_completed(futs):
                    s = futs[fut]
                    try:
                        s, d, _ = fut.result()
                        print(f"OK {source} {s} -> {d}", flush=True)
                    except Exception as e:
                        print(f"ERR {source} {s}: {e}", flush=True)
            return 0
        for s in slugs:
            try:
                if source == "gui":     d = slice_gui.slice_gui(s)
                elif source == "headless": d = gen.gen_headless(s)
                elif source == "engine":   d = gen.gen_engine(s)
                else: print(f"unknown source {source}"); return 1
                print(f"OK {source} {s} -> {d}", flush=True)
            except Exception as e:
                print(f"ERR {source} {s}: {e}", flush=True)
        return 0

    if cmd == "read":
        from fct.read import read_frame
        a = read_frame(rest[0])
        print(f"shape={a.shape} mean_rgb={a.mean(axis=(0,1)).round(2).tolist()}")
        return 0

    if cmd == "cmp":
        from fct.compare import compare
        a, b = rest[0], rest[1]
        ca = _opt(rest, "--color-a"); cb = _opt(rest, "--color-b")
        out = _opt(rest, "--out")
        print(compare(a, b, color_a=ca, color_b=cb, out_png=out))
        return 0

    if cmd == "score":
        from fct.score import score, GATE_SIZE
        source = _opt(rest, "--source") or "headless"
        show_frames = "--frames" in rest
        gs = GATE_SIZE if "--fast" in rest else None
        import time
        for sl in _resolve_slugs(rest):
            t0 = time.time()
            r = score(sl, source, gate_size=gs)
            dt = time.time() - t0
            print(f"{r['slug']}\t{source}\tMEAN {r['mean']}\t{dt:.2f}s", flush=True)
            if show_frames:
                for i, d in enumerate(r["frames"]): print(f"  f{i:02d}: {d}")
        return 0

    if cmd == "probe":
        # Fast single-frame iteration for the ENGINE: render ONE frame + PSNR it vs
        # the GUI GT for that frame index. A full 24-frame render is minutes for a
        # heavy slug (360°/Bloom); this returns in seconds so the edit→score loop is
        # tight. Usage: fct probe <slug> [frame=12]. Truth is still the GUI GT.
        import tempfile, time
        from fct import gen
        from fct.read import read_frame
        from fct.color import to_bt709
        from fct.compare import _psnr
        from fct.config import frame_path, needs_bt709
        slug = _resolve_slugs([a for a in rest if not a.startswith("-")])[0]
        fi = int(_opt(rest, "--frame") or (rest[1] if len(rest) > 1 and rest[1].isdigit() else "12"))
        tmp = tempfile.mktemp(suffix=".jpg")
        t0 = time.time()
        gen.gen_engine_frame(slug, fi, tmp)
        en = read_frame(tmp)
        gt = read_frame(frame_path("gui", slug, fi))
        if en.shape != gt.shape:
            en = read_frame(tmp, size=(gt.shape[1], gt.shape[0]))
        if needs_bt709("engine"):
            en = to_bt709(en)
        dt = time.time() - t0
        print(f"{slug}\tengine\tf{fi}\tPSNR {round(_psnr(gt, en), 2)} dB\t{dt:.1f}s", flush=True)
        try: os.remove(tmp)
        except OSError: pass
        return 0

    if cmd == "baseline":
        from fct.baseline import freeze
        source = rest[0] if rest else "headless"
        data = freeze(source)
        print(f"froze baseline_{source}.json: {len(data)} slugs, "
              f"mean {round(sum(data.values())/len(data), 2)} dB", flush=True)
        return 0

    if cmd == "regress":
        from fct.baseline import regress
        source = rest[0] if rest and not rest[0].startswith("--") else "headless"
        r = regress(source, verbose="--verbose" in rest)
        for s, (b, c, d) in sorted(r["improvements"].items()):
            print(f"  IMPROVED  {s}: {b} -> {c} (+{d})")
        for s, (b, c, d) in sorted(r["regressions"].items()):
            print(f"  REGRESSED {s}: {b} -> {c} ({d})")
        # slowest few slugs, so we can see if any single transition is dragging the gate
        slow = sorted(r["timings"].items(), key=lambda kv: -kv[1])[:5]
        print("  slowest: " + ", ".join(f"{s} {t:.2f}s" for s, t in slow))
        print(f"{'OK' if r['ok'] else 'FAIL'}: {len(r['regressions'])} regressions, "
              f"{len(r['improvements'])} improvements vs baseline_{source} "
              f"(tol {r['tol']}dB) — {r['total_sec']}s total", flush=True)
        return 0 if r["ok"] else 1

    if cmd == "gate":
        # The recurring "re-render a source then run the regression gate" workflow,
        # as ONE committed command (previously re-created as throwaway /tmp scripts).
        # Guarded by a lockfile so a double-launch (the bg tool sometimes fires twice)
        # can't run two concurrent `gen ... --all` passes that race the frame dir.
        #   fct gate [engine|headless] [slug ...|--all] [--no-render]
        import time, subprocess
        source = rest[0] if rest and not rest[0].startswith("--") else "engine"
        slug_args = [a for a in rest[1:] if not a.startswith("--")]
        lock = os.environ.get("FCT_LOCK") or "/tmp/fct_render.lock"
        if "--no-render" not in rest:
            try:
                os.mkdir(lock)
            except FileExistsError:
                print(f"LOCKED — another render holds {lock}; aborting", flush=True)
                return 3
            try:
                t0 = time.time()
                gen_args = slug_args or ["--all"]
                print(f"=== gate: render {source} {' '.join(gen_args)} ===", flush=True)
                # Shell out to our own `gen` (same interpreter/env) so the render path
                # stays byte-identical to `fct gen` — no duplicated render logic here.
                rc = subprocess.run([VENV_PY, "-u", os.path.abspath(__file__),
                                     "gen", source] + gen_args,
                                    env=dict(os.environ, _FCT_REEXEC="1")).returncode
                print(f"=== render done in {time.time()-t0:.0f}s (gen rc={rc}) ===", flush=True)
            finally:
                try: os.rmdir(lock)
                except OSError: pass
        # Always run the gate after (or on its own with --no-render).
        from fct.baseline import regress
        r = regress(source, verbose=False)
        for s, (b, c, d) in sorted(r["improvements"].items()):
            print(f"  IMPROVED  {s}: {b} -> {c} (+{d})")
        for s, (b, c, d) in sorted(r["regressions"].items()):
            print(f"  REGRESSED {s}: {b} -> {c} ({d})")
        print(f"{'OK' if r['ok'] else 'FAIL'}: {len(r['regressions'])} regressions, "
              f"{len(r['improvements'])} improvements vs baseline_{source} "
              f"(tol {r['tol']}dB) — gate {r['total_sec']}s", flush=True)
        return 0 if r["ok"] else 1

    if cmd == "caps":
        # Capability catalog: run tools/re/probe_scene.py (each entry isolates ONE FCP
        # primitive in a synthetic scene, renders headless-FCP vs TS, compares). A DEV
        # ORACLE for building engine features one-by-one; NOT the GUI-GT gate.
        _reexec_under_venv_if_needed()
        import subprocess
        return subprocess.call([sys.executable, os.path.join(REPO, "tools/re/probe_scene.py")] + rest)

    if cmd == "census":
        from fct.census import run as census_run
        slugs = _resolve_slugs(rest)
        census_run(slugs)
        return 0

    if cmd == "montage":
        from fct.montage import montage
        from fct.config import SLUGS
        slugs = _resolve_slugs(rest)
        sources = (_opt(rest, "--sources") or "gui,headless,engine").split(",")
        out = _opt(rest, "--out") or os.path.join(REPO, "montage.mp4")
        montage(slugs, sources, out=out)
        return 0

    if cmd == "roadmap-sync":
        from fct.roadmap_sync import run as roadmap_sync_run
        return roadmap_sync_run()

    if cmd == "minimize":
        from fct.minimize import run as minimize_run
        return minimize_run(rest)

    if cmd == "_headless-frame":
        # Internal: render ONE headless frame of an arbitrary .motr in an ISOLATED
        # process (the FCP engine SIGSEGVs on some malformed reduced docs; isolating
        # each render keeps a crash from killing the minimizer). Args: motr frame nframes out
        _reexec_under_venv_if_needed()
        sys.path.insert(0, os.path.join(REPO, "tools"))
        import ozengine
        from fct import timing
        from fct.config import IMG_A, IMG_B
        motr, frame_i, nframes, out = rest[0], int(rest[1]), int(rest[2]), rest[3]
        span = timing.scene_duration_seconds(motr) or 2.0
        doc = ozengine.load_doc(motr)
        ozengine.render_frame(doc, IMG_A, IMG_B, timing.sample_time(frame_i, nframes, span), out)
        return 0

    if cmd == "_headless-worker":
        # Internal: a PERSISTENT headless render server. Boots the FCP Ozone engine
        # ONCE (~3.5s), then reads render requests line-by-line off stdin and renders
        # each into the SAME live engine — amortizing the boot across every trial that
        # does NOT crash. Crash-isolation is preserved at a coarser grain: if a
        # malformed reduced doc SIGSEGVs the engine, THIS worker dies and the parent
        # (minimize.py) simply respawns it and marks only the in-flight trial as
        # "broke headless". So we pay the boot once per crash, not once per trial.
        # Protocol (one request per line on stdin):
        #     <motr_path>\t<frame_i>\t<nframes>\t<out_path>\n
        # Response on stdout, one line per request, flushed:
        #     OK\n   (out_path was written)  |  ERR\n  (load/render failed, no crash)
        # A crash produces no line (pipe closes / short read) -> parent respawns.
        _reexec_under_venv_if_needed()
        sys.path.insert(0, os.path.join(REPO, "tools"))
        import ozengine
        from fct import timing
        from fct.config import IMG_A, IMG_B
        ozengine.init_engine()  # pay the boot ONCE up front
        sys.stdout.write("READY\n"); sys.stdout.flush()
        for line in sys.stdin:
            line = line.rstrip("\n")
            if not line or line == "QUIT":
                break
            try:
                motr, frame_i, nframes, out = line.split("\t")
                frame_i, nframes = int(frame_i), int(nframes)
                span = timing.scene_duration_seconds(motr) or 2.0
                doc = ozengine.load_doc(motr)
                ozengine.render_frame(doc, IMG_A, IMG_B,
                                      timing.sample_time(frame_i, nframes, span), out)
                ok = os.path.exists(out)
                sys.stdout.write("OK\n" if ok else "ERR\n")
            except Exception:
                # A recoverable error (bad load / non-crash render fail): report ERR
                # and keep serving. Only a real SIGSEGV takes the process down.
                sys.stdout.write("ERR\n")
            sys.stdout.flush()
        return 0

    if cmd == "_headless-worker":
        # Internal: a PERSISTENT headless render server. Boots the FCP Ozone engine
        # ONCE (~3.5s), then reads render requests line-by-line off stdin and renders
        # each into the SAME live engine -- amortizing the boot across every trial that
        # does NOT crash. Crash-isolation is preserved at a coarser grain: if a
        # malformed reduced doc SIGSEGVs the engine, THIS worker dies and the parent
        # (minimize.py) simply respawns it and marks only the in-flight trial as
        # "broke headless". So we pay the boot once per crash, not once per trial.
        # Protocol (one request per line on stdin):
        #     <motr_path>\t<frame_i>\t<nframes>\t<out_path>\n
        # Response on stdout, one line per request, flushed:
        #     OK\n   (out_path was written)  |  ERR\n  (load/render failed, no crash)
        # A crash produces no line (pipe closes / short read) -> parent respawns.
        _reexec_under_venv_if_needed()
        sys.path.insert(0, os.path.join(REPO, "tools"))
        import ozengine
        from fct import timing
        from fct.config import IMG_A, IMG_B
        ozengine.init_engine()  # pay the boot ONCE up front
        sys.stdout.write("READY\n"); sys.stdout.flush()
        for line in sys.stdin:
            line = line.rstrip("\n")
            if not line or line == "QUIT":
                break
            try:
                motr, frame_i, nframes, out = line.split("\t")
                frame_i, nframes = int(frame_i), int(nframes)
                span = timing.scene_duration_seconds(motr) or 2.0
                doc = ozengine.load_doc(motr)
                ozengine.render_frame(doc, IMG_A, IMG_B,
                                      timing.sample_time(frame_i, nframes, span), out)
                ok = os.path.exists(out)
                sys.stdout.write("OK\n" if ok else "ERR\n")
            except Exception:
                # A recoverable error (bad load / non-crash render fail): report ERR
                # and keep serving. Only a real SIGSEGV takes the process down.
                sys.stdout.write("ERR\n")
            sys.stdout.flush()
        return 0

    if cmd in ("min-gen", "min-score", "min-regress", "min-baseline"):
        from fct.minimize_gate import run as min_gate_run
        return min_gate_run(cmd, rest)

    print(f"unknown command {cmd}\n{__doc__}"); return 1

def _opt(args, name):
    if name in args:
        i = args.index(name)
        if i + 1 < len(args): return args[i + 1]
    return None

_OPTS_WITH_VALUES = {"--out", "--sources", "--color-a", "--color-b", "--source"}

def _resolve_slugs(args):
    from fct.config import SLUGS
    pos, skip = [], False
    for a in args:
        if skip:
            skip = False; continue
        if a in _OPTS_WITH_VALUES:
            skip = True; continue
        if a.startswith("--"):
            continue
        pos.append(a)
    if "--all" in args or not pos:
        return SLUGS
    return pos

if __name__ == "__main__":
    sys.exit(main())
