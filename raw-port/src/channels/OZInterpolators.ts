// OZInterpolators — per-OZSpline PAIR of lazy B/X spline interpolators + a borrowed
// reference to the process-global OZInterpolatorStrategies singleton (ProChannel.framework).
//
// This class is what OZSpline holds at +0x98 (see OZSpline.m0.ts). It exists to hand out
// the CORRECT interpolator for a keypoint's `type`:
//   - type == 10 -> lazy-allocate an OZXSplineInterpolator on this object
//   - type == 12 -> lazy-allocate an OZBSplineInterpolator on this object
//   - anything else -> DELEGATE to OZInterpolatorStrategies::getInterpolator, which owns the
//                       14 stateless singletons (constant/linear/bezier/catmullRom/easeIn/...).
// The Strategies pointer is a BORROWED singleton — this dtor MUST NOT delete it. The B/X-spline
// slots ARE owned and are heap-allocated with a lock-cmpxchg race guard, then virtual-deleted.
//
// Faithful port. All 9 methods this class owns are ported here from the disassembly:
//
//   @0x0000000000044694  OZInterpolators::OZInterpolators()          [C1==C2 ICF-folded]
//                        __ZN15OZInterpolatorsC1Ev  == __ZN15OZInterpolatorsC2Ev
//   @0x00000000000446b8  OZInterpolators::OZInterpolators(OZInterpolators const&)  [C2]
//                        __ZN15OZInterpolatorsC2ERKS_
//   @0x0000000000044748  OZInterpolators::OZInterpolators(OZInterpolators const&)  [C1]
//                        __ZN15OZInterpolatorsC1ERKS_  (3-insn trampoline to C2ERKS_)
//   @0x0000000000044752  OZInterpolators::~OZInterpolators()          [D2]
//                        __ZN15OZInterpolatorsD2Ev
//   @0x000000000004479c  OZInterpolators::~OZInterpolators()          [D1]
//                        __ZN15OZInterpolatorsD1Ev  (3-insn trampoline to D2Ev)
//   @0x00000000000447a6  OZInterpolators::getInterpolator(unsigned int)
//                        __ZN15OZInterpolators15getInterpolatorEj
//   @0x000000000004484a  OZInterpolators::update(OZSpline&, CMTime const&)
//                        __ZN15OZInterpolators6updateER8OZSplineRK6CMTime
//   @0x0000000000044866  OZInterpolators::operator=(OZInterpolators const&)
//                        __ZN15OZInterpolatorsaSERKS_
//   @0x000000000004497e  OZInterpolators::operator==(OZInterpolators const&) const
//                        __ZN15OZInterpolatorseqERKS_
//
// OBJECT LAYOUT (recovered from C2Ev @0x44694 store order + C2ERKS_ @0x446b8 allocation sizes +
// getInterpolator @0x447a6 lazy-init offsets + D2Ev @0x44752 destruction order):
//
//   sizeof(OZInterpolators) = 0x18 (24 bytes; matches OZSpline.m0 "heap-new'd 0x18 bytes")
//
//     +0x00  OZBSplineInterpolator*   OWNED, lazy-allocated in getInterpolator(type==12)
//                                     (@0x447f9 movl $0x78,%edi ; __Znwm ; OZBSplineInterpolatorC1Ev)
//                                     Deep-copied in C2ERKS_ via OZBSplineInterpolatorC1ERKS_ if
//                                     src +0x00 != nullptr. Deleted in D2Ev via vtable +0x8
//                                     (Itanium "deleting destructor"). NULL after XCHG in dtor.
//     +0x08  OZXSplineInterpolator*   OWNED, lazy-allocated in getInterpolator(type==10)
//                                     (@0x447c3 movl $0x28,%edi ; __Znwm ; OZXSplineInterpolatorC1Ev)
//                                     Deep-copied in C2ERKS_ via OZXSplineInterpolatorC1ERKS_ if
//                                     src +0x08 != nullptr. Deleted in D2Ev via vtable +0x8. NULL
//                                     after XCHG in dtor.
//     +0x10  OZInterpolatorStrategies*  BORROWED singleton — stored from
//                                     OZInterpolatorStrategies::getInstance() @0x44dfe
//                                     (@0x446a8 in C2Ev, @0x4471e in C2ERKS_). NEVER deleted by
//                                     this class's dtor (D2Ev only touches +0x00 and +0x08 and
//                                     ends with a plain retq — no PCSingleton unref, no free).
//
// The lazy-alloc slots use a `lock cmpxchgq` race-guard (@0x447da / @0x44810) so a concurrent
// caller can't leak — if the CAS fails, the "loser" copy is virtual-deleted via slot vtable+0x8
// (@0x447e2/e8 and @0x44817/1d). TS is single-threaded, so we omit the CAS but preserve the
// null-then-allocate ordering and the "already-allocated? return existing" fast path.
//
// LEGACY SHIM: an earlier drop of this file exposed `getInterpolatorKind()` + `InterpKind` before
// the class body was decoded. OZSpline.ts still consumes them. Those symbols remain below the
// class port (the numeric type->offset table was read from ProChannel 0xb0958 via
// OZInterpolatorStrategies::getInterpolator @0x44ddc + the offset->class order recovered from
// OZInterpolatorStrategies::OZInterpolatorStrategies() @0x44a24; see
// raw-port/src/channels/OZInterpolatorStrategies.ts for the full ctor decode).

import {
  OZInterpolatorStrategies,
  type AnyInterpolator,
} from "./OZInterpolatorStrategies.js";
import type { CMTime } from "../infra/CMTime.js";

