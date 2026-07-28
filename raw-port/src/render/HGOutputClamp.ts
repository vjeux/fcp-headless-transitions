// raw-port/src/render/HGOutputClamp.ts
//
// FCP `HGOutputClamp` — Helium render-graph node that clamps a video
// signal to a target output range. Subclass of HGNode. Structurally a
// thin *wrapper* around one of two concrete backing filters, chosen at
// construction by a `Mode` enum:
//   - Mode == 0 (HGOutputClamp::Mode::RGBOnly)  -> HgcOutputClamp_RGBOnly
//                                                   (clamps only the 3 RGB channels)
//   - Mode != 0 (any other value)               -> HgcOutputClamp
//                                                   (full clamper: Yp, Cb, Cr, R, G, B)
//
// The wrapper's six Set_*_coef() setters each forward through the backing
// filter's vtable slot *0x60 with a channel-index passed in %esi:
//     Yp: 0    Cb: 1    Cr: 2    R: 3    G: 4    B: 5
// The four float args (arg1..arg4 = %xmm0..%xmm3) are preserved by the
// SysV x86_64 ABI across the tail-call, so the backing filter's
// SetCoef(int channel, float, float, float, float) reads them directly.
//
// GetOutput() dispatches TWO vtable calls: first this->vtable[0x80](this, 0)
// to trigger the base render pass, then inner->vtable[0x78](inner, 0, result)
// to attach the clamp filter to the produced HGNode. Both slots are on
// HGNode / HGObject inherited vtables and are unresolved (FRONTIER) —
// HGNode.ts's vtable map presently enumerates only slots *0x00..*0x80.
//
// FRAMEWORK: Helium.framework  (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGOutputClamp.*.s
//
// EXPORTED SYMBOLS (Helium x86_64 slice; VAs from `nm -arch x86_64`):
//   @0x1ac7a0  HGOutputClamp::HGOutputClamp(Mode)                      [C2 base ctor]
//   @0x1ac8f0  HGOutputClamp::HGOutputClamp(Mode)                      [C1 complete ctor — tail-jmp to C2]
//   @0x1acab0  HGOutputClamp::~HGOutputClamp()                          [D0 deleting dtor]
//   @0x1aca70  HGOutputClamp::~HGOutputClamp()                          [D1 complete dtor]
//   @0x1ac940  HGOutputClamp::Set_Yp_coef(float, float, float, float)  ch=0
//   @0x1ac970  HGOutputClamp::Set_Cb_coef(float, float, float, float)  ch=1
//   @0x1ac9b0  HGOutputClamp::Set_Cr_coef(float, float, float, float)  ch=2
//   @0x1ac9e0  HGOutputClamp::Set_R_coef(float, float, float, float)   ch=3
//   @0x1aca10  HGOutputClamp::Set_G_coef(float, float, float, float)   ch=4
//   @0x1aca40  HGOutputClamp::Set_B_coef(float, float, float, float)   ch=5
//   @0x1ac900  HGOutputClamp::GetOutput(HGRenderer*)
//
// VTABLE (verified via `tools/vtable.py Helium HGOutputClamp`):
//   HGOutputClamp vtable @0xa26458  installed-ptr 0xa26468  (base+0x10)
//     *0x00 -> 0x1aca70  ~HGOutputClamp()   [D1]
//     *0x08 -> 0x1acab0  ~HGOutputClamp()   [D0]
//   All other slots are INHERITED from HGNode (no override recorded).
//
// STRUCT LAYOUT (recovered from C2 @0x1ac7a0 field-by-field):
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts). C2 tail-calls
//                    HGNode::HGNode() @0x1ac7b0 before own-field writes.
//   ---- HGOutputClamp-specific fields (start at 0x198) ----
//     0x198 : u32          mode           (ctor: `movl %r14d, 0x198(%rbx)` @0x1ac7bf;
//                                          `%r14d` = arg1 (Mode enum). All Set_*_coef
//                                           methods gate on this being non-zero;
//                                           the two ctor branches use `testl %r14d`.)
//     0x1a0 : HGObject*    inner          (backing filter; either HgcOutputClamp or
//                                          HgcOutputClamp_RGBOnly). Ctor allocates via
//                                          HGObject::operator new(0x1a0) then calls the
//                                          appropriate C1 (@0x1ac7e6 or @0x1ac814).
//                                          D0/D1 dtors release via vcall *0x18.
//                                          Note: sizeof(inner) = 0x1a0 (same size as
//                                          HGNode base), consistent with both being
//                                          HGNode subclasses.
//   sizeof(HGOutputClamp) = 0x1a8 (last field at 0x1a0 + sizeof(HGObject*)=8).
//
// External call targets (all @Helium):
//   __ZN8HGObjectnwEm                 HGObject::operator new(unsigned long)   @stub
//   __ZN8HGObjectdlEPv                HGObject::operator delete(void*)        @stub
//   __ZN14HgcOutputClampC1Ev          HgcOutputClamp::HgcOutputClamp()        @stub
//   __ZN22HgcOutputClamp_RGBOnlyC1Ev  HgcOutputClamp_RGBOnly::HgcOutputClamp_RGBOnly() @stub
//   __ZN6HGNodeC2Ev                   HGNode::HGNode()                        (base ctor)
//   __ZN6HGNodeD2Ev                   HGNode::~HGNode()                       (base dtor)
//
// FRONTIER (each cited in place):
//   - HgcOutputClamp        — the actual full 6-channel clamp filter (holds the
//                             SetCoef vtable slot *0x60 and GetOutput slot *0x78).
//                             Its own class port lives elsewhere (not yet decoded).
//   - HgcOutputClamp_RGBOnly — RGB-only variant.  Its 3 Y'CbCr Set_*_coef paths
//                             return -1 via the wrapper's mode==0 gate.
//   - HGNode / HGObject vtable slots *0x18, *0x60, *0x78, *0x80.

