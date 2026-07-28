// POTPaddingPolicy.ts — Helium HGTexturePaddingPolicy-family concrete class
// that rounds a rectangle's dimensions UP to the next power of two.
// "POT" = Power Of Two. Sibling to BorderPaddingPolicy (which shifts corners
// outward by a constant int) and DefaultPaddingPolicy (identity). The whole
// class carries no per-instance state — its ctors just install the vptr and
// return; its dtors just tail-chain into HGObject::~HGObject.
//
// Faithfully transcribed from Helium binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (x86_64 slice at file offset 0x4000 + text VA).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.POTPaddingPolicy.C2Ev.s                 @0x45040
//   raw-port/re/disasm/Helium.POTPaddingPolicy.C1Ev.s                 @0x45060
//   raw-port/re/disasm/Helium.POTPaddingPolicy.D2Ev.s                 @0x45080
//   raw-port/re/disasm/Helium.POTPaddingPolicy.D1Ev.s                 @0x45090
//   raw-port/re/disasm/Helium.POTPaddingPolicy.D0Ev.s                 @0x450a0
//   raw-port/re/disasm/Helium.POTPaddingPolicy.10adjustRectE6HGRect.s @0x450c0
//
// STRUCT LAYOUT (recovered from C1/C2 stores — no other writes anywhere):
//   +0x000  vptr    (installed by C1/C2 via rip-relative leaq: C2 @0x4504e
//                    loads 0x9c2723; C1 @0x4506e loads 0x9c2703 — both
//                    resolve to the same absolute __DATA_CONST vtable slot
//                    vtable-for-POTPaddingPolicy)
//   +0x008  ...     (HGObject base subobject tail — not touched here)
//
// No other instance state exists — adjustRect reads ONLY its %rsi/%rdx
// register arguments and never touches *(this + N). Compare BorderPaddingPolicy
// which stores a uint32 pad at +0xc; POTPaddingPolicy stores nothing.
//
// ─── C2 @Helium 0x45040 (base-object ctor) ──────────────────────────────────
//   __ZN16POTPaddingPolicyC2Ev:
//     0x45040 push rbp/rsp/rbx/rax
//     0x45046 movq  %rdi, %rbx
//     0x45049 callq __ZN8HGObjectC2Ev          ; HGObject::HGObject()
//     0x4504e leaq  0x9c2723(%rip), %rax        ; = vtable-for-...
//     0x45055 movq  %rax, (%rbx)               ; this->vptr = vtable
//     0x45058..0x4505e epilogue / retq
//
// ─── C1 @Helium 0x45060 (complete-object ctor) ──────────────────────────────
//   Byte-identical body to C2. Both entry points do the same work; the
//   RIP delta on the leaq differs (0x9c2723 vs 0x9c2703) but resolves to
//   the same absolute vtable address.
//
// ─── D2 @Helium 0x45080 (base-object dtor) ──────────────────────────────────
//   __ZN16POTPaddingPolicyD2Ev:
//     0x45080 push rbp / mov rsp,rbp / pop rbp
//     0x45085 jmp   __ZN8HGObjectD2Ev          ; tail-chain HGObject::~D2
//
//   Note: unlike HGTexturePoolingPolicy::D2 (which reset the vptr defensively
//   before tail-chaining), this dtor does NOT rewrite *(this+0) — the class
//   holds no owned pointers whose vfns could be dispatched during base
//   teardown, so the compiler skipped the defensive write. Result: the
//   caller-visible vptr is the last-installed one until HGObject's own D2
//   reruns its own vptr install.
//
// ─── D1 @Helium 0x45090 (complete-object dtor) ──────────────────────────────
//   __ZN16POTPaddingPolicyD1Ev:
//     0x45090 push rbp / mov rsp,rbp / pop rbp
//     0x45095 jmp   __ZN8HGObjectD2Ev          ; tail-chain HGObject::~D2
//
//   Byte-identical body to D2.
//
// ─── D0 @Helium 0x450a0 (deleting dtor) ─────────────────────────────────────
//   __ZN16POTPaddingPolicyD0Ev:
//     0x450a0 push rbp/rsp/rbx/rax
//     0x450a6 movq  %rdi, %rbx
//     0x450a9 callq __ZN8HGObjectD2Ev          ; HGObject::~HGObject
//     0x450ae movq  %rbx, %rdi
//     0x450b1..0x450b6 pop rbx/rbp
//     0x450b7 jmp   __ZN8HGObjectdlEPv         ; HGObject::operator delete
//
// ─── adjustRect @Helium 0x450c0 ─────────────────────────────────────────────
//   Arguments: %rdi = this (unused), %rsi/%rdx = HGRect by value
//              (SysV: struct laid out {x, y, right, bottom} as 4 int32s;
//              passes in two qwords with x in low32(%rsi), y in high32(%rsi),
//              right in low32(%rdx), bottom in high32(%rdx))
//   Return:   {%rax, %rdx} = adjusted HGRect (same encoding)
//
//   __ZN16POTPaddingPolicy10adjustRectE6HGRect:
//     0x450c0 push rbp/rsp/r15/r14/r13/r12/rbx/rax
//     0x450ce movq  %rsi, %rbx                    ; rbx = {y:x}   (rbx.low32 = x)
//     0x450d1 movq  %rsi, %r15
//     0x450d4 shrq  $0x20, %r15                    ; r15.low32 = y
//     0x450d8 movq  %rdx, %r13
//     0x450db shrq  $0x20, %r13                    ; r13.low32 = bottom
//     0x450df subl  %ebx, %edx                     ; edx = right - x = width
//     0x450e1 cvtsi2ss %rdx, %xmm0                 ; xmm0 = (f32) width
//     0x450e6 callq _log2f                         ; xmm0 = log2f(width)
//     0x450eb roundss $0xa, %xmm0, %xmm0           ; xmm0 = ceil(log2)  (mode 0xa = ROUND_UP)
//     0x450f1 cvttss2si %xmm0, %ecx                ; ecx = (int32) truncate(xmm0) = ceil-log2
//     0x450f5 movl  $0x1, %r12d
//     0x450fb movl  $0x1, %r14d
//     0x45101 shll  %cl, %r14d                     ; r14d = 1 << ceil(log2(width))  = POTw
//     0x45104 subl  %r15d, %r13d                   ; r13d = bottom - y = height
//     0x45107 xorps %xmm0, %xmm0                   ; clear xmm0 upper for next cvtsi2ss
//     0x4510a cvtsi2ss %r13, %xmm0
//     0x4510f callq _log2f
//     0x45114 roundss $0xa, %xmm0, %xmm0           ; ceil
//     0x4511a cvttss2si %xmm0, %ecx
//     0x4511e shll  %cl, %r12d                     ; r12d = 1 << ceil(log2(height)) = POTh
//     0x45121 addl  %ebx, %r14d                    ; r14d = x + POTw = new_right
//     0x45124 addl  %r15d, %r12d                   ; r12d = y + POTh = new_bottom
//     0x45127 shlq  $0x20, %r12                    ; r12 = new_bottom << 32
//     0x4512b orq   %r12, %r14                     ; r14 = (new_bottom<<32) | new_right
//     0x4512e movq  %rbx, %rax                     ; rax = {y:x}    (return.low  = orig)
//     0x45131 movq  %r14, %rdx                     ; rdx = {new_bot:new_right}
//     0x45134..0x45141 epilogue / retq
//
//   Result HGRect = { x: origX, y: origY, right: origX + nextPOT(width),
//                     bottom: origY + nextPOT(height) }
//
//   where nextPOT(n) = 1 << ceil(log2f(n)) with:
//     * cvtsi2ss uses the FULL 64-bit source register even though only the
//       low 32 bits carry meaning (width/height); on positive int32 values
//       the high bits are already zero (subl zero-extends), so cvtsi2ss %r13
//       and %rdx behave as cvtsi2ss of the int32 width/height. Round-to-
//       nearest is the default cvtsi2ss mode; float precision is single (ss).
//     * log2f is the Darwin libc single-precision log2. Behavior on edge
//       cases (matched below):
//         width  =  0        →  log2f(0) = -inf   →  ceil(-inf) = -inf
//                                cvttss2si of -inf on x86 returns 0x80000000
//                                (INT_MIN). Then `shll %cl, %r14d` shifts
//                                by cl mod 32 = 0 → r14d stays 1 → POTw = 1.
//                                new_right = x + 1.
//         width  =  1        →  log2f(1) = 0      →  ceil(0) = 0
//                                cvttss2si = 0 → shift-by-0 → POTw = 1
//                                new_right = x + 1.
//         width  <  0        →  log2f(neg) = NaN  →  ceil(NaN) = NaN
//                                cvttss2si = 0x80000000 → shift-by-0 → POTw = 1
//                                (well-defined; native and TS agree).
//     * `roundss $0xa` = SSE4.1 ROUNDSS immediate 0xa = (bit0..2 = 010 =
//       ROUND_UP toward +∞) | (bit3 = 1 = SUPPRESS_PRECISION_EXCEPTION).
//       Semantics: ceil.
//     * `shll %cl, %r14d` — 32-bit variable shift; on x86 the shift count is
//       taken mod 32, so cl=32 shifts by 0 (not by 32). This differs from
//       C's undefined behavior for shift-by-32. We reproduce the mod-32 rule
//       via `(1 << (n & 31)) | 0`.
//     * All final adds are 32-bit `addl` (wraparound), then the qword form
//       via `shlq $0x20; orq` packs the two int32s back into the qword.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN8HGObjectC2Ev              HGObject::HGObject()             @0x45049 @0x45069
//   __ZN8HGObjectD2Ev              HGObject::~HGObject()            @0x45085 @0x45095 @0x450a9
//   __ZN8HGObjectdlEPv             HGObject::operator delete(void*) @0x450b7
//   _log2f                         Darwin libm log2f                @0x450e6 @0x4510f
//
// Numerics: single-precision (f32) throughout the log2/round pipeline. The
// two `cvtsi2ss` -> `_log2f` -> `roundss $0xa` -> `cvttss2si` chains reduce
// each dimension to an int32 exponent; the shift+add tail is pure int32
// wraparound arithmetic. Math.fround guards each f32 stage.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGObject_ctor, HGObject_dtor } from "../render/HGObject_stub";
import type { HGRect } from "../render/HGRect";

