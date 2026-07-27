// HMaskCompIntersect — mask-composite "intersect" DOD/ROI computation.
//
// Faithful transcription of the Ozone framework class HMaskCompIntersect.
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Disassembly saved at raw-port/re/disasm/HMaskCompIntersect.GetDOD.s and .GetROI.s
//
// Class @Ozone. Methods:
//   HMaskCompIntersect::~HMaskCompIntersect()          @Ozone 0x437000  (D1 — tail-call to HgcMaskCompIntersect::~HgcMaskCompIntersect)
//   HMaskCompIntersect::~HMaskCompIntersect()          @Ozone 0x437010  (D0 — base dtor + HGObject::operator delete)
//   HMaskCompIntersect::GetDOD(HGRenderer*, int dir, HGRect)  @Ozone 0x437030
//   HMaskCompIntersect::GetROI(HGRenderer*, int dir, HGRect)  @Ozone 0x437270
//
// DECODE: layout / callees / constants recovered from the disassembly:
//   HGRect is a 16-byte struct returned in {rax, rdx} = {qword lo, qword hi}. The disasm treats it
//   as four packed int32 fields we decode as {x,y,right,bottom} (corner-form):
//     rax low32  = x       (see subl at 0x437101 storing into -0x4c, x1)
//     rax high32 = y       (see shrq $0x20, rbx at 0x4370d0 + storing y as ecx at 0x43710e)
//     rdx low32  = right   (see the "subl %eax, %esi" @0x437104 that converts right→(right-x))
//     rdx high32 = bottom  (mirror: shrq $0x20, %r13 @0x4370f2 + subl of y @ 0x437106)
//   Callees (all "symbol stub for:"):
//     0x6dd37a  __ZN10HGRenderer8GetInputEP6HGNodei   HGRenderer::GetInput(HGNode*, int)
//     0x6dd36e  __ZN10HGRenderer6GetDODEP6HGNode      HGRenderer::GetDOD(HGNode*)
//     0x6dcc9c  _HGRectIsNull                          bool HGRectIsNull(HGRect)
//     0x6dcca8  _HGRectMake4i                          HGRect HGRectMake4i(int x, int y, int right, int bottom)
//   RIP data:
//     _HGRectNull (@0x437053 / @0x43727c)              const HGRect HGRectNull
//     abs-mask @0x707BC0 (packed 4x 0x7FFFFFFF)         `andps` → fabsf on a scalar SP float
//     epsilon @0x707BE0 low32 = 0x3727C5AC = 1e-5f      the near-zero threshold used with ucomiss
//   Vtable call at 0x4371ae:  callq *0x68(%rax) on HGRenderer* — undecoded (HGRenderer has no
//     Ozone vtable dumped; slot 0x68 is external). Reads two consecutive SP floats through &out
//     (the code loads -0x40 then -0x3c). Modeled here as a throwing stub.
//   Vtable slot for HMaskCompIntersect: *0x20 (from resolve.py vtable) — dtor-only for now.
//
// FORMULA (GetDOD @0x437030), literal transcription of the control flow:
//   if (dir != 0)  return HGRectNull;                                          // @0x43704f-0x437061
//   HGRect r1 = HGRenderer::GetDOD( HGRenderer::GetInput(node, 0) );           // @0x437073-0x43708b
//   if (!HGRectIsNull(r1))  r1 = clampCorners(r1);                             // @0x437097-0x437106
//   HGRect r2 = HGRenderer::GetDOD( HGRenderer::GetInput(node, 1) );           // @0x437111-0x43712c
//   if (!HGRectIsNull(r2))  r2 = clampCorners(r2);                             // @0x437138-0x43719c
//   float f[2]; HGRenderer_vtable_0x68(renderer, 1, f);                        // @0x43719f-0x4371ae
//   if (fabsf(f[0]) >= 1e-5f)                return HGRectMake4i(r2 corners); // @0x4371c8 jbe → 0x437222
//   if (fabsf(f[1]) < 1e-5f)                 return HGRectNull;                // @0x4371df ja → 0x437053
//   return HGRectMake4i( intersect(r1, r2) );                                  // @0x4371e5-0x437233
//
// Clamp bounds (corner-form int32 saturation):
//   x/y corner  clamped to  [0xC0000001, ...]  = >= -0x3FFFFFFF        (@0x4370c3-0x4370cd, 0x4370d4-0x4370da)
//   right/bot   clamped to  [..., 0x3FFFFFFE]  = <= +0x3FFFFFFE        (@0x4370e4-0x4370ee, 0x4370f6-0x4370fd)
//   (For null-first-DOD path only, an alt zero/-1 fallback is stored; see @0x43709c-0x4370b4.)
//
// GetROI @0x437270 — 12 lines:
//   if (dir >= 2)  return HGRectNull;                                          // @0x437273 jl → skip
//   else           return the ROI arg unchanged (rcx/r8 → return regs).       // @0x43728b-0x43728e

