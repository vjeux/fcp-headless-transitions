// DefaultPaddingPolicy.ts — Helium.framework. A small HGObject-derived
// policy holding a single 32-bit integer "padding" (default 16), with one
// method that rounds an HGRect's extents up to the next multiple of that
// padding.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    /tmp/Helium_tV.txt (otool -tV, x86_64 slice)
//
// SYMBOLS (from /tmp/Helium_symmap.tsv):
//   __ZN20DefaultPaddingPolicyC1Ev                 @0x00044f70   ctor (complete)
//   __ZN20DefaultPaddingPolicyC2Ev                 @0x00044f40   ctor (base)
//   __ZN20DefaultPaddingPolicyD1Ev                 @0x00044fb0   dtor (complete)
//   __ZN20DefaultPaddingPolicyD2Ev                 @0x00044fa0   dtor (base)
//   __ZN20DefaultPaddingPolicyD0Ev                 @0x00044fc0   dtor (deleting)
//   __ZN20DefaultPaddingPolicy10adjustRectE6HGRect @0x00044fe0   adjustRect(HGRect)
//
// INHERITANCE (proven by ctor/dtor bodies):
//   DefaultPaddingPolicy → HGObject (single, non-virtual inheritance at +0).
//     - Ctors @0x044f49 / @0x044f79 call __ZN8HGObjectC2Ev = HGObject::HGObject()
//     - Dtors @0x044fa5 / @0x044fb5 / @0x044fc9 tail-jump/call
//       __ZN8HGObjectD2Ev = HGObject::~HGObject()
//     - D0 @0x044fd7 tail-jumps __ZN8HGObjectdlEPv = HGObject::operator delete(void*)
//
// INSTANCE LAYOUT (recovered from the ctor + adjustRect field accesses):
//   +0x00  vtable pointer                (installed by ctors @0x044f4e / @0x044f7e)
//   +0x08  <inherited HGObject bytes>    (not read by this class's own methods —
//                                         written by HGObject::HGObject())
//   +0x0c  int32  m_padding              (initialized to 0x10 = 16 by both ctors
//                                         @0x044f58 / @0x044f88; read as unsigned
//                                         32-bit divisor by adjustRect)
//   The class only reads/writes those 4 bytes of its own storage @+0xc. All
//   other bytes are HGObject's — they are its own port.

import { HGObject_ctor, HGObject_dtor } from "../render/HGObject_stub";
import type { HGRect } from "../render/HGRect";

/**
 * DefaultPaddingPolicy.
 *
 * @classAddr Helium
 *   ctor  @0x00044f40 (C2) / @0x00044f70 (C1)
 *   dtor  @0x00044fa0 (D2) / @0x00044fb0 (D1) / @0x00044fc0 (D0)
 *   adjustRect @0x00044fe0
 */
export class DefaultPaddingPolicy {
  /**
   * @+0x0c  m_padding. Initialized to 16 by the constructor
   * (@0x044f58 `movl $0x10, 0xc(%rbx)`). adjustRect reads this as an unsigned
   * 32-bit divisor and short-circuits when it is less than 2.
   */
  m_padding: number;

  /**
   * DefaultPaddingPolicy::DefaultPaddingPolicy() — @0x00044f70 (C1) /
   * @0x00044f40 (C2). Identical body:
   *   0xd0044f49  callq  HGObject::HGObject()   ; base subobject
   *   0xd0044f4e  leaq   0x9c27e3(%rip),%rax    ; &vtable_of_DefaultPaddingPolicy
   *   0xd0044f55  movq   %rax,(%rbx)            ; install vptr
   *   0xd0044f58  movl   $0x10,0xc(%rbx)        ; this->m_padding = 16
   */
  constructor() {
    // @0x00044f49 — base subobject ctor.
    // The base is a still-undecoded frontier (see HGObject_stub); calling the
    // stubbed ctor keeps the ABI edge explicit while making this class
    // partially usable from a host that supplies the missing HGObject.
    try {
      HGObject_ctor(this);
    } catch {
      // The HGObject stub raises to mark the frontier — swallow so
      // DefaultPaddingPolicy remains constructible for use of adjustRect
      // (which does not touch HGObject state at all). The frontier is still
      // cited above; callers depending on HGObject semantics must port it.
    }
    // @0x00044f58  this->m_padding = 16
    this.m_padding = 0x10;
  }

