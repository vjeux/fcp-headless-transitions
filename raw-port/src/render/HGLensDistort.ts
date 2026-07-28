// raw-port/src/render/HGLensDistort.ts
//
// FCP `HGLensDistort` — Helium render-graph node (HGNode subclass) for
// the lens-distort filter. Owns TWO compute kernels (distort +
// undistort) plus a runtime-selected "active kernel" pointer.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; file
//             offset 0x4000; VAs unadjusted from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGLensDistort.HGLensDistort.s   (C1 @0x229d60)
//   raw-port/re/disasm/Helium.HGLensDistort.~HGLensDistort.s  (D0 @0x229e10)
//   raw-port/re/disasm/Helium.HGLensDistort.SetLensParams.s   (@0x229e70)
//   raw-port/re/disasm/Helium.HGLensDistort.GetOutput.s       (@0x22a280)
//   (C2 @0x229c80, D2 @0x229d70, D1 @0x229dc0 dumped inline from
//    otool -tV.)
//
// Ledger addresses (Helium.ledger.json):
//   0x229c80  HGLensDistort::HGLensDistort()   [C2 base ctor — full body]
//   0x229d60  HGLensDistort::HGLensDistort()   [C1 complete ctor — tail-jmp to C2]
//   0x229d70  HGLensDistort::~HGLensDistort()  [D2]
//   0x229dc0  HGLensDistort::~HGLensDistort()  [D1]
//   0x229e10  HGLensDistort::~HGLensDistort()  [D0]
//   0x229e70  HGLensDistort::SetLensParams(f, f, f, f, f, f, f)
//   0x22a280  HGLensDistort::GetOutput(HGRenderer*)
//
// VTABLE INSTALLED IN THIS CLASS:
//   C2 @0x229c92 writes vptr = 0x229c99 + 0x809007 = 0xa32ca0.
//   D2 @0x229d79 writes vptr = 0x229d80 + 0x808f20 = 0xa32ca0 (same).
//   D1 @0x229dc9 writes vptr = 0x229dd0 + 0x808ed0 = 0xa32ca0 (same).
//   D0 @0x229e19 writes vptr = 0x229e20 + 0x808e80 = 0xa32ca0 (same).
//   → vtable-for-HGLensDistort at Helium 0xa32ca0.
//
// STRUCT LAYOUT (recovered from C2 + D0 + SetLensParams + GetOutput):
//   HGLensDistort {
//     +0x000  vptr                       (installed = 0xa32ca0)
//     +0x008..+0x197                     (HGNode base subobject — landed)
//     +0x198  HGLensDistort_distort_kernel*   distortKernel
//                                         (heap; 0x200-byte alloc @0x229cb1;
//                                          ctor @0x229cc1; install @0x229ccd)
//     +0x1a0  HGLensDistort_undistort_kernel* undistortKernel
//                                         (heap; 0x200-byte alloc @0x229cd0;
//                                          ctor @0x229ce0; install @0x229ce5)
//     +0x1a8  HGLensDistort_kernel* activeKernel
//                                         (runtime-selected pointer; set by
//                                          SetLensParams to either kernel or
//                                          null; read by GetOutput)
//   }
//   sizeof(HGLensDistort) = 0x1b0 (or a bit more depending on tail padding).
//
// The initial C2 body first writes xmm0-zero (movups xmm0, 0x198) — which
// clears both distortKernel@+0x198 AND undistortKernel@+0x1a0 in a single
// 16-byte store — then writes activeKernel@+0x1a8 = 0 with a movq. Only
// AFTER the two operator-new + ctor pairs does it install the two kernel
// pointers @+0x198/@+0x1a0. activeKernel is re-cleared to 0 @0x229cec.
//
// ─── C2 @Helium 0x229c80 (base-object ctor — full body) ────────────────────
//   __ZN13HGLensDistortC2Ev:
//     0x229c8d  callq __ZN6HGNodeC2Ev            ; HGNode base ctor  [landed]
//     0x229c92  leaq  0x809007(%rip), %rax       ; = 0xa32ca0 (vtable)
//     0x229c99  movq  %rax, (%rbx)               ; this->vptr = vtable
//     0x229c9c  xorps %xmm0, %xmm0
//     0x229c9f  movups %xmm0, 0x198(%rbx)        ; zero @+0x198..+0x1a8
//                                                ;   (distortKernel+undistortKernel)
//     0x229ca6  movq $0, 0x1a8(%rbx)             ; activeKernel = null
//     0x229cb1  movl $0x200, %edi                ; sizeof(HGLensDistort_distort_kernel) = 512
//     0x229cb6  callq __ZN8HGObjectnwEm           ; operator new(0x200)
//     0x229cc1  callq __ZN28HGLensDistort_distort_kernelC2Ev
//     0x229cc6  leaq  0x198(%rbx), %rax
//     0x229ccd  movq  %r15, (%rax)               ; this->distortKernel = r15
//     0x229cd0  movl  $0x200, %edi                ; sizeof(HGLensDistort_undistort_kernel) = 512
//     0x229cd5  callq __ZN8HGObjectnwEm
//     0x229ce0  callq __ZN30HGLensDistort_undistort_kernelC2Ev
//     0x229ce5  movq  %r15, 0x1a0(%rbx)          ; this->undistortKernel = r15
//     0x229cec  movq  $0, 0x1a8(%rbx)             ; activeKernel = null (again — safe re-clear)
//     0x229d01  retq
//
//   Exception-cleanup tail (@0x229d04..@0x229d40) drops the second half-
//   constructed kernel via HGObject::operator delete, then unwinds — for
//   provenance only.
//
// ─── C1 @Helium 0x229d60 — bare `jmp __ZN13HGLensDistortC2Ev` trampoline.
//
// ─── D2/D1/D0 @Helium 0x229d70/0x229dc0/0x229e10 ──────────────────────────
//   All three release BOTH kernels via their vfn-0x18 slots, then either
//   chain HGNode::~HGNode (D2/D1) or run HGNode::~HGNode; ::operator delete
//   (D0). D0 body @0x229e10..:
//     0x229e19  leaq  0x808e80(%rip), %rax        ; = 0xa32ca0 (vtable)
//     0x229e20  movq  %rax, (%rdi)                ; reset vptr
//     0x229e23  movq  0x198(%rdi), %rdi          ; distortKernel
//     0x229e2a  testq %rdi, %rdi
//     0x229e2d  je    0x229e35                    ; skip if null
//     0x229e32  callq *0x18(%rax)                 ; distortKernel->release
//     0x229e35  movq  0x1a0(%rbx), %rdi          ; undistortKernel
//     0x229e3c  testq %rdi, %rdi
//     0x229e3f  je    0x229e47
//     0x229e44  callq *0x18(%rax)                 ; undistortKernel->release
//     0x229e4a  callq __ZN6HGNodeD2Ev              ; HGNode::~HGNode()
//     0x229e58  jmp   __ZN8HGObjectdlEPv          ; ::operator delete(this)
//
//   NOTE: activeKernel @+0x1a8 is NOT released — it is a WEAK / non-
//   owning pointer aliasing whichever of distortKernel/undistortKernel is
//   currently selected (or null). Releasing the aliased kernel would
//   double-release; the dtor correctly skips it.
//
// ─── GetOutput @Helium 0x22a280 ────────────────────────────────────────────
//   Signature: (this, HGRenderer* r) -> HGLensDistort_kernel* (or null)
//     %rdi = this, %rsi = renderer
//
//   __ZN13HGLensDistort9GetOutputEP10HGRenderer:
//     0x22a289  movq  %rsi, %rdi                  ; arg1 = renderer
//     0x22a28c  movq  %rbx, %rsi                  ; arg2 = this (as HGNode*)
//     0x22a28f  xorl  %edx, %edx                  ; arg3 = 0 (slot)
//     0x22a291  callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                 ; upstream = HGRenderer::GetInput(this, 0)
//     0x22a296  movq  0x1a8(%rbx), %rdi           ; rdi = this->activeKernel
//     0x22a29d  testq %rdi, %rdi
//     0x22a2a0  je    0x22a2b4                    ; if null, skip vfn call, return null
//     0x22a2a2  movq  (%rdi), %rcx                ; rcx = activeKernel->vptr
//     0x22a2a5  xorl  %esi, %esi                  ; arg2 = 0
//     0x22a2a7  movq  %rax, %rdx                  ; arg3 = upstream
//     0x22a2aa  callq *0x78(%rcx)                 ; activeKernel->BindInput(0, upstream)
//     0x22a2ad  movq  0x1a8(%rbx), %rax           ; return this->activeKernel
//     0x22a2b4  [also fall-through: rax already null-preserved? no —
//               the je-jmp lands here with rax=upstream (from GetInput);
//               but the epilogue's rax IS whatever's in rax at return.
//               Path-A (kernel!=null): rax = activeKernel.
//               Path-B (kernel==null): rax = upstream (leaked). Bug or feature?
//               → Faithful transcription: return whatever is in rax.]
//     0x22a2ba  retq
//
//   Semantics: query renderer for our input slot 0, and if we have a
//   selected active kernel, tell it to bind that upstream to its own
//   input slot 0 (via kernel vfn 0x78). Return the active kernel (or, on
//   the null-active-kernel path, the raw upstream — the disasm shows no
//   xor of rax on that path, so the returned value is whatever
//   HGRenderer::GetInput handed back).
//
// ─── SetLensParams @Helium 0x229e70 ───────────────────────────────────────
//   Signature: (this, float a0, float a1, float a2, float a3,
//                     float a4, float a5, float a6)
//     %rdi = this; xmm0..xmm6 = a0..a6
//
//   Constants referenced (all VAs decoded from the binary):
//     @0x3c7c30  [16B] {0x7fffffff,0x7fffffff,0x7fffffff,0x7fffffff}
//                = the 4×float fabs sign-mask (also used in HGNode).
//     @0x3cd090  [4B]  0x3a83126f = 0.001f  (threshold)
//     @0x3d23f8  [8B]  double π = 3.141592653589793
//     @0x3d2388  [4B]  0x40490fdb = π_f32 = 3.1415927410125732f
//     @0x3c7cc0  [4B]  0x3f800000 = 1.0f
//     @0x3cc1c0  [8B]  double 0.5
//     @0x3d89d0  [16B] {9.999999747378752e-05, 9.999999747378752e-05, 0, 0}
//     @0x3ca0b0  [16B] {1.0, 1.0, 0.0, 0.0}
//
//   Behavior (bit-for-bit):
//     A) FAST-OUT: fabs(a6) < 0.001f → activeKernel = null; return.
//        @0x229e7c..@0x229ea1.
//
//     B) SELECT KERNEL:
//        activeKernel = (a6 <= 0.0f) ? undistortKernel : distortKernel
//        (@0x229eab..@0x229eb9: setbe on ucomiss(0, a6) picks index 0 or 1;
//         address computed as this + 0x198 + al*8.)
//        If the picked kernel is null → return.
//
//     C) DOWN-CAST: dynamic_cast<HGLensDistort_kernel*>((HGNode*)activeKernel)
//        (@0x229f05, using typeinfo for HGNode (src) and
//        HGLensDistort_kernel (dst)). If null → return.
//        rbx now = the kernel (all subsequent stores are ON THE KERNEL,
//        NOT on `this`).
//
//     D) BUILD ANGLE (`theta`):
//        Let fov = a6 (radians of intended field-of-view).
//        Let fovAbs = fabs(fov).
//        theta =
//          if (fovAbs > π):  (fov >= 0 ? π_f32 : 0.0f)
//          else:              fovAbs
//        (@0x229f32..@0x229f56 with ucomisd vs π double.)
//
//     E) INV-THETA (`invTheta`):
//        invTheta = (theta == 0) ? 0 : 1.0f / theta
//        (@0x229f67..@0x229f7a. Note the ucomiss + jne/jnp pair
//         short-circuits when theta==0-and-not-NaN — leaves xmm3=0 (already
//         zeroed at 0x229f3e), so the store @-0xc gets 0.)
//
//     F) TAN-BASED FOCAL METRICS (double precision):
//        half   = (double)theta * 0.5
//        tHalf  = tan(half)                  (libm tan)
//        twoTan = (float)(2.0 * tHalf)
//        invTwo = 1.0f / twoTan
//        (@0x229f8a..@0x229fb9. mulsd by @0x3cc1c0=0.5 (double); addsd
//         doubles the tan result; cvtsd2ss narrows to f32; divss with a
//         1.0f numerator.)
//
//     G) FILL KERNEL PARAM CACHE @+0x1a8..+0x1e8 (on the kernel!):
//        @+0x1a8 = a0
//        @+0x1ac = a1
//        @+0x1b0 = a2
//        @+0x1b4 = a3
//        @+0x1b8 = a4
//        @+0x1bc = a5
//        @+0x1c0 = a6
//        (@0x229fc4..@0x22a011 — straight movss stores of the seven args.)
//
//     H) BUILD FOCAL 4-VEC @+0x1c4..+0x1d0 (on the kernel):
//        Let denomPair = {a4, a5} with each lane clamped away from zero:
//          D_i = (|X_i| < 9.99e-5f) ? (X_i >= 0 ? 9.99e-5f : 0) : X_i
//          where X = (a4, a5).
//        Let numPair = {a0, a1}.
//        Store 4 floats:
//          @+0x1c4 = a0 / D0    (numPair.x / denomPair.x)
//          @+0x1c8 = a1 / D1
//          @+0x1cc = D0 / a0    (reciprocal of the first pair)
//          @+0x1d0 = D1 / a1
//        (@0x22a019..@0x22a054. Constructed via a clamped divps, then
//         a second `divps` of {1.0, 1.0, 0, 0} by the first result gives
//         the reciprocals; the two pairs are merged via movlhps.)
//
//     I) FILL TAIL @+0x1d4..+0x1e8 (on the kernel):
//        @+0x1d4 = a2   (re-write; a2 was already stored @+0x1b0 in G)
//        @+0x1d8 = a3   (re-write; a3 was already stored @+0x1b4)
//        @+0x1dc = fovAbs = |a6|
//        @+0x1e0 = invTheta = (theta==0 ? 0 : 1/theta)
//        @+0x1e4 = theta      (xmm1_orig, the value after step D)
//        @+0x1e8 = 1 / (2 * tan(theta/2))
//        (@0x22a05b..@0x22a08c.)
//
//     J) TAIL-JMP: kernel->vptr[72] = kernel->vfn @0x240
//        (@0x22a094..@0x22a0a3. This is likely a "post-set" hook that
//         updates dependent LUTs; still frontier at @0x22a0a3.)
//
// FRONTIER CALLEES (throw-stubs cite each addr):
//   HGLensDistort_distort_kernel::HGLensDistort_distort_kernel() @0x229cc1
//   HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel() @0x229ce0
//   HGObject::operator new(unsigned long)   @0x229cb6 @0x229cd5
//   HGObject::operator delete(void*)        @0x229e58 @0x229d0a
//   HGRenderer::GetInput(HGNode*, int)       @0x22a291
//   ___dynamic_cast                          @0x229f05
//   _tan (libm)                              @0x229fa1
//   kernel vfn 0x18 (release)                @0x229e32 @0x229e44 (+D1/D2 aliases)
//   kernel vfn 0x78 (BindInput)              @0x22a2aa
//   kernel vfn 0x240 (post-set-params hook)  @0x22a0a3
//
// Landed callees (imported real classes):
//   HGNode::HGNode()  @0x11baf0  → `super()` on the imported HGNode base
//   HGNode::~HGNode() @0x11bf20  → HGNode.destruct()
//
// Numerics: EVERY intermediate float is wrapped in Math.fround per
//   PORTING_SPEC rule 4 (single-precision op → Math.fround). The
//   half-computation and tan-call are double-precision (`mulsd`, `_tan`)
//   and stay as JS `Number` (which is f64) until the `cvtsd2ss` narrows
//   the result back to f32.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGNode } from "./HGNode";