// HGRect is the canonical Helium type — corner-form int32 {x, y, right, bottom}.
// See raw-port/src/render/HGRect.ts (transcribed from Helium _HGRect{Make4i,IsNull,Null,...}).
// The `_HGRectNull` symbol referenced by this file at 0x437053/0x43727c is the same
// 16-zero-bytes _HGRectNull decoded there; _HGRectMake4i at 0x6dcca8 and _HGRectIsNull
// at 0x6dcc9c both resolve to Helium's HGRectMake4i/HGRectIsNull respectively.
import { HGRect, HGRectMake4i, HGRectIsNull, HGRectNull } from "./HGRect.js";
export { HGRect, HGRectMake4i, HGRectIsNull, HGRectNull };

/** HGRenderer — forward-declared external class. Ozone dumps no vtable for it, so its methods are
 *  routed through interfaces here and treated as undecoded frontier. */
export interface HGRenderer {
  // Fully external to Ozone. All uses in this file go through the stubs below.
  readonly __hgRenderer: unique symbol;
}
export interface HGNode { readonly __hgNode: unique symbol }

/** HGRenderer::GetInput(HGNode*, int) @Ozone 0x6dd37a (symbol stub). Undecoded. */
export function HGRenderer_GetInput(_r: HGRenderer, _node: HGNode, _i: number): HGNode {
  // @Ozone 0x6dd37a — external Helium API.
  throw new Error("HGRenderer::GetInput @Ozone 0x6dd37a not yet transcribed");
}

/** HGRenderer::GetDOD(HGNode*) @Ozone 0x6dd36e (symbol stub). Undecoded. */
export function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode): HGRect {
  // @Ozone 0x6dd36e — external Helium API.
  throw new Error("HGRenderer::GetDOD @Ozone 0x6dd36e not yet transcribed");
}

/** HGRenderer vtable slot *0x68 — invoked via `callq *0x68(%rax)` at @Ozone 0x4371ae.
 *  Signature by callsite: (renderer, int=1, float[2] out). Not decoded (HGRenderer has no
 *  Ozone vtable dump). Modeled as a throwing stub so any GetDOD call reaches the frontier. */
export function HGRenderer_vtable_0x68(_r: HGRenderer, _one: number, _out: Float32Array): void {
  // @Ozone 0x4371ae vtable *0x68 on HGRenderer — external, not yet transcribed.
  throw new Error("HGRenderer::vtable[0x68] @Ozone 0x4371ae not yet transcribed");
}

// -----------------------------------------------------------------------------
// Helpers transcribed from GetDOD's inline arithmetic (not a synthetic helper —
// this is literally the four-cmov+shr sequence at @0x4370bd-0x437106 / @0x43714d-0x43719c
// applied to both DODs). Kept as a local, non-exported function whose body is the disasm.
// -----------------------------------------------------------------------------

/** Clamp an HGRect's corners to the int32-saturated range used at @0x4370bd..0x437106.
 *  x,y  ∈ [0xC0000001, ..]        (>= -0x3FFFFFFF)
 *  r,b  ∈ [.., 0x3FFFFFFE]        (<= +0x3FFFFFFE)
 *  The bounds are literal values loaded as immediates in the disassembly (0xC0000001, 0x3FFFFFFE).
 *  @Ozone 0x4370bd..0x437106  (mirror at 0x43714d..0x43719c for the second input)
 */
