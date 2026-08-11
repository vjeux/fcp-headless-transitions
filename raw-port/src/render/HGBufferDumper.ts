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
//   * __ZN14HGBufferDumperD1Ev
//       — HGBufferDumper::~HGBufferDumper() [D1] @Helium 0x1c79a0
//         (byte-identical D2 twin @0x1c7950 — a separate ledger entry)
//   * __ZN14HGBufferDumper7setPathEPKc
//       — HGBufferDumper::setPath(char const*) @Helium 0x1c79f0
//
// -----------------------------------------------------------------------------
// FULL DISASM — setPath @0x1c79f0 (13 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN14HGBufferDumper7setPathEPKc:
//     0x1c79f0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1c79f6  movq  %rdi, %rbx              ; rbx = this (survives the call)
//     0x1c79f9  callq 0x3c4e44                ## std::string::assign(char const*)
//                                             ; %rdi = this (so the string
//                                             ; subobject is at +0x00), %rsi =
//                                             ; the caller's pointer, forwarded
//     0x1c79fe  movl  $0xffffffff, 0x48(%rbx) ; slot48 = -1 — a FOUR-byte store
//     0x1c7a05  addq $0x8,%rsp / popq %rbx / popq %rbp / retq
//
// The width of that store matters and is easy to get wrong: the ctor @0x1c7943,
// `reset` @0x1c7b33 and `setLevel` @0x1c7a55 all write the same -1 with a `movq`,
// which ALSO clears +0x4c; `setPath` uses `movl` and leaves +0x4c alone.
//
// -----------------------------------------------------------------------------
// FULL DISASM — D1 @0x1c79a0 (24 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN14HGBufferDumperD1Ev:
//     0x1c79a0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1c79a6  movq  %rdi, %rbx            ; rbx = this
//     0x1c79a9  testb $0x1, 0x30(%rdi)      ; nodeFilename: is_long?
//     0x1c79ad  jne   0x1c79c1              ;   yes -> free its buffer
//     0x1c79af  testb $0x1, 0x18(%rbx)      ; baseFilename: is_long?
//     0x1c79b3  jne   0x1c79d0
//     0x1c79b5  testb $0x1, (%rbx)          ; path: is_long?
//     0x1c79b8  jne   0x1c79de
//     0x1c79ba  addq $0x8,%rsp / popq %rbx / popq %rbp / retq   ; nothing to free
//     0x1c79c1  movq  0x40(%rbx), %rdi      ; nodeFilename's heap pointer (+0x30 + 0x10)
//     0x1c79c5  callq 0x3c4fa0              ## operator delete(void*)
//     0x1c79ca  testb $0x1, 0x18(%rbx)      ; fall into baseFilename's test
//     0x1c79ce  je    0x1c79b5
//     0x1c79d0  movq  0x28(%rbx), %rdi      ; baseFilename's heap pointer (+0x18 + 0x10)
//     0x1c79d4  callq 0x3c4fa0              ## operator delete(void*)
//     0x1c79d9  testb $0x1, (%rbx)          ; fall into path's test
//     0x1c79dc  je    0x1c79ba
//     0x1c79de  movq  0x10(%rbx), %rdi      ; path's heap pointer (+0x00 + 0x10)
//     0x1c79e2  addq $0x8,%rsp / popq %rbx / popq %rbp
//     0x1c79e8  jmp   0x3c4fa0              ## TAIL CALL: operator delete(void*)
//     0x1c79ed  nopl  (%rax)                ; padding, not executed
//
// The destructor CORROBORATES this file's field layout independently of the
// ctor: it tests bit 0 of the byte at +0x00, +0x18 and +0x30 and, when set,
// frees the pointer exactly 0x10 further on (+0x10, +0x28, +0x40). That is the
// x86_64 libc++ `std::string` shape — `is_long` is bit 0 of the capacity word at
// +0x00 and the data pointer sits at +0x10 — so the three 24-byte strings this
// file already models at +0x00/+0x18/+0x30 are confirmed from a second body.
// (On arm64 libc++ puts `is_long` in the sign bit of byte +0x17 and the pointer
// at +0x00; the port transcribes the x86_64 slice, and the oracle below runs
// under Rosetta for exactly that reason — OPS_LOG's silent-false-VERIFIED case.)
// Members are destroyed in REVERSE declaration order, which is why nodeFilename
// (+0x30) is freed first and path (+0x00) last, the last one as a TAIL CALL.
//
// ORACLE (raw-port/re/oracle/HGBufferDumper_D1_oracle.py): the live destructor
// was called on objects whose three string pointers were real malloc'd blocks,
// asking the allocator afterwards which blocks were released. All EIGHT
// long-flag combinations were exercised and in 8/8 the freed set equalled the
// flag set EXACTLY — pinning each flag to its OWN pointer (+0x30->+0x40,
// +0x18->+0x28, +0x00->+0x10) rather than merely showing that frees happened.
// The D2 twin agreed 8/8, and a control block never passed to the destructor was
// never freed.
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
/**
 * `std::__1::basic_string<char>::assign(char const*)` — libc++ extern, reached
 * through the mach-o symbol stub @Helium 0x3c4e44 from the call site @0x1c79f9
 * in `setPath`.
 *
 * A TRUE out-of-scope extern (the C++ standard library, not one of the five
 * ported frameworks), so per DEP_WORKER_BRIEF it is modelled as a boundary stub.
 * Its observable contract is "the string object now holds a copy of the
 * NUL-terminated C string", which a JS string models exactly — the same
 * treatment `_strdup` gets in the landed HGRenderJob.ts. Whether libc++ keeps
 * the bytes in the SSO buffer or on the heap is invisible at this boundary (and
 * it is precisely what the D1 destructor above has to care about).
 *
 * @param _self the string subobject being assigned into (%rdi @0x1c79f9 — for
 *              `setPath` that is `this`, since the string lives at +0x00).
 * @param s     the NUL-terminated C string (%rsi, forwarded unmodified).
 * @returns the new value of the string subobject.
 */
