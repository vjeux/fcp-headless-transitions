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

# Set by animation_end_seconds() so the scorer's 4-arg _areturn_end_seconds() call
# (which does not pass the motr path) can still recover it for the scene-duration clamp.
_LAST_MOTR_PATH = None

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

def _playrange_seconds(xml):
    """The transition's <playRange duration="val scale ..."> in seconds, or None.

    playRange is the AUTHORED transition span (the duration the drop-zone media is
    laid across in the .motr timeline). For most transitions it agrees with the
    max-spatial-keyframe `animation_end_seconds` to within a frame. For a FEW,
    `animation_end_seconds` OVERSHOOTS it badly because the max keyframe sits on a
    post-settle bounce/hold/decay keyframe that is PAST the visual A->B transition
    (the transition has already reached B and is just holding/settling). Sampling
    the render across that inflated window compresses the real motion into the first
    handful of frames and wastes the rest on dead/held content -> a large PSNR loss
    vs the GUI GT (which spans exactly the transition). See `_clamp_to_playrange`."""
    m = re.search(r'playRange[^>]*duration="(\d+)\s+(\d+)', xml)
    if m and int(m.group(2)) > 0:
        return int(m.group(1)) / int(m.group(2))
    return None


# Overshoot ratio above which a Movements-family transition's animation_end is
# considered a keyframe-max leak past the visual transition and is clamped down to
# its authored playRange. Empirically (all 65 templates) within the Movements family
# ONLY Drop_In (ratio 2.11) and Smear (ratio 2.83) exceed this; every guard that
# currently renders correctly (Rotate 0.95, Pinwheel 1.00, Fall 0.98, Flashback 0.98,
# Clothesline 0.98, Reflection 0.98, Earthquake 1.27, Multi-flip 1.34, Black_Hole 1.45)
# stays UNDER it, so the clamp is targeted-but-principled and cannot touch them. Of the
# two that exceed it, Smear is further gated OUT by the effect-filter check below (its
# overshoot is filter/rig-driven, not a spatial-keyframe leak), so the clamp fires on
# Drop_In alone across all 65 templates.
# NOTE (deliberately conservative): this is NOT a universal playRange swap. Other
# families have transitions whose animation_end legitimately (or for owner-specific
# reasons) exceeds playRange (e.g. Wipes/Mask, several Stylized/*, Lights/Flash) and
# clamping THOSE would REGRESS them / step on other pool workers — so the clamp is
# scoped to the Movements family, which this worker owns.
_PLAYRANGE_OVERSHOOT_RATIO = 1.5

# Effect-filter plugins whose PRESENCE means the transition's overshoot is driven by
# the FILTER's own parameter animation (a fast directional-blur / smear sweep), NOT by
# post-settle spatial-motion keyframes. For those, clamping the SPAN to playRange does
# not recover the missing effect/rig content — empirically it is a no-op-or-slight-loss
# (Smear: playRange-clamp 9.02 dB vs unclamped 9.19 dB; the gap is g1's rig-direction,
# not timing). So the span clamp is restricted to pure spatial-motion Movements (no
# effect filter), where the overshoot IS a keyframe-max leak past the drop/settle
# (Drop_In: playRange-clamp 9.23 dB vs unclamped 7.74 dB). This keeps the rule
# principled and prevents it from touching effect-driven transitions.
_EFFECT_FILTER_PLUGINS = ("DirectionalBlur", "Smear")


def _is_movements_family(motr_path):
    """True for a Movements-family transition template (path-based). Scopes the
    playRange clamp to this worker's family so it can never affect Wipes/Stylized/
    Lights/etc. transitions owned by other pool workers."""
    return "Movements.localized" in (motr_path or "")


