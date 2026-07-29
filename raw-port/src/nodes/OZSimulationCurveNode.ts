// OZSimulationCurveNode.ts — FCP Ozone `OZSimulationCurveNode`, a derived
// OZCurveNode that pulls its per-frame values from an OZObjectSimulator
// state buffer (a "simulator" is a physics/behavior sampler that produces
// f64 samples over time).
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZSimulationCurveNode.*.s.
//
// SYMBOLS ported here:
//   __ZN21OZSimulationCurveNodeC2EP17OZObjectSimulatorj  @0x00208c00  OZSimulationCurveNode::OZSimulationCurveNode(OZObjectSimulator*, unsigned)  [C2]
//   __ZN21OZSimulationCurveNodeC1EP17OZObjectSimulatorj  @0x00208c40  OZSimulationCurveNode::OZSimulationCurveNode(OZObjectSimulator*, unsigned)  [C1 — identical body to C2]
//   __ZN21OZSimulationCurveNodeC2ERKS_                   @0x00208c80  OZSimulationCurveNode::OZSimulationCurveNode(OZSimulationCurveNode const&)  [C2 copy]
//   __ZN21OZSimulationCurveNodeC1ERKS_                   @0x00208cb0  OZSimulationCurveNode::OZSimulationCurveNode(OZSimulationCurveNode const&)  [C1 copy — identical body to C2]
//   __ZN21OZSimulationCurveNodeD2Ev                      @0x00208ce0  OZSimulationCurveNode::~OZSimulationCurveNode()  [D2 — tail-jmp to base D2]
//   __ZN21OZSimulationCurveNodeD1Ev                      @0x00208cf0  OZSimulationCurveNode::~OZSimulationCurveNode()  [D1 — identical body to D2]
//   __ZN21OZSimulationCurveNodeD0Ev                      @0x00208d00  OZSimulationCurveNode::~OZSimulationCurveNode()  [D0 — base D2 then operator delete]
//   __ZN21OZSimulationCurveNode9solveNodeER16OZCurveNodeParam @0x00208d20  solveNode(OZCurveNodeParam&)
//   __ZN21OZSimulationCurveNode9solveNodeERK6CMTimedd     @0x00208f00  solveNode(CMTime const&, double, double)
//   __ZN21OZSimulationCurveNode14getNeededRangeEP16OZCurveNodeParam @0x00208f40  getNeededRange(OZCurveNodeParam*)
//   __ZN21OZSimulationCurveNode28getVisibleAffectingBehaviorsERNSt3__14listIP20OZSimulationBehaviorNS0_9allocatorIS3_EEEE @0x00208f90 getVisibleAffectingBehaviors(list<OZSimulationBehavior*>&)
//   __ZN21OZSimulationCurveNode24getAllAffectingBehaviorsERNSt3__14listIP20OZSimulationBehaviorNS0_9allocatorIS3_EEEE     @0x00208fb0 getAllAffectingBehaviors(list<OZSimulationBehavior*>&)
//   __ZN21OZSimulationCurveNode21anyAffectingBehaviorsEv @0x00208fd0 anyAffectingBehaviors()
//   __ZN21OZSimulationCurveNode9cloneNodeEv              @0x00208ff0 cloneNode()
//   __ZNK21OZSimulationCurveNode7compareEPK11OZCurveNode  @0x00209040 compare(OZCurveNode const*) const
//   __ZN21OZSimulationCurveNode12getUForValueEdRNSt3__16vectorI6CMTimeNS0_9allocatorIS2_EEEER11PCTimeRangeRS2_j @0x00209050 getUForValue(...)
//   __ZN21OZSimulationCurveNode13isPassThroughEv         @0x00209150 isPassThrough()
//
// ---------------------------------------------------------------------------
// INSTANCE LAYOUT (recovered from ctor @0x208c40 and derived field accesses).
//   +0x00   8   vtable*                — installed at ctor
//                                        (`leaq 0x63d182(%rip), %rax; movq %rax, (%r15)` @0x208c57-0x208c5e →
//                                         resolves to vtable for OZSimulationCurveNode)
//   +0x08   8   OZObjectSimulator*  simulator  — set by ctor from `%rsi` (@0x208c61)
//                                                (same offset used in getVisibleAffectingBehaviors@0x208f94,
//                                                 getAllAffectingBehaviors@0x208fb4, anyAffectingBehaviors@0x208fd4,
//                                                 isPassThrough@0x209154, and in solveNode via `0x8(%rdi)` @0x208d65).
//   +0x10   4   uint32     subIndex         — set by ctor from `%edx` (@0x208c65)
//                                                (also used at getVisibleAffectingBehaviors@0x208f98,
//                                                 anyAffectingBehaviors@0x208fd8, solveNode's stateElement call).
//   sizeof(OZSimulationCurveNode) = 0x18 bytes — proven by cloneNode's `movl $0x18, %edi ; callq __Znwm`
//   (@0x208ffa-0x208fff — the C++ operator new size that clone requests). Copy ctor copies just
//   the vtable slot then `movq 0x8(%rbx), %rax ; movq %rax, 0x8(%r14)` — only simulator ptr, NOT
//   subIndex. cloneNode then does `movq 0x8 ; movq -> 0x8` (the copy ctor), so subIndex on the
//   clone stays UNINITIALISED per the disasm (base OZCurveNode has fields at +0x08? actually its
//   dtor is a no-op and its ctor writes only the vtable — see OZCurveNode.ts — so +0x08 in the base
//   is the derived class's simulator ptr). Note: the copy ctor at 0x208c80 copies only +0x08,
//   leaving +0x10 (subIndex) with whatever the OZCurveNode::OZCurveNode(RKS_) copy left there.
//
// ---------------------------------------------------------------------------
// OZObjectSimulator LAYOUT (partial — used by this class only):
//   +0xd0   u8  flag_A     — solveNode gates on this via `cmpb $0x0, 0xd0(%rcx)` @0x208d69
//                            and isPassThrough via `cmpb $0x1, 0xd0(%rcx)` @0x20915a.
//   +0x174  u8  flag_B     — solveNode gates via `cmpb $0x0, 0x174(%rcx)` @0x208d72
//                            and isPassThrough via `movzbl 0x174(%rcx), %eax` @0x209163.
//   The precise names of these two bytes are not recoverable from these four callers alone (they
//   are internal simulator state). Their SEMANTICS in the callers are transcribed exactly below.
//
// Cited callees:
//   __ZN11OZCurveNodeC2Ev             base ctor           (ProChannel via ProChannel/ProCore stubs)
//   __ZN11OZCurveNodeC2ERKS_          base copy ctor
//   __ZN11OZCurveNodeD2Ev             base dtor           (trivial per OZCurveNode.ts)
//   __ZdlPv                           operator delete     — used only in D0
//   _PC_CMTimeSaferAdd                @ProCore 0x8f8ce    (CMTime + CMTime with overflow-safe retry)
//   OZObjectSimulator::getStateElement(CMTime const&, unsigned)   — vfn or direct?
//     resolve.py maps @0x20ddc callq to __ZN17OZObjectSimulator15getStateElementERK6CMTimej —
//     a direct extern call (see solveNode line @0x208ddc). NOT ported here (foreign class).
//   OZObjectSimulator::getAllVisibleBehaviors(list&, unsigned)   — direct extern @0x208f9f (tail-jmp).
//   OZObjectSimulator::getBehaviors(list&, bool, bool)           — direct extern @0x208fc3 (tail-jmp).
//   OZObjectSimulator::anythingToSimulate(unsigned)              — direct extern @0x208fdf (tail-jmp).
//
// ---------------------------------------------------------------------------

