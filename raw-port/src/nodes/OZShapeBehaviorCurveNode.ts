// raw-port/src/nodes/OZShapeBehaviorCurveNode.ts
//
// FCP `OZShapeBehaviorCurveNode` — a concrete OZBehaviorCurveNode subclass
// bound to an OZShapeBehavior. Its solveNode(param) walks the OZCurveNodeParam
// output range, evaluating one sample per index by dispatching the private
// solveNode(CMTime,double,double) overload — which itself dynamic_casts the
// stored OZBehavior* down to OZShapeBehavior* and tail-jumps into that
// derived behavior's vtable slot at +0x288.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZShapeBehaviorCurveNode.*.s
// (all mangled symbols under __ZN24OZShapeBehaviorCurveNode*).
//
// SYMBOLS ported here (every non-inlined non-thunk member function):
//   0x0041d130  __ZN24OZShapeBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel   [C2]
//   0x0041d150  __ZN24OZShapeBehaviorCurveNodeC1EP10OZBehaviorP9OZChannel   [C1]
//   0x0041d170  __ZN24OZShapeBehaviorCurveNodeC2ERKS_                        [C2 copy]
//   0x0041d190  __ZN24OZShapeBehaviorCurveNodeC1ERKS_                        [C1 copy]
//   0x0041d1b0  __ZN24OZShapeBehaviorCurveNodeD2Ev                           [D2 — tail-jmp base D2]
//   0x0041d1c0  __ZN24OZShapeBehaviorCurveNodeD1Ev                           [D1 — tail-jmp base D2]
//   0x0041d1d0  __ZN24OZShapeBehaviorCurveNodeD0Ev                           [D0 — deleting]
//   0x0041d1f0  __ZN24OZShapeBehaviorCurveNode9solveNodeERK6CMTimedd
//   0x0041d250  __ZN24OZShapeBehaviorCurveNode9solveNodeER16OZCurveNodeParam
//   0x0041d330  __ZN24OZShapeBehaviorCurveNode9cloneNodeEv
//   0x0041d380  __ZNK24OZShapeBehaviorCurveNode7compareEPK11OZCurveNode      [returns 0]
//   0x0041d390  __ZN24OZShapeBehaviorCurveNode14getNeededRangeEP16OZCurveNodeParam
//
// VTABLE (installed pointer = 0x860a30, verified via
// `python3 raw-port/army/tools/resolve.py Ozone vtable OZShapeBehaviorCurveNode`
// which prints `__ZTV24OZShapeBehaviorCurveNode @0x860a20; installed ptr
// 0x860a30`). Three ctor sites read this address:
//   - C1        @0x41d15e `leaq 0x4438cb(%rip),%rax` ; 0x41d165 + 0x4438cb = 0x860a30
//   - C1(copy)  @0x41d19e `leaq 0x44388b(%rip),%rax` ; 0x41d1a5 + 0x44388b = 0x860a30
//   - C2(copy)  @0x41d17e `leaq 0x4438ab(%rip),%rax` ; 0x41d185 + 0x4438ab = 0x860a30
// (There is no cloneNode `leaq` for the vptr — cloneNode builds through
// this class's own C1(copy) which already installs the vtable, unlike
// OZBehaviorCurveNode::cloneNode which builds via the base copy ctor and
// then installs the vptr inline.)
//
// LAYOUT: OZShapeBehaviorCurveNode adds NO fields beyond
// OZBehaviorCurveNode (`sizeof` per cloneNode's `operator new(0x20)` at
// @0x41d33a is 0x20 bytes — the same 0x20 the base uses). The three ctors
// only write the vtable pointer at +0x00; the inherited +0x08 behavior*
// and +0x10 channel* fields are set by the base ctors called at @0x41d159
// / @0x41d179 / @0x41d199.
//
// FIVE OVERRIDDEN VIRTUAL SLOTS (in the subclass vtable @0x860a20 vs the
// base vtable @0x846888):
//   *0x00 -> 0x41d1c0  ~OZShapeBehaviorCurveNode  [D1]   (base *0x00 -> ~OZBehaviorCurveNode)
//   *0x08 -> 0x41d1d0  ~OZShapeBehaviorCurveNode  [D0]
//   *0x10 -> 0x41d1f0  solveNode(CMTime const&, double, double)
//                          (base *0x10 -> OZBehaviorCurveNode::solveNode_CMTime @0x20ba90
//                           which just `movaps %xmm1,%xmm0; ret` — returns defaultValue)
//   *0x18 -> 0x41d250  solveNode(OZCurveNodeParam&)
//                          (base *0x18 -> OZBehaviorCurveNode::solveNode(param) @0x20b8f0)
//   *0x50 -> 0x41d390  getNeededRange(OZCurveNodeParam*)
//                          (base *0x50 -> OZBehaviorCurveNode::getNeededRange @0x20b9e0)
//   *0x68 -> 0x41d330  cloneNode()
//                          (base *0x68 -> OZBehaviorCurveNode::cloneNode @0x20ba30)
//   *0x70 -> 0x41d380  compare(OZCurveNode const*) const
//                          (base *0x70 -> OZBehaviorCurveNode::compare @0x20ba80 also returns 0)
// All other vtable slots inherit from OZBehaviorCurveNode / OZCurveNode
// verbatim.

