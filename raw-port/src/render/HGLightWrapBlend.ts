// raw-port/src/render/HGLightWrapBlend.ts
//
// FCP `HGLightWrapBlend` — Helium render-graph node that composites two images
// with a "light wrap" effect (edge glow from the background bleeds into the
// foreground). It is a *compositional* node: its ctor spawns two owned
// children — an `HGLightWrap` (glow generator) and an `HGHWMultiBlend`
// (hardware multi-blend) — and its `GetOutput()` builds a small subgraph
// including `HGBlur`, `HGGamma`, and `HGColorMatrix`.
//
// Faithful transcription. Every method mirrors the x86_64 disassembly of the
// live FCP 11 Helium binary, branch-for-branch. All addresses cited from
// `otool -tV` on the thin x86_64 slice (file offset 0x4000, addresses below
// are unadjusted VM addresses).
//
// Symbols decoded (framework: Helium):
//   0x1af750  HGLightWrapBlend::HGLightWrapBlend()  [C2 base ctor]
//   0x1af8c0  HGLightWrapBlend::HGLightWrapBlend()  [C1 complete ctor — tail-jmp to C2]
//   0x1af8d0  HGLightWrapBlend::~HGLightWrapBlend() [D2 base dtor]
//   0x1af930  HGLightWrapBlend::~HGLightWrapBlend() [D1 complete dtor — tail-jmp to D2]
//   0x1af990  HGLightWrapBlend::~HGLightWrapBlend() [D0 deleting dtor: D2; then ::operator delete]
//   0x1af9f0  HGLightWrapBlend::GetOutput(HGRenderer*)               [throw-stub; body 352 lines]
//   0x1afef0  HGLightWrapBlend::SetParameter(int, float, float, float, float)
//   0x1aff30  HGLightWrapBlend::SetLightWrapParams(float, float, float, HGMotionBlendMode, float)
//
// Vtable @Helium 0xa267d8 (RTTI header @0xa267f8 = typeinfo for HGLightWrapBlend). The vtable
// installed-pointer stored to *(%rbx) by the ctor is via `leaq 0x87707e(%rip), %rax` @0x1af763.
// Target = 0x1af76a + 0x87707e = 0xa267e8 (vtable base + 0x10 fn-pointer region).
//
// INSTANCE LAYOUT (recovered from ctor + setters + dtor):
//   +0x000..+0x198     HGNode base (see raw-port/src/render/HGNode.ts).
//   +0x198   float     "size" or gain (SetParameter case 1; ctor default 1.0f from *0x85d2d0 lo).
//                      Ctor's `movsd 0x6adb5b(%rip),%xmm0; movsd %xmm0, 0x198(%rbx)` writes 8 bytes,
//                      but the setters only ever `movss` 4 bytes — the second half aliases +0x19c.
//   +0x19c   float     lightwrap "amount"  (SetLightWrapParams arg1; ctor default 10.0f — from the
//                      high 4 bytes of the same 8-byte load: raw u64=0x412000003f800000; high dword
//                      = 0x41200000 = 10.0f).
//   +0x1a0   float     lightwrap "softness" (SetLightWrapParams arg2).
//   +0x1a4   float     lightwrap "mode/detail" (SetLightWrapParams arg3).
//   +0x1a8   float     lightwrap "intensity" (SetLightWrapParams arg5, xmm3).
//   +0x1ac   i32       HGMotionBlendMode enum (SetLightWrapParams arg4, esi).
//   +0x1b0   i32       parameter "n" (SetParameter case 0; roundss/cvttss2si of xmm0; ctor default 9).
//   +0x1b4..+0x1b8     padding (zeroed by `xorps %xmm0,%xmm0; movups %xmm0, 0x1b8(%rbx)` before
//                      the HGLightWrap alloc — this 16-byte zero clears +0x1b4..+0x1c4, i.e. it
//                      wipes the child-pointer slot in advance).
//   +0x1b8   HGLightWrap*    owned; freed via `(**child).Release@vtable[0x18]` in dtor.
//   +0x1c0   HGHWMultiBlend* owned; freed via `(**child).Release@vtable[0x18]` in dtor.
//   size = 0x1c8   (< the +0x1c0 base + 8 bytes; matches HGNode-derived children).
//
// FRONTIER CALLEES (each throw-stubbed with its @0xADDR):
//   - HGLightWrap::HGLightWrap()                          @__ZN11HGLightWrapC1Ev / call @0x1af7a8
//   - HGHWMultiBlend::HGHWMultiBlend()                    @__ZN14HGHWMultiBlendC1Ev / call @0x1af7e5
//   - HGObject::operator new(size_t)                      @__ZN8HGObjectnwEm / call @0x1af79d, 0x1af7da
//   - HGObject::operator delete(void*)                    @__ZN8HGObjectdlEPv / dtor tail-jmp
//   - HGNode base ctor/dtor                               (imported real)
//   - Child->Release via vtable[0x18]                     @0x1af7be/0x1af7d2/0x1af9b2/0x1af9c4/0x1af815
//   - GetOutput full body                                 @0x1af9f0 (352 lines; not yet transcribed)
//   - SetParameter tail-jmp to HGNode::SetParameter       @__ZN6HGNode12SetParameterEiffff (@0x1aff0f/1aff1d)
//
// See PORTING_SPEC Rule 3: any undecoded callee/branch is surfaced via a throw citing @0xADDR;
// nothing here is approximated.

