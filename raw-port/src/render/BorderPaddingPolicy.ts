// BorderPaddingPolicy.ts — Helium HGTexturePaddingPolicy-family concrete
// class. Represents "grow the rect outward by N pixels on every side" —
// stores a single uint32 padding value and exposes an `adjustRect(HGRect)`
// that shifts the two corners of the rect outward by the pad.
//
// Faithfully transcribed from Helium binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.C2.s                                  (@0x45150)
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.BorderPaddingPolicy.s                 (@0x45180, C1)
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.D2.s                                  (@0x451b0)
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.D1.s                                  (@0x451c0)
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.~BorderPaddingPolicy.s                (@0x451d0, D0)
//   raw-port/re/disasm/Helium.BorderPaddingPolicy.adjustRect.s                          (@0x451f0)
//
// STRUCT LAYOUT (recovered from C1/C2 stores + adjustRect's read):
//   +0x00  vtable*  vtbl    // installed by ctor.
//                            //   C2 leaq disp 0x9c2650 next=0x45168 -> 0xa077b8
//                            //   C1 leaq disp 0x9c2620 next=0x45198 -> 0xa077b8
//                            //   (SAME vtable pointer — both entry points install
//                            //   the same +0x10-offset installed-ptr; consistent
//                            //   with the pattern used by HGTexturePaddingPolicy.)
//   +0x08  ...              // (inherited from HGObject; not written by these
//                            //  methods — HGObject only stores its own vptr @+0x00,
//                            //  which this class OVERWRITES immediately after
//                            //  HGObject::HGObject() returns.)
//   +0x0c  uint32   padding // written at @0x4516b (C2) / @0x4519b (C1)
//                            //   `movl %ebx,0xc(%r14)` where %ebx = the ctor's
//                            //   uint32 argument (from %esi).
//                            //   Read at @0x451fe (adjustRect)
//                            //   `movl 0xc(%rdi),%esi`.
//
// PARENT (frontier — routed through HGObject_stub):
//   HGObject — base class. C1/C2 both call `__ZN8HGObjectC2Ev` @0x4515c / @0x4518c.
//     D2/D1 both tail-jmp `__ZN8HGObjectD2Ev` @0x451b5 / @0x451c5.
//     D0 calls HGObject D2 @0x451d9 then tail-jmps
//     `__ZN8HGObjectdlEPv` (HGObject::operator delete) @0x451e7.
//
// VTABLE (installed-ptr = 0xa077b8):
//   Not enumerated in this brief; the base ctor's leaq gives an installed-ptr
//   only, and no indirect virtual call sites in these six methods dispatch
//   through the vtable. Subclass behavior (e.g. a vtable slot that INVOKES
//   `adjustRect`) is defined by callers, not this class.
//
// NUMERIC CONTRACT (adjustRect @0x451f0):
//   HGRect is a 4×int32 struct laid out as {x, y, right, bottom} (see
//   raw-port/src/render/HGRect.ts). On x86_64 SysV the struct is passed in
//   two 8-byte registers: %rsi = {y:x} (y in high 32, x in low 32), %rdx =
//   {bottom:right} (bottom in high 32, right in low 32). The return uses the
//   same encoding in {%rdx, %rax}.
//
//   Decode of @0x451f0..21d:
//     %rax = %rsi                                @0x451f4  (rax = {y:x})
//     %rcx = %rsi                                @0x451f7
//     %rcx >>= 32                                @0x451fa  (rcx = y  in low32)
//     %esi  = *(this + 0xc)                      @0x451fe  (esi = pad; clobbers rsi.low = x
//                                                          — safe: eax already holds x in low32)
//     %edi = %edx + %esi                          @0x45201  (edi = right + pad)
//     %rdx >>= 32                                @0x45204  (rdx = bottom in low32)
//     %eax -= %esi                               @0x45208  (eax = x - pad)
//     %ecx -= %esi                               @0x4520a  (ecx = y - pad)
//     %edx += %esi                               @0x4520c  (edx = bottom + pad)
//     %rcx <<= 32; %rax |= %rcx                  @0x4520e/12  ({y-pad, x-pad})
//     %rdx <<= 32; %rdx |= %rdi                  @0x45215/19  ({bottom+pad, right+pad})
//     return {%rdx, %rax}                        @0x4521c  ret.
//
//   Arithmetic is 32-bit `subl` / `addl` / `leal` — WRAPPING two's-complement,
//   NOT saturating. So padding an INT_MIN-x rect underflows to INT_MAX-pad+1,
//   matching the native binary bit-exactly. We preserve this via the mask
//   `>>>0` on unsigned and `| 0` on signed 32-bit slots.

import { HGRect } from "./HGRect";
import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub";

/** Installed vtable pointer for BorderPaddingPolicy (Helium @0xa077b8). Both
 *  C1 (@0x45191) and C2 (@0x45161) resolve to the SAME address via different
 *  displacements. */
export const BORDER_PADDING_POLICY_VPTR = 0xa077b8;

/**
 * HGObject::operator delete(void*) — Helium @0x451e7 tail-jmp target
 * (`__ZN8HGObjectdlEPv`). Not yet transcribed (base-class frontier — same
 * decode gap as HGObject_ctor / HGObject_dtor). Throwing stub. */
function HGObject_operatorDelete(_p: unknown): void { // @0x451e7 -> __ZN8HGObjectdlEPv
  throw new Error("BorderPaddingPolicy frontier callee not yet transcribed: HGObject::operator delete(void*) @call-site 0x451e7"); // @0x451e7
}

/**
 * BorderPaddingPolicy — HGObject-derived padding-policy that expands a
 * rectangle outward by a constant integer pad on all four sides.
 */