import {
  OZBehaviorCurveNode,
  type OZBehavior,
  type OZChannel,
} from "./OZBehaviorCurveNode";
import type { OZCurveNode } from "./OZCurveNode";
import type { OZCurveNodeParam } from "./OZCurveNodeParam";
import type { CMTime } from "../infra/CMTime";

/**
 * `OZShapeBehavior` — opaque forward-declared type. Referenced only by
 * name in `OZShapeBehaviorCurveNode::solveNode(CMTime,double,double)`
 * @0x41d1f0 where the stored OZBehavior* is dynamic_cast'd to
 * OZShapeBehavior*, then its vtable slot +0x288 is invoked. Landing
 * OZShapeBehavior belongs to a separate class port.
 * @Ozone class OZShapeBehavior (typeinfo referenced @0x41d216).
 */
export interface OZShapeBehavior {
  readonly __ozShapeBehaviorBrand: unique symbol;
}

/**
 * `OZShapeBehaviorCurveNode::vtable` installed-pointer address in the
 * Ozone framework. Read verbatim by C1, C1(copy), C2(copy) (three
 * separate RIP-relative `leaq` sites — see file header). Exposed as a
 * constant so reviewers can grep for the vtable pin explicitly.
 * @Ozone __ZTV24OZShapeBehaviorCurveNode + 0x10 @0x860a30 (vtable base 0x860a20)
 */
export const OZShapeBehaviorCurveNode_VTABLE_INSTALLED_PTR = 0x860a30 as const; // @0x41d165

/**
 * Frontier: `PC_CMTimeSaferAdd(CMTime*, CMTime, CMTime)` — the standard
 * saturating-add helper called from solveNode(param) @0x41d2f4 to
 * advance the running CMTime by the per-step delta. Not yet transcribed
 * as a callable helper in the current landed base.
 * @Ozone _PC_CMTimeSaferAdd (symbol stub @0x6dcf06; used @0x41d2f4).
 */
function PC_CMTimeSaferAdd(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "PC_CMTimeSaferAdd @Ozone _PC_CMTimeSaferAdd (symbol stub @0x6dcf06) " +
      "not yet transcribed (called from OZShapeBehaviorCurveNode::solveNode " +
      "@0x41d2f4)",
  );
}