// OZSpline is the class this OZInterpolators lives inside (via +0x98 back-pointer).
// The full class body (raw-port/src/channels/OZSpline.m0.ts etc.) exposes only free
// functions today — no `class OZSpline` export. `update` takes a `spline` REFERENCE
// so we pass it through as an opaque `unknown`; the callee (OZBSplineInterpolator
// vtable[+0x10], not yet transcribed) is what will type-narrow this.
type OZSplineRef = unknown;

// OZBSplineInterpolator's port today (raw-port/src/channels/OZBSplineInterpolator.ts)
// exports FREE FUNCTIONS keyed to method @0xADDRs (ctorC2/dtorD2/operatorAssign/…)
// but NOT a class handle. This class is our nominal object-handle for the +0x00 slot
// so OZInterpolators can hold/copy/compare a pointer to a heap-allocated instance.
// Method invocations route to the free functions in the OZBSplineInterpolator module.
export class OZBSplineInterpolator {
  /** OZBSplineInterpolator::OZBSplineInterpolator() @ProChannel 0x418ca / 0x4191c (C2/C1).
   *  See raw-port/src/channels/OZBSplineInterpolator.ts::ctorC2 / ctorC1 — both currently
   *  stubs whose bodies are pending. Constructor call is faithful (lands at that C1 entry). */
  public constructor(_src?: OZBSplineInterpolator) {
    // Zero-init placeholder body; full ctor content is deferred to OZBSplineInterpolator's
    // own free-function bodies. When those land, this handle owns the state they mutate.
    // If _src is passed, this is the copy-ctor path (@0x4196e/0x41a8e) — routed through
    // OZBSplineInterpolator::ctorC2Copy / ctorC1Copy when transcribed.
  }
  /** OZBSplineInterpolator::operator=(OZBSplineInterpolator const&) @ProChannel 0x41b28. */
  public assign(_src: OZBSplineInterpolator): void {
    throw new Error(
      "OZBSplineInterpolator::operator= @ProChannel 0x41b28 not yet transcribed" +
        " (called via OZInterpolators::operator= @0x4488c)",
    );
  }
  /** OZBSplineInterpolator::operator==(OZBSplineInterpolator const&) @ProChannel 0x41bc0. */
  public equals(_src: OZBSplineInterpolator): boolean {
    throw new Error(
      "OZBSplineInterpolator::operator== @ProChannel 0x41bc0 not yet transcribed" +
        " (called via OZInterpolators::operator== @0x449d4)",
    );
  }
}

// -----------------------------------------------------------------------------
// OZXSplineInterpolator — placeholder handle
// -----------------------------------------------------------------------------
// The full OZXSplineInterpolator class (23 methods @ProChannel 0x45e80..0x46f22) is not yet
// decoded in this port. However, OZInterpolators's +0x08 slot only needs to:
//   (a) hold an opaque owned pointer,
//   (b) be constructible from another instance (copy-ctor @0x45edc / @0x45f1c),
//   (c) be structurally comparable (operator== @0x45fd0),
//   (d) support "clear via vtable+0x8" (virtual dtor, done at destroy time),
//   (e) support "operator=" assignment (@0x45fb6).
// We model it as a nominal class stub. Actual method bodies are transcribed in a future
// OZXSplineInterpolator.ts (see ProChannel.ledger.json). Any consumer that WANTS to call an
// OZXSplineInterpolator method on the returned pointer will hit that stub's throw first — not
// this shim.
export class OZXSplineInterpolator {
  /**
   * OZXSplineInterpolator::OZXSplineInterpolator()  @ProChannel 0x45eae  [C1]  (ICF-folded C2/C1)
   *   __ZN21OZXSplineInterpolatorC1Ev  (used by OZInterpolators::getInterpolator @0x447d3)
   * Body not yet transcribed. See raw-port/army/ledger/ProChannel.ledger.json entry
   * "OZXSplineInterpolator" — 23 methods pending. Constructor is intentionally a plain
   * zero-init so this class can act as an OWNED pointer slot until its bodies land.
   */
  public constructor(_src?: OZXSplineInterpolator) {
    // Ctor bodies (default @0x45e80/0x45eae and copy @0x45edc/0x45f1c) not yet transcribed.
    // A zero-arg or copy call reaches this point; downstream methods throw with their addr.
    // If _src is passed, this is the copy-ctor path (@0x45edc/@0x45f1c) called from
    // OZInterpolators::C2ERKS_ @0x4470d — the deep-copy contents will land with that class.
  }
  /** OZXSplineInterpolator::operator=(OZXSplineInterpolator const&)  @ProChannel 0x45fb6.
   *  Not yet transcribed. Consumed by OZInterpolators::operator= @0x44900 (tail jump). */
  public assign(_src: OZXSplineInterpolator): void {
    throw new Error(
      "OZXSplineInterpolator::operator= @ProChannel 0x45fb6 not yet transcribed",
    );
  }
  /** OZXSplineInterpolator::operator==(OZXSplineInterpolator const&)  @ProChannel 0x45fd0.
   *  Not yet transcribed. Consumed by OZInterpolators::operator== @0x449f7. */
  public equals(_src: OZXSplineInterpolator): boolean {
    throw new Error(
      "OZXSplineInterpolator::operator== @ProChannel 0x45fd0 not yet transcribed",
    );
  }
}

// -----------------------------------------------------------------------------
// OZInterpolators
// -----------------------------------------------------------------------------

/**
 * OZInterpolators — a 3-field owner that hands out interpolators by type-id.
 * See file header for full layout + address citations.
 */
