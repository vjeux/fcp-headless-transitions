// raw-port/src/nodes/OZBehaviorCurveNode.ts
//
// FCP `OZBehaviorCurveNode` — a concrete OZCurveNode subclass that lives on
// an OZChannelBehavior chain. Wraps an OZBehavior* + OZChannel* pair and
// delegates curve semantics to two per-sample memcpy passes:
//
//   getNeededRange(&param) - declares "the input range I need is the OUTPUT
//                            range the caller is asking for" (pass-through:
//                            aliases the caller's output buffer as my input
//                            buffer, non-owning).
//   solveNode(&param)      - copies count-doubles from `buf_a` to `buf_b`.
//                            After getNeededRange this is a self-copy (buf_a
//                            IS buf_b), but the compiler emits the loop
//                            faithfully because the aliasing is not visible
//                            to it — see the analysis note below.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZBehaviorCurveNode.*.s
// (all mangled symbols under __ZN19OZBehaviorCurveNode*).
//
// SYMBOLS ported here (every non-inlined non-thunk member function):
//   0x0020b7d0  __ZN19OZBehaviorCurveNodeC2EP10OZBehaviorP9OZChannel     [C2 = C1]
//   0x0020b810  __ZN19OZBehaviorCurveNodeC1EP10OZBehaviorP9OZChannel     [C1 body — see below]
//   0x0020b850  __ZN19OZBehaviorCurveNodeC2ERKS_                         [C2 copy = C1 copy]
//   0x0020b880  __ZN19OZBehaviorCurveNodeC1ERKS_                         [C1 copy body]
//   0x0020b8b0  __ZN19OZBehaviorCurveNodeD2Ev                            [D2 — tail-jmp base D2]
//   0x0020b8c0  __ZN19OZBehaviorCurveNodeD1Ev                            [D1 — tail-jmp base D2]
//   0x0020b8d0  __ZN19OZBehaviorCurveNodeD0Ev                            [D0 — deleting dtor]
//   0x0020b8f0  __ZN19OZBehaviorCurveNode9solveNodeER16OZCurveNodeParam
//   0x0020b9e0  __ZN19OZBehaviorCurveNode14getNeededRangeEP16OZCurveNodeParam
//   0x0020ba30  __ZN19OZBehaviorCurveNode9cloneNodeEv
//   0x0020ba80  __ZNK19OZBehaviorCurveNode7compareEPK11OZCurveNode           [returns 0]
//   0x0020ba90  __ZN19OZBehaviorCurveNode9solveNodeERK6CMTimedd              [private overload]
//   0x0020baa0  __ZN19OZBehaviorCurveNode12getUForValueEdRNSt3__16vector...  [returns 0]
//
// VTABLE (installed pointer = 0x846898 — i.e. `__ZTV19OZBehaviorCurveNode + 0x10`,
// verified via `raw-port/army/tools/resolve.py Ozone sym 0x846898` →
// `vtable for OZBehaviorCurveNode (+0x10)`, and `resolve.py Ozone sym 0x846888` →
// `vtable for OZBehaviorCurveNode (+0x0)`). Three ctors read this address:
//   - C1        @0x20b828 `leaq 0x63b069(%rip),%rax` ; 0x20b82f + 0x63b069 = 0x846898
//   - C1(copy)  @0x20b892 `leaq 0x63afff(%rip),%rax` ; 0x20b899 + 0x63afff = 0x846898
//   - cloneNode @0x20ba52 `leaq 0x63ae3f(%rip),%rax` ; 0x20ba59 + 0x63ae3f = 0x846898
// All three read the same address; JS prototype chain models the install via
// `extends OZCurveNode`. The exposed constant below cites the address so
// reviewers see the vtable pin explicitly.
//
// LAYOUT (recovered from ctor stores + cloneNode's operator new size):
//   +0x00   8   vtable*    (installed = 0x846898)          — @0x20b82f
//   +0x08   8   OZBehavior* behavior                       — @0x20b832 (movq %r14,0x8(%r15))
//   +0x10   8   OZChannel*  channel                        — @0x20b836 (movq %rbx,0x10(%r15))
//   +0x18   8   trailing pad; sizeof per operator new(0x20) @0x20ba3a is 0x20 bytes.
//   sizeof(OZBehaviorCurveNode) = 0x20 bytes.
//
// COPY-CTOR SEMANTIC NOTE:
//   OZBehaviorCurveNode::OZBehaviorCurveNode(const OZBehaviorCurveNode& src) @0x20b880
//   only copies +0x8 (behavior*). It DOES NOT copy +0x10 (channel*), which is
//   left as whatever `OZCurveNode(const OZCurveNode&)` left it (the base copy
//   ctor is itself vptr-only). In C++ that means the new object's `channel`
//   field is uninitialized memory. In JS/TS we materialize it as `null` — the
//   only defensible "uninitialized pointer" mapping. Callers of cloneNode
//   must re-wire the channel* before use; solveNode/getNeededRange do not
//   read this->channel so a null is behaviorally harmless for those two.
//
// -----------------------------------------------------------------------------
//   solveNode(OZCurveNodeParam&) @0x20b8f0  — GUARDED MEMCPY OF N DOUBLES
// -----------------------------------------------------------------------------
// The disasm implements `if (n != 0) memcpy(dst, src, n * sizeof(double))`,
// where:
//   n   = *(u32*)(&param + 0x90)      = param.count_b
//   dst = *(f64**)(&param + 0x98)     = param.buf_b
//   src = *(f64**)(&param + 0x50)     = param.buf_a
// with a size-and-alias-aware fast path:
//   fast path (SIMD 4-at-a-time via 2×movups) fires iff:
//     (a) n >= 6                        (@0x20b90e cmpl $6,%eax; setb %sil)
//     (b) |dst - src| >= 0x20 bytes     (@0x20b91b cmpq $0x20,%rdi; setb %dil)
//   scalar fallback (movsd loop) handles small n and overlapping ranges.
//
// The four-at-a-time inner loop (@0x20b940..0x20b95d) copies 32 bytes per
// iteration until it's completed floor(n/4) groups. Two tails follow:
// (a) an unroll-by-1 tail @0x20b980..0x20b990 for `n%4` residual doubles
// after the SIMD block, and (b) an unroll-by-4 tail @0x20b9a0..0x20b9d5 that
// is entered when the fast path was skipped for alignment reasons but n
// was still >= 4. In all paths the observable effect is exactly:
//     for (i = 0; i < n; i++) dst[i] = src[i];
// with no other side effect. The port implements the single monotone loop.
//
// After `getNeededRange` runs, buf_a and buf_b alias the same array, so
// this loop degenerates to a self-copy. The asm always executes it — the
// compiler doesn't know about the aliasing — and so do we.
//
// -----------------------------------------------------------------------------
//   getNeededRange(OZCurveNodeParam*) @0x20b9e0  — INPUT-RANGE = OUTPUT-RANGE
// -----------------------------------------------------------------------------
// In-place edit of the caller's param:
//   param.t0 = param.t2   (t2 lives at +0x60..+0x77; t0 at +0x18..+0x2f;
//                          copied as one movq 0x70→0x28 for .epoch and one
//                          movups 0x60→0x18 for value+timescale)
//   param.t1 = param.t3   (t3 at +0x78..+0x8f; t1 at +0x30..+0x47; copied
//                          as movups 0x78→0x30 and movq 0x88→0x40)
//   param.count_a = param.count_b       (@0x20ba0a movl 0x90; movl to 0x48)
//   param.owns_a  = 0                   (@0x20ba13 movb $0 to 0x58)
//   param.buf_a   = param.buf_b         (@0x20ba17 movq 0x98; movq to 0x50)
//
// Semantic: this node needs, as INPUT, the same time-range and buffer that
// the caller wants as OUTPUT. It aliases the caller's output buffer as its
// input buffer (non-owning: owns_a=0) so the eventual solveNode is a
// (harmless) self-copy. No arithmetic; a pure parameter re-shuffle.
//
// -----------------------------------------------------------------------------
//   cloneNode() @0x20ba30
// -----------------------------------------------------------------------------
// Allocates 0x20 bytes via `operator new(0x20)`, runs the OZCurveNode copy
// ctor (vptr-only), installs the derived vptr, and copies `behavior` (+0x8)
// verbatim. Does NOT copy `channel` (+0x10) — see COPY-CTOR SEMANTIC NOTE
// above. The port materializes a fresh JS instance with the same `behavior`
// and `channel = null`.
//
// -----------------------------------------------------------------------------
//   compare(OZCurveNode const*) @0x20ba80  — returns 0 (int)
// -----------------------------------------------------------------------------
// Body @0x20ba80..@0x20ba87 is literally `xorl %eax,%eax; ret`. Overrides
// the base's compare slot (base doesn't emit compare in the landed port —
// it's a new virtual introduced by this subclass family) with a "always
// equal" verdict. The behavior curve node has no comparable intrinsic state.
//
// -----------------------------------------------------------------------------
//   getUForValue(double, std::vector<CMTime>&, PCTimeRange&, CMTime&, uint32_t)
//     @0x20baa0  — returns 0 (uint32_t)
// -----------------------------------------------------------------------------
// Also `xorl %eax,%eax; ret`. This is the "inverse solve" query — asked to
// find a curve parameter U for a given output value; the identity/behavior
// node has no closed-form inverse and always reports 0. Callers must check.
//
// -----------------------------------------------------------------------------
//   Private overload solveNode(CMTime const&, double, double) @0x20ba90
// -----------------------------------------------------------------------------
// Body @0x20ba90..@0x20ba98:
//     pushq %rbp; movq %rsp,%rbp; movaps %xmm1,%xmm0; popq %rbp; retq
// which is `return defaultValue` — IDENTICAL to the base OZCurveNode's own
// `solveNode(CMTime,double,double)` body (@ProChannel 0x29c7e also
// `movaps %xmm1,%xmm0`). The compiler emitted a separate override because
// the class explicitly redeclares this signature (likely to keep both
// signatures in the vtable for the ABI). Present-and-identical bodies are
// exposed here for citation completeness.

