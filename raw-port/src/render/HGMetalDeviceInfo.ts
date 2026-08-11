// HGMetalDeviceInfo.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGMetalDeviceInfo::isApple() const           @Helium 0x1c5510
//     __ZNK17HGMetalDeviceInfo7isAppleEv
//   * HGMetalDeviceInfo::isIntel() const           @Helium 0x1c5500
//     __ZNK17HGMetalDeviceInfo7isIntelEv
//   * HGMetalDeviceInfo::isAMD() const             @Helium 0x1c54f0
//     __ZNK17HGMetalDeviceInfo5isAMDEv
//   * HGMetalDeviceInfo::isBuiltin() const         @Helium 0x1c55a0
//     __ZNK17HGMetalDeviceInfo9isBuiltinEv
//   * HGMetalDeviceInfo::isExternal() const        @Helium 0x1c55c0
//     __ZNK17HGMetalDeviceInfo10isExternalEv
//   * HGMetalDeviceInfo::isSlotted() const         @Helium 0x1c55b0
//     __ZNK17HGMetalDeviceInfo9isSlottedEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isAppleEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isIntelEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo5isAMDEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo9isBuiltinEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo10isExternalEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo9isSlottedEv.s    (isSlotted — read ONLY to
//                                                                       pin the +0x28 slot as an
//                                                                       enum by supplying the
//                                                                       third immediate (1); that
//                                                                       method is a separate
//                                                                       ledger entry and is NOT
//                                                                       ported here)
//
// -----------------------------------------------------------------------------
// FULL DISASM (6 lines, @0x1c5510..@0x1c551f)
// -----------------------------------------------------------------------------
//   __ZNK17HGMetalDeviceInfo7isAppleEv:
//     0x1c5510  pushq   %rbp
//     0x1c5511  movq    %rsp, %rbp
//     0x1c5514  cmpl    $0x106b, 0x20(%rdi)   ## imm = 0x106B ; *(u32*)(this+0x20) vs 0x106b
//     0x1c551b  sete    %al                   ; al = (*(u32*)(this+0x20) == 0x106b)  (ZF=1)
//     0x1c551e  popq    %rbp
//     0x1c551f  retq
//
// -----------------------------------------------------------------------------
// FULL DISASM (6 lines, @0x1c5500..@0x1c550f)
// -----------------------------------------------------------------------------
//   __ZNK17HGMetalDeviceInfo7isIntelEv:
//     0x1c5500  pushq   %rbp
//     0x1c5501  movq    %rsp, %rbp
//     0x1c5504  cmpl    $0x8086, 0x20(%rdi)   ## imm = 0x8086 ; *(u32*)(this+0x20) vs 0x8086
//     0x1c550b  sete    %al                   ; al = (*(u32*)(this+0x20) == 0x8086)  (ZF=1)
//     0x1c550e  popq    %rbp
//     0x1c550f  retq
//
// `isIntel` sits immediately BEFORE `isApple` in the text section (0x1c5500
// vs 0x1c5510, exactly 0x10 apart) and is byte-for-byte the same six
// instructions with one differing immediate: 0x8086 instead of 0x106b. Both
// read the SAME u32 field at +0x20, which identifies that slot as the GPU's
// PCI vendor id (0x106b = Apple Inc., 0x8086 = Intel Corporation) rather than
// a device-family ordinal. The field's TS name is left unchanged from the
// landed `isApple` port (renaming a landed member would be a regression).
//
// -----------------------------------------------------------------------------
// FULL DISASM (7 lines, @0x1c55c0..@0x1c55cd)
// -----------------------------------------------------------------------------
//   __ZNK17HGMetalDeviceInfo10isExternalEv:
//     0x1c55c0  pushq   %rbp
//     0x1c55c1  movq    %rsp, %rbp
//     0x1c55c4  cmpl    $0x2, 0x28(%rdi)      ; *(u32*)(this+0x28) - 2   (AT&T: dst - src)
//     0x1c55c8  sete    %al                   ; al = ZF = (field == 2)
//     0x1c55cb  popq    %rbp
//     0x1c55cc  retq
//     0x1c55cd  nopl    (%rax)                ; padding
//
// A SECOND field. `isApple`/`isIntel`/`isAMD` read the vendor id at +0x20;
// `isBuiltin`/`isExternal` read a different u32 at +0x28, and the third
// neighbour in the text section reads that SAME slot against 1:
//     isBuiltin()  @0x1c55a0 — `cmpl $0x0, 0x28(%rdi) ; sete %al`   (ported here)
//     isSlotted()  @0x1c55b0 — `cmpl $0x1, 0x28(%rdi) ; sete %al`   (ported here)
//     isExternal() @0x1c55c0 — `cmpl $0x2, 0x28(%rdi) ; sete %al`   (ported here)
// Three mutually exclusive equality tests against 0/1/2 on one dword, laid out
// 0x10 apart, identify +0x28 as a cached device-LOCATION enum (built-in / slot /
// external), NOT a flag word: were it a bitfield the compiler would emit a
// `testl $imm` + `setne`, not `cmpl`/`sete`.
//
// Note the contrast with `isRemovable()` @0x1c5560, which is NOT part of this
// family: it forwards to the ObjC MTLDevice at +0x10
// (`movq 0x10(%rdi),%rdi ; objc_msgSend isRemovable @0x1c556f`). So Helium caches
// the location enum at +0x28 but leaves removability to the live Metal object —
// which is why "external" cannot be modelled as "removable".
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero, for BOTH methods. Pure inline predicates — no callq, no external symbol
// stub, no indirect call. One 32-bit field compare and a `sete`. depgraph.py
// deps for __ZNK17HGMetalDeviceInfo7isAppleEv and
// __ZNK17HGMetalDeviceInfo7isIntelEv both report 0 in-scope callees, 0 externs,
// 0 indirect — wave-0 leaves.
//
// The compared constant 0x106b (4203 decimal) is the device-family / registry
// discriminator HGMetalDeviceInfo caches at +0x20 to mark an Apple-silicon GPU;
// `isApple()` is the strict-equality test against it (`cmpl` + `sete`, ZF path).
// We transcribe the exact `== 0x106b` compare — NOT a `>= family` range — since
// the machine uses `sete` (equality), not a `setae`/`setge` range test. The same
// reasoning applies verbatim to `isIntel()` and its 0x8086 immediate.

