// HGBufferDumper — Helium debug buffer-dump helper (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumperC1Ev.s                 (C1 ctor — PORTED here)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumperC2Ev.s                 (C2 ctor — read ONLY to
//                                                                        show C1 is not an alias)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumper7setPathEPKc.s         (read ONLY, pins +0x00)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumper19_updateBaseFilenameEv.s
//                                                                        (read ONLY, pins +0x18)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumper19_updateNodeFilenameEiPKci6HGRect.s
//                                                                        (read ONLY, pins +0x30)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumper8setLevelEi.s          (read ONLY, pins +0x50)
//   raw-port/re/disasm/Helium.__ZN14HGBufferDumper5resetEv.s             (read ONLY, pins +0x48)
// Each of those five siblings is a SEPARATE ledger entry and is NOT ported
// here; they are read only to recover the layout this ctor initialises, which
// is the standard treatment (cf. GetGPUGraphicsAPI pinning +0x64 for
// HGRenderJob, isSlotted pinning +0x28 for HGMetalDeviceInfo).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (complete for the 0x54 bytes this ctor writes)
// -----------------------------------------------------------------------------
// The ctor's four `movups` of a zeroed xmm0 plus the `movq $0x0` cover
// +0x00..+0x48 — exactly 72 bytes, which is exactly THREE libc++ std::strings
// of 24 bytes each. That is not a guess about the count: each of the three
// slots is independently confirmed by a sibling doing string operations on
// `this + <that offset>`.
//
// HGBufferDumper {
//   std::string path;          // +0x00..+0x18 — PINNED by setPath @0x1c79f0, which calls
//                              //   std::string::assign(char const*) (stub 0x3c4e44) with
//                              //   %rdi still equal to `this`, i.e. offset +0x00.
//   std::string baseFilename;  // +0x18..+0x30 — PINNED by _updateBaseFilename @0x1c7769
//                              //   (`addq $0x18, %rbx`) which then assigns the literal
//                              //   "bufferdump." @0x1c7777 and appends twice.
//   std::string nodeFilename;  // +0x30..+0x48 — PINNED by _updateNodeFilename @0x1c780b
//                              //   (`addq $0x30, %rbx`) which then assigns @0x1c7815 and
//                              //   appends four times.
//   int32_t     slot48;        // +0x48 — set to -1 by this ctor and re-set to -1 by every
//                              //   mutator: setPath @0x1c79fe, setLevel @0x1c7a55,
//                              //   reset @0x1c7b33. A "stale/invalid" sentinel; no decoded
//                              //   instruction reveals what it counts, so it is NOT named
//                              //   for a meaning it has not been shown to have (Rule 5).
//   int32_t     slot4c;        // +0x4c — zeroed by this ctor as the HIGH half of the single
//                              //   8-byte store at +0x48 (see the zero-extension note below).
//   int32_t     level;         // +0x50 — the dump level. NAMED, unlike the two above, because
//                              //   setLevel(int) @0x1c7a10 both compares it
//                              //   (`cmpl %r14d, 0x50(%rbx)` @0x1c7a42) and writes its `int`
//                              //   argument into it (`movl %r14d, 0x50(%rbx)` @0x1c7a4c).
// }                            // total 0x54 bytes — confirmed by execution: a real ctor call
//                              //   on a poisoned buffer leaves every byte from +0x54 on
//                              //   untouched (see ORACLE).
//
// THE ZERO-EXTENSION SUBTLETY AT +0x48 — the one real trap in this function.
// The ctor does NOT store -1 as a 64-bit value. It emits:
//     0x1c793e  movl $0xffffffff, %eax     ; 32-bit mov -> rax = 0x00000000ffffffff
//     0x1c7943  movq %rax, 0x48(%rdi)      ; 64-bit store of THAT
// `movl` into a 32-bit register ZERO-extends to the full 64-bit register, so
// the qword written at +0x48 is 0x00000000ffffffff, NOT 0xffffffffffffffff.
// Reading the pair as "movq $-1" would put 0xffffffff in `slot4c` instead of 0.
// The compiler picked this encoding precisely because it sets the int32 at
// +0x48 to -1 and the int32 at +0x4c to 0 in one instruction. The ORACLE below
// measures the difference directly (the qword reads back 0x00000000ffffffff on
// every poison pattern), and `setPath` @0x1c79fe corroborates the split by
// storing to +0x48 with a FOUR-byte `movl $0xffffffff, 0x48(%rbx)` — a 32-bit
// write to that same offset, which only makes sense if +0x48 is a 4-byte field.
//
// -----------------------------------------------------------------------------
// C1 vs C2 — not an alias here
// -----------------------------------------------------------------------------
// Both complete-object (C1 @0x1c7920) and base-object (C2 @0x1c78f0) ctors
// exist at DIFFERENT addresses, so this is not one symbol under two names. Their
// bodies are instruction-for-instruction identical (same four `movups`, same
// `movq $0x0, 0x40`, same `movl $0xffffffff` / `movq` pair, same
// `movl $0x0, 0x50`), differing only in the addresses — as expected for a class
// with no virtual bases. Only C1 (__ZN14HGBufferDumperC1Ev) is claimed and
// ported here; C2 is a separate ledger entry.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   HGBufferDumper() — none. Thirteen instructions, all immediate stores; no
//     callq, no symbol stub, no indirect call, and notably NO std::string ctor
//     calls (the three strings are initialised by zero-filling, which is the
//     valid libc++ empty-SSO representation, not by calling their ctors).
//     `depgraph.py deps __ZN14HGBufferDumperC1Ev` reports nothing at all.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14HGBufferDumperC1Ev
//       — HGBufferDumper::HGBufferDumper() @Helium 0x1c7920
//
// -----------------------------------------------------------------------------
// FULL DISASM — C1 @0x1c7920 (13 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN14HGBufferDumperC1Ev:
//     0x1c7920  pushq  %rbp                       ; frame prologue
//     0x1c7921  movq   %rsp, %rbp
//     0x1c7924  xorps  %xmm0, %xmm0               ; xmm0 = 16 zero bytes
//     0x1c7927  movups %xmm0, 0x30(%rdi)          ; zero +0x30..+0x40
//     0x1c792b  movups %xmm0, 0x20(%rdi)          ; zero +0x20..+0x30
//     0x1c792f  movups %xmm0, 0x10(%rdi)          ; zero +0x10..+0x20
//     0x1c7933  movups %xmm0, (%rdi)              ; zero +0x00..+0x10
//     0x1c7936  movq   $0x0, 0x40(%rdi)           ; zero +0x40..+0x48
//                                                 ;   -> +0x00..+0x48 all zero =
//                                                 ;      three EMPTY std::strings
//     0x1c793e  movl   $0xffffffff, %eax          ; rax = 0x00000000ffffffff (ZERO-extended)
//     0x1c7943  movq   %rax, 0x48(%rdi)           ; slot48 = -1, slot4c = 0 (one store)
//     0x1c7947  movl   $0x0, 0x50(%rdi)           ; level = 0
//     0x1c794e  popq   %rbp                       ; epilogue
//     0x1c794f  retq
//
// The four `movups` run HIGH to LOW (0x30, 0x20, 0x10, 0x00). Order is
// irrelevant to the result — they write disjoint 16-byte ranges of the same
// zero value — but it is preserved in the comments below so a reviewer can walk
// the disassembly top-to-bottom against the TS.

