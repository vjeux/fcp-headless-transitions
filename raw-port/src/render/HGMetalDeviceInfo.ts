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
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK17HGMetalDeviceInfo7isAppleEv.s
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
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. Pure inline predicate — no callq, no external symbol stub, no indirect
// call. One 32-bit field compare and a `sete`. depgraph.py deps for
// __ZNK17HGMetalDeviceInfo7isAppleEv reports 0 in-scope callees, 0 externs,
// 0 indirect — a wave-0 leaf.
//
// The compared constant 0x106b (4203 decimal) is the device-family / registry
// discriminator HGMetalDeviceInfo caches at +0x20 to mark an Apple-silicon GPU;
// `isApple()` is the strict-equality test against it (`cmpl` + `sete`, ZF path).
// We transcribe the exact `== 0x106b` compare — NOT a `>= family` range — since
// the machine uses `sete` (equality), not a `setae`/`setge` range test.

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
}