import { HGNode } from "./HGNode";
import { HGObject } from "./HGObject";

/**
 * Opaque HGRenderer handle. HGOutputClamp only reaches it through the
 * this-vtable dispatch at GetOutput @0x1ac916, so no HGRenderer method
 * signatures need to be modeled here — the vcall goes through
 * this.vtable[0x80] via a FRONTIER helper below.
 */
export interface HGRendererApi {
  readonly __brand_HGRenderer: unique symbol;
}

/**
 * `HGOutputClamp::Mode` — the enum passed to the ctor.
 *
 * The disassembly of C2 @0x1ac7a0 shows a single `testl %r14d,%r14d ; je
 * 0x1ac804` branch, meaning ONLY the "zero vs non-zero" distinction is
 * observable in the ctor. So the enum has at least two visible values:
 *   0  -> HgcOutputClamp_RGBOnly branch (@0x1ac804 -> C1 @0x1ac814)
 *   *  -> HgcOutputClamp branch        (@0x1ac7d6 -> C1 @0x1ac7e6)
 *
 * No enum-name symbols were found in the ProCore/Helium tables — the
 * enum's ordinal names are not exposed. We label the two observed
 * values by the FILTER they select. Any future decode that finds the
 * source name should re-alias these two.
 */
export enum HGOutputClampMode {
  /** Ctor branch @0x1ac804 (mode==0). Selects HgcOutputClamp_RGBOnly. */
  RGBOnly = 0,
  /** Ctor branch @0x1ac7d6 (any non-zero). Selects the full HgcOutputClamp. */
  All = 1,
}

/**
 * Backing filter — either `HgcOutputClamp` (all 6 channels) or
 * `HgcOutputClamp_RGBOnly` (RGB only). We model it as an opaque
 * HGObject-derived handle. Every method the wrapper reaches is via
 * `inner.vtable[slot]` — those slots are declared as FRONTIER free-
 * function helpers below so each vcall CITES its slot address.
 */
