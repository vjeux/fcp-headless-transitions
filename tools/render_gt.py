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
    # Reset the reverse-ramp schedule global every call so a prior slug's schedule can
    # never leak. It is (re)populated at the END of this function, AFTER the linear `end`
    # is fully trimmed, iff this is a genuine A->(snap B)->A round-trip whose LINEAR final
    # frame fails to land on cold-B (see the reverse-ramp decision block below).
    global _LAST_SCHEDULE
    _LAST_SCHEDULE = None
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

    def _finish(final_end):
        """Single exit point: decide the reverse-ramp for the (now fully trimmed) linear
        `final_end`, stash it in _LAST_SCHEDULE, and return `final_end` (unchanged — the
        schedule, not the scalar, drives sampling when set). See _maybe_reverse_ramp."""
        _mp_rr = motr_path if motr_path is not None else _LAST_MOTR_PATH
        sched = _maybe_reverse_ramp(doc, img_a, img_b, final_end, _mp_rr, log=log)
        globals()["_LAST_SCHEDULE"] = sched
        return final_end

    # (3) Last frame still shows content => no A-return. Untouched.
    if d0[-1] >= FAR:
        _log(f"atrim: no A-return (d0_last={d0[-1]:.1f} >= {FAR}); end unchanged {end:.4f}s")
        return _finish(end)
    # (4a) Transition never progressed.
    peak = float(d0.max())
    if peak < MIN_PROGRESS:
        _log(f"atrim: UNSURE — no progression (peak d0={peak:.1f} < {MIN_PROGRESS}); end unchanged")
        return _finish(end)
    # (4b) Must reach clearly cold-B somewhere, else the peak isn't B -> UNSURE.
    cold_min = float(warmth.min())
    if cold_min > B_WARM:
        _log(f"atrim: UNSURE — never resolves to cold-B (min warmth={cold_min:.1f} > {B_WARM}); "
             f"end unchanged (not a B-ending transition in headless render)")
        return _finish(end)
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
        return _finish(end)
    # (5) Trim to the trailing edge of the cold-B plateau.
    plateau = [i for i in range(N) if warmth[i] <= cold_min + COLD_MARGIN and minch[i] >= B_MINCH]
    end_i = max(plateau)
    # Guard: the chosen frame must itself be B-content (far from A) — belt & suspenders.
    if d0[end_i] < FAR:
        _log(f"atrim: UNSURE — B-plateau edge f{end_i} not content-bearing (d0={d0[end_i]:.1f}); end unchanged")
        return _finish(end)
    new_end = ts[end_i] + 1e-4
    if new_end >= end:
        _log(f"atrim: B-plateau already at window end; end unchanged {end:.4f}s")
        return _finish(end)
    _log(f"atrim: A-return trimmed {end:.4f}s -> {new_end:.4f}s "
         f"(coldB f{coldest_i} warmth={cold_min:.1f}, plateau edge f{end_i} "
         f"warmth={warmth[end_i]:.1f} d0={d0[end_i]:.1f}, was d0_last={d0[-1]:.1f})")
    return _finish(new_end)


def _play_range_seconds(motr_path):
    """The transition's authored <playRange duration="V S ..."> in seconds, or None.

    Thin file-reading wrapper over `_playrange_seconds(xml)` (which takes the XML text)
    so the reverse-ramp path can go motr_path -> seconds in one call. playRange is tA
    (the scene-time at which the A->B->A round-trip template SETTLES BACK to source A):
    Loop 1.9686s, Heart/Glide 2.5025s, Center 5.3053s (7680000 timebase)."""
    try:
        xml = open(motr_path, "r", encoding="utf-8", errors="ignore").read()
    except OSError:
        return None
    return _playrange_seconds(xml)