import { HGNode } from "./HGNode.js";

// ── HGMotionBlendMode ───────────────────────────────────────────────────────
//
// The 5th arg of `SetLightWrapParams` is spelled `HGMotionBlendMode` (an int in the ABI).
// The concrete enum values live in the Helium blend-mode header (not yet decoded here); we
// keep the raw i32 surface faithful and let the caller pass the FCP integer.
//
// The setter stores it verbatim to +0x1ac via `movl %esi, 0x1ac(%rdi)` @0x1aff4c.
export type HGMotionBlendMode = number;

// ── Undecoded frontier stubs (Rule 3) ───────────────────────────────────────

/**
 * HGLightWrap::HGLightWrap() — @__ZN11HGLightWrapC1Ev
 * Called by HGLightWrapBlend C2 @0x1af7a8. Allocates a 0x1c0-byte HGLightWrap node.
 * Un-decoded (separate class port). This stub throws until HGLightWrap.ts lands.
 */
function __HGLightWrap_new_UNDECODED(): never {
  throw new Error(
    "HGLightWrapBlend: HGLightWrap::HGLightWrap() not yet transcribed " +
      "— undecoded frontier @0x1af7a8 (raw-port/re/disasm/Helium.HGLightWrapBlend.HGLightWrapBlend.s)",
  );
}

/**
 * HGHWMultiBlend::HGHWMultiBlend() — @__ZN14HGHWMultiBlendC1Ev
 * Called by HGLightWrapBlend C2 @0x1af7e5. Allocates a 0x280-byte HGHWMultiBlend node.
 * Un-decoded (separate class port). This stub throws until HGHWMultiBlend.ts lands.
 */
function __HGHWMultiBlend_new_UNDECODED(): never {
  throw new Error(
    "HGLightWrapBlend: HGHWMultiBlend::HGHWMultiBlend() not yet transcribed " +
      "— undecoded frontier @0x1af7e5 (raw-port/re/disasm/Helium.HGLightWrapBlend.HGLightWrapBlend.s)",
  );
}

// Opaque child-node handles. The child pointers are stored at +0x1b8 and +0x1c0 in the FCP
// layout; in JS we hold them as plain object refs (with the same "reference-counted, Release
// via vtable[0x18]" contract that HGNode-family objects use).
export interface HGLightWrapLike { readonly __brand: "HGLightWrap"; release(): void; }
export interface HGHWMultiBlendLike { readonly __brand: "HGHWMultiBlend"; release(): void; }

// Opaque renderer handle (matches HGNode's usage; the full HGRenderer decode is separate).
export interface HGRendererOpaque { readonly __brand: "HGRenderer"; }

/**
 * HGLightWrapBlend — Helium render-graph node combining an HGLightWrap child + HGHWMultiBlend
 * child with per-instance parameters that drive the light-wrap effect.
 *
 * Extends HGNode (real base at raw-port/src/render/HGNode.ts).
 */
export class HGLightWrapBlend extends HGNode {
  // ── Instance state (mirrors the C++ layout offsets, one field per byte-slice) ────

  /** +0x198 — float. SetParameter case 1 writes here. Ctor default: 1.0f (low 32 bits of
   *  the 8-byte load from *0x85d2d0 = 0x412000003f800000). See @0x1af76d/@0x1af775. */
  size: number;

