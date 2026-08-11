// FFMXFTimecodeCursor.ts — Flexo FFMXFTimecodeCursor (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE accessor:
//
//   __ZNK19FFMXFTimecodeCursor21presentationTimeStampEv
//     — FFMXFTimecodeCursor::presentationTimeStamp() const   @Flexo 0xde8b60
//
// This is a FRESH class (not previously on origin/main). Every other
// FFMXFTimecodeCursor method is a separate ledger entry and must be ADDED to
// this file (additive extension only), never rewritten.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym \
//     __ZNK19FFMXFTimecodeCursor21presentationTimeStampEv Flexo
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZNK19FFMXFTimecodeCursor21presentationTimeStampEv.s — 11 lines)
// -----------------------------------------------------------------------------
//   __ZNK19FFMXFTimecodeCursor21presentationTimeStampEv:
//     0xde8b60  pushq  %rbp                ; frame prologue
//     0xde8b61  movq   %rsp, %rbp
//     0xde8b64  movq   %rdi, %rax          ; return the sret pointer in %rax, as the
//                                          ;   System-V ABI requires for a MEMORY-class
//                                          ;   return value
//     0xde8b67  movq   0x18(%rsi), %rcx    ; rcx = *(u64*)(this + 0x18)   — CMTime.epoch
//     0xde8b6b  movq   %rcx, 0x10(%rdi)    ; out[+0x10] = epoch
//     0xde8b6f  movups 0x8(%rsi), %xmm0    ; xmm0 = *(u128*)(this + 0x08) — value+timescale+flags
//     0xde8b73  movups %xmm0, (%rdi)       ; out[+0x00..0x10) = that 16-byte block
//     0xde8b76  popq   %rbp                ; frame epilogue
//     0xde8b77  retq                       ; return (the struct is in *out)
//     0xde8b78  nopl   (%rax,%rax)         ; alignment pad — no effect
//
// FRONTIER CALLEES — none. A 24-byte struct copy; no calls, no branches, no
// arithmetic, no in-scope callee, no extern, no indirect or virtual dispatch
// (`depgraph.py deps __ZNK19FFMXFTimecodeCursor21presentationTimeStampEv`
// lists nothing).
//
// DECODE NOTES
//   * The `const` method takes `this` in %rsi, not %rdi, because the return type
//     is MEMORY-class: sizeof(CMTime) == 24 > 16, so the System-V ABI passes a
//     hidden pointer to the caller's result slot in %rdi and shifts `this` to
//     %rsi. `movq %rdi, %rax` @0xde8b64 is the mandated "return the sret pointer"
//     step. In TS the same thing is expressed by RETURNING the struct by value.
//   * The 16-byte `movups` at +0x08 plus the 8-byte `movq` at +0x18 cover
//     this+0x08..this+0x20 = exactly 24 bytes = one CMTime, and they land at
//     out+0x00..0x10 and out+0x10 respectively — an identity copy, no field
//     reordering. That is what identifies the +0x08 slot as a CMTime (see
//     raw-port/src/infra/CMTime.ts for the layout: value@+0, timescale@+8,
//     flags@+0xc, epoch@+0x10).
//   * `movups` is the UNALIGNED form, which says nothing about the value and is
//     noted only so it is not read as a decode error.
//   * The epoch qword is stored BEFORE the 16-byte block. The order is
//     unobservable for a copy into fresh storage, but it is preserved below so
//     the instruction correspondence is one-to-one.
//
// STRUCT LAYOUT (partial — recovered only from this accessor)
//   FFMXFTimecodeCursor {
//     +0x00  ...  OPAQUE (undecoded — this method never touches it)
//     +0x08  CMTime presentationTimeStamp   ; 24 bytes, read as
//              +0x08 int64  value           ;   movups 0x8(%rsi) @0xde8b6f
//              +0x10 int32  timescale       ;   (same 16-byte block)
//              +0x14 uint32 flags           ;   (same 16-byte block)
//              +0x18 int64  epoch           ;   movq 0x18(%rsi) @0xde8b67
//     ...
//   }
// Only this range is derivable from this method; everything else is OPAQUE and
// intentionally NOT modelled.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function, not just re-read. Flexo is dlopen-able
// outside the app bundle once every `otool -L` @rpath dependency is CDLL'd by
// absolute path depth-first (DYLD_FRAMEWORK_PATH cannot do it: hardened system
// Python strips DYLD_*); the harness runs under `arch -x86_64 /usr/bin/python3`
// and resolves this LOCAL (`nm` type `t`) symbol as `nm -n -arch x86_64` vmaddr
// 0xde8b60 + the dyld image slide. See FFAudioPlaybackScrubBuffer.ts for the
// same recipe and for why the bare `nm -n` in fct/parity/local_call is wrong.
// 2,048 fuzz cases: the 24 bytes at this+0x08 filled with random and extreme
// values (0, 1, INT64_MIN/MAX, UINT32_MAX timescales, every CMTime flag bit)
// and EVERY OTHER byte of the object filled with fresh random noise each case.
// That noise is what validates the OFFSETS as well as the arithmetic: the
// harness writes the CMTime at +0x08 because this port claims it lives there,
// so if the claim were wrong FCP would have copied noise out and no case could
// match. RESULT: 2048/2048 returned CMTimes BIT-IDENTICAL to Final Cut Pro
// across all four fields.
// NEGATIVE CONTROLS (measured — mutations expressible in a field-modelled
// port; a raw byte-offset mutation is not, which is what the noise fill covers
// instead): swapping timescale and flags -> 2029 of 2048 wrong; returning a
// zero epoch -> 1937 wrong; using `value` as the epoch -> 2003 wrong.

