// HDemosaic_1.ts — FCP Helium framework's HDemosaic_1 filter class.
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium (see raw-port/re/disasm/Helium.HDemosaic_1.*.s).
//
// Symbols (from nm | c++filt on Helium):
//   0xdd7a0 t HDemosaic_1::GetDOD(HGRenderer*, int, HGRect)
//   0xddbc0 t HDemosaic_1::~HDemosaic_1()   (D1 complete-obj dtor — tail-jmp to base D2)
//   0xddbd0 t HDemosaic_1::~HDemosaic_1()   (D0 deleting dtor — calls base D2 then HGObject::operator delete)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.HDemosaic_1.GetDOD.s
//   raw-port/re/disasm/Helium.HDemosaic_1.~HDemosaic_1.s   (D0)
//   /tmp/Helium_tV.txt (full otool -tV) inspected for D1 body at @0xddbc0.
//   External referenced symbols:
//     _HGRectNull                     (Helium, 16-byte const, loaded @0xdd7ab)
//     __ZN13HgcDemosaic_1D2Ev         HgcDemosaic_1::~HgcDemosaic_1() — base dtor
//     __ZN8HGObjectdlEPv              HGObject::operator delete(void*) — heap free
//
// HDemosaic_1 is a leaf class over HgcDemosaic_1 (see D1/D0 which invoke
// HgcDemosaic_1::~HgcDemosaic_1() as the ONLY base-class action, and
// D0's tail-jmp to HGObject::operator delete which implies HGObject is
// a further base).  Neither HgcDemosaic_1 nor HGObject is ported yet.
// This file transcribes only what the two decoded methods do; every
// base-class action is a THROWING stub citing its @0xADDR.

import type { HGRect } from "../render/HGRect.js";
import { HGRectNull } from "../render/HGRect.js";

/**
 * HDemosaic_1 — Helium demosaic-1 filter node.
 *
 * The class body is opaque here (only three of its methods have symbols
 * in the binary; every other slot is a vtable entry from HgcDemosaic_1).
 * Instances are heap-allocated via HGObject::operator new (implied by
 * D0's `jmp HGObject::operator delete`) and destroyed via that same
 * allocator's operator delete.
 *
 * @class Helium HDemosaic_1
 * @provenance Helium @0xdd7a0 (GetDOD), @0xddbc0 (D1), @0xddbd0 (D0)
 */
export class HDemosaic_1 {
  /**
   * HDemosaic_1::GetDOD(renderer, index, inputRect) — Domain-Of-Definition
   * query for the filter's `index`-th input.
   *
   * Helium @0xdd7a0..0xdd7bd.  The disassembly is a compact leaf:
   *
   *     movq   %rcx, %rax            ; rax = inputRect.lo  (return-low seed)
   *     testl  %edx, %edx            ; if index == 0 …
   *     je     0xdd7ba               ;   … fall through to `movq %r8,%rdx; retq`
   *                                   ;     -> returns inputRect unchanged
   *     ; else (index != 0) — replace both halves of the return pair with _HGRectNull
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     leaq   _HGRectNull(%rip), %rcx
   *     movq   (%rcx),  %rax         ; rax = HGRectNull.lo
   *     movq   0x8(%rcx), %r8        ; r8  = HGRectNull.hi
   *     popq   %rbp
   *   0xdd7ba:
   *     movq   %r8,  %rdx            ; rdx = high 8 bytes of return pair
   *     retq
   *
   * Semantics (SysV ABI, 16-byte return in rax:rdx):
   *   - When `index == 0`, the DOD is exactly the input rectangle (the
   *     0th input feeds through 1:1 — a single-plane demosaic reads all
   *     pixels of input 0 to produce a same-DOD output).
   *   - When `index != 0`, the DOD is HGRectNull — HDemosaic_1 has only
   *     one meaningful input, so any higher index has an empty DOD.
   *
   * The HGRenderer* argument (rsi) is UNUSED — the disassembly never
   * touches it.  We keep it in the signature to match the C++ ABI.
   *
   * @provenance Helium @0xdd7a0
   * @callee _HGRectNull @Helium (see raw-port/src/render/HGRect.ts)
   */
  GetDOD(_renderer: unknown, index: number, inputRect: HGRect): HGRect {
    if ((index | 0) === 0) {
      // je 0xdd7ba path: rax:rdx already carry inputRect via rcx:r8 —
      // the function returns the caller's inputRect unchanged.
      return inputRect;
    }
    // else path: return _HGRectNull.
    return { ...HGRectNull };
  }