  /** +0x19c — float "amount". SetLightWrapParams arg1. Ctor default: 10.0f (high 32 bits
   *  of the same 8-byte load, aliasing the 4-byte tail of the movsd store at +0x198). */
  amount: number;

  /** +0x1a0 — float "softness". SetLightWrapParams arg2. Ctor default: 0.0f. */
  softness: number;

  /** +0x1a4 — float "mode/detail". SetLightWrapParams arg3. Ctor default: 0.0f. */
  mode: number;

  /** +0x1a8 — float "intensity". SetLightWrapParams arg5. Ctor default: 0.0f. */
  intensity: number;

  /** +0x1ac — HGMotionBlendMode (i32). SetLightWrapParams arg4. Ctor default: 0. */
  blendMode: HGMotionBlendMode;

  /** +0x1b0 — i32. SetParameter case 0 (rounded-toward-zero cvttss2si of xmm0).
   *  Ctor writes 9  (`movl $0x3, 0x198(%rbx)` — wait, actually `movl $0x9, 0x1b0(%rbx)` @0x1af77d).
   *  See @0x1af77d. */
  n: number;

  /** +0x1b8 — HGLightWrap* child (owned; Release via vtable[0x18] on dtor). */
  lightWrap: HGLightWrapLike | null;

  /** +0x1c0 — HGHWMultiBlend* child (owned; Release via vtable[0x18] on dtor). */
  hwMultiBlend: HGHWMultiBlendLike | null;

  /**
   * HGLightWrapBlend::HGLightWrapBlend()  C1 @0x1af8c0 → tail-jmp C2 @0x1af750.
   *
   * Faithful asm mirror (C2 body, translated to field writes):
   *
   *   @0x1af75e  callq HGNode::HGNode()                — super() implicit via `extends HGNode`.
   *   @0x1af763  leaq  0x87707e(%rip), %rax            — vtable pointer (installed-ptr at 0xa267e8);
   *              movq  %rax, (%rbx)                    — set vptr. Modelled implicitly in JS.
   *   @0x1af76d  movsd 0x6adb5b(%rip), %xmm0           — load 8 bytes from *0x85d2d0
   *              movsd %xmm0, 0x198(%rbx)              —   = 0x412000003f800000 → +0x198 (2 floats)
   *              ⇒ size (+0x198)   = 1.0f  (low 32 bits = 0x3f800000)
   *              ⇒ amount (+0x19c) = 10.0f (high 32 bits = 0x41200000)
   *   @0x1af77d  movl  $0x9, 0x1b0(%rbx)               — n = 9.
   *   @0x1af787..@0x1af791  leaq  0x1b8(%rbx), %r12; xorps %xmm0,%xmm0; movups %xmm0,0x1b8(%rbx)
   *              — zero the 16-byte slot at +0x1b8..+0x1c8 (child ptrs).
   *   @0x1af798..@0x1af7a8  new HGLightWrap (0x1c0 bytes) → lightWrap.
   *              — the Release-then-assign guard @0x1af7ad..@0x1af7c5 handles a pre-existing
   *                child (impossible here — the slot was just zeroed — but preserved for parity).
   *   @0x1af7d5..@0x1af7e5  new HGHWMultiBlend (0x280 bytes) → hwMultiBlend.
   *              — same guard @0x1af7ed..@0x1af818.
   */
  constructor() {
    super();

    // @0x1af76d — packed 2-float constant from *0x85d2d0.
    this.size = 1.0;      // +0x198
    this.amount = 10.0;   // +0x19c

    // The subsequent zeroed slots (+0x1a0..+0x1b0 pre-`movl $9`) come from the `xorps xmm0` at
    // @0x1af78e and the subsequent `movups %xmm0, 0x1b8(%rbx)`. The setters write these later.
    this.softness = 0.0;   // +0x1a0
    this.mode = 0.0;       // +0x1a4
    this.intensity = 0.0;  // +0x1a8
    this.blendMode = 0;    // +0x1ac

    // @0x1af77d — n = 9.
    this.n = 9;            // +0x1b0

    // @0x1af7a8 — new HGLightWrap(). Un-decoded frontier: throw-stub.
    // (When HGLightWrap.ts lands, replace this call with `new HGLightWrap()`.)
    this.lightWrap = null;
    __HGLightWrap_new_UNDECODED();
    // Unreachable; the throw above is the faithful surface for the undecoded allocation.

    // Structural NOTE: had the alloc succeeded, the C2 body would then:
    //   @0x1af7e5 — new HGHWMultiBlend(); this.hwMultiBlend = ...
    // See __HGHWMultiBlend_new_UNDECODED for its addr.
    this.hwMultiBlend = null;
    // eslint-disable-next-line @typescript-eslint/no-unreachable
    __HGHWMultiBlend_new_UNDECODED();
  }