import type { CMTime } from "../infra/CMTime.js";

/**
 * `FFMXFTimecodeCursor` — Flexo MXF timecode-track cursor.
 *
 * Only the CMTime at +0x08 and its accessor are decoded here; all other fields
 * are undecoded and omitted. They will be added additively as sibling methods
 * are ported.
 */
export class FFMXFTimecodeCursor {
  /**
   * (this+0x08) — the cursor's presentation timestamp, a 24-byte CMTime.
   *
   * Its extent and offset are pinned by the two loads that copy it out whole:
   * `movups 0x8(%rsi), %xmm0` @Flexo 0xde8b6f takes bytes +0x08..+0x18
   * (value, timescale, flags) and `movq 0x18(%rsi), %rcx` @Flexo 0xde8b67 takes
   * the +0x18 epoch qword — 24 contiguous bytes, exactly sizeof(CMTime).
   *
   * The writer of this slot is FRONTIER (not decoded here), so the initial
   * value below is the all-zero CMTime rather than anything claimed about the
   * real object; only the read is ported.
   */
  presentationTimeStamp_at_0x08: CMTime = {
    value: 0n,
    timescale: 0,
    flags: 0,
    epoch: 0n,
  };

  /**
   * `FFMXFTimecodeCursor::presentationTimeStamp() const` — @Flexo 0xde8b60
   *   (__ZNK19FFMXFTimecodeCursor21presentationTimeStampEv).
   *
   * Faithful line-for-line transcription of the 11-line disassembly quoted in
   * the file header: copy the 24-byte CMTime at this+0x08 into the caller's
   * result slot and return it.
   *
   *   @0xde8b64  movq   %rdi, %rax        ; sret pointer returned in %rax —
   *                                       ;   expressed here by returning the
   *                                       ;   struct by value
   *   @0xde8b67  movq   0x18(%rsi), %rcx  ; rcx = epoch
   *   @0xde8b6b  movq   %rcx, 0x10(%rdi)  ; out.epoch = rcx
   *   @0xde8b6f  movups 0x8(%rsi), %xmm0  ; xmm0 = value|timescale|flags
   *   @0xde8b73  movups %xmm0, (%rdi)     ; out.value/timescale/flags = xmm0
   *   @0xde8b77  retq
   *
   * No callees, no branches, no arithmetic — a plain struct read. The returned
   * object is a fresh copy, matching the by-value C++ return: mutating it must
   * not write through to the cursor, which is why the fields are spread into a
   * new object literal rather than the stored one being handed back.
   */
  presentationTimeStamp(): CMTime {
    const src = this.presentationTimeStamp_at_0x08;
    // @0xde8b67 movq 0x18(%rsi),%rcx ; @0xde8b6b movq %rcx,0x10(%rdi)
    //   — the epoch qword is copied FIRST, exactly as the machine orders it.
    const epoch = src.epoch;
    // @0xde8b6f movups 0x8(%rsi),%xmm0 ; @0xde8b73 movups %xmm0,(%rdi)
    //   — then the 16-byte block: value (+0x00), timescale (+0x08), flags (+0x0c)
    //     of the destination CMTime.
    return {
      value: src.value,
      timescale: src.timescale,
      flags: src.flags,
      epoch,
    };
  }
}
