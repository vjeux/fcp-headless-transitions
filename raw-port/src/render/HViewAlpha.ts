// HViewAlpha.ts — Ozone's "view alpha" pass-through filter node. Faithful
// transcription of all four externally-visible HViewAlpha methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone
//
// Source disassembly (thin x86_64 slice; VA == file offset):
//   raw-port/re/disasm/Ozone.HViewAlpha.GetDOD.s     @0x607a80  GetDOD
//   raw-port/re/disasm/Ozone.HViewAlpha.GetROI.s     @0x607aa0  GetROI
//   raw-port/re/disasm/Ozone.HViewAlpha.dtorD1.s     @0x607ab0  D1 complete-object dtor
//   raw-port/re/disasm/Ozone.HViewAlpha.dtorD0.s     @0x607ac0  D0 deleting dtor
//   raw-port/re/disasm/Ozone.HViewAlpha.all.s        (GetDOD+GetROI concatenated for grep)
//
// nm/c++filt confirms these are the ONLY externally-visible HViewAlpha
// methods in Ozone.framework (all 4 present in the ledger):
//   0000000000607a80 T HViewAlpha::GetDOD(HGRenderer*, int, HGRect)
//                       [__ZN10HViewAlpha6GetDODEP10HGRendereri6HGRect]
//   0000000000607aa0 T HViewAlpha::GetROI(HGRenderer*, int, HGRect)
//                       [__ZN10HViewAlpha6GetROIEP10HGRendereri6HGRect]
//   0000000000607ab0 T HViewAlpha::~HViewAlpha()           [D1] __ZN10HViewAlphaD1Ev
//   0000000000607ac0 T HViewAlpha::~HViewAlpha()           [D0] __ZN10HViewAlphaD0Ev
//
// ---------------------------------------------------------------------------
// Class relationships (recovered from the dtor call graph):
//   HViewAlpha    is-a  HgcViewAlpha                (both dtor entries chain
//                                                     into HgcViewAlpha::~HgcViewAlpha()
//                                                     — Itanium ABI vtable
//                                                     inheritance pattern)
//   HgcViewAlpha  is-a  HGObject                    (the D0 deleting dtor
//                                                     tail-calls HGObject::operator delete
//                                                     — HGObject provides the
//                                                     custom operator delete)
// HgcViewAlpha is NOT yet ported (call sites @0x607ab5 D1-tail-jmp and
// @0x607ac9 D0-call) — surfaced below as a throwing stub. Its D2
// base-object dtor is the entry point demanded by both HViewAlpha dtors.
// HGObject::operator delete IS ported (raw-port/src/render/HGObject.ts).
//
// ---------------------------------------------------------------------------
// Cited callees / RIP constants:
//   HgcViewAlpha::~HgcViewAlpha()  @Ozone __ZN12HgcViewAlphaD2Ev
//                                  invoked @0x607ab5 (D1 tail-jmp) and @0x607ac9 (D0 call).
//   HGObject::operator delete(void*)  @Ozone __stubs 0x6def6a (__ZN8HGObjectdlEPv)
//                                     tail-jmped @0x607ad7 (deleting dtor's final free).
//   _HGRectInfinite                @Ozone RIP-target read @0x607a84
//                                  (offset 0x219265 from the next instruction @0x607a8b).
//                                  Ozone re-exposes Helium's HGRectInfinite as a __got entry
//                                  containing a pointer to Helium's _HGRectInfinite const
//                                  (Helium @0x3d2294 — already ported: HGRect.ts HGRectInfinite).
//
// ---------------------------------------------------------------------------
// HViewAlpha::GetDOD semantics (see raw-port/re/disasm/Ozone.HViewAlpha.GetDOD.s):
//
// The "GetDOD" method family across HG*/H* filter nodes returns the filter's
// "domain of definition" (DOD) for a given rendering mode. HViewAlpha is a
// pure alpha-view pass whose output is DEFINED EVERYWHERE — it advertises
// an infinite DOD regardless of mode, renderer, this-pointer, or the incoming
// HGRect. The assembly encodes exactly this unconditional constant-return:
//
//   HViewAlpha::GetDOD(HGRenderer* renderer, int mode, HGRect r):
//     @0x607a80..@0x607a81 pushq %rbp / movq %rsp,%rbp
//     @0x607a84 movq 0x219265(%rip),%rcx        ; rcx = &_HGRectInfinite  (via __got)
//     @0x607a8b movq (%rcx),%rax                ; rax = HGRectInfinite.lo
//     @0x607a8e movq 0x8(%rcx),%rdx             ; rdx = HGRectInfinite.hi
//     @0x607a92 popq %rbp
//     @0x607a93 retq                            ; return (rax, rdx) — 16 bytes
//
// Note that HViewAlpha::GetDOD IGNORES every input parameter (%rdi/this,
// %rsi/renderer, %edx/mode, %rcx:%r8/r) — none are read. The DOD is a
// compile-time constant of the class.
//
// ---------------------------------------------------------------------------
// HViewAlpha::GetROI semantics (see raw-port/re/disasm/Ozone.HViewAlpha.GetROI.s):
//
// The "GetROI" (region of interest) counterpart of GetDOD tells the renderer
// which input region a filter needs to produce a given output region. For a
// pure pass-through, this is the identity — the required input equals the
// requested output. The assembly is the shortest possible identity function:
//
//   HViewAlpha::GetROI(HGRenderer* renderer, int mode, HGRect r):
//     @0x607aa0..@0x607aa1 pushq %rbp / movq %rsp,%rbp
//     @0x607aa4 movq %r8,%rdx                   ; rdx = r.hi  (was r8 = 4th 8B slot)
//     @0x607aa7 movq %rcx,%rax                  ; rax = r.lo  (was rcx = 3rd 8B slot)
//     @0x607aaa popq %rbp
//     @0x607aab retq                            ; return (rax, rdx) = incoming r
//
// The SysV x86_64 ABI for a 16-byte trailing-struct return (`HGRect`) places
// the returned bytes in (%rax, %rdx). The incoming HGRect is likewise in
// (%rcx, %r8) — the two 8-byte halves of the 4th 16-byte argument (this
// arrives after %rdi=self, %rsi=renderer, %edx=mode). The move rearranges
// registers from the input slots to the output slots — this is the "return
// r unchanged" idiom under this ABI.

