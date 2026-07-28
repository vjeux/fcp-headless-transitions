// FFAVFQTAudioCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see raw-port/re/disasm/Flexo.FFAVFQTAudioCursor.*.s
// and /tmp/Flexo_tV.txt @0xdfb310..0xdfb38f).
//
// Symbols (nm | c++filt):
//   0xdfb310 t FFAVFQTAudioCursor::FFAVFQTAudioCursor(FFAVFQTMediaReader*, AVSampleCursor*, int)  (C2)
//   (C1 folded — not present in the x86_64 slice; only in the arm64 slice, which is
//    a trivial delegator to C2 per standard Itanium-C++-ABI ctor convention.)
//   0xdfb330 t FFAVFQTAudioCursor::~FFAVFQTAudioCursor()  (D2 base — tail-jmps to FFAVFAudioCursor::~FFAVFAudioCursor)
//   0xdfb340 t FFAVFQTAudioCursor::~FFAVFQTAudioCursor()  (D1 complete — identical body, tail-jmp to base D2)
//   0xdfb350 t FFAVFQTAudioCursor::~FFAVFQTAudioCursor()  (D0 deleting — call base D2, then operator delete)
//   0xdfb370 t FFAVFQTAudioCursor::createSampleBufferForReadRequest(int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFAVFQTAudioCursor.FFAVFQTAudioCursor.s (partial — first extracted)
//   /tmp/Flexo_tV.txt inspected linearly at file lines 3493021..3493070 (x86_64 slice).
//   Referenced externs (all cited by @0xADDR at each callq/leaq below):
//     __ZN16FFAVFAudioCursorC2EP16FFAVFMediaReaderP14AVSampleCursor
//         FFAVFAudioCursor::FFAVFAudioCursor(FFAVFMediaReader*, AVSampleCursor*)   — base ctor
//     __ZN16FFAVFAudioCursorD2Ev
//         FFAVFAudioCursor::~FFAVFAudioCursor()   — base dtor
//     __ZdlPv (symbol stub @0x1497404)
//         operator delete(void*)   — invoked from D0
//     __ZNK18FFAVFQTMediaReader32createSampleBufferForReadRequestEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch
//         FFAVFQTMediaReader::createSampleBufferForReadRequest(AVSampleCursor*, bool, int,
//           FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//   vtable install: leaq 0xb1aa73(%rip),%rax @0xdfb31e -> vtable+0x10 = 0x1915d98
//     => vtable base for FFAVFQTAudioCursor = 0x1915d88.
//
// ── STRUCT LAYOUT (inherited entirely from FFAVFAudioCursor base) ──────
//   +0x00 vptr           : vtable ptr (base+0x10) — installed by C2 after base ctor returns.
//   +0x08 mediaReader    : FFAVFMediaReader* (base field) — used by createSampleBufferForReadRequest
//                          as the target of the tail-call; upcast is valid because the concrete
//                          object was constructed via a FFAVFQTMediaReader*.
//   +0x10 sampleCursor   : AVSampleCursor*   (base field) — read by createSampleBufferForReadRequest
//                          and passed as the first arg to the reader's variant.
//   NOTE: the ctor's third param `int mode` is NOT forwarded to the base ctor
//   (whose signature does not take it) and is not stored in any observable
//   slot of this-subclass either. In this x86_64 body the arg is dropped — it
//   may only be consumed inside the C1 slot (which the linker folded) or be
//   an ABI-vestigial holdover from an older signature. The behaviour is
//   faithful to the asm: we accept and ignore it. (@0xdfb310 body has no
//   store of ecx into `this`.)
//
// The tail-call adapter in createSampleBufferForReadRequest is a pure
// register reshuffle — it hard-codes `false` for the reader's `bool`
// parameter (`xorl %edx,%edx` @0xdfb387) and forwards the rest.

import type { CMTime } from "../infra/CMTime";

/**
 * Opaque handle for a Flexo FFAVFMediaReader base — not yet transcribed.
 * FFAVFQTMediaReader inherits from FFAVFMediaReader; the base pointer is
 * stored in the cursor at +0x08.
 * @class Flexo FFAVFMediaReader (not yet transcribed)
 */
export interface FFAVFMediaReader { readonly __opaque_FFAVFMediaReader: never; }

/**
 * Opaque handle for a Flexo FFAVFQTMediaReader — not yet transcribed.
 * This is the concrete subclass whose createSampleBufferForReadRequest
 * variant this cursor's own method tail-calls (@0xdfb38a).
 * @class Flexo FFAVFQTMediaReader (not yet transcribed)
 */
