// OZFxFilter — Ozone FxFilter (framework: Ozone)
// Only the FilterBounds::setAll method is transcribed here so far.
// Provenance: /Applications/Final Cut Pro.app/.../Ozone
//
// FilterBounds struct layout (recovered from setAll @0x295a50):
//   +0x00 : int32[4]  intRect0  (cvttpd2dq of rect.xy | rect.wh, unpcklo)
//   +0x10 : float64[2] xy0      (copy of rect.x, rect.y)
//   +0x20 : float64[2] wh0      (copy of rect.width, rect.height)
//   +0x30 : int32[4]  intRect1  (same truncation, second copy)
//   +0x40 : float64[2] xy1
//   +0x50 : float64[2] wh1
// Total size 0x60 (96) bytes. Two doubles slots interleaved with a
// truncate-to-int packed representation, presumably one for pixel bounds
// and one for tile/coord bounds.

import type { PCRectDouble } from "../infra/PCFilterUtils";

// Truncate-toward-zero to 32-bit signed int (matches SSE cvttpd2dq
// behaviour for values within int32 range; out-of-range/NaN yield
// INT32_MIN in real hardware — we mirror that here for faithfulness).
// @0x295a5d, @0x295a61 cvttpd2dq (single-precision truncation)
function cvttpd2dq_i32(x: number): number {
  // NaN -> 0x80000000; out-of-range -> 0x80000000; else truncate toward 0
  if (Number.isNaN(x) || x < -2147483648 || x >= 2147483648) return -2147483648;
  return (x < 0 ? Math.ceil(x) : Math.floor(x)) | 0;
}

export interface OZFxFilter_FilterBounds {
  // +0x00
  intX0: number;
  intY0: number;
  intW0: number;
  intH0: number;
  // +0x10
  x0: number;
  y0: number;
  // +0x20
  w0: number;
  h0: number;
  // +0x30
  intX1: number;
  intY1: number;
  intW1: number;
  intH1: number;
  // +0x40
  x1: number;
  y1: number;
  // +0x50
  w1: number;
  h1: number;
}

/**
 * OZFxFilter::FilterBounds::setAll(PCRect<double> const&)
 * @0x0000000000295a50  Ozone
 *
 * Copies a PCRect<double> {x,y,width,height} into every slot of the
 * FilterBounds struct twice, plus a truncated-to-int32 vector copy at
 * +0x00 and +0x30.
 *
 * Disasm summary (dst = %rdi = this, src = %rsi = &rect):
 *   xmm0 = rect.xy  (2 doubles at src+0)
 *   xmm1 = rect.wh  (2 doubles at src+0x10)
 *   cvttpd2dq xmm1,xmm1                # xmm1 low 64b = (intW, intH)
 *   cvttpd2dq xmm0,xmm0                # xmm0 low 64b = (intX, intY)
 *   unpcklpd  xmm1,xmm0                # xmm0 = (intX,intY,intW,intH)
 *   movupd    xmm0,(this)              # *(int32[4]*)(this+0x00) = intRect
 *   movups    (src),xmm0
 *   movups    0x10(src),xmm1
 *   movups    xmm1,0x20(this)          # this+0x20 = wh
 *   movups    xmm0,0x10(this)          # this+0x10 = xy
 *   # …repeats truncation into +0x30 and the doubles into +0x40/+0x50
 */
export function OZFxFilter_FilterBounds_setAll(
  self: OZFxFilter_FilterBounds,
  rect: PCRectDouble,
): void {
  // Load source doubles
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.width;
  const rh = rect.height;

  // Truncated int32 rectangle (@0x295a5d..0x295a69)
  const ix = cvttpd2dq_i32(rx);
  const iy = cvttpd2dq_i32(ry);
  const iw = cvttpd2dq_i32(rw);
  const ih = cvttpd2dq_i32(rh);

  // First copy: int32[4] at +0x00, doubles at +0x10 and +0x20
  self.intX0 = ix;
  self.intY0 = iy;
  self.intW0 = iw;
  self.intH0 = ih;
  self.x0 = rx;
  self.y0 = ry;
  self.w0 = rw;
  self.h0 = rh;

  // Second copy: int32[4] at +0x30, doubles at +0x40 and +0x50
  self.intX1 = ix;
  self.intY1 = iy;
  self.intW1 = iw;
  self.intH1 = ih;
  self.x1 = rx;
  self.y1 = ry;
  self.w1 = rw;
  self.h1 = rh;
}
