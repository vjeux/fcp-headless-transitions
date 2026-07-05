#!/usr/bin/env python3
"""
Render ground-truth frames for a .motr transition through the REAL FCP engine.

Handles the critical time-domain gotcha: a transition's animation ends at its
LAST SPATIAL KEYFRAME (e.g. Push = 200200/120000 = 1.6683s), NOT the scene/
playRange duration (which is one frame longer and WRAPS back to the start,
producing black frames). We parse the max keyframe time across all curves,
EXCLUDING the Retime Value / Retime Value Cache / Duration Cache curves (whose
keyframes run a frame past the spatial animation). progress p in [0,1] maps to
time p * animationEnd, with the final frame nudged just below the end to avoid
the loop-point wrap.

Usage:
    DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks" \
      ./venv/bin/python tools/render_gt.py <motr> <imgA> <imgB> <outdir> [nframes]

    # convenience: default Push + repo example images + 50 frames
    ... tools/render_gt.py --push out/push_gt

Run the python process DIRECTLY in the background (never via timeout/nohup/sudo,
which strip DYLD_*):
    FW="/Applications/Final Cut Pro.app/Contents/Frameworks" \
      DYLD_FRAMEWORK_PATH="$FW" ./venv/bin/python tools/render_gt.py --push out/gt &
"""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozengine

RETIME_PARAMS = {
    "Retime Value", "Retime Value Cache", "Duration Cache",
    # "Page Number" is the drop-zone media frame-index counter (sits next to
    # Source Media / Speed / Reverse / Time Remap). It shares the SAME keyframes as
    # "Retime Value Cache" (e.g. 0->1, 0.5339->17) and runs one frame past the
    # spatial animation. Left in, it inflates the animation end and the final frame
    # WRAPS back to source A (Motion resets past the last media page). Blurs/* all
    # carry it; excluding it lands progress=1 on the true visual end (pure B).
    "Page Number",
    # Shape stroke-profile curves are parametrised along stroke LENGTH (normalized
    # 0..1), not scene time; their time=1 keypoint wrongly inflates the animation
    # end to 1.0s for shape transitions (e.g. Wipes/Diagonal ends at ~0.267s).
    "Pressure Over Stroke", "Pen Speed Over Stroke", "Opacity Over Stroke",
    "Width Over Stroke", "Color Over Stroke",
    # Filter INTENSITY curves ("Amount"/"Angle" of a blur/effect) animate the
    # strength of the effect, not the layer's on-screen lifetime. For Blurs/* the
    # blur Amount keeps animating (to 0.5005s) after the drop-zone media has already
    # wrapped to source A at the Opacity crossfade end (0.4338s). Counting them
    # overshoots the true visual end and the tail frames render pure A.
    "Amount", "Angle",
}

def _scene_duration_seconds(xml):
    """Fallback animation end for keyframe-less transitions (e.g. Blurs/Zoom).

    Their motion is driven entirely by Retime + procedural behaviors
    (Oscillate/Link), so max-keyframe is 0. The animation window is bounded by
    the transition's own layer timing: the max <timing out=...> across all nodes.
    Past that, the drop-zone layers time out and the frame goes empty. This is
    tighter than the padded scene duration (durationFrames/frameRate) and matches
    what FCP renders. MUST stay in sync with the TS parser's fallback
    (src/parser/index.ts) so GT and engine share the same time domain."""
    max_out = 0.0
    for m in re.finditer(r'\bout="(\d+)\s+(\d+)', xml):
        val, scale = int(m.group(1)), int(m.group(2))
        if scale > 0:
            sec = val / scale
            if sec > max_out:
                max_out = sec
    return max_out