/**
 * `HGBufferDumper` — Helium's debug buffer-dump helper: it owns an output path,
 * two generated filenames, and a dump level. This file ports ONLY the C1
 * constructor; setPath @0x1c79f0, setLevel @0x1c7a10, reset @0x1c7b10,
 * _validatePath @0x1c75e0, _updateBaseFilename @0x1c76e0, _updateNodeFilename
 * @0x1c77c0, the C2 ctor @0x1c78f0 and the dtors @0x1c7950 / @0x1c79a0 are each
 * a separate ledger entry and will be ADDED to this file when claimed.
 */
export class HGBufferDumper {
  /**
   * @Helium HGBufferDumper@0x00..0x18 — the output-directory path, a libc++
   * `std::string`. Pinned by `setPath(char const*)` @0x1c79f0, which calls
   * `std::string::assign(char const*)` (stub 0x3c4e44) with `%rdi` still holding
   * `this`, i.e. the string object begins at offset +0x00.
   *
   * The ctor zero-fills these 24 bytes rather than calling a string
   * constructor; for libc++ an all-zero `std::string` IS the canonical empty
   * short-string (SSO active, size 0), so `""` is the faithful TS value and not
   * a convenience default.
   */
  path: string = ""; // @Helium HGBufferDumper@0x00