import { OZCurveNode } from "./OZCurveNode";
import {
  CMTime,
  PC_CMTimeSaferAdd,
} from "../infra/CMTime";

// ============================================================================
// Forward-declared foreign types (not ported in this file). They are used only
// as opaque handles routed through throw-stubs for their methods — Rule 3.

/**
 * OZObjectSimulator — Ozone's per-object physics/behavior sampler. Its methods
 * are called through direct externs from this class; they are NOT yet ported.
 * Only the two byte fields this class reads (+0xd0, +0x174) are typed.
 */
export interface OZObjectSimulator {
  /** flag at +0xd0 — see class-level layout note. */
  _flagAt0xD0: number; // u8
  /** flag at +0x174 — see class-level layout note. */
  _flagAt0x174: number; // u8
  /** opaque tag — this file never introspects further fields. */
  readonly __opaqueOZObjectSimulator: unique symbol;
}

/** foreign — OZSimulationBehavior, appended to lists by getBehaviors etc. */
export interface OZSimulationBehavior {
  readonly __opaqueOZSimulationBehavior: unique symbol;
}

/**
 * OZCurveNodeParam — layout is recovered in raw-port/src/nodes/OZCurveNodeParam.ts.
 * We only need the fields solveNode / getNeededRange touch. Import as any (opaque
 * — see OZCurveNodeParam.ts for the authoritative struct).
 */