/**
 * Frontier: `dynamic_cast<OZShapeBehavior*>(OZBehavior*)` — the RTTI
 * downcast used in solveNode(CMTime,double,double) @0x41d21f. Returns
 * the same pointer when the runtime type is OZShapeBehavior (or a
 * derived), else nullptr. Not modelled statically in the port because
 * OZBehavior and OZShapeBehavior are both opaque here; when they
 * become concrete classes the downcast will be a plain
 * `instanceof OZShapeBehavior ? behavior : null` mapping.
 * @Ozone ___dynamic_cast (symbol stub @0x6dfd0e; used @0x41d21f).
 */
function dynamic_cast_OZShapeBehavior(
  _behavior: OZBehavior,
): OZShapeBehavior | null {
  throw new Error(
    "dynamic_cast<OZShapeBehavior*>(OZBehavior*) @Ozone ___dynamic_cast " +
      "(symbol stub @0x6dfd0e) not yet transcribed (called from " +
      "OZShapeBehaviorCurveNode::solveNode(CMTime,double,double) @0x41d21f)",
  );
}

/**
 * Frontier: `OZShapeBehavior::vtable[0x288]` — the virtual method on
 * OZShapeBehavior tail-called by solveNode(CMTime,double,double)
 * @0x41d24a with args `(shape, channel, &t, defaultValue, unused)`
 * (Sys-V ABI: rdi=shape, rsi=channel, rdx=&t, xmm0=defaultValue,
 * xmm1=unused per xor). The slot number 0x288 = decimal 648; assuming
 * 8-byte function pointers this is slot index 0x288/8 = 81 in the
 * OZShapeBehavior vtable. The concrete method identity is only
 * resolvable once OZShapeBehavior's vtable is decoded via
 * `raw-port/army/tools/resolve.py Ozone vtable OZShapeBehavior` — the
 * base's vtable is not currently emitted by the landed port. Not
 * transcribed yet.
 * @Ozone OZShapeBehavior::vtable[0x288] (slot at +0x288; used @0x41d22b/@0x41d24a).
 */
function OZShapeBehavior_vtable_slot_0x288(
  _shape: OZShapeBehavior,
  _channel: OZChannel | null,
  _t: CMTime,
  _v0: number,
  _v1: number,
): number {
  throw new Error(
    "OZShapeBehavior::vtable[0x288] @Ozone (slot +0x288 in " +
      "__ZTV15OZShapeBehavior) not yet transcribed (dispatched from " +
      "OZShapeBehaviorCurveNode::solveNode(CMTime,double,double) tail-call " +
      "@0x41d24a)",
  );
}

/**
 * `OZShapeBehaviorCurveNode` — a shape-driven behavior curve node. Stores
 * the same (behavior, channel) pair as its OZBehaviorCurveNode base;
 * adds NO fields of its own. Its five overrides all live in
 * standalone functions below (in line with the codebase's convention
 * for solveNode/getNeededRange/cloneNode/compare/getUForValue on the
 * OZCurveNode family — see OZBehaviorCurveNode.ts).
 *
 * @Ozone class OZShapeBehaviorCurveNode : OZBehaviorCurveNode
 * @Ozone class OZShapeBehaviorCurveNode : OZBehaviorCurveNode
 *   (single inheritance; class body derived from OZBehaviorCurveNode
 *    which itself derives from OZCurveNode).
 */
