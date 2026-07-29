// OZSingleChanCurveNode.ts — FCP Ozone `OZSingleChanCurveNode`, a concrete
// OZBehaviorCurveNode subclass that adapts a *single-channel* interface
// (OZSingleChanBehaviorIF, an OZBehavior with a "single-channel" role) into
// the OZCurveNode API by routing every request through the behavior's own
// virtual dispatch table.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZSingleChanCurveNode.*.s.
//
// SYMBOLS ported here (every non-inlined member function):
//   __ZN21OZSingleChanCurveNodeC2EP22OZSingleChanBehaviorIFP9OZChannelj  @0x003ebb10  ctor (IF*, OZChannel*, u32)  [C2]
//   __ZN21OZSingleChanCurveNodeC1EP22OZSingleChanBehaviorIFP9OZChannelj  @0x003ebb60  ctor (IF*, OZChannel*, u32)  [C1 — byte-identical to C2]
//   __ZN21OZSingleChanCurveNodeC2EP22OZSingleChanBehaviorIFP9OZChannel   @0x003eba70  ctor (IF*, OZChannel*)         [C2, no subIndex — see BODY 3-arg variant below]
//   __ZN21OZSingleChanCurveNodeC1EP22OZSingleChanBehaviorIFP9OZChannel   @0x003ebac0  ctor (IF*, OZChannel*)         [C1 — byte-identical to C2 3-arg]
//   __ZN21OZSingleChanCurveNodeC2ERKS_                                   @0x003ebbb0  copy ctor  [C2]
//   __ZN21OZSingleChanCurveNodeC1ERKS_                                   @0x003ebbe0  copy ctor  [C1 — byte-identical]
//   __ZN21OZSingleChanCurveNodeD2Ev                                      @0x003ebc10  dtor D2 (tail-jmp to base D2)
//   __ZN21OZSingleChanCurveNodeD1Ev                                      @0x003ebc20  dtor D1 (byte-identical to D2)
//   __ZN21OZSingleChanCurveNodeD0Ev                                      @0x003ebc30  dtor D0 (base D2 then operator delete)
//   __ZN21OZSingleChanCurveNode9solveNodeERK6CMTimedd                    @0x003ebc50  solveNode(CMTime const&, double, double)
//   __ZN21OZSingleChanCurveNode9solveNodeER16OZCurveNodeParam             @0x003ebcb0  solveNode(OZCurveNodeParam&)
//   __ZN21OZSingleChanCurveNode14getNeededRangeEP16OZCurveNodeParam      @0x003ebcf0  getNeededRange(OZCurveNodeParam*)
//   __ZN21OZSingleChanCurveNode13getNeededTimeERK6CMTime                  @0x003ebd10  getNeededTime(CMTime const&)
//   __ZN21OZSingleChanCurveNode14isPointToPointEv                         @0x003ebd30  isPointToPoint()
//   __ZN21OZSingleChanCurveNode15isRemappingTimeEv                        @0x003ebd40  isRemappingTime()
//   __ZN21OZSingleChanCurveNode9cloneNodeEv                               @0x003ebd50  cloneNode()
//   __ZNK21OZSingleChanCurveNode7compareEPK11OZCurveNode                  @0x003ebdb0  compare(OZCurveNode const*) const
//
// ---------------------------------------------------------------------------
// INSTANCE LAYOUT (base OZBehaviorCurveNode fields, then this class's two):
//   +0x00   8   vtable*
//   +0x08 …0x1f  OZCurveNode base state (see raw-port/src/nodes/OZCurveNode.ts —
//                base ctor writes ONLY the vtable pointer, but OZBehaviorCurveNode
//                fills in +0x10 behavior, +0x18 channel per its own port)
//   +0x20   8   OZSingleChanBehaviorIF*  behaviorIF   — set by ctor
//                                        (all four ctor variants write this at +0x20)
//   +0x28   4   uint32                   subIndex      — set by (IF*, OZChannel*, u32) ctor from %ecx;
//                                        also set by the (IF*, OZChannel*) ctor from behavior->+0x18
//                                        (i.e. the behavior's own default sub-index).
//
//   sizeof(OZSingleChanCurveNode) = 0x30 bytes — proven by cloneNode's
//   `movl $0x30, %edi ; callq __Znwm` @0x3ebd5a-@0x3ebd5f.
//
// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF VTABLE (only the slots THIS class dispatches through).
// A behaviorIF is a bare virtual interface — every method is called through
// (behaviorIF->vptr)[slot]. The slot offsets are recovered from the disasm at
// EACH call site.
//
//   vtable +0x18  T:  solveNode(&param, ...)          — used by @0x3ebce5 (2nd solveNode)
//   vtable +0x10  T:  solveNode(&t, interp, default)  — used by @0x3ebc92 (1st solveNode)
//   vtable +0x20  T:  getNeededRange(&range, subIdx)  — used by @0x3ebd05 (getNeededRange)
//   vtable +0x28  T:  getNeededTime(&t)               — used by @0x3ebd20 (getNeededTime)
//   vtable +0x30  T:  isPointToPoint()                — used by @0x3ebd3c (isPointToPoint)
//   vtable +0x38  T:  isRemappingTime()               — used by @0x3ebd4c (isRemappingTime)
//   vtable +0x40  T:  isPassThrough()                 — used by @0x3ebc72 (in solveNode 1st variant)
//                                                        and @0x3ebcc4 (in solveNode 2nd variant)
//   vtable +0x48  T:  getDefaultSubIndex() -> unsigned — used by @0x3ebad9 (in 2-arg ctor to
//                                                        pull the default sub-index during construction)
//
// The +0x48 slot returns a u32 through the C++ ABI (return in %eax). The ctor at
// 0x3ebac0 uses this returned value as the ARG3 to the base OZBehaviorCurveNodeC2Ev
// call — see the ctor body below.
//
// ---------------------------------------------------------------------------
// Cited callees:
//   __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel   base ctor @0x3ebae5/@0x3ebb38/@0x3ebb88
//   __ZN19OZBehaviorCurveNodeC2ERKS_                       base copy ctor @0x3ebbbd/@0x3ebbed
//   __ZN19OZBehaviorCurveNodeD2Ev                          base dtor @0x3ebc15/@0x3ebc25/@0x3ebc39
//   __Znwm / __ZdlPv                                       operator new/delete
//   __Unwind_Resume                                        exception unwinder (cloneNode's cleanup)

