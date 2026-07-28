// OZWriteOnCurveNode.ts — Ozone.framework's "write-on" behavior curve node. A thin
// OZBehaviorCurveNode-derived shim that dynamic_casts its stored OZBehavior* to
// OZWriteOnBehavior* and delegates solve/needed-range decisions to it.
//
// Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/OZWriteOnCurveNode.OZWriteOnCurveNode.s               (C1 body)   @0x477840
//   raw-port/re/disasm/OZWriteOnCurveNode.~OZWriteOnCurveNode.s              (D0 body)   @0x4778c0
//   raw-port/re/disasm/OZWriteOnCurveNode.solveNode.s (OZCurveNodeParam&)                @0x477940
//   raw-port/re/disasm/OZWriteOnCurveNode.solveNode_CMTime.s (CMTime,double,double)      @0x4778e0
//   raw-port/re/disasm/OZWriteOnCurveNode.cloneNode.s                                    @0x477990
//   raw-port/re/disasm/OZWriteOnCurveNode.compare.s                                      @0x4779e0
//   raw-port/re/disasm/OZWriteOnCurveNode.getNeededRange.s                               @0x4779f0
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x477820  T OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)  (C2)
//   0x477840  T OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior*, OZChannel*)  (C1)
//   0x477860  T OZWriteOnCurveNode::OZWriteOnCurveNode(OZWriteOnCurveNode const&) (C2 copy)
//   0x477880  T OZWriteOnCurveNode::OZWriteOnCurveNode(OZWriteOnCurveNode const&) (C1 copy)
//   0x4778a0  T OZWriteOnCurveNode::~OZWriteOnCurveNode()                        (D2)
//   0x4778b0  T OZWriteOnCurveNode::~OZWriteOnCurveNode()                        (D1)
//   0x4778c0  T OZWriteOnCurveNode::~OZWriteOnCurveNode()                        (D0 — deleting)
//   0x4778e0  T OZWriteOnCurveNode::solveNode(CMTime const&, double, double)
//   0x477940  T OZWriteOnCurveNode::solveNode(OZCurveNodeParam&)
//   0x477990  T OZWriteOnCurveNode::cloneNode()
//   0x4779e0  T OZWriteOnCurveNode::compare(OZCurveNode const*) const            (returns 0)
//   0x4779f0  T OZWriteOnCurveNode::getNeededRange(OZCurveNodeParam*)
//
//   0x869160  S vtable for OZWriteOnCurveNode  (installed-ptr = 0x869170; contents
//                                               dumped via raw-port/army/tools/vtable.py)
//   0x869228  S typeinfo for OZWriteOnCurveNode
//   0x70e290  S typeinfo name for OZWriteOnCurveNode
//
// CLASS ROLE: OZWriteOnCurveNode is the OZCurveNode/OZBehaviorCurveNode-derived binding
// that turns an OZWriteOnBehavior (the "write on" animation behavior — an accumulating
// stroke reveal) into a curve-node the runtime can drive through the standard
// OZCurveNode vtable. Every real method dynamic_casts the base-stored OZBehavior* to
// OZWriteOnBehavior* and forwards, so the class itself is pure dispatch.
//
// FIELD LAYOUT (24 bytes — sizeof recovered from cloneNode's `movl $0x20, %edi` @0x47799a =
// 32 bytes, minus the base's fields; the derived class adds only the vtable-ptr override at
// +0x00. The base OZBehaviorCurveNode owns +0x00..+0x1f):
//   +0x00  vtable ptr       (installed at 0x869170; leaq 0x3f191b(%rip) @0x47784e; C2 uses
//                            @0x47782e leaq 0x3f193b(%rip); copy-C1 @0x47788e leaq 0x3f18db;
//                            copy-C2 @0x47786e leaq 0x3f18fb; cloneNode @0x4779b2 leaq
//                            0x3f17b7 — all four RIP-relative addresses resolve to 0x869170)
//   +0x08  OZBehavior*      (base-owned; read by solveNode @0x47794d as `0x8(%rdi)`)
//   +0x10  OZChannelBase*   (base-owned; read by solveNode @0x477972 as `0x10(%r14)`)
//
// Base class: OZBehaviorCurveNode (ctor @__ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel
// called at @0x477829/@0x477849 in C2/C1; dtor @__ZN19OZBehaviorCurveNodeD2Ev called from all
// three dtor slots @0x4778a5/0x4778b5/0x4778c9; copy ctor @__ZN19OZBehaviorCurveNodeC2ERKS_
// called at @0x477869/@0x477889/@0x4779ad). The base class body is not yet transcribed.
//
// Called symbols (all resolved via otool -tV `## …` comments):
//   __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel
//                                     OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*)
//                                     @0x477829 (C2), @0x477849 (C1)
//   __ZN19OZBehaviorCurveNodeC2ERKS_  OZBehaviorCurveNode::OZBehaviorCurveNode(const&)
//                                     @0x477869, @0x477889, @0x4779ad (cloneNode)
//   __ZN19OZBehaviorCurveNodeD2Ev     OZBehaviorCurveNode::~OZBehaviorCurveNode()
//                                     @0x4778a5, @0x4778b5, @0x4778c9
//   __Znwm                            operator new(size_t)         @0x47799f (0x20 = 32)
//   __ZdlPv                           operator delete(void*)       @0x4778d7 (D0), @0x4779ca (clone EH)
//   ___dynamic_cast                   __cxxabiv1::__dynamic_cast   @0x477966, @0x477914
//   __Unwind_Resume                   (EH resume; cloneNode landing pad)  @0x4779d2
//   __ZTI10OZBehavior                 typeinfo for OZBehavior       @rip 0x477956, @0x4778fa
//   __ZTI17OZWriteOnBehavior          typeinfo for OZWriteOnBehavior @rip 0x47795d, @0x477901
//   __ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseR16OZCurveNodeParam
//                                     OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&)
//                                     @0x47797d (tail-jmp)
//   __ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseRK6CMTimedd
//                                     OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime, double, double)
//                                     @0x477939 (tail-jmp)
//
// The two solveWriteOnNode overloads and the three base-class members are the frontier
// callees this port discovers (they get throw-stubs below).