import { HGRect, HGRectInfinite } from "./HGRect";
import { HGObject } from "./HGObject";

/** HGRenderer — forward-declared for HViewAlpha's method signatures. Not
 *  ported yet in full; HViewAlpha's methods do not read it (see file header). */
export interface HGRenderer {
  readonly __hgRenderer: true;
}

/**
 * `HViewAlpha` — Ozone's alpha-only view filter node. Inherits (in C++) from
 * `HgcViewAlpha`, which in turn inherits from `HGObject`. Neither
 * externally-visible method on `HViewAlpha` itself reads any field of the
 * instance — the class publishes only two constants and two dtors.
 *
 * The instance shape below is therefore the polymorphic surface only (the
 * vtable pointer at offset 0x0 + HGObject's refCount at 0x8, both inherited
 * from HGObject). Any HgcViewAlpha-owned fields will attach when that base
 * class is transcribed.
 */
export class HViewAlpha extends HGObject {
  // No HViewAlpha-owned fields are read or written by any of the four
  // externally-visible methods. `this` (%rdi) is untouched by GetDOD and
  // GetROI, and both dtors only pass it forward to HgcViewAlpha::~HgcViewAlpha
  // (base D2) without reading any field. Field layout beyond HGObject's
  // {vtable @+0x0, refCount @+0x8} is not observable from this port.

  /**
   * `HViewAlpha::GetDOD(HGRenderer*, int mode, HGRect r)` @Ozone 0x607a80
   *
   * Unconditional constant return of `HGRectInfinite` (Helium @0x3d2294 =
   * {INT_MIN, INT_MIN, INT_MAX, INT_MAX}). Ignores `renderer`, `mode`,
   * `r`, and `this`.
   *
   *   @0x607a84 movq 0x219265(%rip),%rcx    ; rcx = &_HGRectInfinite (via __got)
   *   @0x607a8b movq (%rcx),%rax            ; rax = lo 8 bytes
   *   @0x607a8e movq 0x8(%rcx),%rdx         ; rdx = hi 8 bytes
   *   @0x607a93 retq                        ; return {lo, hi}
   */
  GetDOD(_renderer: HGRenderer, _mode: number, _r: HGRect): HGRect {
    // @0x607a84..@0x607a93 — return _HGRectInfinite (imported constant).
    return HGRectInfinite;
  }

  /**
   * `HViewAlpha::GetROI(HGRenderer*, int mode, HGRect r)` @Ozone 0x607aa0
   *
   * Identity return of the incoming `HGRect`. Ignores `renderer`, `mode`,
   * and `this`.
   *
   *   @0x607aa4 movq %r8,%rdx               ; hi half in position (was r.hi in %r8)
   *   @0x607aa7 movq %rcx,%rax              ; lo half in position (was r.lo in %rcx)
   *   @0x607aab retq                        ; return {lo, hi} = incoming r
   *
   * The two `movq` instructions relocate the 16-byte trailing struct
   * argument from its SysV-ABI input registers (%rcx:%r8) to its output
   * registers (%rax:%rdx) — pure ABI shuffling, semantically a no-op.
   */
  GetROI(_renderer: HGRenderer, _mode: number, r: HGRect): HGRect {
    // @0x607aa4..@0x607aab — return r unchanged.
    return r;
  }

