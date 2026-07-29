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

import type { PCRectDouble, PCRectInt } from "../infra/PCFilterUtils";

// FxImage boundary. The exact ObjC selector invoked by setOutputImageDOD is
// resolved at runtime through the ObjC selref table at VA 0x90f931 (`.got`
// slot loaded @0x29a155). We surface it as an extern boundary — the actual
// message body lives in FxPlug/Motion's Objective-C runtime, not in Ozone.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FxImage_objcMsgSend_setDOD(
  image: unknown,
  packedOriginXY: bigint,
  packedSizeWH: bigint,
  aspect: number,
): void {
  throw new Error(
    "FxImage objc_msgSend (selector selref @Ozone 0x90f931) extern boundary @0x29a15d — " +
      "not yet transcribed (ObjC runtime dispatch out-of-framework)",
  );
}

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

/**
 * OZFxFilter::setOutputImageDOD(PCRect<int> const&, double, FxImage*)
 * @0x000000000029a120  Ozone
 *
 * Computes a symmetric (origin-centered) integer rectangle from the input
 * PCRect<int>'s width/height and forwards it as a Domain-of-Definition
 * message to the FxImage* via the ObjC runtime. The `self` OZFxFilter is
 * NOT used — the disasm's very first non-prologue instruction is
 * `movq %rdx, %rdi`, i.e. the FxImage* argument replaces `this` as the
 * ObjC message receiver, and this function is essentially a tail thunk.
 *
 * Disasm summary (@0x29a120):
 *   movq  %rdx, %rdi                # receiver = FxImage*
 *   movl  0x8(%rsi), %eax            # eax  = w = rect.width
 *   movl  0xc(%rsi), %ecx            # ecx  = h = rect.height
 *   movl  %eax, %esi                 # esi  = w
 *   shrl  $0x1f, %esi                # esi  = (unsigned)w >> 31 (sign)
 *   addl  %eax, %esi                 # esi  = w + sign(w)
 *   sarl  %esi                       # esi >>= 1  (arith)  = w/2 trunc→0
 *   subl  %esi, %eax                 # eax  = w - w/2 = ceil(w/2)
 *   negl  %esi                       # esi  = -floor(w/2)
 *   …same 4-instr sequence for h in %ecx/%edx…
 *   shlq  $0x20, %rdx ; orq %rsi,%rdx  # rdx = (h_neg<<32) | (w_neg & 0xffffffff)
 *   shlq  $0x20, %rcx ; orq %rax,%rcx  # rcx = (h_pos<<32) | (w_pos & 0xffffffff)
 *   movq  0x6757d4(%rip), %rsi        # sel = selref @VA 0x90f931 (__objc_selrefs)
 *   jmpq  *0x58bec5(%rip)             # tail-call objc_msgSend @VA 0x82602a
 *
 * The integer-halving idiom `x + (unsigned)x>>31, arith >>= 1` is C
 * signed-divide-by-2 (rounded toward zero). So:
 *   floor(w/2) := trunc(w/2)   ; ceil(w/2) := w - trunc(w/2)
 * The packed message payload is two int32 pairs interpreted by the
 * ObjC callee as a rect ⟨originX, originY, sizeW, sizeH⟩ =
 * ⟨-floor(w/2), -floor(h/2), ceil(w/2), ceil(h/2)⟩, i.e. a rectangle
 * centered on the origin whose extents recover the full input w×h.
 * `aspect` (xmm0) is passed through unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OZFxFilter_setOutputImageDOD(
  _self: unknown,
  rect: PCRectInt,
  aspect: number,
  image: unknown,
): void {
  // 32-bit signed C division-by-two truncating toward zero (matches the
  // `mov;shr $0x1f;add;sar` idiom @0x29a12d-0x29a136 / 0x29a13a-0x29a143).
  const w = rect.width | 0;
  const h = rect.height | 0;

  const wHalfTrunc = ((w + ((w >>> 31) & 1)) >> 1) | 0; // = trunc(w/2)
  const hHalfTrunc = ((h + ((h >>> 31) & 1)) >> 1) | 0; // = trunc(h/2)

  const originXi = -wHalfTrunc | 0; //  esi after negl @0x29a138
  const originYi = -hHalfTrunc | 0; //  edx after negl @0x29a145
  const sizeWi = (w - wHalfTrunc) | 0; //  eax after subl @0x29a136
  const sizeHi = (h - hHalfTrunc) | 0; //  ecx after subl @0x29a143

  // Pack as the CPU did (@0x29a147-0x29a152). Registers hold:
  //   rdx = (hi=originY, lo=originX)   ; message arg #3 (%rdx)
  //   rcx = (hi=sizeH,   lo=sizeW)     ; message arg #4 (%rcx)
  // int32 sign-extended into the low half of the 64-bit register, then the
  // high 32b overwrites via `shl 32; or`. We reproduce the exact bit
  // pattern so downstream ObjC parsing matches.
  const mask32 = 0xffffffffn;
  const packedOriginXY =
    (BigInt(originYi) << 32n) | (BigInt(originXi) & mask32);
  const packedSizeWH =
    (BigInt(sizeHi) << 32n) | (BigInt(sizeWi) & mask32);

  // Tail-call the ObjC message. This is an out-of-framework boundary
  // (Objective-C runtime dispatch through __objc_selrefs @0x90f931 and
  // the __got objc_msgSend stub @0x82602a).
  FxImage_objcMsgSend_setDOD(image, packedOriginXY, packedSizeWH, aspect);
}