export class OZInterpolators {
  /** +0x00 — OZBSplineInterpolator*, owned; lazy-alloc'd for type==12. */
  public slot_bspline: OZBSplineInterpolator | null;
  /** +0x08 — OZXSplineInterpolator*, owned; lazy-alloc'd for type==10. */
  public slot_xspline: OZXSplineInterpolator | null;
  /**
   * +0x10 — OZInterpolatorStrategies*, BORROWED singleton (never deleted here). Non-null after
   * either constructor completes because Strategies::getInstance() @0x44dfe always returns a
   * non-null pointer (see OZInterpolatorStrategies.ts, and OZInterpolators D2Ev @0x44752 which
   * confirms this slot is not part of the destroy sweep).
   */
  public strategies: OZInterpolatorStrategies;

  /**
   * OZInterpolators::OZInterpolators()  @ProChannel 0x44694  [C2 == C1, ICF-folded]
   *   __ZN15OZInterpolatorsC2Ev / __ZN15OZInterpolatorsC1Ev
   *
   * Full body @0x44694..0x446b7 (16 lines):
   *   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax
   *   mov  %rdi,%rbx
   *   @0x4469d/9f  xor %eax,%eax ; xchgq %rax,(%rdi)         ; (this+0x00) <- 0
   *   @0x446a2/a4  xor %eax,%eax ; xchgq %rax,0x8(%rdi)      ; (this+0x08) <- 0
   *   @0x446a8     callq OZInterpolatorStrategies::getInstance()
   *   @0x446ad     movq %rax,0x10(%rbx)                     ; (this+0x10) <- singleton
   *   epilogue.
   *
   * The XCHGQ pair with $0 is C++ atomic-init idiom emitted by clang for
   * std::atomic-style stores; semantically equivalent to plain nullification
   * on single-threaded TS. We initialise the fields via the property initialisers.
   */
  public constructor(other?: OZInterpolators) {
    if (other === undefined) {
      // Default ctor path @0x44694.
      // @0x4469d: (this+0x00) <- 0.
      this.slot_bspline = null;
      // @0x446a2: (this+0x08) <- 0.
      this.slot_xspline = null;
      // @0x446a8: (this+0x10) <- OZInterpolatorStrategies::getInstance().
      this.strategies = OZInterpolatorStrategies.getInstance();
      return;
    }
    // Copy ctor path — mirrors C2ERKS_ @0x446b8 below.
    // See _copyConstructFrom for the faithful transcription.
    this.slot_bspline = null;
    this.slot_xspline = null;
    this.strategies = OZInterpolatorStrategies.getInstance();
    this._copyConstructFrom(other);
  }

  /**
   * OZInterpolators::OZInterpolators(OZInterpolators const&)  @ProChannel 0x446b8  [C2]
   *   __ZN15OZInterpolatorsC2ERKS_
   * (@0x44748 __ZN15OZInterpolatorsC1ERKS_ is a 3-insn trampoline: push/pop rbp + jmp C2ERKS_.)
   *
   * Full body @0x446b8..0x44731 (49 lines):
   *   prologue (push rbp, r15, r14, rbx, rax)
   *   %r15 = %rsi (src), %rbx = %rdi (this)
   *   @0x446c8..0x446ce  rax = *(src+0x00); if rax == 0 -> jump to 0x446ea
   *   @0x446d0/d5        new OZBSplineInterpolator (0x78 bytes)  (__Znwm)
   *   @0x446dd/e0        rsi = *(src+0x00) ; rdi = new-ptr
   *   @0x446e3           call OZBSplineInterpolator::OZBSplineInterpolator(OZBSplineInterpolator const&)
   *   @0x446e8           jmp 0x446ed
   *   @0x446ea           xor %r14d, %r14d          ; r14 = 0 (no B-spline in src)
   *   @0x446ed           xchgq %r14, (%rbx)         ; (this+0x00) <- r14
   *   @0x446f0..0x446f7  rax = *(src+0x08); if rax == 0 -> jump to 0x44718
   *   @0x446f9/fe        new OZXSplineInterpolator (0x28 bytes)  (__Znwm)
   *   @0x44706/0a        rsi = *(src+0x08) ; rdi = new-ptr
   *   @0x4470d           call OZXSplineInterpolator::OZXSplineInterpolator(OZXSplineInterpolator const&)
   *   @0x44712           xchgq %r14, 0x8(%rbx)     ; (this+0x08) <- r14
   *   @0x44716           jmp 0x4471e
   *   @0x44718           xor %eax,%eax ; xchgq %rax,0x8(%rbx)   ; (this+0x08) <- 0
   *   @0x4471e           callq OZInterpolatorStrategies::getInstance()
   *   @0x44723           movq %rax, 0x10(%rbx)
   *   epilogue.
   *   The trailing @0x44732..@0x44747 is the __Znwm exception unwind path — TS uses
   *   engine-level exceptions, so operator new can't leak an uninitialised pointer here.
   */
  private _copyConstructFrom(src: OZInterpolators): void {
    // @0x446c8..0x446ce: if src.slot_bspline != null …
    if (src.slot_bspline !== null) {
      // @0x446d0/d5: new-allocate; @0x446e3: run copy-ctor of OZBSplineInterpolator.
      // Faithful clone — the deep-copy body lives in OZBSplineInterpolator's own copy-ctor.
      const cloned = _cloneBSpline(src.slot_bspline);
      // @0x446ed: xchgq r14, (rbx). Single-threaded TS: plain store.
      this.slot_bspline = cloned;
    } else {
      // @0x446ea/ed: (this+0x00) <- 0.
      this.slot_bspline = null;
    }
    // @0x446f0..0x446f7: if src.slot_xspline != null …
    if (src.slot_xspline !== null) {
      // @0x446f9/fe: new-allocate; @0x4470d: OZXSplineInterpolator copy-ctor.
      this.slot_xspline = new OZXSplineInterpolator(src.slot_xspline);
    } else {
      // @0x44718/1a: (this+0x08) <- 0.
      this.slot_xspline = null;
    }
    // @0x4471e/23: (this+0x10) <- OZInterpolatorStrategies::getInstance().
    // (Already set by the delegating constructor; re-fetching is a no-op — the singleton
    // is idempotent by construction @0x44dfe.)
    this.strategies = OZInterpolatorStrategies.getInstance();
  }

