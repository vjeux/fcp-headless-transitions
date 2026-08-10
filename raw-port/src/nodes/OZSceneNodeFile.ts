// OZSceneNodeFile — Ozone framework scene-node file wrapper.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (x86_64 slice, unadjusted VAs).
//
// This file ports ONLY the method listed under "Symbols ported here". Every
// other OZSceneNodeFile method is a separate ledger entry and will be added to
// THIS file (additive extension only) when it is claimed — never a rewrite or
// drop of a currently-landed method.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * OZSceneNodeFile::setIsFileMissing(bool)   @Ozone 0x3b2180
//
// re/disasm:
//   raw-port/re/disasm/__ZN15OZSceneNodeFile16setIsFileMissingEb.s   (7 lines)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only from this method's disasm)
// -----------------------------------------------------------------------------
// OZSceneNodeFile {
//   ...                          // 0x000..0x618 not yet decoded
//   uint8_t  isFileMissing;      // +0x619 — the one-byte "file is missing"
//                                //   flag. This method writes the low byte of
//                                //   the bool arg (%sil) straight into it:
//                                //     movb %sil, 0x619(%rdi)   @0x3b2184
//                                //   No read, no branch, no clamp — a plain
//                                //   1-byte store of the caller's bool.
//   ...                          // 0x61a.. not yet decoded
// }

/**
 * OZSceneNodeFile — opaque scene-node file wrapper. Only the +0x619
 * `isFileMissing` byte is touched by THIS unit; all other slots stay
 * un-modelled here (each unlocks in its own accessor when ported).
 */
export interface OZSceneNodeFile_Fields {
  // +0x619 : one-byte "file is missing" flag (written by setIsFileMissing).
  isFileMissing_at0x619: boolean;
}

/**
 * OZSceneNodeFile::setIsFileMissing(bool)
 * @0x00000000003b2180  Ozone   mangled: __ZN15OZSceneNodeFile16setIsFileMissingEb
 *
 * ABI: %rdi = this, %sil = bool arg (the low byte of the second int/ptr
 * register, per SysV; a C++ `bool` is passed zero-extended in the low 8 bits).
 *
 * Disasm (full):
 *   pushq %rbp                 # @0x3b2180
 *   movq  %rsp, %rbp           # @0x3b2181
 *   movb  %sil, 0x619(%rdi)    # @0x3b2184  this->isFileMissing = arg
 *   popq  %rbp                 # @0x3b218b
 *   retq                       # @0x3b218c
 *   nopl  (%rax)               # @0x3b218d  padding
 *
 * Net effect: store the bool argument's byte into this+0x619. No callees,
 * no branches, no return value.
 */
export function OZSceneNodeFile_setIsFileMissing(
  self: OZSceneNodeFile_Fields,
  isFileMissing: boolean,
): void {
  // movb %sil, 0x619(%rdi)  @0x3b2184 — the machine stores the raw low byte
  // of the bool arg; a C++ bool is 0 or 1, so a boolean store is faithful.
  self.isFileMissing_at0x619 = isFileMissing;
}
