// FFAVFQTTimecodeCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see /tmp/Flexo_llvm.txt lines 3491807+ and
// raw-port/re/disasm/Flexo.FFAVFQTTimecodeCursor.all.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0xdfb390 t FFAVFQTTimecodeCursor::FFAVFQTTimecodeCursor(
//                FFAVFQTMediaReader*, AVSampleCursor*, int)      (C1/C2 — same body)
//   0xdfb3b0 t FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor()   (D2)
//   0xdfb3c0 t FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor()   (D1)
//   0xdfb3d0 t FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor()   (D0)
//   0xdfb3f0 t FFAVFQTTimecodeCursor::createSampleBufferFromDisk(
//                int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//   0x1915dd0 s _ZTV21FFAVFQTTimecodeCursor  (vtable)
//   0x1915de0 = vtable + 0x10  (first virtual slot pointer that ctor installs)
//   0x1915f30 s _ZTI21FFAVFQTTimecodeCursor  (typeinfo)
//   0x157f908 s _ZTS21FFAVFQTTimecodeCursor  (typeinfo name string)
//
// PROVENANCE / DECODE:
//   Referenced externs:
//     FFAVFTimecodeCursor::FFAVFTimecodeCursor(FFAVFMediaReader*, AVSampleCursor*)
//         parent C2 @Flexo 0xdf6a00 — NOT yet transcribed as a TS class.
//         Its body (@0xdf6a00..0xdf6a2e) is:
//           1) install parent vptr at +0x00 (leaq 0xb1eeb0(%rip),%rax; movq %rax,(%rdi))
//              — anchor 0xdf6a10 + 0xb1eeb0 = 0x18e58c0 (parent's vtable+0x10);
//           2) store reader at +0x08                  ; movq %rsi,0x8(%rdi)
//           3) call _objc_retain(cursor); store retval at +0x10
//           4) tail-call FFMediaReaderService::retainMediaReader(reader).
//         Parent layout is therefore (0x00,0x08,0x10) → (vptr, reader, cursor),
//         total 0x18 bytes.  This child class does NOT add fields — the ctor
//         only chain-calls the parent then overwrites vptr with its own.
//     FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  (D2 @Flexo 0xdf6a40) —
//         restores parent vptr, releases cursor via _objc_release, releases
//         reader via FFMediaReaderService::releaseMediaReader.  Also not
//         yet ported as its own TS class.
//     FFAVFQTMediaReader::createSampleBufferFromDisk(
//         AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime,
//         FFPrerollBatch*) const   @Flexo (not yet transcribed)
//     __ZdlPv  (operator delete(void*)) — libc++ ABI, only via D0.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────
//   Inherits FFAVFTimecodeCursor 1:1 (no added fields — no store past parent
//   layout in ctor/dtor).  Fields (mirroring the parent's memory image):
//     +0x00 vptr           — installed by C2 @0xdfb3a5 with the QT vtable.
//     +0x08 mediaReader    — FFAVFQTMediaReader* (base slot typed as
//                            FFAVFMediaReader*; access below downcasts).
//     +0x10 sampleCursor   — AVSampleCursor* (retained by parent ctor).
//   Total: 0x18 bytes.
//
//   NOTE: the constructor takes a THIRD arg `int` at %ecx, but the parent's
//   ctor takes only two pointer args (%rsi/%rdx).  The child's ctor never
//   stores the int anywhere — %ecx is silently DROPPED before the parent
//   call at 0xdfb399.  The `int` in the child's signature is dead-code from
//   the compiler's perspective; it's present so all four *Cursor subclasses
//   in this family share a call-site signature.  We accept it, mark it
//   unused, and cite the address where it is discarded.
//
//   The vptr installed at +0x00 by the child ctor at @0xdfb39e:
//     leaq  0xb1aa3b(%rip), %rax     ; RIP-anchor after LEA = 0xdfb3a5;
//     0xdfb3a5 + 0xb1aa3b = 0x1915de0
//   which is _ZTV21FFAVFQTTimecodeCursor + 0x10 (Itanium ABI first slot).

import type { CMTime } from "../infra/CMTime";

/**
 * Opaque handle for the Flexo FFAVFMediaReader — base of the reader
 * hierarchy.  Not yet transcribed as a TS class.
 * @class Flexo FFAVFMediaReader (not yet transcribed)
 */
export interface FFAVFMediaReader { readonly __opaque_FFAVFMediaReader: never; }

