// Flexo:PKStrokePoint(FFTelestration) — ObjC category on Apple's PencilKit PKStrokePoint.
// One method: ff_strokePointAtTime:scaleDuration:
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework Flexo, x86_64 slice.
//
// Method @0x5ea750 : -[PKStrokePoint(FFTelestration) ff_strokePointAtTime:(double)atTime
//                                                    scaleDuration:(double)duration]
//
// Semantics recovered from x86_64 disasm:
//   let offset = self.timeOffset
//   if (atTime >= offset + duration) return self   // past-the-end pin
//   if (atTime <  offset)            return nil    // before-the-start
//   // else: interpolation branch
//   let s = (atTime - offset) / duration * 0.6 + 0.4   // ∈ [0.4, 1.0]
//   return [[PKStrokePoint alloc]
//     initWithLocation:self.location    timeOffset:self.timeOffset
//     size:self.size                    opacity:self.opacity
//     force:self.force                  azimuth:self.azimuth
//     altitude:self.altitude            secondaryScale:self.secondaryScale * s]
//
// Only `secondaryScale` is scaled; every other field is copied verbatim from `self`.
// The scale factor `s` linearly maps t∈[offset, offset+duration] to s∈[0.4, 1.0].
//
// Constants (RIP-relative doubles inside Flexo __TEXT,__const):
//   @0x156d120 = 0.6   (mulsd, @asm 0x5ea7d3)
//   @0x156cc00 = 0.4   (addsd, @asm 0x5ea7db)
//
// Selectors (resolved via __objc_selrefs at the RIP-relative loads):
//   @0x5ea76c selref@0x1bbdcd8 -> "timeOffset"
//   @0x5ea7f7 selref@0x1bd3e00 -> "location"
//   @0x5ea81c selref@0x1bba038 -> "size"
//   @0x5ea833 selref@0x1bbf940 -> "opacity"
//   @0x5ea845 selref@0x1bd3e08 -> "force"
//   @0x5ea857 selref@0x1bd3e10 -> "azimuth"
//   @0x5ea869 selref@0x1bd3e18 -> "altitude"
//   @0x5ea87b selref@0x1bd3e20 -> "secondaryScale"
//   @0x5ea88d selref@0x1bd3e28 -> "initWithLocation:timeOffset:size:opacity:force:azimuth:altitude:secondaryScale:"
// The Apple PKStrokePoint class ref is loaded @0x5ea7e8 (OBJC_CLASS_$_PKStrokePoint) then
// [alloc] is called via _objc_alloc @0x5ea7ef, and the tail-call is _objc_autorelease @0x5ea8e1.

// PencilKit PKStrokePoint mirror — the exact field set is required by
// -initWithLocation:timeOffset:size:opacity:force:azimuth:altitude:secondaryScale:
// (Apple public API). CGPoint/CGSize are pairs of doubles.
export interface CGPoint { x: number; y: number; }
export interface CGSize  { width: number; height: number; }

export interface PKStrokePoint {
  location:       CGPoint;
  timeOffset:     number;
  size:           CGSize;
  opacity:        number;
  force:          number;
  azimuth:        number;
  altitude:       number;
  secondaryScale: number;
}

/**
 * -[PKStrokePoint(FFTelestration) ff_strokePointAtTime:scaleDuration:] @0x5ea750
 *
 * Returns a stroke point sampled at `atTime` within the window
 * [self.timeOffset, self.timeOffset + duration]:
 *   • atTime  >= offset + duration → returns `self` unchanged (pin at end)
 *   • atTime  <  offset            → returns `null` (before start)
 *   • otherwise                     → returns a new point identical to self
 *                                     but with secondaryScale scaled by
 *                                     ((atTime-offset)/duration)*0.6 + 0.4.
 *
 * Verification (arithmetic from the disasm):
 *   with offset=0, duration=1, atTime=0.5, secondaryScale=1.0:
 *     s = 0.5/1 * 0.6 + 0.4 = 0.7 → out.secondaryScale = 0.7
 *   with atTime=offset (t=0): s = 0.4 → 0.4 (start of window)
 *   with atTime=offset+duration (t=1): pin-at-end path → returns self
 *
 * @param self     the source PKStrokePoint (equivalent to ObjC receiver).
 * @param atTime   sampling time in seconds (matches -[* atTime:], double at %xmm0).
 * @param duration span of the interpolation window (matches -[* scaleDuration:], %xmm1).
 * @returns        a new PKStrokePoint, `self`, or `null` per rules above.
 */
export function ff_strokePointAtTime_scaleDuration(
  self: PKStrokePoint,
  atTime: number,
  duration: number,
): PKStrokePoint | null {
  // @0x5ea76c-77c: xmm0 = self.timeOffset + duration
  const offset = self.timeOffset;
  const endT   = offset + duration;

  // @0x5ea786-78a: ucomisd; jae 0x5ea7a5 — if atTime >= end → return self
  // NaN-ordered: jae is unordered→false, so NaN atTime falls through to the second branch.
  if (!(atTime < endT)) {
    // AT&T `ucomisd %xmm0, %xmm1` + jae is xmm1 >= xmm0 (unordered=false), i.e. atTime >= endT.
    // NaN case: comparison is unordered → jae not taken → falls through, matching the
    // ordered/unordered CF semantics of the binary (see below for the NaN fall-through path).
    return self;
  }

  // @0x5ea78c-7a1: reload offset via msgSend, then ucomisd; jae 0x5ea7b5
  //   if atTime >= offset → interpolate
  //   else                 → xor ebx,ebx; return nil
  if (!(atTime >= offset)) {
    // atTime < offset OR atTime is NaN → xor ebx,ebx path → return nil
    return null;
  }

  // Interpolate branch @0x5ea7b5.
  //   @0x5ea7c5-ce: xmm1 = (atTime - offset) / duration
  //   @0x5ea7d3:    xmm1 *= 0.6           (const @0x156d120)
  //   @0x5ea7db:    xmm1 += 0.4           (const @0x156cc00)
  // Everything is double-precision; no fround wrapping.
  const s = ((atTime - offset) / duration) * 0.6 + 0.4;

  // @0x5ea7e8-8e1: [[PKStrokePoint alloc] initWithLocation:...secondaryScale:secondaryScale*s]
  // Only secondaryScale is scaled; all other fields copy verbatim from self.
  return {
    location:       { x: self.location.x, y: self.location.y }, // arg xmm0,xmm1
    timeOffset:     self.timeOffset,                             // arg xmm2 (unchanged)
    size:           { width: self.size.width, height: self.size.height }, // xmm3,xmm4
    opacity:        self.opacity,                                // xmm5
    force:          self.force,                                  // xmm6
    azimuth:        self.azimuth,                                // xmm7
    altitude:       self.altitude,                               // [rsp+0]
    secondaryScale: self.secondaryScale * s,                     // [rsp+8]
  };
}