  /**
   * OZInterpolators::~OZInterpolators()  @ProChannel 0x44752  [D2]
   *   __ZN15OZInterpolatorsD2Ev
   * (@0x4479c __ZN15OZInterpolatorsD1Ev is a 3-insn trampoline: push/pop rbp + jmp D2Ev.)
   *
   * Full body @0x44752..0x4479a (31 lines):
   *   prologue.
   *   %rbx = %rdi (this)
   *   @0x4475b..0x44761  rax = *(this+0x00); if rax == 0 -> 0x44776 (skip B-spline destroy)
   *   @0x44763/66        rdi = *(this+0x00); if rdi == 0 -> 0x44771 (safety re-check)
   *   @0x4476b/6e        rax = *(rdi) ; callq *0x8(%rax)     ; virtual deleting dtor (vtable+0x8)
   *   @0x44771/73        xor eax,eax ; xchgq %rax,(%rbx)      ; (this+0x00) <- 0
   *   @0x44776..0x4477d  rax = *(this+0x08); if rax == 0 -> 0x44794 (skip X-spline destroy)
   *   @0x4477f/83        rdi = *(this+0x08); if rdi == 0 -> 0x4478e
   *   @0x44788/8b        rax = *(rdi) ; callq *0x8(%rax)     ; virtual deleting dtor (vtable+0x8)
   *   @0x4478e/90        xor eax,eax ; xchgq %rax,0x8(%rbx)   ; (this+0x08) <- 0
   *   @0x44794..0x4479a  epilogue ; retq
   *
   * The dtor DOES NOT touch (this+0x10) — the Strategies singleton is borrowed, not owned.
   * The double null-check (rax != 0 THEN rdi != 0) is clang guarding against a concurrent
   * xchg wiping the slot between the two loads; TS is single-threaded so one check suffices.
   */
  public destroy(): void {
    // @0x4475b..0x44771: if slot_bspline != null, virtual-delete it, then zero the slot.
    if (this.slot_bspline !== null) {
      // Itanium ABI: vtable+0x8 is the "deleting destructor". OZBSplineInterpolator's
      // deleting dtor body isn't yet transcribed as a separate entry point, but calling
      // destroy() here funnels through the class's own teardown once it exists. Until
      // then, dropping the JS reference is equivalent — the underlying object holds no
      // native resources this port allocated.
      this.slot_bspline = null;
    }
    // @0x44776..0x4478e: same pattern for slot_xspline.
    if (this.slot_xspline !== null) {
      this.slot_xspline = null;
    }
    // @0x44794: retq. (this+0x10) intentionally untouched.
  }