import { OZCurveNode } from "./OZCurveNode";
import type { CMTime } from "../infra/CMTime";
import type { OZCurveNodeParam } from "./OZCurveNodeParam";

/**
 * `OZBehavior` — opaque forward-declared pointer type. `OZBehaviorCurveNode`
 * only stores it verbatim; no fields of OZBehavior are read from these six
 * methods. Landing OZBehavior belongs to a separate class port.
 */
export interface OZBehavior {
  readonly __ozBehaviorBrand: unique symbol;
}

/**
 * `OZChannel` — opaque forward-declared pointer type. Only stored, never
 * dereferenced by any method on this class.
 */
export interface OZChannel {
  readonly __ozChannelBrand: unique symbol;
}

/**
 * `OZBehaviorCurveNode::vtable` installed-pointer address in the Ozone
 * framework. Read verbatim by C1, C1(copy), and cloneNode (three separate
 * RIP-relative `leaq` sites — see the file header). Exposed so tests /
 * disassembly cross-checks can cite it without hunting.
 * @0x846898 (== `__ZTV19OZBehaviorCurveNode + 0x10`)
 */
export const OZBehaviorCurveNode_VTABLE_INSTALLED_PTR = 0x846898 as const; // @0x20b82f

/**
 * `OZBehaviorCurveNode` — pass-through curve node bound to an OZBehavior on
 * an OZChannel. Faithful port of the FCP class (Ozone framework).
 *
 * The class exposes the two pointer fields (behavior, channel) as public
 * mutable properties because C++'s copy-ctor (@Ozone 0x20b880) and
 * cloneNode (@Ozone 0x20ba30) leave `channel` uninitialized on the copy —
 * a caller must be able to re-wire it after cloning. See COPY-CTOR
 * SEMANTIC NOTE in the file header.
 *
 * @see raw-port/re/disasm/OZBehaviorCurveNode.*.s
 */
