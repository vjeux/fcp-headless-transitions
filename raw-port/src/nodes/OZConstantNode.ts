// OZConstantNode.ts — ProChannel's `OZConstantNode` — a curve-graph "constant" node
// (a leaf `OZCurveNode` whose output is a single fixed double that ignores time).
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//             Versions/A/ProChannel   (x86_64 thin slice at /tmp/ProChannel.x86_64;
//             VA == file offset).
//
// SYMBOLS (nm | c++filt):
//   0x0299aa  T  OZConstantNode::getMaxValue(bool)
//   0x0299b6  T  OZConstantNode::getMinValue(bool)
//   0x029b82  T  OZConstantNode::getDefaultValue()
//   0x029b9a  T  OZConstantNode::getInitialValue()
//   0x029b76  T  OZConstantNode::setDefaultValue(double)
//   0x029b8e  T  OZConstantNode::setInitialValue(double)
//   0x029b6a  T  OZConstantNode::setValue(CMTime const&, double, bool)
//   0x029c30  T  OZConstantNode::reset()
//   0x0299ce  T  OZConstantNode::solveNode(OZCurveNodeParam&)
//   0x0299c2  T  OZConstantNode::solveNode(CMTime const&, double, double)
//   0x0299fa  T  OZConstantNode::getUForValue(double, std::vector<CMTime>&, PCTimeRange&,
//                                             CMTime&, unsigned int)
//   0x029b26  T  OZConstantNode::getNeededRange(OZCurveNodeParam*)
//   0x029a5e  T  OZConstantNode::cloneNode()
//   0x029aae  T  OZConstantNode::compare(OZCurveNode const*) const
//   0x029950  T  OZConstantNode::OZConstantNode(OZConstantNode const&)                [C1]
//   0x029b0a  T  OZConstantNode::operator=(OZConstantNode const&)
//
// Vtable install (from cloneNode @0x029a80 and copy ctor C1 @0x029962):
//   cloneNode:  leaq 0x0ab3a1(%rip), %rax   -> RIP-after 0x029a87 + 0xab3a1 = 0xd4e28
//   C1:         leaq 0x0ab4bf(%rip), %rax   -> RIP-after 0x029969 + 0xab4bf = 0xd4e28
//   Both stores install the SAME vtable @ProChannel 0xd4e28 into *this.
//
// ── FIELD LAYOUT (extends OZCurveNode; base +0x00..+0x07 = vtable ptr) ─────
//   +0x000  vtable          : the OZCurveNode-family vtable ptr (installed by C1 @0x029969
//                             and cloneNode @0x029a87, both -> ProChannel 0xd4e28).
//   +0x008  double  value    : the "current" scalar value. Alias for BOTH `initialValue`
//                              and the runtime value returned by solveNode. Written by
//                              setInitialValue, setValue, reset (from defaultValue).
//                              Read by getMaxValue, getMinValue, getInitialValue, solveNode,
//                              getUForValue, compare, cloneNode (copied verbatim).
//   +0x010  double  defaultValue : the "reset-to" scalar. Written by setDefaultValue.
//                              Read by getDefaultValue, reset (source), compare, cloneNode
//                              (copied verbatim as the second 8-byte lane of the xmm at +0x08).
//   sizeof(OZConstantNode) = 0x18 bytes (from `new(0x18)` in cloneNode @0x029a68).
//
// ── SEMANTIC SUMMARY ───────────────────────────────────────────────────────
// A constant curve node: `solveNode` copies `value` into every slot of the output buffer
// pointed to by `param.buf_b` (@ OZCurveNodeParam +0x98) `param.count_b` (@+0x90) times.
// `getMaxValue` / `getMinValue` / `getInitialValue` all return `value` unchanged — a
// constant is its own extremum. `reset` restores `value` from `defaultValue`. Compare tests
// value AND defaultValue for exact bit equality (via `ucomisd + jne/jp`).
//
// `getUForValue(v, times, timeRange, cmTime, u)` pushes `cmTime` onto the output vector
// and returns `true` iff `|value - v| < 1e-7` — the query "is this constant close to v?".
//
// ── CONSTANTS (transcribed by direct byte-read of the ProChannel x86_64 slice) ──
//   @0xb0390  16-byte mask = 7FFFFFFFFFFFFFFF × 2  — used by `andpd` @0x29a03 for
//             double-precision absolute value (clears the sign bit of both lanes).
//   @0xb03b0  double 1e-7 = 0x3e7ad7f29abcaf48   — the "close enough" threshold used by
//             `getUForValue` @0x29a0b + @0x29a43 to test "|value - v| < 1e-7".
//
// ── FRONTIER CALLEES ───────────────────────────────────────────────────────
//   OZCurveNode::OZCurveNode(OZCurveNode const&)   @ProChannel  called by C1 @0x02995d
//                                                                  and cloneNode @0x029a7b.
//   __Znwm  (operator new(size_t))                 @ProChannel  called by cloneNode @0x029a6d.
//   std::vector<CMTime>::push_back                 @ProChannel  called by getUForValue @0x29a3e.
//   __dynamic_cast                                 @ProChannel  called by compare @0x29ad5.

