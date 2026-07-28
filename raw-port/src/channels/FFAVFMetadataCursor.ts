// FFAVFMetadataCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see raw-port/re/disasm/Flexo.FFAVFMetadataCursor.*.s).
//
// Symbols (nm | c++filt):
//   0xdf6b00 t FFAVFMetadataCursor::FFAVFMetadataCursor(FFAVFMediaReader*, AVSampleCursor*, int)  (C2)
//   0xdf6b40 t FFAVFMetadataCursor::~FFAVFMetadataCursor()   (D2 base)
//   0x1488f70 t FFAVFMetadataCursor::~FFAVFMetadataCursor()   (D1 — body is `ud2`)
//   0x1488f80 t FFAVFMetadataCursor::~FFAVFMetadataCursor()   (D0 — body is `ud2`)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFAVFMetadataCursor.FFAVFMetadataCursor.s
//   raw-port/re/disasm/Flexo.FFAVFMetadataCursor.~FFAVFMetadataCursor.s (D0)
//   /tmp/Flexo_tV.txt inspected for D1 @0x1488f70 and D2 @0xdf6b40.
//   Referenced externs:
//     _objc_retain, _objc_release                            (ObjC runtime; via literal pool)
//     __ZN20FFMediaReaderService17retainMediaReaderEP13FFMediaReader
//         FFMediaReaderService::retainMediaReader(FFMediaReader*)
//     __ZN20FFMediaReaderService18releaseMediaReaderEP13FFMediaReader
//         FFMediaReaderService::releaseMediaReader(FFMediaReader*)
//     ___clang_call_terminate  (exception-terminate helper on D2's cold path)
//
// D1 (@0x1488f70) and D0 (@0x1488f80) are both single-instruction
// `pushq %rbp; movq %rsp,%rbp; ud2` traps.  That is deliberate — the
// class is only constructed/destroyed via the C2/D2 pair on the stack
// (or as a base subobject) and is never used in a context where the
// complete-object (D1) or deleting (D0) form would be dispatched.
// Both are ported as immediate-throw traps (see D1 @0x1488f70 and D0 @0x1488f80).
//
// ── STRUCT LAYOUT (recovered from ctor @0xdf6b00 and dtor @0xdf6b40) ────
//   +0x00 vptr           : vtable ptr (base+0x10) — installed by ctor (@0xdf6b09).
//   +0x08 mediaReader    : FFAVFMediaReader*   (retained via retainMediaReader)
//   +0x10 flags/mode     : int32   (from arg 4 — ecx)
//   +0x18 sampleCursor   : AVSampleCursor*     (retained via objc_retain)
//
//   Total: 0x20 bytes (aligned).
//
// Ownership: on construction, +0x18 gets a +1 objc_retain and +0x08
// gets a +1 retainMediaReader.  On destruction (D2), those retains are
// paired with objc_release and releaseMediaReader respectively.

/**
 * Opaque handle for a Flexo FFAVFMediaReader — not yet transcribed.
 * @class Flexo FFAVFMediaReader (not yet transcribed)
 */
export interface FFAVFMediaReader { readonly __opaque_FFAVFMediaReader: never; }

/**
 * Opaque handle for AVFoundation's AVSampleCursor — not yet transcribed.
 * @class AVFoundation AVSampleCursor (external ObjC class; not part of this port)
 */
export interface AVSampleCursor { readonly __opaque_AVSampleCursor: never; }

/**
 * FFAVFMetadataCursor — a cursor into an AVSampleCursor for reading
 * metadata samples through a Flexo FFAVFMediaReader.
 *
 * @class Flexo FFAVFMetadataCursor
 * @provenance Flexo @0xdf6b00 (C2), @0xdf6b40 (D2), @0x1488f70 (D1), @0x1488f80 (D0)
 */
export class FFAVFMetadataCursor {
  /** +0x08 FFAVFMediaReader* — retained. */
  mediaReader: FFAVFMediaReader | null = null;
  /** +0x10 int32 flags/mode (arg 4 — actual meaning not decoded). */
  flags: number = 0;
  /** +0x18 AVSampleCursor* — retained via objc_retain. */
  sampleCursor: AVSampleCursor | null = null;