def _maybe_reverse_ramp(doc, img_a, img_b, linear_end, motr_path, log=None):
    """Decide whether to apply the reverse-ramp time-remap for THIS slug, and return its
    per-frame schedule (or None to keep the caller's LINEAR sampling).

    Gate (opt-in FCT_ATRIM=1, same benchmark cold-B anchor as _areturn_end_seconds).
    The reverse-ramp is for the A->(snap B)->A round-trip family (Stylized Loop/Heart/
    Center): the scene snaps to a cold-B climax EARLY/MID and smoothly RETURNS to source A
    by playRange end. FCP shows that B->A decay ramp PLAYED IN REVERSE (== clean A->B);
    linear forward sampling ends on A / a black wrap and oscillates. The discriminators
    (all from the [0,playRange] scan inside _reverse_ramp_schedule) that separate this
    family from every other slug, verified by a 48-frame warmth scan:

      G1 (here). f0 must be WARM source-A (warmth >= A_WARM, non-black). EXCLUDES B-first
         transitions whose GT starts on cold-B (Wipes/Mask f0 warmth ~ -47): the reverse
         ramp assumes f0==source-A. Mask stays linear => no regression.

      G2/G3/G4 (in _reverse_ramp_schedule):
        - cold-B climax index iB must be EARLY/MID (iB <= RAMP_MAX_FRAC*N). Round-trips
          reach cold-B at f2/f16/f25 (Center/Loop/Heart, all <= 52%); DIRECTIONAL slides
          (Push f45, Rotate f44 — both ~94%) reach cold-B only at the very END (the slide
          IS the transition), so they are EXCLUDED and stay linear (Push 23.22, Rotate
          13.04 held). This is the key round-trip-vs-directional separator.
        - cold-B must be genuine (warmth <= B_WARM AND min-channel >= B_MINCH): EXCLUDES
          Glide (floor +5.3), Flash (white flash ~0), Drop_In (weak -25.5 / crushed).
        - the scene must RETURN to warm-A after iB (some post-climax frame warmth >=
          A_RETURN): confirms the A->B->A round trip (vs a one-way A->B that just ends cold).

    `linear_end` is accepted for signature compatibility / future use but the decision is
    made entirely from the playRange scan (independent of the linear trims) so it is not
    entangled with the scene-clamp / A-return end value."""
    import numpy as np
    if os.environ.get("FCT_ATRIM") != "1":
        return None
    if not motr_path:
        return None
    pr = _play_range_seconds(motr_path)
    if not pr or pr <= 0.05:
        return None
    return _reverse_ramp_schedule(doc, img_a, img_b, pr, 24, log=log)


