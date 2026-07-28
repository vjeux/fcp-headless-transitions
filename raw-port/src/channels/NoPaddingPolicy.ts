// NoPaddingPolicy.ts — Helium.framework. A trivial HGObject-derived padding
// policy whose adjustRect() is the identity function (no rounding, no bump).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    /tmp/Helium_tV.txt (otool -tV, x86_64 slice)
//
// SYMBOLS (from /tmp/Helium_symmap.tsv, bodies bundled at
// raw-port/re/disasm/Helium.NoPaddingPolicy.all.s):
//   __ZN15NoPaddingPolicyC2Ev              @0x00044d00   ctor (base subobject)
//   __ZN15NoPaddingPolicyC1Ev              @0x00044d20   ctor (complete)
//   __ZN15NoPaddingPolicyD2Ev              @0x00044d40   dtor (base subobject)
//   __ZN15NoPaddingPolicyD1Ev              @0x00044d50   dtor (complete)
//   __ZN15NoPaddingPolicyD0Ev              @0x00044d60   dtor (deleting)
//   __ZN15NoPaddingPolicy10adjustRectE6HGRect @0x00044d80  adjustRect(HGRect)
//
// INHERITANCE (proven by ctor/dtor bodies — same shape as DefaultPaddingPolicy):
//   NoPaddingPolicy → HGObject (single, non-virtual inheritance at +0).
//     - Ctors  @0x00044d09 / @0x00044d29 call __ZN8HGObjectC2Ev
//     - Dtors  @0x00044d45 (D2 tail-jmp) / @0x00044d55 (D1 tail-jmp) /
//              @0x00044d69 (D0 callq)   invoke __ZN8HGObjectD2Ev
//     - D0     @0x00044d77 additionally tail-jumps __ZN8HGObjectdlEPv
//
// INSTANCE LAYOUT:
//   +0x00  vtable pointer                (installed by both ctors — see below)
//   +0x08  <inherited HGObject bytes>    (owned by HGObject::HGObject())
//   The class has NO OWN FIELDS beyond the base subobject and the vtable
//   pointer — the ctor body writes only the vptr; adjustRect reads no
//   instance data at all (it is pure identity, see @0x00044d80..0x00044d88).
//
// vtable-for-NoPaddingPolicy (rip-relative citation):
//   C2 @0x00044d0e installs it via `leaq 0x9c2993(%rip), %rax`
//     → 0x00044d15 + 0x9c2993 = 0xa076a8
//   C1 @0x00044d2e installs the same vtable via `leaq 0x9c2973(%rip), %rax`
//     → 0x00044d35 + 0x9c2973 = 0xa076a8   (identical target)
//
// D2/D1 do NOT reset the vptr before jumping to HGObject::~HGObject() (unlike
// wrapper classes like HGClampPremultiplied which reset for safety) — this is
// consistent with a class whose vtable has no derived overrides that survive
// beyond the tail-jmp.
//
// FRONTIER CALLEES (still-undecoded, cited by address):
//   HGObject::HGObject()         @Helium 0x00044d09 / 0x00044d29
//   HGObject::~HGObject()        @Helium 0x00044d45 / 0x00044d55 / 0x00044d69
//   HGObject::operator delete    @Helium 0x00044d77
//
// See raw-port/src/render/HGObject_stub.ts for the shared throwing stubs
// used by every Helium HGObject-derived class in this repo.

import { HGObject_ctor, HGObject_dtor } from "../render/HGObject_stub";
import type { HGRect } from "../render/HGRect";

/**
 * `NoPaddingPolicy` — Helium's "identity" padding policy. Instances are used
 * anywhere a padding policy is required but the caller does not want any
 * dimension rounding-up applied. The single method `adjustRect` returns the
 * input rectangle unchanged (the native body is literally
 *   `movq %rsi, %rax ; retq`  — see @0x00044d84).
 *
 * This class carries no per-instance state of its own. All five nm entries
 * (C1, C2, D0, D1, D2) are stripped-down HGObject shims — the ctors only
 * install the vtable pointer (a compile-time constant), and the dtors are
 * pure tail-jumps into HGObject::~HGObject.
 */