  /**
   * OZInterpolators::getInterpolator(unsigned int)  @ProChannel 0x447a6
   *   __ZN15OZInterpolators15getInterpolatorEj
   *
   * Full body @0x447a6..0x44830 (58 lines):
   *   prologue.
   *   %rbx = %rdi (this)
   *   @0x447b0/b3   cmpl $0xa, %esi ; je 0x447f1                 ; type == 10?
   *   @0x447b5/b8   cmpl $0xc, %esi ; jne 0x44828                ; type != 12? -> delegate
   *
   *   ; type == 12 path (B-spline lazy):
   *   @0x447ba..0x447c1  rax = *(this+0x08); if rax != 0 -> 0x447eb (already allocd -> return)
   *                       *** NOTE: the asm loads from 0x8(%rbx) after the je-on-eq to 0x447f1
   *                       BUT the code path we're on here is the fall-through (type == 12),
   *                       which continues to 0x447ba. That check reads (this+0x08). Looking
   *                       at the full body it is CLEAR the layout is inverted from what a
   *                       quick read suggests — clang laid out the type-12 handler INSIDE
   *                       the type-10 test block for tight branch. The two lazy-init blocks
   *                       are IDENTICAL SHAPE with the two slots swapped:
   *                         type==10 -> handles X-spline @ +0x08 (block starts @0x447ba)
   *                         type==12 -> handles B-spline @ +0x00 (block starts @0x447f1)
   *                       This matches the C2ERKS_ analysis (slot_bspline @ +0x00 has size
   *                       0x78; slot_xspline @ +0x08 has size 0x28) — @0x447c3 uses $0x78
   *                       and calls OZBSplineInterpolatorC1Ev, so the block at @0x447ba is
   *                       the B-spline allocator, NOT the X-spline. The `je 0x447f1` at
   *                       @0x447b3 dispatches type==10 to the SECOND block which handles
   *                       X-spline @ +0x08 (block @0x447f1 does `movq (%rbx),%rax` reading
   *                       +0x00... wait, that would be B-spline). Re-reading carefully:
   *
   *   ; --- Actual dispatch (rebuilt from the raw asm, treating each block precisely) ---
   *   ;
   *   ;  @0x447b0..447b3  cmpl $0xa,%esi ; je 0x447f1    ; type==10 jumps to block-B
   *   ;  @0x447b5..447b8  cmpl $0xc,%esi ; jne 0x44828   ; !=12 -> delegate
   *   ;  fall-through here means type==12 (B-spline requested).
   *   ;
   *   ;  Block-A @ 0x447ba (fall-through, TYPE == 12 -> B-spline):
   *   ;    @0x447ba  movq  0x8(%rbx),%rax           ; rax = *(this+0x08)  <-- reads slot 0x08
   *   ;    @0x447be/c1  testq %rax,%rax ; jne 0x447eb   ; if !=0 return it
   *   ;    @0x447c3  movl  $0x28,%edi              ; ALLOC SIZE 0x28  <-- 0x28 = X-spline
   *   ;    @0x447c8  __Znwm
   *   ;    @0x447d3  OZXSplineInterpolatorC1Ev     ; -> X-spline default ctor
   *   ;    @0x447da/db lock cmpxchgq %r14,0x8(%rbx); CAS into +0x08
   *   ;    @0x447eb  movq  0x8(%rbx),%rax          ; return *(this+0x08)
   *   ;
   *   ;  Block-B @ 0x447f1 (TYPE == 10 -> X-spline):
   *   ;    @0x447f1  movq  (%rbx),%rax             ; rax = *(this+0x00)
   *   ;    @0x447f4/f7 testq %rax,%rax ; jne 0x44820  ; if !=0 return it
   *   ;    @0x447f9  movl  $0x78,%edi              ; ALLOC SIZE 0x78  <-- 0x78 = B-spline
   *   ;    @0x447fe  __Znwm
   *   ;    @0x44809  OZBSplineInterpolatorC1Ev     ; -> B-spline default ctor
   *   ;    @0x44810/11 lock cmpxchgq %r14,(%rbx)   ; CAS into +0x00
   *   ;    @0x44820  movq  (%rbx),%rax             ; return *(this+0x00)
   *   ;
   *   ;  Both blocks call popq rbx ; popq r14 ; popq rbp ; retq.
   *   ;
   *   ;  Delegate @ 0x44828 (all other types):
   *   ;    @0x44828  movq 0x10(%rbx),%rdi          ; rdi = strategies pointer
   *   ;    pop rbx/r14/rbp ; jmp OZInterpolatorStrategies::getInterpolator(unsigned int)
   *   ;
   *   ; SO THE MAPPING IS ***SWAPPED*** RELATIVE TO NAMING INTUITION:
   *   ;   TYPE == 12 -> writes to slot at OFFSET +0x08 with SIZE 0x28 (X-spline layout)
   *   ;   TYPE == 10 -> writes to slot at OFFSET +0x00 with SIZE 0x78 (B-spline layout)
   *   ;
   *   ; This makes the field-naming based on type NAME "backwards": type-code 12 is
   *   ; historically labelled "B-spline" by callers but this class's TYPE-12 branch
   *   ; actually allocates the 0x28-byte object (X-spline). Since our +0x00 field
   *   ; holds the 0x78-byte object (from C2ERKS_ @0x446d0 `movl $0x78`) which IS
   *   ; OZBSplineInterpolator, the naming is preserved by making the DISPATCH TABLE
   *   ; correct: type-10 -> +0x00 slot (B-spline), type-12 -> +0x08 slot (X-spline).
   *
   * NAMING: FCP's Strategies-table calls "type == 10 -> XSpline, type == 12 -> BSpline"
   * (see OZInterpolators.ts legacy shim @ getInterpolatorKind). That's the OPPOSITE of
   * what this per-instance ctor SIZES suggest. Reading the sizes carefully:
   *   type 10 branch @0x447f1: alloc size 0x78 -> BSpline object (matches C2ERKS_ +0x00)
   *   type 12 branch @0x447ba: alloc size 0x28 -> XSpline object (matches C2ERKS_ +0x08)
   * So the DISPATCH is: type 10 -> BSpline, type 12 -> XSpline. This is CONSISTENT with
   * the layout (+0x00 = BSpline, +0x08 = XSpline) and OPPOSITE to what the legacy
   * getInterpolatorKind() shim claimed. The legacy shim was wrong on this pair — we
   * fix it below (see getInterpolatorKind rewrite).
   */
  public getInterpolator(
    type: number,
  ): AnyInterpolator | OZBSplineInterpolator | OZXSplineInterpolator {
    // @0x447b0: type == 10 -> lazy-alloc BSpline at slot +0x00 (size 0x78).
    if (type === 10) {
      // @0x447f1..0x447f7: fast-path: if slot_bspline already set, return it.
      if (this.slot_bspline !== null) return this.slot_bspline;
      // @0x447f9..0x44809: new (0x78-byte) OZBSplineInterpolator; default-ctor it.
      const nb = new OZBSplineInterpolator();
      // @0x44810/11: lock cmpxchgq %r14,(%rbx) — race-guard. Single-threaded TS:
      // plain store; if a re-entrant call already set it, we'd honor the winner,
      // but that can't happen in a JS microtask.
      this.slot_bspline = nb;
      // @0x44820: return *(this+0x00).
      return nb;
    }
    // @0x447b5: type == 12 -> lazy-alloc XSpline at slot +0x08 (size 0x28).
    if (type === 12) {
      // @0x447ba..0x447c1: fast-path.
      if (this.slot_xspline !== null) return this.slot_xspline;
      // @0x447c3..0x447d3: new (0x28-byte) OZXSplineInterpolator; default-ctor it.
      const nx = new OZXSplineInterpolator();
      // @0x447da/db: CAS into +0x08 (see BSpline branch above for TS treatment).
      this.slot_xspline = nx;
      // @0x447eb: return *(this+0x08).
      return nx;
    }
    // @0x44828: default — delegate to strategies singleton.
    return this.strategies.getInterpolator(type);
  }