export class OZShapeBehaviorCurveNode extends OZBehaviorCurveNode {
  /**
   * `OZShapeBehaviorCurveNode::OZShapeBehaviorCurveNode(OZBehavior*, OZChannel*)`
   *   @Ozone 0x41d150 (C1) — C2 @0x41d130 has the identical body.
   *
   *   0x41d156  movq  %rdi, %rbx
   *   0x41d159  callq __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel
   *   0x41d15e  leaq  0x4438cb(%rip), %rax          ; = 0x860a30
   *   0x41d165  movq  %rax, (%rbx)                  ; *this = subclass vptr
   *   0x41d16e  retq
   *
   * Chains straight into the base ctor with the same two arguments,
   * then overwrites the vptr the base installed with THIS class's
   * installed pointer (0x860a30 = OZShapeBehaviorCurveNode vtable +0x10).
   * No per-subclass fields to initialize.
   */
  constructor(behavior: OZBehavior | null, channel: OZChannel | null) {
    // @0x41d159 callq __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel
    // — base ctor sets +0x08 = behavior, +0x10 = channel, installs base vptr.
    super(behavior, channel);
    // @0x41d15e..@0x41d165 — overwrite vptr with THIS class's installed
    // pointer (see file header). Modeled by `extends OZBehaviorCurveNode`:
    // JS/TS's prototype chain places `OZShapeBehaviorCurveNode.prototype`
    // above the base prototype, so `instanceof` checks resolve to the
    // subclass — the semantic equivalent of the vtable overwrite. The
    // concrete installed address is exposed as
    // OZShapeBehaviorCurveNode_VTABLE_INSTALLED_PTR = 0x860a30 above.
  }
}

/**
 * `OZShapeBehaviorCurveNode::solveNode(CMTime const& t, double v0, double v1)` —
 *   @Ozone 0x41d1f0 (private overload)
 *
 * @Ozone 0x41d1f0..0x41d24b:
 *
 *   0x41d1fb  movsd  %xmm1, -0x20(%rbp)                    ; save v1
 *   0x41d200  movsd  %xmm0, -0x18(%rbp)                    ; save v0
 *   0x41d205  movq   %rsi, %rbx                            ; save &t
 *   0x41d208  movq   %rdi, %r14                            ; save this
 *   0x41d20b  movq   0x8(%rdi), %rdi                       ; arg0 = this.behavior
 *   0x41d20f  leaq   __ZTI10OZBehavior(%rip), %rsi         ; arg1 = typeinfo(OZBehavior)
 *   0x41d216  leaq   __ZTI15OZShapeBehavior(%rip), %rdx    ; arg2 = typeinfo(OZShapeBehavior)
 *   0x41d21d  xorl   %ecx, %ecx                            ; arg3 = 0 (hint)
 *   0x41d21f  callq  ___dynamic_cast                       ; shape = dynamic_cast<...>
 *   0x41d224  movq   0x10(%r14), %rsi                      ; arg1 = this.channel
 *   0x41d228  movq   (%rax), %rcx                          ; rcx = shape->vptr
 *   0x41d22b  movq   0x288(%rcx), %rcx                     ; rcx = shape->vptr[0x288]
 *   0x41d232  movq   %rax, %rdi                            ; arg0 = shape
 *   0x41d235  movq   %rbx, %rdx                            ; arg2 = &t
 *   0x41d238  movsd  -0x18(%rbp), %xmm0                    ; xmm0 = v0
 *   0x41d23d  movsd  -0x20(%rbp), %xmm1                    ; xmm1 = v1
 *   0x41d24a  jmpq   *%rcx                                 ; tail-jmp shape->slot[0x288]
 *
 * Semantics: downcast the stored generic OZBehavior to OZShapeBehavior
 * (RTTI-checked at runtime; the dynamic_cast returns nullptr if the
 * downcast fails — but the disasm does NOT null-check `%rax` before
 * dereferencing `(%rax)` at 0x41d228. That means the C++ contract of
 * this method REQUIRES `this.behavior` to actually be an OZShapeBehavior;
 * violation is undefined behavior. We surface a loud error if the
 * dynamic_cast returns null rather than replicate that UB).
 *
 * The tail-call target `shape->vtable[0x288]` is the derived class's
 * curve-evaluation method — its exact identity depends on the concrete
 * OZShapeBehavior subclass, so it is deferred as a frontier.
 */