function clampCornersDOD(r: HGRect): { x: number; y: number; right: number; bottom: number } {
  // Mirrors: cmpl $0xC0000002, ...; movl $0xC0000001, %axfam; cmovgel  (@0x4370bd/@0x4370c8/@0x4370cd)
  //         cmpl $0x3FFFFFFE, ...; movl $0x3FFFFFFE, %axfam; cmovll    (@0x4370dd/@0x4370e4/@0x4370ee)
  // Read-as-int32 with the sign-preserving comparisons the disasm uses (32-bit signed cmpl).
  const LO = 0xC0000001 | 0;   // = -0x3FFFFFFF
  const HI = 0x3FFFFFFE | 0;   // = +0x3FFFFFFE
  const CMP_LO = 0xC0000002 | 0; // strictly-greater-or-equal comparand @0x4370bd/0x4370d4
  const CMP_HI = 0x3FFFFFFE | 0; // strictly-less comparand           @0x4370dd/0x4370f6

  const rx = r.x | 0, ry = r.y | 0, rr = r.right | 0, rb = r.bottom | 0;
  // cmpl val, CMP_LO ; movl LO, out ; cmovgel val, out    → out = (val >= CMP_LO) ? val : LO
  const x  = (rx >= CMP_LO) ? rx : LO;
  const y  = (ry >= CMP_LO) ? ry : LO;
  // cmpl val, CMP_HI ; movl HI, out ; cmovll val, out     → out = (val <  CMP_HI) ? val : HI
  const right  = (rr <  CMP_HI) ? rr : HI;
  const bottom = (rb <  CMP_HI) ? rb : HI;
  return { x, y, right, bottom };
}

// -----------------------------------------------------------------------------
// GetDOD  @Ozone 0x437030
// -----------------------------------------------------------------------------
/** HMaskCompIntersect::GetDOD(HGRenderer* r, int dir, HGRect roi)
 *  @Ozone 0x437030.  Note: the `roi` argument arrives in {rcx, r8} on x86_64 SysV (it's the 4th
 *  arg passed as an aggregate); GetDOD in this class DOES NOT consult roi — the disasm never reads
 *  from %rcx/%r8. That matches HGRectNull semantics for the `dir != 0` early return, which uses
 *  neither of the input rects.
 */
export function HMaskCompIntersect_GetDOD(
  renderer: HGRenderer,
  node: HGNode,
  dir: number,
  _roi: HGRect,
): HGRect {
  // @0x43704f-0x437061: testl %edx,%edx ; je 0x437066  →  if (dir != 0) return HGRectNull.
  if ((dir | 0) !== 0) {
    return HGRectNull; // @Ozone 0x437053 — literal load of _HGRectNull into {rax, rdx}.
  }

  // @0x437073-0x43708b: r1 = HGRenderer::GetDOD(HGRenderer::GetInput(node, 0)).
  const in0 = HGRenderer_GetInput(renderer, node, 0);
  const rawR1 = HGRenderer_GetDOD(renderer, in0);

  // @0x437091-0x4370aa: pre-clamp defaults are (x=0, right=-1, bottom=-1, y=0) — assigned into
  // -0x4c/-0x50/-0x54/-0x58 by movl $0x0 / $0xffffffff before the HGRectIsNull test. Then if
  // NOT null we OVERWRITE with the clamped corners (@0x4370bd..0x437106).
  let x1 = 0, right1 = -1, bottom1 = -1, y1 = 0;
  // @0x437097 callq _HGRectIsNull; @0x4370b9 testl %eax,%eax; @0x4370bb jne 0x437108  → skip clamp on null.
  if (!HGRectIsNull(rawR1)) {
    const c = clampCornersDOD(rawR1);
    x1 = c.x; y1 = c.y; right1 = c.right; bottom1 = c.bottom;
  }

  // @0x437111-0x43712c: r2 = HGRenderer::GetDOD(HGRenderer::GetInput(node, 1)).
  const in1 = HGRenderer_GetInput(renderer, node, 1);
  const rawR2 = HGRenderer_GetDOD(renderer, in1);

  // @0x43713d-0x437143: r2 pre-clamp defaults are (x=0, right=-1, bottom=-1, y=0) — set via
  // movl $0x0, %r12d ; movl $0xffffffff, %r13d ; plus -0x48/-0x44 defaulted by earlier stores.
  let x2 = 0, right2 = -1, bottom2 = -1, y2 = 0;
  if (!HGRectIsNull(rawR2)) {
    const c = clampCornersDOD(rawR2);
    x2 = c.x; y2 = c.y; right2 = c.right; bottom2 = c.bottom;
  }

  // @0x43719f-0x4371ae: vtable *0x68 on HGRenderer with (this, 1, &floats[2]) — reads two SP floats.
  const f = new Float32Array(2);
  HGRenderer_vtable_0x68(renderer, 1, f);

  // @0x4371b1-0x4371c8: movss f[0]; andps abs-mask; ucomiss with 1e-5f; jbe → simple path.
  // NB single-precision: Math.fround makes the fabsf explicit even though Float32Array already
  // rounds on load.
  const EPS = Math.fround(1e-5);      // @Ozone 0x707BE0 low32 = 0x3727C5AC
  const absF0 = Math.fround(Math.abs(Math.fround(f[0])));
  if (absF0 >= EPS) {
    // @0x437222 branch — "simple" path: pass through the SECOND input's clamped rect.
    // The disasm reads -0x48=x2, -0x44=(right2-x2 baked "w"); the code then re-adds x2 to
    // recover right2 (@0x437228 addl %edi,%edx). Semantically: HGRectMake4i(x2, y2, right2, bottom2).
    return HGRectMake4i(x2, y2, right2, bottom2);
  }

  const absF1 = Math.fround(Math.abs(Math.fround(f[1])));
  // @0x4371d6 ucomiss xmm1(|f1|), xmm0(EPS); @0x4371df ja 0x437053 → EPS > |f1| means |f1| < EPS.
  if (EPS > absF1) {
    return HGRectNull; // @Ozone 0x437053.
  }

  // @0x4371e5-0x437218: real intersection (corner-form min/max).
  //   max_x  = max(x1, x2)
  //   min_r  = min(right1, right2)
  //   max_y  = max(y1, y2)
  //   min_b  = min(bottom1, bottom2)
  // Then @0x437228 addl %edi,%edx / addl %r12d,%r13d turns the intermediate (min-max) back into
  // corners for HGRectMake4i.
  const maxX = (x1 > x2) ? x1 : x2;         // cmovgl @0x4371ec
  const minR = (right1 < right2) ? right1 : right2;  // cmovll @0x4371f8
  const maxY = (y1 > y2) ? y1 : y2;         // cmovgl @0x437204
  const minB = (bottom1 < bottom2) ? bottom1 : bottom2; // cmovll @0x437212

  return HGRectMake4i(maxX, maxY, minR, minB);
}