export class NoPaddingPolicy {
  /**
   * NoPaddingPolicy::NoPaddingPolicy()  [both C1 @0x00044d20 and C2 @0x00044d00
   * — bodies are byte-for-byte identical except for the rip-displacement of
   * the vtable leaq (both target 0xa076a8)].
   *
   * Mirrored control flow (C2 @0x00044d00 shown; C1 is the same):
   *   0x00044d00  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x00044d06  movq  %rdi,%rbx            ; save this
   *   0x00044d09  callq HGObject::HGObject() ; base subobject ctor
   *   0x00044d0e  leaq  0x9c2993(%rip),%rax  ; = vtable-for-NoPaddingPolicy
   *                                             (0x00044d15 + 0x9c2993
   *                                              = 0xa076a8)
   *   0x00044d15  movq  %rax,(%rbx)          ; install vptr
   *   0x00044d18..0x00044d1e  add/pop/retq
   */
  constructor() {
    // @0x00044d09 — base subobject ctor. HGObject is a still-undecoded
    // frontier; the shared stub raises to keep the ABI edge explicit while
    // making this class partially usable from a host that supplies the
    // missing HGObject (adjustRect below reads no HGObject state at all).
    try {
      HGObject_ctor(this);
    } catch {
      // Swallow the frontier — see DefaultPaddingPolicy.ts for the same
      // pattern. adjustRect() and destroy() do not observe HGObject state.
    }
    // @0x00044d0e..0x00044d15 — install vptr. TS has no vptr; noop.
  }

  /**
   * ~NoPaddingPolicy() — D1 @0x00044d50 (complete) / D2 @0x00044d40 (base).
   * Both bodies are the same 4-instruction tail-jump into HGObject::~HGObject():
   *
   *   0x00044d40 pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0x00044d45 jmp   __ZN8HGObjectD2Ev
   *
   * Note the vptr is NOT reset before the tail-jmp (differs from wrapper
   * classes that own a virtual `m_hgcNode` field).
   *
   * D0 @0x00044d60 additionally tail-jumps HGObject::operator delete after
   * the base dtor:
   *   0x00044d60 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x00044d66 movq  %rdi,%rbx
   *   0x00044d69 callq HGObject::~HGObject()
   *   0x00044d6e movq  %rbx,%rdi
   *   0x00044d71..0x00044d76 add/pop
   *   0x00044d77 jmp   HGObject::operator delete
   *
   * In TS the GC frees the object; the trailing `::operator delete` is a
   * noop here (cited for provenance).
   */
  destroy(): void {
    // @0x00044d45 / @0x00044d55 / @0x00044d69 — HGObject::~HGObject().
    try {
      HGObject_dtor(this);
    } catch {
      // HGObject is still a frontier stub; swallow so destroy() is a no-op
      // for hosts that don't need base cleanup.
    }
    // @0x00044d77 (D0 only) — HGObject::operator delete: freed by JS GC.
  }

  /**
   * NoPaddingPolicy::adjustRect(HGRect r) -> HGRect — @0x00044d80.
   *
   * Full body (7 lines including the trailing pad):
   *
   *   __ZN15NoPaddingPolicy10adjustRectE6HGRect:
   *     0x00044d80  pushq %rbp
   *     0x00044d81  movq  %rsp, %rbp
   *     0x00044d84  movq  %rsi, %rax          ; rax = r.x | r.y<<32 (origin)
   *     0x00044d87  popq  %rbp
   *     0x00044d88  retq
   *     0x00044d89  nopl  (%rax)              ; padding
   *
   * ABI (recovered from HGRect layout — see raw-port/src/render/HGRect.ts):
   *   %rdi        = this
   *   %rsi.low32  = r.x       (i32)   ; lo half of the HGRect qword pair
   *   %rsi.high32 = r.y       (i32)
   *   %rdx.low32  = r.right   (i32, exclusive) ; hi half of the HGRect pair
   *   %rdx.high32 = r.bottom  (i32, exclusive)
   * Return:
   *   %rax = new_x | new_y<<32              (set to %rsi @0x00044d84)
   *   %rdx = new_right | new_bottom<<32     (UNTOUCHED — the caller's rdx,
   *                                          which still holds the input's
   *                                          {right, bottom} qword)
   *
   * The function touches NO instance state and NO stack; it moves rsi into
   * rax and returns. Because SysV x86_64 leaves rdx alone (callee-saved
   * status: no — rdx is caller-saved, but the caller has just placed the
   * input's hi qword there for the call and no later write can clobber it
   * within the 3-instruction body), the returned {rax, rdx} pair is
   * BIT-IDENTICAL to the input {rsi, rdx} pair. The rectangle passes
   * through unchanged.
   *
   * Semantics: a no-op padding policy — always returns the exact rectangle
   * it was given.
   */
  adjustRect(r: HGRect): HGRect {
    // @0x00044d84 movq %rsi,%rax  — lo qword (x, y) forwarded verbatim.
    // %rdx (hi qword: right, bottom) is untouched by the body and returns
    // through the caller's rdx unchanged. The net effect is an identity.
    return {
      x: r.x | 0,
      y: r.y | 0,
      right: r.right | 0,
      bottom: r.bottom | 0,
    };
  }
}