  /**
   * OZInterpolators::update(OZSpline&, CMTime const&)  @ProChannel 0x4484a
   *   __ZN15OZInterpolators6updateER8OZSplineRK6CMTime
   *
   * Full body @0x4484a..0x44864 (14 lines):
   *   pushq %rbp ; movq %rsp, %rbp
   *   @0x4484e  movq (%rdi),%rax                    ; rax = *(this+0x00) (slot_bspline)
   *   @0x44851/54 testq %rax,%rax ; je 0x44863      ; if null -> skip (retq)
   *   @0x44856  movq (%rdi),%rdi                    ; rdi = *(this+0x00)  (the BSpline*)
   *   @0x44859  movq (%rdi),%rax                    ; rax = *rdi  (its vptr)
   *   @0x4485c  movq 0x10(%rax),%rax                ; rax = vptr[+0x10]  (its "update" slot)
   *   @0x44860  popq %rbp
   *   @0x44861  jmpq *%rax                          ; tail-call vtable[+0x10](spline, t)
   *   @0x44863  popq %rbp ; retq
   *
   * Only touches slot_bspline. X-spline is NOT updated by this method. The virtual slot
   * *(vptr+0x10) is the second-derived-slot of OZBSplineInterpolator's vtable — not yet
   * transcribed (see OZBSplineInterpolator.ts, "everything else touches undecoded callees").
   * We wire the dispatch but throw with the exact @0xADDR + vtable citation.
   */
  public update(spline: OZSplineRef, t: CMTime): void {
    // @0x4484e/51: if slot_bspline is null, retq (no-op).
    if (this.slot_bspline === null) {
      // @0x44863: retq.
      return;
    }
    // @0x44856..0x44861: tail-call slot_bspline->vtable[+0x10](spline, t).
    // OZBSplineInterpolator has an `update`-shaped virtual at vtable slot +0x10 that is not
    // yet decoded (its body lives outside the currently-transcribed methods — see the class
    // header of raw-port/src/channels/OZBSplineInterpolator.ts). Throw with full provenance
    // so the frontier tool can enumerate this gap.
    throw new Error(
      "OZInterpolators::update @ProChannel 0x4484a — needs OZBSplineInterpolator vtable[+0x10]" +
        " (dispatched from 0x4485c, tail-jumped at 0x44861) not yet transcribed",
    );
    // Suppress "unused param" — throw is the real exit; TS knows this is unreachable.
    void spline; void t;
  }

  /**
   * OZInterpolators::operator=(OZInterpolators const&)  @ProChannel 0x44866
   *   __ZN15OZInterpolatorsaSERKS_  -> returns OZInterpolators& (i.e. this)
   *
   * Full body @0x44866..0x4497d (101 lines).
   * Two independent slot-update blocks, one for +0x00 (BSpline) and one for +0x08 (XSpline).
   * Each block handles 4 (src, dst) cases with the SAME shape:
   *
   *   Let s = src.slot, d = this.slot:
   *     if s != 0 && d != 0   ->  d->operator=(s)     (deep assign in-place)
   *     if s != 0 && d == 0   ->  d = new-clone(s)    (allocate + copy-ctor)
   *     if s == 0 && d != 0   ->  virtual-delete(d) ; d = 0   (release owned)
   *     if s == 0 && d == 0   ->  nothing
   *
   * ASM for slot_bspline block @0x44866..0x448dc, then IDENTICAL SHAPE for slot_xspline
   * @0x448dc..0x44954 (with a tail-call into OZXSplineInterpolator::operator= @0x44900
   * when both are non-null). The XCHGQ pair at @0x448a6/8 and @0x448ab/ad clearing (rbx)
   * is a clang atomic-store idiom (two consecutive xchg $0 into the same slot).
   *
   * Return value: the ASM sets %rax to %rdi (this) implicitly via the pass-through of the
   * receiver register (Itanium ABI: assignment operator returns *this). TS mirrors this
   * by `return this`.
   */
  public assign(src: OZInterpolators): OZInterpolators {
    // ------- BSpline slot (+0x00) block @0x44866..0x448dc -------
    // @0x44876/79: load src[+0x00] and this[+0x00].
    const sB = src.slot_bspline;
    const dB = this.slot_bspline;
    // @0x4487c/7f: testq rcx (src) ; je 0x44893.
    if (sB !== null) {
      // @0x44881/84: testq rax (dst) ; je 0x448b2 (allocate-copy path).
      if (dB !== null) {
        // @0x44886..0x44891: rsi = src[+0x00] ; rdi = this[+0x00] ; call
        //                    OZBSplineInterpolator::operator=(const&) @ProChannel 0x41b28.
        dB.assign(sB);
        // (fall-through jmp @0x44891 to 0x448dc — the XSpline block.)
      } else {
        // @0x448b2..0x448c5: new (0x78) ; copy-ctor from src[+0x00].
        this.slot_bspline = _cloneBSpline(sB);
        // @0x448cc..0x448d9: lock cmpxchgq into this[+0x00]; race-loser is virtual-deleted.
        // Single-thread TS: plain store already done above.
      }
    } else {
      // sB == null. @0x44893/96: testq rax (dst) ; je 0x448ab.
      if (dB !== null) {
        // @0x44898..0x448a3: rdi = this[+0x00] ; call vtable[+0x8] (deleting dtor).
        // (Modeled as "drop the reference" — see D2Ev commentary above.)
        // @0x448a6/a8 + @0x448ab/ad: xchgq $0,(rbx) done twice (clang atomic pattern).
        this.slot_bspline = null;
      }
      // else both null: nothing to do @0x448b0 -> jmp 0x448dc.
    }

    // ------- XSpline slot (+0x08) block @0x448dc..0x44954 -------
    // @0x448dc/e0: load src[+0x08] and this[+0x08].
    const sX = src.slot_xspline;
    const dX = this.slot_xspline;
    // @0x448e4/e7: testq rcx ; je 0x44905.
    if (sX !== null) {
      // @0x448e9/ec: testq rax ; je 0x44927.
      if (dX !== null) {
        // @0x448ee..0x44900: rsi = src[+0x08] ; rdi = this[+0x08] ; tail-jump
        //                    OZXSplineInterpolator::operator=(const&). Not yet transcribed —
        //                    routed through the OZXSplineInterpolator.assign() stub which
        //                    throws with the address 0x45fb6.
        dX.assign(sX);
      } else {
        // @0x44927..0x4493b: new (0x28) ; XSpline copy-ctor from src[+0x08].
        this.slot_xspline = new OZXSplineInterpolator(sX);
        // @0x44940..0x44948: lock cmpxchgq into this[+0x08]; if CAS fails, virtual-delete
        // the new-loser (@0x44955..0x44965 `movq (r15),rax ; jmpq *0x8(rax)`).
        // Single-thread TS: no CAS.
      }
    } else {
      // sX == null. @0x44905/08: testq rax ; je 0x4491f (already null: done).
      if (dX !== null) {
        // @0x4490a..0x44916: rdi = this[+0x08] ; call vtable[+0x8] (deleting dtor).
        // @0x44919/1b + @0x4491f/21: xchgq $0,0x8(rbx) done twice.
        this.slot_xspline = null;
      }
    }
    // @0x4494a..0x44953: epilogue ; retq. RAX = %rdi (this) — Itanium op= convention.
    return this;
  }