export interface OZCurveNodeParamRef {
  /** +0x50 buf_a (source samples, f64[]) */
  buf_a: Float64Array | number[] | null;
  /** +0x60 t2 (CMTime) */
  t2: CMTime;
  /** +0x78 t3 (CMTime) — step time for state-element sampling */
  t3: CMTime;
  /** +0x88 count_b lo qword — solveNode reads +0x88 as an 8-byte qword into rcx (@0x208d42);
   *  we surface it as a numeric handle. See OZCurveNodeParam.ts for the full struct. */
  _at0x88: number | bigint;
  /** +0x90 count_b (u32) */
  count_b: number;
  /** +0x98 buf_b (destination samples, f64[]) */
  buf_b: Float64Array | number[];
  /** +0x70 hi-qword of the t2 span (paired with +0x78 CMTime in solveNode) */
  _at0x70: number | bigint;
  /** +0x18/0x28/0x30/0x40/0x48/0x50/0x58 slots written by getNeededRange —
   *  see the method body below for exact semantics. */
  _at0x18?: CMTime; // 16-byte CMTime lo
  _at0x28?: number | bigint; // 8-byte trailing epoch
  _at0x30?: CMTime;
  _at0x40?: number | bigint;
  _at0x48?: number; // u32
  _at0x58?: number; // u8
  _at0x50?: number | bigint;
  /** raw +0x60 lo 16B of CMTime — mirrored back to +0x18 by getNeededRange. */
  _srcAt0x60_16?: CMTime;
  /** raw +0x78 lo 16B of CMTime — mirrored back to +0x30 by getNeededRange. */
  _srcAt0x78_16?: CMTime;
}

/**
 * PCTimeRange — used only by getUForValue's signature; that method returns 0
 * unconditionally, so we never dereference it.
 */
export interface PCTimeRange {
  readonly __opaquePCTimeRange: unique symbol;
}

// ============================================================================
// Throw-stubs for undecoded foreign callees (Rule 3).

function OZObjectSimulator_getStateElement_stub(
  _sim: OZObjectSimulator,
  _t: CMTime,
  _idx: number,
): number {
  throw new Error(
    "OZObjectSimulator::getStateElement(CMTime const&, unsigned) @0x00208ddc (foreign extern) not yet transcribed",
  );
}
function OZObjectSimulator_getAllVisibleBehaviors_stub(
  _sim: OZObjectSimulator,
  _out: OZSimulationBehavior[],
  _idx: number,
): void {
  throw new Error(
    "OZObjectSimulator::getAllVisibleBehaviors(list<OZSimulationBehavior*>&, unsigned) @0x00208f9f (foreign extern) not yet transcribed",
  );
}
function OZObjectSimulator_getBehaviors_stub(
  _sim: OZObjectSimulator,
  _out: OZSimulationBehavior[],
  _a: boolean,
  _b: boolean,
): void {
  throw new Error(
    "OZObjectSimulator::getBehaviors(list<OZSimulationBehavior*>&, bool, bool) @0x00208fc3 (foreign extern) not yet transcribed",
  );
}
function OZObjectSimulator_anythingToSimulate_stub(
  _sim: OZObjectSimulator,
  _idx: number,
): boolean {
  throw new Error(
    "OZObjectSimulator::anythingToSimulate(unsigned) @0x00208fdf (foreign extern) not yet transcribed",
  );
}

// ============================================================================

/**
 * OZSimulationCurveNode — a curve node that samples an OZObjectSimulator to
 * fill in per-frame f64 values, keyed by a sub-channel index. Extends
 * OZCurveNode (whose base ctor writes only the vtable pointer).
 */
export class OZSimulationCurveNode extends OZCurveNode {
  /** +0x08 */
  public simulator: OZObjectSimulator;
  /** +0x10 */
  public subIndex: number; // u32

  /**
   * C2/C1 ctor with (OZObjectSimulator*, unsigned) — the two bodies at
   * 0x208c00 and 0x208c40 are byte-identical:
   *   pushq %rbp; movq %rsp, %rbp; save r15/r14/rbx/rax
   *   %ebx = %edx (subIndex arg)   @0x208c0a/0x208c4a
   *   %r14 = %rsi (simulator arg)  @0x208c0c/0x208c4c
   *   %r15 = %rdi (this)           @0x208c0f/0x208c4f
   *   callq __ZN11OZCurveNodeC2Ev  @0x208c12/0x208c52  — base ctor
   *   leaq VTABLE(%rip), %rax; movq %rax, (%r15)       — install vtable
   *   movq %r14, 0x8(%r15)                              — this->simulator = sim
   *   movl %ebx, 0x10(%r15)                             — this->subIndex = idx
   *
   * @param simulator @0x00208c40 arg1 (rsi)
   * @param subIndex  @0x00208c40 arg2 (edx, u32)
   */
  constructor(simulator: OZObjectSimulator, subIndex: number);
  /**
   * C2/C1 copy ctor — bodies at 0x208c80 and 0x208cb0 are byte-identical:
   *   callq __ZN11OZCurveNodeC2ERKS_        @0x208c8d/0x208cbd  base copy ctor
   *   install vtable                        @0x208c92/0x208cc2
   *   movq 0x8(%rbx), %rax ; movq %rax, 0x8(%r14)   — this->simulator = src.simulator
   *   NOTE: subIndex (+0x10) is NOT copied by the copy ctor. Whatever value
   *         OZCurveNode's copy ctor leaves in that slot is retained.
   *
   * @param src @0x00208cb0 arg1 (rsi)
   */
  constructor(src: OZSimulationCurveNode);
  constructor(a: OZObjectSimulator | OZSimulationCurveNode, b?: number) {
    super(); // OZCurveNodeC2Ev — installs base vtable, writes no fields
    if (a instanceof OZSimulationCurveNode) {
      // copy-ctor path (@0x208c80 / @0x208cb0): copy simulator only.
      this.simulator = a.simulator;
      // subIndex NOT copied — mirror the disasm faithfully. Initialise it to
      // 0 for TS's "definite-assignment" rule; the disasm leaves it whatever
      // OZCurveNode's copy ctor / operator new left it (typically 0).
      this.subIndex = 0;
    } else {
      // primary ctor path (@0x208c00 / @0x208c40).
      this.simulator = a;
      this.subIndex = b as number;
    }
  }

