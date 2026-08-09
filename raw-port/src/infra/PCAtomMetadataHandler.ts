// PCAtomMetadataHandler.ts — ProCore.framework metadata-handler class.
//
// This file ports ONLY `PCAtomMetadataHandler::copyMetadata()`. The class owns a
// CoreFoundation dictionary of atom metadata at field +0x88; copyMetadata() returns
// an immutable copy of it via CoreFoundation's CFDictionaryCreateCopy.
//
// Verbatim from FCP's ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Decode evidence:
//   re/disasm/ProCore.__ZN21PCAtomMetadataHandler12copyMetadataEv.s   @0xb525a  copyMetadata()
//
//   Disasm (9 lines):
//     0xb525a  pushq %rbp
//     0xb525b  movq  %rsp, %rbp
//     0xb525e  movq  0x921db(%rip), %rax   ## &_kCFAllocatorDefault (literal-pool sym)
//     0xb5265  movq  (%rax), %rax          ## rax = *kCFAllocatorDefault
//     0xb5268  movq  0x88(%rdi), %rsi      ## rsi = this->metadata  (+0x88)
//     0xb526f  movq  %rax, %rdi            ## rdi = kCFAllocatorDefault
//     0xb5272  popq  %rbp
//     0xb5273  jmp   0xddf88               ## tail-call _CFDictionaryCreateCopy stub
//
//   Semantics: `return CFDictionaryCreateCopy(kCFAllocatorDefault, this->metadata);`
//   Tail-jump means the CF call's return value (rax) is this function's return value.
//
// -- STRUCT LAYOUT (partial, from this method) ----------------------------
//   offset  size  field       source
//   ------  ----  ----------  -----------------------------------------------
//   +0x88   0x08  metadata    @0xb5268 movq 0x88(%rdi),%rsi  (a CFDictionaryRef;
//                             the source dictionary handed to CFDictionaryCreateCopy)
//
// -- FRONTIER EXTERNS (TRUE out-of-scope CoreFoundation — boundary stubs) --
//   _kCFAllocatorDefault      @0xb525e literal-pool ref — CoreFoundation global.
//   _CFDictionaryCreateCopy   @stub 0xddf88 — CoreFoundation.framework extern; creates
//                             an immutable copy of a CFDictionary. Not modelled in TS
//                             (the port never inspects CF dictionary bytes).

import type { CFDictionaryRef } from "./PCCFRef_CFDictionary";

/** Opaque CoreFoundation allocator handle (`CFAllocatorRef`). Only ever passed
 *  back through CF boundary stubs. */
export interface CFAllocatorRef {
  readonly __cf_allocator_brand: unique symbol;
}

/**
 * `_kCFAllocatorDefault` — CoreFoundation.framework global (the default allocator).
 * @0xb525e ProCore (literal-pool reference; dereferenced at @0xb5265).
 * TRUE out-of-scope extern: CoreFoundation owns this global; the JS surrogate has no
 * CF runtime, so reading it is a boundary stub.
 */
function kCFAllocatorDefault(): CFAllocatorRef {
  throw new Error(
    "_kCFAllocatorDefault is a CoreFoundation global with no pure-JS equivalent " +
      "(@ProCore 0xb525e).",
  );
}

/**
 * `_CFDictionaryCreateCopy(CFAllocatorRef, CFDictionaryRef)` — CoreFoundation.framework
 * extern (called via ProCore stub @0xddf88). TRUE out-of-scope extern: creates an
 * immutable copy of the source dictionary. The JS surrogate does not model CFDictionary
 * bytes; documented so a parity harness can hook the boundary.
 */
function CFDictionaryCreateCopy(
  _allocator: CFAllocatorRef,
  _source: CFDictionaryRef,
): CFDictionaryRef {
  throw new Error(
    "_CFDictionaryCreateCopy is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddf88).",
  );
}

export class PCAtomMetadataHandler {
  // +0x88: the atom-metadata dictionary (a CFDictionaryRef) that copyMetadata() copies.
  metadata!: CFDictionaryRef; // field @+0x88

  /**
   * PCAtomMetadataHandler::copyMetadata()
   * @0xb525a ProCore
   *
   * Tail-calls CoreFoundation's CFDictionaryCreateCopy to return an immutable copy of
   * this->metadata (+0x88), using the default allocator. See disasm above.
   */
  copyMetadata(): CFDictionaryRef {
    // @0xb525e/@0xb5265  rax = *kCFAllocatorDefault
    const allocator = kCFAllocatorDefault();
    // @0xb5268  rsi = this->metadata (+0x88)
    // @0xb5273  jmp _CFDictionaryCreateCopy(allocator, metadata) — tail call, return its rax
    return CFDictionaryCreateCopy(allocator, this.metadata);
  }
}