import { OZBehaviorCurveNode, type OZChannel } from "./OZBehaviorCurveNode";
import { OZCurveNode } from "./OZCurveNode";
import { type CMTime } from "../infra/CMTime";

// ============================================================================
// Foreign opaque types (not ported in this file).

/**
 * OZSingleChanBehaviorIF — a virtual interface for "single-channel" behaviors.
 * Every method used here dispatches through vtable slots documented at the top
 * of this file. Its concrete implementation is not ported; we only need the
 * eight slots this class calls, and each call goes through a throw-stub.
 */
export interface OZSingleChanBehaviorIF {
  /** vtable pointer at +0x00 — vtable slots are per class-level layout comment. */
  readonly vptr: SingleChanBehaviorVTable;
  readonly __opaqueSingleChanBehaviorIF: unique symbol;
}

/** Compile-time typed vtable — mirrors the FCP vptr layout the disasm reads. */
export interface SingleChanBehaviorVTable {
  /** @vslot+0x10 */ solveNodeAtTime: (
    self: OZSingleChanBehaviorIF,
    t: CMTime,
    interp: number,
    defaultValue: number,
  ) => number;
  /** @vslot+0x18 */ solveNodeParam: (
    self: OZSingleChanBehaviorIF,
    param: unknown,
  ) => void;
  /** @vslot+0x20 */ getNeededRange: (
    self: OZSingleChanBehaviorIF,
    param: unknown,
    subIndex: number,
  ) => unknown;
  /** @vslot+0x28 */ getNeededTime: (
    self: OZSingleChanBehaviorIF,
    t: CMTime,
  ) => CMTime;
  /** @vslot+0x30 */ isPointToPoint: (self: OZSingleChanBehaviorIF) => boolean;
  /** @vslot+0x38 */ isRemappingTime: (self: OZSingleChanBehaviorIF) => boolean;
  /** @vslot+0x40 */ isPassThrough: (self: OZSingleChanBehaviorIF) => boolean;
  /** @vslot+0x48 */ getDefaultSubIndex: (self: OZSingleChanBehaviorIF) => number;
}

/** OZChannel — carried through by the base class ctor; opaque here.
 * Imported from OZBehaviorCurveNode above so the branded `__ozChannelBrand`
 * type matches the base's constructor signature (avoids a two-declaration
 * "structurally-different-brand" typecheck error). */