export function OZShapeBehaviorCurveNode_solveNode_CMTime(
  self: OZShapeBehaviorCurveNode,
  t: CMTime,
  v0: number,
  v1: number,
): number {
  // @0x41d20b movq 0x8(%rdi),%rdi — arg0 = this.behavior.
  const behavior = self.behavior;
  if (behavior === null) {
    // The disasm does not guard against a null behavior — it feeds nullptr
    // straight into __dynamic_cast, which returns nullptr, and the next
    // instruction (`movq (%rax),%rcx`) then segfaults. We surface it here
    // rather than reproduce UB.
    throw new Error(
      "OZShapeBehaviorCurveNode.solveNode_CMTime @Ozone 0x41d1f0: " +
        "this.behavior is null — the disasm assumes a non-null OZBehavior " +
        "pointer and segfaults otherwise.",
    );
  }
  // @0x41d21f callq ___dynamic_cast(behavior, typeinfo(OZBehavior),
  //                                  typeinfo(OZShapeBehavior), 0)
  const shape = dynamic_cast_OZShapeBehavior(behavior);
  if (shape === null) {
    // Same UB gate: the asm segfaults if the cast fails.
    throw new Error(
      "OZShapeBehaviorCurveNode.solveNode_CMTime @Ozone 0x41d1f0: " +
        "this.behavior is not an OZShapeBehavior — dynamic_cast returned " +
        "null; the disasm dereferences the result unconditionally.",
    );
  }
  // @0x41d224 movq 0x10(%r14),%rsi — arg1 = this.channel.
  const channel = self.channel;
  // @0x41d22b/@0x41d24a — tail-call shape->vtable[0x288](shape, channel, &t, v0, v1).
  return OZShapeBehavior_vtable_slot_0x288(shape, channel, t, v0, v1);
}

