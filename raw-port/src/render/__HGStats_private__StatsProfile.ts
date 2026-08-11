// __HGStats_private__StatsProfile.ts — raw transcription of Helium's
// `__HGStats_private::StatsProfile`.
//
// ONE symbol is transcribed in this file — `pixels() const`. Every other member
// is a SEPARATE ledger unit and is NOT ported here; the neighbours, listed for
// orientation only (addresses from the cached inventory
// raw-port/army/inventory/Helium.syms.txt, each its own unit):
//   0x96e30  StatsProfile()                       [C1/C2, same address]
//   0x96e50  ~StatsProfile()                      [D1]
//   0x96e60  ~StatsProfile()                      [D0]
//   0x420a0  ~StatsProfile()                      [D2]
//   0x96e70  operator+=(Stats const&)             (read below, not ported)
//   0x96ec0  operator+(Stats const&)
//   0x983b0  time() const                         (read below, not ported)
//
// Naming: `__HGStats_private` is a NAMESPACE and `StatsProfile` the class inside
// it, so the file joins the qualified name with a double underscore per
// PORTING_SPEC ("Nested classes: Outer__Inner"), the same convention as the
// landed PCEvictionHeap__ColorSpaceRefCache.ts. Note the sibling
// `__HGStats_private::RRStatsProfile` has its own `pixels()` @0x9f8e0 and
// `time()` @0x99440 — a DIFFERENT class with the same method names, which is
// exactly the confusion the fully-qualified filename prevents.
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x9e300  __HGStats_private::StatsProfile::pixels() const
//               __ZNK17__HGStats_private12StatsProfile6pixelsEv
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZNK17__HGStats_private12StatsProfile6pixelsEv Helium`):
//   raw-port/re/disasm/__ZNK17__HGStats_private12StatsProfile6pixelsEv.s (6 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x9e300  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x9e301  movq  %rsp, %rbp
//   0x9e304  movq  0x10(%rdi), %rax      ; return *(uint64_t*)(this + 0x10)
//   0x9e308  popq  %rbp
//   0x9e309  retq
//   0x9e30a  nopw  (%rax,%rax)           ; alignment padding, not executed
//
// `movq` (not `movl`), and the value comes back in %rax (an INTEGER register,
// not %xmm0), so the field is a 64-bit integer and the return type is a 64-bit
// integer — contrast the sibling `time()` @0x983b4, which is `movsd 0x8(%rdi),
// %xmm0` and therefore returns a double.
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT (partial — only what a decoded instruction proves)
// ---------------------------------------------------------------------------
// Recovered from `operator+=(Stats const&)` @0x96e70, which maintains all four
// slots in one pass and is read here only to pin them (it stays its own ledger
// unit):
//
//   +0x00  vptr           — the class is polymorphic (D0/D1/D2 all exist, and
//                           RRStatsProfile is a sibling profile type). Untouched
//                           by this getter.
//   +0x08  double  time   — `addsd 0x8(%rbx), %xmm0` @0x96e86 then `movsd` back
//                           @0x96e8b; `time()` @0x983b4 reads it with `movsd`.
//   +0x10  uint64  pixels — `addq %rax, 0x10(%rbx)` @0x96e99, where %rax is the
//                           result of the Stats vtable call at slot +0x20
//                           (`callq *0x20(%rax)` @0x96e96). THIS getter's field.
//   +0x18  uint64         — `addq %rax, 0x18(%rbx)` @0x96ea6, from vtable slot
//                           +0x28. Name unknown; not modelled (Rule 5).
//   +0x20  uint64         — `addq %rax, 0x20(%rbx)` @0x96eb3, from vtable slot
//                           +0x30. Name unknown; not modelled.
//
// Only the two slots a decoded body actually reads are given TS fields; naming
// the other two from guesswork is what PORTING_SPEC Rule 5 forbids.
//
// ---------------------------------------------------------------------------
// WHY bigint AND NOT number
// ---------------------------------------------------------------------------
// PORTING_SPEC Rule 4: int64 becomes bigint where the value can exceed 2^53.
// This one can — it is an ACCUMULATOR (`addq`, wrapping mod 2^64) of pixel
// counts summed over every probe, and the getter hands back all 64 bits. The
// oracle measures the cost of getting this wrong: modelling the field as a JS
// number (a double round-trip) gives a different answer on 403 of 416 cases.
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// Verified by CALLING the live function —
// raw-port/re/oracle/HGStats_private__StatsProfile_pixels_oracle.py. The symbol
// is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness calls it at
// `dyld slide + 0x9e300` via raw-port/re/oracle/ozone_loader.py (address from the
// cached inventory, and a hard refusal to run outside an x86_64 process). 416
// cases — 0/1/2, the 32-bit boundaries, 2^53 and 2^53+1, 2^63, 2^64-1, a double
// bit pattern, and 400 random 64-bit values — with the neighbouring slots filled
// with distinct sentinels so a wrong-slot read is visible: 416/416 exact, 0
// objects mutated (a pure read).
// NEGATIVE CONTROLS (measured, same 416 cases): a 32-bit `movl` read -> 410
// wrong; reading the +0x18 accumulator -> 416 wrong; reading the +0x08 time slot
// -> 416 wrong; passing the value through a JS double -> 403 wrong.