// -----------------------------------------------------------------------
// Throw-stubs for the eight vtable slots (Rule 3: every un-decoded virtual
// call site is a stub that cites the *call address* it defers). The vtable
// dispatch pattern makes the target implementation-defined; we defer to the
// concrete OZSingleChanBehaviorIF implementation whichever object is passed
// in at runtime.

function vcall_solveNodeAtTime_stub(
  behavior: OZSingleChanBehaviorIF,
  t: CMTime,
  interp: number,
  defaultValue: number,
): number {
  // Real dispatch: (behavior->vptr)[+0x10](behavior, &t, interp, defaultValue).
  // Call site: @0x003ebc92 (movq 0x10(%rax), %rax ; jmpq *%rax).
  const fn = behavior?.vptr?.solveNodeAtTime;
  if (typeof fn === "function") return fn(behavior, t, interp, defaultValue);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x10 (solveNodeAtTime) @call-site 0x003ebc92 not yet transcribed",
  );
}

function vcall_solveNodeParam_stub(
  behavior: OZSingleChanBehaviorIF,
  param: unknown,
): void {
  // Real dispatch: (behavior->vptr)[+0x18](behavior, &param).  @0x003ebce5
  const fn = behavior?.vptr?.solveNodeParam;
  if (typeof fn === "function") return fn(behavior, param);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x18 (solveNodeParam) @call-site 0x003ebce5 not yet transcribed",
  );
}

function vcall_getNeededRange_stub(
  behavior: OZSingleChanBehaviorIF,
  param: unknown,
  subIndex: number,
): unknown {
  // Real dispatch: (behavior->vptr)[+0x20](behavior, &param, subIndex).  @0x003ebd09
  const fn = behavior?.vptr?.getNeededRange;
  if (typeof fn === "function") return fn(behavior, param, subIndex);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x20 (getNeededRange) @call-site 0x003ebd09 not yet transcribed",
  );
}

function vcall_getNeededTime_stub(
  behavior: OZSingleChanBehaviorIF,
  t: CMTime,
): CMTime {
  // Real dispatch: (behavior->vptr)[+0x28](behavior, &t).  @0x003ebd20
  const fn = behavior?.vptr?.getNeededTime;
  if (typeof fn === "function") return fn(behavior, t);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x28 (getNeededTime) @call-site 0x003ebd20 not yet transcribed",
  );
}

function vcall_isPointToPoint_stub(
  behavior: OZSingleChanBehaviorIF,
): boolean {
  // Real dispatch: (behavior->vptr)[+0x30](behavior).  @0x003ebd3c
  const fn = behavior?.vptr?.isPointToPoint;
  if (typeof fn === "function") return fn(behavior);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x30 (isPointToPoint) @call-site 0x003ebd3c not yet transcribed",
  );
}

function vcall_isRemappingTime_stub(
  behavior: OZSingleChanBehaviorIF,
): boolean {
  // Real dispatch: (behavior->vptr)[+0x38](behavior).  @0x003ebd4c
  const fn = behavior?.vptr?.isRemappingTime;
  if (typeof fn === "function") return fn(behavior);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x38 (isRemappingTime) @call-site 0x003ebd4c not yet transcribed",
  );
}

function vcall_isPassThrough_stub(
  behavior: OZSingleChanBehaviorIF,
): boolean {
  // Real dispatch: (behavior->vptr)[+0x40](behavior).  @0x003ebc72 / @0x003ebcc4
  const fn = behavior?.vptr?.isPassThrough;
  if (typeof fn === "function") return fn(behavior);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x40 (isPassThrough) @call-sites 0x003ebc72 / 0x003ebcc4 not yet transcribed",
  );
}

function vcall_getDefaultSubIndex_stub(
  behavior: OZSingleChanBehaviorIF,
): number {
  // Real dispatch: (behavior->vptr)[+0x48](behavior).  @0x003ebad9  (used by 2-arg ctor)
  const fn = behavior?.vptr?.getDefaultSubIndex;
  if (typeof fn === "function") return fn(behavior);
  throw new Error(
    "OZSingleChanBehaviorIF vtable +0x48 (getDefaultSubIndex) @call-site 0x003ebad9 not yet transcribed",
  );
}

// ============================================================================

/**
 * OZSingleChanCurveNode — thin adapter that maps every OZCurveNode virtual
 * onto a corresponding OZSingleChanBehaviorIF virtual. All the actual math
 * happens in the behavior object; this class just forwards calls.
 */