/**
 * `HGMetalDeviceInfo` — Helium's per-Metal-device capability record. Only the
 * field touched by `isApple()` (the u32 device-family discriminator at +0x20)
 * is decoded here; every other field is undecoded and NOT modelled (per Rule 5
 * — no fabricated fields).
 */
export class HGMetalDeviceInfo {
  /**
   * @Helium offset +0x20 — a `uint32_t` device-family / registry discriminator.
   * Read @0x1c5514 via `cmpl $0x106b, 0x20(%rdi)` inside `isApple()`. The
   * `cmpl` is a 32-bit compare, so the field is a u32. Its writer lives in a
   * different (not-yet-ported) HGMetalDeviceInfo method (device probing at
   * context creation) and is OUT OF SCOPE for this ledger unit — here the
   * field is only observed as a read.
   */
  deviceFamily_at_0x20: number = 0;

  /**
   * @Helium offset +0x28 — a `uint32_t` device-LOCATION discriminator, a
   * different slot from the +0x20 vendor id above. Read @0x1c55a4 via
   * `cmpl $0x0, 0x28(%rdi)` inside `isBuiltin()`, and — this is what pins it
   * as an enumerated location rather than a bool — read again at the same
   * offset and width by the sibling `isExternal()` @0x1c55c4 via
   * `cmpl $0x2, 0x28(%rdi)`, which tests it against 2. Two decoded compares
   * against two different immediates (0 and 2) on one 32-bit slot is the
   * evidence for "small enum", and it is all the evidence there is: no
   * enumerator NAMES are decoded here, and the writer lives in the
   * not-yet-ported device-probing path, so the field is only observed as a
   * read. `isExternal()` @0x1c55c0 is now ported in this same file (below), and
   * the third sibling `isSlotted()` @0x1c55b4 tests the SAME slot against 1
   * (`cmpl $0x1, 0x28(%rdi)`) — three mutually exclusive `cmpl`/`sete` equality
   * tests against 0/1/2 on one dword, which is what makes "small enum" rather
   * than "bit set" the reading: a bitfield would compile to `testl $imm` +
   * `setne`. `isSlotted()` remains a separate ledger entry, NOT ported here.
   */
  deviceLocation_at_0x28: number = 0;