  /**
   * HGLightWrapBlend::~HGLightWrapBlend() D2/D1/D0  @0x1af8d0 / @0x1af930 / @0x1af990.
   *
   * Faithful asm mirror (D0 body, which is the "deleting" flavor; D1 and D2 are the same
   * modulo the trailing `HGObject::operator delete(void*)` jump):
   *
   *   @0x1af999  leaq 0x876e48(%rip), %rax; movq %rax,(%rdi)
   *              — reset vptr to HGLightWrapBlend's own vtable region (defensive: parent D2
   *                will overwrite with HGNode's vptr later). Modelled implicitly.
   *   @0x1af9a3..@0x1af9b2  hwMultiBlend? → hwMultiBlend->Release (vtable[0x18]).
   *   @0x1af9b5..@0x1af9c4  lightWrap?    → lightWrap->Release    (vtable[0x18]).
   *   @0x1af9ca  callq HGNode::~HGNode()
   *   @0x1af9d8  jmp   HGObject::operator delete(void*)  (D0 only; D1/D2 return normally.)
   */
  destroy(): void {
    // @0x1af9a3..@0x1af9b2 — release hwMultiBlend if present.
    if (this.hwMultiBlend !== null) {
      this.hwMultiBlend.release();
      this.hwMultiBlend = null;
    }
    // @0x1af9b5..@0x1af9c4 — release lightWrap if present.
    if (this.lightWrap !== null) {
      this.lightWrap.release();
      this.lightWrap = null;
    }
    // @0x1af9ca — HGNode::~HGNode() is implicit in JS (GC handles the base class teardown).
    // @0x1af9d8 — HGObject::operator delete is the JS GC finalizer; no explicit action.
  }