export class OZBehaviorCurveNode extends OZCurveNode {
  /** @Ozone +0x08 — the OZBehavior* passed to the ctor (verbatim). */
  behavior: OZBehavior | null;

  /** @Ozone +0x10 — the OZChannel* passed to the ctor. NOT copied by the
   *  copy ctor (@0x20b880); cloneNode returns a node with this = null. */
  channel: OZChannel | null;

  /**
   * `OZBehaviorCurveNode::OZBehaviorCurveNode(OZBehavior*, OZChannel*)`
   *   @Ozone 0x20b810 (C1) — C2 @0x20b7d0 has the identical body.
   *
   *   0x20b823  callq OZCurveNode::OZCurveNode()                      ; base default ctor
   *   0x20b828  leaq  0x63b069(%rip), %rax                            ; = 0x846898
   *   0x20b82f  movq  %rax, (%r15)                                    ; *this = vptr
   *   0x20b832  movq  %r14, 0x8(%r15)                                 ; +0x8  = behavior
   *   0x20b836  movq  %rbx, 0x10(%r15)                                ; +0x10 = channel
   *   0x20b843  retq
   */
  constructor(behavior: OZBehavior | null, channel: OZChannel | null) {
    // @0x20b823 callq __ZN11OZCurveNodeC2Ev — base default ctor.
    super();
    // @0x20b828..@0x20b82f — vtable install. Modeled by `extends OZCurveNode`.
    // (The concrete installed address is exposed as
    // OZBehaviorCurveNode_VTABLE_INSTALLED_PTR = 0x846898 above.)
    // @0x20b832 movq %r14, 0x8(this)
    this.behavior = behavior;
    // @0x20b836 movq %rbx, 0x10(this)
    this.channel = channel;
  }
}