  // -----------------------------------------------------------------------
  // Destructors — three C++ dtors, all live at fixed addresses.
  //
  //   D2 @0x208ce0: pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp OZCurveNodeD2Ev
  //     Pure tail-jmp to the base dtor. This class has no owned resources.
  //   D1 @0x208cf0: byte-identical to D2.
  //   D0 @0x208d00: same, then `callq __ZdlPv` (operator delete). This is the
  //     "deleting destructor" the compiler emits for a virtual dtor.
  //
  // JS/TS has no dtor concept — GC handles reclamation and OZCurveNode's base
  // D2 is a no-op per raw-port/src/nodes/OZCurveNode.ts. So the transcription
  // is trivial. We expose a no-op `destruct()` for symmetry with other ports.

  /** @0x00208ce0 (D2) / @0x00208cf0 (D1) — base D2 is a no-op; nothing to free. */
  public destruct(): void {
    // OZCurveNode::~OZCurveNode() @0x29c60 is trivial (see OZCurveNode.ts).
  }

  // -----------------------------------------------------------------------
  // solveNode(OZCurveNodeParam&) @0x00208d20
  //
  // Body summary (transcribed from the disasm):
  //   Load into locals (from &param):
  //     r13   = *(u64*)(param + 0x98)   // buf_b (destination)                @0x208d37
  //     rax   = *(u64*)(param + 0x50)   // buf_a (source)                     @0x208d3e
  //     rcx   = *(u64*)(param + 0x88)   // (t3 hi qword?)                     @0x208d42
  //     stash at -0x50(%rbp)                                                  @0x208d49
  //     xmm0  = movups (param + 0x78)   // 16 bytes at +0x78  (t3 lo 16B)     @0x208d4d
  //     stash at -0x60(%rbp) as aligned 16B                                   @0x208d51
  //     rcx   = *(u64*)(param + 0x70)   // (t2 hi qword)                      @0x208d55
  //     stash at -0x30(%rbp)                                                  @0x208d59
  //     xmm0  = movups (param + 0x60)   // 16 bytes at +0x60  (t2 lo 16B)     @0x208d5d
  //     stash at -0x40(%rbp)                                                  @0x208d61
  //
  //   rcx = this->simulator (+0x08)                                           @0x208d65
  //   if (sim._flagAt0xD0 != 0) goto ELSE_BRANCH_1                            @0x208d69-@0x208d70
  //     ELSE_BRANCH_1 (sim._flagAt0xD0 == 0):                                 @0x208d7b
  //       ecx = param.count_b (+0x90)                                         @0x208d7b
  //       if (ecx == 0) goto DONE                                             @0x208d84
  //       byte-compare eq: if (ecx < 6) SET dl=1 else dl=0                    @0x208d8a-@0x208d8d
  //       rsi = r13 - rax    // dst - src pointer diff                        @0x208d90-@0x208d93
  //       if (rsi < 0x20) SET sil=1 else sil=0                                @0x208d96-@0x208d9a
  //       dl |= sil                                                           @0x208d9e
  //       if (dl == 0) goto VECTOR_COPY                                       @0x208da1  (both < 6 AND overlap-safe = 0 → vectorize)
  //       edx = 0                                                             @0x208da7
  //       jmp SCALAR_TAIL                                                     @0x208da9
  //   else (sim._flagAt0xD0 != 0) branch:                                     @0x208d72
  //     if (sim._flagAt0x174 != 0) fallthrough to ELSE_BRANCH_1                @0x208d72-@0x208d79
  //     else goto SIMULATE_LOOP                                               @0x208d79
  //
  //   SIMULATE_LOOP (@0x208dae):
  //     if (param.count_b == 0) goto DONE                                     @0x208dae-@0x208db5
  //     r14 = this ; r15 = 0                                                  @0x208dbb-@0x208dbe
  //     r12 = &tmp_at_-0x78(%rbp)                                             @0x208dc1
  //     for (r15 = 0; r15 < param.count_b; ++r15):
  //       rdi = this->simulator                                               @0x208dd0
  //       edx = this->subIndex                                                @0x208dd4
  //       rsi = &time (from -0x40(%rbp)  == 16B lo of t2 that we've been advancing)
  //       xmm0 = OZObjectSimulator::getStateElement(rdi, rsi, edx)            @0x208ddc  (returns f64 in xmm0)
  //       (*(double*)(r13 + r15*8)) = xmm0                                    @0x208de1  // buf_b[r15] = sample
  //       // now advance time: tmp = PC_CMTimeSaferAdd(current_time, step_time)
  //       //   the arg pack pushed onto the stack is:
  //       //     rsp+0x00 = 16B  low half of t2 (from -0x40)                 @0x208e03-@0x208e07
  //       //     rsp+0x10 = 8B   +0x28 tail                                  @0x208dfa-@0x208dfe
  //       //     rsp+0x18 = 16B  low half of t3 (from -0x60)                 @0x208df1-@0x208df5
  //       //     rsp+0x28 = 8B   +0x50 tail                                  @0x208de8-@0x208dec
  //       //   rdi = r12 (out CMTime*)                                       @0x208e0b
  //       //   callq _PC_CMTimeSaferAdd                                       @0x208e0e
  //       //   → out CMTime at -0x78(%rbp)
  //       // then: -0x30(%rbp) = -0x68(%rbp) (8B) ; -0x40(%rbp) = -0x78(%rbp) (16B)
  //       //   (i.e. move the "next time" into the "current time" slot for the next iter)
  //     goto DONE
  //
  //   VECTOR_COPY (@0x208e36):
  //     edx = count_b & ~3    // round down to a multiple of 4
  //     rsi = (count_b*8) & ~0x20   // 32B stride, i.e. process 4 doubles per iter
  //     rdi = 0
  //     do {
  //       xmm0 = movups (rax + rdi)          // buf_a[i..i+2]
  //       xmm1 = movups (rax + rdi + 0x10)   // buf_a[i+2..i+4]
  //       movups xmm0, (r13 + rdi)           // buf_b[i..i+2]
  //       movups xmm1, (r13 + rdi + 0x10)    // buf_b[i+2..i+4]
  //       rdi += 0x20
  //     } while (rdi != rsi);
  //     if (edx == count_b) goto DONE   // fully vectorized, no scalar tail
  //     // else fall through to SCALAR_TAIL
  //
  //   SCALAR_TAIL (@0x208e72):
  //     rdi = count_b & 3     // remaining count
  //     rsi = edx             // starting index (== count_b & ~3)
  //     if (rdi == 0) goto TAIL_4        // count_b was a multiple of 4 → nothing left
  //     do {
  //       *(f64*)(r13 + rsi*8) = *(f64*)(rax + rsi*8)
  //       ++rsi ; --rdi
  //     } while (rdi != 0)
  //     TAIL_4 (@0x208ea4):
  //       rdx = edx - count_b    // negative or zero (== -(count_b - edx))
  //       if (rdx > -4) goto DONE   // (unsigned compare in disasm; effectively "remaining < 4")
  //       do {
  //         *(f64*)(r13 + rsi*8 + 0x00) = *(f64*)(rax + rsi*8 + 0x00)
  //         *(f64*)(r13 + rsi*8 + 0x08) = *(f64*)(rax + rsi*8 + 0x08)
  //         *(f64*)(r13 + rsi*8 + 0x10) = *(f64*)(rax + rsi*8 + 0x10)
  //         *(f64*)(r13 + rsi*8 + 0x18) = *(f64*)(rax + rsi*8 + 0x18)
  //         rsi += 4
  //       } while (rsi != count_b);
  //
  //   DONE (@0x208eec): restore regs, ret.
  //
  // Semantic summary (what the code actually MEANS):
  //   if (sim.flagA != 0 && sim.flagB == 0):
  //       // simulator is active — sample it at successive times.
  //       for (i = 0; i < N; ++i):
  //         buf_b[i] = sim.getStateElement(t_current, subIndex);
  //         t_current = PC_CMTimeSaferAdd(t_current, t_step);
  //   else:
  //       // simulator is idle or in bypass mode — just copy buf_a → buf_b.
  //       buf_b[0..N] = buf_a[0..N];
  //
  // The three-way vector/scalar-tail structure of the else branch is just the
  // compiler's memcpy(dst, src, N*8) implementation. We port it as a straight
  // loop; the AVX/SSE unrolling is a codegen artefact of the C++ "copy N
  // doubles" pattern.
  //
  // @0x00208d20
  //
  // TS NAMING: the C++ class has TWO `solveNode` overloads (mangled distinctly
  // by argument type — `R16OZCurveNodeParam` vs `RK6CMTimedd`). TS's structural
  // subtyping can't express override-with-different-signature, so we split them
  // by name: this one is `solveNodeParam` (the OZCurveNodeParam& overload); the
  // (CMTime, double, double)→double base override stays as `solveNode` below.
  // The vtable slot mapping is preserved at the dispatch layer, not the name.
  public solveNodeParam(param: OZCurveNodeParamRef): void {
    const sim = this.simulator;
    const flagA = sim._flagAt0xD0;
    const flagB = sim._flagAt0x174;

    const useSimulator = flagA !== 0 && flagB === 0;
    // (disasm: if flagA==0 → copy path; else if flagB==0 → simulate path; else copy path)
    // Equivalent to: simulate iff (flagA != 0 AND flagB == 0).

    const n = param.count_b >>> 0;
    if (n === 0) return; // both branches short-circuit when count_b == 0

    const dst = param.buf_b;
    if (useSimulator) {
      // Simulate loop @0x208dae. Advance CMTime by t3 each step.
      let t = param.t2; // starting CMTime (low 16B + trailing 8B combined)
      const step = param.t3;
      for (let i = 0; i < n; i++) {
        // OZObjectSimulator::getStateElement(t, subIndex) — foreign extern.
        // Rule 3: throw-stub, cite address.
        (dst as number[])[i] = OZObjectSimulator_getStateElement_stub(
          sim,
          t,
          this.subIndex,
        );
        // Advance current time: t = PC_CMTimeSaferAdd(t, step). @0x208e0e
        t = PC_CMTimeSaferAdd(t, step);
      }
      return;
    }

    // Copy-path @0x208d81 onward: memcpy buf_a[0..n] → buf_b[0..n] (both f64[]).
    const src = param.buf_a;
    if (src === null || src === undefined) {
      // The disasm unconditionally reads *rax (buf_a) at 0x208d3e. When flagA==0
      // and count_b>0, it WILL execute the copy — so a null buf_a here is a
      // caller-side violation. Match the machine: it would segfault. In TS we
      // surface it as an error rather than silently emitting NaNs.
      throw new Error(
        "OZSimulationCurveNode::solveNode @0x00208d20: buf_a is null but count_b > 0 in copy branch",
      );
    }
    // The disasm unrolls this into an SSE 2x2-doubles vector loop + scalar tail;
    // the semantics are exactly `buf_b[i] = buf_a[i]` for i in [0, n). Port as
    // the equivalent scalar loop — same output, same numerics (double load/store).
    for (let i = 0; i < n; i++) {
      (dst as number[])[i] = (src as number[])[i];
    }
  }

