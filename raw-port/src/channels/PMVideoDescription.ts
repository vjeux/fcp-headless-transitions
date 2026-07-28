// raw-port/src/channels/PMVideoDescription.ts
//
// FCP `PMVideoDescription` — Ozone class carrying video-format metadata for a
// project media item (a `PMVideoDescription` is the "video description" side
// of a `PMMediaDescription`, holding format/colorimetry info alongside sound
// and closed-caption descriptions on the parent). It embeds a PCString and
// owns a CGColorSpace CFRef.
//
// This port currently transcribes the destructor. The other methods are not
// in this ledger claim; downstream users should refer to `@0xADDR`-cited
// throw-stubs when they call into an unported entrypoint.
//
// DECODE: transcribed from re/disasm/PMVideoDescription.~PMVideoDescription.s
// (Ozone x86_64 slice; symbol nm-listed as __ZN18PMVideoDescriptionD1Ev).
// This is a faithful transcription — nothing is approximated.
//
// Symbols (Ozone framework, x86_64 slice):
//   0x000575d0  PMVideoDescription::~PMVideoDescription()   [D1 complete-object dtor]
//               __ZN18PMVideoDescriptionD1Ev
//
// STRUCT LAYOUT (only the offsets the dtor touches are proven — the class is
// clearly larger, but this claim only decodes ~PMVideoDescription):
//   0x1d0 : PCString                 embeddedName    // dtor tail-jmps to PCString::~PCString(this+0x1d0)
//   0x1e8 : CGColorSpaceRef | null   colorSpace      // dtor releases via PCCFRefTraits<CGColorSpace*>::release
//
// The rest of the class (0x0..0x1cf, 0x1d0+sizeof(PCString)..0x1e7, 0x1e8+8..end)
// is untouched by this method and therefore NOT part of the layout evidence.

import { PCString } from "../infra/PCString.js";
import { PCCFRefTraits_CGColorSpace_release } from "../infra/PCColorSpaceHandle.js";
import type { CGColorSpaceRef } from "../infra/PCColor.js";

/**
 * Shape of the fields that `~PMVideoDescription` reads. Callers modeling the
 * full class may extend this — but this file only vouches for the two slots
 * the dtor actually reads/writes.
 */
export interface PMVideoDescriptionDtorShape {
  /** +0x1d0 — embedded PCString member, destructed by tail-jmp to PCString::~PCString. */
  embeddedName: PCString;
  /** +0x1e8 — retained CGColorSpaceRef (may be null). */
  colorSpace: CGColorSpaceRef | null;
}

/**
 * PMVideoDescription::~PMVideoDescription()  [D1 complete-object dtor]  @0x000575d0
 *
 * Instruction-by-instruction transcription of the Ozone symbol
 * `__ZN18PMVideoDescriptionD1Ev`:
 *
 *   0x575d0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   0x575d6  movq  %rdi, %rbx                  ; rbx = this
 *   0x575d9  movq  0x1e8(%rdi), %rdi           ; rdi = this->colorSpace
 *   0x575e0  testq %rdi, %rdi                  ; if (colorSpace == NULL) skip
 *   0x575e3  je    0x575ea
 *   0x575e5  callq __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
 *                                              ; PCCFRefTraits<CGColorSpace*>::release
 *                                              ; (tail-jumps to _CGColorSpaceRelease)
 *   0x575ea  addq  $0x1d0, %rbx                ; rbx = &this->embeddedName (PCString sub-object)
 *   0x575f1  movq  %rbx, %rdi
 *   0x575f4  addq  $0x8, %rsp / popq %rbx / popq %rbp
 *   0x575fa  jmp   __ZN8PCStringD1Ev            ; tail-call PCString::~PCString(this+0x1d0)
 *
 *   0x575ff  movq %rax, %rdi
 *   0x57602  callq ___clang_call_terminate     ; C++ EH terminator landing pad (unreachable in
 *                                              ; normal control flow — noexcept destructor path)
 *
 * IMPORTANT: the destructor does NOT null-out either slot after release. The
 * object's storage is about to be reclaimed; the binary intentionally omits
 * the writes. We do the same.
 *
 * @0x000575d0
 */
export function PMVideoDescription_dtor(
  this_: PMVideoDescriptionDtorShape,
): void {
  // 0x575d9: load this->colorSpace @+0x1e8
  const cs = this_.colorSpace;
  // 0x575e0..0x575e5: if non-null, release CGColorSpace (delegates to _CGColorSpaceRelease)
  if (cs !== null) {
    PCCFRefTraits_CGColorSpace_release(cs);
  }
  // 0x575ea..0x575fa: tail-jmp PCString::~PCString(&this->embeddedName @+0x1d0)
  this_.embeddedName.destroy();
  // (0x575ff landing pad = ___clang_call_terminate, unreachable in the normal
  //  path since neither release nor PCString::~PCString throws in FCP.)
}