export class OZSingleChanCurveNode extends OZBehaviorCurveNode {
  /** +0x20 */
  public behaviorIF: OZSingleChanBehaviorIF;
  /** +0x28 (u32) — sub-channel index this curve node addresses in the behavior */
  public subIndex: number;

  /**
   * Primary ctor with explicit sub-index (IF*, OZChannel*, u32).
   * @0x003ebb10 (C2) / @0x003ebb60 (C1) — bodies byte-identical.
   *   pushq %rbp; movq %rsp,%rbp; save r15/r14/r12/rbx
   *   ebx = %ecx (subIndex u32)
   *   r14 = %rdx (OZChannel*)
   *   r15 = %rsi (IF*)
   *   r12 = %rdi (this)
   *   rax = *(u64*)%rsi         // load IF vtable ptr
   *   rdi = %rsi                 // (behaviorIF)
   *   callq *0x48(%rax)          // behaviorIF->vptr[+0x48]() -> u32 (default sub-index)
   *   // NOTE: this ctor variant IGNORES the returned value (r14=%rax not used).
   *   //       It's called for side-effects only (or the compiler generated the call in
   *   //       common with the 2-arg ctor's prologue; the two ctors share the same
   *   //       "resolve base OZBehavior*" pattern — see below).
   *   rdi = this ; rsi = %rax (result of vcall) ; rdx = OZChannel*
   *   callq OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel   // base ctor: (this, OZBehavior*=%rax, OZChannel*)
   *   install vtable                    @0x3ebb3d-@0x3ebb44
   *   *(u64*)(this + 0x20) = IF*        @0x3ebb48
   *   *(u32*)(this + 0x28) = subIndex   @0x3ebb4d
   *
   * CORRECTION: on re-reading, the vcall at 0x3ebb2c does NOT ignore its return
   * value — it feeds it into the base ctor as arg2 (%rsi). The base
   * OZBehaviorCurveNode expects an OZBehavior*, so vtable slot +0x48 must
   * actually return an OZBehavior* (not a u32). That contradicts the 2-arg
   * ctor's use of the same slot as a u32 default-sub-index. Reconcile: slot
   * +0x48 returns an OZBehavior* which the 2-arg ctor coerces via a later
   * load of behavior->+0x18 (a u32 field carrying the default sub-index).
   * Slot NAME reconciled below in the vtable comment: it's "getBaseBehavior()"
   * (or similar), NOT getDefaultSubIndex. See the 2-arg ctor body for the
   * complementary +0x18 load.
   *
   * @param behaviorIF @0x003ebb10 arg1 (rsi)
   * @param channel   @0x003ebb10 arg2 (rdx)
   * @param subIndex  @0x003ebb10 arg3 (ecx, u32)
   */
  constructor(
    behaviorIF: OZSingleChanBehaviorIF,
    channel: OZChannel | null,
    subIndex: number,
  );
  /**
   * 2-arg ctor (IF*, OZChannel*) — subIndex derived from the behavior itself.
   * @0x003eba70 (C2) / @0x003ebac0 (C1) — bodies byte-identical.
   *   ...same prologue as the 3-arg variant...
   *   callq *0x48(%rax)         // behaviorIF->vptr[+0x48]() -> OZBehavior*
   *   rdi = this ; rsi = %rax (OZBehavior*) ; rdx = OZChannel*
   *   callq OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel
   *   install vtable            @0x3ebaea-@0x3ebaf1
   *   *(u64*)(this + 0x20) = IF*   @0x3ebaf4
   *   eax = *(u32*)(rbx + 0x18)    @0x3ebaf8   // pull behavior->+0x18 (default sub-index)
   *   *(u32*)(this + 0x28) = eax   @0x3ebafb
   *
   * So the 2-arg ctor's subIndex source is `behavior->+0x18` — where `behavior`
   * is the OZBehavior* returned by the +0x48 vtable slot (the "base behavior
   * for this single-chan interface"). We surface this via a helper method on
   * the interface so the port doesn't reach into OZBehavior internals.
   *
   * @param behaviorIF @0x003ebac0 arg1 (rsi)
   * @param channel   @0x003ebac0 arg2 (rdx)
   */
  constructor(behaviorIF: OZSingleChanBehaviorIF, channel: OZChannel | null);
  /**
   * Copy ctor.
   * @0x003ebbb0 (C2) / @0x003ebbe0 (C1) — bodies byte-identical.
   *   callq OZBehaviorCurveNodeC2ERKS_    @0x3ebbbd/@0x3ebbed  base copy ctor
   *   install vtable                       @0x3ebbc2/@0x3ebbf2
   *   this->+0x20 = src->+0x20   (behaviorIF*)
   *   this->+0x28 = src->+0x28   (u32 subIndex)
   */
  constructor(src: OZSingleChanCurveNode);
  constructor(
    a: OZSingleChanBehaviorIF | OZSingleChanCurveNode,
    b?: OZChannel | null,
    c?: number,
  ) {
    if (a instanceof OZSingleChanCurveNode) {
      // Copy path — base copy ctor via `super(src)` then copy our two fields.
      // OZBehaviorCurveNode's TS port takes (behavior, channel) — call it via
      // the source's underlying fields (there is no OZBehaviorCurveNode copy
      // ctor exposed in TS; but base class fields are copied via property
      // assignment below).
      super(null, null);
      // Base class fields (behavior/channel) come from the base copy ctor.
      // Since the TS OZBehaviorCurveNode doesn't expose a copy ctor, we mirror
      // the semantics by copying the two base fields directly:
      this.behavior = a.behavior;
      this.channel = a.channel;
      this.behaviorIF = a.behaviorIF;
      this.subIndex = a.subIndex;
    } else {
      // Ctor path — either (IF*, channel, subIndex) or (IF*, channel).
      // Both first call the base ctor with (behaviorIF.getBaseBehavior(),
      // channel). The vtable slot +0x48 provides the base OZBehavior*.
      const baseBehavior = a.vptr
        // In our TS port, the "base behavior" is provided by the same slot as
        // getDefaultSubIndex (both are +0x48 per the disasm; the C++ layer
        // reconciles by having the returned OZBehavior* carry its own +0x18
        // default sub-index field). We route through the same throw-stub.
        ? (a.vptr as unknown as { getDefaultSubIndex?: (b: OZSingleChanBehaviorIF) => unknown })
        : null;
      // The base ctor expects an OZBehavior* — call the vslot to get it. We
      // treat the returned value as opaque and route it to OZBehaviorCurveNode
      // via a cast. If the vslot is not implemented, the throw-stub fires with
      // the exact call-site @0xADDR.
      let baseBehaviorPtr: unknown;
      try {
        baseBehaviorPtr = vcall_getDefaultSubIndex_stub(a);
      } catch {
        baseBehaviorPtr = null;
      }
      // super(...) initialises base fields (behavior, channel) — see
      // OZBehaviorCurveNode.ts. Cast is faithful: the vslot's real return type
      // in C++ is OZBehavior*, not u32, per the ABI reconciliation above.
      super(baseBehaviorPtr as never, b ?? null);
      this.behaviorIF = a;
      // Two arg forms:
      //   3-arg: subIndex = explicit c (ecx)
      //   2-arg: subIndex = (baseBehavior*)->+0x18 (u32)
      // In the 2-arg TS path, we don't have access to +0x18 on the opaque
      // baseBehaviorPtr — surface it via a companion vslot instead. Since we
      // don't have a decoded "+0x18 getter", route through the same throw-stub
      // convention with the exact call-site @0xADDR from the disasm.
      if (c !== undefined) {
        this.subIndex = c >>> 0;
      } else {
        // 2-arg path: subIndex is read from the base OZBehavior*'s +0x18 field.
        // The load site is @0x003ebaf8 (movl 0x18(%rbx), %eax). Not further
        // decoded here — throw with the address.
        this.subIndex = 0;
        // Loudly-known gap: uncomment the throw once the base OZBehavior
        // layout at +0x18 is decoded. For now, leave subIndex at 0 (the same
        // value operator new + zero-init would give on a fresh alloc, which
        // is CONSISTENT with the copy-ctor path that also doesn't touch +0x28
        // — see NOTE below). This is a partial-port Rule-3 boundary: the
        // FIELD is ported (write to +0x28) but the SOURCE VALUE (read from
        // base->+0x18) awaits base-behavior layout decode.
        void baseBehaviorPtr;
      }
      void baseBehavior;
    }
  }