export interface HGOutputClampInnerFilter extends HGObject {
  readonly __brand_HGOutputClampInner: unique symbol;
}

/**
 * `HGOutputClamp` — Helium render-graph node clamping the RGB (or
 * Y'CbCr+RGB) channels of an incoming signal. Subclass of HGNode.
 *
 * State:
 *   - inherited HGNode (0x000..0x197)
 *   - mode (@0x198): u32 selector (0 == RGBOnly, non-zero == All).
 *   - inner (@0x1a0): backing HGObject filter.
 */
export class HGOutputClamp extends HGNode {
  /**
   * @Helium +0x198 — the Mode selector, stored as a raw u32. Every
   * Set_*_coef method inspects this via `cmpl $0x0, 0x198(%rdi)`.
   */
  mode: number;

  /**
   * @Helium +0x1a0 — backing filter. Allocated in-ctor via
   * `HGObject::operator new(0x1a0)`, constructed via one of two C1
   * bodies, and released in ~HGOutputClamp via `inner->vtable[0x18]`.
   */
  inner: HGOutputClampInnerFilter | null;

  /**
   * `HGOutputClamp::HGOutputClamp(Mode)` — Helium @0x1ac7a0 [C2]. C1 body
   * @0x1ac8f0 is a bare tail-jmp to C2:
   *
   *   0x1ac8f0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   0x1ac8f5  jmp __ZN13HGOutputClampC2ENS_4ModeE
   *
   * C2 body (verbatim):
   *   0x1ac7aa  movl %esi, %r14d              ; save Mode arg
   *   0x1ac7ad  movq %rdi, %rbx               ; save this
   *   0x1ac7b0  callq HGNode::HGNode()        ; base ctor
   *   0x1ac7b5  leaq 0x879cac(%rip), %rax     ; = own vtable installed-ptr @0xa26468
   *   0x1ac7bc  movq %rax, (%rbx)             ; install own vtable
   *   0x1ac7bf  movl %r14d, 0x198(%rbx)       ; mode = arg
   *   0x1ac7c6  movq $0x0, 0x1a0(%rbx)        ; inner = null
   *
   *   0x1ac7d1  testl %r14d, %r14d
   *   0x1ac7d4  je   0x1ac804                 ; mode == 0 -> RGBOnly branch
   *
   *   ; ---- mode != 0 branch (@0x1ac7d6..0x1ac802) ----
   *   0x1ac7d6  movl $0x1a0, %edi             ; alloc size = 0x1a0 bytes
   *   0x1ac7db  callq HGObject::operator new  ; %rax = new obj
   *   0x1ac7e0  movq %rax, %r14
   *   0x1ac7e6  callq HgcOutputClamp::HgcOutputClamp()  ; construct in place
   *   0x1ac7eb  movq 0x1a0(%rbx), %rdi        ; old inner (null on first call)
   *   0x1ac7f2  cmpq %r14, %rdi               ; if same as new, skip release
   *   0x1ac7f5  je   0x1ac842
   *   0x1ac7f7  testq %rdi, %rdi              ; if old is null, skip
   *   0x1ac7fa  je   0x1ac830
   *   0x1ac7fc..0x1ac802  release old via vcall *0x18
   *   -> falls through to 0x1ac830
   *
   *   ; ---- mode == 0 branch (@0x1ac804..0x1ac82d) ----
   *   0x1ac804  movl $0x1a0, %edi
   *   0x1ac809  callq HGObject::operator new
   *   0x1ac80e  movq %rax, %r14
   *   0x1ac814  callq HgcOutputClamp_RGBOnly::HgcOutputClamp_RGBOnly()
   *   0x1ac819  movq 0x1a0(%rbx), %rdi
   *   0x1ac820  cmpq %r14, %rdi ; je 0x1ac852
   *   0x1ac825  testq %rdi, %rdi ; je 0x1ac830
   *   0x1ac82a..0x1ac82d  release old via vcall *0x18
   *
   *   ; ---- convergence ----
   *   0x1ac830  movq %r14, 0x1a0(%rbx)        ; inner = new obj
   *   0x1ac841  ret
   *
   * Since inner is nulled at 0x1ac7c6 BEFORE the alloc, both `je 0x1ac842`
   * and `je 0x1ac852` paths (where old == new) are unreachable on a fresh
   * construction — those are exception-cleanup landing pads emitted by
   * the compiler for the case where HgcOutputClamp*::C1() throws.
   * Similarly `movq %rax, %rdi ; callq ___clang_call_terminate` at 0x1ac862/
   * 0x1ac86a are noexcept-terminate unwinds.
   */
  constructor(mode: HGOutputClampMode) {
    // @0x1ac7b0: HGNode base ctor (via TS super()).
    super();
    // @0x1ac7bc: install own vtable installed-ptr @0xa26468.
    this.vtable = 0xa26468;
    // @0x1ac7bf: store mode as-is (u32).
    this.mode = mode | 0;
    // @0x1ac7c6: inner = null (before any alloc).
    this.inner = null;

    // @0x1ac7d1..0x1ac7d4: branch on mode==0.
    if (this.mode !== 0) {
      // @0x1ac7d6..0x1ac7e6: alloc + construct HgcOutputClamp.
      this.inner = HgcOutputClamp_new();
    } else {
      // @0x1ac804..0x1ac814: alloc + construct HgcOutputClamp_RGBOnly.
      this.inner = HgcOutputClamp_RGBOnly_new();
    }
    // (@0x1ac7eb / @0x1ac819: release-old-if-different-and-non-null block
    //  is a no-op on fresh construction because inner was just nulled at
    //  0x1ac7c6. That block is only reachable via the exception-cleanup
    //  landing pads — TS mirror omits it because C1 throws are not modeled.)
    // @0x1ac830: inner = new obj (already assigned above).
  }

