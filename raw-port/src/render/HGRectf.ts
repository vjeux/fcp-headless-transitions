// HGRectf.ts — Helium's float32 rectangle class methods.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGRectf.Init.s      @0x107220
//   raw-port/re/disasm/Helium.HGRectf.Translate.s @0x107840
//   raw-port/re/disasm/Helium.HGRectf.Scale.s     @0x107880
//
// Struct layout (recovered from stores in Init @0x10724d = movups xmm1, (rdi)
//   which lays 4 packed float32s at +0..+0xf; corroborated by Scale's
//   +0x0/+0x4/+0x8/+0xc accessors):
//     struct HGRectf {   // 16 bytes total
//       float x;         // +0x00
//       float y;         // +0x04
//       float right;     // +0x08 (exclusive corner)
//       float bottom;    // +0x0c (exclusive corner)
//     };
// This is the float sibling of HGRect (int32 corner-form; see HGRect.ts).
// The HGRectf interface is DECLARED in HGRect.ts — imported here so the two
// files stay 1:1 with the FCP class boundary while sharing the type.

import type { HGRectf } from "./HGRect.js";

// Single-precision helper matching x86 SSE semantics.
const f32 = Math.fround;

// SSE cmpunordps / cmpunordss / ucomiss NaN detection helper.
function isNaN32(v: number): boolean { return Number.isNaN(v); }

// ---------------------------------------------------------------------------
// HGRectf::Init(float x0, float y0, float x1, float y1)   @Helium 0x107220
//
//   0x107224  insertps $0x10, xmm1, xmm0     ; xmm0 = (x0, y0, _, _)
//   0x10722a  insertps $0x10, xmm3, xmm2     ; xmm2 = (x1, y1, _, _)
//   0x107230  movaps  xmm2, xmm1
//   0x107233  minps   xmm0, xmm1             ; xmm1 = per-lane min(P1, P0)
//   0x107236  movaps  xmm2, xmm3
//   0x107239  maxps   xmm0, xmm3             ; xmm3 = per-lane max(P1, P0)
//   0x10723c  cmpunordps xmm0, xmm0          ; NaN mask over lanes of P0=(x0,y0)
//   0x107240  blendvps xmm0, xmm2, xmm1      ; wherever P0 lane is NaN,
//                                              overwrite min lane with P1 lane
//   0x107245  blendvps xmm0, xmm2, xmm3      ; ...same for max lane
//   0x10724a  movlhps xmm3, xmm1             ; xmm1 = (min.x, min.y, max.x, max.y)
//   0x10724d  movups  xmm1, (rdi)            ; store into *this
//
//   Semantics: normalises the two arbitrary corners (x0,y0) and (x1,y1) into
//   (min, max), and if the FIRST corner has a NaN component that component
//   collapses to the SECOND corner (identical NaN-handling to HGRectMake4f
//   @0x107d50, which is documented in HGRect.ts). This is Init, so the caller
//   allocated `*this` and we fill all four floats.
// ---------------------------------------------------------------------------
export function HGRectfInit(x0: number, y0: number, x1: number, y1: number): HGRectf {
  const fx0 = f32(x0), fy0 = f32(y0), fx1 = f32(x1), fy1 = f32(y1);

  // Per-lane min/max (packed). blendvps replaces the min AND the max in the
  // lane where xmm0 (=P0) is NaN with xmm2 (=P1) — collapsing to P1 in both.
  // NaN in xmm2 (P1) propagates through min/max naturally per SSE (unordered
  // -> second operand of minps/maxps wins), but for min the "second" is xmm0
  // in the encoding `minps xmm0, xmm1` (Intel syntax dest=xmm1, src=xmm0),
  // so a NaN in P1 lane leaves min = P0 lane, and max = P0 lane.
  let minX: number, maxX: number;
  if (isNaN32(fx0)) { minX = fx1; maxX = fx1; }        // NaN mask -> both = P1
  else              {
    // minps xmm0(=P0), xmm1(=P1): AT&T dest = xmm1 (P1) becomes min of P1,P0;
    // Intel: minps xmm1, xmm0 → xmm1 = min(xmm1, xmm0). If xmm0 (P0) is NaN
    // we already handled it above; if xmm1 (P1) is NaN, minps returns xmm0.
    minX = isNaN32(fx1) ? fx0 : f32(Math.min(fx1, fx0));
    maxX = isNaN32(fx1) ? fx0 : f32(Math.max(fx1, fx0));
  }

  let minY: number, maxY: number;
  if (isNaN32(fy0)) { minY = fy1; maxY = fy1; }
  else              {
    minY = isNaN32(fy1) ? fy0 : f32(Math.min(fy1, fy0));
    maxY = isNaN32(fy1) ? fy0 : f32(Math.max(fy1, fy0));
  }

  return { x: minX, y: minY, right: maxX, bottom: maxY };
}

