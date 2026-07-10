# Debugging & validating the browser engine against real FCP

> **Note:** the deep reverse-engineering helpers referenced below (`make_ruler.py`, `decode_ruler.py`, `edit_curve.py`, `lldb_capture_curve.py`, `curve_probe.py`, `make_videos.py`, `analyze_segments.py`) were one-time RE tools; they've been removed from the working tree but remain in git history at commit `c940dc3` (`git show c940dc3:tools/<name>.py`). Day-to-day rendering/scoring is now the `fct` toolkit (see `fct/README.md`). The methodology below is kept for reference.


This is the playbook for making `motr-engine` (the from-scratch TypeScript renderer
in `engine/`) match Final Cut Pro **pixel-for-pixel**. If you're an agent picking
this up cold: read this end-to-end before touching the curve/transform code. It
records how the current fidelity was reached and the exact tools to reproduce it.

Everything runs on the Mac with FCP installed. All the helpers live in `tools/`.

> **DYLD gotcha (read first):** the headless renderer `dlopen`s FCP's private
> frameworks, which requires `DYLD_FRAMEWORK_PATH` to point at FCP's `Frameworks`
> dir. macOS SIP **strips `DYLD_*` from the environment of any child launched via
> `timeout`, `nohup`, `setsid`, `sudo`, or `subprocess`** (→ `Library not loaded
> @rpath/ProAppSupport`). So always run the python process *directly* with `DYLD_*`
> inline: background it with a **bare `&` (+`disown`)**, or self-reexec via
> `os.execv` after setting `os.environ['DYLD_FRAMEWORK_PATH']`. Never wrap it in
> `timeout`/`nohup`/`setsid`/`sudo`. Scoring must likewise run inline on a direct
> invocation. There is ONE global render mutex — the lockfile is
> `/tmp/oz_render_global.lock` (auto-acquired by `init_engine`); a hung 0%-CPU render
> means another process holds it, so serialize renders rather than polling in a loop.

## 0. One-time setup

```bash
cd ~/random/final-cut-pro-transitions
python3 -m venv venv
./venv/bin/pip install pyobjc-core pyobjc-framework-Cocoa pyobjc-framework-Quartz pillow numpy pngjs
./build.sh                      # builds oz_render.dylib against FCP frameworks
(cd engine && npm install)      # browser engine deps (tsx, pngjs, ...)
```

## 1. Generate ground truth (the REAL FCP render)

`fct gen headless <slug>` drives FCP's actual Motion engine headless (via
`tools/ozengine.py`) and writes a 24-frame PNG sequence. It handles the single most
important gotcha:

> **A transition's animation ends at its LAST SPATIAL KEYFRAME, not the scene /
> playRange duration.** Push's last keyframe is `200200/120000 = 1.6683s`, but the
> scene duration is one frame longer and **wraps back to the start** (black/again
> frames) if you sample there. the headless renderer parses the max keyframe time across
> all curves *excluding* the `Retime Value` / `Retime Value Cache` / `Duration
> Cache` curves (whose keyframes run a frame past the spatial animation), and maps
> progress `0..1` onto `[0, animationEnd]`, nudging the final frame just below the
> end. The old harness sampled `0..2.002s` and scored ~15% black frames — that's
> why an early "37 dB Push" was meaningless.

```bash
# render one transition through FCP's real engine (auto-handles DYLD/venv):
./fct.sh gen headless Movements__Push
# frames land in ~/fct-frames/headless/Movements__Push/frame_0000..0023.png
```

The GUI ground truth (the only truth) lives at `~/fct-gui-gt/<slug>/`, sliced from the
recorded FCP GUI capture by `./fct.sh gen gui <slug>`. Headless/engine renders land under
`~/fct-frames/{headless,engine}/<slug>/`.

## 2. Measure the engine vs ground truth (PSNR)

`engine/test/push-compare.ts` is the canonical harness: it renders the engine at
each progress and reports mean PSNR + best/worst frames vs the committed GT.

```bash
cd engine
node_modules/.bin/tsx test/push-compare.ts          # prints mean PSNR + worst frames
node_modules/.bin/tsx test/push-compare.ts --dump    # also writes /tmp/push_engine/*.png
```

Robustness across the whole library (must stay 65/65, 0 crashes):

```bash
node_modules/.bin/tsx test/all-transitions.test.ts
```

## 3. Sub-pixel motion measurement — the "ruler" trick

PSNR on photos is noisy for diagnosing *motion*. Instead, render the transition
with **ruler images** whose RGB encodes each row index, then decode the exact
per-frame displacement of each source (noise-free, ~0.5 px).

```bash
./venv/bin/python tools/make_ruler.py               # writes /tmp/rulerA.png /rulerB.png
# render GT with rulers as the sources:
./fct.sh gen headless <slug>   # -> ~/fct-frames/headless/<slug>/
    <foo.motr> /tmp/rulerA.png /tmp/rulerB.png /tmp/ruler_out 50 &
./venv/bin/python tools/decode_ruler.py /tmp/ruler_out   # prints "<frame> <displacement>"
```