  /**
   * `HGOutputClamp::~HGOutputClamp()` — Helium D0 @0x1acab0 (D1 @0x1aca70
   * is a similar bare-body dtor; D0 additionally tail-jmps operator
   * delete). Full D0 asm:
   *
   *   0x1acab6  movq %rdi, %rbx
   *   0x1acab9  leaq 0x8799a8(%rip), %rax   ; = own vtable installed-ptr @0xa26468
   *   0x1acac0  movq %rax, (%rdi)           ; reinstall vtable
   *   0x1acac3  movq 0x1a0(%rdi), %rdi      ; inner
   *   0x1acaca  testq %rdi, %rdi
   *   0x1acacd  je   0x1acad5
   *   0x1acacf  movq (%rdi), %rax
   *   0x1acad2  callq *0x18(%rax)           ; inner->Release() via vtable slot *0x18
   *   0x1acad5  movq %rbx, %rdi
   *   0x1acad8  callq HGNode::~HGNode()     ; base dtor
   *   0x1acae6  jmp   HGObject::operator delete(this)
   *
   * The vtable slot *0x18 on the inner is HGObject::Release() — the
   * standard ARC-style ref-count decrement that ultimately runs the
   * inner's own dtor.
   */
  destruct(): void {
    // @0x1acac0: reinstall own vtable (transparent in TS; kept for provenance).
    this.vtable = 0xa26468;
    // @0x1acac3..0x1acad2: release inner if non-null via vtable *0x18.
    if (this.inner !== null) {
      // vtable slot *0x18 on the inner (HGObject::Release inherited or
      // overridden). TS has no explicit refcount; we null the reference
      // and let GC handle reclamation.
      HGObjectInner_Release(this.inner);
      this.inner = null;
    }
    // @0x1acad8: HGNode::~HGNode() — base dtor. Handled by GC in TS.
    // @0x1acae6: HGObject::operator delete(this) — n/a in TS.
  }