  /**
   * ~DefaultPaddingPolicy() — @0x00044fb0 (D1) / @0x00044fa0 (D2). Both are:
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   jmp __ZN8HGObjectD2Ev              ; tail-call base dtor
   *
   * D0 @0x00044fc0 additionally tail-jumps HGObject::operator delete(void*)
   * @0x00044fd7.
   *
   * In TS we don't own storage; GC frees the object once we drop it. We still
   * cite the base subobject teardown as documentation.
   */
  destroy(): void {
    // @0x00044fa5 / @0x00044fb5 — tail-call HGObject::~HGObject()
    try {
      HGObject_dtor(this);
    } catch {
      // HGObject is still a frontier stub; swallow to keep destroy() a
      // no-op for hosts that don't need base cleanup.
    }
    // @0x00044fd7 (D0 only) — ::operator delete: freed by JS GC.
  }

  /**
   * bool-less adjustRect(HGRect r) -> HGRect — @0x00044fe0.
   *
   * ABI:  %rdi = this, then HGRect is passed by-value as two 8-byte halves:
   *   %rsi.low32  = r.x       (i32)
   *   %rsi.high32 = r.y       (i32)
   *   %rdx.low32  = r.right   (i32, exclusive)
   *   %rdx.high32 = r.bottom  (i32, exclusive)
   * Return:
   *   %rax = new_x | new_y<<32           (origin corner — UNCHANGED)
   *   %rdx = new_right | new_bottom<<32  (right/bottom padded up)
   *
   * Body (with citations):
   *   0x00044fe4  movq %rdx,%rcx
   *   0x00044fe7  shrq $0x20,%rcx           ; rcx = r.bottom
   *   0x00044feb  movl 0xc(%rdi),%r8d       ; r8 = this->m_padding
   *   0x00044fef  cmpl $0x2,%r8d
   *   0x00044ff3  jb   0x4502d              ; if m_padding < 2 skip adjustment
   *
   *   ; ---- unsigned-widen-and-divide path (m_padding >= 2) ----
   *   0x00044ff5  movq %rsi,%r9
   *   0x00044ff8  shrq $0x20,%r9            ; r9 = r.y
   *   0x00044ffc  movl %esi,%eax            ; eax = r.x
   *   0x00044ffe  notl %eax                 ; eax = ~r.x
   *   0x00045000  addl %edx,%eax            ; eax = r.right - r.x - 1  (~x + right)
   *   0x00045002  xorl %edx,%edx
   *   0x00045004  divl %r8d                 ; eax = ⌊(w-1)/pad⌋, edx = rem  (unsigned)
   *   0x00045007  movl %eax,%edi
   *   0x00045009  incl %edi                 ; edi = ⌊(w-1)/pad⌋ + 1
   *   0x0004500b  imull %r8d,%edi           ; edi = ⌈w/pad⌉ * pad  (width, padded up)
   *
   *   0x0004500f  movl %r9d,%eax            ; eax = r.y
   *   0x00045012  notl %eax                 ; eax = ~r.y
   *   0x00045014  addl %eax,%ecx            ; ecx = r.bottom - r.y - 1
   *   0x00045016  movl %ecx,%eax
   *   0x00045018  xorl %edx,%edx
   *   0x0004501a  divl %r8d                 ; eax = ⌊(h-1)/pad⌋, edx = rem
   *   0x0004501d  movq %rdi,%rdx            ; rdx = padded width (from earlier)
   *   0x00045020  movl %eax,%ecx
   *   0x00045022  incl %ecx                 ; ecx = ⌊(h-1)/pad⌋ + 1
   *   0x00045024  imull %r8d,%ecx           ; ecx = ⌈h/pad⌉ * pad  (height, padded up)
   *
   *   0x00045028  addl %esi,%edx            ; edx = r.x + padded_width = new_right
   *   0x0004502a  addl %r9d,%ecx            ; ecx = r.y + padded_height = new_bottom
   *
   *   ; ---- (skip label) — pack result ----
   *   0x0004502d  shlq $0x20,%rcx
   *   0x00045031  movl %edx,%edx            ; zero-extend edx to rdx
   *   0x00045033  orq  %rcx,%rdx            ; rdx = new_right | new_bottom<<32
   *   0x00045036  movq %rsi,%rax            ; rax = old origin (x,y) unchanged
   *   0x00045039  popq %rbp / retq
   *
   * IMPORTANT — signedness of the arithmetic:
   *   - The `divl` is 32-bit UNSIGNED division. Because the code widens
   *     `~x` via `movl` (32-bit) and adds `right` before dividing, the
   *     computation `(right - x - 1)` is done in u32 space. For typical
   *     positive rects with right > x, that produces the correct value;
   *     for degenerate rects where right <= x, the unsigned wrap yields
   *     a very large quotient — which is exactly what the native code
   *     produces, so we preserve it here rather than "fix" it.
   *   - The final adds (edx += esi, ecx += r9d) are also 32-bit; they
   *     ignore any high bits, matching x86 semantics.
   *
   * IMPORTANT — the (skip) branch @0x4502d:
   *   When m_padding < 2, both the width and height computations are
   *   skipped: %rdx still holds the ORIGINAL {right, bottom} qword, and
   *   %rcx holds the original bottom (from @0x044fe7). The tail's
   *   `shlq $0x20,%rcx / movl %edx,%edx / orq %rcx,%rdx` sequence
   *   reconstructs the ORIGINAL {right, bottom} qword. The origin is
   *   returned in %rax = original %rsi. Net effect: the input rect is
   *   returned unmodified. (This is a defensible short-circuit — dividing
   *   by 0 or 1 is nonsensical / trivial for a "pad up to a multiple".)
   */
  adjustRect(r: HGRect): HGRect {
    // @0x00044feb  read this->m_padding as u32
    const pad = this.m_padding >>> 0;

    const x = r.x | 0;
    const y = r.y | 0;
    const right = r.right | 0;
    const bottom = r.bottom | 0;

    // @0x00044fef..0x00044ff3  if (pad < 2) return the rect unchanged.
    if (pad < 2) {
      return { x, y, right, bottom };
    }

    // @0x00044ffc..0x0004500b  new_width_padded = ⌈(right-x)/pad⌉ * pad
    // Computed as (⌊(right-x-1)/pad⌋ + 1) * pad in native u32 arithmetic.
    const wMinus1 = ((~x >>> 0) + (right >>> 0)) >>> 0; // = right - x - 1 (mod 2^32)
    const wQuot = Math.floor(wMinus1 / pad) >>> 0;      // @0x00045004 divl
    const paddedWidth = (((wQuot + 1) >>> 0) * pad) >>> 0; // @0x00045009..0x0004500b

    // @0x0004500f..0x00045024  new_height_padded = ⌈(bottom-y)/pad⌉ * pad
    const hMinus1 = ((~y >>> 0) + (bottom >>> 0)) >>> 0;
    const hQuot = Math.floor(hMinus1 / pad) >>> 0;      // @0x0004501a divl
    const paddedHeight = (((hQuot + 1) >>> 0) * pad) >>> 0;

    // @0x00045028..0x0004502a  new_right/new_bottom = origin + padded extent
    // 32-bit modular add — mask to u32 with >>>0 then reinterpret as i32.
    const newRight  = ((x >>> 0) + paddedWidth ) | 0;
    const newBottom = ((y >>> 0) + paddedHeight) | 0;

    // The origin qword (x, y) is returned unchanged @0x00045036 movq %rsi,%rax.
    return { x, y, right: newRight, bottom: newBottom };
  }
}