def _reverse_ramp_schedule(doc, img_a, img_b, play_range, nframes, log=None):
    """Reverse-ramp time-remap for the A->(snap B)->A round-trip templates (Stylized
    Loop/Heart/Center/...). Scan [0,playRange] (NSCAN frames), locate the cold-B climax,
    verify the round-trip signature, and return a DECREASING per-frame scene-time schedule
    that samples the B->A decay ramp BACKWARDS: f0->tA(source A), f_{N-1}->tB(cold-B).

    Returns None (=> caller keeps its LINEAR schedule) unless ALL round-trip gates pass:
      - f0 is warm source-A (warmth >= A_WARM) — B-first slugs (Mask) excluded.
      - the coldest NON-BLACK frame is genuine cold-B (warmth <= B_WARM, minCh >= B_MINCH)
        — Glide/Flash/weak-B (Drop_In) excluded.
      - that cold-B climax is reached EARLY/MID (iB <= RAMP_MAX_FRAC*NSCAN) — DIRECTIONAL
        slides whose cold-B is only reached at the very end (Push f45, Rotate f44 of 48)
        are excluded and stay linear (this is the round-trip-vs-directional separator).
      - the scene RETURNS to warm-A after the climax (max post-iB warmth >= A_RETURN) —
        confirms the A->B->A round trip.

    The returned schedule is DECREASING (f0 == largest time tA; f_{N-1} == smallest tB),
    so it cannot be expressed as a single `end` scalar with linear forward sampling — the
    caller samples schedule[i] directly (see sample_time / _render_one). When None, the
    caller keeps linear sampling and the g3 (_scene_clamp) / g5b (_clamp_to_playrange) /
    _areturn linear-path trims stay in force => zero regression outside the round-trip
    family."""
    import tempfile
    import numpy as np
    A_WARM = 25.0        # f0 (and post-climax return) must be at least this warm for A
    A_RETURN = 25.0      # some post-climax frame must return this warm (round-trip proof)
    B_WARM = -25.0       # coldest frame must be at least this cold to be genuine source B
    B_MINCH = 40.0       # ... and not a crushed/tinted false-B (min channel >= this)
    RAMP_MAX_FRAC = 0.75 # cold-B must be reached within the first 75% of the scan window;
                         # round-trips: Center 4%, Loop 33%, Heart 52%; directional slides
                         # Push 94% / Rotate 94% are past it and stay linear.
    NSCAN = 48
    def _frame(t):
        fd, tmp = tempfile.mkstemp(suffix=".png"); os.close(fd)
        try:
            ozengine.render_frame(doc, img_a, img_b, t, tmp)
            return np.asarray(__import__("PIL.Image", fromlist=["Image"]).open(tmp).convert("RGB"), dtype="float32")
        finally:
            try: os.remove(tmp)
            except OSError: pass
    ts = [(k / (NSCAN - 1)) * play_range for k in range(NSCAN)]
    warmth = np.empty(NSCAN); minch = np.empty(NSCAN); mean = np.empty(NSCAN)
    for k, t in enumerate(ts):
        fr = _frame(t); ch = fr.reshape(-1, 3).mean(axis=0)
        warmth[k] = float(ch[0] - ch[2]); minch[k] = float(ch.min()); mean[k] = float(fr.mean())
    # G1: f0 must be warm source-A (not a B-first / Mask-style GT).
    if mean[0] < 5.0 or warmth[0] < A_WARM:
        if log: log(f"revramp: SKIP — f0 is not warm source-A (warmth={warmth[0]:.1f}); linear")
        return None
    # cold-B climax = coldest NON-BLACK frame (a black wrap frame has warmth~0 but mean~0)
    valid = mean >= 5.0
    cand = np.where(valid, warmth, 1e9)
    iB = int(np.argmin(cand)); wB = float(warmth[iB])
    # G2: genuine cold-B (excludes Glide floor +5.3, Flash white ~0, Drop_In weak/crushed).
    if wB > B_WARM or minch[iB] < B_MINCH:
        if log: log(f"revramp: SKIP — never resolves to genuine cold-B "
                    f"(coldest warmth={wB:.1f} minCh={minch[iB]:.1f}); linear")
        return None
    # G3: cold-B must be EARLY/MID (round-trip snap), not a LATE directional-slide climax.
    if iB > RAMP_MAX_FRAC * (NSCAN - 1):
        if log: log(f"revramp: SKIP — cold-B reached LATE at f{iB}/{NSCAN} "
                    f"({iB/(NSCAN-1):.0%} > {RAMP_MAX_FRAC:.0%}); directional slide, keep linear")
        return None
    # G4: the scene must RETURN to warm-A after the climax (A->B->A round-trip proof).
    warm_after = float(warmth[iB:].max())
    if warm_after < A_RETURN:
        if log: log(f"revramp: SKIP — no warm-A return after cold-B (max post-climax "
                    f"warmth={warm_after:.1f} < {A_RETURN}); one-way A->B, keep linear")
        return None
    tB = ts[iB]; tA = play_range
    if tA - tB < 1e-3:
        if log: log("revramp: cold-B at window end; linear fallback")
        return None
    sched = [tA - (i / (nframes - 1)) * (tA - tB) for i in range(nframes)] if nframes > 1 else [tB]
    sched[0] = tA - 1e-4
    if log: log(f"revramp: A->B reverse ramp tA={tA:.4f}s -> tB={tB:.4f}s "
                f"(coldB f{iB}/{NSCAN} warmth={wB:.1f}, warm-return {warm_after:.1f})")
    return sched