import type { CMTime } from "../infra/CMTime";
import type { OZCurveNodeParam } from "./OZCurveNodeParam";

// ────────────────────────────────────────────────────────────────────────────────────────
// Opaque forward references. Every one of these is an FCP class not yet transcribed; each
// is BRANDED so a mistaken raw-object substitute fails to type-check.
// ────────────────────────────────────────────────────────────────────────────────────────
/** OZBehavior — Ozone base class. Held by the base OZBehaviorCurveNode at `+0x08` on this
 *  object. Not yet transcribed. typeinfo: __ZTI10OZBehavior. */
export interface OZBehavior { readonly __brand: "OZBehavior" }
/** OZWriteOnBehavior — derived Ozone class dispatched to via dynamic_cast in solveNode.
 *  typeinfo: __ZTI17OZWriteOnBehavior. Not yet transcribed. */
export interface OZWriteOnBehavior extends OZBehavior { readonly __brand2: "OZWriteOnBehavior" }
/** OZChannelBase — held by the base OZBehaviorCurveNode at `+0x10`. Not yet transcribed. */
export interface OZChannelBase { readonly __brand: "OZChannelBase" }
/** OZChannel — the ctor argument for the primary constructor. Ozone's channel type; a real
 *  OZChannel is a subclass of OZChannelBase. Not yet transcribed. */
export interface OZChannel extends OZChannelBase { readonly __brand2: "OZChannel" }
/** OZCurveNode — the polymorphic type of `compare`'s argument and the ambient base curve
 *  node interface. Not yet transcribed. */
export interface OZCurveNode { readonly __brand: "OZCurveNode" }

// ────────────────────────────────────────────────────────────────────────────────────────
// Base-class ctor/dtor and OZWriteOnBehavior delegation stubs. Each stub cites its addr
// (PORTING_SPEC Rule 3): a throw here is the CORRECT representation of an undecoded gap.
// ────────────────────────────────────────────────────────────────────────────────────────

/** OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*) @Ozone
 *  (__ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel). Called at @0x477829 (C2) and
 *  @0x477849 (C1). Base ctor body not yet transcribed. */
function OZBehaviorCurveNode_ctor(
  _self: OZWriteOnCurveNode, _behavior: OZBehavior | null, _chan: OZChannel,
): void {
  throw new Error(
    "OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*) @Ozone " +
      "(__ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel) not yet transcribed — base ctor " +
      "call from OZWriteOnCurveNode C2 @0x477829 / C1 @0x477849.",
  );
}

/** OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&) @Ozone
 *  (__ZN19OZBehaviorCurveNodeC2ERKS_). Called at @0x477869 (copy-C2), @0x477889 (copy-C1),
 *  and @0x4779ad (cloneNode). Base copy ctor body not yet transcribed. */
function OZBehaviorCurveNode_copy_ctor(_self: OZWriteOnCurveNode, _src: OZWriteOnCurveNode): void {
  throw new Error(
    "OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehaviorCurveNode const&) @Ozone " +
      "(__ZN19OZBehaviorCurveNodeC2ERKS_) not yet transcribed — base copy ctor from " +
      "OZWriteOnCurveNode copy-C2 @0x477869, copy-C1 @0x477889, cloneNode @0x4779ad.",
  );
}

/** OZBehaviorCurveNode::~OZBehaviorCurveNode() @Ozone (__ZN19OZBehaviorCurveNodeD2Ev).
 *  Tail-called from all three ~OZWriteOnCurveNode variants @0x4778a5/0x4778b5/0x4778c9.
 *  Base dtor body not yet transcribed. */
function OZBehaviorCurveNode_dtor(_self: OZWriteOnCurveNode): void {
  throw new Error(
    "OZBehaviorCurveNode::~OZBehaviorCurveNode() @Ozone (__ZN19OZBehaviorCurveNodeD2Ev) " +
      "not yet transcribed — tail-jmp from ~OZWriteOnCurveNode D2 @0x4778a5 / D1 @0x4778b5 / " +
      "D0 @0x4778c9.",
  );
}

/** __cxxabiv1::__dynamic_cast — the Itanium C++ ABI runtime cross-cast helper. Called at
 *  @0x477966 (solveNode(OZCurveNodeParam&)) and @0x477914 (solveNode(CMTime,double,double))
 *  with signature `__dynamic_cast(void* src, __class_type_info* src_type, __class_type_info*
 *  dst_type, ptrdiff_t src2dst_offset)`. The disasm loads
 *      rdi = this->behavior_ptr @+0x8            (the source pointer to cast)
 *      rsi = &typeinfo for OZBehavior            (src type — the STATIC type)
 *      rdx = &typeinfo for OZWriteOnBehavior     (dst type)
 *      rcx = 0                                    (src2dst_offset == 0 — hint says "no
 *                                                 fast-path shortcut, do the full walk")
 *  and receives the cast result (nullptr if cast fails) in rax. When `this->behavior_ptr`
 *  is null the code SKIPS the __dynamic_cast call entirely (@0x477954 je 0x477970 /
 *  @0x4778f8 je 0x477928) and forwards a nullptr in its place.
 *
 *  A faithful port must therefore reproduce the "if src is null, return null; else runtime-
 *  down-cast" semantics — not just an `instanceof` check, because the source's static type
 *  is only known to be OZBehavior* and the down-cast may fail (returning null) if the
 *  runtime OZBehavior isn't actually a OZWriteOnBehavior. */
function __dynamic_cast_OZBehavior_to_OZWriteOnBehavior(
  src: OZBehavior | null,
): OZWriteOnBehavior | null {
  throw new Error(
    "__cxxabiv1::__dynamic_cast(OZBehavior*, __ZTI10OZBehavior, __ZTI17OZWriteOnBehavior, 0) " +
      "@Ozone (stub 0x6dfd0e) not yet transcribed — called from " +
      "OZWriteOnCurveNode::solveNode(OZCurveNodeParam&) @0x477966 and " +
      "OZWriteOnCurveNode::solveNode(CMTime,double,double) @0x477914. src=" + String(src),
  );
}

/** OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&)  @Ozone
 *  (__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseR16OZCurveNodeParam).
 *  Tail-jump target of OZWriteOnCurveNode::solveNode(OZCurveNodeParam&) @0x47797d. Not yet
 *  transcribed. */
function OZWriteOnBehavior_solveWriteOnNode_Param(
  _writeOn: OZWriteOnBehavior | null, _chan: OZChannelBase, _param: OZCurveNodeParam,
): void {
  throw new Error(
    "OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&) @Ozone " +
      "(__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseR16OZCurveNodeParam) not " +
      "yet transcribed — tail-jmp target of OZWriteOnCurveNode::solveNode(OZCurveNodeParam&) " +
      "@0x47797d.",
  );
}

/** OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double)  @Ozone
 *  (__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseRK6CMTimedd). Tail-jump target
 *  of OZWriteOnCurveNode::solveNode(CMTime,double,double) @0x477939. Not yet transcribed. */
function OZWriteOnBehavior_solveWriteOnNode_CMTime(
  _writeOn: OZWriteOnBehavior | null, _chan: OZChannelBase,
  _t: CMTime, _a: number, _b: number,
): void {
  throw new Error(
    "OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double) " +
      "@Ozone (__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseRK6CMTimedd) not " +
      "yet transcribed — tail-jmp target of OZWriteOnCurveNode::solveNode(CMTime,double,double) " +
      "@0x477939.",
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZWriteOnCurveNode itself.
// ────────────────────────────────────────────────────────────────────────────────────────

/**
 * OZWriteOnCurveNode — OZBehaviorCurveNode subclass that binds an OZWriteOnBehavior to the
 * standard OZCurveNode vtable. The class holds no fields of its own beyond the vtable
 * pointer at +0x00; the base OZBehaviorCurveNode owns the OZBehavior* (+0x08) and
 * OZChannelBase* (+0x10). Every method dynamic_casts the base-stored OZBehavior* to
 * OZWriteOnBehavior* and delegates.
 *
 * ─── ctor bodies ───────────────────────────────────────────────────────────────────────
 * OZWriteOnCurveNode::OZWriteOnCurveNode(OZBehavior* behavior, OZChannel* chan)
 *   C2 @0x477820 / C1 @0x477840 — bodies are identical modulo the RIP offset that resolves
 *   to the shared vtable @0x869170:
 *     pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
 *     movq %rdi, %rbx                     ; rbx = this
 *     callq __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel  ; base ctor (this, behavior, chan)
 *     leaq  0x3f193b(%rip), %rax          ; (C2) rax = &vtable[0] @0x869170
 *       (or   0x3f191b(%rip)              ; (C1) — same target after RIP resolution)
 *     movq  %rax, (%rbx)                  ; this->vtable = ...
 *     addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
 *
 * OZWriteOnCurveNode::OZWriteOnCurveNode(OZWriteOnCurveNode const& src)
 *   C2 @0x477860 / C1 @0x477880 — same shape but the base ctor is __ZN19OZBehaviorCurveNodeC2ERKS_
 *   (the copy-ctor overload). Vtable install offsets are 0x3f18fb (C2) / 0x3f18db (C1); both
 *   resolve to the same 0x869170.
 * ─────────────────────────────────────────────────────────────────────────────────────── */
export class OZWriteOnCurveNode {
  // No own fields — the base OZBehaviorCurveNode holds the OZBehavior* at +0x08 and the
  // OZChannelBase* at +0x10. We surface them as protected properties so the derived methods
  // can read `this.behavior` / `this.chan` — exactly what the asm reads via `0x8(%rdi)` /
  // `0x10(%rdi)`.
  /** +0x08 — base-owned OZBehavior*. Read by solveNode overloads @0x47794d / 0x4778f1. */
  protected behavior: OZBehavior | null;
  /** +0x10 — base-owned OZChannelBase*. Read by solveNode overloads @0x477972 / 0x47792a. */
  protected chan: OZChannelBase;

  constructor(arg: OZBehavior | OZWriteOnCurveNode, chan?: OZChannel) {
    if (arg instanceof OZWriteOnCurveNode) {
      // Copy ctor path @0x477860 / @0x477880.
      OZBehaviorCurveNode_copy_ctor(this, arg);      // @0x477869 / @0x477889 — throws
      // Base copy ctor copies OZBehavior* + OZChannelBase* fields; mirror by reading src.
      this.behavior = arg.behavior;
      this.chan = arg.chan;
    } else {
      // (OZBehavior*, OZChannel*) ctor path @0x477820 / @0x477840.
      // The asm passes `chan` (OZChannel*) directly into the base ctor's OZChannel* slot.
      OZBehaviorCurveNode_ctor(this, arg, chan!);    // @0x477829 / @0x477849 — throws
      this.behavior = arg;
      this.chan = chan!;
    }
    // Vtable install (@0x477835 / @0x477855 / @0x477875 / @0x477895; all four RIP offsets
    // resolve to the OZWriteOnCurveNode vtable @0x869170). In TS class semantics the correct
    // dispatch is automatic — this comment simply records the asm-visible install.
  }

  /**
   * OZWriteOnCurveNode::~OZWriteOnCurveNode()  @Ozone 0x4778a0 (D2) / 0x4778b0 (D1).
   *
   * Body (D2 @0x4778a0, D1 @0x4778b0 is identical byte-for-byte):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   __ZN19OZBehaviorCurveNodeD2Ev            ; tail-jmp to base dtor
   *
   * The class has no owned resources at its own layer, so the derived dtor is just a
   * thunk to the base dtor. JS/TS has no explicit destruct — this method exists for
   * vtable-slot fidelity documentation.
   */
  destruct(): void {
    // @0x4778a5 tail-jmp OZBehaviorCurveNode::~OZBehaviorCurveNode()
    OZBehaviorCurveNode_dtor(this);
  }

  /**
   * OZWriteOnCurveNode::~OZWriteOnCurveNode()  @Ozone 0x4778c0 (D0 — deleting dtor).
   *
   * Body:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq %rdi, %rbx
   *   callq __ZN19OZBehaviorCurveNodeD2Ev            ; @0x4778c9 base dtor
   *   movq %rbx, %rdi
   *   addq $0x8,%rsp ; popq %rbx ; popq %rbp
   *   jmp  operator delete(void*)                    ; @0x4778d7 tail (__ZdlPv)
   *
   * A "deleting destructor" in the Itanium ABI both runs the base dtor and frees the
   * object with `operator delete`. JS/TS has GC, so `destructDelete` merely models the
   * asm-observable sequence (base dtor call, then implicit reclaim).
   */
  destructDelete(): void {
    OZBehaviorCurveNode_dtor(this);                  // @0x4778c9
    // @0x4778d7 jmp __ZdlPv — no observable action in JS.
  }

  /**
   * OZWriteOnCurveNode::solveNode(CMTime const& t, double a, double b)  @Ozone 0x4778e0.
   *
   * Body:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x10,%rsp
   *   movq %rsi, %rbx                                 ; rbx = &t
   *   movq %rdi, %r14                                 ; r14 = this
   *   movq 0x8(%rdi), %rdi                            ; rdi = this->behavior_ptr (base +0x08)
   *   testq %rdi, %rdi                                ; if (behavior_ptr != nullptr) {
   *   je   0x477928
   *     leaq __ZTI10OZBehavior(%rip), %rsi            ;   rsi = &typeinfo OZBehavior
   *     leaq __ZTI17OZWriteOnBehavior(%rip), %rdx     ;   rdx = &typeinfo OZWriteOnBehavior
   *     xorl %ecx, %ecx                                ;   rcx = 0  (no fast-path hint)
   *     movsd %xmm1, -0x20(%rbp)                      ;   spill b (fp-arg is caller-clobbered
   *     movsd %xmm0, -0x18(%rbp)                      ;    across the call)
   *     callq ___dynamic_cast                          ;   rax = __dynamic_cast(...)
   *     movsd -0x18(%rbp), %xmm0                      ;   reload a
   *     movsd -0x20(%rbp), %xmm1                      ;   reload b
   *     movq %rax, %rdi                               ;   rdi = casted OZWriteOnBehavior*
   *   } else 0x477928:
   *     xorl %edi, %edi                               ;   rdi = nullptr
   *   movq 0x10(%r14), %rsi                           ; rsi = this->chan  (base +0x10)
   *   movq %rbx, %rdx                                 ; rdx = &t
   *   addq $0x10,%rsp ; popq %rbx ; popq %r14 ; popq %rbp
   *   jmp OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double)
   *
   * Register mapping to the tail-called function's ABI:
   *   arg1 (rdi) = writeOn (possibly null)
   *   arg2 (rsi) = this->chan
   *   arg3 (rdx) = &t
   *   xmm0/xmm1  = a / b
   */
  solveNodeAt(t: CMTime, a: number, b: number): void {
    // @0x4778f1..0x477923: dynamic_cast(this.behavior) — but only if non-null.
    const writeOn: OZWriteOnBehavior | null =
      this.behavior === null
        ? null                                                // @0x4778f8 je 0x477928
        : __dynamic_cast_OZBehavior_to_OZWriteOnBehavior(this.behavior); // @0x477914
    // @0x477939 tail-jmp to OZWriteOnBehavior::solveWriteOnNode(chan, t, a, b).
    OZWriteOnBehavior_solveWriteOnNode_CMTime(writeOn, this.chan, t, a, b);
  }

  /**
   * OZWriteOnCurveNode::solveNode(OZCurveNodeParam& param)  @Ozone 0x477940.
   *
   * Body (structurally identical to the CMTime overload, minus the fp-arg spill):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
   *   movq %rsi, %rbx                                  ; rbx = &param
   *   movq %rdi, %r14                                  ; r14 = this
   *   movq 0x8(%rdi), %rdi                             ; rdi = this->behavior_ptr
   *   testq %rdi, %rdi ; je 0x477970                   ; null → skip dcast, forward null
   *     leaq __ZTI10OZBehavior(%rip), %rsi             ; rsi = src-typeinfo
   *     leaq __ZTI17OZWriteOnBehavior(%rip), %rdx      ; rdx = dst-typeinfo
   *     xorl %ecx, %ecx
   *     callq ___dynamic_cast                           ; rax = casted
   *     movq %rax, %rdi
   *     jmp 0x477972
   *   0x477970: xorl %edi, %edi
   *   0x477972:
   *     movq 0x10(%r14), %rsi                          ; rsi = this->chan
   *     movq %rbx, %rdx                                 ; rdx = &param
   *     popq %rbx ; popq %r14 ; popq %rbp
   *     jmp OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&)
   */
  solveNodeParam(param: OZCurveNodeParam): void {
    const writeOn: OZWriteOnBehavior | null =
      this.behavior === null
        ? null                                                // @0x477954 je 0x477970
        : __dynamic_cast_OZBehavior_to_OZWriteOnBehavior(this.behavior); // @0x477966
    // @0x47797d tail-jmp.
    OZWriteOnBehavior_solveWriteOnNode_Param(writeOn, this.chan, param);
  }

  /**
   * OZWriteOnCurveNode::cloneNode()  @Ozone 0x477990.
   *
   * Body:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
   *   movq %rdi, %r14                                  ; r14 = this (src)
   *   movl $0x20, %edi                                 ; rdi = 32  (sizeof — 0x20 bytes)
   *   callq operator new(size_t)                       ; @0x47799f rax = raw allocation
   *   movq %rax, %rbx                                  ; rbx = new obj
   *   movq %rax, %rdi                                  ; rdi = new obj (this for base copy ctor)
   *   movq %r14, %rsi                                  ; rsi = src (base copy ctor's arg2)
   *   callq __ZN19OZBehaviorCurveNodeC2ERKS_           ; @0x4779ad base copy ctor
   *   leaq  0x3f17b7(%rip), %rax                       ; rax = &vtable[0] @0x869170
   *   movq  %rax, (%rbx)                               ; new->vtable = ...
   *   movq  %rbx, %rax                                 ; return new obj
   *   popq %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * EH landing pad @0x4779c4-0x4779d2 (if the base copy ctor throws):
   *   movq %rax, %r14                                  ; save exc obj
   *   movq %rbx, %rdi                                  ; rdi = new-obj (raw allocation)
   *   callq operator delete(void*)                     ; @0x4779ca free the raw allocation
   *   movq %r14, %rdi
   *   callq __Unwind_Resume                            ; @0x4779d2 rethrow
   *
   * The 0x20 = 32 byte allocation confirms sizeof(OZWriteOnCurveNode) = 32 (the base
   * OZBehaviorCurveNode carries the vtable-ptr, OZBehavior*, OZChannelBase*, plus 8 more
   * bytes at some base-owned offset; the derived class adds nothing).
   *
   * cloneNode's return type in the FCP vtable is `OZCurveNode*` (see vtable slot @0x68);
   * here we return the same shape — a new OZWriteOnCurveNode instance.
   */
  cloneNode(): OZWriteOnCurveNode {
    // In JS the copy-construction and vtable install are one step: `new OZWriteOnCurveNode(this)`.
    // That triggers the copy-ctor branch above, which calls OZBehaviorCurveNode_copy_ctor
    // (currently a throwing stub) — mirroring the asm's @0x4779ad callq behavior.
    return new OZWriteOnCurveNode(this);
  }

  /**
   * OZWriteOnCurveNode::compare(OZCurveNode const*) const  @Ozone 0x4779e0.
   *
   * Body: `xorl %eax,%eax ; ret` — always returns 0. Matches FFShapeCurveNode::compare
   * exactly (see raw-port/src/nodes/FFShapeCurveNode.ts) — a placeholder virtual that
   * effectively disables value-U compare for this node type. Not a stub or an
   * unimplemented case: the FCP binary itself returns 0 unconditionally.
   */
  compare(_other: OZCurveNode | null): number {
    return 0;                                            // @0x4779e4 xorl %eax,%eax ; ret
  }

  /**
   * OZWriteOnCurveNode::getNeededRange(OZCurveNodeParam* param)  @Ozone 0x4779f0.
   *
   * Body (`rsi = param`, `rax = param` — both reads and writes hit the SAME object):
   *   movq %rsi, %rax
   *   movq   0x70(%rsi), %rcx  ; rcx = param.t2.hi_qword     (+0x60 CMTime .value or high 8B)
   *   movq   %rcx, 0x28(%rsi)  ; store into param.t0.hi_qword (+0x28 within +0x18 CMTime)
   *   movups 0x60(%rsi), %xmm0 ; xmm0 = param.t2.lo_128       (+0x60 CMTime .value+.timescale+.flags)
   *   movups %xmm0, 0x18(%rsi) ; store into param.t0.lo_128   (+0x18)
   *   movups 0x78(%rsi), %xmm0 ; xmm0 = param.t3.lo_128       (+0x78)
   *   movups %xmm0, 0x30(%rsi) ; store into param.t1.lo_128   (+0x30)
   *   movq   0x88(%rsi), %rcx  ; rcx = param.t3.hi_qword      (+0x88 within +0x78 CMTime)
   *   movq   %rcx, 0x40(%rsi)  ; store into param.t1.hi_qword (+0x40 within +0x30 CMTime)
   *   movl   0x90(%rsi), %ecx  ; ecx = param.count_b          (+0x90 i32)
   *   movl   %ecx, 0x48(%rsi)  ; store into param.count_a     (+0x48 i32)
   *   movb   $0x0, 0x58(%rsi)  ; param.owns_a = 0
   *   movq   0x98(%rsi), %rcx  ; rcx = param.buf_b            (+0x98 T*)
   *   movq   %rcx, 0x50(%rsi)  ; store into param.buf_a       (+0x50 T*)
   *   popq %rbp ; retq
   *
   * Per OZCurveNodeParam.ts's byte-exact layout:
   *   +0x18 = t0 (a CMTime),  +0x30 = t1 (CMTime), +0x60 = t2 (CMTime), +0x78 = t3 (CMTime)
   *   +0x48 = count_a (i32),  +0x50 = buf_a (T*),  +0x58 = owns_a (u8)
   *   +0x90 = count_b (i32),  +0x98 = buf_b (T*),  +0xa0 = owns_b (u8)
   *
   * Semantics: the "needed range" for a write-on curve is the SAME as the "wanted range"
   * the caller passed in — an identity forward:
   *      t0 <- t2           t1 <- t3
   *      count_a <- count_b buf_a <- buf_b
   *      owns_a <- 0        (the copy is a NON-OWNING view of buf_b — matches the
   *                          OZCurveNodeParam copy-ctor's own owns_* forcing to 0)
   *
   * NOTE: only the "a-side" fields are overwritten; the "b-side" fields (+0x90..+0xa0)
   * are LEFT UNCHANGED — the asm never writes to +0x90/0x98/0xa0. The caller uses the
   * a-side fields (+0x18..+0x58) as the "needed range" read-back. This exactly matches
   * FFShapeCurveNode::getNeededRange (see raw-port/src/nodes/FFShapeCurveNode.ts) — both
   * are "defer to the caller's request" identity copies.
   *
   * The method returns the passed-in param pointer (movq %rsi,%rax) — a common ABI
   * pattern where getters return their reference argument for chaining. We preserve that.
   */
  getNeededRange(param: OZCurveNodeParam): OZCurveNodeParam {
    // Identity copy of the "b-side" wanted-range fields into the "a-side" needed-range
    // slots. Order matches the asm exactly.
    param.t0 = param.t2;                                 // @0x4779f7-0x477a03 (movq + movups)
    param.t1 = param.t3;                                 // @0x477a07-0x477a16 (movups + movq)
    param.count_a = param.count_b | 0;                   // @0x477a1a-0x477a20  (i32)
    param.owns_a = 0;                                    // @0x477a23  (movb $0x0)
    param.buf_a = param.buf_b;                           // @0x477a27-0x477a2e  (verbatim ptr)
    // Return %rax = %rsi (the input param).
    return param;
  }
}