/**
 * Installed vtable pointer for POTPaddingPolicy (Helium __DATA_CONST). Both
 * C1 @0x4506e and C2 @0x4504e resolve to the SAME absolute vtable address
 * via different RIP displacements. Not enumerated slot-by-slot here — no
 * indirect virtual call sites in these six methods dispatch through it.
 */
export const POT_PADDING_POLICY_VPTR = 0xa07540; // TODO once resolved via vtable.py

/**
 * Frontier: `HGObject::operator delete(void*)` — tail-jumped-to from D0
 * @0x450b7. Not yet transcribed (base-class free routine).
 */
function HGObject_operatorDelete(_p: unknown): void {
  // @0x450b7 jmp __ZN8HGObjectdlEPv
  throw new Error(
    "POTPaddingPolicy frontier callee not yet transcribed: HGObject::operator delete(void*) @0x450b7",
  );
}

/**
 * Frontier: `_log2f(float)` — Darwin libm single-precision log2. Called at
 * @0x450e6 (width) and @0x4510f (height). We route through Math.log2 with
 * an explicit Math.fround narrowing to match the f32 domain the SSE pipeline
 * operates in.
 *
 * On width == 0: real log2f(0) = -Infinity, `roundss $0xa, -inf` = -inf,
 * `cvttss2si -inf` = 0x80000000 = INT_MIN. Then `shll` uses cl mod 32 = 0,
 * leaving the base value (1) unchanged.
 * On width  < 0: real log2f(neg) = NaN, ceil(NaN) = NaN, cvttss2si(NaN) =
 * 0x80000000 = INT_MIN. Same shift-by-0 result.
 *
 * Both edge cases are bit-exact against Darwin native.
 */