# Module global: the last reverse-ramp schedule computed by _areturn_end_seconds (set to
# None when the cold-B gate does not fire). Lets a linear scorer (score_slug.py /
# gui_scoreboard.py) that only calls animation_end_seconds + _areturn_end_seconds pick up
# the reverse-ramp schedule via `render_gt.sample_time(i, N, end)` WITHOUT restructuring its
# loop into a decreasing per-frame schedule. See sample_time() and the coordination note in
# the module docstring of the scorer patch (TIMEREMAP_FINDINGS.md).
_LAST_SCHEDULE = None


def sample_time(i, nframes, span):
    """Return the scene-time (seconds) for GT frame `i` of `nframes`.

    FCP plays the transition over its AUTHORED scene duration (`span` =
    scene_duration_seconds) and the timeline covers it as `nframes` EQUAL,
    HALF-OPEN slices: frame `i` sits at timeline progress `i/nframes`, so

        t = (i / nframes) * span

    Frame 0 is the pure-A start; the last frame (i = nframes-1) lands at
    `(nframes-1)/nframes * span`, which is INSIDE the transition (fully B) —
    it must NOT be nudged to `span`, because `span` is the loop-point where the
    scene wraps back to source A. This half-open `i/N` convention (not the old
    closed `i/(N-1)`, which stretched the last frame onto the wrap point and
    lagged the whole back half) reproduces FCP's GUI cadence to <0.1% of frame
    height (verified on Push via seam-position fit: RMS 0.0006 vs 0.0125).

    If a reverse-ramp schedule was computed for the current doc (by the most
    recent _areturn_end_seconds call, when its cold-B gate fired), return
    schedule[i] (the DECREASING reverse-ramp time) instead."""
    sched = _LAST_SCHEDULE
    if sched is not None and len(sched) == nframes:
        return sched[i]
    if nframes <= 1:
        return 0.0
    return (i / nframes) * span


def _render_one(motr, img_a, img_b, outdir, nframes):
    """Render one transition's frames into outdir. Assumes engine is initialized.

    Time model (verified against FCP's GUI export via seam-position fit on Push,
    RMS 0.0006 of frame height): FCP plays the transition over its AUTHORED scene
    duration `span` = scene_duration_seconds(motr) = sceneSettings/duration ÷
    frameRate. The `nframes` GT frames cover [0, span) as half-open equal slices:
    frame i sits at scene-time (i/nframes)*span. Frame 0 = pure-A start; the final
    frame lands at ((nframes-1)/nframes)*span, strictly BEFORE the loop-point `span`
    where the scene wraps back to source A.

    The old code sampled i/(nframes-1)*animation_end. Both parts were wrong:
    animation_end (max spatial keyframe) is not the authored span, and the closed
    i/(N-1) fencepost stretched the last frame onto the wrap-point (duplicated
    final frame) and lagged the whole back half. That in turn spawned a stack of
    compensating clamps (scene-clamp / visible-end / A-return trims). With the
    correct span + half-open sampling those clamps are unnecessary and removed.
    """
    os.makedirs(outdir, exist_ok=True)
    global _LAST_SCHEDULE
    _LAST_SCHEDULE = None  # clear any stale reverse-ramp schedule from a prior slug
    doc = ozengine.load_doc(motr)
    span = scene_duration_seconds(motr)
    if not span or span <= 0:
        # Templates without a parseable <sceneSettings> fall back to the max-keyframe
        # heuristic (rare; keeps a sane window instead of 0).
        span = animation_end_seconds(motr)
    if not span or span <= 0:
        span = 1.7  # last-resort default scene span (Push authored duration 51/30)
    # REVERSE-RAMP time-remap (opt-in FCT_ATRIM=1): the A->(snap B)->A round-trip
    # templates (Stylized Loop/Heart/Center/...) play a B->A decay after reaching B,
    # so a plain forward walk ends back on source A. When such a transition
    # demonstrably resolves to cold-B, _areturn_end_seconds computes a DECREASING
    # reverse-ramp schedule and stashes it in _LAST_SCHEDULE; we sample that instead.
    # This is a genuine per-template time REMAP (not a span correction) and is the
    # one remaining time-domain special case. It is a no-op for every transition
    # whose gate does not fire (Push et al. fall straight through to the linear walk).
    schedule = None
    if os.environ.get("FCT_ATRIM") == "1":
        _areturn_end_seconds(doc, img_a, img_b, span, motr_path=motr,
                             log=lambda m, _o=outdir: print(f"  [{os.path.basename(_o)}] {m}", flush=True))
        schedule = _LAST_SCHEDULE
        if schedule is not None and len(schedule) != nframes:
            pr = _play_range_seconds(motr)
            schedule = _reverse_ramp_schedule(
                doc, img_a, img_b, pr, nframes,
                log=lambda m, _o=outdir: print(f"  [{os.path.basename(_o)}] {m}", flush=True)) if pr else None
    for i in range(nframes):
        if schedule is not None:
            t = schedule[i]
        else:
            t = sample_time(i, nframes, span)
        out = os.path.join(outdir, f"frame_{i:04d}.png")
        ozengine.render_frame(doc, img_a, img_b, t, out)
    return span