// ---------------------------------------------------------------------------
// HGRectf::Translate(float dx, float dy)   @Helium 0x107840
//
//   0x107844  insertps $0x10, xmm1, xmm0    ; xmm0 = (dx, dy, _, _)
//   0x10784a  movsd    (%rdi),   xmm1        ; xmm1 lo qword = (x, y)
//   0x10784e  movsd    0x8(%rdi),xmm2        ; xmm2 lo qword = (right, bottom)
//   0x107853  addps    xmm0, xmm1            ; xmm1 = (x+dx, y+dy, _, _)
//   0x107856  addps    xmm0, xmm2            ; xmm2 = (r+dx, b+dy, _, _)
//   0x107859  movaps   xmm2, xmm3
//   0x10785c  minps    xmm1, xmm3            ; xmm3 = per-lane min(lo, hi)
//   0x10785f  movaps   xmm2, xmm4
//   0x107862  maxps    xmm1, xmm4            ; xmm4 = per-lane max(lo, hi)
//   0x107865  cmpunordps xmm1, xmm1          ; NaN mask over LO lanes
//   0x107869  movaps   xmm1, xmm0
//   0x10786c  blendvps xmm0, xmm2, xmm3      ; NaN lane of lo -> take hi value
//   0x107871  blendvps xmm0, xmm2, xmm4      ; ...same for max
//   0x107876  movlhps  xmm4, xmm3            ; xmm3 = (minX, minY, maxX, maxY)
//   0x107879  movups   xmm3, (%rdi)          ; store *this
//
//   Semantics: add (dx, dy) to BOTH corners, then re-normalise so x<=right and
//   y<=bottom. That's a no-op re-normalisation for finite inputs (translation
//   preserves order); its purpose is exactly the NaN-collapse behaviour: if the
//   pre-existing lo corner was NaN, the corner "snaps" to the (finite) hi.
// ---------------------------------------------------------------------------
export function HGRectfTranslate(r: HGRectf, dx: number, dy: number): HGRectf {
  const fdx = f32(dx), fdy = f32(dy);

  // lo lane   xmm1 = (x+dx, y+dy)
  const loX = f32(f32(r.x) + fdx);
  const loY = f32(f32(r.y) + fdy);
  // hi lane   xmm2 = (right+dx, bottom+dy)
  const hiX = f32(f32(r.right)  + fdx);
  const hiY = f32(f32(r.bottom) + fdy);

  // Per-lane min/max with NaN-in-lo mask collapsing to hi. Encoding is
  // `minps xmm1(=lo), xmm3(=hi copy of xmm2)` at 0x10785c, i.e. Intel
  // `minps xmm3, xmm1` -> xmm3 = min(xmm3, xmm1) = min(hi, lo). If lo is NaN
  // the blendvps at 0x10786c overwrites it with xmm2 (hi). If hi is NaN,
  // minps/maxps semantics leave the destination (xmm3 = hi) = xmm1 (lo).
  let minX: number, maxX: number;
  if (isNaN32(loX)) { minX = hiX; maxX = hiX; }
  else              {
    minX = isNaN32(hiX) ? loX : f32(Math.min(hiX, loX));
    maxX = isNaN32(hiX) ? loX : f32(Math.max(hiX, loX));
  }

  let minY: number, maxY: number;
  if (isNaN32(loY)) { minY = hiY; maxY = hiY; }
  else              {
    minY = isNaN32(hiY) ? loY : f32(Math.min(hiY, loY));
    maxY = isNaN32(hiY) ? loY : f32(Math.max(hiY, loY));
  }

  return { x: minX, y: minY, right: maxX, bottom: maxY };
}