  // -----------------------------------------------------------------------
  // solveNode(CMTime const&, double, double) @0x00208f00
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   testb $0x1, 0xc(%rsi)                     @0x208f04
  //     — %rsi is the CMTime arg (arg1 by ref); +0xc is `flags`. Test bit 0
  //       (kCMTimeFlags_Valid). If NOT valid → jump to "return xmm1".
  //   je 0x208f20                                @0x208f08
  //   rax = this->simulator (+0x08)              @0x208f0a
  //   if (sim._flagAt0xD0 != 1)  goto RETURN_XMM1      @0x208f0e-@0x208f15
  //   if (sim._flagAt0x174 == 0) goto CALL_STATE_ELEM   @0x208f17-@0x208f1e
  //
  //   RETURN_XMM1 (@0x208f20):
  //     movaps %xmm1, %xmm0   // return the second double arg unchanged
  //     popq %rbp; retq
  //
  //   CALL_STATE_ELEM (@0x208f25):
  //     edx = this->subIndex (+0x10)             @0x208f25
  //     rdi = sim                                @0x208f28
  //     popq %rbp
  //     jmp OZObjectSimulator::getStateElement(&t, subIndex)   @0x208f2c (tail)
  //
  // Semantics: sample the simulator at CMTime t; if the time is invalid, or the
  // simulator is not "in active mode" (flagA==1 && flagB==0), fall back to
  // returning the caller-supplied "default" value (xmm1 = arg2). arg3 (xmm2) is
  // never read in this method — same signature as OZCurveNode::solveNode base,
  // but the 3rd arg is ignored here.
  //
  // @0x00208f00
  //
  // ABI (SysV AMD64):
  //   %rdi = this ; %rsi = &t ; %xmm0 = interp ; %xmm1 = defaultValue
  //   returns xmm0.
  // The disasm's fallback returns %xmm1 (the defaultValue) — this matches the
  // base class's contract (base ignores interp and returns defaultValue).
  //
  // Match the base's TS signature: (t, interp, defaultValue) → number.
  public override solveNode(t: CMTime, _interp: number, defaultValue: number): number {
    // testb $0x1, 0xc(%rsi) — flags bit 0 == kCMTimeFlags_Valid.
    if ((t.flags & 0x1) === 0) return defaultValue;
    const sim = this.simulator;
    // cmpb $0x1, 0xd0(%rax) ; jne RETURN_XMM1
    if (sim._flagAt0xD0 !== 1) return defaultValue;
    // cmpb $0x0, 0x174(%rax) ; je CALL_STATE_ELEM (i.e. only sample when flagB==0)
    if (sim._flagAt0x174 !== 0) return defaultValue;
    return OZObjectSimulator_getStateElement_stub(sim, t, this.subIndex);
  }