function log2f(x: number): number {
  // @0x450e6 callq _log2f
  // @0x4510f callq _log2f
  return Math.fround(Math.log2(Math.fround(x)));
}

/**
 * Emulate `cvttss2si %xmm0, %ecx` (SSE truncate-toward-zero to int32) with
 * the x86 "invalid conversion → 0x80000000" behavior. For any input outside
 * [INT_MIN, INT_MAX] and for NaN/±Inf, the instruction returns INT_MIN
 * (0x80000000 as a signed value = -2147483648).
 *
 * @Helium sites: @0x450f1 (width), @0x4511a (height).
 */
function cvttss2si_i32(x: number): number {
  // @0x450f1 / @0x4511a cvttss2si %xmm0, %ecx
  const f = Math.fround(x);
  if (Number.isNaN(f) || f >= 2147483648 || f < -2147483648) {
    return -2147483648;
  }
  return Math.trunc(f) | 0;
}

/**
 * Emulate `shll %cl, %r14d`: 32-bit variable left shift where the shift
 * count is taken modulo 32. The C left-shift operator has undefined behavior
 * for counts ≥ 32, whereas x86 wraps.
 *
 * @Helium sites: @0x45101 (width), @0x4511e (height).
 */
function shll_i32(base: number, count: number): number {
  // @0x45101 / @0x4511e shll %cl, %r??d
  return (base << (count & 31)) | 0;
}

/**
 * `POTPaddingPolicy` — Helium's power-of-two padding policy. Rounds a
 * rectangle's width and height UP to the next power of two while keeping
 * the top-left corner fixed.
 *
 * @Helium symbols owned by this class:
 *   C2          @0x45040
 *   C1          @0x45060
 *   D2          @0x45080
 *   D1          @0x45090
 *   D0          @0x450a0
 *   adjustRect  @0x450c0
 *
 * No per-instance state — every instance is a bare vptr slot atop the
 * HGObject base subobject.
 */