// ---------------------------------------------------------------------------
// HGRectf::Scale(float sx, float sy)   @Helium 0x107880
//
//   Compares each scale factor to 0 with `xorps xmm0,xmm0 / ucomiss` and
//   picks which corner-lane value to feed the min/max as (the "smaller-after-
//   scale") one, then re-normalises with NaN collapse. Because negative sx
//   swaps the ordering of x vs right, the code multiplies whichever end is
//   guaranteed to end up smaller by sx first.
//
//   x-axis @0x107884-0x1078d8:
//     ucomiss sx, 0 ; jbe if 0 >= sx  (i.e. sx <= 0)
//     sx > 0:
//       xmm0 = right * sx           ; @0x107894  ("hi candidate")
//       xmm2 = x     * sx           ; @0x107898  ("lo candidate")
//     sx <= 0:
//       xmm0 = x     * sx           ; @0x1078aa  ("hi candidate" after sign flip)
//       xmm2 = right * sx           ; @0x1078ae  ("lo candidate" after sign flip)
//     Then:
//       xmm3 = maxss(xmm0, xmm2) via optional maxss @0x1078be  (skipped iff xmm0
//                                  NaN — jp/jnp @0x1078a2/b9)
//       xmm4 = minss(xmm0, xmm2) via minss + NaN blend @0x1078cb-0x1078d4
//     Result: new x = xmm4 (min), new right = xmm3 (max).
//     (If sx>0, xmm0=right*sx>=xmm2=x*sx  -> min=x*sx, max=right*sx. ✓
//      If sx<=0, xmm0=x*sx>=xmm2=right*sx -> min=right*sx, max=x*sx. ✓
//     — the min/max normalisation absorbs the axis flip.)
//
//   y-axis @0x1078d9-0x107924  (same shape, factors swapped by sy sign):
//     ucomiss sy, 0 (from @0x1078c5 ; jbe @0x1078d9)
//     sy > 0:
//       xmm2 = bottom * sy          ; @0x1078e0  ("hi candidate")
//       xmm1 = y      * sy          ; @0x1078e4  ("lo candidate")
//     sy <= 0:
//       xmm2 = y      * sy          ; @0x1078f0
//       xmm1 = bottom * sy          ; @0x1078f4
//     Then:
//       xmm4 = minss(xmm1, xmm2) with NaN(xmm2)->xmm1 blend @0x107900-0x10790c
//       xmm1 = maxss(xmm2, xmm1) (skipped iff xmm2 NaN — jp @0x10791e)
//     Store: y=xmm4, bottom=xmm1.
//
//   Stores:
//     0x1078f9 movss xmm4, (rdi)      x       = min-along-x
//     0x107911 movss xmm3, 0x8(rdi)   right   = max-along-x
//     0x107916 movss xmm4, 0x4(rdi)   y       = min-along-y
//     0x107924 movss xmm1, 0xc(rdi)   bottom  = max-along-y
//
//   NOTE on NaN skips: the port models the C++ semantics: when the "hi
//   candidate" is NaN (xmm0 for x, xmm2 for y), the `maxss` step is SKIPPED
//   and the pre-set `xmm3 = xmm2 (lo candidate)` / `xmm1 = xmm1 (lo cand.)`
//   value is stored as the max. The min step already always runs (with its
//   own NaN blend replacing the min with the "lo candidate" when NaN).
// ---------------------------------------------------------------------------
export function HGRectfScale(r: HGRectf, sx: number, sy: number): HGRectf {
  const fsx = f32(sx), fsy = f32(sy);
  const fx = f32(r.x), fy = f32(r.y), frt = f32(r.right), fbt = f32(r.bottom);

  // -------- x-axis --------
  // ucomiss sx, 0 ; jbe -> 0 >= sx.
  // jbe triggers when CF=1 or ZF=1. After `ucomiss xmm2(=sx), xmm0(=0)`:
  //   CF=1 iff sx < 0; ZF=1 iff sx == 0 (or unordered).
  // So we take the sx<=0 branch when (sx <= 0) OR NaN(sx).
  let xmm0_x: number, xmm2_x: number;
  if (!(fsx > 0)) {                       // sx <= 0 OR NaN -> "jbe" branch
    xmm0_x = f32(fx  * fsx);              // hi candidate
    xmm2_x = f32(frt * fsx);              // lo candidate
  } else {                                 // sx > 0 -> fallthrough
    xmm0_x = f32(frt * fsx);              // hi candidate
    xmm2_x = f32(fx  * fsx);              // lo candidate
  }

  // xmm3 = max-candidate. Starts as xmm2 (lo cand); if xmm0 is not NaN,
  // apply maxss(xmm0, xmm2). Concretely: `movaps xmm2, xmm3; maxss xmm0, xmm3`
  // -> xmm3 = maxss(xmm3, xmm0) = max(xmm2, xmm0), with NaN(xmm0) leaving
  // xmm3 = xmm2. But at 0x1078a4 the sx>0 path takes an unconditional jmp
  // to 0x1078c2 when xmm0 is NaN, SKIPPING the maxss entirely — xmm3 keeps
  // its initial xmm2 value. Same effect either way.
  let xmm3_x: number;
  if (isNaN32(xmm0_x)) {
    xmm3_x = xmm2_x;                       // skip maxss
  } else {
    // maxss semantics: if xmm2 is NaN, result = xmm0 (second operand wins).
    xmm3_x = isNaN32(xmm2_x) ? xmm0_x : f32(Math.max(xmm2_x, xmm0_x));
  }

  // xmm4 = min-candidate. `movaps xmm2, xmm4; minss xmm0, xmm4` -> xmm4 =
  // minss(xmm4, xmm0) = min(xmm2, xmm0). Then cmpunordss xmm0 -> mask, and
  // blendvps xmm0, xmm2, xmm4 replaces the lane with xmm2 (lo cand) when
  // xmm0 was NaN. So the final xmm4 is: NaN(xmm0)? xmm2 : min(xmm2, xmm0).
  let xmm4_x: number;
  if (isNaN32(xmm0_x)) {
    xmm4_x = xmm2_x;
  } else {
    xmm4_x = isNaN32(xmm2_x) ? xmm0_x : f32(Math.min(xmm2_x, xmm0_x));
  }

  const outX     = xmm4_x;   // 0x1078f9 movss xmm4, (rdi)
  const outRight = xmm3_x;   // 0x107911 movss xmm3, 0x8(rdi)

  // -------- y-axis --------
  // ucomiss sy, 0 (xmm4=0 at 0x1078c2) ; jbe @0x1078d9 -> sy <= 0 branch.
  let xmm2_y: number, xmm1_y: number;
  if (!(fsy > 0)) {                       // sy <= 0 OR NaN
    xmm2_y = f32(fy  * fsy);
    xmm1_y = f32(fbt * fsy);
  } else {                                 // sy > 0
    xmm2_y = f32(fbt * fsy);
    xmm1_y = f32(fy  * fsy);
  }

  // xmm4 = minss(xmm1, xmm2) with NaN(xmm2)->xmm1 blend.
  // `movaps xmm1, xmm4; minss xmm2, xmm4` -> xmm4 = min(xmm1, xmm2).
  // cmpunordss xmm2 -> mask; blendvps xmm0, xmm1, xmm4 -> if xmm2 NaN
  // replace with xmm1. minss semantics: NaN(xmm1) leaves result = xmm2.
  let minY: number;
  if (isNaN32(xmm2_y)) {
    minY = xmm1_y;
  } else {
    minY = isNaN32(xmm1_y) ? xmm2_y : f32(Math.min(xmm1_y, xmm2_y));
  }

  // maxss step is SKIPPED when xmm2 is NaN (jp @0x10791e -> retq path stores
  // the un-updated xmm1). Otherwise `maxss xmm2, xmm1` -> xmm1 = max(xmm1, xmm2).
  // maxss semantics: NaN(xmm1) leaves result = xmm2.
  let maxY: number;
  if (isNaN32(xmm2_y)) {
    maxY = xmm1_y;                         // skip maxss
  } else {
    maxY = isNaN32(xmm1_y) ? xmm2_y : f32(Math.max(xmm1_y, xmm2_y));
  }

  return { x: outX, y: minY, right: outRight, bottom: maxY };
}

