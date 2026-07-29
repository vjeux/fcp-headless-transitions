/**
 * OZDynamicSpline — ProChannel dynamic-spline vertex mutator.
 *
 * ProChannel.framework/Versions/A/ProChannel (x86_64 slice; VA==offset since __TEXT@0).
 *
 * Only method on the ledger for this class in the current wave:
 *   __ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime
 *     OZDynamicSpline::setVertexSmooth(void*, bool, CMTime const&)   @0x2c398
 *
 * The class itself has no data-layout footprint touched by this method (rdi=this
 * is not dereferenced — only the vertex arg is). Full layout will be added when a
 * ctor/dtor lands on the ledger.
 */

import type { CMTime } from "../infra/CMTime.js";

// ─────────────────────────────────────────────────────────────────────────────
// Frontier callees — virtual-dispatch on the vertex object (undecoded).
// Per PORTING_SPEC Rule 3 these are throwing stubs citing the @0xADDR that
// dispatches to them, so the gate can see the gap and no silent guess is
// introduced. Boundary-stub kind: VIRTUAL/vtable.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vertex vtable slot +0x48 — invoked by setVertexSmooth @0x2c3b8.
 * Signature at the callsite: `f(vertex*, CMTime const&, double=0, double=0)`
 * (rdi=vertex, rsi=CMTime&, xmm0=0.0, xmm1=0.0). Likely "set incoming
 * tangent to zero at time t" but we do not paraphrase — record the addr.
 *
 * extern boundary @0x2c3b8 (virtual dispatch through *(vertex))
 */
function vertex_vtable_0x48(
  _vertex: unknown, _cmt: CMTime, _a: number, _b: number,
): void {
  throw new Error(
    "OZDynamicSpline::setVertexSmooth: vertex vtable[0x48] virtual dispatch @ProChannel 0x2c3b8 not yet transcribed",
  );
}

/**
 * Vertex vtable slot +0x50 — invoked by setVertexSmooth @0x2c3ca.
 * Signature at the callsite: `f(vertex*, CMTime const&, double=0, double=0)`
 * (rdi=vertex, rsi=CMTime&, xmm0=0.0, xmm1=0.0). Likely "set outgoing
 * tangent to zero at time t" — same shape as +0x48.
 *
 * extern boundary @0x2c3ca (virtual dispatch through *(vertex))
 */
function vertex_vtable_0x50(
  _vertex: unknown, _cmt: CMTime, _a: number, _b: number,
): void {
  throw new Error(
    "OZDynamicSpline::setVertexSmooth: vertex vtable[0x50] virtual dispatch @ProChannel 0x2c3ca not yet transcribed",
  );
}

/**
 * OZDynamicSpline::setVertexSmooth(void* vertex, bool smooth, CMTime const& t)
 *   __ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime   @ProChannel 0x2c398
 *
 * If `smooth` is true, returns true immediately (a no-op — smoothing is a
 * higher-level property the ARG bakes in). If `smooth` is false, forces both
 * of the vertex's tangent-like fields at time `t` to zero via two virtual
 * dispatches on the vertex (vtable+0x48 then vtable+0x50). Always returns
 * true (the `movb $0x1, %al` at the join point below).
 *
 * Disassembly (raw-port/re/disasm/ProChannel.OZDynamicSpline.setVertexSmooth.s):
 *
 *   0x2c398  testl   %edx, %edx           ; edx = smooth (bool -> 32-bit)
 *   0x2c39a  jne     0x2c3d1              ; if smooth != 0 -> return true
 *   0x2c39c  pushq   %rbp                 ; enter frame  (falseFrom here)
 *   0x2c39d  movq    %rsp, %rbp
 *   0x2c3a0  pushq   %r14
 *   0x2c3a2  pushq   %rbx
 *   0x2c3a3  movq    %rcx, %rbx           ; rbx = &cmt   (saved for 2nd call)
 *   0x2c3a6  movq    %rsi, %r14           ; r14 = vertex (saved for 2nd call)
 *   0x2c3a9  movq    (%rsi), %rax         ; rax = vertex->vtable
 *   0x2c3ac  xorps   %xmm0, %xmm0         ; xmm0 = 0.0
 *   0x2c3af  xorps   %xmm1, %xmm1         ; xmm1 = 0.0
 *   0x2c3b2  movq    %rsi, %rdi           ; arg0 = vertex
 *   0x2c3b5  movq    %rcx, %rsi           ; arg1 = &cmt
 *   0x2c3b8  callq   *0x48(%rax)          ; vertex->vtable[0x48](vertex, &cmt, 0.0, 0.0)
 *   0x2c3bb  movq    (%r14), %rax         ; rax = vertex->vtable  (reload)
 *   0x2c3be  xorps   %xmm0, %xmm0         ; xmm0 = 0.0
 *   0x2c3c1  xorps   %xmm1, %xmm1         ; xmm1 = 0.0
 *   0x2c3c4  movq    %r14, %rdi           ; arg0 = vertex
 *   0x2c3c7  movq    %rbx, %rsi           ; arg1 = &cmt
 *   0x2c3ca  callq   *0x50(%rax)          ; vertex->vtable[0x50](vertex, &cmt, 0.0, 0.0)
 *   0x2c3cd  popq    %rbx
 *   0x2c3ce  popq    %r14
 *   0x2c3d0  popq    %rbp
 *   0x2c3d1  movb    $0x1, %al            ; JOIN: return value = true
 *   0x2c3d3  retq
 *
 * Note: rdi (this = OZDynamicSpline*) is NEVER dereferenced anywhere in this
 * body — the method only touches its `vertex` arg. So we do not model any
 * `this` fields for it in this port.
 */
export function OZDynamicSpline_setVertexSmooth(
  _this_: unknown,   // rdi — OZDynamicSpline*; UNUSED (never dereferenced)
  vertex: unknown,   // rsi — void* vertex (has a vtable at offset 0)
  smooth: boolean,   // edx — bool (nonzero => early return)
  t: CMTime,         // rcx — CMTime const&
): boolean {
  // @0x2c398..0x2c39a — early-exit on smooth==true.
  if (smooth) {
    // Falls straight through to the `movb $0x1, %al; retq` join.
    return true;
  }

  // @0x2c3a9..0x2c3b8 — first virtual dispatch on vertex.
  vertex_vtable_0x48(vertex, t, 0.0, 0.0);

  // @0x2c3bb..0x2c3ca — second virtual dispatch on vertex (reloads vtable
  // pointer between calls, matching the binary; the first call may have
  // mutated the vertex object).
  vertex_vtable_0x50(vertex, t, 0.0, 0.0);

  // @0x2c3d1 — always returns true.
  return true;
}