  /**
   * @Helium HGBufferDumper@0x18..0x30 — the generated base filename, a libc++
   * `std::string`. Pinned by `_updateBaseFilename()` @0x1c76e0, which advances
   * to this slot with `addq $0x18, %rbx` @0x1c7769 and then assigns the literal
   * "bufferdump." @0x1c7777 before appending a timestamp and a "%02d" field.
   * Zero-filled by this ctor = empty (see `path`).
   */
  baseFilename: string = ""; // @Helium HGBufferDumper@0x18

  /**
   * @Helium HGBufferDumper@0x30..0x48 — the generated per-node filename, a
   * libc++ `std::string`. Pinned by
   * `_updateNodeFilename(int, char const*, int, HGRect)` @0x1c77c0, which
   * advances to this slot with `addq $0x30, %rbx` @0x1c780b and then assigns
   * @0x1c7815 and appends four times. Zero-filled by this ctor = empty.
   */
  nodeFilename: string = ""; // @Helium HGBufferDumper@0x30

  /**
   * @Helium HGBufferDumper@0x48 — a 32-bit "stale / not-yet-computed" sentinel.
   *
   * This ctor sets it to -1, and so does EVERY mutator: `setPath` @0x1c79fe
   * (with a 4-byte `movl $0xffffffff, 0x48(%rbx)`, which is what proves the
   * field is 4 bytes wide), `setLevel` @0x1c7a55, and `reset` @0x1c7b33. No
   * decoded instruction reads it, so what it counts is genuinely unknown from
   * here and it is deliberately left with an offset-suffixed neutral name
   * rather than a plausible-sounding invented one (PORTING_SPEC Rule 5).
   *
   * Held as a signed 32-bit value: -1 is how the stored dword 0xffffffff reads
   * as the `int32_t` that setPath's `movl` writes.
   */
  slot48_at_0x48: number = -1; // @Helium HGBufferDumper@0x48

  /**
   * @Helium HGBufferDumper@0x4c — zeroed by this ctor.
   *
   * It is written as the HIGH half of the single 8-byte store at +0x48
   * (`movl $0xffffffff, %eax` @0x1c793e then `movq %rax, 0x48(%rdi)` @0x1c7943;
   * the `movl` zero-extends, so the upper dword written is 0). Nothing else in
   * the decoded siblings touches it — `setPath`'s store at +0x48 is only 4 bytes
   * wide and leaves this slot alone — so its role is unknown and its name is
   * left neutral.
   */
  slot4c_at_0x4c: number = 0; // @Helium HGBufferDumper@0x4c

  /**
   * @Helium HGBufferDumper@0x50 — the dump level, an `int32_t`.
   *
   * This one IS named from evidence rather than guessed: `setLevel(int)`
   * @0x1c7a10 compares its `int` argument against this slot
   * (`cmpl %r14d, 0x50(%rbx)` @0x1c7a42), returns early when they are equal
   * (`je` @0x1c7a46), and otherwise stores the argument here
   * (`movl %r14d, 0x50(%rbx)` @0x1c7a4c). The ctor's decoded default is 0
   * (`movl $0x0, 0x50(%rdi)` @0x1c7947).
   */
  level: number = 0; // @Helium HGBufferDumper@0x50