  /**
   * `HGMetalDeviceInfo::isApple() const` — @Helium 0x1c5510
   * (__ZNK17HGMetalDeviceInfo7isAppleEv).
   *
   * Faithful transcription of the 6-line disassembly quoted in the header:
   *
   *   0x1c5514  cmpl $0x106b, 0x20(%rdi)   ; *(u32*)(this+0x20) - 0x106b
   *   0x1c551b  sete %al                   ; al = ZF = (field == 0x106b)
   *
   * Returns whether the cached device-family discriminator at this[+0x20]
   * equals 0x106b (the Apple-GPU marker). This is a STRICT equality test
   * (`sete`, ZF), not a range check — we mirror `=== 0x106b` exactly.
   *
   * No in-scope callees, no externs, no indirect calls (a pure field compare).
   * The `const` qualifier matches the `__ZNK...` mangling; the body only reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isAppleEv.s
   */
  isApple(): boolean {
    // @0x1c5514-0x1c551b: cmpl $0x106b, 0x20(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 field equals 0x106b — strict equality.
    return (this.deviceFamily_at_0x20 >>> 0) === 0x106b;
  }

  /**
   * `HGMetalDeviceInfo::isIntel() const` — @Helium 0x1c5500
   * (__ZNK17HGMetalDeviceInfo7isIntelEv).
   *
   * Faithful transcription of the 6-line disassembly quoted in the header:
   *
   *   0x1c5504  cmpl $0x8086, 0x20(%rdi)   ; *(u32*)(this+0x20) - 0x8086
   *   0x1c550b  sete %al                   ; al = ZF = (field == 0x8086)
   *
   * Returns whether the u32 at this[+0x20] equals 0x8086 — Intel's PCI vendor
   * id, the sibling marker to `isApple()`'s 0x106b. Strict equality (`sete`,
   * ZF), NOT a range test: the machine emits `sete`, never `setae`/`setge`,
   * so we mirror `=== 0x8086` exactly.
   *
   * Reads the same +0x20 slot as `isApple()` — no second field is introduced
   * (the two immediates are the only difference between the two bodies).
   *
   * No in-scope callees, no externs, no indirect calls (a pure field compare).
   * The `const` qualifier matches the `__ZNK...` mangling; the body only reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isIntelEv.s
   */
  isIntel(): boolean {
    // @0x1c5504-0x1c550b: cmpl $0x8086, 0x20(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 field equals 0x8086 — strict equality.
    return (this.deviceFamily_at_0x20 >>> 0) === 0x8086;
  }

