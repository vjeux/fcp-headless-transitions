// Panner — Flexo class. A leaf class holding one UI-mode field and a
// four-CC-tested SetAlgorithm probe. Four decoded methods; none of them
// touch anything but this + the single 32-bit field at offset 0x1c.
//
// Framework: Flexo.framework
// Disassembly:
//   raw-port/re/disasm/Flexo.Panner.SetPannerUIMode.s
//   raw-port/re/disasm/Flexo.Panner.Reset.s
//   raw-port/re/disasm/Flexo.Panner.SetAlgorithm.s
//   raw-port/re/disasm/Flexo.Panner.GetPannerUIMode.s
//
// Recovered instance layout (from the four decoded methods — only offset
// touched is 0x1c; everything else is opaque and NOT enumerated here):
//   +0x1c  uint32   uiMode          // written by SetPannerUIMode; read by GetPannerUIMode
//
// Note the class is BASE-like: SetPannerUIMode / GetPannerUIMode / Reset /
// SetAlgorithm are all non-virtual (no vtable dispatch inside them), which
// suggests Panner is an abstract-ish base whose real polymorphism lives in
// derived classes (MonoPanner / StereoPanner / SurroundPanner — all sitting
// immediately after Panner's methods in the .text and touching richer state
// like 0x20/0x28/0x30 offsets). Those derived classes are NOT this task.
//
// Frontier callees: NONE. All 4 methods are self-contained ALU/store/load.

/**
 * Panner — leaf/base class for the audio panner family.
 * Only field decoded is the uint32 UI-mode at +0x1c. All other offsets remain
 * opaque; derived classes (MonoPanner/StereoPanner/SurroundPanner) touch them.
 */
export class Panner {
  /**
   * +0x1c uint32 — UI mode. Written by SetPannerUIMode @0x1251394 and read by
   * GetPannerUIMode @0x12514f4. No other Panner method reads it.
   */
  uiMode: number = 0;

  /**
   * SetPannerUIMode(uint32 mode) -> void
   *
   * @Flexo 0x0000000001251390 (__ZN6Panner15SetPannerUIModeEj)
   *
   * Body (6 instructions):
   *   @0x1251390  pushq %rbp
   *   @0x1251391  movq  %rsp, %rbp
   *   @0x1251394  movl  %esi, 0x1c(%rdi)   ; this->uiMode = mode
   *   @0x1251397  popq  %rbp
   *   @0x1251398  retq
   *
   * The `mode` param is passed as unsigned int in %esi (arg2 for a member
   * function; %rdi is `this`). The store is 32-bit (movl), so uiMode is a
   * uint32 field. TS-side we store as a JS number and normalize with `>>> 0`
   * on read/write to keep it in uint32 range.
   */
  SetPannerUIMode(mode: number): void {
    // @0x1251394  movl %esi, 0x1c(%rdi)
    this.uiMode = mode >>> 0;
  }

  /**
   * Reset() -> void
   *
   * @Flexo 0x00000000012514b0 (__ZN6Panner5ResetEv)
   *
   * Body (3 real instructions — a NO-OP function shell):
   *   @0x12514b0  pushq %rbp
   *   @0x12514b1  movq  %rsp, %rbp
   *   @0x12514b4  popq  %rbp
   *   @0x12514b5  retq
   *
   * This is the base-class no-op that derived classes override. Notably,
   * StereoPanner::Reset() @0x1251500 DOES do work (it broadcast-copies
   * this->[0x30..0x3f] into this->[0x20..0x2f]) — so the base-class Reset()
   * being empty is a deliberate "derived classes may override" pattern.
   */
  Reset(): void {
    // No body — the C++ symbol is literally an empty function.
  }

  /**
   * SetAlgorithm(uint32 fourcc) -> bool
   *
   * @Flexo 0x00000000012514c0 (__ZN6Panner12SetAlgorithmEj)
   *
   * Body:
   *   @0x12514c0  pushq %rbp
   *   @0x12514c1  movq  %rsp, %rbp
   *   @0x12514c4  cmpl  $0x64666c74, %esi   ; compare fourcc arg to 'dflt'
   *   @0x12514ca  sete  %al                  ; al = (fourcc == 'dflt') ? 1 : 0
   *   @0x12514cd  popq  %rbp
   *   @0x12514ce  retq
   *
   * The literal 0x64666c74 = FourCharCode 'dflt' (big-endian byte layout in
   * the source: 'd'<<24 | 'f'<<16 | 'l'<<8 | 't' = 0x64666c74). Under macOS
   * FourCharCode conventions this is the "default algorithm" ID. The base
   * Panner accepts ONLY 'dflt' as its algorithm — any other FourCharCode
   * returns false. This is again a "derived classes override" hook.
   *
   * NOTE the function's declared return type in the export symbol is void
   * (the C++ signature is SetAlgorithm(unsigned int)), but the body sets
   * %al (low byte of the return register), which strongly indicates the
   * original C++ signature is actually `bool SetAlgorithm(uint32)` and the
   * exported symbol just doesn't encode the return type. We preserve that
   * semantic: return the bool.
   */
  SetAlgorithm(fourcc: number): boolean {
    // @0x12514c4  cmpl $0x64666c74, %esi  ; @0x12514ca sete %al
    // 0x64666c74 = 'dflt' as a FourCharCode (uint32 big-endian ASCII).
    return (fourcc >>> 0) === 0x64666c74;
  }

  /**
   * GetPannerUIMode() -> uint32
   *
   * @Flexo 0x00000000012514f0 (__ZN6Panner15GetPannerUIModeEv)
   *
   * Body:
   *   @0x12514f0  pushq %rbp
   *   @0x12514f1  movq  %rsp, %rbp
   *   @0x12514f4  movl  0x1c(%rdi), %eax   ; return this->uiMode
   *   @0x12514f7  popq  %rbp
   *   @0x12514f8  retq
   */
  GetPannerUIMode(): number {
    // @0x12514f4  movl 0x1c(%rdi), %eax
    return this.uiMode >>> 0;
  }
}