def animation_end_seconds(motr_path):
    """Max keyframe time (seconds) across all NON-retime, NON-snapshot curves.

    Uses a real XML walk so we can skip whole subtrees: "Snapshots" holds rig-widget
    snapshot COPIES of filter params (e.g. a copy of the Gaussian/Directional blur
    Amount/Angle whose keyframes run to 0.5005s) that are NOT the rendered layer. If
    counted they overshoot the true animation end (the drop-zone Opacity crossfade at
    0.4338s) and the final frames WRAP back to source A. We also skip the RETIME_PARAMS
    cache curves by nearest-parameter name.
    """
    from xml.dom.minidom import parse as _parse
    EXCLUDE_ANCESTORS = {"Snapshots"}
    try:
        doc = _parse(motr_path)
    except Exception:
        return _animation_end_seconds_linescan(motr_path)
    max_t = 0.0
    for curve in doc.getElementsByTagName("curve"):
        # Climb the ancestor <parameter> chain.
        owner = None
        skip = False
        n = curve.parentNode
        while n is not None and n.nodeType == 1:
            if n.tagName == "parameter":
                nm = n.getAttribute("name")
                if owner is None:
                    owner = nm
                if nm in EXCLUDE_ANCESTORS:
                    skip = True
                    break
            n = n.parentNode
        if skip:
            continue
        if owner in RETIME_PARAMS:
            continue
        for kp in curve.getElementsByTagName("keypoint"):
            ts = kp.getElementsByTagName("time")
            if not ts or not ts[0].firstChild:
                continue
            parts = ts[0].firstChild.data.split()
            try:
                val = float(parts[0]); scale = float(parts[1]) if len(parts) > 1 else 1.0
            except ValueError:
                continue
            if scale > 0:
                sec = val / scale
                if sec > max_t:
                    max_t = sec
    if max_t <= 0:
        # No spatial keyframes (e.g. Movements/Swing, Blurs/Zoom — motion is driven
        # entirely by Ramp/Retime/procedural behaviors whose values live in
        # Start/End Value params, NOT <keypoint>s). Bound the window by the max
        # <timing out=...> across all nodes, EXACTLY mirroring the TS parser's
        # fallback in src/parser/index.ts (animationEndSec = maxOut). Without this
        # the harness fell through to the 1.6683s Push default, putting GT and the
        # engine on DIFFERENT time domains (a silent PSNR killer for Swing et al.).
        xml = open(motr_path, "r", encoding="utf-8", errors="ignore").read()
        max_t = _scene_duration_seconds(xml)
    return max_t


def _animation_end_seconds_linescan(motr_path):
    """Max keyframe time (seconds) across all NON-retime curves."""
    xml = open(motr_path, "r", encoding="utf-8", errors="ignore").read()
    max_t = 0.0
    # Walk <curve>...</curve> blocks, skipping ones whose enclosing <parameter name>
    # is a retime/cache curve. Cheap approach: find each <parameter name="X"> ... and
    # its curve, but simplest robust: scan keypoint <time> within curves and track the
    # nearest preceding <parameter name=...>.
    # Track the most recent parameter name as we scan.
    param_re = re.compile(r'<parameter name="([^"]*)"')
    time_re = re.compile(r'<time>(\d+)\s+(\d+)')
    cur_param = None
    for line in xml.splitlines():
        m = param_re.search(line)
        if m:
            cur_param = m.group(1)
        mt = time_re.search(line)
        if mt and cur_param not in RETIME_PARAMS:
            val, scale = int(mt.group(1)), int(mt.group(2))
            if scale > 0:
                sec = val / scale
                if sec > max_t:
                    max_t = sec
    if max_t <= 0:
        max_t = _scene_duration_seconds(xml)
    return max_t

def _frame_mean(png_path):
    """Mean pixel value of a rendered frame (0-255), or -1 if unreadable."""
    try:
        import struct, zlib
        # Lightweight: use PIL if available, else fall back to a crude read.
        from PIL import Image
        import numpy as np
        a = np.asarray(Image.open(png_path).convert("RGB"), dtype="float32")
        return float(a.mean())
    except Exception:
        return -1.0


def _validate_frames(outdir, nframes):
    """Detect a degenerate/corrupt render (the FCP engine returns all-black or
    frozen frames under heavy machine load / SIGKILL contention). For an A->B
    transition the LAST frame must be source B (non-black), and the frames must
    not all be identical. Returns (ok, reason)."""
    import glob
    frames = sorted(glob.glob(os.path.join(outdir, "frame_*.png")))
    if len(frames) < max(2, nframes):
        return False, f"only {len(frames)}/{nframes} frames written"
    last_mean = _frame_mean(frames[-1])
    first_mean = _frame_mean(frames[0])
    if last_mean < 0 or first_mean < 0:
        return False, "unreadable frame(s)"
    # Last frame all-black => the engine failed to composite source B (corruption).
    if last_mean < 5.0:
        return False, f"last frame is black (mean={last_mean:.1f}) — expected source B"
    # First frame all-black is also degenerate (should be source A).
    if first_mean < 5.0:
        return False, f"first frame is black (mean={first_mean:.1f}) — expected source A"
    return True, "ok"