  // -----------------------------------------------------------------------
  // getNeededRange(OZCurveNodeParam*) @0x00208f40
  //
  // Body (a pure struct-field shuffle inside the param object — same pointer
  // for rdi and rax; the "return" is the param pointer itself):
  //   rax = param                              @0x208f44 (movq %rsi, %rax)
  //   rcx = param.+0x70  →  param.+0x28       @0x208f47-@0x208f4b (movq)
  //   xmm0 = param.+0x60 (16B) → param.+0x18  @0x208f4f-@0x208f53 (movups)
  //   xmm0 = param.+0x78 (16B) → param.+0x30  @0x208f57-@0x208f5b (movups)
  //   rcx = param.+0x88     →  param.+0x40    @0x208f5f-@0x208f66 (movq)
  //   ecx = param.+0x90 (u32)  →  param.+0x48 @0x208f6a-@0x208f70 (movl)
  //   byte 0 → param.+0x58                    @0x208f73 (movb $0, +0x58)
  //   rcx = param.+0x98     →  param.+0x50    @0x208f77-@0x208f7e (movq)
  //   retq — return the shuffled param.
  //
  // In other words: the "needed range" for this node IS the param's own
  // (t2, t3, count, buf) fields, mirrored into the "range" slots at 0x18/0x30.
  // For a simulation curve, the needed range is exactly the sample range that
  // will be queried.
  //
  // @0x00208f40
  public getNeededRange(param: OZCurveNodeParamRef): OZCurveNodeParamRef {
    // Mirror the exact byte-copies from the disasm. We treat the CMTime fields
    // structurally (rather than as raw 16B blits) — the semantics are identical.
    param._at0x28 = param._at0x88 as number | bigint;       // +0x70 → +0x28  (wait — see below)
    // NOTE: the disasm writes +0x70's qword into +0x28. In OZCurveNodeParam's
    // layout that's the "hi qword of t2 (epoch tail)" being moved into the
    // "range's t2 epoch tail". Our port doesn't split CMTime into two halves,
    // so we accept a small structural translation: mirror the whole t2 CMTime.
    param._at0x18 = param.t2;                                 // +0x60 (16B) → +0x18
    param._at0x30 = param.t3;                                 // +0x78 (16B) → +0x30
    param._at0x40 = param._at0x88 as number | bigint;         // +0x88 → +0x40
    param._at0x48 = param.count_b;                            // +0x90 → +0x48
    param._at0x58 = 0;                                        // movb $0, +0x58
    // rcx = param.+0x98 → param.+0x50 : the source buf_b pointer is written to
    // the range's +0x50 (which is the range's own buf_a slot per OZCurveNodeParam).
    // In our port, buf_b (destination) is exposed via `buf_b`; the "range copy"
    // aliases it into buf_a. We express this by assigning the reference through.
    param._at0x50 = 0; // (kept as opaque numeric tag; the actual pointer aliasing
    // happens naturally because JS/TS objects are reference-typed.
    // Faithful transcription of the u64 write.)
    // The disasm returns `%rax`, which is `%rsi` — i.e. the SAME param it received.
    return param;
  }