/**
 * Opaque handle for the Flexo FFAVFQTMediaReader — the QuickTime-flavoured
 * media reader that vends this timecode cursor.  Not yet transcribed.
 * @class Flexo FFAVFQTMediaReader (not yet transcribed)
 */
export interface FFAVFQTMediaReader { readonly __opaque_FFAVFQTMediaReader: never; }

/**
 * Opaque handle for AVFoundation's AVSampleCursor.  External ObjC class.
 */
export interface AVSampleCursor { readonly __opaque_AVSampleCursor: never; }

/**
 * Opaque handle for FFPrerollBatch — pre-roll batch descriptor threaded
 * through createSampleBufferFromDisk.  Not yet transcribed.
 * @class Flexo FFPrerollBatch (not yet transcribed)
 */
export interface FFPrerollBatch { readonly __opaque_FFPrerollBatch: never; }

/**
 * Opaque handle for CMSampleBufferRef — CoreMedia sample-buffer returned by
 * the reader.  The concrete definition lives in CoreMedia; this port only
 * ferries the pointer through.
 */
export interface CMSampleBufferRef { readonly __opaque_CMSampleBufferRef: never; }

/**
 * FFMediaReaderRequestMode — enum threaded through
 * createSampleBufferFromDisk.  The underlying C++ enum has not been
 * exhaustively decoded in this port; represented as an int here so we
 * pass through the raw value without inventing a name mapping.
 * @provenance Flexo (see reader signature at @0xdfb40d tail-call)
 */
export type FFMediaReaderRequestMode = number;

/**
 * FFAVFQTTimecodeCursor — QuickTime-specific timecode cursor.
 *
 * A thin subclass of FFAVFTimecodeCursor that:
 *   1) installs its own vtable in the ctor,
 *   2) forwards createSampleBufferFromDisk to the QT-reader with
 *      isTimecode=true baked in.
 *
 * The parent class (FFAVFTimecodeCursor) is not yet transcribed as its
 * own file, so this class holds its own copies of the mirrored fields
 * (mediaReader / sampleCursor) rather than extending it — that keeps
 * this file self-contained without inventing the parent's ported form.
 * When FFAVFTimecodeCursor lands, this class should be refactored to
 * `extends FFAVFTimecodeCursor` with no behavioural change.
 *
 * @class Flexo FFAVFQTTimecodeCursor
 * @provenance Flexo @0xdfb390 (C1/C2), @0xdfb3b0 (D2), @0xdfb3c0 (D1),
 *             @0xdfb3d0 (D0), @0xdfb3f0 (createSampleBufferFromDisk)
 */
export class FFAVFQTTimecodeCursor {
  /**
   * +0x08 FFAVFQTMediaReader* — held (retained by parent ctor).
   * Typed FFAVFMediaReader in the C++ base slot; downcast happens in
   * createSampleBufferFromDisk (0xdfb3fc reads 0x8 then treats it as QT).
   */
  mediaReader: FFAVFMediaReader | null = null;
  /**
   * +0x10 AVSampleCursor* — retained via objc_retain in the parent ctor.
   */
  sampleCursor: AVSampleCursor | null = null;

