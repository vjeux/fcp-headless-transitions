#!/usr/bin/env python3
"""fct — one CLI for the whole toolkit. Run from the repo root with the venv python.

  fct gen  <gui|headless|engine> [slug ...|--all]   generate frames to disk
  fct read <file.png>                               print shape/mean of one frame
  fct cmp  <a.png> <b.png> [--color-b bt709] [--out diff.png]   compare two files
  fct score   [slug ...|--all] [--source headless|engine] [--frames] [--fast]   score vs GUI GT
  fct baseline <source>                             freeze current scores (gate-res) -> the gate
  fct regress  <source> [--verbose]                 re-score vs baseline (fast); exit 1 on regression
  fct montage [slug ...|--all] [--sources gui,headless,engine] [--out m.mp4]

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

    if cmd == "gen":
        source = rest[0]
        slugs = _resolve_slugs(rest[1:])
        if source == "headless":
            _reexec_under_venv_if_needed()
        from fct.config import SLUGS
        from fct import gen, slice_gui
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

    if cmd == "montage":
        from fct.montage import montage
        from fct.config import SLUGS
        slugs = _resolve_slugs(rest)
        sources = (_opt(rest, "--sources") or "gui,headless,engine").split(",")
        out = _opt(rest, "--out") or os.path.join(REPO, "montage.mp4")
        montage(slugs, sources, out=out)
        return 0

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
