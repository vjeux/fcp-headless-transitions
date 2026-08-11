// FFAudioPlaybackScrubBuffer.ts — Flexo FFAudioPlaybackScrubBuffer (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE method:
//
//   __ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy
//     — FFAudioPlaybackScrubBuffer::calculateBufferPosFrame(unsigned long long) const
//       @Flexo 0xd0e230
//
// This is a FRESH class (not previously on origin/main). Every other
// FFAudioPlaybackScrubBuffer method is a separate ledger entry and must be
// ADDED to this file (additive extension only), never rewritten.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym \
//     __ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy Flexo
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy.s — 13 lines)
// -----------------------------------------------------------------------------
//   __ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy:
//     0xd0e230  pushq %rbp                 ; frame prologue
//     0xd0e231  movq  %rsp, %rbp
//     0xd0e234  movq  %rsi, %rax           ; rax = frame        (arg1, u64, System-V %rsi)
//     0xd0e237  movq  0x70(%rdi), %rcx     ; rcx = this->headFrame_at_0x70
//     0xd0e23b  cmpq  %rcx, %rsi           ; AT&T: flags on (rsi - rcx) = frame - head
//     0xd0e23e  jae   0xd0e244             ; CF=0 -> UNSIGNED frame >= head: skip the wrap fixup
//     0xd0e240  subq  0x60(%rdi), %rcx     ; rcx = head - this->spanFrames_at_0x60   (u64, wraps)
//     0xd0e244  subq  %rcx, %rax           ; rax = frame - rcx                        (u64, wraps)
//     0xd0e247  addq  0x68(%rdi), %rax     ; rax += this->baseFrame_at_0x68           (u64, wraps)
//     0xd0e24b  popq  %rbp                 ; frame epilogue
//     0xd0e24c  retq                       ; return rax (u64)
//     0xd0e24d  nopl  (%rax)               ; alignment pad — no effect
//
// FRONTIER CALLEES — none. Pure integer arithmetic on three fields; no calls,
// no in-scope callee, no extern, no indirect or virtual dispatch
// (`depgraph.py deps __ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy`
// lists nothing).
//
// DECODE NOTES
//   * `jae` is the UNSIGNED "above or equal" (CF=0), and the mangled parameter
//     type is `y` = `unsigned long long`, so both the compare and every
//     arithmetic step below are 64-bit UNSIGNED. This port therefore uses
//     `bigint` masked to 64 bits at each step (PORTING_SPEC Rule 4: int64 ->
//     bigint where the value can exceed 2^53 — a frame counter certainly can),
//     which is also what reproduces the WRAPAROUND that `subq` performs and a
//     JS `number` could not.
//   * AT&T operand order (PORTING_SPEC's cheat-sheet): `cmpq %rcx, %rsi`
//     computes dst - src = rsi - rcx = frame - head, so `jae` is taken exactly
//     when `frame >= head` unsigned. The fixup at 0xd0e240 therefore runs on the
//     FALLTHROUGH, i.e. when `frame < head`.
//   * Both branches converge at 0xd0e244; the only difference is whether %rcx
//     is `head` or `head - span`. The port keeps that shape rather than
//     algebraically folding the two arms, so the instruction correspondence
//     survives.
//
// STRUCT LAYOUT (partial — recovered only from this method)
//   FFAudioPlaybackScrubBuffer {
//     ...
//     +0x60  u64  spanFrames  ; subq 0x60(%rdi), %rcx @0xd0e240
//     +0x68  u64  baseFrame   ; addq 0x68(%rdi), %rax @0xd0e247
//     +0x70  u64  headFrame   ; movq 0x70(%rdi), %rcx @0xd0e237
//     ...
//   }
// Only these three slots are derivable here; the rest of the object is OPAQUE
// (undecoded) and intentionally NOT modelled — future ports of sibling methods
// will add fields as their addresses are read. The names describe the roles the
// arithmetic implies (a ring buffer's head, its span, and the frame number its
// storage starts at); nothing outside this method is claimed about them.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function, not just re-read:
//   * Flexo IS dlopen-able outside the app bundle, contrary to the standing
//     note that it is not. The blocker was only @rpath resolution, and
//     DYLD_FRAMEWORK_PATH cannot fix it because the hardened system Python
//     strips DYLD_*. What works instead: walk `otool -L`'s @rpath entries and
//     `ctypes.CDLL(<absolute path>, RTLD_GLOBAL)` each dependency depth-first,
//     then load Flexo — dyld then satisfies every @rpath from images already in
//     the process. 36 images preload; Flexo loads.
//   * Run under `arch -x86_64 /usr/bin/python3` (OPS_LOG: the port is
//     transcribed from the x86_64 slice) and resolve this LOCAL (`nm` type `t`)
//     symbol as `nm -n -arch x86_64` vmaddr 0xd0e230 + the dyld image slide —
//     NOT the bare `nm -n` that fct/parity/local_call uses, which reports the
//     ARM64 slice even from a Rosetta process.
//   * 4,096 fuzz cases over the three fields and the argument, drawn from 0, 1,
//     2^63, 2^64-1, small values, values straddling `head` (exactly at it, one
//     below, one above) and random u64s, so both arms and the subtraction
//     wraparound are exercised:
//     RESULT: 4096/4096 returned values BIT-IDENTICAL to Final Cut Pro.
//     NEGATIVE CONTROLS (measured, so the oracle is shown to have teeth):
//       reading `jae` as `ja` (`<` -> `<=` at the bound)   -> 999 wrong
//       making the head-minus-span fixup unconditional     -> 2430 wrong
//       dropping the u64 mask on the final `addq`          -> 585 wrong
//       never applying the fixup (always subtract `head`)  -> 1526 wrong