  /**
   * FFAVFQTTimecodeCursor::FFAVFQTTimecodeCursor(reader, cursor, unusedInt).
   *
   * Flexo @0xdfb390..0xdfb3ae:
   *
   *     pushq  %rbp; movq %rsp,%rbp
   *     pushq  %rbx; pushq %rax
   *     movq   %rdi, %rbx              ; rbx = this
   *     callq  FFAVFTimecodeCursor::C2 ; base(reader, cursor)   — NB: 2 args!
   *                                    ; %ecx (the caller's third arg,
   *                                    ; declared `int` in the demangled
   *                                    ; signature) is NOT forwarded and
   *                                    ; is silently dropped here.
   *     leaq   0xb1aa3b(%rip), %rax    ; rax = _ZTV21FFAVFQTTimecodeCursor+0x10
   *     movq   %rax, (%rbx)            ; install derived vptr at +0x00
   *     addq   $0x8, %rsp; popq %rbx; popq %rbp; retq
   *
   * @provenance Flexo @0xdfb390
   * @callee FFAVFTimecodeCursor::FFAVFTimecodeCursor(FFAVFMediaReader*, AVSampleCursor*)
   *   @Flexo 0xdf6a00 — parent C2 (NOT yet transcribed as a class; body inlined below).
   * @vtable _ZTV21FFAVFQTTimecodeCursor @Flexo 0x1915dd0 (installed slot = +0x10 = 0x1915de0).
   */
  constructor(
    reader: FFAVFQTMediaReader | null,
    cursor: AVSampleCursor | null,
    // Third arg exists in the demangled C++ signature but is NEVER
    // referenced by the ctor body — %ecx is not stored, not forwarded.
    // Kept for signature parity; underscore-prefixed to mark unused.
    _unusedInt: number = 0,
  ) {
    // Inlined parent body (FFAVFTimecodeCursor::C2 @0xdf6a00):
    //   df6a13: movq %rsi, 0x8(%rdi)          ; +0x08 = reader
    //   df6a1a: callq _objc_retain            ; retain cursor
    //   df6a20: movq %rax, 0x10(%rbx)         ; +0x10 = retained cursor
    //   df6a2e: jmp  FFMediaReaderService::retainMediaReader(reader)
    // In JS, refcounting is unobservable — just hold references.
    this.mediaReader = reader as unknown as FFAVFMediaReader | null;
    this.sampleCursor = cursor;
    // Native: retainMediaReader(reader).  Frontier callee.
    if (reader !== null) {
      FFAVFQTTimecodeCursor._retainMediaReader(this.mediaReader!);
    }
    // Derived vptr install is a no-op in TS — JS's prototype chain
    // handles method dispatch.  (Native: `movq %rax, (%rbx)` @0xdfb3a5,
    // %rax = 0x1915de0.)
  }

  /**
   * FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor() — D2 base dtor.
   *
   * Flexo @0xdfb3b0..0xdfb3b9:
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp   FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  ; tail-call parent D2
   *
   * Parent D2 (@0xdf6a40) inline body:
   *   1) restore parent vptr at +0x00 (leaq/movq);
   *   2) _objc_release(sampleCursor);
   *   3) FFMediaReaderService::releaseMediaReader(mediaReader);
   *   4) retq (with cold `___clang_call_terminate` at +0x2d).
   *
   * @provenance Flexo @0xdfb3b0
   * @callee FFAVFTimecodeCursor::~FFAVFTimecodeCursor() @Flexo 0xdf6a40 (parent D2, not yet ported as class).
   */
  destroy(): void {
    // Inlined parent D2 body: release cursor + reader.  Drop references.
    this.sampleCursor = null;
    if (this.mediaReader !== null) {
      FFAVFQTTimecodeCursor._releaseMediaReader(this.mediaReader);
      this.mediaReader = null;
    }
  }

  /**
   * FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor() — D1 complete-object dtor.
   *
   * Flexo @0xdfb3c0..0xdfb3c9:
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp   FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  ; tail-call parent D2
   *
   * Identical to D2 for this class — pure tail-call to parent D2.
   *
   * @provenance Flexo @0xdfb3c0
   * @callee FFAVFTimecodeCursor::~FFAVFTimecodeCursor() @Flexo 0xdf6a40 (parent D2, not yet ported).
   */
  destroyComplete(): void {
    // Same as D2 for this class.
    this.destroy();
  }

  /**
   * FFAVFQTTimecodeCursor::~FFAVFQTTimecodeCursor() — D0 deleting dtor.
   *
   * Flexo @0xdfb3d0..0xdfb3e7:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     pushq %rbx; pushq %rax
   *     movq  %rdi, %rbx
   *     callq FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  ; base D2
   *     movq  %rbx, %rdi
   *     addq  $0x8, %rsp; popq %rbx; popq %rbp
   *     jmp   __ZdlPv                                      ; operator delete(this)
   *
   * @provenance Flexo @0xdfb3d0
   * @callee FFAVFTimecodeCursor::~FFAVFTimecodeCursor() @Flexo 0xdf6a40 (parent D2, not yet ported).
   * @callee operator delete(void*)  @libc++ (`__ZdlPv` @Flexo stub 0x1497404).
   */
  destroyAndFree(): void {
    // Run destructor chain; JS GC handles the free.
    this.destroy();
  }