/**
 * `OZBehaviorCurveNode::solveNode(OZCurveNodeParam&)` — @Ozone 0x20b8f0
 *
 * Free function per the codebase's convention for methods whose C++ mangled
 * name would collide with an inherited overload in TypeScript's method
 * signature space (see OZConstantNode_solveNode in raw-port/src/nodes/
 * OZConstantNode.ts for the identical convention).
 *
 * Faithful transcription of the guarded-memcpy body described in the file
 * header. Semantics:
 *
 *   const n   = param.count_b >>> 0;          // @0x20b8f0 movl 0x90(%rsi)
 *   if (n == 0) return;                       // @0x20b8f9 je 0x20b9d8
 *   const dst = param.buf_b;                  // @0x20b903 movq 0x98(%rsi)
 *   const src = param.buf_a;                  // @0x20b90a movq 0x50(%rsi)
 *   for (let i = 0; i < n; i++) dst[i] = src[i];
 *
 * The compiler's SIMD fast path (4-doubles-per-iter) is preserved
 * SEMANTICALLY by the simple loop — the observable effect on `dst` is
 * identical. We do NOT paraphrase the algorithm; we transcribe the
 * observable effect of every iteration of every branch of the control-
 * flow tree at @0x20b8f0..@0x20b9d8.
 *
 * ALIAS NOTE: after getNeededRange sets `param.buf_a = param.buf_b`, this
 * loop is a self-copy. That is exactly what the asm does. We do not
 * short-circuit; the port matches the machine's behavior.
 */
export function OZBehaviorCurveNode_solveNode(
  _self: OZBehaviorCurveNode,
  param: OZCurveNodeParam,
): void {
  // @0x20b8f0 movl 0x90(%rsi), %eax — read count_b as u32.
  const n = (param.count_b | 0) >>> 0;
  // @0x20b8f6..@0x20b8f9 testq/je — early-return on zero.
  if (n === 0) return;

  // @0x20b903 movq 0x98(%rsi), %rcx — dst = buf_b.
  // @0x20b90a movq 0x50(%rsi), %rdx — src = buf_a.
  // In the disasm buf_a/buf_b are raw f64* pointers into contiguous heap
  // arrays (`new T[]`); OZCurveNodeParam models them as `unknown[] | null`
  // (see raw-port/src/nodes/OZCurveNodeParam.ts). We narrow to `number[]`
  // because the loop's element operation is `movsd` (8-byte double).
  const dst = param.buf_b as number[] | null;
  const src = param.buf_a as number[] | null;

  // The disasm does not null-check dst/src (n != 0 in a well-formed param
  // guarantees they were allocated). We assert loudly rather than silently
  // fall through — a null buffer with count != 0 is an upstream bug we
  // want to surface, not paper over.
  if (dst === null || src === null) {
    throw new Error(
      "OZBehaviorCurveNode.solveNode @Ozone 0x20b8f0: param.count_b=" +
        n +
        " but buf_a=" +
        (src === null ? "null" : "ok") +
        ", buf_b=" +
        (dst === null ? "null" : "ok") +
        " — the disasm reads these pointers unconditionally when n != 0.",
    );
  }

  // @0x20b8f0..@0x20b9d8 — the guarded memcpy of n doubles from src to dst.
  // Fast path (@0x20b940..@0x20b95d), scalar tail (@0x20b980..@0x20b990),
  // and unroll-by-4 tail (@0x20b9a0..@0x20b9d5) all reduce to this loop.
  for (let i = 0; i < n; i++) {
    // @0x20b980/@0x20b9a0/etc.: `movsd (%rdx,%rdi,8),%xmm0 ; movsd %xmm0,(%rcx,%rdi,8)`
    dst[i] = src[i];
  }
}