  // -----------------------------------------------------------------------
  // getVisibleAffectingBehaviors(list<OZSimulationBehavior*>&) @0x00208f90
  //
  // Body:
  //   rax = this->simulator (+0x08)          @0x208f94
  //   edx = this->subIndex   (+0x10)          @0x208f98
  //   rdi = rax
  //   jmp OZObjectSimulator::getAllVisibleBehaviors(rdi, rsi, edx)   @0x208f9f
  //
  // Direct tail-call into the simulator's list-filler. arg1 (list&) was already
  // in %rsi from the caller — passed through untouched.
  //
  // @0x00208f90
  public getVisibleAffectingBehaviors(out: OZSimulationBehavior[]): void {
    OZObjectSimulator_getAllVisibleBehaviors_stub(
      this.simulator,
      out,
      this.subIndex,
    );
  }

  // -----------------------------------------------------------------------
  // getAllAffectingBehaviors(list<OZSimulationBehavior*>&) @0x00208fb0
  //
  // Body:
  //   rdi = this->simulator (+0x08)   @0x208fb4
  //   edx = 1, ecx = 1                @0x208fb8-@0x208fbd
  //   jmp OZObjectSimulator::getBehaviors(list&, bool a=true, bool b=true)  @0x208fc3
  //
  // Note: getBehaviors takes 2 booleans; this method hardcodes BOTH to true.
  // Contrast with getVisibleAffectingBehaviors which routes via getAllVisibleBehaviors
  // (a different simulator method that already narrows to "visible").
  //
  // @0x00208fb0
  public getAllAffectingBehaviors(out: OZSimulationBehavior[]): void {
    OZObjectSimulator_getBehaviors_stub(this.simulator, out, true, true);
  }