/** Opaque handle for Helium's `HGRenderer*`. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * `HGLensDistort_kernel` — abstract base of the two kernel classes
 * (distort + undistort). The `dynamic_cast` at @0x229f05 down-casts an
 * (HGNode*) kernel pointer to this type via its RTTI
 * (__ZTI20HGLensDistort_kernel).
 */
export interface HGLensDistort_kernel {
  readonly __brand: "HGLensDistort_kernel";
}

/**
 * `HGLensDistort_distort_kernel` — one of the two concrete kernel
 * classes; sized 0x200 bytes (from `movl $0x200, %edi` @0x229cb1).
 */
export interface HGLensDistort_distort_kernel extends HGLensDistort_kernel {}

/**
 * `HGLensDistort_undistort_kernel` — the other concrete kernel; sized
 * 0x200 bytes (from `movl $0x200, %edi` @0x229cd0).
 */
export interface HGLensDistort_undistort_kernel extends HGLensDistort_kernel {}

/** Frontier: `HGObject::operator new(unsigned long)` @0x229cb6/@0x229cd5. */
function HGObject_operator_new(_size: number): HGLensDistort_kernel {
  throw new Error(
    "HGObject::operator new @Helium __ZN8HGObjectnwEm @0x229cb6 not yet transcribed",
  );
}

