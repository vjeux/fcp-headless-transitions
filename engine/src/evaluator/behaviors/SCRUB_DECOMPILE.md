# Scrub Retiming Behavior — Decompile Evidence

The **Scrub** behavior (❌ in docs/CATALOG.md) is `OZScrubRetimeBehavior`
(factory `OZScrubRetimeBehavior_Factory`). It is a **retiming** behavior: it
maps a clip's object time to a displaced SOURCE frame index, driven by an
animated **"Frame Offset"** (param id=200) channel. It is used by
Objects/Curtains (two Scrub behaviors on the `Curtains Open` / `Curtains Close`
media sub-layers) to scrub through a pre-rendered curtain movie.

## Binaries
- Behavior class: `Ozone.framework/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors`
- Core math:      `RetimingMath.framework/Versions/A/RetimingMath`

## `nm` symbols (Behaviors.ozp, arm64)
```
0007f9a4 T OZScrubRetimeBehavior::solveNode(uint, OZCurveNodeParam&)
0007f96c T OZScrubRetimeBehavior::getOffsetValue(CMTime const&)      # reads channel @+0x238 = "Frame Offset" (id 200)
0007f978 T OZScrubRetimeBehavior::getOffsetFromValue()               # reads int channel @+0x2d0, returns (==1)?1:0
        U RetimingMath::scrub(double,double,double,double, OffsetFrom)  # imported from RetimingMath.framework
```

## `OZScrubRetimeBehavior::getOffsetValue` (0x7f96c) — reads the Frame Offset channel
```
add   x0, x0, #0x238                     ; this + 0x238  == the "Frame Offset" (id=200) OZChannelDouble
movi.2d v0, #0
b     OZChannel::getValueAsDouble(CMTime const&, double)
```

## `OZScrubRetimeBehavior::getOffsetFromValue` (0x7f978)
```
add   x0, x0, #0x2d0                     ; this + 0x2d0 == the "Offset From" OZChannel (int)
bl    OZChannel::getValueAsInt(CMTime const&, double)
cmp   w0, #1
cset  w0, eq                             ; return (channel == 1) ? 1 : 0
```

## `OZScrubRetimeBehavior::solveNode` (0x7f9a4) — per-sample loop
Per output sample the behavior computes:
```
getFrameDuration()                       ; frame duration
getOffsetFrames()  -> v8                 ; OZRetimingBehavior base: window START in frames
getEndFrames()     -> v9                 ; OZRetimingBehavior base: window END   in frames
getValueAsInt(kCMTimeZero) == 1 -> w21   ; OffsetFrom (0 or 1)
figToFrames(sampleTime) -> v10           ; the clip's own object time in frames
getValueAsDouble(@+0x238) -> v3          ; the animated "Frame Offset" value
RetimingMath::scrub(v10, v8, v9, v3, w21) ; -> scrubbed input frame
objectTimeToInputIndex(...)              ; map scrubbed frame -> index into the input spline buffer
d0 = inputValues[index]; store to output ; sample the source at the scrubbed frame
```

## `RetimingMath::scrub(d0,d1,d2,d3, w0)` (RetimingMath.arm64 @ 0x5c68) — THE FORMULA
9 instructions, verbatim:
```
0x5c68  fcmp   d0, d1                 ; objectFrame(d0) vs offsetFrames(d1)
0x5c6c  fccmp  d0, d2, #0, pl         ; if (d0 >= d1) also compare d0 vs endFrames(d2)
0x5c70  b.pl   0x5c90                 ; if (d0 >= d1 && d0 >= d2) -> ret d0 (play through)
0x5c74  cmp    w0, #1
0x5c78  b.eq   0x5c8c                 ; OffsetFrom == 1 -> d1 + d3  (offsetFrames + frameOffset)
0x5c7c  fadd   d1, d0, d3             ; tmp = objectFrame + frameOffset
0x5c80  cmp    w0, #0
0x5c84  fcsel  d0, d0, d1, ne         ; w0 != 0 -> d0 (unchanged); w0 == 0 -> tmp
0x5c88  ret
0x5c8c  fadd   d0, d1, d3             ; ret offsetFrames + frameOffset
0x5c90  ret                          ; ret objectFrame
```

### Decoded
```
scrub(objectFrame, offsetFrames, endFrames, frameOffset, offsetFrom):
  if (objectFrame >= offsetFrames && objectFrame >= endFrames): return objectFrame   # past window
  if (offsetFrom == 1): return offsetFrames + frameOffset                            # from START
  if (offsetFrom == 0): return objectFrame  + frameOffset                            # from CURRENT
  return objectFrame                                                                 # other -> unchanged
```
Implemented verbatim in `evaluateScrub()` (index.ts); unit-tested in test/behaviors.test.ts.

## Note on Objects/Curtains reproduction
Curtains' Scrub behaviors retime the media clip `Media/Sequence 3.mov` (a
96-frame pre-rendered curtain graphic). That `.mov` is **absent** from the
template (`Media/` is empty). The headless FCP GT therefore renders a static
missing-media checkerboard placeholder (frame 0 == frame 23, byte-identical),
so Curtains cannot be reproduced pixel-accurately regardless of the Scrub
implementation — the visual is entirely the missing asset.