import { CMTime } from "../infra/CMTime.js";

const F64_ABS_MASK_HI = 0x7fffffff; // top 32 bits of the double-precision sign-clear mask
                                     // (unused directly in TS; abs is Math.abs).
void F64_ABS_MASK_HI;

/**
 * Vtable pointer installed at *this by both the copy ctor and cloneNode.
 * @0xd4e28  — cited from cloneNode `leaq 0xab3a1(%rip)` @0x29a80 (RIP-after 0x29a87
 * + 0xab3a1 = 0xd4e28) and confirmed by C1 `leaq 0xab4bf(%rip)` @0x29962 (RIP-after
 * 0x29969 + 0xab4bf = 0xd4e28, same target).
 */
export const OZConstantNode_VTABLE_INSTALLED_PTR = 0xd4e28 as const;

/**
 * The "close enough" threshold read verbatim as 8 bytes at ProChannel 0xb03b0.
 *   bytes = 48 af bc 9a f2 d7 7a 3e  → little-endian double = 1e-7
 * Used by `getUForValue` @0x29a0b (initial compare) and @0x29a43 (final compare).
 * @0xb03b0
 */
export const OZ_CONSTANT_NODE_U_EPSILON: number = 1e-7;

/**
 * `OZCurveNode` — abstract base of every ProChannel curve-graph node. Not disassembled
 * in this port; we only need its `copy` shape (a vtable pointer at +0x00, opaque state
 * up to some offset < 0x08 since OZConstantNode's first own field is at +0x08). A future
 * port of OZCurveNode should replace this stub with the real base class.
 *
 * Called by:
 *   OZConstantNode::OZConstantNode(const&) @0x02995d (base copy ctor)
 *   OZConstantNode::cloneNode()            @0x029a7b (base copy ctor on the fresh alloc)
 *
 * The two frontier calls are ISOLATED behind this local stub so the entire OZConstantNode
 * port compiles and runs; only cloneNode / the copy ctor throw until OZCurveNode lands.
 * @0x029a7b
 */