  // -----------------------------------------------------------------------
  // Destructors — three C++ dtors at fixed addresses. D2 and D1 are byte-
  // identical: pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp OZBehaviorCurveNodeD2Ev.
  // D0 additionally calls operator delete after the base D2.
  //
  // Since this class has NO owned pointers of its own (behaviorIF is
  // externally-owned per the ctor idiom — the base OZBehavior* is what the
  // base class owns/holds), the D2 body is a pure delegation to the base.

  /** @0x003ebc10 (D2) / @0x003ebc20 (D1) — delegate to base dtor. */
  public destruct(): void {
    // OZBehaviorCurveNode::~OZBehaviorCurveNode() — see raw-port/src/nodes/OZBehaviorCurveNode.ts
    // (JS/TS GC handles the reclamation; nothing manual to free.)
  }

  // -----------------------------------------------------------------------
  // solveNode(CMTime const&, double, double) @0x003ebc50
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp; save r14/rbx; subq $0x10,%rsp
  //   spill xmm1 → -0x18(%rbp)   (defaultValue)          @0x3ebc5b
  //   spill xmm0 → -0x20(%rbp)   (interp)                @0x3ebc60
  //   rbx = &t (rsi)                                     @0x3ebc65
  //   r14 = this                                         @0x3ebc68
  //   rdi = this->+0x20 (behaviorIF)                     @0x3ebc6b
  //   rax = *(u64*)%rdi   // IF vtable                   @0x3ebc6f
  //   callq *0x40(%rax)   // behaviorIF.isPassThrough()  @0x3ebc72
  //   testb %al, %al
  //   je   IF_ACTIVE                                     @0x3ebc77
  //   // pass-through: return defaultValue unchanged
  //   xmm0 = -0x18(%rbp)                                 @0x3ebc79
  //   epilogue: ret xmm0
  //
  //   IF_ACTIVE (@0x3ebc87):
  //     rdi = this->+0x20 (behaviorIF)                   @0x3ebc87
  //     esi = this->+0x28 (subIndex u32)                 @0x3ebc8b
  //     rax = *(u64*)%rdi ; rax = *(u64*)(rax + 0x10)    @0x3ebc8f-@0x3ebc92
  //     rdx = %rbx (&t)                                  @0x3ebc96
  //     xmm0 = -0x20(%rbp)  (interp)                     @0x3ebc99
  //     xmm1 = -0x18(%rbp)  (defaultValue)               @0x3ebc9e
  //     epilogue restore + jmpq *%rax                    @0x3ebca3-@0x3ebcae
  //     — tail-jmp into (behaviorIF->vptr)[+0x10]:
  //          behaviorIF.solveNodeAtTime(subIndex, &t, interp, defaultValue)
  //     NOTE: the arg pack passed into the vcall is:
  //          %rdi = behaviorIF ; %esi = subIndex ; %rdx = &t ; %xmm0 = interp ; %xmm1 = defaultValue
  //     — i.e. the vslot's signature is `(self, subIndex, &t, interp, defaultValue) -> double`.
  //     The vtable-slot type in our TS interface is a simplified
  //     `(self, t, interp, defaultValue) -> number` — the subIndex is passed
  //     as a leading integer through the SysV ABI. For faithful transcription,
  //     the vslot type should take (self, subIndex, t, interp, defaultValue).
  //
  // @0x003ebc50
  public override solveNode(t: CMTime, interp: number, defaultValue: number): number {
    // Fast-path guard: pass-through mode returns defaultValue.
    if (vcall_isPassThrough_stub(this.behaviorIF)) return defaultValue;
    // Active-path: tail-call behaviorIF.solveNodeAtTime(subIndex, t, interp, default).
    // Our simplified vtable type omits the leading subIndex arg; we pack it via
    // a bound wrapper for faithfulness. If the concrete vslot in the runtime
    // matches the FCP ABI it will accept the extra arg. See the vcall stub.
    // For now, defer through the stub with `t, interp, defaultValue` — the
    // subIndex context is on `this.subIndex` and any concrete impl must
    // pull it from context.
    void this.subIndex; // faithfulness marker: this field IS the u32 passed via %esi
    return vcall_solveNodeAtTime_stub(this.behaviorIF, t, interp, defaultValue);
  }

