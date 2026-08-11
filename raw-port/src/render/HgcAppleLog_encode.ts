// HgcAppleLog_encode.ts — raw transcription of Helium's `HgcAppleLog_encode`.
//
// ONE symbol is transcribed in this file — `shaderDescription() const`. Every
// other member of the class is a SEPARATE ledger unit and is NOT ported here.
//
// This class has NO case-only `HGC…` twin (checked in
// raw-port/army/inventory/Helium.syms.txt: zero `HGCAppleLog_encode` symbols),
// so the filename is unambiguous — unlike the 29 Hgc/HGC pairs recorded in
// army/depgraph/blocked.jsonl. It is also distinct from the landed
// HGAppleLog_Encode.ts / HGAppleLogLinearizationLUTInfo.ts, which are different
// classes (HG…, not Hgc…).
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x3bd030  HgcAppleLog_encode::shaderDescription() const
//                __ZNK18HgcAppleLog_encode17shaderDescriptionEv
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZNK18HgcAppleLog_encode17shaderDescriptionEv Helium`):
//   raw-port/re/disasm/Helium.__ZNK18HgcAppleLog_encode17shaderDescriptionEv.s (18 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x3bd030  pushq  %rbp                      ; frame prologue
//   0x3bd031  movq   %rsp, %rbp
//   0x3bd034  pushq  %rbx
//   0x3bd035  pushq  %rax
//   0x3bd036  movq   %rdi, %rbx                ; rbx = the SRET return slot
//   0x3bd039  movl   $0x20, %edi               ; 32 bytes
//   0x3bd03e  callq  0x3c4fb2                  ## symbol stub for: __Znwm
//                                              ; = operator new(unsigned long)
//   0x3bd043  movq   %rax, 0x10(%rbx)          ; string.data = the new buffer
//   0x3bd047  movq   $0x21, (%rbx)             ; string.cap_word = 0x21
//   0x3bd04e  movq   $0x19, 0x8(%rbx)          ; string.size = 25
//   0x3bd056  movups 0x62615c(%rip), %xmm0     ; the TAIL 16 bytes of the literal
//                                              ; (0x3bd05d + 0x62615c = 0x9e31b9)
//   0x3bd05d  movups %xmm0, 0x9(%rax)          ; stored at data+9  -> bytes 9..24
//   0x3bd061  movups 0x626148(%rip), %xmm0     ; the HEAD 16 bytes of the literal
//                                              ; (0x3bd068 + 0x626148 = 0x9e31b0)
//   0x3bd068  movups %xmm0, (%rax)             ; stored at data+0  -> bytes 0..15
//   0x3bd06b  movb   $0x0, 0x19(%rax)          ; the NUL at data+25
//   0x3bd06f  movq   %rbx, %rax                ; SRET: return the slot pointer
//   0x3bd072  addq   $0x8, %rsp
//   0x3bd076  popq   %rbx
//   0x3bd077  popq   %rbp
//   0x3bd078  retq
//   0x3bd079  nopl   (%rax)                    ; padding, not executed
//
// TWO details worth naming, because both are invisible if you only read the
// string content:
//
// 1. THE TWO 16-BYTE STORES OVERLAP ON PURPOSE. The text is 25 bytes, which is
//    not a multiple of 16, so the compiler writes bytes 9..24 first and then
//    bytes 0..15 — the six bytes 9..15 are written TWICE, with the same values.
//    That is why the literal appears in the disassembly twice, at 0x9e31b0 and
//    at 0x9e31b0+9; there is only ONE literal.
// 2. THE RESULT IS A LONG (HEAP) libc++ STRING, BUILT BY HAND. `movq $0x21` is
//    the capacity word: libc++ stores `capacity | 1` there on x86_64, so bit 0
//    is the `is_long` flag and the real capacity is 0x20 — exactly the 32 bytes
//    just allocated. 25 characters would NOT have fit in the 22-byte SSO buffer,
//    which is why the compiler emitted the heap form inline instead of calling a
//    string constructor. (This is the x86_64 layout; the arm64 slice puts the
//    fields elsewhere — OPS_LOG's silent-false-VERIFIED case — which is why the
//    oracle runs under Rosetta.)
//
// CALLEES: exactly one, `operator new(unsigned long)` @stub 0x3c4fb2 — a libc++
// runtime extern, OUTSIDE the five in-scope frameworks, so per DEP_WORKER_BRIEF
// it is modelled as a boundary stub citing its address. No in-scope call, no
// indirect call, no virtual dispatch (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/HgcAppleLog_encode_shaderDescription_oracle.py calls the
// LIVE function (LOCAL symbol, so at `dyld slide + 0x3bd030` through
// ozone_loader.py, under `arch -x86_64`) with a poisoned 24-byte SRET slot, then
// DECODES the libc++ string out of that slot rather than trusting the port's
// reading of it: over 16 trials it confirmed is_long = 1, capacity = 0x20,
// size = 25, the heap bytes exactly `HgcAppleLog_encode [hgc1]`, a NUL at
// data+25, and %rax == %rdi (the sret contract) — 16/16.

/**
 * libc++ `void *operator new(unsigned long size)` — reached through the mach-o
 * symbol stub at @Helium 0x3c4fb2; the call site is @0x3bd03e, with $0x20 (32)
 * in %edi. A C++ runtime extern, outside the five in-scope frameworks, so it is
 * modelled as a boundary stub rather than transcribed: JS has no manual
 * allocation, and the only thing the caller does with the returned pointer is
 * fill it with the literal's bytes, which the TS string below already is.
 * Present so the call site's provenance survives in the port.
 */
function _operator_new(_size: number): void {
  // @Helium 0x3c4fb2 (symbol stub for: __Znwm) — libc++ extern, no-op in JS.
  void _size;
}

/**
 * The description text this method returns, byte-for-byte the 25-character
 * literal at Helium __TEXT,__cstring 0x9e31b0 (read directly out of the Mach-O,
 * and confirmed through the live function's heap buffer).
 *
 * @const Helium __TEXT,__cstring 0x9e31b0 (via the `movups` pair @0x3bd056 and
 *        @0x3bd061, whose displacements resolve to 0x9e31b9 and 0x9e31b0)
 */
const HGC_APPLE_LOG_ENCODE_SHADER_DESCRIPTION = 'HgcAppleLog_encode [hgc1]'; // @Helium 0x9e31b0

/**
 * `HgcAppleLog_encode` — Helium's Apple-Log encode shader node.
 *
 * No instance state is modelled: the one transcribed method never dereferences
 * `this` (it only writes through the SRET slot in %rdi), so there is nothing to
 * declare (PORTING_SPEC Rule 5).
 *
 * @Helium 0x3bd030
 */
export class HgcAppleLog_encode {
  /**
   * `HgcAppleLog_encode::shaderDescription() const` — @Helium 0x3bd030
   *   __ZNK18HgcAppleLog_encode17shaderDescriptionEv
   *
   * Returns the node's description string, `"HgcAppleLog_encode [hgc1]"`. The
   * machine returns it by SRET, constructing a LONG libc++ `std::string` inline:
   * `operator new(32)` for the buffer, capacity word 0x21 (= 0x20 | is_long),
   * size 25, the 25 bytes written by two overlapping 16-byte stores, and a NUL.
   * See the FULL DISASM block in the file header for the decode and for why the
   * literal appears twice.
   *
   * In TS a `string` IS the value a `std::string` carries, so the allocation and
   * the capacity/size bookkeeping have no counterpart beyond the documented
   * boundary stub — every one of those fields was verified against the live
   * function rather than assumed (see the ORACLE note in the file header).
   *
   * `const` matches the `__ZNK…` mangling; the body reads no instance state at
   * all.
   *
   * @returns `'HgcAppleLog_encode [hgc1]'`, always.
   */
  shaderDescription(): string {
    // @0x3bd039/@0x3bd03e — movl $0x20,%edi ; callq __Znwm : the 32-byte buffer
    //   the 25 characters plus their NUL are written into.
    _operator_new(0x20);
    // @0x3bd047/@0x3bd04e — cap_word = 0x21 (capacity 0x20 with is_long set),
    //   size = 25; @0x3bd056..@0x3bd06b — the two overlapping 16-byte stores of
    //   the literal at 0x9e31b0 and its NUL terminator.
    // @0x3bd06f — movq %rbx, %rax : the SRET slot is the return value.
    return HGC_APPLE_LOG_ENCODE_SHADER_DESCRIPTION;
  }
}