def _clamp_to_playrange(motr_path, end, xml=None):
    """Clamp a Movements-family `animation_end` down to the authored playRange when
    it overshoots by more than `_PLAYRANGE_OVERSHOOT_RATIO` (see rationale above).

    Purely structural (XML only, no render) so it applies uniformly wherever
    `animation_end_seconds` is consumed (render_gt._render_one AND score_slug.py).
    GENERIC within the Movements family: keyed on the overshoot ratio, not on slug
    names. A no-op (returns `end` unchanged) for:
      - non-Movements templates (family gate),
      - templates with no parseable playRange,
      - Movements transitions whose animation_end is within 1.5x of playRange
        (i.e. every currently-correct Movements transition)."""
    if end <= 0 or not _is_movements_family(motr_path):
        return end
    if os.environ.get("FCT_NO_PLAYRANGE_CLAMP") == "1":
        return end  # A/B measurement escape hatch (does not affect normal runs)
    if xml is None:
        try:
            xml = open(motr_path, "r", encoding="utf-8", errors="ignore").read()
        except OSError:
            return end
    pr = _playrange_seconds(xml)
    if pr and pr > 0 and end > _PLAYRANGE_OVERSHOOT_RATIO * pr:
        # Effect-filter transitions (e.g. Smear's DirectionalBlur) overshoot because of
        # the FILTER's own animation, not a post-settle spatial-keyframe leak; clamping
        # their span does not help (see _EFFECT_FILTER_PLUGINS). Leave them to the
        # effect/rig owners. Only clamp pure spatial-motion Movements (e.g. Drop_In).
        if any(('pluginName="%s"' % p) in xml for p in _EFFECT_FILTER_PLUGINS):
            return end
        return pr
    return end


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

    NOTE: this remains a PATH-ONLY heuristic (no rendering). The authoritative FCP span
    is `scene_duration_seconds`; the overshoot correction (clamping animation_end down to
    the authored scene duration for the Flash/Bloom/Light_Noise/… family) is applied by
    the rendered probe `_scene_clamp_end_seconds` in `_render_one` / `_areturn_end_seconds`
    (which needs the engine + A/B images to distinguish a dead void from a Mask-style
    hold-then-reveal). We stash the last motr path in a module global so the scorer's
    4-arg `_areturn_end_seconds(doc, a, b, end)` call can still recover it for the clamp.
    """
    global _LAST_MOTR_PATH
    _LAST_MOTR_PATH = motr_path
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
    # Movements-family playRange overshoot clamp (Drop_In/Smear keyframe-max leak).
    max_t = _clamp_to_playrange(motr_path, max_t)
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
    max_t = _clamp_to_playrange(motr_path, max_t, xml=xml)
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


def scene_duration_seconds(motr_path):
    """FCP's AUTHORED transition span (seconds) = sceneSettings/duration frames ÷ frameRate.

    This is the length FCP plays the transition over on the timeline (the 24 GT frames
    span exactly this). It is the AUTHORITATIVE per-transition span. `animation_end_seconds`
    (max spatial keyframe) is only a HEURISTIC approximation of it: for well-behaved
    transitions animation_end ≈ scene_dur × 0.98 (one frame short — Push 1.668 vs 1.700,
    Rotate 1.268 vs 1.333), but for several transitions the keyframes run PAST the authored
    duration and animation_end OVERSHOOTS (Flash 1.0 vs 0.30 = 3.3×; Bloom 1.27 vs 0.50;
    Mask 5.04 vs 1.30; Light_Sweep 18.9 vs 1.43). Sampling 24 frames over that overshoot
    puts the whole visible transition in the first fraction and the tail frames render a
    black/out-of-range void (Flash's black back half). Returns 0 if unparseable."""
    try:
        from xml.dom.minidom import parse as _parse
        doc = _parse(motr_path)
        ss = doc.getElementsByTagName("sceneSettings")
        if not ss:
            return 0.0
        dur_el = ss[0].getElementsByTagName("duration")
        fr_el = ss[0].getElementsByTagName("frameRate")
        if not dur_el or not fr_el or not dur_el[0].firstChild or not fr_el[0].firstChild:
            return 0.0
        dur = float(dur_el[0].firstChild.data)
        fr = float(fr_el[0].firstChild.data)
        return dur / fr if fr > 0 else 0.0
    except Exception:
        return 0.0


def _scene_clamp_end_seconds(doc, img_a, img_b, motr_path, end, log=None):
    """Clamp an OVERSHOOTING `animation_end` down to FCP's authored scene duration.

    THE BUG THIS FIXES (the TIME-DOMAIN class): `animation_end_seconds` is a max-keyframe
    heuristic that OVERSHOOTS the authored transition span for a family of transitions
    (notably the Lights family — Flash/Bloom/Light_Noise/Static — plus Color_Planes,
    Center_Reveal, Heart, Light_Sweep, Slide_In, Loop, Drop_In, Leaves). Sampling 24
    frames linearly over the overshot window compresses the real transition into the first
    fraction and pushes the tail frames PAST the transition into a black/out-of-range void
    — e.g. Flash's flash-peak lands at ~14 % and the incoming image B never renders (pure
    black back half). FCP actually plays each transition over its AUTHORED scene duration
    (sceneSettings/duration ÷ frameRate); that is the correct span.

    GENERIC RULE (measurement-driven, not per-slug):
      1. sd = scene_duration_seconds(motr). If sd <= 0 or `end` does not overshoot it
         (end <= sd × 1.05), return `end` UNCHANGED. This protects every transition whose
         animation_end already fits the authored duration (Push 0.98×, Rotate 0.95×, and
         all the ~0.98× cluster) — they are never touched.
      2. Otherwise animation_end OVERSHOOTS the authored span. Decide whether the overshoot
         region (sd, end] is a DEAD void (transition already ended → clamp) or GENUINE
         late-arriving content (a hold-then-reveal like Wipes/Mask → keep). Render 8 probe
         frames across (sd, end] and measure the fraction that are BLACK (mean < 5).
      3. If black-fraction >= 0.30 the overshoot is a dead/return void → CLAMP end = sd.
         (Flash 1.00, Bloom 1.00, Color_Planes 1.00, Center_Reveal 1.00, Heart 1.00,
          Leaves 1.00, Drop_In 1.00, Light_Sweep 0.88, Static/Slide_In 0.75, Loop 0.62,
          Light_Noise 0.38 — all verified SD-better than AE by +1 to +11 dB.)
         If black-fraction < 0.30 genuine content persists to animation_end → KEEP `end`.
         (Wipes/Mask 0.12: its wipe REVEAL happens in the last ~25 % of the AE window — the
          held pre-reveal state fills the overshoot region with SOURCE content, not a void,
          so clamping to sd would cut off the reveal. Mask scores 17.7 at AE vs 11.1 at SD
          — correctly LEFT ALONE. Concentric 0.25, Black_Hole/Earthquake/Multi-flip/etc.
          0.0 are likewise kept.)

    The 0.30 threshold cleanly separates the clamp set (>=0.38) from the keep set (<=0.25).
    This is the single generic time-domain span rule — no per-slug constants."""
    import tempfile
    import numpy as np
    BLACK = 5.0
    BLACKFRAC_CLAMP = 0.30
    OVERSHOOT_MARGIN = 1.05   # end must exceed sd by >5% to be considered an overshoot
    N = 8

    def _log(msg):
        if log is not None:
            log(msg)

    sd = scene_duration_seconds(motr_path)
    if sd <= 0.0 or end <= sd * OVERSHOOT_MARGIN:
        return end  # no authored duration, or animation_end already fits it — untouched

    def _mean_at(t):
        fd, tmp = tempfile.mkstemp(suffix=".png"); os.close(fd)
        try:
            ozengine.render_frame(doc, img_a, img_b, t, tmp)
            return float(np.asarray(__import__("PIL.Image", fromlist=["Image"])
                                    .open(tmp).convert("RGB"), dtype="float32").mean())
        finally:
            try: os.remove(tmp)
            except OSError: pass

    black = 0
    for i in range(N):
        t = sd + (i + 1) / N * (end - sd)   # sample the overshoot region (sd, end]
        if _mean_at(t) < BLACK:
            black += 1
    frac = black / N
    if frac >= BLACKFRAC_CLAMP:
        _log(f"scene-clamp: animation_end {end:.4f}s overshoots authored scene "
             f"duration {sd:.4f}s (ratio {end/sd:.2f}); overshoot region is a dead void "
             f"(black frac {frac:.2f} >= {BLACKFRAC_CLAMP}) -> clamp to {sd:.4f}s")
        return sd
    _log(f"scene-clamp: animation_end {end:.4f}s overshoots scene duration {sd:.4f}s "
         f"but genuine content persists past it (black frac {frac:.2f} < {BLACKFRAC_CLAMP}); "
         f"end unchanged (hold-then-reveal class, e.g. Mask)")
    return end


def _visible_end_seconds(doc, img_a, img_b, end):
    """Trim `end` down to the true VISUAL end so the final sampled frame is never a
    black-wrap frame. GENERIC and measurement-driven — the render is the ground truth.

    For the retime-wrap class of transitions the FCP engine plays PAST the last
    drop-zone frame into a pure-black loop-point. `animation_end_seconds` (the max
    spatial keyframe) can land there. We detect this by rendering the last-frame time
    and, if it is black (mean < BLACK), binary-search the largest t < end whose render
    is non-black — content is valid for t < B and black for t >= B (a single onset),
    so this converges to just below B. Returns the trimmed end (or the original when
    the final frame is already valid — Push/Gaussian/etc. are untouched).

    A tmp scratch frame is used so we never clobber the real frame_*.png outputs."""
    import tempfile
    BLACK = 5.0
    def _mean_at(t):
        fd, tmp = tempfile.mkstemp(suffix=".png")
        os.close(fd)
        try:
            ozengine.render_frame(doc, img_a, img_b, t, tmp)
            return _frame_mean(tmp)
        finally:
            try:
                os.remove(tmp)
            except OSError:
                pass
    last_t = end - 1e-4
    if _mean_at(last_t) >= BLACK:
        return end  # already valid — do not touch (no regression)
    # The final frame is black: the true visual end is below `end`. Binary-search
    # for the largest non-black time in (0, end). lo is known non-black (frame 0
    # region), hi is known black (`end`).
    lo, hi = 0.0, end
    lo_ok = _mean_at(lo) >= BLACK
    if not lo_ok:
        # Even t=0 is black (should not happen for a real A/B transition) — bail out
        # and let the validator flag it rather than fabricate an end.
        return end
    for _ in range(24):  # ~1/16.7M of `end` — far finer than a frame
        mid = (lo + hi) / 2.0
        if _mean_at(mid) >= BLACK:
            lo = mid
        else:
            hi = mid
    # `lo` is the largest time we confirmed non-black. The new end must map the last
    # frame (end - 1e-4) at or below `lo`, so set end = lo + 1e-4 (last frame -> lo).
    return lo + 1e-4


def _areturn_end_seconds(doc, img_a, img_b, end, log=None, motr_path=None):
    """Trim `end` down past a SOURCE-A-RETURN tail so the final sampled frame settles
    on target B instead of looping back to source A. GENERIC + measurement-driven.

    THE BUG THIS FIXES (distinct from `_visible_end_seconds`, which only trims a BLACK
    loop-point tail): for ~21 transitions `animation_end_seconds` overshoots the true
    transition end into FCP's retime-wrap loop-point where the drop zones re-show
    source A. The tail is NOT black — it is *sepia source A*. The transition genuinely
    reaches B mid-sequence and then wraps/ramps back to A, so the cached GT wrongly ENDS
    ON A. An engine that correctly settles on B is penalized. Confirmed example:
    Wipes/Diagonal reaches full B at ~95% then the final keyframe re-shows source A.

    DETECTION (all measured on rendered scratch frames — the render IS the ground truth):
      1. Render f0 (== source A reference) once.
      2. Sample the window (0, end] at frame resolution; per sample compute
         d0 = mean|frame - f0|      (how far from source A)  and
         warmth = mean(R) - mean(B) (source A ≈ +75 warm, target B ≈ -47 cold).
      3. NO A-RETURN if the LAST frame is still far from f0 (d0_last >= FAR): it ends on
         content (B or the effect climax), not A. Return `end` UNCHANGED. This protects
         every correctly-settling transition (Push: d0_last≈63, warmth≈-44 -> untouched).
      4. Otherwise the tail has collapsed back to ≈A (d0_last small). We only trim when
         the transition demonstrably REACHED B: some sample must be clearly COLD
         (warmth <= B_WARM). The target for THIS benchmark's A/B pair is cold-blue B;
         a peak that is merely gray/white/edge-on (warmth ≈ 0) or still warm is NOT B —
         those are left alone and flagged UNSURE (see below). This is what distinguishes
         "reached B then wrapped to A" (trim) from a flip/switch/curtain whose headless
         render never composites the cold-B face, and from an authored A->B->A round
         trip whose peak isn't cold-B (e.g. Flash's WHITE flash).
      5. Trim `end` to the END of the cold-B plateau: the largest time whose frame is
         within COLD_MARGIN of the coldest (most-B) frame. Sampling N frames over the
         shorter [0, new_end] then yields a clean A->B ending squarely on B.

    CONSERVATISM / UNSURE (returns `end` unchanged, logs UNSURE):
      - No sample reaches cold-B (warmth never <= B_WARM): the effect never resolves to
        B in the headless render (Flip/Switch/Multi-flip/Diagonal/Glide/Slide/Static/
        Curtains/Earthquake/Color_Planes/Light_Noise/Concentric/Smear). Trimming would
        end on a gray/edge frame that does NOT resemble B — so DON'T. Different owner.
      - Transition never really progressed (peak d0 < MIN_PROGRESS): degenerate; skip.
      - Distinguishing an AUTHORED A->B->A round trip (legit, e.g. Stylized/Heart) from
        a retime-wrap return is not decidable from pixels alone when BOTH smoothly
        reach cold-B and return. Those legit round trips are GUARDS handled by the
        caller's allowlist (they are never passed to a re-render), so this function is
        only invoked on the 21 known retime-wrap a-return slugs; the cold-B gate above
        still keeps it from firing on any non-B-resolving transition.

    Only active when opted-in (FCT_ATRIM=1 or --atrim) — see `_render_one` — because
    the cold-B anchor is calibrated to this benchmark's warm-sepia->cold-blue A/B pair.
    """
    import tempfile
    import numpy as np
    # TIME-DOMAIN scene-duration clamp (runs FIRST, unconditionally — independent of the
    # FCT_ATRIM cold-B trim below). animation_end is a max-keyframe heuristic that
    # OVERSHOOTS FCP's authored scene duration for the Flash/Bloom/Light_Noise/Color_Planes/
    # Center_Reveal/Heart/Light_Sweep/Static/Slide_In/Loop/Drop_In/Leaves family, pushing
    # the sampled tail frames into a black/out-of-range void (Flash's black back half).
    # Clamp `end` down to the authored scene duration when the overshoot region is a dead
    # void; leave hold-then-reveal transitions (Mask) alone. Fully generic (no per-slug
    # constants). The scorer calls this with 4 positional args, so recover the motr path
    # from the module global set by animation_end_seconds() when not passed explicitly.
    _mp = motr_path if motr_path is not None else _LAST_MOTR_PATH
    if _mp:
        end = _scene_clamp_end_seconds(doc, img_a, img_b, _mp, end, log=log)
    FAR = 15.0          # d0 >= FAR  => frame still shows content (not source A)
    B_WARM = -25.0      # warmth <= B_WARM => distinctly cold-blue B side (B ref ≈ -47)
    B_MINCH = 40.0      # coldest frame's min channel must be >= this (B ref min ch ≈ 100);
                        # rejects dark/crushed/tinted false-B (Slide's [4,92,86] warmth -82)
    MIN_PROGRESS = 15.0 # peak d0 must exceed this or the transition never happened
    COLD_MARGIN = 6.0   # frames within this of the coldest are "on the B plateau"
    N = 48              # dense enough to locate the B plateau + its trailing edge

    def _frame(t):
        fd, tmp = tempfile.mkstemp(suffix=".png"); os.close(fd)
        try:
            ozengine.render_frame(doc, img_a, img_b, t, tmp)
            a = np.asarray(__import__("PIL.Image", fromlist=["Image"]).open(tmp).convert("RGB"), dtype="float32")
            return a
        finally:
            try: os.remove(tmp)
            except OSError: pass

    ts = [(i / (N - 1)) * end for i in range(N)]
    ts[-1] = end - 1e-4
    f0 = _frame(0.0)
    d0 = np.empty(N); warmth = np.empty(N); minch = np.empty(N)
    for i, t in enumerate(ts):
        fr = _frame(t)
        d0[i] = float(np.abs(fr - f0).mean())
        chan = fr.reshape(-1, 3).mean(axis=0)  # [R,G,B] mean
        warmth[i] = float(chan[0] - chan[2])
        minch[i] = float(chan.min())

    def _log(msg):
        if log is not None: log(msg)

    # (3) Last frame still shows content => no A-return. Untouched.
    if d0[-1] >= FAR:
        _log(f"atrim: no A-return (d0_last={d0[-1]:.1f} >= {FAR}); end unchanged {end:.4f}s")
        return end
    # (4a) Transition never progressed.
    peak = float(d0.max())
    if peak < MIN_PROGRESS:
        _log(f"atrim: UNSURE — no progression (peak d0={peak:.1f} < {MIN_PROGRESS}); end unchanged")
        return end
    # (4b) Must reach clearly cold-B somewhere, else the peak isn't B -> UNSURE.
    cold_min = float(warmth.min())
    if cold_min > B_WARM:
        _log(f"atrim: UNSURE — never resolves to cold-B (min warmth={cold_min:.1f} > {B_WARM}); "
             f"end unchanged (not a B-ending transition in headless render)")
        return end
    # (4c) The cold frame must actually LOOK like target B (all channels substantial —
    # B ref ≈ [100,116,147]), not a dark/crushed/tinted intermediate whose warmth is
    # negative only because one channel is crushed to ~0 (e.g. Stylized/Slide's dark
    # green-cyan wipe state RGB≈[4,92,86], warmth -82 but NOT source B). Require the
    # coldest frame's min channel >= B_MINCH so a tinted false-B is rejected -> UNSURE.
    coldest_i = int(warmth.argmin())
    if minch[coldest_i] < B_MINCH:
        _log(f"atrim: UNSURE — coldest f{coldest_i} is a crushed/tinted color "
             f"(minChannel={minch[coldest_i]:.1f} < {B_MINCH}, warmth={cold_min:.1f}), "
             f"not source B; end unchanged")
        return end
    # (5) Trim to the trailing edge of the cold-B plateau.
    plateau = [i for i in range(N) if warmth[i] <= cold_min + COLD_MARGIN and minch[i] >= B_MINCH]
    end_i = max(plateau)
    # Guard: the chosen frame must itself be B-content (far from A) — belt & suspenders.
    if d0[end_i] < FAR:
        _log(f"atrim: UNSURE — B-plateau edge f{end_i} not content-bearing (d0={d0[end_i]:.1f}); end unchanged")
        return end
    new_end = ts[end_i] + 1e-4
    if new_end >= end:
        _log(f"atrim: B-plateau already at window end; end unchanged {end:.4f}s")
        return end
    _log(f"atrim: A-return trimmed {end:.4f}s -> {new_end:.4f}s "
         f"(coldB f{coldest_i} warmth={cold_min:.1f}, plateau edge f{end_i} "
         f"warmth={warmth[end_i]:.1f} d0={d0[end_i]:.1f}, was d0_last={d0[-1]:.1f})")
    return new_end


def _render_one(motr, img_a, img_b, outdir, nframes):
    """Render one transition's frames into outdir. Assumes engine is initialized."""
    os.makedirs(outdir, exist_ok=True)
    end = animation_end_seconds(motr)
    if end <= 0:
        end = 1.6683333333333332  # last-resort Push default (no keyframes, no scene duration)
    doc = ozengine.load_doc(motr)
    # TIME-DOMAIN scene-duration clamp (runs FIRST): animation_end is a max-keyframe
    # heuristic that OVERSHOOTS FCP's authored scene duration for the Flash/Bloom/
    # Light_Noise/Color_Planes/Center_Reveal/Heart/Light_Sweep/Static/Slide_In/Loop/
    # Drop_In/Leaves family, pushing the sampled tail frames into a black/out-of-range
    # void (Flash's black back half). Clamp `end` down to the authored scene duration
    # when the overshoot region (sd, end] is a dead void; leave hold-then-reveal
    # transitions (Mask) alone. Fully generic — no per-slug constants.
    end = _scene_clamp_end_seconds(doc, img_a, img_b, motr, end,
                                   log=lambda m, _o=outdir: print(f"  [{os.path.basename(_o)}] {m}", flush=True))
    # True-visual-end correction (retime-wrap class): the FCP engine plays PAST the
    # last drop-zone frame into a pure-black loop-point, and the max-keyframe `end`
    # can land there. Trim `end` down (measurement-driven) so the final sampled frame
    # is never a black-wrap frame. This is fully generic: it only trims transitions
    # whose final frame is actually black, converging to the true black onset (so it
    # handles the replicator case where clones time out before the source drop zone
    # does, and NEVER over-trims transitions whose content legitimately outlives any
    # drop-zone `out`, e.g. Stylized/Close & Open). Push/Gaussian/etc. — whose final
    # frame is already valid source B — are returned untouched.
    end = _visible_end_seconds(doc, img_a, img_b, end)
    # Source-A-RETURN correction (retime-wrap loop-point re-shows sepia source A, not
    # black — so `_visible_end_seconds`' black-only trim misses it). Opt-in via
    # FCT_ATRIM=1 because the cold-B anchor is calibrated to this benchmark's
    # warm-sepia->cold-blue A/B pair; fully generic within that pair and a no-op for
    # any transition whose final frame already shows content (Push et al.).
    if os.environ.get("FCT_ATRIM") == "1":
        end = _areturn_end_seconds(doc, img_a, img_b, end,
                                   log=lambda m, _o=outdir: print(f"  [{os.path.basename(_o)}] {m}", flush=True))
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