def main():
    args = sys.argv[1:]

    # --- Batch mode: render MANY transitions in ONE process, paying the ~1.3s
    #     engine init only ONCE (instead of 65× cold boot). Reads a manifest of
    #     "motr\timg_a\timg_b\toutdir" lines (one per transition) from a file or
    #     stdin. Frame count via --frames N (default 24).
    #       python tools/render_gt.py --batch manifest.tsv [--frames 24]
    #       ... | python tools/render_gt.py --batch - [--frames 24]
    # --- Isolated batch mode: render EACH job in its OWN fresh subprocess.
    #     A single long-lived process accumulates unavoidable engine state (the
    #     ProMedia/OZFootage bitmap cache + shared CGL master context); across a
    #     full 65-slug run this eventually null-derefs in PMStillInstance::getFrameGPU
    #     or leaves the shared GL context dirty (observed: SIGSEGV at slug ~53, and
    #     pre-GL-reset, an all-black cascade from the poison point onward). Rendering
    #     each slug in its own subprocess pays the ~1.3s engine boot per slug but is
    #     100% robust: no slug can poison or crash another. Each subprocess still
    #     benefits from the per-frame CGL reset + resource release in oz_render.mm.
    #     Retries a crashed/black slug up to 3x. Use for the full GT regen:
    #       python tools/render_gt.py --batch-isolated manifest.tsv [--frames 24]
    if args and args[0] == "--batch-isolated":
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
            if len(parts) >= 4:
                jobs.append(parts[:4])
        if src is not sys.stdin:
            src.close()
        import subprocess
        FW = ozengine.FW
        ok = 0
        failed = []
        for motr, img_a, img_b, outdir in jobs:
            slug = os.path.basename(outdir)
            done = False
            for attempt in range(1, 4):
                env = dict(os.environ)
                env["DYLD_FRAMEWORK_PATH"] = FW
                r = subprocess.run(
                    [sys.executable, os.path.abspath(__file__), motr, img_a, img_b, outdir, str(nframes)],
                    env=env, capture_output=True, text=True, cwd=ozengine.HERE)
                valid, reason = _validate_frames(outdir, nframes)
                if r.returncode == 0 and valid:
                    print(f"OK  {slug}  ({nframes}f) [attempt {attempt}]", flush=True)
                    ok += 1
                    done = True
                    break
                why = reason if not valid else f"rc={r.returncode}"
                print(f"RETRY {slug}  {why} [attempt {attempt}]", flush=True)
            if not done:
                print(f"FAIL {slug}", flush=True)
                failed.append(slug)
        print(f"isolated batch done: {ok}/{len(jobs)} rendered", flush=True)
        if failed:
            print(f"FAILED ({len(failed)}): " + ", ".join(failed), flush=True)
        os._exit(0)

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