  /**
   * `HViewAlpha::~HViewAlpha()` [D1 — complete-object dtor] @Ozone 0x607ab0
   *
   * Chains directly to the base HgcViewAlpha destructor and returns (there
   * are no HViewAlpha-owned members visible from this frame — the entire
   * body is a `jmp` into the base dtor).
   *
   *   @0x607ab0..@0x607ab1  pushq %rbp / movq %rsp,%rbp
   *   @0x607ab4             popq  %rbp
   *   @0x607ab5             jmp   __ZN12HgcViewAlphaD2Ev   ; HgcViewAlpha::~HgcViewAlpha()
   *
   * The `jmp` (rather than `call`+`ret`) is a compiler tail-call — same
   * observable effect: run the base dtor and return to the caller of D1.
   */
  D1_dtor(): void {
    // @0x607ab5 — jmp __ZN12HgcViewAlphaD2Ev (HgcViewAlpha::~HgcViewAlpha()).
    // HgcViewAlpha is not ported yet. Surfacing this as a throwing stub is
    // the correct demand signal per the decode-before-implement rule; the
    // base dtor will attach when HgcViewAlpha is transcribed.
    HgcViewAlpha_D2_dtor(this as unknown as HgcViewAlpha);
  }

  /**
   * `HViewAlpha::~HViewAlpha()` [D0 — deleting dtor] @Ozone 0x607ac0
   *
   * Runs the base dtor and then frees the object via HGObject's
   * `operator delete`.
   *
   *   @0x607ac0..@0x607ac1 pushq %rbp / movq %rsp,%rbp
   *   @0x607ac4            pushq %rbx                     ; save
   *   @0x607ac5            pushq %rax                     ; align (dummy slot)
   *   @0x607ac6            movq  %rdi,%rbx                ; rbx = this
   *   @0x607ac9            callq __ZN12HgcViewAlphaD2Ev   ; HgcViewAlpha::~HgcViewAlpha()
   *   @0x607ace            movq  %rbx,%rdi                ; rdi = this (arg for op delete)
   *   @0x607ad1            addq  $0x8,%rsp                ; unwind align
   *   @0x607ad5            popq  %rbx
   *   @0x607ad6            popq  %rbp
   *   @0x607ad7            jmp   0x6def6a  (__stub for __ZN8HGObjectdlEPv)
   *                                        ; HGObject::operator delete(void*)
   *
   * Standard Itanium ABI D0 pattern: run D2 base, then tail-call the class's
   * chosen `operator delete` on `this`. HViewAlpha uses HGObject::operator
   * delete, confirming HGObject is somewhere in its inheritance chain
   * (HgcViewAlpha -> HGObject).
   */
  D0_dtor(): void {
    // @0x607ac9 callq HgcViewAlpha::~HgcViewAlpha()
    HgcViewAlpha_D2_dtor(this as unknown as HgcViewAlpha);
    // @0x607ad7 jmp HGObject::operator delete(void*) — the ported forwarder
    // is a no-op in TS (GC handles reclamation), but we still make the call
    // to preserve observable ordering with the base dtor.
    HGObject.operatorDelete(this);
  }
}

// ---------------------------------------------------------------------------
// Frontier stub — the one undecoded callee this class demands.
// Throws citing its exact call site so the port graph reveals which base
// class needs transcribing next.
// ---------------------------------------------------------------------------

/** `HgcViewAlpha` — base class of HViewAlpha. Not ported yet. Neither of
 *  HViewAlpha's dtors reads any HgcViewAlpha-owned field; the entire base
 *  dtor is opaque here (only its symbol name is decoded). */
export interface HgcViewAlpha {
  readonly __hgcViewAlpha: true;
}

/**
 * `HgcViewAlpha::~HgcViewAlpha()` [D2 base-object dtor] @Ozone (unresolved)
 * @stub — called from HViewAlpha D1 @0x607ab5 and D0 @0x607ac9
 *         (__ZN12HgcViewAlphaD2Ev). Not ported yet.
 */
export function HgcViewAlpha_D2_dtor(_self: HgcViewAlpha): void {
  throw new Error(
    "HgcViewAlpha::~HgcViewAlpha() [D2] not ported — called from " +
      "HViewAlpha D1@0x607ab5 / D0@0x607ac9 (Ozone __ZN12HgcViewAlphaD2Ev)",
  );
}