export interface FFAVFQTMediaReader extends FFAVFMediaReader {
  readonly __opaque_FFAVFQTMediaReader: never;
  /**
   * Not yet transcribed. @extern Flexo FFAVFQTMediaReader::createSampleBufferForReadRequest
   *   @0xdfb38a jmp target (mangled __ZNK18FFAVFQTMediaReader32createSampleBufferForReadRequestEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch).
   */
  createSampleBufferForReadRequest(
    cursor: AVSampleCursor | null,
    flag: boolean,
    arg: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null
  ): unknown;
}

/**
 * Opaque handle for AVFoundation's AVSampleCursor — not yet transcribed.
 * @class AVFoundation AVSampleCursor (external ObjC class; not part of this port)
 */
export interface AVSampleCursor { readonly __opaque_AVSampleCursor: never; }

/**
 * Opaque handle for a Flexo FFPrerollBatch — not yet transcribed.
 * @class Flexo FFPrerollBatch (not yet transcribed)
 */
export interface FFPrerollBatch { readonly __opaque_FFPrerollBatch: never; }

/**
 * FFMediaReaderRequestMode — enum passed through unchanged. Underlying
 * width is int32 (moved via `movl %edx, %r8d` @0xdfb377). Values not yet
 * recovered from the binary; kept as an opaque numeric alias.
 * @enum Flexo FFMediaReaderRequestMode (values not yet decoded)
 */
export type FFMediaReaderRequestMode = number;

/**
 * FFAVFQTAudioCursor — a Quicktime-flavoured audio cursor variant of
 * FFAVFAudioCursor. Adds no state of its own beyond a distinct vtable;
 * routes createSampleBufferForReadRequest through the concrete
 * FFAVFQTMediaReader variant.
 *
 * @class Flexo FFAVFQTAudioCursor
 * @provenance Flexo @0xdfb310 (C2), @0xdfb330 (D2), @0xdfb340 (D1),
 *             @0xdfb350 (D0), @0xdfb370 (createSampleBufferForReadRequest).
 *             vtable @0x1915d88 (target of leaq @0xdfb31e).
 */
export class FFAVFQTAudioCursor {
  /** +0x08 (inherited from FFAVFAudioCursor) — retained media reader. */
  mediaReader: FFAVFQTMediaReader | null = null;
  /** +0x10 (inherited from FFAVFAudioCursor) — retained sample cursor. */
  sampleCursor: AVSampleCursor | null = null;

  /**
   * FFAVFQTAudioCursor::FFAVFQTAudioCursor(reader, cursor, mode) — C2 ctor.
   *
   * Flexo @0xdfb310..0xdfb32e.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save `this`
   *     callq  __ZN16FFAVFAudioCursorC2EP16FFAVFMediaReaderP14AVSampleCursor
   *                                              ; base(FFAVFMediaReader*, AVSampleCursor*)
   *                                              ; note: rsi=reader, rdx=cursor forwarded
   *                                              ;       rcx=mode NOT consumed by base sig
   *     leaq   0xb1aa73(%rip), %rax              ; rax = 0x1915d98 (vtable+0x10)
   *     movq   %rax, (%rbx)                      ; install vptr into `this` at +0x00
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     retq
   *
   * The `mode` argument is not stored anywhere in this subclass's ctor
   * body — see file-level note.  We keep the parameter for signature
   * fidelity; the base ctor's semantics (retain/store of reader and
   * cursor) live in FFAVFAudioCursor (not yet transcribed).
   */
  constructor(
    reader: FFAVFQTMediaReader | null,
    cursor: AVSampleCursor | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- arg dropped by C2 body @0xdfb310 (see file note)
    _mode: number,
  ) {
    // Base ctor stores reader -> +0x08 and cursor -> +0x10 (retain semantics
    // owned by FFAVFAudioCursor; not yet transcribed — the
    // base symbol __ZN16FFAVFAudioCursorC2EP16FFAVFMediaReaderP14AVSampleCursor
    // is called from @0xdfb319 but its body is a separate frontier port).
    this.mediaReader = reader;
    this.sampleCursor = cursor;
    // leaq 0xb1aa73(%rip),%rax @0xdfb31e ; movq %rax,(%rbx) @0xdfb325 —
    // installs vtable+0x10 (=0x1915d98, vtable base 0x1915d88). In this
    // TS port we track the class identity implicitly via the JS class;
    // there is no explicit vptr field.
  }