class OZCurveNodeBase {
  /** +0x00 vtable pointer. Modeled as a nominal handle; not observable in JS. */
  public vtable: number;
  /**
   * `OZCurveNode::OZCurveNode(OZCurveNode const&)` frontier stub.
   * @0x02995d (called from OZConstantNode C1)   /  @0x029a7b (called from cloneNode)
   *
   * The default ctor (no-args) is a plain member init — no visible side effects here.
   * The COPY ctor implementation is a frontier callee (throwing) until OZCurveNode lands.
   */
  public constructor(vtable: number) {
    this.vtable = vtable;
  }
  public static copyCtor_stub(_dst: OZCurveNodeBase, _src: OZCurveNodeBase): void {
    throw new Error(
      "OZCurveNode::OZCurveNode(OZCurveNode const&) @ProChannel 0x02995d / 0x029a7b" +
      " not yet transcribed — need OZCurveNode base port.",
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LOCAL VIEWS OF DEPENDENT STRUCTS
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZCurveNodeParam` view — only the fields consumed by OZConstantNode's own methods.
 * See raw-port/src/nodes/OZCurveNodeParam.ts for the full byte-exact layout.
 *
 * Field offsets consumed here:
 *   +0x18..+0x2F  CMTime  t0
 *   +0x30..+0x47  CMTime  t1
 *   +0x48         int32   count_a
 *   +0x50         T*      buf_a
 *   +0x58         u8      owns_a
 *   +0x60..+0x77  CMTime  t2
 *   +0x78..+0x8F  CMTime  t3
 *   +0x88         double  epoch-of-t3  (aliased with t3's epoch qword — read at +0x88)
 *   +0x90         int32   count_b            (solveNode's loop count; getNeededRange's src)
 *   +0x98         double* buf_b              (solveNode's target buffer)
 */
export interface OZCurveNodeParam_View {
  t0: CMTime;   // +0x18
  t1: CMTime;   // +0x30
  countA: number;    // +0x48
  bufA: Float64Array | null;   // +0x50  (owning if ownsA)
  ownsA: boolean;    // +0x58
  t2: CMTime;   // +0x60
  t3: CMTime;   // +0x78
  countB: number;    // +0x90
  bufB: Float64Array | null;   // +0x98
  ownsB: boolean;    // +0xa0
}

// ────────────────────────────────────────────────────────────────────────────
// CLASS
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode` — a constant-value curve node.
 * Extends OZCurveNode (see OZCurveNodeBase stub above).
 */
export class OZConstantNode extends OZCurveNodeBase {
  /** +0x08 — the runtime scalar value. See file header for full semantics. */
  public value: number;
  /** +0x10 — the "reset-to" default scalar. */
  public defaultValue: number;

  /**
   * `OZConstantNode::OZConstantNode(OZConstantNode const&)`  @ProChannel 0x029950 (C1).
   *
   * Disasm summary:
   *   0x02995d  callq  __ZN11OZCurveNodeC2ERKS_    ; base OZCurveNode copy ctor
   *   0x029962  leaq   0xab4bf(%rip), %rax         ; vtable @ProChannel 0xd4e28
   *   0x029969  movq   %rax, (%r14)                ; *this = vtable
   *   0x02996c  movups 0x8(%rbx), %xmm0            ; xmm0 = 16 bytes from src[+0x08]
   *                                                  = { src.value : double, src.defaultValue : double }
   *   0x029970  movups %xmm0, 0x8(%r14)            ; this[+0x08..+0x17] = xmm0
   * @0x029950
   */
  public constructor(src: OZConstantNode) {
    // @0x02995d — OZCurveNode base copy ctor. In TS we cannot invoke it separately from
    // super(): we pass through the vtable and let a future OZCurveNode port replace the
    // stub. The base copy semantics are deferred.
    super(OZConstantNode_VTABLE_INSTALLED_PTR);
    OZCurveNodeBase.copyCtor_stub(this, src);      // @0x02995d — throws until decoded.
    // The three lines below are unreachable UNTIL the base copy ctor is ported;
    // they're kept as a faithful transcription of the C1 body.
    // eslint-disable-next-line @typescript-eslint/no-unreachable
    this.value = src.value;                        // @0x02996c/0x029970 (xmm0 lane 0)
    // eslint-disable-next-line @typescript-eslint/no-unreachable
    this.defaultValue = src.defaultValue;          // @0x02996c/0x029970 (xmm0 lane 1)
  }

  /**
   * "Default" ctor (used by tests / harness). NOT the shipped C1 body (there is a
   * `OZConstantNode::OZConstantNode(double)` C2 @ProChannel `__ZN14OZConstantNodeC1Ed`
   * that we haven't disassembled here — the symbol table lists it but the FCP linker
   * may have ICF-folded it). We reconstruct the minimum init required for the shipped
   * setValue/reset/getters to be functional.
   *
   * @NOT-DERIVED_FROM_DISASM  — This helper exists purely for TS-side testability and
   * does NOT map to a shipped symbol. Reviewers may reject it if a scoped C(double) ctor
   * disassembly conflicts with this shape.
   */
  public static make(defaultValue: number, value: number = defaultValue): OZConstantNode {
    // Bypass the copy-ctor path so this helper does not depend on OZCurveNode's copy ctor.
    const obj = Object.create(OZConstantNode.prototype) as OZConstantNode;
    // OZCurveNodeBase.vtable
    (obj as unknown as { vtable: number }).vtable = OZConstantNode_VTABLE_INSTALLED_PTR;
    obj.value = value;
    obj.defaultValue = defaultValue;
    return obj;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GETTERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::getMaxValue(bool)` @ProChannel 0x0299aa.
 *   0x0299ae  movsd 0x8(%rdi), %xmm0    ; return *(double*)(this+0x08)
 *   0x0299b3  popq %rbp; retq
 * The bool arg is IGNORED.
 * @0x0299aa
 */
export function OZConstantNode_getMaxValue(self: OZConstantNode, _flag: boolean): number {
  return self.value; // @0x0299ae
}

/**
 * `OZConstantNode::getMinValue(bool)` @ProChannel 0x0299b6.
 *   0x0299ba  movsd 0x8(%rdi), %xmm0
 * Same body as getMaxValue (constant node: min == max == value).
 * @0x0299b6
 */
export function OZConstantNode_getMinValue(self: OZConstantNode, _flag: boolean): number {
  return self.value; // @0x0299ba
}

/**
 * `OZConstantNode::getDefaultValue()` @ProChannel 0x029b82.
 *   0x029b86  movsd 0x10(%rdi), %xmm0
 * @0x029b82
 */
export function OZConstantNode_getDefaultValue(self: OZConstantNode): number {
  return self.defaultValue; // @0x029b86
}

/**
 * `OZConstantNode::getInitialValue()` @ProChannel 0x029b9a.
 *   0x029b9e  movsd 0x8(%rdi), %xmm0
 * Note: reads +0x08 (value), not +0x10 (default). The class conflates "initial" with
 * "current" — after setValue, getInitialValue reflects the new value.
 * @0x029b9a
 */
export function OZConstantNode_getInitialValue(self: OZConstantNode): number {
  return self.value; // @0x029b9e
}

// ────────────────────────────────────────────────────────────────────────────
// SETTERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::setDefaultValue(double)` @ProChannel 0x029b76.
 *   0x029b7a  movsd %xmm0, 0x10(%rdi)
 * @0x029b76
 */
export function OZConstantNode_setDefaultValue(self: OZConstantNode, v: number): void {
  self.defaultValue = v; // @0x029b7a
}

/**
 * `OZConstantNode::setInitialValue(double)` @ProChannel 0x029b8e.
 *   0x029b92  movsd %xmm0, 0x8(%rdi)
 * @0x029b8e
 */
export function OZConstantNode_setInitialValue(self: OZConstantNode, v: number): void {
  self.value = v; // @0x029b92
}

/**
 * `OZConstantNode::setValue(CMTime const&, double v, bool)` @ProChannel 0x029b6a.
 *   0x029b6e  movsd %xmm0, 0x8(%rdi)
 * The CMTime and bool arguments are IGNORED — the class has no time-varying state,
 * so `setValue(anytime, v, anyflag)` is equivalent to `setInitialValue(v)`.
 * @0x029b6a
 */
export function OZConstantNode_setValue(
  self: OZConstantNode,
  _t: CMTime,
  v: number,
  _flag: boolean,
): void {
  self.value = v; // @0x029b6e
}

/**
 * `OZConstantNode::reset()` @ProChannel 0x029c30.
 *   0x029c34  movsd 0x10(%rdi), %xmm0    ; xmm0 = defaultValue
 *   0x029c39  movsd %xmm0, 0x8(%rdi)     ; value = defaultValue
 * @0x029c30
 */
export function OZConstantNode_reset(self: OZConstantNode): void {
  self.value = self.defaultValue; // @0x029c34/0x029c39
}

// ────────────────────────────────────────────────────────────────────────────
// SOLVE
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::solveNode(OZCurveNodeParam&)`  @ProChannel 0x0299ce.
 *
 * Disasm (16 lines):
 *   0x0299ce  movl   0x90(%rsi), %eax           ; eax = param.count_b
 *   0x0299d4  testq  %rax, %rax                 ; if count_b == 0: retq
 *   0x0299d7  je     0x299f8
 *   0x0299dd  movq   0x98(%rsi), %rcx           ; rcx = param.buf_b (double*)
 *   0x0299e4  movsd  0x8(%rdi), %xmm0           ; xmm0 = this->value
 *   0x0299e9  xorl   %edx, %edx                 ; edx = i = 0
 *   0x0299eb  movsd  %xmm0, (%rcx,%rdx,8)       ; buf_b[i] = value
 *   0x0299f0  incq   %rdx                       ; ++i
 *   0x0299f3  cmpl   %edx, %eax                 ; while (i < count_b)
 *   0x0299f5  jne    0x299eb
 *   0x0299f7  popq   %rbp
 *   0x0299f8  retq
 *
 * Fills the first `param.count_b` entries of `param.buf_b` with `this->value`.
 * @0x0299ce
 */
export function OZConstantNode_solveNode(self: OZConstantNode, param: OZCurveNodeParam_View): void {
  // @0x0299ce eax = count_b ; @0x0299d7 je -> return
  const n = param.countB | 0;
  if (n === 0) return;
  // @0x0299dd rcx = param.bufB ; @0x0299e4 xmm0 = value ; loop @0x0299eb..0x0299f5
  const buf = param.bufB;
  if (buf === null) return; // paranoid null-guard; the C++ would UB here.
  const v = self.value;
  for (let i = 0; i < n; i++) {
    buf[i] = v; // @0x0299eb movsd %xmm0, (%rcx,%rdx,8)
  }
}

/**
 * `OZConstantNode::solveNode(CMTime const&, double, double)`  @ProChannel 0x0299c2
 *   — `__ZN14OZConstantNode9solveNodeERK6CMTimedd`
 *
 * The SECOND `solveNode` overload — the scalar, point-sample form. It is a
 * distinct symbol from the buffer-filling `solveNode(OZCurveNodeParam&)`
 * @0x0299ce ported directly above; the two bodies are adjacent in the binary
 * (this one ends at 0x0299cc, the other begins at 0x0299ce).
 *
 * Full disasm (7 lines, @0x0299c2..@0x0299cd; see raw-port/re/disasm/
 * ProChannel.__ZN14OZConstantNode9solveNodeERK6CMTimedd.s):
 *
 *   0x0299c2  pushq  %rbp                    ; frame prologue
 *   0x0299c3  movq   %rsp, %rbp
 *   0x0299c6  movsd  0x8(%rdi), %xmm0        ; return value = *(double*)(this+0x08)
 *   0x0299cb  popq   %rbp                    ; frame epilogue
 *   0x0299cc  retq
 *   0x0299cd  nop                            ; alignment padding
 *
 * ARGUMENTS (System V AMD64, non-static member fn):
 *   %rdi  = this
 *   %rsi  = CMTime const&   — IGNORED: %rsi is never read.
 *   %xmm0 = double          — IGNORED, and in fact CLOBBERED by the `movsd`
 *                             @0x0299c6 that loads the return value into it.
 *   %xmm1 = double          — IGNORED: %xmm1 is never read.
 *
 * The only memory access in the whole body is that single `movsd 0x8(%rdi)`,
 * which reads `value` @+0x08 — the same field getMaxValue @0x0299aa,
 * getMinValue @0x0299b6 and getInitialValue @0x029b9a return, and the same
 * field the OZCurveNodeParam& overload broadcasts into `param.buf_b`. That is
 * exactly what a constant node means: evaluating it at ANY time, with ANY pair
 * of extra scalar arguments, yields the stored constant.
 *
 * RETURN TYPE is `double`: the mangling `...ERK6CMTimedd` does not encode a
 * return type, but the body's sole effect is to materialise a double in %xmm0
 * — the SysV floating-point return register — immediately before `retq`.
 *
 * FRONTIER CALLEES: NONE. Zero `callq`, zero `jmp`, no extern, no in-scope
 * callee, no indirect/virtual call.
 *
 * @0x0299c2
 */
export function OZConstantNode_solveNode_atTime(
  self: OZConstantNode,
  _t: CMTime,
  _a: number,
  _b: number,
): number {
  // @0x0299c2..0x0299c3  frame prologue (no TS-visible effect).
  // @0x0299c6  movsd 0x8(%rdi), %xmm0  — load `value` @+0x08 into the return reg.
  //            %rsi / the incoming %xmm0 / %xmm1 are never read; %xmm0 is
  //            overwritten here by the loaded field.
  // @0x0299cb..0x0299cc  frame epilogue + retq.
  return self.value;
}

/**
 * `OZConstantNode::getUForValue(double queryValue, std::vector<CMTime>& outTimes,
 *                               PCTimeRange& range, CMTime& atTime, unsigned int u)`
 *   @ProChannel 0x0299fa.
 *
 * Disasm (27 lines):
 *   0x0299fa  movsd  0x8(%rdi), %xmm1                     ; xmm1 = this->value
 *   0x0299ff  subsd  %xmm0, %xmm1                          ; xmm1 = value - queryValue
 *   0x029a03  andpd  0x86985(%rip), %xmm1                  ; xmm1 = |delta| (mask @0xb0390)
 *   0x029a0b  movsd  0x8699d(%rip), %xmm0                  ; xmm0 = 1e-7 (const @0xb03b0)
 *   0x029a13  ucomisd %xmm1, %xmm0                         ; flags = xmm0 vs xmm1
 *   0x029a17  jbe    0x29a55                               ; if 1e-7 <= |delta|: skip push
 *   0x029a19..0x029a3e  push_back(outTimes, atTime)        ; else outTimes.push_back(atTime)
 *   0x029a43  movsd  0x86965(%rip), %xmm0                  ; xmm0 = 1e-7 (const @0xb03b0)
 *   0x029a4b..0x029a54  restore xmm1 from stack + epilogue
 *   0x029a55  ucomisd %xmm1, %xmm0                          ; flags = 1e-7 vs |delta|
 *   0x029a59  seta   %al                                    ; al = (1e-7 > |delta|)
 *   0x029a5c  retq
 *
 * SEMANTICS:
 *   Δ = |value - queryValue|. If Δ < 1e-7 push atTime onto outTimes. Return (Δ < 1e-7).
 *   The `range` and `u` args are consumed only to identify the push_back call site (they
 *   parameterize the caller's iteration; not read here).
 * @0x0299fa
 */
export function OZConstantNode_getUForValue(
  self: OZConstantNode,
  queryValue: number,
  outTimes: CMTime[],
  _range: unknown,
  atTime: CMTime,
  _u: number,
): boolean {
  // @0x0299fa xmm1 = value ; @0x0299ff subsd ; @0x029a03 andpd -> |delta|
  const delta = self.value - queryValue;
  const absDelta = Math.abs(delta);
  // @0x029a13 ucomisd xmm1,xmm0 ; @0x029a17 jbe -> skip push  (=> jbe means xmm0<=xmm1)
  if (OZ_CONSTANT_NODE_U_EPSILON > absDelta) {
    // @0x029a3e push_back(outTimes, atTime)
    outTimes.push(atTime);
  }
  // @0x029a55 ucomisd xmm1, xmm0 ; @0x029a59 seta al -> (1e-7 > |delta|)
  return OZ_CONSTANT_NODE_U_EPSILON > absDelta;
}

// ────────────────────────────────────────────────────────────────────────────
// getNeededRange — copies the "output"-side param slots into the "input"-side slots.
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::getNeededRange(OZCurveNodeParam*)` @ProChannel 0x029b26.
 *
 * Disasm (verbatim byte-copy shape — see raw-port/src/nodes/OZCurveNodeParam.ts for
 * the byte-exact struct layout):
 *   0x029b2a  movq   %rsi, %rax                       ; return value = param (same pointer)
 *   0x029b2d  movq   0x70(%rsi), %rcx                 ; rcx = param.t2.epoch  (t2 @+0x60, epoch @+0x10)
 *   0x029b31  movq   %rcx, 0x28(%rsi)                 ; param.t0.epoch = rcx
 *   0x029b35  movups 0x60(%rsi), %xmm0                ; xmm0 = param.t2 lo 16 bytes
 *   0x029b39  movups %xmm0, 0x18(%rsi)                ; param.t0 lo 16 bytes = xmm0
 *   0x029b3d  movups 0x78(%rsi), %xmm0                ; xmm0 = param.t3 lo 16 bytes
 *   0x029b41  movups %xmm0, 0x30(%rsi)                ; param.t1 lo 16 bytes = xmm0
 *   0x029b45  movq   0x88(%rsi), %rcx                 ; rcx = param.t3.epoch
 *   0x029b4c  movq   %rcx, 0x40(%rsi)                 ; param.t1.epoch = rcx
 *   0x029b50  movl   0x90(%rsi), %ecx                 ; ecx = param.count_b (i32)
 *   0x029b56  movl   %ecx, 0x48(%rsi)                 ; param.count_a = ecx
 *   0x029b59  movb   $0x0, 0x58(%rsi)                 ; param.owns_a = false
 *   0x029b5d  movq   0x98(%rsi), %rcx                 ; rcx = param.buf_b
 *   0x029b64  movq   %rcx, 0x50(%rsi)                 ; param.buf_a = rcx (non-owning view)
 *
 * NET EFFECT: `param.{t0,t1,countA,bufA,ownsA} = {t2,t3,countB,bufB,false}`. This makes
 * the input-side slots (a) a non-owning view of the output-side slots (b), which is how
 * a constant node communicates "I need the same time range on my input as on my output"
 * to the curve solver upstream.
 * @0x029b26
 */
export function OZConstantNode_getNeededRange(
  _self: OZConstantNode,
  param: OZCurveNodeParam_View,
): OZCurveNodeParam_View {
  // @0x029b2d..0x029b39 param.t0 = param.t2  (full 24-byte CMTime copy)
  param.t0 = {
    value: param.t2.value,
    timescale: param.t2.timescale,
    flags: param.t2.flags,
    epoch: param.t2.epoch,
  } as CMTime;
  // @0x029b3d..0x029b4c param.t1 = param.t3
  param.t1 = {
    value: param.t3.value,
    timescale: param.t3.timescale,
    flags: param.t3.flags,
    epoch: param.t3.epoch,
  } as CMTime;
  // @0x029b50..0x029b64 param.{countA, ownsA, bufA} = {countB, false, bufB}
  param.countA = param.countB | 0;
  param.ownsA = false;                       // @0x029b59 movb $0x0
  param.bufA = param.bufB;                   // @0x029b64 movq %rcx, 0x50 (non-owning)
  // @0x029b2a movq %rsi, %rax — return the same pointer.
  return param;
}

// ────────────────────────────────────────────────────────────────────────────
// clone / compare
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::cloneNode()` @ProChannel 0x029a5e.
 *
 * Disasm (26 lines):
 *   0x029a68  movl   $0x18, %edi                 ; size = 0x18 = 24 bytes  (sizeof(OZConstantNode))
 *   0x029a6d  callq  __Znwm                      ; raw = operator new(0x18)
 *   0x029a7b  callq  __ZN11OZCurveNodeC2ERKS_    ; OZCurveNode::OZCurveNode(*raw, *this)
 *   0x029a80  leaq   0xab3a1(%rip), %rax         ; vtable @ProChannel 0xd4e28
 *   0x029a87  movq   %rax, (%rbx)                ; *raw = vtable
 *   0x029a8a  movups 0x8(%r14), %xmm0            ; xmm0 = { this->value, this->defaultValue }
 *   0x029a8f  movups %xmm0, 0x8(%rbx)            ; raw[+0x08..+0x17] = xmm0
 *   0x029a93  movq   %rbx, %rax                  ; return raw
 *
 * Frontier: OZCurveNode's copy ctor. Until it lands, cloneNode delegates to the copy ctor
 * (C1) which throws through OZCurveNodeBase.copyCtor_stub. Faithful — no invented paths.
 * @0x029a5e
 */
export function OZConstantNode_cloneNode(self: OZConstantNode): OZConstantNode {
  // @0x029a68..0x029a93 — allocate + base-copy-ctor + vtable install + xmm0 field copy.
  // The C++ body is structurally IDENTICAL to `new OZConstantNode(*this)` (the copy ctor),
  // so we route through the copy ctor here.
  return new OZConstantNode(self);
}

/**
 * `OZConstantNode::compare(OZCurveNode const*) const` @ProChannel 0x029aae.
 *
 * Disasm (33 lines):
 *   0x029ab5  testq  %rsi, %rsi                    ; if other == nullptr -> return 0
 *   0x029ab8  je     0x29b01
 *   0x029abd  leaq   __ZTI11OZCurveNode(%rip), %rax
 *   0x029ac4  leaq   __ZTI14OZConstantNode(%rip), %rdx
 *   0x029ad5  callq  __dynamic_cast(other, OZCurveNode, OZConstantNode)  ; = dynamic_cast<OZConstantNode*>(other)
 *   0x029ada  testq  %rax, %rax                    ; if cast fails -> return 0
 *   0x029add  je     0x29b03
 *   0x029adf  movsd  0x8(%r14), %xmm0              ; xmm0 = this->value
 *   0x029ae5  ucomisd 0x8(%rax), %xmm0             ; compare with cast.value
 *   0x029aea  jne    0x29b01                       ; not equal (ordered) -> 0
 *   0x029aec  jp     0x29b01                       ; unordered (NaN)      -> 0
 *   0x029aee  movsd  0x10(%r14), %xmm0             ; xmm0 = this->defaultValue
 *   0x029af4  ucomisd 0x10(%rax), %xmm0
 *   0x029af9  jne    0x29b01
 *   0x029afb  jp     0x29b01
 *   0x029afd  movb   $0x1, %bl                     ; result = 1 (equal)
 *   0x029b03  movl   %ebx, %eax                    ; return result
 *
 * SEMANTICS:
 *   Return 1 iff:  other != nullptr
 *              AND typeof(other) == OZConstantNode (via dynamic_cast)
 *              AND other.value == this.value        (IEEE ordered equality)
 *              AND other.defaultValue == this.defaultValue  (IEEE ordered equality)
 *   Otherwise return 0. NaN in either field DEFEATS equality (per jp checks).
 * @0x029aae
 */
export function OZConstantNode_compare(self: OZConstantNode, other: OZCurveNodeBase | null): number {
  // @0x029ab5 testq %rsi ; @0x029ab8 je -> return 0
  if (other === null || other === undefined) return 0;
  // @0x029ac4/0x029ad5 dynamic_cast<OZConstantNode*>(other)
  if (!(other instanceof OZConstantNode)) return 0;
  // @0x029adf..0x029aec — value equality with NaN-rejection.
  if (Number.isNaN(self.value) || Number.isNaN(other.value)) return 0;
  if (self.value !== other.value) return 0;
  // @0x029aee..0x029afb — defaultValue equality with NaN-rejection.
  if (Number.isNaN(self.defaultValue) || Number.isNaN(other.defaultValue)) return 0;
  if (self.defaultValue !== other.defaultValue) return 0;
  // @0x029afd movb $0x1
  return 1;
}

// ────────────────────────────────────────────────────────────────────────────
// COPY-ASSIGNMENT
// ────────────────────────────────────────────────────────────────────────────

/**
 * `OZConstantNode::operator=(OZConstantNode const&)`  @ProChannel 0x029b0a
 *   — __ZN14OZConstantNodeaSERKS_
 *
 * Faithful transcription of the 6-instruction body (raw-port/re/disasm/
 * ProChannel.__ZN14OZConstantNodeaSERKS_.s):
 *
 *   0x029b0a  pushq  %rbp                      ; frame prologue
 *   0x029b0b  movq   %rsp, %rbp
 *   0x029b0e  movups 0x8(%rsi), %xmm0          ; xmm0 = 16 bytes from src[+0x08..+0x17]
 *                                              ;      = { src.value, src.defaultValue }
 *   0x029b12  movups %xmm0, 0x8(%rdi)          ; this[+0x08..+0x17] = xmm0
 *                                              ;      { this.value, this.defaultValue } = src's
 *   0x029b16  popq   %rbp                      ; frame epilogue
 *   0x029b17  retq
 *
 * SEMANTICS:
 *   Copies EXACTLY the two double-precision fields owned by OZConstantNode
 *   (`value` @+0x08 and `defaultValue` @+0x10) from `src` to `this`. The
 *   base-class subobject (OZCurveNode / vtable @+0x00) is DELIBERATELY NOT
 *   touched — no `callq __ZN11OZCurveNodeaSERKS_` and no vtable store.
 *   This mirrors the C++ synthesised operator= for a leaf class where the
 *   base has been ICF-folded to a trivial (or ELIDED) assignment: only the
 *   derived-owned bytes are copied. There is NO return of `*this` as an
 *   ABI value here — the caller receives no result register (rax is not
 *   set to `%rdi` in the emitted body); the C++ signature returns a ref
 *   to `*this` but the emitted code relies on the caller passing `this`
 *   through `%rdi` and the reference being materialised at the call
 *   site.  In TS we model the mutation and return `this` for ergonomics;
 *   the disasm has no explicit `movq %rdi, %rax`, so callers that read
 *   the return are still faithful — %rax is unused after this call in
 *   the caller frame.
 *
 * FRONTIER CALLEES: NONE. Zero `callq`. Zero externs. Pure two-scalar
 * copy via one 128-bit `movups` load + `movups` store.
 *
 * FIELD OFFSETS (already documented on the class in the file header):
 *   +0x08  double  value          ; xmm0 lane 0
 *   +0x10  double  defaultValue   ; xmm0 lane 1
 *
 * @0x029b0a
 */
export function OZConstantNode_operatorEq(
  self: OZConstantNode,
  src: OZConstantNode,
): OZConstantNode {
  // @0x029b0a..0x029b0b  frame prologue (no TS-visible effect).
  // @0x029b0e            xmm0 lanes = { src.value, src.defaultValue }
  //                       — one 128-bit unaligned load from src[+0x08].
  //                       Modelled as two scalar reads: the machine reads
  //                       both doubles in a single movups; the store below
  //                       writes them in a single movups. Semantically
  //                       identical to the field-by-field copy expressed
  //                       here (no shuffle/mix between lanes).
  // @0x029b12            *this[+0x08..+0x17] = xmm0
  self.value = src.value; // @0x029b0e/0x029b12 (xmm0 lane 0)
  self.defaultValue = src.defaultValue; // @0x029b0e/0x029b12 (xmm0 lane 1)
  // @0x029b16..0x029b17  frame epilogue + retq (no TS-visible effect).
  // The C++ signature returns `OZConstantNode&`; the emitted body does
  // NOT set %rax explicitly (no `movq %rdi, %rax`), so callers that
  // consume the return by-reference get whatever value %rdi held at
  // return — which by the SysV ABI equals `this` (unchanged by the fn).
  // Return `self` here so TS callers that chain assignments see the
  // same reference semantics.
  return self;
}