// -----------------------------------------------------------------------------
// GetROI  @Ozone 0x437270
// -----------------------------------------------------------------------------
/** HMaskCompIntersect::GetROI(HGRenderer*, int dir, HGRect roi)
 *  @Ozone 0x437270.  Transcribed literally from 12 lines:
 *      movq %rcx, %rax            ; return roi.lo unchanged
 *      cmpl $0x2, %edx ; jl skip  ; if (dir >= 2) load HGRectNull; else fall-through
 *      (skip:) movq %r8, %rdx     ; return roi.hi unchanged
 */
export function HMaskCompIntersect_GetROI(
  _renderer: HGRenderer,
  _node: HGNode,
  dir: number,
  roi: HGRect,
): HGRect {
  // @0x437273 cmpl $0x2, %edx ; @0x437276 jl 0x43728b  → if (dir < 2) return roi; else return HGRectNull.
  if ((dir | 0) < 2) {
    return roi;
  }
  return HGRectNull; // @Ozone 0x43727c — loads _HGRectNull into {rax, r8}.
}

// -----------------------------------------------------------------------------
// Destructors  @Ozone 0x437000 (D1) and 0x437010 (D0)
// -----------------------------------------------------------------------------
/** HMaskCompIntersect::~HMaskCompIntersect  @Ozone 0x437000  (D1 complete-object dtor).
 *  Body is a straight tail-call jmp to HgcMaskCompIntersect::~HgcMaskCompIntersect (base dtor). */
export function HMaskCompIntersect_dtor_D1(_self: object): void {
  // @Ozone 0x437005 — jmp __ZN20HgcMaskCompIntersectD2Ev (undecoded frontier).
  throw new Error("HgcMaskCompIntersect::~HgcMaskCompIntersect @Ozone symbol __ZN20HgcMaskCompIntersectD2Ev not yet transcribed (called from HMaskCompIntersect ~D1 @0x437000)");
}

/** HMaskCompIntersect::~HMaskCompIntersect  @Ozone 0x437010  (D0 deleting dtor).
 *  Calls base dtor, then tail-calls HGObject::operator delete(void*). */
export function HMaskCompIntersect_dtor_D0(_self: object): void {
  // @Ozone 0x437019 — call HgcMaskCompIntersect::~HgcMaskCompIntersect (undecoded).
  // @Ozone 0x437027 — jmp HGObject::operator delete (__ZN8HGObjectdlEPv, undecoded).
  throw new Error("HMaskCompIntersect::~HMaskCompIntersect(D0) @Ozone 0x437010 not yet transcribed (needs HgcMaskCompIntersect::~HgcMaskCompIntersect and HGObject::operator delete)");
}