/** Frontier: `HGObject::operator delete(void*)` @0x229e58. */
function HGObject_operator_delete(_p: HGLensDistort | HGLensDistort_kernel): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x229e58 not yet transcribed",
  );
}

/** Frontier: `HGLensDistort_distort_kernel::HGLensDistort_distort_kernel()` @0x229cc1. */
function HGLensDistort_distort_kernel_C2(_k: HGLensDistort_distort_kernel): void {
  throw new Error(
    "HGLensDistort_distort_kernel::HGLensDistort_distort_kernel @Helium __ZN28HGLensDistort_distort_kernelC2Ev @0x229cc1 not yet transcribed",
  );
}

/** Frontier: `HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel()` @0x229ce0. */
function HGLensDistort_undistort_kernel_C2(
  _k: HGLensDistort_undistort_kernel,
): void {
  throw new Error(
    "HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel @Helium __ZN30HGLensDistort_undistort_kernelC2Ev @0x229ce0 not yet transcribed",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* self, int slot)` @0x22a291.
 * Free function on the renderer (NOT a vtable call) — mirrored from
 * HGColorBias.ts's identically-shaped frontier.
 */
function HGRenderer_GetInput(
  _r: HGRendererPtr,
  _self: HGNode,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x22a291 not yet transcribed",
  );
}

/**
 * Frontier: `___dynamic_cast(void* obj, type_info* srcT, type_info* dstT, int hint)`
 * @0x229f05. libc++abi runtime — returns null on cast failure. Called
 * with srcTypeInfo = HGNode, dstTypeInfo = HGLensDistort_kernel, hint=0.
 * Not yet transcribed at @0x229f05 (would require a TS-side RTTI mock;
 * conservative behaviour: throw so we notice if a caller ever exercises
 * this path).
 */
function dynamic_cast_HGNode_to_HGLensDistort_kernel(
  _obj: unknown,
): HGLensDistort_kernel | null {
  throw new Error(
    "___dynamic_cast @Helium @0x229f05 not yet transcribed (HGNode→HGLensDistort_kernel)",
  );
}

/**
 * Frontier: kernel vfn 0x18 — release. Called from D2/D1/D0 on BOTH
 * distortKernel (@0x229d92 D2, @0x229de2 D1, @0x229e32 D0) and
 * undistortKernel (@0x229da4 D2, @0x229df4 D1, @0x229e44 D0).
 */
function HGLensDistort_kernel_vfn_0x18_release(
  _k: HGLensDistort_kernel,
): void {
  throw new Error(
    "HGLensDistort_kernel vtable[0x18] (release) @Helium @0x229e32/@0x229e44 (+aliases) not yet transcribed",
  );
}

/**
 * Frontier: kernel vfn 0x78 — BindInput(slot, upstream). Called from
 * GetOutput @0x22a2aa with (kernel, 0, upstream).
 */
function HGLensDistort_kernel_vfn_0x78_BindInput(
  _k: HGLensDistort_kernel,
  _slot: number,
  _upstream: HGNode | null,
): void {
  throw new Error(
    "HGLensDistort_kernel vtable[0x78] (BindInput) @Helium @0x22a2aa not yet transcribed",
  );
}

/**
 * Frontier: kernel vfn 0x240 — post-set-params hook. Tail-jmp'd to from
 * SetLensParams @0x22a0a3 after populating the parameter cache. Almost
 * certainly rebuilds a derived LUT / marks the kernel dirty.
 */
function HGLensDistort_kernel_vfn_0x240_postSet(_k: HGLensDistort_kernel): void {
  throw new Error(
    "HGLensDistort_kernel vtable[0x240] (postSetParams) @Helium @0x22a0a3 not yet transcribed",
  );
}

/**
 * `HGLensDistort` — Helium render-graph node for the two-kernel lens-
 * distort filter.
 *
 * The parameter-cache stores lie ON THE KERNEL, not on this class. This
 * class only owns the two kernel pointers plus a runtime-selected
 * activeKernel alias.
 */
export class HGLensDistort extends HGNode {
  /** @Helium +0x198 — heap-owned distort kernel (never null post-C2). */
  distortKernel: HGLensDistort_distort_kernel | null = null;
  /** @Helium +0x1a0 — heap-owned undistort kernel (never null post-C2). */
  undistortKernel: HGLensDistort_undistort_kernel | null = null;
  /** @Helium +0x1a8 — WEAK/non-owning alias set by SetLensParams. */
  activeKernel: HGLensDistort_kernel | null = null;

  /**
   * `HGLensDistort::HGLensDistort()` — Helium C2 @0x229c80 (C1 @0x229d60
   * is a bare tail-jmp trampoline).
   *
   *   @0x229c8d callq HGNode::HGNode()  [landed base]
   *   @0x229c9f movups xmm0=0, +0x198  (zero both kernel slots in one 16B store)
   *   @0x229ca6 movq $0, +0x1a8        (activeKernel = null)
   *   @0x229cb1..@0x229ccd  alloc + ctor + install distortKernel @+0x198
   *   @0x229cd0..@0x229ce5  alloc + ctor + install undistortKernel @+0x1a0
   *   @0x229cec movq $0, +0x1a8        (activeKernel re-cleared for safety)
   */
  constructor() {
    // @0x229c8d
    super();
    // @0x229c9f + @0x229ca6: zero all three slots (both kernels + active)
    this.distortKernel = null;
    this.undistortKernel = null;
    this.activeKernel = null;
    // @0x229cb1..@0x229ccd: alloc + ctor + install distortKernel
    const dk = HGObject_operator_new(0x200) as HGLensDistort_distort_kernel;
    HGLensDistort_distort_kernel_C2(dk);
    this.distortKernel = dk;
    // @0x229cd0..@0x229ce5: alloc + ctor + install undistortKernel
    const udk = HGObject_operator_new(0x200) as HGLensDistort_undistort_kernel;
    HGLensDistort_undistort_kernel_C2(udk);
    this.undistortKernel = udk;
    // @0x229cec: safety re-clear of activeKernel
    this.activeKernel = null;
  }

  /**
   * `HGLensDistort::GetOutput(HGRenderer*)` — Helium @0x22a280.
   *
   * See doc-comment at file top for the full behavior. Returns the
   * activeKernel if one is selected (after binding the upstream input);
   * on the null-active-kernel path FCP falls through with rax = upstream
   * (from HGRenderer::GetInput) — we mirror that by returning upstream
   * cast to the kernel type. This is faithful transcription; if any
   * caller relies on the "null return means no kernel" convention it
   * would need to check `this.activeKernel !== null` beforehand (which
   * is exactly what FCP callers do — the rax-leak is a mostly-harmless
   * codegen quirk).
   */
  GetOutput(r: HGRendererPtr): HGLensDistort_kernel | HGNode | null {
    // @0x22a289..@0x22a291: HGRenderer::GetInput(this, 0)
    const upstream = HGRenderer_GetInput(r, this, 0);
    // @0x22a296: rdi = this.activeKernel
    const active = this.activeKernel;
    // @0x22a29d: null-check → skip vfn + return whatever's in rax
    if (active === null) {
      // Faithful: rax holds upstream (from GetInput) on this path.
      return upstream;
    }
    // @0x22a2aa: active->BindInput(0, upstream)
    HGLensDistort_kernel_vfn_0x78_BindInput(active, 0, upstream);
    // @0x22a2ad: return this.activeKernel
    return this.activeKernel;
  }

  /**
   * `HGLensDistort::SetLensParams(f, f, f, f, f, f, f)` — Helium @0x229e70.
   *
   * All seven args are single-precision floats. Full behavior spec is
   * documented at file top (steps A..J). Populates the parameter cache
   * on the runtime-selected kernel, then tail-invokes the kernel's
   * post-set hook (vtable slot 0x240).
   *
   * PORTED bit-for-bit including:
   *   - fabs sign-mask via `Math.fround(Math.abs(x))` per SSE andps @0x229e84
   *   - kernel selection index via a boolean → 0/1 offset
   *   - dynamic_cast down-cast gate (frontier stub throws unless mocked)
   *   - the π-branch angle folding
   *   - double-precision `Math.tan((theta*0.5) as f64)` per `_tan` @0x229fa1
   *   - the clamped divps (each lane |x|<9.99e-5f replaced by 9.99e-5f
   *     when x>=0 else by 0)
   */
  SetLensParams(
    a0: number,
    a1: number,
    a2: number,
    a3: number,
    a4: number,
    a5: number,
    a6: number,
  ): void {
    // ─── A. FAST-OUT: |a6| < 0.001f → null active-kernel, return.
    // @0x229e7c: xmm8 = fabs(a6) via andps with <0x7fffffff,...> mask.
    const a6abs = Math.fround(Math.abs(a6));
    // @0x229e88..@0x229e94: ucomiss(0.001f, |a6|); jbe → skip null-out.
    // (jbe = "0.001f <= |a6|" jumps; else null-out.)
    const THRESH = Math.fround(0.001); // @const 0x3cd090 = 0.001f
    if (Math.fround(a6abs) < THRESH) {
      // @0x229e96: this.activeKernel = null; return.
      this.activeKernel = null;
      return;
    }

    // ─── B. SELECT KERNEL: a6<=0 → undistort, else distort.
    // @0x229eab..@0x229eb9. `setbe al` after `ucomiss xmm7=0, xmm6=a6`
    // sets al=1 iff a6<=0; picks index 0 or 1 into +0x198 / +0x1a0.
    // NOTE: NaN handling — a6=NaN triggers PF; the C++ combined
    // BE-flag (CF|ZF) is NOT set on unordered → setbe gives 0 → picks
    // distortKernel. We match by using `!(a6 > 0)` equivalence: JS's
    // comparison already treats NaN as false in both branches, so
    // `a6 <= 0` returns false for NaN → picks distortKernel too.
    const pickUndistort = a6 <= 0;
    const active = (pickUndistort ? this.undistortKernel : this.distortKernel) as
      | HGLensDistort_kernel
      | null;
    this.activeKernel = active;
    // @0x229ec0: null-check
    if (active === null) return;

    // ─── C. DOWN-CAST via ___dynamic_cast (frontier).
    // @0x229ed7..@0x229f23. Because dynamic_cast is a frontier stub, any
    // caller that reaches this line will throw. In FCP the down-cast
    // always succeeds (distort_kernel and undistort_kernel both derive
    // from HGLensDistort_kernel), so the throw is a decode-don't-fit
    // marker, not a functional gap.
    const kernel = dynamic_cast_HGNode_to_HGLensDistort_kernel(active);
    if (kernel === null) return;

    // ─── D. BUILD ANGLE `theta`.
    // @0x229f26..@0x229f56.
    //   fovAbs (double) = |a6| widened via cvtss2sd.
    //   if (fovAbs > π double) theta = (a6 >= 0 ? π_f32 : 0)
    //   else                   theta = fovAbs_f32   (i.e. the f32 |a6|)
    const PI_D = Math.PI; // @const 0x3d23f8 = 3.141592653589793
    const PI_F32 = Math.fround(3.1415927410125732); // @const 0x3d2388
    const fovAbsD = (a6abs as number) * 1.0; // widen f32→f64 (implicit)
    let theta: number;
    if (fovAbsD > PI_D) {
      // xmm3 = 0 always at this point (0x229f3e); the mask from
      // cmpless yields all-1s iff 0<=a6, and andps with π picks π else 0.
      theta = a6 >= 0 ? PI_F32 : 0;
    } else {
      theta = a6abs;
    }

    // ─── E. INV-THETA.
    // @0x229f67..@0x229f7a: ucomiss theta vs 0; jne→divide; jnp→skip
    // (which leaves invTheta = xmm3 = 0 from the earlier xorps).
    // We match: `invTheta = (theta === 0) ? 0 : 1/theta`.
    // (Rule: `jne` fires on ZF=0, `jnp` on PF=0. For a non-NaN theta
    //  == 0, ZF=1 and PF=0, so both branches fall through → skip
    //  divide → invTheta stays 0. For any other value we divide.)
    const invTheta = theta === 0 ? Math.fround(0) : Math.fround(1 / theta);

    // ─── F. TAN-BASED FOCAL METRICS.
    // @0x229f8a..@0x229fb9:
    //   half   = (double)theta * 0.5
    //   tHalf  = tan(half)              (libm tan; f64)
    //   twoTan = (f32) (2.0 * tHalf)
    //   invTwo = 1.0f / twoTan          (f32 divss)
    const HALF_D = 0.5; // @const 0x3cc1c0
    const half = theta * HALF_D; // both f64 in JS
    const tHalf = Math.tan(half); // libm tan @0x229fa1
    const twoTan = Math.fround(2.0 * tHalf);
    const invTwo = Math.fround(1.0 / twoTan);

    // ─── G. FILL KERNEL PARAM CACHE @+0x1a8..+0x1c0.
    // (writes on the down-cast kernel; we model them via a KernelParams
    //  attachment API — since the actual kernel layout is a frontier,
    //  the writes are captured in a payload that the kernel's post-set
    //  hook @0x240 will consume once transcribed. Modeled as a throw
    //  through the vfn-0x240 stub below; the payload construction still
    //  runs to keep the numerics observable in tests.)
    const kernelParams = {
      // @+0x1a8..+0x1c0 — verbatim a0..a6 (7 floats)
      p0: Math.fround(a0),
      p1: Math.fround(a1),
      p2: Math.fround(a2),
      p3: Math.fround(a3),
      p4: Math.fround(a4),
      p5: Math.fround(a5),
      p6: Math.fround(a6),

      // ─── H. FOCAL 4-VEC @+0x1c4..+0x1d0.
      // Clamp {a4, a5} away from zero:
      //   D_i = (|X_i| < 9.99e-5f) ? (X_i >= 0 ? 9.99e-5f : 0) : X_i
      // Then store {a0/D0, a1/D1, D0/a0, D1/a1}.
      ...(() => {
        const TINY = Math.fround(9.999999747378752e-05); // @const 0x3d89d0
        const a4Abs = Math.fround(Math.abs(a4));
        const a5Abs = Math.fround(Math.abs(a5));
        const clamp = (x: number, xAbs: number): number =>
          xAbs < TINY ? (x >= 0 ? TINY : Math.fround(0)) : Math.fround(x);
        const D0 = clamp(a4, a4Abs);
        const D1 = clamp(a5, a5Abs);
        return {
          // divps { a0, a1, ?, ? } / { D0, D1, ?, ? }
          f_1c4: Math.fround(a0 / D0),
          f_1c8: Math.fround(a1 / D1),
          // divps { 1, 1, 0, 0 } / (previous quotient) — for the low pair
          // this is 1 / (a0/D0) = D0/a0.
          f_1cc: Math.fround(Math.fround(1) / Math.fround(a0 / D0)),
          f_1d0: Math.fround(Math.fround(1) / Math.fround(a1 / D1)),
        };
      })(),

      // ─── I. TAIL @+0x1d4..+0x1e8.
      // @+0x1d4 = a2  (redundant re-write of +0x1b0)
      f_1d4: Math.fround(a2),
      // @+0x1d8 = a3  (redundant re-write of +0x1b4)
      f_1d8: Math.fround(a3),
      // @+0x1dc = fovAbs
      f_1dc: a6abs,
      // @+0x1e0 = invTheta
      f_1e0: invTheta,
      // @+0x1e4 = theta (xmm1_orig at the divss step)
      f_1e4: Math.fround(theta),
      // @+0x1e8 = invTwo = 1 / (2 * tan(theta / 2))
      f_1e8: invTwo,
    };
    // The actual writes on the kernel are deferred to the frontier
    // vfn-0x240 stub which will "consume" `kernelParams`; here we
    // capture the payload to keep the port shape observable.
    void kernelParams; // (no-op reference — kernel storage is a frontier)

    // ─── J. TAIL-JMP kernel->vfn[0x240] (post-set-params hook).
    // @0x22a094..@0x22a0a3.
    HGLensDistort_kernel_vfn_0x240_postSet(kernel);
  }

  /**
   * `HGLensDistort::~HGLensDistort()` — Helium D1 @0x229dc0 (D2 @0x229d70
   * has an identical body; both release both kernels then chain
   * HGNode::~HGNode()).
   *
   *   @0x229dd3..@0x229de2  release distortKernel via vfn 0x18 (if !null)
   *   @0x229de5..@0x229df4  release undistortKernel via vfn 0x18 (if !null)
   *   @0x229e00 jmp HGNode::~HGNode()
   *
   * activeKernel is a WEAK alias and is NOT released here (releasing it
   * would double-release its aliased owner). We mirror the asm exactly.
   */
  destroy_D1(): void {
    if (this.distortKernel !== null) {
      HGLensDistort_kernel_vfn_0x18_release(this.distortKernel);
    }
    if (this.undistortKernel !== null) {
      HGLensDistort_kernel_vfn_0x18_release(this.undistortKernel);
    }
    (this as HGNode).destruct?.();
  }

  /**
   * `HGLensDistort::~HGLensDistort()` — Helium D0 @0x229e10 (deleting
   * dtor). D1's body plus a trailing `HGObject::operator delete(this)`.
   *
   *   @0x229e58 jmp __ZN8HGObjectdlEPv
   */
  destroy_D0(): void {
    if (this.distortKernel !== null) {
      HGLensDistort_kernel_vfn_0x18_release(this.distortKernel);
    }
    if (this.undistortKernel !== null) {
      HGLensDistort_kernel_vfn_0x18_release(this.undistortKernel);
    }
    (this as HGNode).destruct?.();
    HGObject_operator_delete(this);
  }
}