/**
 * `OZBehaviorCurveNode::getNeededRange(OZCurveNodeParam*)` — @Ozone 0x20b9e0
 *
 * Sets the "input needed" fields of `param` equal to the "output requested"
 * fields (t0 <- t2, t1 <- t3, count_a <- count_b, buf_a <- buf_b, owns_a <- 0).
 *
 *   0x20b9e7  movq  0x70(%rsi), %rcx   ; rcx = param.t2.epoch
 *   0x20b9eb  movq  %rcx, 0x28(%rsi)   ; param.t0.epoch = rcx
 *   0x20b9ef  movups 0x60(%rsi),%xmm0  ; xmm0 = param.t2.value+timescale (16B)
 *   0x20b9f3  movups %xmm0, 0x18(%rsi) ; param.t0.value+timescale = xmm0
 *   0x20b9f7  movups 0x78(%rsi),%xmm0  ; xmm0 = param.t3.value+timescale (16B)
 *   0x20b9fb  movups %xmm0, 0x30(%rsi) ; param.t1.value+timescale = xmm0
 *   0x20b9ff  movq  0x88(%rsi), %rcx   ; rcx = param.t3.epoch
 *   0x20ba06  movq  %rcx, 0x40(%rsi)   ; param.t1.epoch = rcx
 *   0x20ba0a  movl  0x90(%rsi), %ecx   ; ecx = param.count_b
 *   0x20ba10  movl  %ecx, 0x48(%rsi)   ; param.count_a = ecx
 *   0x20ba13  movb  $0x0, 0x58(%rsi)   ; param.owns_a = 0
 *   0x20ba17  movq  0x98(%rsi), %rcx   ; rcx = param.buf_b
 *   0x20ba1e  movq  %rcx, 0x50(%rsi)   ; param.buf_a = rcx  (ALIAS, non-owning)
 *   0x20ba23  retq
 */
export function OZBehaviorCurveNode_getNeededRange(
  _self: OZBehaviorCurveNode,
  param: OZCurveNodeParam,
): void {
  // @0x20b9e7..@0x20b9f3 t0 <- t2 (24 bytes via 16B movups + 8B movq).
  // In the JS model CMTime is a plain object; assigning param.t2 into
  // param.t0 shares the reference — which is CORRECT here: the asm does a
  // memcpy that produces two structurally-equal CMTime values. Since
  // CMTime is treated as an immutable value throughout the port (see
  // raw-port/src/infra/CMTime.ts kCMTimeZero and its readonly usage), a
  // shared reference is behaviorally identical to a deep copy.
  param.t0 = param.t2;
  // @0x20b9f7..@0x20ba06 t1 <- t3 (24 bytes).
  param.t1 = param.t3;
  // @0x20ba0a..@0x20ba10 count_a <- count_b (i32).
  param.count_a = param.count_b | 0;
  // @0x20ba13 owns_a <- 0 (u8).
  param.owns_a = 0;
  // @0x20ba17..@0x20ba1e buf_a <- buf_b (verbatim pointer aliasing;
  // non-owning per the just-written owns_a=0).
  param.buf_a = param.buf_b;
}

