// OZChanObjectManipRef_Factory — Ozone factory for the OZChanObjectManipRef channel.
//
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (unadjusted VAs, exactly as `otool -tV -arch x86_64` prints them).
//
// This file ports ONE ledger unit:
//   __ZN28OZChanObjectManipRef_Factory17getIconIDInternalEv
//     OZChanObjectManipRef_Factory::getIconIDInternal()   @Ozone 0x1a8d0
// Disassembly used (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN28OZChanObjectManipRef_Factory17getIconIDInternalEv Ozone`):
//   raw-port/re/disasm/__ZN28OZChanObjectManipRef_Factory17getIconIDInternalEv.s
//
// Every OTHER method on this factory (D1 @0x1a690, D0 @0x1a6c0, create @0x1a6f0,
// createCopy @0x1a750, createInstance @0x1a7b0, description @0x1a7c0,
// unlocalizedDescription @0x1a7e0, manufacturer @0x1a800, version @0x1a820, revision @0x1a830,
// getCategoryName @0x1a840, getEnglishCategoryName @0x1a860, getBundleID @0x1a880,
// getIconNameInternal @0x1a890, getIconNameBWInternal @0x1a8b0,
// getLibraryIconNameInternal @0x1a8e0, createChannel @0x1a900, createChannelCopy @0x1a960,
// createChannelInstance @0x1a9c0, and the +0x80 thunks @0x1a9d0/@0x1a9f0)
// is a SEPARATE ledger unit and is deliberately absent here. Per the one-class-one-file rule
// those methods get ADDED to this same file when their own units are claimed — do not create a
// sibling file, and do not delete what is already here (G6 add-only).

/**
 * `OZChanObjectManipRef_Factory::getIconIDInternal()` — @Ozone 0x1a8d0
 * (`__ZN28OZChanObjectManipRef_Factory17getIconIDInternalEv`).
 *
 * FULL transcription — the body is 5 executed instructions and nothing else:
 *
 *   0x1a8d0  pushq %rbp                ; frame setup (no TS counterpart)
 *   0x1a8d1  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
 *   0x1a8d4  movl  $0xffffffff, %eax   ; %eax = int32 -1        <-- the whole function
 *   0x1a8d9  popq  %rbp                ; frame teardown (no TS counterpart)
 *   0x1a8da  retq                      ; returns the int32 in %eax
 *   0x1a8db  nopl  (%rax,%rax)         ; inter-function alignment padding, never executed
 *
 * `this` (%rdi) is never dereferenced; there is no callq, no allocation, no load, and no
 * indirect/virtual dispatch — `depgraph.py deps` lists no dependency at all.
 *
 * WHY -1 IS THE IMPLEMENTATION AND NOT AN UNPORTED GAP. Ozone ships 127 concrete
 * `getIconIDInternal` overrides; 94 of them are this same one-instruction
 * `movl $0xffffffff,%eax`, while the remaining 33 return real icon IDs (0x12 ×6, 0xa ×6,
 * 0x11 ×4, 0x3 ×3, 0xe ×2, 0x10 ×2, and one each of 0x4/0xb/0xd/0xf/0x15/0x16/0x1f/0x20,
 * plus 2 that return 0 via `xorl %eax,%eax`). Counted directly over the framework's own
 * `otool -tV -arch x86_64` dump. So -1 is the shipped "this factory contributes no icon ID"
 * sentinel, and the value is written into the 32-bit %eax, making it the int32 -1 rather than
 * the unsigned 4294967295 a 64-bit-wide write would produce.
 *
 * ORACLE (executed, not read): the symbol is `t` (local), so it is not dlsym-able; it was called
 * BY ADDRESS in a Rosetta x86_64 process at `_dyld_get_image_vmaddr_slide(Ozone) + 0x1a8d0`
 * (vmaddr taken from the x86_64 symbol table, never a bare `nm`, which reports the arm64 slice),
 * with four different receiver pointers (0x0, 0x1, 0xdeadbeef, and a live 0x200-byte buffer).
 * Live FCP returned -1 in all four calls, which also confirms the body never touches `this`.
 *
 * @returns %eax — always -1 (@0x1a8d4).
 */
export class OZChanObjectManipRef_Factory {
  /** The int32 the factory reports for "no icon ID" — the immediate written by
   *  `movl $0xffffffff,%eax` @Ozone 0x1a8d4. */
  static readonly ICON_ID_NONE: number = -1;

  getIconIDInternal(): number {
    // @0x1a8d4  movl $0xffffffff,%eax   /   @0x1a8da  retq
    return OZChanObjectManipRef_Factory.ICON_ID_NONE;
  }
}