function std__string_assign(_self: string, s: string): string {
  // @Helium stub 0x3c4e44 — libc++ basic_string::assign(char const*).
  return s;
}

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

  /**
   * `HGBufferDumper::~HGBufferDumper()` [D1 complete-object destructor]
   *   @Helium 0x1c79a0 (__ZN14HGBufferDumperD1Ev)
   *
   * Releases the heap buffer of each of the three `std::string` members that
   * owns one — `nodeFilename` (+0x30) first, then `baseFilename` (+0x18), then
   * `path` (+0x00), the reverse of declaration order — and does nothing else:
   * no vtable write, no base destructor, no other member touched, and it does
   * NOT reset `level` or the +0x48/+0x4c slots. See the FULL DISASM block in the
   * file header for the line-by-line decode and the measured flag-to-pointer
   * mapping. A D1 does not free the object itself; that is the D0 deleting
   * destructor's job (a separate ledger entry).
   *
   * WHAT THIS PORT CAN AND CANNOT EXPRESS, stated plainly rather than papered
   * over: the machine's three conditionals test libc++'s `is_long` bit, and this
   * file deliberately models each `std::string` as its CONTENT (a JS `string`),
   * which does not carry that bit — the SSO-vs-heap discriminator lives below
   * the abstraction the rest of the file is written at. So the observable effect
   * of this body in TS is exactly nothing: JS strings are garbage-collected, and
   * releasing storage is not something a caller can detect through this class.
   * The alternative — inventing an `isLong` flag beside each field — would add a
   * second, unverifiable model of the same three strings to a file that already
   * has a grounded one, which is the drift PORTING_SPEC Rule 5 exists to stop.
   * The behaviour is therefore documented and oracle-verified rather than
   * simulated, and the extern boundary stub below preserves the call-site
   * provenance.
   */
  D1(this: HGBufferDumper): void {
    // @0x1c79a9/@0x1c79ad — testb $0x1, 0x30(%rdi) ; jne : nodeFilename first.
    // @0x1c79c1/@0x1c79c5 — movq 0x40(%rbx),%rdi ; callq operator delete.
    _operator_delete(this.nodeFilename);
    // @0x1c79af or @0x1c79ca — testb $0x1, 0x18(%rbx) : baseFilename next.
    // @0x1c79d0/@0x1c79d4 — movq 0x28(%rbx),%rdi ; callq operator delete.
    _operator_delete(this.baseFilename);
    // @0x1c79b5 or @0x1c79d9 — testb $0x1, (%rbx) : path last.
    // @0x1c79de/@0x1c79e8 — movq 0x10(%rbx),%rdi ; TAIL jmp operator delete.
    _operator_delete(this.path);
    // @0x1c79ba..@0x1c79c0 — the all-short path falls straight through to retq.
  }

  /**
   * `HGBufferDumper::setPath(char const*)` @Helium 0x1c79f0
   *   (__ZN14HGBufferDumper7setPathEPKc)
   *
   * Assigns the C string into the `std::string` at `this+0x00`, then stores -1
   * into the i32 at `this+0x48`. No branches, no null check, no other state
   * touched — in particular it does NOT reset `level` (+0x50) and does NOT clear
   * `slot4c_at_0x4c`, because its store is a 4-byte `movl` where the ctor,
   * `reset` and `setLevel` use an 8-byte `movq`. See the FULL DISASM block in
   * the file header.
   *
   * That the string subobject is at offset +0x00 is not an assumption: %rdi is
   * passed to `assign` unchanged @0x1c79f9, so the string IS `this`.
   *
   * ORACLE (raw-port/re/oracle/HGBufferDumper_setPath_oracle.py, carried over
   * from the branch this method was rebased from): 900 calls across paths on
   * both sides of the libc++ SSO threshold — each time the decoded string equals
   * the argument, the i32 at +0x48 reads 0xffffffff, the byte at +0x4c STILL
   * holds its 0xAA poison (which is what proves `movl` and not `movq`), and no
   * other byte of the object changed. Negative controls (200 cases each):
   * storing the counter 64-bit like the ctor does -> 200/200 wrong; not touching
   * the counter -> 200/200 wrong; assigning to a string at +0x18 -> 200/200
   * wrong.
   *
   * @param path the new destination path (%rsi, passed straight to
   *             `basic_string::assign` @0x1c79f9).
   */
  setPath(this: HGBufferDumper, path: string): void {
    // @0x1c79f0..@0x1c79f6 — prologue; %rbx = this, so the object survives the
    //   call. No TS-visible effect.
    // @0x1c79f9 — callq stub 0x3c4e44 : this->path.assign(path).
    this.path = std__string_assign(this.path, path);
    // @0x1c79fe — movl $0xffffffff, 0x48(%rbx) : a 32-BIT store of -1. `| 0`
    //   keeps the value in the int32 domain the slot holds, and using the
    //   4-byte store is what leaves slot4c_at_0x4c untouched.
    this.slot48_at_0x48 = 0xffffffff | 0;
    // @0x1c7a05..@0x1c7a0b — epilogue + retq (void).
  }
}

/**
 * libc++ `void operator delete(void *ptr)` — reached through the mach-o symbol
 * stub at @Helium 0x3c4fa0, from three call sites in the D1 destructor:
 * @0x1c79c5 (nodeFilename), @0x1c79d4 (baseFilename) and the tail `jmp`
 * @0x1c79e8 (path). A C++ runtime extern, outside the five in-scope frameworks,
 * so per DEP_WORKER_BRIEF it is modelled as a boundary stub that documents the
 * ABI it satisfies rather than being transcribed: JS is garbage-collected, and
 * the machine's only guarantee is that the storage is released and must not be
 * dereferenced again. It exists to keep the three call sites' provenance
 * visible in the port.
 */
function _operator_delete(_ptr: string): void {
  // @Helium 0x3c4fa0 (symbol stub for: __ZdlPv) — libc++ extern, no-op in JS.
  void _ptr;
}