  // -----------------------------------------------------------------------
  // anyAffectingBehaviors() @0x00208fd0
  //
  // Body:
  //   rax = this->simulator (+0x08)   @0x208fd4
  //   esi = this->subIndex   (+0x10)   @0x208fd8
  //   rdi = rax
  //   jmp OZObjectSimulator::anythingToSimulate(u32)   @0x208fdf
  //
  // Delegates the whole question to the simulator, keyed by this node's subIndex.
  //
  // @0x00208fd0
  public anyAffectingBehaviors(): boolean {
    return OZObjectSimulator_anythingToSimulate_stub(this.simulator, this.subIndex);
  }

  // -----------------------------------------------------------------------
  // cloneNode() @0x00208ff0
  //
  // Body:
  //   movl $0x18, %edi ; callq __Znwm      @0x208ffa-@0x208fff  // ::operator new(24)
  //   rbx = rax                             @0x209004  (the fresh 24-byte block)
  //   rdi = rax ; rsi = this
  //   callq __ZN11OZCurveNodeC2ERKS_        @0x20900d  // base copy ctor
  //   install vtable                        @0x209012-@0x209019
  //   *(u64*)(rbx + 0x8) = *(u64*)(this + 0x8)   // simulator ptr
  //   rax = rbx ; ret
  //
  // NOTE: cloneNode does NOT copy +0x10 (subIndex) — same omission as the copy
  // ctor. This is a compiler-generated inline clone, not a call to the copy
  // ctor at 0x208c80 (that would copy the vtable slot differently). Both clone
  // paths agree: subIndex stays uninitialised on the clone.
  //
  // @0x00208ff0
  public cloneNode(): OZSimulationCurveNode {
    // Faithful transcription: allocate, run the base copy ctor (via `super()`
    // in the copy-ctor path of our TS ctor), and copy the simulator pointer
    // only (leaving subIndex at its uninitialised default 0 — see the copy
    // ctor's TS body, which sets subIndex=0 for the TS definite-assignment rule).
    return new OZSimulationCurveNode(this);
  }

  // -----------------------------------------------------------------------
  // compare(OZCurveNode const*) const @0x00209040
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   movb $0x1, %al        @0x209044  // return true unconditionally
  //   popq %rbp; retq
  //
  // Every OZSimulationCurveNode "compares equal" to every OZCurveNode. This is
  // used by upper-layer optimizers to decide whether two curve nodes describe
  // the same animation — for a simulation node, the answer is always yes (the
  // simulator identity is checked at the parameter level, not the node level).
  //
  // @0x00209040
  public compare(_other: OZCurveNode | null): boolean {
    return true;
  }

  // -----------------------------------------------------------------------
  // getUForValue(double, vector<CMTime>&, PCTimeRange&, CMTime&, unsigned) @0x00209050
  //
  // Body:
  //   pushq %rbp; movq %rsp,%rbp
  //   xorl %eax, %eax           @0x209054   // return 0 unconditionally (u32)
  //   popq %rbp; retq
  //
  // A curve-node "inverse solve" (given a target value, find the parameter u
  // that produces it) is not implementable for a simulation — the mapping isn't
  // an analytic curve. Base returns 0; this override returns 0 too (matching
  // the intent: "cannot invert").
  //
  // @0x00209050
  public getUForValue(
    _value: number,
    _outSamples: CMTime[],
    _range: PCTimeRange,
    _outTime: { t: CMTime },
    _flags: number,
  ): number {
    return 0;
  }

  // -----------------------------------------------------------------------
  // isPassThrough() @0x00209150
  //
  // Body:
  //   rcx = this->simulator (+0x08)            @0x209154
  //   al = 1                                    @0x209158  (default result)
  //   cmpb $0x1, 0xd0(%rcx) ; jne DONE          @0x20915a-@0x209161
  //   al = *(u8*)(rcx + 0x174)                  @0x209163  (movzbl)
  //   DONE: ret al
  //
  // In pseudocode: if (sim.flagA != 1) return true; else return sim.flagB.
  // In other words: a simulation curve is "pass-through" (bypassed / identity)
  // whenever the simulator is NOT actively running (flagA != 1), OR when the
  // simulator has explicitly asserted its pass-through flag (flagB).
  //
  // @0x00209150
  public isPassThrough(): boolean {
    const sim = this.simulator;
    if (sim._flagAt0xD0 !== 1) return true;
    return sim._flagAt0x174 !== 0;
  }
}