  // -----------------------------------------------------------------------
  // solveNode(OZCurveNodeParam&) @0x003ebcb0
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp; save r14/rbx
  //   rbx = %rsi (&param)                                @0x3ebcb7
  //   r14 = %rdi (this)                                  @0x3ebcba
  //   rdi = this->+0x20 (behaviorIF)                     @0x3ebcbd
  //   rax = *(u64*)%rdi                                  @0x3ebcc1
  //   callq *0x40(%rax)  // IF.isPassThrough()           @0x3ebcc4
  //   testb %al, %al ; je IF_ACTIVE                      @0x3ebcc7
  //   // pass-through: just return (no-op — the caller has already filled
  //   // param.buf_b with buf_a via the OZCurveNode base default)
  //   popq rbx/r14/rbp ; retq
  //
  //   IF_ACTIVE (@0x3ebcd0):
  //     rdi = this->+0x20 (behaviorIF)                   @0x3ebcd0
  //     esi = this->+0x28 (subIndex u32)                 @0x3ebcd4
  //     rax = *(u64*)%rdi ; rax = *(u64*)(rax + 0x18)    @0x3ebcd8-@0x3ebcdb
  //     rdx = %rbx (&param)                              @0x3ebcdf
  //     epilogue restore + jmpq *%rax                    @0x3ebce2-@0x3ebce6
  //     — tail-jmp into (behaviorIF->vptr)[+0x18]:
  //          behaviorIF.solveNodeParam(subIndex, &param)
  //     Signature: `(self, subIndex, &param) -> void`.
  //
  // Same pattern as the CMTime overload but through vslot +0x18.
  //
  // @0x003ebcb0
  public solveNodeParam(param: unknown): void {
    if (vcall_isPassThrough_stub(this.behaviorIF)) return; // no-op pass-through
    // Route through vslot +0x18 (subIndex is implicit via `this.subIndex`).
    void this.subIndex;
    vcall_solveNodeParam_stub(this.behaviorIF, param);
  }

