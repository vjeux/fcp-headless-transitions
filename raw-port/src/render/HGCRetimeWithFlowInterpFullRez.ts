// HGCRetimeWithFlowInterpFullRez.ts — Helium node that reports domain-of-
// definition and region-of-interest for a "retime with flow-interpolated
// full-resolution" pass. This class contributes its Itanium C++ ABI D0
// destructor and two Helium node overrides (GetDOD / GetROI); GetROI is
// the interesting one — it grows the caller-supplied HGRect by a
// self-stored 2D border vector at self+0x1a0 / self+0x1a4 (float32,
// evidence @0xe13d3 / @0xe13db), plus a fixed 2-pixel padding on each
// side (2.0f literal @Helium 0x3caf8c), and integralises the result.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpFullRez.~HGCRetimeWithFlowInterpFullRez.s  (D0)
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpFullRez.GetDOD.s
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpFullRez.GetROI.s
//
// Helium symbols transcribed:
//   @0x000e1370  HGCRetimeWithFlowInterpFullRez::~HGCRetimeWithFlowInterpFullRez()  (D1 — Itanium ABI: tail-jmp base D2, body not surfaced as own slice)
//   @0x000e1380  HGCRetimeWithFlowInterpFullRez::~HGCRetimeWithFlowInterpFullRez()  (D0 — deleting dtor)
//   @0x000e13a0  HGCRetimeWithFlowInterpFullRez::GetDOD(HGRenderer*, int, HGRect)
//   @0x000e13c0  HGCRetimeWithFlowInterpFullRez::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * ABI mapping for the two node virtuals (matches every sibling HGC*/
//     HMask* node decoded elsewhere in this repo — e.g. HGLensGDC_BC.ts,
//     HGCPixelFormatConversion_kV4F_WXYZ_input.ts):
//       %rdi = self (HGCRetimeWithFlowInterpFullRez*)
//       %rsi = HGRenderer*
//       %edx = renderMode (int)
//       %rcx = incoming HGRect.lo   (x|y<<32)
//       %r8  = incoming HGRect.hi   (right|bottom<<32)
//     16B struct return in {%rax, %rdx}: lo in %rax, hi in %rdx.
//
//   * `self` stores two float32s at offsets 0x1a0 / 0x1a4 — read as
//     border-vec (bx, by) by GetROI @0xe13d3 / @0xe13db. These are the
//     motion-estimate half-widths in pixels for the flow-interpolation
//     search window; the class needs to expand its ROI by that amount so
//     upstream flow pixels remain in bounds.
//
//   * RIP-relative float constants read by GetROI (Helium __DATA_CONST):
//       @0x3ced10   f32 = -2.0f    (literal-pool)   -> xmm1 @0xe13e3
//                    (movss disp 0x2ed925, next-instr RIP 0xe13eb → 0x3ced10)
//                    Bytes at VA 0x3ced10 verified = 0x00 0x00 0x00 0xc0
//                    (little-endian f32 -2.0). This is Helium's canonical
//                    -2.0f literal; different from the 2.0f entry at
//                    0x3caf8c because the two lanes carry opposite signs
//                    in this specific expansion pattern.
//       @0x3caf8c   f32 =  2.0f    (literal-pool)   -> xmm4 @0xe13f6
//                    (movss disp 0x2e9b8e, next-instr RIP 0xe13fe → 0x3caf8c)
//                    Bytes at VA 0x3caf8c verified = 0x00 0x00 0x00 0x40
//                    (little-endian f32 +2.0). Same 2.0f literal used by
//                    HGQuadPlanar (see raw-port/src/render/HGQuadPlanar.ts
//                    line 41 / 230 — cross-referenced there for the
//                    interpolation-domain scale).
//     A "2 pixels of slack on each side" pattern for the flow-window.
//
//   * `_HGRectNull` (Helium __DATA_CONST @Helium 0x3d2284, 16 zero bytes) —
//     literal-pool refs at GetDOD @0xe13ac and GetROI @0xe143c
//     (leaq disp 0x2f0e41, next-instr RIP 0xe1443 → 0x3d2284). Fully
//     decoded in raw-port/src/render/HGRect.ts — imported.
//
//   * D0 body (0xe1380..0xe1397):
//       pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
//       movq %rdi, %rbx                           ; spill this
//       callq __ZN30HgcRetimeWithFlowInterpFullRezD2Ev
//                                                 ; chain base D2 dtor
//       movq %rbx, %rdi                           ; restore this
//       addq $0x8, %rsp; popq %rbx; popq %rbp
//       jmp __ZN8HGObjectdlEPv                    ; tail-jmp operator delete
//
//   * GetDOD body (0xe13a0..0xe13be):
//       movq  %rcx, %rax                          ; rax = inRect.lo
//       cmpl  $0x3, %edx                          ; renderMode vs 3
//       jb    0xe13bb                             ; renderMode<3 -> identity return
//       pushq %rbp; movq %rsp, %rbp
//       leaq  _HGRectNull(%rip), %rcx
//       movq  (%rcx), %rax                        ; rax = HGRectNull.lo
//       movq  0x8(%rcx), %r8                      ; r8  = HGRectNull.hi
//       popq  %rbp
//     0xe13bb:
//       movq  %r8, %rdx                           ; struct-return hi
//       retq
//     Semantic: if renderMode < 3 return inRect (identity); else return HGRectNull.
//     Different polarity from the pixel-format-conversion siblings, which
//     bail-to-null on renderMode!=0. Here modes 0/1/2 all pass through the
//     input DOD unchanged.
//
//   * GetROI body (0xe13c0..0xe145a) — the substantive method:
//     Prologue @0xe13c0..0xe13c9  (rbp frame, callee-save r15/r14/rbx, 16B align).
//     Spill    @0xe13ca..0xe13d0  r14=r8=inRect.hi ; rbx=rcx=inRect.lo ; r15d=edx=renderMode.
//     Border   @0xe13d3..0xe13db  xmm2 = self[0x1a0]   (f32 bx)
//                                  xmm3 = self[0x1a4]   (f32 by)
//     Consts   @0xe13e3..0xe13f6  xmm1 = -2.0f ; xmm4 = 2.0f
//     Corners  @0xe13eb..0xe1402  xmm0 = -2.0 - bx      ; xmm1 = -2.0 - by
//                                  xmm2 = bx + 2.0       ; xmm3 = by + 2.0
//                                  (i.e. the border rect is (-2-bx, -2-by, bx+2, by+2))
//     Call     @0xe1406            _HGRectfMake4f(xmm0, xmm1, xmm2, xmm3)
//                                  Returns HGRectf packed: xmm0 = (x, y) low
//                                  corner in the low 2 f32 lanes, xmm1 =
//                                  (right, bottom) high corner in the low 2
//                                  f32 lanes. (Verified by disassembling
//                                  _HGRectfMake4f @Helium 0x107e30:
//                                     insertps $0x10, xmm1, xmm0 → xmm0[0]=x, xmm0[1]=y
//                                     insertps $0x10, xmm3, xmm2 → xmm2[0]=r, xmm2[1]=b
//                                     xmm3 = min(xmm0, xmm2)       ; corner-normalise
//                                     xmm1 = max(xmm0, xmm2)
//                                     NaN-fixup blendvps
//                                     movaps xmm3, xmm0 → return (xmm0=lo, xmm1=hi).)
//     Switch   @0xe140b..0xe140f  cmpl $0x1, r15d ; ja 0xe1436
//                                  → renderMode ≤ 1 falls through (grow+integralise);
//                                    renderMode ≥ 2 branches to the else block.
//     Grow     @0xe1411..0xe1424  xmm2 = r14 (packs 2 int32s: right|bottom<<32)
//                                  xmm3 = rbx (packs 2 int32s: x|y<<32)
//                                  xmm2 = cvtdq2ps(xmm2)   ; int32→f32 lanes
//                                  xmm1 = xmm1 + xmm2      ; hi-corner + inRect.hi_f
//                                  xmm2 = cvtdq2ps(xmm3)
//                                  xmm0 = xmm0 + xmm2      ; lo-corner + inRect.lo_f
//     Tail     @0xe1427..0xe1431  epilogue, jmp _HGRectIntegral
//                                  → return HGRectIntegral(HGRectf{
//                                      x:     (-2 - bx) + inRect.x,
//                                      y:     (-2 - by) + inRect.y,
//                                      right: ( 2 + bx) + inRect.right,
//                                      bottom:( 2 + by) + inRect.bottom
//                                    })
//     Else     @0xe1436..0xe143a  cmpl $0x2, r15d ; je 0xe144a
//                                  → renderMode == 2 branches to identity return;
//                                    renderMode ≥ 3 falls through to HGRectNull load.
//     Null     @0xe143c..0xe1446  leaq _HGRectNull(%rip), %rax; rbx = HGRectNull.lo; r14 = HGRectNull.hi
//     Return   @0xe144a..0xe145a  rax = rbx; rdx = r14; epilogue; retq
//                                  → struct return {rax,rdx}. For rm==2 rbx/r14
//                                    still hold the original inRect halves
//                                    (identity); for rm>=3 they were overwritten
//                                    with HGRectNull.
//
//     Full semantic (three-way switch on renderMode):
//       renderMode ≤ 1 : return HGRectIntegral(inRect grown by (2+bx, 2+by) on each side)
//       renderMode == 2: return inRect            (identity)
//       renderMode ≥ 3 : return HGRectNull        (declines to report ROI)
//
// Vtable / vptr:
//   The instance's vptr is installed by the frontier base ctor. Only the
//   three own overrides above are exported by this class; every other slot
//   inherits through HgcRetimeWithFlowInterpFullRez (base) and HGNode. Not
//   needed for this port.
//
// Called stubs (all Helium imports; addresses in call/jmp column above):
//   __ZN30HgcRetimeWithFlowInterpFullRezD2Ev
//     HgcRetimeWithFlowInterpFullRez::~...() [D2] — base dtor called from
//     D0 @0xe1389.
//   __ZN8HGObjectdlEPv
//     HGObject::operator delete(void*) — tail-jmp'd from D0 @0xe1397.
//   _HGRectfMake4f
//     HGRectfMake4f(x0, y0, x1, y1) — callq'd from GetROI @0xe1406; body
//     lives at Helium 0x107e30 (disassembled above for the pack shape). Its
//     own port lives conceptually with the other HGRectf free-functions in
//     raw-port/src/render/HGRectf.ts, but the specific `HGRectfMake4f`
//     symbol is not-yet-transcribed there — throwing stub @0xe1406 (call site) / @0x107e30 (body).
//   _HGRectIntegral
//     HGRectIntegral(rf) — tail-jmp'd from GetROI @0xe1431; already ported
//     in raw-port/src/render/HGRect.ts (@Helium 0x107be0). Imported.
//
// Frontier callees (surfaced as throwing stubs):
//   - HgcRetimeWithFlowInterpFullRez::~...() [D2]  @Helium (D0 callq 0xe1389; D1 tail-jmp 0xe1370 by ABI convention)
//   - HGObject::operator delete(void*)             @Helium (D0 jmp 0xe1397)
//   - HGRectfMake4f(float,float,float,float)       @Helium (GetROI callq 0xe1406; body @0x107e30 — decoded in comment but not ported)
//
// Reused ports:
//   HGRect, HGRectNull, HGRectIntegral    — from raw-port/src/render/HGRect.ts
//   HGRectf (type only)                   — from raw-port/src/render/HGRect.ts