/**
 * `__HGStats_private::StatsProfile` — Helium's per-op statistics accumulator
 * (time + three 64-bit counters), summed by `operator+=(Stats const&)` @0x96e70.
 *
 * Only the fields a decoded instruction proves are modelled; see the STRUCT
 * LAYOUT block in the file header.
 *
 * @Helium 0x9e300
 */
export class __HGStats_private__StatsProfile {
  /** @Helium StatsProfile@0x08 — the accumulated time, a `double`. Written by
   *  `operator+=` @0x96e8b (`addsd`/`movsd`) and read by `time()` @0x983b4 with
   *  `movsd 0x8(%rdi), %xmm0` — an xmm-register return, which is what makes it a
   *  double rather than another integer counter. `time()` itself is a separate
   *  ledger unit; the field is declared here because this file's layout
   *  documentation would otherwise misnumber the offsets. */
  time: number = 0; // @Helium StatsProfile@0x08

  /** @Helium StatsProfile@0x10 — the accumulated PIXEL COUNT, a `uint64_t`. Read
   *  by `pixels()` @0x9e304 with `movq 0x10(%rdi), %rax`; accumulated by
   *  `operator+=` @0x96e99 with `addq %rax, 0x10(%rbx)` from the Stats vtable
   *  slot at +0x20. Held as a bigint because an accumulator of pixel counts can
   *  exceed 2^53 and the machine keeps all 64 bits (measured: a double
   *  round-trip changes the answer on 403 of 416 oracle cases). */
  pixels_at_0x10: bigint = 0n; // @Helium StatsProfile@0x10

  /**
   * `__HGStats_private::StatsProfile::pixels() const` — @Helium 0x9e300
   *   (__ZNK17__HGStats_private12StatsProfile6pixelsEv)
   *
   * Returns the accumulated pixel count at `this+0x10`. Full transcription —
   * every instruction, in order:
   *
   *   0x9e300  pushq %rbp             ; frame setup (no TS counterpart)
   *   0x9e301  movq  %rsp, %rbp
   *   0x9e304  movq  0x10(%rdi), %rax ; the whole body: one 64-bit load
   *   0x9e308  popq  %rbp
   *   0x9e309  retq                   ; returns %rax
   *
   * Decode notes:
   *   * `movq` + an %rax return = a full 64-bit INTEGER; the sibling `time()`
   *     @0x983b4 uses `movsd`/%xmm0 for its double, so the two are not
   *     interchangeable.
   *   * no mask, no branch, no sign handling: the raw 64 bits are handed back.
   *     `BigInt.asUintN(64, ...)` states that width explicitly rather than
   *     trusting every writer to have stayed in range.
   *   * `const` matches the `__ZNK...` mangling; the body only reads, and the
   *     live function was measured not to modify a single byte of the object.
   *
   * @returns the accumulated pixel count (uint64).
   */
  pixels(): bigint {
    // @0x9e304 — movq 0x10(%rdi), %rax : one 64-bit load, no truncation.
    return BigInt.asUintN(64, this.pixels_at_0x10);
  }
}