export class POTPaddingPolicy {
  /**
   * `POTPaddingPolicy::POTPaddingPolicy()` [C1/C2] @0x45040 / @0x45060.
   *
   *   @0x45049 callq HGObject::HGObject()
   *   @0x4504e leaq  vtable-for-...
   *   @0x45055 movq  %rax, (%rbx)             // this->vptr = vtable
   *
   * Both C1 and C2 have byte-identical bodies (only RIP delta on the leaq
   * differs) — single TS constructor covers both entry points.
   */
  constructor() {
    // @0x45049 HGObject::HGObject()
    HGObject_ctor(this);
    // @0x45055 vptr install — modeled in TS by class identity; no explicit
    //          slot to write.
  }

  /**
   * `POTPaddingPolicy::adjustRect(HGRect)` @0x450c0.
   *
   * Rounds width and height up to the next power of two:
   *
   *   POTw = 1 << ceil(log2f(right - x))
   *   POTh = 1 << ceil(log2f(bottom - y))
   *   return { x, y, right: x + POTw, bottom: y + POTh }
   *
   * All arithmetic reproduces the x86 pipeline exactly:
   *   * f32 log2f (via log2f() helper — Math.fround-narrowed)
   *   * SSE4.1 roundss immediate 0xa = ceil (via Math.ceil on the f32)
   *   * cvttss2si with INT_MIN on NaN/inf/out-of-range (via
   *     cvttss2si_i32 helper)
   *   * shll with count-mod-32 semantics (via shll_i32 helper)
   *   * final add is 32-bit wraparound (via `| 0`).
   *
   * The `this` pointer is unused — this method reads NOTHING from *(this).
   */
  adjustRect(r: HGRect): HGRect {
    // @0x450ce/@0x450d1  rbx = rsi = {y:x};  r15 = y = shr(rsi, 32)
    const x = r.x | 0;
    const y = r.y | 0;
    // @0x450d8/@0x450db  r13 = bottom = shr(rdx, 32);  rdx.low = right
    const right = r.right | 0;
    const bottom = r.bottom | 0;

    // @0x450df subl %ebx, %edx  → width = right - x   (32-bit wrap)
    const width = (right - x) | 0;
    // @0x450e1..@0x450eb cvtsi2ss + _log2f + roundss $0xa (ceil)
    const cwWidth = Math.ceil(log2f(width));
    // @0x450f1 cvttss2si  →  ceil-log2 as int32 (INT_MIN on NaN/inf)
    const clWidth = cvttss2si_i32(cwWidth);
    // @0x450f5/@0x450fb movl $1  ; @0x45101 shll %cl, %r14d
    const potW = shll_i32(1, clWidth);

    // @0x45104 subl %r15d, %r13d  →  height = bottom - y  (32-bit wrap)
    const height = (bottom - y) | 0;
    // @0x45107..@0x45114 cvtsi2ss + _log2f + roundss $0xa (ceil)
    const cwHeight = Math.ceil(log2f(height));
    // @0x4511a cvttss2si
    const clHeight = cvttss2si_i32(cwHeight);
    // @0x4511e shll %cl, %r12d  (r12d was preloaded to $1 @0x450f5)
    const potH = shll_i32(1, clHeight);

    // @0x45121 addl %ebx, %r14d  → new_right = x + potW  (32-bit wrap)
    const newRight = (x + potW) | 0;
    // @0x45124 addl %r15d, %r12d  → new_bottom = y + potH  (32-bit wrap)
    const newBottom = (y + potH) | 0;
    // @0x45127..@0x45131 pack qwords back;  @0x4512e movq %rbx,%rax preserves
    //           the original {y:x} qword in the return.low half.
    return { x: x, y: y, right: newRight, bottom: newBottom };
  }

  /**
   * `POTPaddingPolicy::~POTPaddingPolicy()` [D2] @0x45080.
   *
   *   @0x45085 jmp HGObject::~HGObject
   */
  destroy_D2(): void {
    // @0x45085 tail-jmp HGObject::~D2
    HGObject_dtor(this);
  }

  /**
   * `POTPaddingPolicy::~POTPaddingPolicy()` [D1] @0x45090.
   *
   *   @0x45095 jmp HGObject::~HGObject
   *
   * Byte-identical body to D2.
   */
  destroy_D1(): void {
    // @0x45095 tail-jmp HGObject::~D2
    HGObject_dtor(this);
  }

  /**
   * `POTPaddingPolicy::~POTPaddingPolicy()` [D0, deleting dtor] @0x450a0.
   *
   *   @0x450a9 callq HGObject::~HGObject
   *   @0x450b7 jmp   HGObject::operator delete(this)
   */
  destroy_D0(): void {
    // @0x450a9
    HGObject_dtor(this);
    // @0x450b7 (frontier — GC subsumes in TS but stub throws for citation
    //          discipline)
    HGObject_operatorDelete(this);
  }
}