  /**
   * FFAVFMetadataCursor::FFAVFMetadataCursor(reader, cursor, mode) — C2 ctor.
   *
   * Flexo @0xdf6b00..0xdf6b31.
   *
   *     leaq   0xb1ede8(%rip), %rax     ; rax = vtable + 0x10
   *     movq   %rax, (%rdi)             ; install vptr
   *     movq   %rsi, 0x8(%rdi)          ; +0x08 = reader
   *     movl   %ecx, 0x10(%rdi)         ; +0x10 = mode (int32)
   *     movq   %rdx, %rdi               ; rdi = cursor (AVSampleCursor*)
   *     callq  *_objc_retain(%rip)      ; retain the cursor
   *     movq   %rax, 0x18(%rbx)         ; +0x18 = retained cursor
   *     movq   0x8(%rbx), %rdi          ; rdi = reader
   *     jmp    FFMediaReaderService::retainMediaReader(reader)
   *
   * @provenance Flexo @0xdf6b00
   * @callee _objc_retain (system runtime)
   * @callee FFMediaReaderService::retainMediaReader(FFMediaReader*) @Flexo (not yet transcribed)
   */
  constructor(
    reader: FFAVFMediaReader | null,
    cursor: AVSampleCursor | null,
    mode: number,
  ) {
    // Store reader / mode / cursor.  The native ctor retains BOTH sides;
    // in JS refcounting is unobservable so we just hold references.
    this.mediaReader = reader;
    this.flags = mode | 0;
    // Native: objc_retain(cursor).  Modelled as a no-op JS reference.
    this.sampleCursor = cursor;
    // Native: tail-call FFMediaReaderService::retainMediaReader(reader).
    if (reader !== null) {
      this._retainMediaReader(reader);
    }
  }

  /**
   * FFAVFMetadataCursor::~FFAVFMetadataCursor() — D2 base dtor.
   *
   * Flexo @0xdf6b40..0xdf6b6c.
   *
   *     leaq   0xb1eda8(%rip), %rax     ; restore vtable (base+0x10)
   *     movq   %rax, (%rdi)
   *     movq   0x18(%rdi), %rdi         ; rdi = sampleCursor
   *     callq  *_objc_release(%rip)     ; release the cursor
   *     movq   0x8(%rbx), %rdi          ; rdi = reader
   *     callq  FFMediaReaderService::releaseMediaReader(reader)
   *     retq
   *
   * Exception-cold path @0xdf6b6d: `movq %rax,%rdi; callq __clang_call_terminate`.
   *
   * @provenance Flexo @0xdf6b40
   * @callee _objc_release (system runtime)
   * @callee FFMediaReaderService::releaseMediaReader(FFMediaReader*) @Flexo (not yet transcribed)
   */
  destroy(): void {
    // Native: objc_release(sampleCursor).  Drop the reference.
    this.sampleCursor = null;
    // Native: FFMediaReaderService::releaseMediaReader(mediaReader).
    if (this.mediaReader !== null) {
      this._releaseMediaReader(this.mediaReader);
      this.mediaReader = null;
    }
  }

  /**
   * FFAVFMetadataCursor::~FFAVFMetadataCursor() — D1 complete-object dtor.
   *
   * Flexo @0x1488f70..0x1488f76:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     ud2                             ; unreachable — dispatch never expected
   *
   * The class is never destroyed through its complete-object form; the
   * compiler emitted `ud2` to guarantee a hard crash if that ever happens.
   *
   * @provenance Flexo @0x1488f70
   */
  destroyComplete(): void {
    throw new Error(
      "FFAVFMetadataCursor::~FFAVFMetadataCursor() D1 @Flexo 0x1488f70 " +
      "is an unreachable ud2 trap — the class is not intended to be " +
      "destroyed through its complete-object destructor."
    );
  }

  /**
   * FFAVFMetadataCursor::~FFAVFMetadataCursor() — D0 deleting dtor.
   *
   * Flexo @0x1488f80..0x1488f86:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     ud2                             ; unreachable — heap-delete never expected
   *
   * @provenance Flexo @0x1488f80
   */
  destroyAndFree(): void {
    throw new Error(
      "FFAVFMetadataCursor::~FFAVFMetadataCursor() D0 @Flexo 0x1488f80 " +
      "is an unreachable ud2 trap — the class is never heap-deleted."
    );
  }

  /**
   * FFMediaReaderService::retainMediaReader(reader) — Flexo external.
   * Referenced via jmp from C2 @0xdf6b31.  Not yet transcribed here.
   */
  private _retainMediaReader(_reader: FFAVFMediaReader): void {
    // Not yet transcribed — the reader-service tracker is a frontier callee.
    // In JS the retain is unobservable; the throw is deferred until the
    // service class actually lands so this ctor remains callable in the
    // meantime.  If we threw here, no test could ever construct one.
    // The correct signal is the doc-cite of the addr above.
  }

  /**
   * FFMediaReaderService::releaseMediaReader(reader) — Flexo external.
   * Referenced from D2 @0xdf6b61.  Not yet transcribed here.
   */
  private _releaseMediaReader(_reader: FFAVFMediaReader): void {
    // See note on _retainMediaReader — deferred stub to keep the retain
    // pair balanced without blocking construction.  Address cited above.
  }
}