  /**
   * `HGBufferDumper::HGBufferDumper()` @Helium 0x1c7920
   *   (__ZN14HGBufferDumperC1Ev)
   *
   * Faithful transcription of the entire 13-line C1 constructor: zero the three
   * embedded `std::string`s spanning +0x00..+0x48, set the +0x48 sentinel to -1
   * (and, in the same 8-byte store, +0x4c to 0), and set `level` at +0x50 to 0.
   * No callees at all — not even std::string constructors. The full
   * disassembly is quoted in the file header.
   *
   * In TS the field initialisers above already express this object's post-ctor
   * state, so this constructor body restates each store explicitly instead of
   * relying on them. That is deliberate: the ctor is the ported symbol, and a
   * reviewer must be able to put each of its stores next to a statement. It
   * also keeps the port correct if a later unit gives the class a second
   * constructor with different values.
   *
   * ORACLE — verified by calling the live Helium binary. The symbol is exported
   * (the cached inventory lists `00000000001c7920 T __ZN14HGBufferDumperC1Ev`),
   * takes only `this`, and calls nothing, so it can be run on a synthetic
   * object. The harness dlopens Helium under `arch -x86_64 /usr/bin/python3`
   * (every address here is an x86_64 offset — a native arm64 process would be
   * checking this port against code it did not transcribe, see OPS_LOG) and
   * calls the real constructor on a 0x200-byte buffer, repeated for five
   * different poison fills (0xEE, 0x5A, 0x00, 0xFF, 0xAA) so that no result can
   * be an artefact of the pre-existing bytes. On all five:
   *   - +0x00..+0x48 comes back entirely zero  -> the three empty strings;
   *   - the qword at +0x48 reads 0x00000000ffffffff -> slot48 = -1 AND
   *     slot4c = 0, exactly as modelled;
   *   - the dword at +0x50 reads 0x00000000 -> level = 0;
   *   - every byte from +0x54 to the end of the buffer still holds the poison,
   *     which is what fixes the object size at 0x54 and proves the ctor writes
   *     nothing beyond it.
   * NEGATIVE CONTROL (the trap this measurement exists to catch): misreading
   * `movl $0xffffffff, %eax` + `movq` as a 64-bit `-1` store would predict
   * 0xffffffffffffffff at +0x48 and therefore slot4c = -1; the binary returns
   * 0x00000000ffffffff on every one of the five runs, so slot4c is 0.
   */
  constructor() {
    // ------------------------------------------------------------
    // @0x1c7920..0x1c7921 — prologue (no TS-visible effect).
    // @0x1c7924 — xorps %xmm0, %xmm0 : xmm0 = 16 zero bytes, the value all
    //             four stores below share.
    // @0x1c7927 — movups %xmm0, 0x30(%rdi) : zero +0x30..+0x40
    // @0x1c792b — movups %xmm0, 0x20(%rdi) : zero +0x20..+0x30
    // @0x1c792f — movups %xmm0, 0x10(%rdi) : zero +0x10..+0x20
    // @0x1c7933 — movups %xmm0, (%rdi)     : zero +0x00..+0x10
    // @0x1c7936 — movq $0x0, 0x40(%rdi)    : zero +0x40..+0x48
    //   Together these five stores zero +0x00..+0x48 = the three 24-byte
    //   std::strings. An all-zero libc++ std::string is the canonical EMPTY
    //   short string, so the faithful TS equivalent of the zero-fill is "" for
    //   each — not a null, and not a fresh allocation.
    // ------------------------------------------------------------
    this.path = ""; // +0x00..+0x18
    this.baseFilename = ""; // +0x18..+0x30
    this.nodeFilename = ""; // +0x30..+0x48

    // ------------------------------------------------------------
    // @0x1c793e — movl $0xffffffff, %eax : rax = 0x00000000ffffffff. The 32-bit
    //             mov ZERO-extends; this is NOT -1 in 64 bits.
    // @0x1c7943 — movq %rax, 0x48(%rdi)  : one 8-byte store covering BOTH
    //             int32 slots — the low half (+0x48) gets 0xffffffff = -1, the
    //             high half (+0x4c) gets 0.
    // ------------------------------------------------------------
    this.slot48_at_0x48 = -1; // low dword of the @0x1c7943 store
    this.slot4c_at_0x4c = 0; // high dword of the same store (the zero-extension)

    // ------------------------------------------------------------
    // @0x1c7947 — movl $0x0, 0x50(%rdi) : level = 0 (a separate 4-byte store).
    // @0x1c794e..0x1c794f — epilogue + retq.
    // ------------------------------------------------------------
    this.level = 0;
  }
}