import { HGRect, HGRectNull, HGRectIntegral } from "./HGRect.js";
import type { HGRectf } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Neither
 * GetDOD nor GetROI on this class touches it (no callq/mov via %rsi in
 * either method). It survives as a signature-only parameter.
 */
export type HGRenderer = object;

/**
 * `HGRectfMake4f(float x0, float y0, float x1, float y1)` — Helium free
 * function at @Helium 0x107e30. Builds a corner-normalised HGRectf (min→lo,
 * max→hi, NaN-fixup preserves whichever operand is NaN). Called from
 * GetROI @0xe1406 with the four border-corner floats already computed in
 * xmm0..xmm3. Its body was decoded above (see the DECODE evidence for
 * GetROI) but the free-function itself is not yet transcribed into this
 * repo (raw-port/src/render/HGRectf.ts hosts other HGRectf methods but not
 * this Make4f); surfaced as a throwing stub here.
 */
function HGRectfMake4f(
  _x0: number,
  _y0: number,
  _x1: number,
  _y1: number,
): HGRectf {
  throw new Error(
    "HGCRetimeWithFlowInterpFullRez: HGRectfMake4f(float,float,float,float) not yet transcribed @Helium 0x107e30 (call site @0xe1406)",
  );
}

/**
 * `HgcRetimeWithFlowInterpFullRez::~HgcRetimeWithFlowInterpFullRez()` [D2
 * base-object dtor] — the primary base class's destructor. Chained by
 * both this class's dtors (mangled
 * `__ZN30HgcRetimeWithFlowInterpFullRezD2Ev`). Body — and the actual
 * flow-interpolation state this base owns — is frontier.
 */