  /**
   * `HGMetalDeviceInfo::isAMD() const` — @Helium 0x1c54f0
   * (__ZNK17HGMetalDeviceInfo5isAMDEv).
   *
   * Faithful transcription of the 6-line disassembly
   * (raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo5isAMDEv.s):
   *
   *   0x1c54f0  pushq %rbp
   *   0x1c54f1  movq  %rsp, %rbp
   *   0x1c54f4  cmpl  $0x1002, 0x20(%rdi)  ; *(u32*)(this+0x20) - 0x1002
   *   0x1c54fb  sete  %al                  ; al = ZF = (field == 0x1002)
   *   0x1c54fe  popq  %rbp
   *   0x1c54ff  retq
   *
   * Returns whether the u32 at this[+0x20] equals 0x1002 — the PCI vendor id
   * of Advanced Micro Devices (historically ATI Technologies, whose id AMD
   * kept after the acquisition). It is the third member of the same family as
   * `isApple()` (0x106b) and `isIntel()` (0x8086), and it reads the SAME +0x20
   * slot; the immediate is the only difference between the three bodies.
   *
   * The three sit back to back in the text section, exactly 0x10 bytes apart —
   * isAMD @0x1c54f0, isIntel @0x1c5500, isApple @0x1c5510 — further evidence
   * that they are sibling one-liners over one shared field.
   *
   * Strict equality (`sete`, ZF), NOT a range test: the machine emits `sete`,
   * never `setae`/`setge`, so we mirror `=== 0x1002` exactly.
   *
   * No in-scope callees, no externs, no indirect calls (a pure field compare).
   * `depgraph.py deps __ZNK17HGMetalDeviceInfo5isAMDEv` reports nothing at all.
   * The `const` qualifier matches the `__ZNK...` mangling; the body only reads.
   */
  isAMD(): boolean {
    // @0x1c54f4-0x1c54fb: cmpl $0x1002, 0x20(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 field equals 0x1002 — strict equality.
    return (this.deviceFamily_at_0x20 >>> 0) === 0x1002;
  }

  /**
   * `HGMetalDeviceInfo::isBuiltin() const` — @Helium 0x1c55a0
   * (__ZNK17HGMetalDeviceInfo9isBuiltinEv).
   *
   * Faithful transcription of the whole 8-line disassembly
   * (raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo9isBuiltinEv.s):
   *
   *   0x1c55a0  pushq %rbp
   *   0x1c55a1  movq  %rsp, %rbp
   *   0x1c55a4  cmpl  $0x0, 0x28(%rdi)   ; *(u32*)(this+0x28) - 0
   *   0x1c55a8  sete  %al                ; al = ZF = (field == 0)
   *   0x1c55ab  popq  %rbp
   *   0x1c55ac  retq
   *   0x1c55ad  nopl  (%rax)             ; padding — not executed
   *
   * Same one-compare shape as `isApple`/`isIntel`/`isAMD` above, but over a
   * DIFFERENT field: those three read the vendor id at +0x20, this one reads
   * the location discriminator at +0x28 (see the field doc). Getting that
   * wrong is the obvious failure mode for a body this small, so the oracle
   * below scores it explicitly.
   *
   * Strict equality against ZERO (`cmpl $0x0` + `sete`) — NOT a "non-zero
   * means true" bool test, which would be `testl`/`setne` and is the opposite
   * answer on every non-zero input. The compare is `cmpl`, so it is 32 bits
   * wide: a value whose low 16 bits are zero but whose high half is not (e.g.
   * 0x10000) is NOT builtin.
   *
   * No in-scope callees, no externs, no indirect calls — `depgraph.py deps
   * __ZNK17HGMetalDeviceInfo9isBuiltinEv` reports nothing at all. The `const`
   * qualifier matches the `__ZNK...` mangling; the body only reads.
   *
   * DIFFERENTIAL against the live binary (exported `T` @0x1c55a0, so dlsym
   * reaches it; run under `arch -x86_64` because every address here is an
   * x86_64 offset — a native arm64 process would be checking this port against
   * code it did not transcribe):
   * raw-port/re/oracle/HGMetalDeviceInfo_isBuiltin_oracle.py calls the real
   * symbol on a synthetic 0x40-byte record (every undecoded byte poisoned with
   * 0xEE) over 1,024 values of the +0x28 slot — 0..8, 0xffff, 0x10000,
   * 0xffff0000, 0x7fffffff, 0x80000000, 0xffffffff crossed with vendor ids
   * {0, 0x106b, 0x8086, 0x1002}, then seeded random u32s — with the +0x20
   * vendor slot varied independently to prove it is not consulted: 1,024
   * cases, 4 TRUE / 1,020 FALSE, **0 divergences**. (The 4 TRUEs are exactly
   * the four `loc == 0` records, one per vendor id — the answer does not move
   * when the vendor slot does.)
   * NEGATIVE CONTROLS (measured on that same corpus): reading the +0x20 vendor
   * slot instead of +0x28 diverges on 474 cases; `!= 0` instead of `== 0` (the
   * `testl`/`setne` misread) diverges on all 1,024; comparing against 2 — the
   * sibling `isExternal` immediate @0x1c55c4 — diverges on 8; and a 16-bit-wide
   * compare (`(field & 0xffff) === 0`) diverges on 12, the low-half-zero cases
   * the corpus carries precisely to pin the width.
   */
  isBuiltin(): boolean {
    // @0x1c55a4-0x1c55a8: cmpl $0x0, 0x28(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 location field equals 0 — strict
    //   equality on the full 32 bits, not a truthiness test.
    return (this.deviceLocation_at_0x28 >>> 0) === 0;
  }