/** 64-bit unsigned wraparound mask — every `subq`/`addq` below truncates to it. */
const U64 = 0xffffffffffffffffn;

/**
 * `FFAudioPlaybackScrubBuffer` — Flexo audio scrub playback ring buffer.
 *
 * Only the +0x60 / +0x68 / +0x70 slots and the one accessor below are decoded
 * here; all other fields are undecoded and omitted. They will be added
 * additively as sibling methods are ported.
 */
export class FFAudioPlaybackScrubBuffer {
  /**
   * (this+0x60) — the buffer's span in frames, subtracted from the head to get
   * the frame number the stored window starts at. Read as a qword
   * (`subq 0x60(%rdi), %rcx` @Flexo 0xd0e240), only on the `frame < head` arm.
   */
  spanFrames_at_0x60 = 0n;

  /**
   * (this+0x68) — the buffer position that the window's start maps to; added to
   * the computed offset to produce the result. Read as a qword
   * (`addq 0x68(%rdi), %rax` @Flexo 0xd0e247) on both arms.
   */
  baseFrame_at_0x68 = 0n;

  /**
   * (this+0x70) — the head frame the incoming frame number is compared against.
   * Read as a qword (`movq 0x70(%rdi), %rcx` @Flexo 0xd0e237) and used both as
   * the comparison bound (`cmpq %rcx, %rsi` @0xd0e23b) and as the subtrahend.
   */
  headFrame_at_0x70 = 0n;

  /**
   * `FFAudioPlaybackScrubBuffer::calculateBufferPosFrame(unsigned long long) const`
   *   — @Flexo 0xd0e230
   *     (__ZNK26FFAudioPlaybackScrubBuffer23calculateBufferPosFrameEy).
   *
   * Faithful line-for-line transcription of the 13-line disassembly quoted in
   * the file header:
   *
   *   @0xd0e234  movq %rsi, %rax        ; rax = frame
   *   @0xd0e237  movq 0x70(%rdi), %rcx  ; rcx = headFrame
   *   @0xd0e23b  cmpq %rcx, %rsi        ; frame - headFrame (unsigned)
   *   @0xd0e23e  jae  0xd0e244          ; frame >= headFrame -> skip the fixup
   *   @0xd0e240  subq 0x60(%rdi), %rcx  ; rcx = headFrame - spanFrames
   *   @0xd0e244  subq %rcx, %rax        ; rax = frame - rcx
   *   @0xd0e247  addq 0x68(%rdi), %rax  ; rax += baseFrame
   *   @0xd0e24c  retq                   ; return rax
   *
   * All arithmetic is 64-bit UNSIGNED and wraps; see the DECODE NOTES above.
   *
   * @param frame the `unsigned long long` arriving in %rsi.
   * @returns the `unsigned long long` in %rax.
   */
  calculateBufferPosFrame(frame: bigint): bigint {
    // @0xd0e234 movq %rsi, %rax — rax starts as the argument.
    let rax = frame & U64;
    // @0xd0e237 movq 0x70(%rdi), %rcx — rcx = headFrame.
    let rcx = this.headFrame_at_0x70 & U64;
    // @0xd0e23b/@0xd0e23e cmpq %rcx, %rsi ; jae — UNSIGNED compare; the fixup
    //   below is the FALLTHROUGH, taken only when frame < headFrame.
    if ((frame & U64) < rcx) {
      // @0xd0e240 subq 0x60(%rdi), %rcx — rcx = headFrame - spanFrames (wraps).
      rcx = (rcx - (this.spanFrames_at_0x60 & U64)) & U64;
    }
    // @0xd0e244 subq %rcx, %rax — rax = frame - rcx (wraps).
    rax = (rax - rcx) & U64;
    // @0xd0e247 addq 0x68(%rdi), %rax — rax += baseFrame (wraps).
    rax = (rax + (this.baseFrame_at_0x68 & U64)) & U64;
    // @0xd0e24c retq — return rax.
    return rax;
  }
}