/**
 * `OZShapeBehaviorCurveNode::solveNode(OZCurveNodeParam&)` — @Ozone 0x41d250
 *
 * The main body of this class: walks the OZCurveNodeParam's output
 * range at a fixed cadence, calling
 * `this->solveNode(currentT, 0.0, buf_a[i])` for each index and writing
 * the result to `buf_b[i]`, then advancing `currentT` by `param.t3`
 * (interpreted as a CMTime delta) via `PC_CMTimeSaferAdd`.
 *
 * @Ozone 0x41d250..0x41d328 disasm (key lines):
 *
 *   0x41d264  movq   0x98(%rsi), %r13         ; r13 = param.buf_b (dst)
 *   0x41d26b  movq   0x50(%rsi), %r15         ; r15 = param.buf_a (src / defaults)
 *   0x41d26f  movq   0x88(%rsi), %rax         ; rax = param.t3.epoch
 *   0x41d276  movq   %rax, -0x50(%rbp)        ; local deltaT.epoch    (rbp-0x50)
 *   0x41d27a  movups 0x78(%rsi), %xmm0        ; xmm0 = param.t3.{value,timescale} (16B)
 *   0x41d27e  movaps %xmm0, -0x60(%rbp)       ; local deltaT.{value,timescale} (rbp-0x60..0x51)
 *   0x41d282  movq   0x70(%rsi), %rax         ; rax = param.t2.epoch
 *   0x41d286  movq   %rax, -0x30(%rbp)        ; local currentT.epoch  (rbp-0x30)
 *   0x41d28a  movups 0x60(%rsi), %xmm0        ; xmm0 = param.t2.{value,timescale} (16B)
 *   0x41d28e  movaps %xmm0, -0x40(%rbp)       ; local currentT.{value,timescale} (rbp-0x40..0x31)
 *   0x41d292  cmpl   $0x0, 0x90(%rsi)         ; test param.count_b == 0
 *   0x41d299  je     0x41d317                 ;   -> epilogue (return)
 *
 * Loop @0x41d2b0..@0x41d315 (i = 0.. param.count_b):
 *
 *   0x41d2b0  movsd  (%r15,%r12,8), %xmm1     ; xmm1 = buf_a[i]              (== v1 arg)
 *   0x41d2b6  movq   (%r14), %rax             ; rax = this->vptr
 *   0x41d2b9  xorps  %xmm0, %xmm0             ; xmm0 = 0.0                    (== v0 arg)
 *   0x41d2bc  movq   %r14, %rdi               ; arg0 = this
 *   0x41d2bf  leaq   -0x40(%rbp), %rsi        ; arg1 = &currentT
 *   0x41d2c3  callq  *0x10(%rax)              ; this->vtable[0x10](this, &currentT, 0.0, buf_a[i])
 *                                             ;   -> OZShapeBehaviorCurveNode::solveNode_CMTime
 *   0x41d2c6  movsd  %xmm0, (%r13,%r12,8)     ; buf_b[i] = return value
 *   0x41d2cd..0x41d2ec  copy currentT and deltaT onto the stack for PC_CMTimeSaferAdd's
 *                      by-value CMTime args (rsp[0..15]=currentT.{val,ts}, rsp[16..23]=currentT.epoch,
 *                      rsp[24..39]=deltaT.{val,ts}, rsp[40..47]=deltaT.epoch)
 *   0x41d2f0  leaq   -0x78(%rbp), %rdi        ; arg0 = &out
 *   0x41d2f4  callq  _PC_CMTimeSaferAdd       ; out = PC_CMTimeSaferAdd(currentT, deltaT)
 *   0x41d2f9  movq   -0x68(%rbp), %rax        ; load out.epoch (rbp-0x68)
 *   0x41d2fd  movq   %rax, -0x30(%rbp)        ; currentT.epoch = out.epoch
 *   0x41d301  movups -0x78(%rbp), %xmm0       ; load out.{value,timescale}
 *   0x41d305  movaps %xmm0, -0x40(%rbp)       ; currentT.{value,timescale} = out.{val,ts}
 *   0x41d309  incq   %r12                     ; i++
 *   0x41d30c  movl   0x90(%rbx), %eax         ; reload count_b (fresh every iter)
 *   0x41d312  cmpq   %rax, %r12
 *   0x41d315  jb     0x41d2b0                 ; loop while (i < count_b)
 *
 * NOTE the "reload count_b every iteration" at @0x41d30c — the compiler
 * preserves the possibility that the virtual `solveNode(CMTime,...)`
 * body mutates `param.count_b`. We faithfully reload each iteration.
 *
 * NOTE the virtual dispatch `this->vtable[0x10]` at @0x41d2c3 —
 * OZShapeBehaviorCurveNode's vtable *0x10 IS this class's own
 * solveNode_CMTime @0x41d1f0 (see file header), so this is not a
 * recursion into the base's identity-return — it's the shape-behavior
 * downcast + vtable[0x288] path. Any caller that constructs a plain
 * OZShapeBehaviorCurveNode will see the shape-behavior path fire.
 * (A future subclass overriding solveNode_CMTime would be dispatched
 * through the same slot — the C++ code is polymorphic, and the JS
 * port matches that via prototype method resolution.)
 */