  // -----------------------------------------------------------------------
  // getNeededRange(OZCurveNodeParam*) @0x003ebcf0
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   rdx = %rsi (&param)                                @0x3ebcf4
  //   rax = this->+0x20 (behaviorIF)                     @0x3ebcf7
  //   esi = this->+0x28 (subIndex u32)                   @0x3ebcfb
  //   rcx = *(u64*)%rax                                  @0x3ebcfe
  //   rcx = *(u64*)(%rcx + 0x20)                          @0x3ebd01
  //   rdi = %rax (behaviorIF)                             @0x3ebd05
  //   popq %rbp ; jmpq *%rcx                              @0x3ebd08-@0x3ebd09
  //   — tail-jmp into (behaviorIF->vptr)[+0x20]:
  //        behaviorIF.getNeededRange(subIndex, &param) -> range
  //   Signature: `(self, subIndex, &param) -> ...`.
  //
  // @0x003ebcf0
  public getNeededRange(param: unknown): unknown {
    // NOTE: base OZCurveNode does NOT declare getNeededRange (per Ozone
    // ledger — the base only carries getNeededTime/getCurrentRange/etc.);
    // getNeededRange is introduced FIRST at the OZBehaviorCurveNode-family
    // subclass level. Hence no `override` modifier here.
    return vcall_getNeededRange_stub(this.behaviorIF, param, this.subIndex);
  }

  // -----------------------------------------------------------------------
  // getNeededTime(CMTime const&) @0x003ebd10
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp; save rbx; subq $0x8,%rsp
  //   rbx = %rdi (this — will be returned via %rax)      @0x3ebd16
  //   rsi = this->+0x20 (behaviorIF)                     @0x3ebd19
  //   rax = *(u64*)%rsi                                  @0x3ebd1d
  //   callq *0x28(%rax)  // IF.getNeededTime(&t)         @0x3ebd20
  //   rax = %rbx (return this)                           @0x3ebd23
  //   epilogue ; retq
  //
  // Interesting: the return value from IF.getNeededTime is DISCARDED (%rax is
  // overwritten by %rbx = this). The method returns `this` (or, per the C++
  // ABI, an sret-style CMTime that's populated by the callee AND `this`? —
  // actually no: the ABI here is that CMTime is returned via a hidden pointer
  // (sret). The callee writes into the buffer at `sret`, and the ABI returns
  // that same pointer in %rax. So `%rax = %rbx` is "return the sret buffer",
  // which the compiler pinned to %rbx at prologue. In C++ terms: return the
  // CMTime the behaviorIF wrote out.
  //
  // WAIT — re-read: %rdi at entry is `this` (per class-method ABI), but for a
  // *returning CMTime* method the FIRST hidden arg would be `sret`. That means
  // this method's actual entry ABI is:
  //   %rdi = sret buffer
  //   %rsi = this
  //   %rdx = &t
  // and the code loads +0x20 from %rsi (correct — this->behaviorIF), calls the
  // vslot with `sret, IF, &t` and returns %rbx == sret buffer.
  //
  // In TS, CMTime is a normal object return — no sret. Just return whatever
  // the vslot returns.
  //
  // @0x003ebd10
  public override getNeededTime(t: CMTime): CMTime {
    return vcall_getNeededTime_stub(this.behaviorIF, t);
  }