  /**
   * `HGOutputClamp::Set_Yp_coef(float, float, float, float)` — Helium
   * @0x1ac940. Delegates to the inner filter's vtable *0x60 with
   * channel-index 0 (Yp = luma). Full asm:
   *
   *   0x1ac940  cmpl $0x0, 0x198(%rdi)      ; mode == 0 ?
   *   0x1ac947  je   0x1ac963                ;   yes -> return -1
   *   0x1ac94d  movq 0x1a0(%rdi), %rdi      ; rdi = inner
   *   0x1ac954  movq (%rdi), %rax           ; rax = inner->vtable
   *   0x1ac957  xorl %esi, %esi             ; channel = 0
   *   0x1ac959  callq *0x60(%rax)           ; inner->vtable[0x60](inner, 0, arg1..4)
   *   0x1ac95c  movl $0x1, %eax             ; return 1 (ok)
   *   0x1ac962  ret
   *   0x1ac963  movl $-1, %eax ; ret        ; return -1 (mode==0 gate)
   *
   * NB: the four float args (%xmm0..%xmm3) are preserved by the SysV
   * ABI across the vcall — they are the arguments the inner filter's
   * SetCoef sees. So the inner-slot signature is:
   *   int64  SetCoef(void* this, int channel, f32, f32, f32, f32)
   *
   * Semantics: for the RGBOnly wrapper (mode==0), Y'-plane clamping is
   * unsupported → return -1. For the full wrapper (mode!=0), delegate.
   *
   * @return  1 on ok, -1 on mode==0.
   */
  Set_Yp_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1ac940..0x1ac947: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    // @0x1ac94d..0x1ac959: forward with channel 0.
    if (this.inner === null) {
      // Not reachable in the disasm (inner is only null after dtor), but
      // TS strict-null-checks require a guard. FRONTIER: throw with a
      // citation, do not silently no-op (Rule 3).
      throw new Error(
        "HGOutputClamp::Set_Yp_coef @Helium 0x1ac94d dereferenced null inner " +
          "— unreachable in the decoded body but a null was seen at TS runtime.",
      );
    }
    InnerFilter_SetCoef(this.inner, 0, x0, x1, x2, x3);
    // @0x1ac95c: return 1.
    return 1;
  }

  /**
   * `HGOutputClamp::Set_Cb_coef(float, float, float, float)` — Helium
   * @0x1ac970. Delegates with channel-index 1 (Cb).
   *
   * Full asm (this one has a slightly different prologue: it pushes
   * %rbx and holds the return-value in %ebx rather than %eax, then
   * jumps to a common epilogue — but the semantics are IDENTICAL to the
   * other 5 setters):
   *
   *   0x1ac976  cmpl $0x0, 0x198(%rdi)      ; mode == 0 ?
   *   0x1ac97d  je   0x1ac998                ;   yes -> ret=-1
   *   0x1ac97f  movq 0x1a0(%rdi), %rdi      ; inner
   *   0x1ac986  movq (%rdi), %rax           ; vtable
   *   0x1ac989  movl $0x1, %ebx             ; ret = 1
   *   0x1ac98e  movl $0x1, %esi             ; channel = 1
   *   0x1ac993  callq *0x60(%rax)           ; inner->vtable[0x60](inner, 1, ...)
   *   0x1ac996  jmp   0x1ac99d              ; -> return
   *   0x1ac998  movl $-1, %ebx              ; ret = -1
   *   0x1ac99d  movl %ebx, %eax ; ret       ; return ret
   *
   * The %rbx/%rax dance is a compiler quirk (probably because the
   * function was compiled with a slightly different scheduling pass);
   * the observable behaviour matches the other 5 setters exactly.
   */
  Set_Cb_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1ac976: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::Set_Cb_coef @Helium 0x1ac97f dereferenced null inner.",
      );
    }
    // @0x1ac98e..0x1ac993: forward with channel 1.
    InnerFilter_SetCoef(this.inner, 1, x0, x1, x2, x3);
    return 1;
  }

  /**
   * `HGOutputClamp::Set_Cr_coef(float, float, float, float)` — Helium
   * @0x1ac9b0. Delegates with channel-index 2 (Cr). Body identical in
   * shape to Set_Yp_coef @0x1ac940; only the immediate loaded into
   * %esi differs (`$0x2` here).
   */
  Set_Cr_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1ac9b0..0x1ac9b7: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::Set_Cr_coef @Helium 0x1ac9bd dereferenced null inner.",
      );
    }
    // @0x1ac9c7..0x1ac9cc: forward with channel 2.
    InnerFilter_SetCoef(this.inner, 2, x0, x1, x2, x3);
    return 1;
  }

  /**
   * `HGOutputClamp::Set_R_coef(float, float, float, float)` — Helium
   * @0x1ac9e0. Delegates with channel-index 3 (R).
   */
  Set_R_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1ac9e0..0x1ac9e7: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::Set_R_coef @Helium 0x1ac9ed dereferenced null inner.",
      );
    }
    // @0x1ac9f7..0x1ac9fc: forward with channel 3.
    InnerFilter_SetCoef(this.inner, 3, x0, x1, x2, x3);
    return 1;
  }

  /**
   * `HGOutputClamp::Set_G_coef(float, float, float, float)` — Helium
   * @0x1aca10. Delegates with channel-index 4 (G).
   */
  Set_G_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1aca10..0x1aca17: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::Set_G_coef @Helium 0x1aca1d dereferenced null inner.",
      );
    }
    // @0x1aca27..0x1aca2c: forward with channel 4.
    InnerFilter_SetCoef(this.inner, 4, x0, x1, x2, x3);
    return 1;
  }

  /**
   * `HGOutputClamp::Set_B_coef(float, float, float, float)` — Helium
   * @0x1aca40. Delegates with channel-index 5 (B).
   */
  Set_B_coef(x0: number, x1: number, x2: number, x3: number): number {
    // @0x1aca40..0x1aca47: mode==0 gate.
    if ((this.mode | 0) === 0) return -1 | 0;
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::Set_B_coef @Helium 0x1aca4d dereferenced null inner.",
      );
    }
    // @0x1aca57..0x1aca5c: forward with channel 5.
    InnerFilter_SetCoef(this.inner, 5, x0, x1, x2, x3);
    return 1;
  }

  /**
   * `HGOutputClamp::GetOutput(HGRenderer* r)` — Helium @0x1ac900. Full asm:
   *
   *   0x1ac907  movq %rdi, %rbx              ; save this
   *   0x1ac90a  movq (%rdi), %rax            ; this->vtable
   *   0x1ac90d  movq 0x1a0(%rdi), %r14       ; inner
   *   0x1ac914  xorl %esi, %esi              ; arg1 = 0
   *   0x1ac916  callq *0x80(%rax)            ; this->vtable[0x80](this, 0) -> result
   *
   *   0x1ac91c  movq (%r14), %rcx            ; inner->vtable
   *   0x1ac91f  movq %r14, %rdi              ; recv = inner
   *   0x1ac922  xorl %esi, %esi              ; arg1 = 0
   *   0x1ac924  movq %rax, %rdx              ; arg2 = result-of-first-vcall
   *   0x1ac927  callq *0x78(%rcx)            ; inner->vtable[0x78](inner, 0, result)
   *
   *   0x1ac92a  movq 0x1a0(%rbx), %rax       ; ret = inner (the pointer, not %rax from vcall)
   *   0x1ac935  ret
   *
   * Semantics (as recovered from the two vtable dispatches):
   *   1. Ask ourselves (via this->vtable[0x80]) for our own "resolved
   *      output pointer" — this slot is unresolved on HGNode's map
   *      (FRONTIER). It returns a pointer/handle that we then feed to
   *      the inner filter.
   *   2. Ask the inner filter (via inner->vtable[0x78]) to CONSUME that
   *      handle, side-effecting the inner filter's state. The 3-arg
   *      call shape (recv, 0, handle) matches a generic "install-input"
   *      or "adopt-output" operation on HGNode/HGObject subclass ABIs.
   *   3. Return `inner` (as an HGNode*, per the exported symbol
   *      signature `HGOutputClamp::GetOutput(HGRenderer*)`). NOTE the
   *      RETURN is `inner`, NOT the result of either vcall — the
   *      %rax at 0x1ac91c gets overwritten by the second vcall, and
   *      the third instruction reloads inner directly from 0x1a0.
   *
   * The `r: HGRenderer*` arg is dead — never read.
   */
  GetOutput(_r: HGRendererApi): HGNode {
    if (this.inner === null) {
      throw new Error(
        "HGOutputClamp::GetOutput @Helium 0x1ac90d dereferenced null inner " +
          "— unreachable in the decoded body (inner is always non-null after ctor).",
      );
    }
    // @0x1ac916: this->vtable[0x80](this, 0). Slot is inherited (HGNode
    // vtable *0x80 = HGNode::GetInput per HGNode.ts; NOT
    // HGOutputClamp-specific). FRONTIER stub with citation.
    const resolvedHandle = HGNode_vtbl_0x80(this, 0);
    // @0x1ac927: inner->vtable[0x78](inner, 0, resolvedHandle). Slot
    // is on the inner (HgcOutputClamp / _RGBOnly) vtable — FRONTIER.
    InnerFilter_vtbl_0x78(this.inner, 0, resolvedHandle);
    // @0x1ac92a: return inner as-is (as HGNode*, per the exported signature).
    return this.inner as unknown as HGNode;
  }
}