export function OZShapeBehaviorCurveNode_solveNode(
  self: OZShapeBehaviorCurveNode,
  param: OZCurveNodeParam,
): void {
  // @0x41d264 movq 0x98(%rsi),%r13 — dst = buf_b.
  const dst = param.buf_b as number[] | null;
  // @0x41d26b movq 0x50(%rsi),%r15 — src (default values fed into v1).
  const src = param.buf_a as number[] | null;

  // @0x41d26f..@0x41d27e — capture param.t3 as the constant deltaT
  // BEFORE the loop starts. (param.t3 is loaded ONCE up-front; the
  // per-iteration state that changes is currentT / rbp-0x40..rbp-0x2f.)
  const deltaT: CMTime = param.t3;

  // @0x41d282..@0x41d28e — capture param.t2 as the initial currentT.
  let currentT: CMTime = param.t2;

  // @0x41d292..@0x41d299 — early-return on empty count.
  // (Uses a fresh read via %rbx at @0x41d30c inside the loop, but this
  // first check hits %rsi.)
  const initialCount = (param.count_b | 0) >>> 0;
  if (initialCount === 0) return;

  // The disasm dereferences r13 and r15 unconditionally inside the loop
  // for count_b > 0 — we surface a loud null rather than replicate the
  // resulting segfault.
  if (dst === null || src === null) {
    throw new Error(
      "OZShapeBehaviorCurveNode.solveNode @Ozone 0x41d250: " +
        "param.count_b=" +
        initialCount +
        " but buf_a=" +
        (src === null ? "null" : "ok") +
        ", buf_b=" +
        (dst === null ? "null" : "ok") +
        " — the disasm dereferences these pointers unconditionally inside " +
        "the loop.",
    );
  }

  // Loop @0x41d2b0..@0x41d315.
  //
  // NOTE the count reload at @0x41d30c — the compiler assumes the
  // per-iteration callback can mutate param.count_b, so we mirror that
  // by re-reading (param.count_b | 0) on every iteration boundary.
  let i = 0;
  while (i < ((param.count_b | 0) >>> 0)) {
    // @0x41d2b0 movsd (%r15,%r12,8),%xmm1 — buf_a[i].
    const v1 = src[i];
    // @0x41d2b9 xorps %xmm0,%xmm0 — v0 = 0.0.
    // @0x41d2b6/@0x41d2bf/@0x41d2c3 vtable[0x10] on `this` — polymorphic
    // dispatch to OZShapeBehaviorCurveNode.solveNode_CMTime (this class
    // overrides *0x10 — see file header).
    const y = OZShapeBehaviorCurveNode_solveNode_CMTime(self, currentT, 0.0, v1);
    // @0x41d2c6 movsd %xmm0,(%r13,%r12,8) — buf_b[i] = y.
    dst[i] = y;
    // @0x41d2f4 currentT = PC_CMTimeSaferAdd(currentT, deltaT).
    currentT = PC_CMTimeSaferAdd(currentT, deltaT);
    // @0x41d309 incq %r12.
    i++;
    // @0x41d30c..@0x41d315 — re-check against a fresh count_b read.
    // (Modelled by the while-loop condition above.)
  }
}

/**
 * `OZShapeBehaviorCurveNode::cloneNode()` — @Ozone 0x41d330
 *
 *   0x41d33a  movl  $0x20, %edi                    ; sizeof = 0x20
 *   0x41d33f  callq __Znwm                         ; d = operator new(0x20)
 *   0x41d34a  movq  %r14, %rsi                     ; arg1 = this  (source)
 *   0x41d34d  callq __ZN19OZBehaviorCurveNodeC2ERKS_ ; base copy ctor
 *   0x41d352  leaq  0x4436d7(%rip), %rax           ; = 0x860a30
 *   0x41d359  movq  %rax, (%rbx)                   ; overwrite vptr with subclass
 *   0x41d363  retq
 *
 * The base copy ctor (`OZBehaviorCurveNode::OZBehaviorCurveNode(const&)` @0x20b880)
 * copies +0x08 (behavior) but LEAVES +0x10 (channel) uninitialized (see
 * OZBehaviorCurveNode.ts). We materialize channel as `null` — the
 * defensible mapping for uninitialized C++ memory.
 *
 * NOTE: OZShapeBehaviorCurveNode's cloneNode uses the BASE copy ctor
 * (@0x41d34d), NOT its own copy ctor (@0x41d190). The subclass copy ctor
 * exists in the binary but is not linked from cloneNode — the compiler
 * inlined the base+vptr-overwrite pattern. Semantically identical.
 */
export function OZShapeBehaviorCurveNode_cloneNode(
  self: OZShapeBehaviorCurveNode,
): OZShapeBehaviorCurveNode {
  // @0x41d33a operator new(0x20). @0x41d34d base copy ctor: copies
  // behavior, leaves channel uninitialized (materialize as null).
  // @0x41d352..@0x41d359 install subclass vptr.
  return new OZShapeBehaviorCurveNode(self.behavior, null);
}