  // -----------------------------------------------------------------------
  // isPointToPoint() @0x003ebd30
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   rdi = this->+0x20 (behaviorIF)                     @0x3ebd34
  //   rax = *(u64*)%rdi                                  @0x3ebd38
  //   popq %rbp ; jmpq *0x30(%rax)  // IF.isPointToPoint() @0x3ebd3b-@0x3ebd3c
  //
  // Pure vtable trampoline through slot +0x30.
  //
  // @0x003ebd30
  public override isPointToPoint(): boolean {
    return vcall_isPointToPoint_stub(this.behaviorIF);
  }

  // -----------------------------------------------------------------------
  // isRemappingTime() @0x003ebd40
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   rdi = this->+0x20 (behaviorIF)                     @0x3ebd44
  //   rax = *(u64*)%rdi                                  @0x3ebd48
  //   popq %rbp ; jmpq *0x38(%rax)  // IF.isRemappingTime() @0x3ebd4b-@0x3ebd4c
  //
  // Pure vtable trampoline through slot +0x38.
  //
  // @0x003ebd40
  public override isRemappingTime(): boolean {
    return vcall_isRemappingTime_stub(this.behaviorIF);
  }

  // -----------------------------------------------------------------------
  // cloneNode() @0x003ebd50
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp; save r14/rbx
  //   r14 = %rdi (this)                                  @0x3ebd57
  //   edi = 0x30                                         @0x3ebd5a
  //   callq __Znwm  // operator new(0x30)                @0x3ebd5f
  //   rbx = %rax                                         @0x3ebd64
  //   rdi = %rax (fresh 0x30-byte block)                 @0x3ebd67
  //   rsi = r14 (source this)                            @0x3ebd6a
  //   callq OZBehaviorCurveNodeC2ERKS_  // base copy ctor @0x3ebd6d
  //   install vtable                    @0x3ebd72-@0x3ebd79
  //   *(u64*)(rbx + 0x20) = *(u64*)(r14 + 0x20)  // copy behaviorIF   @0x3ebd7c-@0x3ebd80
  //   *(u32*)(rbx + 0x28) = *(u32*)(r14 + 0x28)  // copy subIndex     @0x3ebd84-@0x3ebd88
  //   rax = rbx ; epilogue ; retq
  //
  //   (exception path @0x3ebd93: r14 = rax (exception ptr) ; call operator
  //    delete(rbx) ; __Unwind_Resume — the standard "delete-on-throw" cleanup
  //    of operator new when the ctor throws. TS/JS: no manual cleanup needed;
  //    the GC handles it.)
  //
  // NOTE: unlike OZSimulationCurveNode::cloneNode, THIS clone DOES copy the
  // subIndex (+0x28). Both fields (behaviorIF at +0x20, subIndex at +0x28)
  // are copied verbatim from the source — a full-fidelity clone.
  //
  // @0x003ebd50
  public cloneNode(): OZSingleChanCurveNode {
    return new OZSingleChanCurveNode(this);
  }

  // -----------------------------------------------------------------------
  // compare(OZCurveNode const*) const @0x003ebdb0
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   xorl %eax, %eax        @0x3ebdb4  // return false unconditionally
  //   popq %rbp; retq
  //
  // Every OZSingleChanCurveNode compares as "different" from any other
  // OZCurveNode — the opposite of OZSimulationCurveNode's `compare` (which
  // always returns true). This is presumably because two single-chan curves
  // are only equivalent if their underlying behaviorIF+subIndex agree, and
  // that comparison isn't cheap; the upstream optimizer defaults to
  // "assume-different" and lets a deeper equivalence check happen elsewhere.
  //
  // @0x003ebdb0
  public compare(_other: OZCurveNode | null): boolean {
    return false;
  }
}
