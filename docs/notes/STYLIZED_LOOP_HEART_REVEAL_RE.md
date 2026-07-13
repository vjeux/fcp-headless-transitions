# Stylized/Loop + Heart — the "stalled B-reveal" root cause (media Image-Mask reveal)

**One-line:** Loop/Heart render a STATIC Transition A for the whole transition (B never
reveals) because a decorative **ornament media layer times out early and is mistaken for
the scene retime-wrap**, collapsing the second half to frame 0 — AND the media Image-Mask
reveal path has two latent bugs (channel + disabled-geometry). Fixing the wrap alone makes
the reveal FIRE but with WRONG TIMING (reveals B far too early), so it regresses the raw
GUI-GT score. The reveal-TIMING is the remaining lever.

Repo one-truth: score only vs `~/fct-gui-gt` via `fct score`. All frame refs below are the
24-frame GUI GT.

## The transition (decoded from Loop.motr / Heart.motr)

Loop's reveal is NOT a vector wipe and NOT the gradient-tag ornament (that decode — see
`GRADIENT_TAG_COLOUR_LINK_RE.md` — is a small STROKE decoration, not the reveal). The
mechanism:

```
group "Transition loop" (845197414)
  shape "Color link 1/2"            hidden colour drivers (gradient-tag → the swoosh stroke)
  group "Group" (989904888)
    image "Loop"  (989849118)       loop-curl art (Media/Loop1.png)
    image "shape" (989870212)       ENABLED=false, source=Media/shape.png  ← IMAGE-MASK SOURCE
  group "Ornament" (845136458)
    group "ornaments for mask"
      image "arc"   (989877695)     Media/arc.png   + child <mask "Bezier Mask">   out=0.60s
      image "arc 3" (989889411)     Media/arc 3.png + child <mask "Bezier Mask 1"> out=0.63s
    shape "Gradient" (845136459)    the cream→olive gradient-tag swoosh stroke
  group "Transition B Drop Zone" (1126604)   timing in=0.634 out=3.704
    image "Transition B" (1126605)  + child <mask "Image Mask" factoryID=1>
                                    Image Mask → Mask Source = 989870212 ("shape")
  image "Transition A" (988897394)  the base, out=1.902s
```

- **Transition B is clipped by an Image Mask whose Mask Source is the DISABLED image
  "shape"** (989870212), whose media is `Media/shape.png` — a **teardrop matte**: a black
  teardrop at alpha=255 on a fully TRANSPARENT (alpha=0, RGB=255) field. The teardrop is
  ~full-frame (1639×915) and drifts/animates via a Retime Value curve (-11→94).
- B composites OVER A through that teardrop matte → the "loop reveal". The "Gradient" shape
  draws the cream stroke swoosh on the loop's edge (gradient-tag colour-Link driven).

## Why the engine froze on A (three stacked bugs)

### BUG 1 (dominant) — retime-wrap driven by an ORNAMENT, collapses time to 0
`buildTimeMap` computes `wrapSec` = the min `timing.out` over layers with
`retimingExtrapolation===1` (the point past which drop zones wrap back to frame 0). Loop's
smallest such `out` is the **"arc" ornament at 0.60s** — a decorative masked arc image, NOT
the outgoing content. So `wrapSec=0.60` and `remap(t>0.6)=0`: every frame past f2 evaluates
at time 0 → B's group is before its `in` (0.634s) → invisible → the render walk skips it
(`renderLayer: if(!evalLayer.visible) return`) → only Transition A draws → **static sepia A
for f2–f23** (≈9.9 dB frozen). Verified: `wrapSec` candidates are arc 0.60 / arc3 0.63 /
TransA 1.90 / TransB 3.70 / shape 4.10 / Loop 3.70.

FIX (correct, but see BUG-timing): the wrap marks when the OUTGOING TRANSITION CONTENT (the
A/B **drop zones**, source.type=transitionA/transitionB) runs out. A BUNDLED-MEDIA leaf
(source.type='media' — arc/arc3/shape/Loop PNGs) is an ornament/matte, not outgoing content,
and must be EXCLUDED from the wrap-min. With media excluded, wrapSec=1.902 (Transition A).

### BUG 2 — Image-Mask media channel used luma×alpha (=0 everywhere for an alpha matte)
`resolveImageMaskAlpha`'s media branch computed `alpha = luma601(rgb) * (a/255)`. For the
teardrop matte: INSIDE = luma(0)×a(1) = 0; OUTSIDE = luma(255)×a(0) = 0 → **mask 0 everywhere**
→ B never revealed even if reached. The matte is defined by the ALPHA channel (opaque
teardrop on transparent field), not luma. FIX: decide the channel once from the source's
alpha — if a meaningful fraction of pixels are (near-)transparent the matte is a SHAPE-BY-
ALPHA cutout → use ALPHA; else it's an opaque LUMA matte (Veil's wipe .mov) → keep luma.