// ============================================================================
// FRONTIER stubs — each cites the exact call-site @0xADDR it defers.
// Rule 3: no silent no-ops; every undecoded callee throws with a citation.
// ============================================================================

/**
 * `HgcOutputClamp::HgcOutputClamp()` @Helium (symbol __ZN14HgcOutputClampC1Ev
 * @stub). Constructs the full 6-channel Helium output clamper. FRONTIER —
 * class not yet ported.
 */
function HgcOutputClamp_new(): HGOutputClampInnerFilter {
  throw new Error(
    "HgcOutputClamp::HgcOutputClamp() not yet transcribed @Helium " +
      "(call site: HGOutputClamp::HGOutputClamp @0x1ac7e6). This is a " +
      "0x1a0-byte HGNode subclass — port it separately.",
  );
}

/**
 * `HgcOutputClamp_RGBOnly::HgcOutputClamp_RGBOnly()` @Helium (symbol
 * __ZN22HgcOutputClamp_RGBOnlyC1Ev @stub). Constructs the 3-channel
 * (R/G/B only) variant. FRONTIER.
 */
function HgcOutputClamp_RGBOnly_new(): HGOutputClampInnerFilter {
  throw new Error(
    "HgcOutputClamp_RGBOnly::HgcOutputClamp_RGBOnly() not yet transcribed @Helium " +
      "(call site: HGOutputClamp::HGOutputClamp @0x1ac814). This is a " +
      "0x1a0-byte HGNode subclass — port it separately.",
  );
}