// ---------------------------------------------------------------------------
// Numeric self-checks (derived by hand from the disassembly above):
//
//   HGRectfInit(1, 2, 3, 4)        -> {x:1, y:2, right:3, bottom:4}
//   HGRectfInit(3, 4, 1, 2)        -> {x:1, y:2, right:3, bottom:4}
//     (min/max normalisation swaps corners so x<=right, y<=bottom)
//   HGRectfInit(NaN, 2, 5, 6)      -> {x:5, y:2, right:5, bottom:6}
//     (NaN in P0.x collapses that lane to P1.x=5 in BOTH min and max)
//
//   HGRectfTranslate({0,0,10,10}, 1, 2)
//                                  -> {x:1, y:2, right:11, bottom:12}
//   HGRectfTranslate({0,0,10,10}, -1, -2)
//                                  -> {x:-1, y:-2, right:9, bottom:8}
//     (translation preserves ordering, so the re-normalise is a no-op)
//
//   HGRectfScale({0,0,10,10}, 2, 3)   -> {x:0, y:0, right:20, bottom:30}
//   HGRectfScale({0,0,10,10}, -1, -1) -> {x:-10, y:-10, right:0, bottom:0}
//     (negative scale flips corners; min/max normalises them back)
//   HGRectfScale({1,2,3,4}, 0, 0)     -> {x:0, y:0, right:0, bottom:0}
//     (sx==0 hits the jbe path: xmm0=x*0=0, xmm2=right*0=0 -> min=max=0)
// ---------------------------------------------------------------------------