  /**
   * HDemosaic_1::~HDemosaic_1() — D1 complete-object destructor.
   *
   * Helium @0xddbc0..0xddbca.  Pure trampoline: sets up rbp, tears it
   * down, and tail-jumps to HgcDemosaic_1::~HgcDemosaic_1() (D2 base
   * dtor).  HDemosaic_1 adds no members of its own to release.
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp __ZN13HgcDemosaic_1D2Ev
   *
   * @provenance Helium @0xddbc0
   * @callee HgcDemosaic_1::~HgcDemosaic_1() (base D2 — not yet transcribed)
   */
  destroy(): void {
    // Native: jmp HgcDemosaic_1::~HgcDemosaic_1() — that base dtor is
    // not yet ported.  Nothing HDemosaic_1-specific to release.
    this._baseDtor_HgcDemosaic_1();
  }

  /**
   * HDemosaic_1::~HDemosaic_1() — D0 deleting destructor.
   *
   * Helium @0xddbd0..0xddbec.  Runs the base D2 dtor and then tail-jumps
   * to HGObject::operator delete(this) to release the heap slot:
   *
   *     pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *     movq  %rdi, %rbx
   *     callq __ZN13HgcDemosaic_1D2Ev     ; base dtor
   *     movq  %rbx, %rdi
   *     addq  $0x8, %rsp; popq %rbx; popq %rbp
   *     jmp   __ZN8HGObjectdlEPv          ; HGObject::operator delete(this)
   *
   * @provenance Helium @0xddbd0
   * @callee HgcDemosaic_1::~HgcDemosaic_1() (base D2 — not yet transcribed)
   * @callee HGObject::operator delete(void*) (not yet transcribed)
   */
  destroyAndFree(): void {
    this._baseDtor_HgcDemosaic_1();
    // Native: jmp HGObject::operator delete(this) — GC handles this in JS.
    this._hgObjectOperatorDelete();
  }

  /**
   * HgcDemosaic_1::~HgcDemosaic_1() (D2 base dtor) — Helium symbol
   * __ZN13HgcDemosaic_1D2Ev.  Referenced from HDemosaic_1's D1 (@0xddbc5
   * jmp) and D0 (@0xddbd9 callq).  Base class not yet transcribed in
   * this port.
   */
  private _baseDtor_HgcDemosaic_1(): void {
    // Not yet transcribed — pending decode of HgcDemosaic_1 @Helium.
    // Correct signal: the parent-class dtor's actual work is unknown.
    throw new Error(
      "HgcDemosaic_1::~HgcDemosaic_1() not yet transcribed " +
      "(base-class D2 referenced from HDemosaic_1 @Helium 0xddbc5 / 0xddbd9)"
    );
  }

  /**
   * HGObject::operator delete(void*) — Helium symbol __ZN8HGObjectdlEPv.
   * Referenced from D0 @0xddbe7 (jmp).  Base allocator not yet transcribed.
   */
  private _hgObjectOperatorDelete(): void {
    // Not yet transcribed — pending decode of HGObject @Helium.
    throw new Error(
      "HGObject::operator delete(void*) not yet transcribed " +
      "(referenced from HDemosaic_1::~HDemosaic_1 D0 @Helium 0xddbe7)"
    );
  }
}