def _render_one(motr, img_a, img_b, outdir, nframes):
    """Render one transition's frames into outdir. Assumes engine is initialized."""
    os.makedirs(outdir, exist_ok=True)
    end = animation_end_seconds(motr)
    if end <= 0:
        end = 1.6683333333333332  # last-resort Push default (no keyframes, no scene duration)
    doc = ozengine.load_doc(motr)
    for i in range(nframes):
        p = i / (nframes - 1) if nframes > 1 else 0.0
        t = p * end
        if i == nframes - 1:
            t = end - 1e-4  # nudge below the loop-point wrap
        out = os.path.join(outdir, f"frame_{i:04d}.png")
        ozengine.render_frame(doc, img_a, img_b, t, out)
    return end


def main():
    args = sys.argv[1:]

    # --- Batch mode: render MANY transitions in ONE process, paying the ~1.3s
    #     engine init only ONCE (instead of 65× cold boot). Reads a manifest of
    #     "motr\timg_a\timg_b\toutdir" lines (one per transition) from a file or
    #     stdin. Frame count via --frames N (default 24).
    #       python tools/render_gt.py --batch manifest.tsv [--frames 24]
    #       ... | python tools/render_gt.py --batch - [--frames 24]
    if args and args[0] == "--batch":
        manifest_path = args[1]
        nframes = 24
        if "--frames" in args:
            nframes = int(args[args.index("--frames") + 1])
        src = sys.stdin if manifest_path == "-" else open(manifest_path)
        jobs = []
        for line in src:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) < 4:
                continue
            jobs.append(parts[:4])
        if src is not sys.stdin:
            src.close()
        ozengine.init_engine()  # one-time ~1.3s cost for the whole batch
        ok = 0
        corrupt = []
        for motr, img_a, img_b, outdir in jobs:
            try:
                end = _render_one(motr, img_a, img_b, outdir, nframes)
                valid, reason = _validate_frames(outdir, nframes)
                if not valid:
                    # Retry ONCE — corruption is caused by transient machine-load
                    # contention (SIGKILL/context-leak), so a fresh render often
                    # succeeds. If it still fails, flag it (do NOT cache garbage).
                    print(f"WARN {outdir}  {reason} — retrying", flush=True)
                    end = _render_one(motr, img_a, img_b, outdir, nframes)
                    valid, reason = _validate_frames(outdir, nframes)
                if valid:
                    print(f"OK  {outdir}  ({nframes}f, end={end:.4f}s)", flush=True)
                    ok += 1
                else:
                    print(f"CORRUPT {outdir}  {reason}", flush=True)
                    corrupt.append(outdir)
            except Exception as e:  # one bad template must not abort the batch
                print(f"ERR {outdir}  {motr}: {e}", flush=True)
        print(f"batch done: {ok}/{len(jobs)} transitions rendered", flush=True)
        if corrupt:
            print(f"CORRUPT ({len(corrupt)}): " + ", ".join(os.path.basename(c) for c in corrupt), flush=True)
        os._exit(0)  # avoid Ozone teardown crash on interpreter exit

    if args and args[0] == "--push":
        motr = os.path.expanduser("~/random/motion-renderer/examples/PETemplates.localized/"
                                  "Transitions.localized/Movements.localized/Push.localized/Push.motr")
        img_a = os.path.join(ozengine.HERE, "images/start.jpg")
        img_b = os.path.join(ozengine.HERE, "images/end.jpg")
        outdir = args[1]
        nframes = int(args[2]) if len(args) > 2 else 50
    else:
        motr, img_a, img_b, outdir = args[0], args[1], args[2], args[3]
        nframes = int(args[4]) if len(args) > 4 else 50

    end = _render_one(motr, img_a, img_b, outdir, nframes)
    print(f"rendered {nframes} frames to {outdir}  (animation_end={end:.6f}s)")
    os._exit(0)  # avoid Ozone teardown crash on interpreter exit


if __name__ == "__main__":
    main()