/**
 * `OZShapeBehaviorCurveNode::compare(OZCurveNode const*) const` — @Ozone 0x41d380
 *
 *   0x41d380  pushq %rbp / movq %rsp,%rbp
 *   0x41d384  xorl  %eax, %eax
 *   0x41d386  popq  %rbp
 *   0x41d387  retq
 *
 * Trivial 0 return — same shape as the base's compare @0x20ba80. The
 * subclass emits a distinct body so its vtable slot points here rather
 * than inheriting the base's slot verbatim (ICF would have folded them
 * otherwise; the compiler apparently blocked ICF for RTTI/inheritance
 * consistency).
 */
export function OZShapeBehaviorCurveNode_compare(
  _self: OZShapeBehaviorCurveNode,
  _other: OZCurveNode | null,
): number {
  // @0x41d384 xorl %eax,%eax — always 0.
  return 0;
}

/**
 * `OZShapeBehaviorCurveNode::getNeededRange(OZCurveNodeParam*)` —
 *   @Ozone 0x41d390
 *
 *   0x41d397  movq  0x70(%rsi), %rcx       ; rcx = param.t2.epoch
 *   0x41d39b  movq  %rcx, 0x28(%rsi)       ; param.t0.epoch = rcx
 *   0x41d39f  movups 0x60(%rsi), %xmm0     ; xmm0 = param.t2.{value,timescale}
 *   0x41d3a3  movups %xmm0, 0x18(%rsi)     ; param.t0.{value,timescale} = xmm0
 *   0x41d3a7  movups 0x78(%rsi), %xmm0     ; xmm0 = param.t3.{value,timescale}
 *   0x41d3ab  movups %xmm0, 0x30(%rsi)     ; param.t1.{value,timescale} = xmm0
 *   0x41d3af  movq  0x88(%rsi), %rcx       ; rcx = param.t3.epoch
 *   0x41d3b6  movq  %rcx, 0x40(%rsi)       ; param.t1.epoch = rcx
 *   0x41d3ba  movl  0x90(%rsi), %ecx       ; ecx = param.count_b
 *   0x41d3c0  movl  %ecx, 0x48(%rsi)       ; param.count_a = ecx
 *   0x41d3c3  movb  $0x0, 0x58(%rsi)       ; param.owns_a = 0
 *   0x41d3c7  movq  0x98(%rsi), %rcx       ; rcx = param.buf_b
 *   0x41d3ce  movq  %rcx, 0x50(%rsi)       ; param.buf_a = rcx (ALIAS)
 *   0x41d3d3  retq
 *
 * Byte-for-byte identical to
 * `OZBehaviorCurveNode::getNeededRange(OZCurveNodeParam*)` at
 * @0x20b9e0 — the compiler emitted a distinct body so its vtable slot
 * points here rather than at the base (same ICF-suppression pattern
 * as compare above). Semantics: pass through the caller's requested
 * output range as the needed input range, aliasing buf_a onto buf_b
 * non-owning.
 */
export function OZShapeBehaviorCurveNode_getNeededRange(
  _self: OZShapeBehaviorCurveNode,
  param: OZCurveNodeParam,
): void {
  // @0x41d397..@0x41d3a3 — param.t0 <- param.t2 (24 B: 8B epoch + 16B value+timescale).
  param.t0 = param.t2;
  // @0x41d3a7..@0x41d3b6 — param.t1 <- param.t3 (24 B).
  param.t1 = param.t3;
  // @0x41d3ba..@0x41d3c0 — param.count_a <- param.count_b.
  param.count_a = param.count_b | 0;
  // @0x41d3c3 — param.owns_a <- 0.
  param.owns_a = 0;
  // @0x41d3c7..@0x41d3ce — param.buf_a <- param.buf_b (alias, non-owning).
  param.buf_a = param.buf_b;
}