  /**
   * OZInterpolators::operator==(OZInterpolators const&) const  @ProChannel 0x4497e
   *   __ZN15OZInterpolatorseqERKS_
   *
   * Full body @0x4497e..0x44a22 (64 lines).
   *
   * The asm is a hand-woven decision tree that ends up computing:
   *
   *   equal =
   *     ( bothSlotsNull(0x00) || (both != null && BSpline::op==(a,b)) )
   *     &&
   *     ( bothSlotsNull(0x08) || (both != null && XSpline::op==(a,b)) )
   *
   * with a subtle asymmetry documented below: the "if a==null AND b==null we're fine" fast
   * exit lands in the SUCCESS branch (@0x44a20 `movb $0x1,%al`), and any XOR-mismatched
   * pair (one null, one non-null) falls to the FAILURE branch (@0x44a19 `xorl %eax,%eax`).
   *
   * Key ASM landmarks:
   *   @0x4498b/8e   rax = *(this+0x00) ; test ; je 0x44a06 (this-BSpline null path)
   *   @0x44993/96   rax = *(this+0x00) ; test ; je 0x449a3 (redundant re-check, clang)
   *   @0x4499b/9e   rax = *(src+0x00) ; test ; je 0x44a19 (this !=0, src ==0 -> FAIL)
   *   @0x449a3/a7   rax = *(this+0x08) ; test ; je 0x44a10
   *   @0x449ac/b0   rax = *(this+0x08) ; test ; je 0x449be
   *   @0x449b5/b9   rax = *(src+0x08)  ; test ; je 0x44a19 (this !=0, src ==0 -> FAIL)
   *   @0x449be     ; --- BSpline compare ---
   *   @0x449c1..0x449cc  if both null skip to 0x449dd
   *   @0x449ce/d1/d4 rdi = this[+0x00] ; rsi = src[+0x00] ; call BSpline::op==
   *   @0x449d9/db testb %al,%al ; je 0x44a19 (BSpline neq -> FAIL)
   *   @0x449dd     ; --- XSpline compare ---
   *   @0x449e1..0x449ed if both null skip to 0x44a20 (SUCCESS via $1)
   *   @0x449ef/f3/f7 rdi = this[+0x08] ; rsi = src[+0x08] ; call XSpline::op==
   *   @0x449fc/fe/00 movl %eax,%ecx ; movb $1,%al ; testb %cl,%cl ; je 0x44a19 (else fall
   *                   through -> retq with al=1)
   *   @0x44a06/09  ; this-BSpline null cluster: if src-BSpline also null jmp back to 0x44993
   *                  (which then walks to XSpline check); otherwise 0x44a19 FAIL.
   *   @0x44a10/14  ; symmetric branch for the (this[+0x08]==0) case.
   *
   * The extra redundant loads/tests are clang's TBAA-safe way of re-materializing pointers
   * across the branches; the semantic reduction is exactly the two "structural equality with
   * null tolerance" checks below.
   */
  public equals(src: OZInterpolators): boolean {
    // ---- BSpline slot equality (+0x00) ----
    const tB = this.slot_bspline;
    const sB = src.slot_bspline;
    // (this==null XOR src==null) -> mismatch.
    if ((tB === null) !== (sB === null)) return false;
    // Both non-null: call OZBSplineInterpolator::operator==(const&) @ProChannel 0x41bc0
    // (per ledger entry for OZBSplineInterpolator; body currently a throw-stub).
    if (tB !== null && sB !== null) {
      if (!tB.equals(sB)) return false;
    }
    // ---- XSpline slot equality (+0x08) ----
    const tX = this.slot_xspline;
    const sX = src.slot_xspline;
    if ((tX === null) !== (sX === null)) return false;
    if (tX !== null && sX !== null) {
      // Routed through OZXSplineInterpolator::operator== @ProChannel 0x45fd0 (stub above).
      if (!tX.equals(sX)) return false;
    }
    // @0x44a20/22: movb $0x1,%al ; jmp 0x44a1b ; retq.
    return true;
  }
}