  /**
   * FFAVFQTTimecodeCursor::createSampleBufferFromDisk(
   *     int arg1, FFMediaReaderRequestMode arg2, CMTime arg3, FFPrerollBatch* arg4) const
   *
   * Flexo @0xdfb3f0..0xdfb411:
   *
   *     pushq  %rbp; movq %rsp,%rbp
   *     movq   %rcx, %r9                ; r9  = arg4 (FFPrerollBatch*)
   *     movl   %edx, %r8d               ; r8d = arg2 (FFMediaReaderRequestMode)
   *     movl   %esi, %ecx               ; ecx = arg1 (int)
   *     movq   0x8(%rdi), %rax          ; rax = this->mediaReader (FFAVFQTMediaReader*)
   *     movq   0x10(%rdi), %rsi         ; rsi = this->sampleCursor  (AVSampleCursor*)
   *     movq   %rax, %rdi               ; new this = the QT reader
   *     movl   $0x1, %edx               ; edx = 1  (bool isTimecode=true)
   *     popq   %rbp
   *     jmp    FFAVFQTMediaReader::createSampleBufferFromDisk(
   *              AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *
   * The x86-64 System V argument mapping on the tail-call:
   *   rdi  → this = mediaReader (QT reader)
   *   rsi  → sampleCursor
   *   edx  → 1 (bool "is timecode" — always true because this is the
   *              *timecode* cursor variant)
   *   ecx  → arg1 (int passed through from caller)
   *   r8d  → arg2 (FFMediaReaderRequestMode)
   *   r9   → arg4 (FFPrerollBatch*)
   *   arg3 (CMTime) was passed on the stack by the caller and remains
   *   there for the tail-callee.  (CMTime is a 24-byte struct — a value
   *   parameter is on-stack by SysV ABI.)
   *
   * @provenance Flexo @0xdfb3f0
   * @callee FFAVFQTMediaReader::createSampleBufferFromDisk(
   *           AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *         @Flexo (not yet transcribed).
   */
  createSampleBufferFromDisk(
    arg1: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null,
  ): CMSampleBufferRef | null {
    // Grab class-level fields (+0x8, +0x10).
    const reader = this.mediaReader as unknown as FFAVFQTMediaReader | null;
    const cursor = this.sampleCursor;
    // Native: tail-call the reader with isTimecode=true baked in.
    return FFAVFQTTimecodeCursor._readerCreateSampleBufferFromDisk(
      reader,
      cursor,
      /* isTimecode */ true,
      arg1 | 0,
      mode,
      time,
      prerollBatch,
    );
  }

  /**
   * FFMediaReaderService::retainMediaReader — Flexo external.
   * Tail-called by the parent C2 at @0xdf6a2e.  Not yet transcribed.
   * Deferred stub so the ctor remains callable in the meantime.
   *
   * @callee FFMediaReaderService::retainMediaReader(FFMediaReader*)
   *   @Flexo 0xdf6a2e (not yet transcribed at any TS address).
   */
  private static _retainMediaReader(_reader: FFAVFMediaReader): void {
    // Refcounting is unobservable in JS — no-op body preserves the pair.
    // Address cited above for the decode trail.
  }

  /**
   * FFMediaReaderService::releaseMediaReader — Flexo external.
   * Called by the parent D2 at @0xdf6a61.  Not yet transcribed.
   *
   * @callee FFMediaReaderService::releaseMediaReader(FFMediaReader*)
   *   @Flexo 0xdf6a61 (not yet transcribed).
   */
  private static _releaseMediaReader(_reader: FFAVFMediaReader): void {
    // Paired with _retainMediaReader — deferred stub.
  }

  /**
   * Trampoline for the tail-call target at @0xdfb40d.  This is the
   * frontier — FFAVFQTMediaReader::createSampleBufferFromDisk is a
   * separate class whose body has not been transcribed yet.  Throwing
   * keeps the demand signal visible without hiding the address.
   *
   * @callee FFAVFQTMediaReader::createSampleBufferFromDisk(
   *           AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *         @Flexo 0xdfb40d (not yet transcribed at any address in this port).
   */
  private static _readerCreateSampleBufferFromDisk(
    _reader: FFAVFQTMediaReader | null,
    _cursor: AVSampleCursor | null,
    _isTimecode: boolean,
    _arg1: number,
    _mode: FFMediaReaderRequestMode,
    _time: CMTime,
    _prerollBatch: FFPrerollBatch | null,
  ): CMSampleBufferRef | null {
    throw new Error(
      "FFAVFQTMediaReader::createSampleBufferFromDisk(AVSampleCursor*, bool, int, " +
      "FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const @Flexo 0xdfb40d " +
      "(tail-called from FFAVFQTTimecodeCursor::createSampleBufferFromDisk @0xdfb3f0) " +
      "is not yet transcribed."
    );
  }
}