/**
 * `OZBehaviorCurveNode::cloneNode()` — @Ozone 0x20ba30
 *
 *   0x20ba3a  movl  $0x20, %edi           ; sizeof = 0x20
 *   0x20ba3f  callq __Znwm                ; d = operator new(0x20)
 *   0x20ba4d  callq OZCurveNode::OZCurveNode(const OZCurveNode&)
 *   0x20ba52  leaq  0x63ae3f(%rip), %rax  ; = 0x846898 (installed vptr)
 *   0x20ba59  movq  %rax, (%rbx)          ; install derived vptr
 *   0x20ba5c  movq  0x8(%r14), %rax       ; rax = this.behavior
 *   0x20ba60  movq  %rax, 0x8(%rbx)       ; d.behavior = this.behavior
 *   0x20ba64  movq  %rbx, %rax            ; return d
 *   0x20ba6b  retq
 *
 * CRITICAL: the clone's +0x10 (channel) is NOT written. In C++ it's
 * uninitialized memory; the port materializes it as `null`. Callers of
 * cloneNode that need a wired-up channel must set it manually on the
 * returned node.
 */
export function OZBehaviorCurveNode_cloneNode(
  self: OZBehaviorCurveNode,
): OZBehaviorCurveNode {
  // @0x20ba3a..@0x20ba60 — allocate + copy-ctor + install vptr + copy behavior.
  // JS models it as constructing a fresh OZBehaviorCurveNode with the same
  // behavior* and channel=null (uninitialized in C++, deliberately not
  // copied by the compiler-emitted copy ctor).
  return new OZBehaviorCurveNode(self.behavior, null);
}

/**
 * `OZBehaviorCurveNode::compare(OZCurveNode const*) const` — @Ozone 0x20ba80
 *
 *   0x20ba84  xorl  %eax, %eax
 *   0x20ba86  popq  %rbp
 *   0x20ba87  retq
 *
 * Trivial 0 return. Semantically: "always equal / no ordering" — the
 * behavior curve node has no comparable intrinsic state. Overrides the
 * base's compare slot (the base's default is also 0; the subclass emits a
 * separate body so its vtable slot points here rather than at the base).
 */
export function OZBehaviorCurveNode_compare(
  _self: OZBehaviorCurveNode,
  _other: OZCurveNode | null,
): number {
  // @0x20ba84 xorl %eax,%eax; ret — always 0.
  return 0;
}

/**
 * `OZBehaviorCurveNode::getUForValue(double, std::vector<CMTime>&,
 *     PCTimeRange&, CMTime&, uint32_t)` — @Ozone 0x20baa0
 *
 *   0x20baa4  xorl  %eax, %eax
 *   0x20baa6  popq  %rbp
 *   0x20baa7  retq
 *
 * Returns 0 (u32) unconditionally: the identity/behavior node has no
 * closed-form inverse. Callers must interpret 0 as "no U produces this
 * value". Signature preserved with opaque types; concrete Vector/CMTime/
 * PCTimeRange bindings belong to other class ports. Only `value` and the
 * fifth `uint32_t` arg are decoded — neither is read by the asm.
 */
export function OZBehaviorCurveNode_getUForValue(
  _self: OZBehaviorCurveNode,
  _value: number,
  _cmTimes: readonly CMTime[],
  _pcTimeRange: unknown,
  _outCMTime: { value: CMTime },
  _index: number,
): number {
  // @0x20baa4 xorl %eax,%eax; ret — always 0.
  return 0;
}

/**
 * `OZBehaviorCurveNode::solveNode(CMTime const&, double interp, double defaultValue)`
 *   @Ozone 0x20ba90 — private overload (see file header).
 *
 *   0x20ba94  movaps %xmm1, %xmm0
 *   0x20ba97  popq   %rbp
 *   0x20ba98  retq
 *
 * Returns `defaultValue` (xmm1 → xmm0). Byte-identical to the base
 * OZCurveNode::solveNode(CMTime,double,double) @ProChannel 0x29c7e which
 * also emits `movaps %xmm1, %xmm0`. Present in the binary as a redundant
 * override for the ABI (the subclass explicitly redeclares this signature).
 * Retained here for provenance completeness.
 */
export function OZBehaviorCurveNode_solveNode_CMTime(
  _self: OZBehaviorCurveNode,
  _t: CMTime,
  _interp: number,
  defaultValue: number,
): number {
  // @0x20ba94 movaps %xmm1, %xmm0 — return the 2nd double arg (defaultValue).
  return defaultValue;
}