This is how the Push displacement curve `[0,1,4,9,19,32,...]` was recovered exactly.

## 4. Testing hypotheses by EDITING the .motr

You can change the transition and re-render through the real engine to see what
actually matters. `tools/edit_curve.py` rewrites the Color Solid's Y position curve
(the thing that drives Push) with keyframes you control (and flattens X):

```bash
# 2-keyframe ramp 0 -> -1080 (sanity-check the engine reads your edit):
./venv/bin/python tools/edit_curve.py <push.motr> /tmp/test.motr amplitude -1080
# arbitrary keyframes (time in 120000-scale : value):
./venv/bin/python tools/edit_curve.py <push.motr> /tmp/test.motr keyframes \
    0:0 36036:-108.93 96096:-565.78 200200:-1080
./fct.sh gen headless <slug>   # -> ~/fct-frames/headless/<slug>/
    /tmp/rulerA.png /tmp/rulerB.png /tmp/test_out 50 &
./venv/bin/python tools/decode_ruler.py /tmp/test_out
```

**Key finding from this method:** editing the stored `inputTangent*`/`outputTangent*`
handles to zero or extreme values changed the render **not at all**; only changing
keyframe VALUES/TIMES changed the motion. Conclusion: **Motion ignores the stored
tangent handles and recomputes them** from the keyframe points.

## 5. Reverse-engineering the exact math with lldb

When measurement + editing isn't enough, read the real algorithm out of the binary.
The curve engine lives in `ProChannel.framework`; the call chain is:

```
OZChannel::getValueAsDouble -> OZSpline::interpolate -> OZBezierInterpolator
   -> getControlPoints -> OZSpline::derivePoint (tangents from neighbour vertices)
   -> OZBezierFindParameter (solve time-bezier for u) -> OZBezierEval (value at u)
```

`tools/lldb_capture_curve.py` breakpoints `OZBezierFindParameter` (time control
polygon) and `OZBezierEval` (value control polygon) and prints both for every
segment the engine evaluates:

```bash
lldb --batch -o "command script import tools/lldb_capture_curve.py"
# ->
#   TIME poly=[0.0, 0.3333, 0.5556, 1.0] target=0.49950
#   VAL  poly=[0.0, 0.0, -14.633, -108.93] u=0.54452
#   ... (one TIME+VAL pair per segment)
```

lldb notes (why the script is shaped the way it is):
- FCP frameworks are **not signed for symbol resolution by lldb**; `BreakpointCreateByName`
  on ProChannel symbols returns 0 locations and never fires.
- The frameworks are `dlopen`'d late by python, so pending name breakpoints set
  before launch also never bind.
- **Workaround:** breakpoint our own shim symbol `oz_render_frame` (binds fine),
  `Continue` once (ProChannel is now loaded), compute `slide = __TEXT load addr −
  file addr`, then `BreakpointCreateByAddress(fileOffset + slide)`. arm64 file
  offsets: `OZBezierEval = 0x9ff00`, `OZBezierFindParameter = 0xa0184` — re-derive
  with `nm -arch arm64 ProChannel | grep OZBezier...` if FCP updates.
- arm64 ABI: first pointer arg in `x0` (the 4-double coeff array), first double in `d0`.

`tools/curve_probe.py` is the small script lldb launches; it renders a few frames of
a `.motr` at times that land in every segment. Point it elsewhere with env vars
`PROBE_MOTR` / `PROBE_TIMES`.

## 6. The decoded curve algorithm (current implementation)

`engine/src/evaluator/curves.ts` implements exactly what the captures revealed:

- **slope** `m_i` = Catmull-Rom centered difference `(v[i+1]−v[i-1])/(t[i+1]−t[i-1])`,
  **0 at the first/last keyframe** (ease from / to rest).
- **handle time** `h_i` = `½·(dt_{i-1}/3 + dt_i/3)` at interior keyframes, `dt_0/3`
  at the first, `dt_{n-2}/3` at the last. *Averaging the two adjacent third-segments*
  is what gives C¹ velocity continuity across non-uniformly spaced keyframes — this
  was the missing piece that had caused an accelerate/decelerate hump per segment.
- per segment `[i, i+1]`:
  - value control `[v_i, v_i + m_i·h_i, v_{i+1} − m_{i+1}·h_{i+1}, v_{i+1}]`
  - time control  `[t_i, t_i + h_i,     t_{i+1} − h_{i+1},        t_{i+1}]`
  - solve the time-bezier for `u` at the query time, then eval the value-bezier at `u`.

A 2-keyframe curve reduces to exact `smoothstep = 3u²−2u³`. Verified to
**0.26 px mean / 0.59 px max** against the engine (ruler-decode precision).

## 7. Generate comparison videos

`fct montage` builds a stacked GUI | headless | engine comparison video (with the
color model applied and per-frame labels) from the on-disk frames:

```bash
./fct.sh gen gui      <slug>    # ~/fct-gui-gt/<slug>/   (the truth)
./fct.sh gen headless <slug>    # ~/fct-frames/headless/<slug>/
./fct.sh gen engine   <slug>    # ~/fct-frames/engine/<slug>/
./fct.sh montage <slug>         # -> montage.mp4   (or --all for the whole board)
./fct.sh cmp a.png b.png --color-b bt709 --out diff.png   # a single-frame diff image
```

## Current status

Push: motion pixel-exact (split line within ~1 px of FCP across all frames). Against the
current FCP-GUI ground truth with the corrected time domain + color model, Push scores
**≈36.6 dB — effectively at the GT ceiling** (the ProRes-422 bt709 compression of the FCP
reference caps the achievable PSNR at ~37 dB). Remaining residual is sub-pixel edge resampling
at the A/B seam plus a 1 px white seam artifact FCP itself emits. All 65 transitions render
without crashing.

> Per-transition scores move as fixes land — do **not** trust hard-coded numbers in the docs.
> Generate live scores with `./fct.sh score --all` (or `./fct.sh score <slug> --frames`). See
> `docs/SCOREBOARD.md` for a dated snapshot and how to reproduce it.

## Interpolation types (fully decoded)

`OZInterpolatorStrategies` (jump table @0xac588 + ::C2 ctor) maps the keyframe
`interpolation="N"` attribute to an interpolator class:

| N | interpolator | formula (u = normalized segment time) |
|---|---|---|
| 0 | Constant | hold |
| 1, 18 | Linear | lerp |
| 2–5, 9–12 | Bezier | cubic Bézier using the STORED tangent handles + time reparam |
| 6 | CatmullRom | auto tangents from neighbours (see §6); 2-kf = smoothstep 3u²−2u³ |
| 7 | EaseIn | vA+(vB−vA)·(1−cos(u·π/2)) |
| 8 | EaseOut | vA+(vB−vA)·sin(u·π/2) |
| 13 | Exponential | (unused by the 65 transitions) |
| 14 | Logarithmic | (unused) |
| 15 | Ease | PCMath::easeInOut(u, 0.25, 0.25) |
| 16 | Accelerate | PCMath::easeInOut(u, 0.5, 0) |
| 17 | Decelerate | PCMath::easeInOut(u, 0, 0.5) |
| 19 | Convex / 20 Concave / 21 SCurve | (unused) |

`PCMath::easeInOut` (ProCore 0x11f14) is a constant-accel / linear / constant-decel
profile; ported in `motion-curve.ts`. Only 0,1,2,6,7,8,15,16,17 appear in the built-in
transitions; all are implemented and validated to <0.65px via ruler renders of
single-type test curves (`tools/edit_curve.py ... interp=N`).

Implementation: `engine/src/evaluator/curves.ts` (dispatch) + the standalone spec
`engine/src/evaluator/motion-curve.ts`. Tests: `test/interpolation-types.test.ts`,
`test/motion-curve.test.ts`.

## Keyframe flags (0x80 / 0x100 / 0x180)

`<keypoint flags="N">`: 0x80 = boundary/corner marker (first & last keyframe carry
it), 0x100/0x180 = locked / smooth handle editor state. VERIFIED via lldb codepath
tracing + ruler renders that these do NOT affect evaluation output (linear OR
catmull-rom) — they are UI metadata. The interpolation TYPE alone drives the math,
so the evaluator ignores them. (256/384 co-occur almost only with type 0/1 where
they can't change the shape anyway.)

## Rig-driven Link parameters (transition direction)

Push's Direction rig is implemented via two Links (LinkX/LinkY on the "Group",
driven by the hidden Color Solid position). Each Link is controlled by TWO rig
behaviors keyed on the Direction widget:
  - Custom Mix (channel ./207) — which axis is active per direction
    LinkX=[1,0,0,1] (dir 0,3 = horizontal), LinkY=[0,1,1,0] (dir 1,2 = vertical)
  - Scale (channel ./204) — the per-direction SIGN
    LinkX=[-1,1,1,1], LinkY=[1,1,-1,1]
Both must be parsed (see parseLinkBehaviors) or only one direction renders right.
STATUS: Bottom→Top is pixel-accurate; the other 3 render with correct structure
but a residual clone horizontal-offset (~10-15dB mid-transition) — WIP, see
test/push-directions.test.ts.

## Cataloging what's left

`docs/CATALOG.md` is the exhaustive inventory of every `.motr` structure, factory
type, filter (by UUID), parameter, enum, and per-transition feature — with
implementation status. Regenerate the underlying survey data anytime with:

```bash
git show c940dc3:tools/survey_catalog.py > /tmp/survey_catalog.py && ./venv/bin/python /tmp/survey_catalog.py
```

(prints factory counts, filter UUID→name map, parameter vocabulary, and the
per-transition feature matrix). Use it to pick the next highest-leverage feature.