function HgcBase_D2_dtor(_this: HGCRetimeWithFlowInterpFullRez): void {
  throw new Error(
    "HGCRetimeWithFlowInterpFullRez: HgcRetimeWithFlowInterpFullRez::~HgcRetimeWithFlowInterpFullRez() [D2] not yet transcribed @Helium D0 callq 0xe1389 (D1 tail-jmp 0xe1370 by ABI convention)",
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped `operator
 * delete` (Helium overrides the global one to route through its own
 * allocator, distinct from the C++ `_ZdlPv`). D0 tail-jmps to it at
 * @0xe1397. Not on this class's decoded surface.
 */
function HGObject_operator_delete(
  _this: HGCRetimeWithFlowInterpFullRez,
): void {
  throw new Error(
    "HGCRetimeWithFlowInterpFullRez: HGObject::operator delete(void*) not yet transcribed @Helium D0 tail-jmp 0xe1397",
  );
}

/**
 * The class instance. HGCRetimeWithFlowInterpFullRez is a Helium node
 * (IS-A HGNode via its frontier base HgcRetimeWithFlowInterpFullRez,
 * which sits at offset 0). Its slice on this file surfaces two decoded
 * instance-field offsets: two float32s at self+0x1a0 / self+0x1a4 read
 * by GetROI as a (bx, by) border-vector (see field annotations below).
 * All other field offsets remain on the base class (frontier).
 */
export class HGCRetimeWithFlowInterpFullRez {
  /**
   * `self+0x1a0` — the X border half-width, in output-space pixels, that
   * GetROI adds (plus a fixed +2) to the incoming ROI's horizontal extent.
   * Loaded @0xe13d3 as `movss 0x1a0(%rdi), %xmm2`. Not written by any
   * decoded slice of this class — presumably set on the base class during
   * frame setup based on the flow-search window.
   */
  border_x_at_0x1a0 = 0;

  /**
   * `self+0x1a4` — the Y border half-width, twin to `border_x_at_0x1a0`.
   * Loaded @0xe13db as `movss 0x1a4(%rdi), %xmm3`.
   */
  border_y_at_0x1a4 = 0;

  /**
   * `HGCRetimeWithFlowInterpFullRez::~HGCRetimeWithFlowInterpFullRez()` —
   * the Itanium C++ ABI D1 (complete-object) destructor. Mangled
   * `__ZN30HGCRetimeWithFlowInterpFullRezD1Ev` at @Helium 0xe1370.
   *
   * Its body is not surfaced as its own disasm slice (disasm.sh reports
   * the D0 body starting at 0xe1380) — by Itanium ABI convention this
   * D1 is a near-empty function that tail-jmps the base D2 dtor (same
   * pattern decoded in sibling classes like HGLensGDC_BC D1 @0x1e37b0..
   * 0x1e37b5 in raw-port/src/render/HGLensGDC_BC.ts). The class
   * contributes zero own-cleanup — every field it might own lives on
   * the base sub-object.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0xe1370 (D1) — tail-jmp base D2 dtor (Itanium ABI convention;
    // sibling-node pattern confirmed at HGLensGDC_BC D1 @0x1e37b5).
    HgcBase_D2_dtor(this);
  }

  /**
   * `HGCRetimeWithFlowInterpFullRez::~HGCRetimeWithFlowInterpFullRez()` —
   * the Itanium C++ ABI D0 (deleting) destructor. Mangled
   * `__ZN30HGCRetimeWithFlowInterpFullRezD0Ev` at @Helium 0xe1380.
   *
   * Address-by-address:
   *   0xe1380  pushq %rbp                       ─┐ frame prologue
   *   0xe1381  movq  %rsp, %rbp                 │
   *   0xe1384  pushq %rbx                       │ callee-save
   *   0xe1385  pushq %rax                       ─┘ 16B stack align
   *   0xe1386  movq  %rdi, %rbx                 ; spill this
   *   0xe1389  callq HgcRetimeWithFlowInterpFullRez::~...() [D2]
   *                                             ; chain base D2 dtor
   *   0xe138e  movq  %rbx, %rdi                 ; restore this
   *   0xe1391  addq  $0x8, %rsp                 ─┐ epilogue
   *   0xe1395  popq  %rbx                       │
   *   0xe1396  popq  %rbp                       ─┘
   *   0xe1397  jmp   HGObject::operator delete(void*)
   *                                             ; tail-jmp: free memory
   */
  destroy_D0_deletingDtor(): void {
    // @0xe1389 — chain base D2 dtor.
    HgcBase_D2_dtor(this);
    // @0xe1397 — tail-jmp HGObject-scoped operator delete.
    HGObject_operator_delete(this);
  }

  /**
   * `HGCRetimeWithFlowInterpFullRez::GetDOD(HGRenderer*, int, HGRect)` —
   * Helium node override reporting the domain-of-definition of this
   * node's output. Mangled
   * `__ZN30HGCRetimeWithFlowInterpFullRez6GetDODEP10HGRendereri6HGRect`
   * at @Helium 0xe13a0.
   *
   * Signature (from the mangled name):
   *   HGRect GetDOD(this, HGRenderer* renderer, int renderMode, HGRect inRect);
   *
   * Semantic (decoded):
   *   if (renderMode < 3) return inRect;    // pass-through
   *   else                return HGRectNull;
   *
   * Note: this class's DOD is polarity-inverted from the pixel-format-
   * conversion siblings (which null-out on renderMode!=0). Here modes
   * 0, 1, and 2 all pass through the input DOD unchanged; only mode ≥ 3
   * declines. `renderer` (%rsi) is never read — the DOD is a pure
   * function of (renderMode, inRect).
   *
   * Address-by-address:
   *   0xe13a0  movq  %rcx, %rax     ; rax = inRect.lo (default retval)
   *   0xe13a3  cmpl  $0x3, %edx     ; renderMode vs 3
   *   0xe13a6  jb    0xe13bb        ; renderMode<3 -> skip to identity return
   *   0xe13a8  pushq %rbp           ─┐ prologue (only on !=<3 path)
   *   0xe13a9  movq  %rsp, %rbp     ─┘
   *   0xe13ac  leaq  _HGRectNull(%rip), %rcx
   *   0xe13b3  movq  (%rcx), %rax   ; rax = HGRectNull.lo (overrides inRect.lo)
   *   0xe13b6  movq  0x8(%rcx), %r8 ; r8  = HGRectNull.hi (overrides inRect.hi)
   *   0xe13ba  popq  %rbp
   *   0xe13bb: movq  %r8, %rdx      ; struct-return hi
   *   0xe13be  retq
   */
  GetDOD(
    _renderer: HGRenderer,
    renderMode: number,
    inRect: HGRect,
  ): HGRect {
    // @0xe13a3..0xe13a6 — `cmpl $0x3, %edx; jb 0xe13bb`. `jb` is unsigned-
    // below; the C++ arg is `int` but `cmpl $0x3` treats it as u32 for the
    // sake of the branch (negative renderMode values would be treated as
    // very-large unsigned — but no caller passes negatives, so the natural
    // signed reading suffices).
    if ((renderMode | 0) < 3) {
      // @0xe13bb — identity return (rax=inRect.lo, rdx=r8=inRect.hi).
      return {
        x: inRect.x,
        y: inRect.y,
        right: inRect.right,
        bottom: inRect.bottom,
      };
    }
    // @0xe13ac..0xe13ba — return HGRectNull.
    return {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
  }

  /**
   * `HGCRetimeWithFlowInterpFullRez::GetROI(HGRenderer*, int, HGRect)` —
   * Helium node override reporting the region-of-interest this node
   * requests from its upstream inputs. Mangled
   * `__ZN30HGCRetimeWithFlowInterpFullRez6GetROIEP10HGRendereri6HGRect`
   * at @Helium 0xe13c0.
   *
   * Signature (from the mangled name):
   *   HGRect GetROI(this, HGRenderer* renderer, int renderMode, HGRect inRect);
   *
   * Semantic (decoded — three-way switch on renderMode):
   *   renderMode ≤ 1 : return HGRectIntegral(HGRectfMake4f(
   *                       -2 - bx + inRect.x_f,
   *                       -2 - by + inRect.y_f,
   *                        2 + bx + inRect.right_f,
   *                        2 + by + inRect.bottom_f))
   *                    (i.e. grow the input by (2+bx) on each horizontal
   *                     side and (2+by) on each vertical side; then round
   *                     the corners outward to integer pixels.)
   *   renderMode == 2: return inRect  (identity)
   *   renderMode ≥ 3 : return HGRectNull
   *
   * `bx = self[0x1a0]` and `by = self[0x1a4]` are the flow-search half-
   * widths in output pixels (float32). `renderer` (%rsi) is never read.
   *
   * Address-by-address: see the DECODE evidence in the file header for
   * the full byte-by-byte trace (0xe13c0..0xe145a).
   */
  GetROI(
    _renderer: HGRenderer,
    renderMode: number,
    inRect: HGRect,
  ): HGRect {
    // @0xe13d3..0xe13db — load the border-vec floats from self.
    // NOTE: the class fields are declared as JS `number`s that default to
    // 0; the FCP instance would have these written during flow-setup on
    // the base class. We use Math.fround to model the movss single-
    // precision load semantics exactly.
    const bx = Math.fround(this.border_x_at_0x1a0);
    const by = Math.fround(this.border_y_at_0x1a4);

    // @0xe13e3..0xe1402 — build the (bx, by)-based border corners.
    // All arithmetic is single-precision:
    //   xmm1 (= -2.0f); xmm0 = xmm1 (movaps).
    //   xmm0 = xmm0 - xmm2 = -2.0 - bx    (subss)
    //   xmm1 = xmm1 - xmm3 = -2.0 - by    (subss)
    //   xmm4 (= 2.0f)
    //   xmm2 = xmm2 + xmm4 = bx + 2.0     (addss)
    //   xmm3 = xmm3 + xmm4 = by + 2.0     (addss)
    // Constants sourced from the Helium __DATA_CONST literal pool:
    //   -2.0f @Helium 0x3ced10 (verified byte pattern 0x00 0x00 0x00 0xc0)
    //    2.0f @Helium 0x3caf8c (verified byte pattern 0x00 0x00 0x00 0x40 —
    //                            same literal used by HGQuadPlanar.ts:41)
    const NEG_TWO_F = Math.fround(-2.0);
    const POS_TWO_F = Math.fround(2.0);
    const borderX0 = Math.fround(NEG_TWO_F - bx); // -2 - bx
    const borderY0 = Math.fround(NEG_TWO_F - by); // -2 - by
    const borderX1 = Math.fround(bx + POS_TWO_F); // bx + 2
    const borderY1 = Math.fround(by + POS_TWO_F); // by + 2

    // @0xe1406 — build the border rect via HGRectfMake4f. Returns HGRectf
    // packed as (xmm0 = (x, y) low corner; xmm1 = (right, bottom) high
    // corner). The min/max NaN-fixup inside Make4f is why we can't just
    // synthesize the HGRectf inline — the ABI semantic includes NaN
    // handling that only the real free-function knows.
    const border: HGRectf = HGRectfMake4f(
      borderX0,
      borderY0,
      borderX1,
      borderY1,
    );

    // @0xe140b..0xe140f — three-way switch on renderMode.
    if ((renderMode | 0) <= 1) {
      // @0xe1411..0xe1424 — grow branch. Convert inRect (int32 lanes) to
      // f32 in-register (`cvtdq2ps` — round-to-nearest-even; identical to
      // JS `x | 0` -> `Math.fround(x)` since int32 fits exactly in f32 for
      // values with ≤24 significant bits, but here inRect is int32 so we
      // must honour the cvtdq2ps rounding for large corners).
      //
      // The asm does packed lane arithmetic (`addps`) — but only the low
      // 2 lanes carry meaningful data (the high 2 lanes of the border
      // rect and the sign-extended lanes of the inRect halves both carry
      // don't-care garbage that HGRectIntegral will discard). Mirroring
      // faithfully:
      const inXf = Math.fround(inRect.x | 0);
      const inYf = Math.fround(inRect.y | 0);
      const inRf = Math.fround(inRect.right | 0);
      const inBf = Math.fround(inRect.bottom | 0);
      const grown: HGRectf = {
        x: Math.fround(border.x + inXf),
        y: Math.fround(border.y + inYf),
        right: Math.fround(border.right + inRf),
        bottom: Math.fround(border.bottom + inBf),
      };
      // @0xe1431 — tail-jmp _HGRectIntegral. HGRectIntegral is Helium's
      // "float-rect → int-rect via floor(low)/ceil(high)" (see
      // raw-port/src/render/HGRect.ts:350 — @Helium 0x107be0).
      return HGRectIntegral(grown);
    }

    // @0xe1436..0xe143a — renderMode ≥ 2. Check for exact == 2.
    if ((renderMode | 0) === 2) {
      // @0xe144a — identity return: rax = rbx = inRect.lo, rdx = r14 =
      // inRect.hi (both were left untouched by the else-branch fallthrough
      // when the je fires).
      return {
        x: inRect.x,
        y: inRect.y,
        right: inRect.right,
        bottom: inRect.bottom,
      };
    }

    // @0xe143c..0xe1446 — renderMode ≥ 3. Return HGRectNull.
    return {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
  }
}