  /**
   * `HGMetalDeviceInfo::isExternal() const` — @Helium 0x1c55c0
   * (__ZNK17HGMetalDeviceInfo10isExternalEv).
   *
   * Faithful transcription of the 7-line disassembly quoted in the header
   * (raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo10isExternalEv.s):
   *
   *   0x1c55c4  cmpl $0x2, 0x28(%rdi)   ; *(u32*)(this+0x28) - 2
   *   0x1c55c8  sete %al                ; al = ZF = (field == 2)
   *
   * Returns whether the cached device-location enum at this[+0x28] equals 2 —
   * the "external" enumerator, as fixed by the sibling pair `isBuiltin()`
   * (== 0, @0x1c55a4) and `isSlotted()` (== 1, @0x1c55b4) reading the same slot.
   * STRICT equality (`sete`, ZF), not a range or truthiness test: the machine
   * emits `cmpl`/`sete`, never `setae`/`setne`, so `=== 2` is mirrored exactly.
   * Note this reads a DIFFERENT field from `isApple`/`isIntel`/`isAMD`, which
   * test the vendor id at +0x20.
   *
   * No in-scope callees, no externs, no indirect calls (a pure field compare);
   * `depgraph.py deps __ZNK17HGMetalDeviceInfo10isExternalEv` reports nothing.
   * The `const` qualifier matches the `__ZNK...` mangling; the body only reads.
   *
   * ORACLE: verified against the live Helium binary. The symbol is EXPORTED
   * (`nm -arch x86_64` type `T` @0x1c55c0), so the harness dlopens Helium under
   * `arch -x86_64 /usr/bin/python3` (the port is transcribed from the x86_64
   * slice; calling the arm64 image would compare against a body this port never
   * read) and calls the real method on a 0x200-byte object pre-filled with 0x5A,
   * with the location dword planted at +0x28. 422 cases (0..5, INT_MAX,
   * 0x80000000, 0xffffffff, 0xfffffffe, width-probing values whose low byte or
   * low 16 bits are 2 with a non-zero upper half, 200 random u32s and 200 draws
   * from {0,1,2,3}): 422/422 identical to this port, 0 objects mutated (it is a
   * pure read), and on every case the real `isBuiltin`/`isSlotted` answered
   * `loc==0`/`loc==1` — i.e. the three really are one dword at +0x28, never two
   * true at once.
   * NEGATIVE CONTROLS (measured, same 422 cases): truthiness instead of `== 2`
   * -> 320 wrong; a `>= 2` range test -> 271 wrong; comparing against 1 -> 102
   * wrong; reading the +0x20 vendor slot -> 53 wrong; a 16-bit compare instead
   * of the machine's 32-bit `cmpl` -> 5 wrong (that last control is why the
   * corpus carries the 0x____0002 values: without them it proves nothing).
   */
  isExternal(): boolean {
    // @0x1c55c4-0x1c55c8: cmpl $0x2, 0x28(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 field equals 2 — strict equality, full
    //   32-bit width (`>>> 0` models the u32 read the `cmpl` performs).
    return (this.deviceLocation_at_0x28 >>> 0) === 2;
  }