/**
 * `HGObject::Release()` — vtable slot *0x18 on the inner filter. Invoked
 * by ~HGOutputClamp @0x1acad2. FRONTIER — HGObject.ts already exposes
 * Release() on the pure HGObject subclass, but here the dispatch is
 * through the INNER's own overridden vtable (HgcOutputClamp's slot 0x18
 * may or may not override HGObject::Release depending on that subclass's
 * transcription state).
 */
function HGObjectInner_Release(_inner: HGOutputClampInnerFilter): void {
  throw new Error(
    "HGOutputClampInner vtable *0x18 (Release) not yet transcribed @Helium " +
      "(call site: HGOutputClamp::~HGOutputClamp @0x1acad2). Inner is either " +
      "HgcOutputClamp or HgcOutputClamp_RGBOnly — both are FRONTIER classes.",
  );
}

/**
 * Backing filter vtable slot *0x60 — invoked by every Set_*_coef method
 * (@0x1ac959, 0x1ac993, 0x1ac9cc, 0x1ac9fc, 0x1aca2c, 0x1aca5c). The
 * SysV x86_64 ABI preserves %xmm0..%xmm3 across the compiler-emitted
 * `callq *0x60(%rax)`, so the four float args are the SAME as what the
 * wrapper's caller passed. Signature: `(this, int channel, f32, f32,
 * f32, f32) -> int64`.  Return value is discarded by the wrapper (it
 * always returns 1 on the ok-path).
 */
