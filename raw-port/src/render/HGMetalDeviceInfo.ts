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
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isAppleEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isIntelEv.s
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo5isAMDEv.s
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
}