export class BorderPaddingPolicy {
  /** Struct @+0x00 — vtable ptr. Installed at @0x45168 (C2) / @0x45198 (C1). */
  vptr: number = 0;

  /** Struct @+0x0c — uint32 padding value. Written by ctor @0x4516b (C2) /
   *  @0x4519b (C1); read by adjustRect @0x451fe (`movl 0xc(%rdi),%esi`). */
  padding: number = 0;

  /**
   * @Helium 0x0000000000045150  BorderPaddingPolicy::BorderPaddingPolicy(unsigned int)  [C2]
   * @Helium 0x0000000000045180  BorderPaddingPolicy::BorderPaddingPolicy(unsigned int)  [C1]
   *
   * Both bodies are byte-identical modulo the leaq displacement (both leaq's
   * resolve to the same 0xa077b8 installed-ptr):
   *   1. @0x4515c / @0x4518c — call HGObject::HGObject(this).
   *   2. @0x45161..68 / @0x45191..98 — install vtable @+0x00 = 0xa077b8.
   *   3. @0x4516b / @0x4519b — store the uint32 argument (ebx = %esi) into
   *      this->+0x0c.
   */
  constructor(padding: number) { // @0x45150 (C2) / @0x45180 (C1)
    // @0x4515c / @0x4518c — HGObject::HGObject(this). Frontier — routed
    //   through the stub file HGObject_stub.ts which throws with citation.
    HGObject_ctor(this); // @0x4515c / @0x4518c

    // @0x45161..68 / @0x45191..98 — install vtable ptr (0xa077b8).
    this.vptr = BORDER_PADDING_POLICY_VPTR; // @0x45168 / @0x45198

    // @0x4516b / @0x4519b — this->+0x0c = padding (as uint32).
    this.padding = padding >>> 0;           // @0x4516b / @0x4519b
  }

  /**
   * @Helium 0x00000000000451b0  BorderPaddingPolicy::~BorderPaddingPolicy()  [D2]
   * @Helium 0x00000000000451c0  BorderPaddingPolicy::~BorderPaddingPolicy()  [D1]
   *
   * Both bodies are byte-identical:
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN8HGObjectD2Ev
   * A tail-jump to HGObject's destructor. No per-derived cleanup — the
   * `padding` field is POD u32. Routed through HGObject_dtor stub.
   */
  destroy(): void { // @0x451b0 (D2) / @0x451c0 (D1)
    // @0x451b5 / @0x451c5 — jmp __ZN8HGObjectD2Ev. Frontier stub.
    HGObject_dtor(this); // @0x451b5 / @0x451c5
  }

  /**
   * @Helium 0x00000000000451d0  BorderPaddingPolicy::~BorderPaddingPolicy()  [D0 = deleting]
   *
   * Body @0x451d0..e7:
   *   1. @0x451d9 — call HGObject::~HGObject() (D2 as sub-object destructor).
   *   2. @0x451e7 — tail-jmp HGObject::operator delete(this).
   *
   * D0 = D1 + operator-delete. In TS operator-delete is GC; we still route
   * through HGObject stubs so the frontier is explicit.
   */
  destroyDeleting(): void { // @0x451d0 (D0)
    // @0x451d9 — HGObject::~HGObject().
    HGObject_dtor(this); // @0x451d9
    // @0x451e7 — HGObject::operator delete(this). Frontier stub.
    HGObject_operatorDelete(this); // @0x451e7
  }

  /**
   * @Helium 0x00000000000451f0  BorderPaddingPolicy::adjustRect(HGRect)
   *   __ZN19BorderPaddingPolicy10adjustRectE6HGRect
   *
   * Grows the rectangle outward by `this->padding` on all sides:
   *   { x, y, right, bottom } → { x - pad, y - pad, right + pad, bottom + pad }
   *
   * Arithmetic is 32-bit wrapping (subl/addl/leal on int32 slots — matches
   * two's-complement). See NUMERIC CONTRACT block at file head for the full
   * register-level decode.
   *
   * The `this` pointer only supplies `padding`; no state is mutated. `HGRect`
   * is passed by value.
   */
  adjustRect(r: HGRect): HGRect { // @0x451f0
    // @0x451fe — pad = this->+0x0c (uint32).
    const pad = this.padding | 0; // signed view for the 32-bit wrapping arithmetic below

    // @0x45201/08/0a/0c — the four 32-bit wraps:
    //   eax = x - pad    (@0x45208 subl %esi,%eax)
    //   ecx = y - pad    (@0x4520a subl %esi,%ecx)
    //   edi = right + pad (@0x45201 leal (%rdx,%rsi),%edi)
    //   edx = bottom+pad (@0x4520c addl %esi,%edx)
    //
    // JS: bitwise `| 0` forces the operand pair into int32; addition/subtraction
    //   then wraps modulo 2^32 into a signed int32, matching addl/subl/leal
    //   bit-exactly. This is a DIRECT TS mapping of the native 32-bit ALU op.
    const newX      = ((r.x      | 0) - pad) | 0; // @0x45208
    const newY      = ((r.y      | 0) - pad) | 0; // @0x4520a
    const newRight  = ((r.right  | 0) + pad) | 0; // @0x45201
    const newBottom = ((r.bottom | 0) + pad) | 0; // @0x4520c

    // @0x4520e..1c — repack into {rax = {y:x}, rdx = {bottom:right}} return.
    //   In TS we return a fresh HGRect record with the same corner-form fields.
    return {
      x: newX,
      y: newY,
      right: newRight,
      bottom: newBottom,
    }; // @0x4521c retq
  }
}