### BUG 3 — mask-source shape collection gated on `el.visible` (excludes disabled geometry)
The vector-shape walk in `resolveImageMaskAlpha` required `el.visible`, but a mask-geometry
shape is routinely `enabled=false` (hidden from direct render, exists only as matte). FIX:
admit a shape/clone mask source when `el.visible || (enabled===false && within timing window)`.
(For Loop the mask source is an IMAGE not a vector shape, so this is latent here — it matters
for disabled VECTOR mask sources; kept because it is correct Motion semantics and gate-neutral.)

## The REMAINING lever — reveal TIMING (why the wrap fix alone regresses)

With BUG 1 fixed (wrapSec=1.902), the reveal FIRES and looks structurally right (teardrop of
blue B over sepia A + cream swoosh — matches GT's composition). BUT the raw score DROPS
12.82→11.09 because the **reveal timing is wrong**:

- **GT f6** (t≈1.39s) is almost entirely sepia A with only a THIN blue-grey ARC STROKE — the
  loop OUTLINE is being drawn on; B has barely started to fill.
- **Engine f6** shows B ALREADY filling most of the teardrop — the media matte is treated as
  fully-present from its `in`, so B reveals FAR too early.
- **Tail (f9–f23):** wrapping at 1.902s snaps to pure A, but GT holds the COMPLETED reveal
  (full B). So Loop needs the **CLAMP** treatment (hold end-of-reveal), like `strokedMaskShape`
  — NOT a wrap-to-A.

So the correct model is: the reveal is a **stroke-then-fill** that draws progressively (the
"arc"/Bezier-mask ornaments draw the outline; the teardrop matte fills behind on the shape's
Retime/opacity ramp), and the tail CLAMPS on completed B. The teardrop matte must be gated by
the reveal PROGRESS (the shape's Retime -11→94 and/or the arc stroke write-on), not shown full
from its `in`. That progressive-reveal + clamp is the next tick's work; it is more than one
safe chunk and must be built against GUI GT frame-by-frame (f0 none → mid arc-stroke → fill →
completed-hold), gate-green.

## 2026-07-13c — REFINED reveal mechanism (frame-by-frame GT + Media asset decode)

Traced Loop's GUI GT f0→f23 and decoded the four bundled Media/ PNGs. The mechanism is a
**layered progressive UNCOVER of a STATIC full-frame teardrop**, NOT a growing/scaling matte and
NOT a sprite sequence. Kill both earlier guesses:

- **shape.png** (1639×915) is the reveal matte: a near-FULL-FRAME teardrop — opaque (alpha=255)
  bbox is 1618×913 (68% of the canvas). It is a SINGLE static image; there is no numbered
  sequence in Media/ and it is not a sprite sheet, so the Retime Value on "shape" (−11→94) does
  NOT index matte frames. The teardrop does not scale: "shape", its parent "Group", and
  "Ornament" all hold Scale=1.0 for the whole transition (verified via evaluated world
  transforms). ⇒ the GT "growing eye" is the full-size teardrop being progressively UNCOVERED,
  not a matte that grows.
- **Loop1.png** (1833×977, only 9% opaque) is the thin loop-curl STROKE art. **arc.png /
  arc 3.png** are the write-on ARC ornaments (each carries a Bezier Mask + a Retime that sweeps
  the arc on). **"Gradient"** (vector shape, id 845136459) is the grey gradient STROKE swoosh
  drawn on the loop edge (gradient-tag colour-Link driven; stroke offsets NOT parsed onto it —
  `stroke: none` — so the write-on comes from the arc/Bezier ornaments' Retime, not a stroke
  firstPoint/lastPoint offset).

GT stages (endSec≈5.54, 24 frames):
- **f0–f8**  pure sepia A; the grey STROKE writes on from top-left, sweeping AROUND the loop
  until the eye/leaf outline is FULLY CLOSED by ~f8. **B is totally absent through f8** (verified
  f8: complete grey eye outline, whole frame still sepia A — no B fill anywhere).
- **f8–f16** B FILLS/cross-fades in INSIDE the closed eye outline (A→B); the eye grows.
- **f16**    large eye of B bounded by the thick grey stroke; frame CORNERS still sepia A (~80%).
- **f23**    full clean B; only a sliver of stroke remains bottom-left.

So the reveal = (static full-frame teardrop matte) × (an animating UNCOVER front driven by the
arc/Bezier-mask ornaments' Retime write-on) × (a B-over-A CROSS-FADE that begins ONLY AFTER the
stroke outline CLOSES ~f8), and the TAIL holds completed B (clamp, not wrap-to-A). CRITICAL: the
B fill is gated on STROKE-WRITE-ON COMPLETION (~f8), NOT the mask-source Opacity ramp (which
completes f0→f6) and NOT the Retime progress (linear from f0) — both start B ~4 frames too early.

### Why this is deferred (not landable as one safe tick)
Reproducing it needs, together: (a) the media-from-wrap exclusion (BUG 1); (b) a CLAMP tail that
holds completed B; (c) the media Image-Mask sampled through the mask-source **world transform**
(and, critically, an UNCOVER front from the arc/Bezier ornaments — the teardrop must not appear
whole from its `in`); (d) the B-over-A cross-fade gated by the offset-corrected opacity ramp.
The uncover-front geometry (how the arc ornaments' Retime sweeps the reveal open over the static
teardrop) is the unresolved core and needs its own focused RE against GT. Shipping any subset
alone reveals B too early / with a wrong tail and REGRESSES the raw GUI-GT score (measured:
12.82→11.09). Per the gate rule this stays a dedicated multi-step item; the RE-correct,
gate-neutral prerequisites (media-mask ALPHA channel + disabled-geometry admit) already landed
(a7ec75f) so the future implementation starts from a working matte path.

### 2026-07-13c — MEASURED per-frame decomposition (isolates the exact missing piece)
Built the full combined change (media-from-wrap exclusion + media-mask CLAMP tail + a B-over-A
cross-fade gated by the mask-source's offset-corrected Opacity ramp) and measured Loop per-frame
vs GT (then reverted — net regression, gate rule):

```
frame   baseline(frozen-A)   with-change   GT content
f00     18.2                 18.2          pure sepia A            (match)
f03-08  ~17                  11.0-11.4     pure sepia A + stroke   ← BIG LOSS (-6): B revealed too early
f10-15  16→11                12.2-13.5     A/B blend → mostly B    ≈ neutral / slight win
f16-23  9.9  (frozen A)      12.9-13.0     completed full B        ← BIG WIN (+3): clamp holds B
mean    12.82                12.18         —                       net −0.64 (early loss > tail win)
```

Two independent conclusions, each actionable:
1. **The CLAMP tail is a clear win in isolation** (+3 dB on f16–23: 9.9→13.0). The completed-B
   hold is correct; the media-from-wrap exclusion + media-mask clamp are the right tail model.
2. **The early frames are the ONLY thing blocking a net win.** B must stay ~invisible until the
   loop stroke CLOSES (~f10) — neither the mask-source Opacity ramp (offset-corrected: fade
   0→1 over f0→f6) NOR the "shape" Retime-normalized progress (0.11 at f0, linear) delays the
   fade far enough; both start B ~4 frames too early. The correct gate is the **arc/Bezier-mask
   ornament WRITE-ON** (the stroke drawing around the loop), which completes ~f10 and only then
   lets B fill. That write-on is `arc`/`arc 3` (Retime 5→12 / 2→21, each with a Bezier Mask) +
   Loop1.png — modelling it is the unresolved core.

⇒ Next implementation: RE the arc/Bezier write-on front (how the ornaments' Retime sweeps the
reveal open), gate the B cross-fade on write-on completion, keep the clamp tail. Then the tail
win is retained AND the early frames match GT's pure-A → net positive. Gate-verify frame-by-frame.

## What landed vs deferred (2026-07-13)
- LANDED (gate-neutral, RE-correct prerequisites): BUG 2 (media-mask ALPHA channel) + BUG 3
  (disabled mask-geometry admit) in `compositor/masks.ts`. Latent until the reveal path is
  reached, but correct and needed by the reveal.
- DEFERRED (regresses raw score without the timing model): BUG 1 wrap fix (exclude bundled
  media from wrap-min) — reverted. It is CORRECT but must land TOGETHER with the progressive
  reveal-timing + clamp so the tail holds completed B instead of wrapping to A. Without the
  timing model it reveals B too early (12.82→11.09).
- Gradient-tag DATA PIPELINE (types/parser/color-links) already landed (de070ba) and feeds the
  swoosh stroke colour; the swoosh renders via the shape branch once the reveal composites.