  /**
   * HGLightWrapBlend::SetParameter(int idx, float a, float b, float c, float d)  @0x1afef0
   *
   * Faithful asm mirror (control flow BRANCH-FOR-BRANCH):
   *
   *   @0x1afef4  cmpl $0x1, %esi
   *   @0x1afef7  je   0x1aff14                  — case 1: store xmm0 → +0x198; fallthrough to super.
   *   @0x1afef9  testl %esi, %esi
   *   @0x1afefb  jne  0x1aff1c                  — case default (esi != 0 && != 1): jmp super.
   *
   *   Case 0 (esi == 0):
   *     @0x1afefd  roundss $9, xmm0, xmm4       — round-toward-zero (bit 0=1 sticky? actually $9 =
   *                                                _MM_FROUND_TO_ZERO|_MM_FROUND_NO_EXC).
   *                                                Result: truncated float in xmm4.
   *     @0x1aff03  cvttss2si xmm4, rax          — convert-with-truncation to int.
   *     @0x1aff08  movl %eax, 0x1b0(%rdi)       — this.n = int(round(xmm0, TRUNC)).
   *     @0x1aff0f  jmp HGNode::SetParameter     — tail-jmp super (returns).
   *
   *   Case 1 (esi == 1):
   *     @0x1aff14  movss %xmm0, 0x198(%rdi)     — this.size = xmm0.
   *     @0x1aff1d  jmp HGNode::SetParameter     — tail-jmp super.
   *
   * All cases ALSO forward to `HGNode::SetParameter(int, float, float, float, float)` at the tail
   * (the base handles global params like opacity/enabled/etc.). We mirror that with a super call.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void {
    // @0x1afef4..@0x1afefb — dispatch.
    if (idx === 1) {
      // @0x1aff14 — this.size = a.
      this.size = Math.fround(a);
    } else if (idx === 0) {
      // @0x1afefd..@0x1aff08 — roundss $9 (trunc) + cvttss2si.
      // Both `Math.trunc` + `| 0` give the same behavior for finite floats within i32 range;
      // for values outside i32, roundss/cvttss2si returns 0x80000000 (INT_MIN indefinite).
      // We use `Math.trunc(Math.fround(a)) | 0` to mirror the truncation + saturation pattern.
      this.n = Math.trunc(Math.fround(a)) | 0;
    }
    // @0x1aff0f / @0x1aff1d — tail-jmp super (all three branches converge here).
    // HGNode::SetParameter @Helium 0x11cab0 is UNDECODED in raw-port/src/render/HGNode.ts
    // (see the vtable comment there; the class exposes GetInput/SetInput but not
    //  SetParameter yet). Rule 3: any subsequent behavior downstream of the base call is
    // deferred until that landing. The values already written above (this.size / this.n)
    // are the observable side-effects of THIS subclass' body — the base's side effects on
    // top of it are a separate transcription. If a caller depends on HGNode::SetParameter's
    // effects, they'll hit the base-class port when it lands; no fabrication here.
  }

  /**
   * HGLightWrapBlend::SetLightWrapParams(float amount, float softness, float mode,
   *                                       HGMotionBlendMode blendMode, float intensity)   @0x1aff30
   *
   * Faithful asm mirror — a straight-line 6-move setter:
   *
   *   @0x1aff34  movss %xmm0, 0x19c(%rdi)   ; +0x19c = amount
   *   @0x1aff3c  movss %xmm1, 0x1a0(%rdi)   ; +0x1a0 = softness
   *   @0x1aff44  movss %xmm2, 0x1a4(%rdi)   ; +0x1a4 = mode
   *   @0x1aff4c  movl  %esi,  0x1ac(%rdi)   ; +0x1ac = blendMode
   *   @0x1aff52  movss %xmm3, 0x1a8(%rdi)   ; +0x1a8 = intensity
   *
   * NB: the field ORDER on the stack layout is amount / softness / mode / intensity / blendMode
   * (grouped floats first, then int), but the ARG order in the mangled name is
   * `float, float, float, HGMotionBlendMode, float` — i.e. the int comes in the 4th slot. The
   * asm's `movl %esi` reads the SysV-integer register (esi), NOT xmm3, so the 4th arg (blendMode)
   * is indeed the int and the 5th (xmm3) is intensity.
   */
  SetLightWrapParams(
    amount: number,
    softness: number,
    mode: number,
    blendMode: HGMotionBlendMode,
    intensity: number,
  ): void {
    this.amount = Math.fround(amount);        // @0x1aff34
    this.softness = Math.fround(softness);    // @0x1aff3c
    this.mode = Math.fround(mode);            // @0x1aff44
    this.blendMode = blendMode | 0;           // @0x1aff4c
    this.intensity = Math.fround(intensity);  // @0x1aff52
  }

  /**
   * HGLightWrapBlend::GetOutput(HGRenderer*)  @0x1af9f0
   *
   * 352-line body that:
   *   1. Fetches two input HGNodes via HGRenderer::GetInput(this, 0/1).
   *   2. Constructs an HGColorMatrix (call @__ZN13HGColorMatrixC1Ev) and configures via
   *      HGColorMatrix::Scale(f, f, f)  @__ZN13HGColorMatrix5ScaleEfff.
   *   3. Constructs an HGBlur (call @__ZN6HGBlurC1Ev).
   *   4. Constructs an HGGamma (call @__ZN7HGGammaC1Ev) and calls SetPremultiplyState.
   *   5. Allocates another HGHWMultiBlend to composite the results.
   *   6. Wires the subgraph and returns via a set of virtual calls (vtable[0x60]/[0x78]/[0x260]).
   *
   * This is NOT yet transcribed. Faithful surface: throw citing @0x1af9f0. Once the referenced
   * classes (HGBlur, HGGamma, HGColorMatrix, HGHWMultiBlend, HGRenderer.GetInput) land, this
   * body can be transcribed line-for-line from the disasm in
   *   raw-port/re/disasm/Helium.HGLightWrapBlend.GetOutput.s
   */
  GetOutput(_renderer: HGRendererOpaque): HGNode {
    throw new Error(
      "HGLightWrapBlend::GetOutput not yet transcribed — 352-line body @0x1af9f0 " +
        "depends on undecoded HGBlur / HGGamma / HGColorMatrix / HGHWMultiBlend / " +
        "HGRenderer::GetInput. See raw-port/re/disasm/Helium.HGLightWrapBlend.GetOutput.s.",
    );
  }
}