// -----------------------------------------------------------------------------
// Helper — OZBSplineInterpolator copy-ctor site
// -----------------------------------------------------------------------------
// C2ERKS_ @0x446e3 and operator= @0x448c5 both `new OZBSplineInterpolator(...)` then
// invoke its COPY CONSTRUCTOR with the src pointer. That copy body is not yet
// transcribed (free-function OZBSplineInterpolator.ctorC2Copy @0x4196e is a stub).
// This helper mirrors the call site — a `new` followed by the copy-ctor — so the
// throw carries the correct @0xADDR when a caller actually clones a non-null BSpline.

function _cloneBSpline(src: OZBSplineInterpolator): OZBSplineInterpolator {
  // Faithfully mirror the two-step: allocate a fresh instance, then apply the
  // copy-ctor body. The copy-ctor body is deferred; passing `src` to the
  // constructor takes the copy-ctor path defined on OZBSplineInterpolator above,
  // whose throw cites @ProChannel 0x4196e (via its own ledger entry). Since
  // that OZBSplineInterpolator ctor currently no-ops when given _src (we don't
  // want to fabricate copy semantics), we STILL need to loud-throw at the call
  // site so downstream code doesn't silently receive a zeroed-out clone.
  throw new Error(
    "OZBSplineInterpolator::OZBSplineInterpolator(const&) @ProChannel 0x4196e / 0x41a8e not yet" +
      " transcribed (needed by OZInterpolators copy-ctor @0x446e3 / operator= @0x448c5)",
  );
  void src;
}

// =============================================================================
// LEGACY: getInterpolatorKind() + InterpKind
// =============================================================================
// Preserved for OZSpline.ts consumers that were written before the class body landed.
// The dispatch here is INSTANCE-INDEPENDENT (no lazy allocation of B/X splines) — it just
// tells the caller which kind of interpolator the type-id NAMES, using the same table read
// from ProChannel 0xb0958 via OZInterpolatorStrategies::getInterpolator @0x44ddc plus the
// two type-10/type-12 overrides that OZInterpolators::getInterpolator @0x447a6 pre-empts.

/** Interpolator kind label used by OZSpline.ts's type-dispatch. */
export type InterpKind =
  | "constant" | "linear" | "bezier" | "catmullRom" | "convex" | "concave" | "scurve"
  | "xspline" | "bspline" | "base";

// type-id -> singleton offset (Strategies table @ProChannel 0xb0958, read via
// OZInterpolatorStrategies::getInterpolator @0x44ddc; entries 0..0x15).
const TYPE_TO_OFFSET: Record<number, number> = {
  0:0x08, 1:0x10, 2:0x18, 3:0x18, 4:0x18, 5:0x18, 6:0x20, 7:0x28, 8:0x30,
  9:0x18, 10:0x18, 11:0x18, 12:0x18, 13:0x38, 14:0x40, 15:0x58, 16:0x48,
  17:0x50, 18:0x10, 19:0x60, 20:0x68, 21:0x70,
};
// singleton offset -> interpolator class (recovered from
// OZInterpolatorStrategies::OZInterpolatorStrategies @0x44a24 store order —
// see raw-port/src/channels/OZInterpolatorStrategies.ts).
const OFFSET_TO_KIND: Record<number, InterpKind> = {
  0x08:"constant", 0x10:"linear", 0x18:"bezier", 0x20:"catmullRom",
  0x28:"base", 0x30:"base", 0x38:"base", 0x40:"base",
  0x48:"linear", 0x50:"linear", 0x58:"linear",
  0x60:"convex", 0x68:"concave", 0x70:"scurve",
};

/** OZInterpolators::getInterpolator(type) — INSTANCE-INDEPENDENT KIND lookup.
 *  Faithful to the per-instance dispatch decoded above @ProChannel 0x447a6:
 *    type == 10 -> BSpline slot (+0x00, size 0x78)
 *    type == 12 -> XSpline slot (+0x08, size 0x28)
 *  Everything else falls through to Strategies::getInterpolator @0x44ddc (table @0xb0958).
 *  NB: an EARLIER drop of this shim had type-10/type-12 swapped based on incorrectly
 *  reading which slot each block allocates. The per-instance dispatch above (with
 *  full @0xADDR-annotated blocks) proves the correct mapping. */
export function getInterpolatorKind(type: number): InterpKind {
  // @0x447b0: type == 10 -> BSpline (@0x447f9 alloc size 0x78 -> B-spline layout).
  if (type === 10) return "bspline";
  // @0x447b5: type == 12 -> XSpline (@0x447c3 alloc size 0x28 -> X-spline layout).
  if (type === 12) return "xspline";
  // @0x44828: default -> strategies table @0xb0958 -> offset -> kind.
  if (type >= 0 && type <= 0x15) return OFFSET_TO_KIND[TYPE_TO_OFFSET[type]] ?? "bezier";
  // (>0x15) @0x44de0: default slot offset 0x18 -> "bezier".
  return "bezier";
}
