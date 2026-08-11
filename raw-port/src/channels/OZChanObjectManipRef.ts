// OZChanObjectManipRef.ts — raw transcription of Ozone's `OZChanObjectManipRef`.
//
// ONE symbol is transcribed in this file — `setAllowsDelete(bool)`. The class's
// other members are SEPARATE ledger units and are NOT ported here; the one read
// below purely to pin the field is:
//   0x3796b0  getAllowsDelete() const   (read only — its own ledger unit)
//
// (The unrelated `OZChanObjectManipRef_Factory` — the singleton factory whose
// symbols cluster around @0x1a690 — is landed separately as
// raw-port/src/channels/OZChanObjectManipRef_Factory.ts. This file is the
// CHANNEL class itself, which had no file yet.)
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x3796a0  OZChanObjectManipRef::setAllowsDelete(bool)
//                __ZN20OZChanObjectManipRef15setAllowsDeleteEb
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN20OZChanObjectManipRef15setAllowsDeleteEb Ozone`):
//   raw-port/re/disasm/__ZN20OZChanObjectManipRef15setAllowsDeleteEb.s (6 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x3796a0  pushq %rbp                 ; frame setup (no TS counterpart)
//   0x3796a1  movq  %rsp, %rbp
//   0x3796a4  movb  %sil, 0x98(%rdi)     ; this->allowsDelete = (byte)arg
//   0x3796ab  popq  %rbp
//   0x3796ac  retq
//   0x3796ad  nopl  (%rax)               ; padding, not executed
//
// `movb %sil` is a ONE-BYTE store of the low byte of the second SysV argument.
// There is no `test`/`setne` normalisation: whatever byte the caller passes is
// what lands in the field. The matching getter @0x3796b4 is
// `movzbl 0x98(%rdi), %eax` — a zero-extending byte load — so it hands the RAW
// byte back rather than a 0/1 bool. That store/load pair is what fixes both the
// offset (+0x98) and the width (u8); the getter is read here only for that, and
// remains its own ledger unit.
//
// Measured consequence, not speculation: `setAllowsDelete(2)` followed by the
// real `getAllowsDelete()` returns 2 (see the ORACLE note). A port that
// normalised to 0/1 would disagree with the live pair on 70 of 72 cases.
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZChanObjectManipRef_setAllowsDelete_oracle.py calls the
// LIVE setter (Ozone loaded outside the app bundle through ozone_loader.py's
// depth-first @rpath preload, under `arch -x86_64`) on a 0x200-byte object
// pre-filled with 0x5A. 72 cases (0, 1, 2, 3, 0x7f, 0x80, 0xfe, 0xff and 64
// random bytes): the byte at +0x98 held the exact argument in 72/72, NO other
// byte of the object changed in 72/72 — in particular +0x99..+0x9b kept their
// poison, which is what proves a byte store rather than a dword one — and the
// live getter returned the same raw byte in 72/72.
// NEGATIVE CONTROLS (measured, same 72 cases): normalising to 0/1 -> 70 wrong;
// a 32-bit store -> 72 wrong; writing +0x99 -> 72 wrong.

/**
 * `OZChanObjectManipRef` — Ozone's object-manipulator channel reference.
 *
 * Only the ONE byte this unit writes is modelled; the rest of the layout is
 * undecoded and deliberately absent (PORTING_SPEC Rule 5).
 *
 * @Ozone 0x3796a0
 */
export class OZChanObjectManipRef {
  /**
   * @Ozone OZChanObjectManipRef@0x98 — the u8 "allows delete" flag. Written by
   * `setAllowsDelete` @0x3796a4 with `movb %sil, 0x98(%rdi)` and read back by
   * `getAllowsDelete` @0x3796b4 with `movzbl 0x98(%rdi), %eax` — a matched
   * byte store/load pair, which fixes both the offset and the width.
   *
   * Held as a NUMBER, not a boolean, on purpose: neither the setter nor the
   * getter normalises, so the field can hold any of 256 values and the getter
   * reports it verbatim (measured: 2 in, 2 out). Modelling it as a JS boolean
   * would silently collapse those states.
   */
  allowsDelete_at_0x98: number = 0; // @Ozone OZChanObjectManipRef@0x98

  /**
   * `OZChanObjectManipRef::setAllowsDelete(bool)` — @Ozone 0x3796a0
   *   __ZN20OZChanObjectManipRef15setAllowsDeleteEb
   *
   * Stores the low byte of the argument into the u8 flag at `this+0x98`. The
   * whole body is one `movb` between a frame prologue and a `retq`: no
   * normalisation, no validation, no branch, no callee — see the FULL DISASM
   * block in the file header.
   *
   * @param allowsDelete — the C++ `bool` argument (SysV %sil, one byte). Passed
   *                       as a number so a caller can reproduce the machine's
   *                       non-normalising behaviour; `& 0xff` models the byte
   *                       width of the store.
   */
  setAllowsDelete(allowsDelete: number): void {
    // @0x3796a4 — movb %sil, 0x98(%rdi) : a ONE-byte store of the low 8 bits,
    //   with no `test`/`setne` normalisation anywhere in the body.
    this.allowsDelete_at_0x98 = allowsDelete & 0xff;
    // @0x3796ab/@0x3796ac — epilogue + retq (void).
  }
}