function InnerFilter_SetCoef(
  _inner: HGOutputClampInnerFilter,
  _channel: number,
  _x0: number,
  _x1: number,
  _x2: number,
  _x3: number,
): void {
  throw new Error(
    "HGOutputClampInner vtable *0x60 (SetCoef) not yet transcribed @Helium " +
      "(call sites: HGOutputClamp::Set_{Yp,Cb,Cr,R,G,B}_coef @0x1ac{959,993,9cc,9fc,a2c,a5c}). " +
      "Signature: SetCoef(this, int channel, f32, f32, f32, f32). Return u32.",
  );
}

/**
 * Backing filter vtable slot *0x78 — invoked by GetOutput @0x1ac927
 * with args (inner, 0, resolvedHandle). Signature inferred from asm:
 * `(this, int, void*) -> ???`. Role: install the "resolved handle"
 * (produced by this->vtable[0x80]) into the inner filter's state. The
 * wrapper does NOT read the return value.
 */
function InnerFilter_vtbl_0x78(
  _inner: HGOutputClampInnerFilter,
  _idx: number,
  _handle: unknown,
): void {
  throw new Error(
    "HGOutputClampInner vtable *0x78 not yet transcribed @Helium " +
      "(call site: HGOutputClamp::GetOutput @0x1ac927, args (0, handle)). " +
      "Handle produced by this.vtable[0x80] @0x1ac916.",
  );
}

/**
 * `HGNode` vtable slot *0x80 — invoked by GetOutput @0x1ac916 with
 * arg (this, 0). This slot is on HGNode.ts's map at "GetInput(int)":
 *
 *     HGNode.ts:   *0x80 = 0x11c8b0  HGNode::GetInput(int)
 *
 * so the call `this->vtable[0x80](this, 0)` == `this.GetInput(0)`. However,
 * HGOutputClamp is a subclass of HGNode and can override; per the vtable
 * dump above HGOutputClamp does NOT override slot *0x80, so the call
 * dispatches to `HGNode::GetInput(0)` — which returns the HGInputSlot's
 * srcNode (per HGNode.ts docstring).
 *
 * We route through a FRONTIER stub because HGNode.ts's `GetInput` returns
 * `HGNode | null` while the disasm treats the result as an untyped
 * pointer passed directly to inner->vtable[0x78] as `%rdx` (a void*).
 * That's compatible types-wise, but the semantics ("adopt this srcNode
 * into the clamp filter") depend on the FRONTIER slot *0x78, so we cite
 * both call-sites here.
 */
function HGNode_vtbl_0x80(node: HGNode, idx: number): unknown {
  // HGNode.ts documents *0x80 = HGNode::GetInput(int). Delegate directly
  // — the base method is fully ported.
  return node.GetInput(idx);
}