  /**
   * FFAVFQTAudioCursor::~FFAVFQTAudioCursor()  — D2 base destructor.
   *
   * Flexo @0xdfb330..0xdfb339.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     popq   %rbp
   *     jmp    __ZN16FFAVFAudioCursorD2Ev       ; tail-jmp to base D2
   *
   * Adds no cleanup of its own — pure tail-call to the base dtor
   * (FFAVFAudioCursor::~FFAVFAudioCursor, not yet transcribed).
   *
   * D1 (@0xdfb340) is a byte-identical body — same `jmp` target — because
   * the class has no complete-object-specific cleanup beyond the base.
   * We fold both into this single method; a caller of D1 semantics gets
   * the same observable effect.
   */
  destroy(): void {
    // Base ~FFAVFAudioCursor() releases the retained mediaReader and
    // sampleCursor. Not yet transcribed @__ZN16FFAVFAudioCursorD2Ev
    // (called from @0xdfb335 and @0xdfb345 and @0xdfb359).
    this.mediaReader = null;
    this.sampleCursor = null;
  }

  /**
   * FFAVFQTAudioCursor::~FFAVFQTAudioCursor()  — D0 deleting destructor.
   *
   * Flexo @0xdfb350..0xdfb368.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save this
   *     callq  __ZN16FFAVFAudioCursorD2Ev        ; run base D2 in place
   *     movq   %rbx, %rdi
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     jmp    0x1497404                         ; symbol stub for __ZdlPv
   *                                              ; => operator delete(this)
   *
   * In TS there is no operator delete — GC handles the memory. We only
   * mirror the observable state-clearing side of the base dtor.
   */
  destroyAndFree(): void {
    // Base D2 semantics (release retains); see destroy() above.
    this.destroy();
    // operator delete @0x1497404 stub — no-op in TS (GC).
  }

  /**
   * FFAVFQTAudioCursor::createSampleBufferForReadRequest(arg, mode, time, prerollBatch) const
   *
   * Flexo @0xdfb370..0xdfb38f.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     movq   %rcx, %r9                         ; CMTime.value (rcx) -> r9 (new arg slot 6)
   *     movl   %edx, %r8d                        ; mode (edx) -> r8 (arg 5)
   *     movl   %esi, %ecx                        ; int arg1 (esi) -> ecx (arg 4)
   *     movq   0x8(%rdi), %rax                   ; rax = this.mediaReader (+0x08)
   *     movq   0x10(%rdi), %rsi                  ; rsi = this.sampleCursor (+0x10) (arg 2)
   *     movq   %rax, %rdi                        ; rdi = mediaReader (target `this`)
   *     xorl   %edx, %edx                        ; edx = 0 (bool = false, arg 3)
   *     popq   %rbp
   *     jmp    __ZNK18FFAVFQTMediaReader32createSampleBufferForReadRequest...
   *                                              ; tail-call — no return
   *
   * Reshuffles registers to invoke the concrete-reader variant:
   *   mediaReader->createSampleBufferForReadRequest(
   *       this.sampleCursor,      // AVSampleCursor*
   *       false,                  // bool
   *       arg1,                   // int
   *       mode,                   // FFMediaReaderRequestMode
   *       time,                   // CMTime
   *       prerollBatch)           // FFPrerollBatch*
   *
   * The CMTime is a 24-byte by-value struct; in the SysV ABI it occupies
   * up to three int-registers (rcx,r8,r9 in the caller's frame). After the
   * shuffle only rcx->r9 (CMTime.value) is visibly re-parked; the higher
   * CMTime words (timescale/flags/epoch) sit on the caller stack and pass
   * through the tail-jmp unchanged — the ABI slot count doesn't change,
   * only the leading `bool` and `int` args are inserted.
   */
  createSampleBufferForReadRequest(
    arg: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null,
  ): unknown {
    if (this.mediaReader === null) {
      throw new Error(
        "FFAVFQTAudioCursor.createSampleBufferForReadRequest @0xdfb370: this.mediaReader (+0x08) is null — undefined behaviour in the original (would dereference NULL at @0xdfb384 movq %rax,%rdi then tail-jmp)."
      );
    }
    return this.mediaReader.createSampleBufferForReadRequest(
      this.sampleCursor, // +0x10
      false,             // xorl %edx,%edx @0xdfb387
      arg,               // esi -> ecx
      mode,              // edx -> r8d
      time,              // rcx -> r9 (and higher CMTime words pass through the stack)
      prerollBatch,      // stack arg — passed through
    );
  }
}