  /**
   * `HGMetalDeviceInfo::isSlotted() const` — @Helium 0x1c55b0
   * (__ZNK17HGMetalDeviceInfo9isSlottedEv).
   *
   * Faithful transcription of the 6-line body
   * (raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo9isSlottedEv.s):
   *
   *   0x1c55b0  pushq %rbp
   *   0x1c55b1  movq  %rsp, %rbp
   *   0x1c55b4  cmpl  $0x1, 0x28(%rdi)   ; AT&T dst-src: *(u32*)(this+0x28) - 1
   *   0x1c55b8  sete  %al                ; al = ZF = (field == 1)
   *   0x1c55bb  popq  %rbp
   *   0x1c55bc  retq
   *
   * The middle member of the location trio: `isBuiltin` @0x1c55a0 tests the
   * same dword against 0 and `isExternal` @0x1c55c0 against 2, both already
   * landed above. Strict equality (`sete`, ZF), never a range test — the
   * machine emits `sete`, not `setae`/`setge`.
   *
   * IT READS THE LANDED `deviceLocation_at_0x28`, and that is the whole point
   * of this method's history: the first version of this port declared a SECOND
   * TS field over the same +0x28 dword and read that one, which silently broke
   * the mutual exclusion the machine gets for free from there being one slot.
   * Review caught it by execution. One machine field is one TS property — see
   * the OZRenderParams +0x1e5 entry in OPS_LOG for the same trap landed twice.
   *
   * No callees of any kind: `depgraph.py deps` reports nothing. The `__ZNK`
   * mangling matches the `const` qualifier; the body only reads.
   *
   * ORACLE — raw-port/re/oracle/HGMetalDeviceInfo_location_oracle.py
   *   (+ _driver.mts; run with arch -x86_64 /usr/bin/python3, because every
   *   address here is x86_64 and an arm64 image would be a different body from
   *   the one transcribed).
   * All three symbols are EXPORTED (`T`), so the harness dlopens Helium and
   * calls the real `isBuiltin` / `isSlotted` / `isExternal` on a 0x200-byte
   * object pre-filled with 0x5A, planting the dword at +0x28. It first checks
   * the opcode bytes at each entry point, which read the immediates straight
   * out of the instruction stream and are the cleanest possible proof of the
   * trio: 55 48 89 e5 83 7f 28 **00** / **01** / **02** — `cmpl $imm, 0x28(%rdi)`
   * at all three addresses, differing only in that last byte.
   * MEASURED over 416 cases (0..5, INT_MAX, 0x80000000, 0xffffffff, 0xfffffffe,
   * six width probes of the form 0x____0001 whose low byte or low 16 bits are 1
   * with a non-zero upper half, 200 random u32 and 200 draws from {0,1,2,3}):
   *   * isSlotted 416/416 identical to this port, and isBuiltin and isExternal
   *     416/416 as well — all three driven from the ONE landed field;
   *   * at most one of the three was ever true (0 cases with two), and the
   *     object was never mutated: they are pure reads of one dword;
   *   * THE REJECTED ARRANGEMENT is run as a control rather than described. With
   *     a second TS property for +0x28: a caller writing only the landed field
   *     makes isSlotted diverge on 48 of 416 cases (every loc == 1), a caller
   *     writing only the alias makes isBuiltin diverge on 356 of 416, and only a
   *     caller that redundantly writes BOTH names agrees (0 of 416). That is
   *     review's finding reproduced — and the reason the aliased version could
   *     show "0 divergences" while being wrong.
   * NEGATIVE CONTROLS for this method (same 416 cases): truthiness instead of
   * `=== 1` -> 308 wrong; a `>= 1` range test -> 308 wrong; comparing against 0
   * (isBuiltin's immediate) -> 108 wrong; reading the +0x20 vendor slot -> 48
   * wrong; a 16-bit compare instead of the machine's 32-bit `cmpl` -> 5 wrong,
   * which is exactly what the 0x____0001 probes exist to catch.
   */
  isSlotted(): boolean {
    // @0x1c55b4-0x1c55b8: cmpl $0x1, 0x28(%rdi) ; sete %al
    //   ZF (sete) is set iff the u32 location tag equals 1 — strict equality,
    //   full 32-bit width (`>>> 0` models the u32 the `cmpl` reads).
    return (this.deviceLocation_at_0x28 >>> 0) === 1;
  }
}
