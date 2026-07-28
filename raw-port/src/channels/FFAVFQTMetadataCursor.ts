// FFAVFQTMetadataCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see raw-port/re/disasm/Flexo.FFAVFQTMetadataCursor.*.s
// and /tmp/Flexo_llvm.txt lines 3491860+).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0xdfb420 t FFAVFQTMetadataCursor::FFAVFQTMetadataCursor(
//                FFAVFQTMediaReader*, AVSampleCursor*, int)      (C1/C2 — same body)
//   0xdfb440 t FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor()   (D2)
//   0xdfb450 t FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor()   (D1)
//   0xdfb460 t FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor()   (D0)
//   0xdfb480 t FFAVFQTMetadataCursor::createSampleBufferForReadRequest(
//                int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//   0x1915e08 s _ZTV21FFAVFQTMetadataCursor  (vtable)
//   0x1915e18 = vtable + 0x10  (first virtual slot pointer that ctor installs)
//   0x1915f48 s _ZTI21FFAVFQTMetadataCursor  (typeinfo)
//   0x157f920 s _ZTS21FFAVFQTMetadataCursor  (typeinfo name string)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFAVFQTMetadataCursor.FFAVFQTMetadataCursor.s
//   raw-port/re/disasm/Flexo.FFAVFQTMetadataCursor.~FFAVFQTMetadataCursor.s
//   raw-port/re/disasm/Flexo.FFAVFQTMetadataCursor.createSampleBufferForReadRequest.s
//   Referenced externs:
//     FFAVFMetadataCursor::FFAVFMetadataCursor(FFAVFMediaReader*, AVSampleCursor*, int)
//         parent C2 — already ported (raw-port/src/channels/FFAVFMetadataCursor.ts)
//     FFAVFMetadataCursor::~FFAVFMetadataCursor()  (D2 base)
//         parent D2 — already ported
//     FFAVFQTMediaReader::createSampleBufferForReadRequest(
//         AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//         @Flexo (not yet transcribed)
//     __ZdlPv  (operator delete(void*)) — libc++ ABI, only reached via D0.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────
//   Inherits FFAVFMetadataCursor 1:1 (no added fields — no stores past
//   parent layout in ctor or dtor).  Only difference from the base is the
//   vptr installed at +0x00 by the ctor at @0xdfb42e:
//     leaq  0xb1a9e3(%rip), %rax
//     → RIP-anchor after LEA = 0xdfb435; 0xdfb435 + 0xb1a9e3 = 0x1915e18,
//       which is _ZTV21FFAVFQTMetadataCursor + 0x10 (the standard
//       Itanium-ABI "first-slot-of-vtable-past-header" pointer).  The
//       parent's ctor stores its own vtable first; this derived ctor then
//       overwrites +0x00 with the QT vtable so virtual dispatch resolves
//       to this class.
//
//   The reader pointer stored at +0x08 by the parent ctor is typed here
//   as FFAVFQTMediaReader* (the QT-specific reader subclass) even though
//   the parent slot is FFAVFMediaReader*.  This is the standard C++
//   "base subobject stores base ptr; derived accesses via downcast on
//   the same address" pattern — createSampleBufferForReadRequest below
//   reads 0x8(%rdi) directly and immediately invokes a FFAVFQTMediaReader
//   method on it, proving the runtime type at that slot is
//   FFAVFQTMediaReader*.

import type { CMTime } from "../infra/CMTime";
import {
  FFAVFMetadataCursor,
  type AVSampleCursor,
  type FFAVFMediaReader,
} from "./FFAVFMetadataCursor";

/**
 * Opaque handle for the Flexo FFAVFQTMediaReader — the QuickTime-flavoured
 * media reader that vends this cursor.  Not yet transcribed.
 * @class Flexo FFAVFQTMediaReader (not yet transcribed)
 */
export interface FFAVFQTMediaReader { readonly __opaque_FFAVFQTMediaReader: never; }

/**
 * Opaque handle for FFPrerollBatch — pre-roll batch descriptor threaded
 * through createSampleBufferForReadRequest.  Not yet transcribed.
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
 * createSampleBufferForReadRequest.  The underlying C++ enum has not been
 * exhaustively decoded in this port; represented as an int here so we
 * pass through the raw value without inventing a name mapping.
 * @provenance Flexo (see reader signature at @0xdfb49d tail-call)
 */
export type FFMediaReaderRequestMode = number;

/**
 * FFAVFQTMetadataCursor — QuickTime-specific metadata cursor.
 *
 * A thin subclass of FFAVFMetadataCursor that:
 *   1) installs its own vtable in the ctor,
 *   2) forwards createSampleBufferForReadRequest to the QT-reader with
 *      isMetadata=true baked in.
 *
 * @class Flexo FFAVFQTMetadataCursor
 * @provenance Flexo @0xdfb420 (C1/C2), @0xdfb440 (D2), @0xdfb450 (D1),
 *             @0xdfb460 (D0), @0xdfb480 (createSampleBufferForReadRequest)
 */
export class FFAVFQTMetadataCursor extends FFAVFMetadataCursor {
  /**
   * FFAVFQTMetadataCursor::FFAVFQTMetadataCursor(reader, cursor, mode).
   *
   * Flexo @0xdfb420..0xdfb43e:
   *
   *     pushq  %rbp; movq %rsp,%rbp
   *     pushq  %rbx; pushq %rax
   *     movq   %rdi, %rbx              ; rbx = this
   *     callq  FFAVFMetadataCursor::C2 ; base(reader, cursor, mode)
   *     leaq   0xb1a9e3(%rip), %rax    ; rax = _ZTV21FFAVFQTMetadataCursor + 0x10
   *     movq   %rax, (%rbx)            ; install derived vptr at +0x00
   *     addq   $0x8, %rsp; popq %rbx; popq %rbp; retq
   *
   * @provenance Flexo @0xdfb420
   * @callee FFAVFMetadataCursor::FFAVFMetadataCursor(FFAVFMediaReader*, AVSampleCursor*, int)
   *   @Flexo 0xdf6b00 — parent C2 (already ported).
   * @vtable _ZTV21FFAVFQTMetadataCursor @Flexo 0x1915e08 (installed slot = +0x10 = 0x1915e18).
   */
  constructor(
    reader: FFAVFQTMediaReader | null,
    cursor: AVSampleCursor | null,
    mode: number,
  ) {
    // Base ctor: retains reader (via retainMediaReader) and cursor (via
    // objc_retain), stores flags/mode.  The FFAVFQTMediaReader we hold
    // is structurally a FFAVFMediaReader — the base slot is polymorphic
    // in C++; in TS we cast at the boundary.
    super(reader as unknown as FFAVFMediaReader | null, cursor, mode);
    // Derived vptr install is a no-op in TS — method resolution goes
    // through JS's prototype chain, so overriding methods on this class
    // is what supplies the virtual dispatch that the native vtable+0x10
    // slot encodes.  Cite the addr so the provenance is not lost.
    // (Native: `movq %rax, (%rbx)` @0xdfb435, %rax = 0x1915e18.)
  }

  /**
   * FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor() — D2 base dtor.
   *
   * Flexo @0xdfb440..0xdfb449:
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp   FFAVFMetadataCursor::~FFAVFMetadataCursor()   ; tail-call parent D2
   *
   * Pure delegation — no derived-class fields to release beyond what the
   * base D2 already handles.
   *
   * @provenance Flexo @0xdfb440
   * @callee FFAVFMetadataCursor::~FFAVFMetadataCursor() @Flexo 0xdf6b40 (parent D2, ported).
   */
  destroy(): void {
    // Delegate to parent D2 (releases sampleCursor and mediaReader).
    super.destroy();
  }

  /**
   * FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor() — D1 complete-object dtor.
   *
   * Flexo @0xdfb450..0xdfb459:
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp   FFAVFMetadataCursor::~FFAVFMetadataCursor()   ; tail-call parent D2
   *
   * NOTE: unlike the parent class's D1 (which is a `ud2` trap), this
   * derived class's D1 has a real body that just tail-calls the parent
   * D2.  That is because Itanium ABI requires D1 to be callable for a
   * complete object; if any caller ever destroys a complete
   * FFAVFQTMetadataCursor (as opposed to a base subobject), D1 must not
   * crash.
   *
   * @provenance Flexo @0xdfb450
   * @callee FFAVFMetadataCursor::~FFAVFMetadataCursor() @Flexo 0xdf6b40 (parent D2, ported).
   */
  destroyComplete(): void {
    // Same as D2 for this class — no vtable-restore needed on the JS side.
    super.destroy();
  }

  /**
   * FFAVFQTMetadataCursor::~FFAVFQTMetadataCursor() — D0 deleting dtor.
   *
   * Flexo @0xdfb460..0xdfb477:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     pushq %rbx; pushq %rax
   *     movq  %rdi, %rbx
   *     callq FFAVFMetadataCursor::~FFAVFMetadataCursor()  ; base D2
   *     movq  %rbx, %rdi
   *     addq  $0x8, %rsp; popq %rbx; popq %rbp
   *     jmp   __ZdlPv                                      ; operator delete(this)
   *
   * @provenance Flexo @0xdfb460
   * @callee FFAVFMetadataCursor::~FFAVFMetadataCursor() @Flexo 0xdf6b40 (parent D2, ported).
   * @callee operator delete(void*)  @libc++ (`__ZdlPv` @Flexo stub 0x1497404).
   */
  destroyAndFree(): void {
    // Run destructor chain, then in native the object heap is freed.
    // JS GC handles the free; we just call destroy().
    super.destroy();
  }

  /**
   * FFAVFQTMetadataCursor::createSampleBufferForReadRequest(
   *     int arg1, FFMediaReaderRequestMode arg2, CMTime arg3, FFPrerollBatch* arg4) const
   *
   * Flexo @0xdfb480..0xdfb4a1:
   *
   *     pushq  %rbp; movq %rsp,%rbp
   *     movq   %rcx, %r9                ; r9  = arg4 (FFPrerollBatch*)
   *     movl   %edx, %r8d               ; r8d = arg2 (FFMediaReaderRequestMode)
   *     movl   %esi, %ecx               ; ecx = arg1 (int)
   *     movq   0x8(%rdi), %rax          ; rax = this->mediaReader (FFAVFQTMediaReader*)
   *     movq   0x18(%rdi), %rsi         ; rsi = this->sampleCursor  (AVSampleCursor*)
   *     movq   %rax, %rdi               ; new this = the QT reader
   *     movl   $0x1, %edx               ; edx = 1  (bool isMetadata=true)
   *     popq   %rbp
   *     jmp    FFAVFQTMediaReader::createSampleBufferForReadRequest(
   *              AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *
   * The x86-64 System V argument mapping on the tail-call:
   *   rdi  → this = mediaReader (QT reader)
   *   rsi  → sampleCursor
   *   edx  → 1 (bool "is metadata" — always true because this is the
   *              *metadata* cursor variant)
   *   ecx  → arg1 (int passed through from caller)
   *   r8d  → arg2 (FFMediaReaderRequestMode)
   *   r9   → arg4 (FFPrerollBatch*)
   *   arg3 (CMTime) was passed on the stack by the caller and remains
   *   there for the tail-callee.  (CMTime is a 24-byte struct — a value
   *   parameter is on-stack by SysV ABI when it exceeds two 8-byte
   *   integer eightbytes and cannot be homed in the classified regs.)
   *
   * @provenance Flexo @0xdfb480
   * @callee FFAVFQTMediaReader::createSampleBufferForReadRequest(
   *           AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *         @Flexo (not yet transcribed).
   */
  createSampleBufferForReadRequest(
    arg1: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null,
  ): CMSampleBufferRef | null {
    // Grab base-class fields (+0x8, +0x18).  Both are held on `this`
    // because we extend the parent class; the base ctor set them.
    const reader = this.mediaReader as unknown as FFAVFQTMediaReader | null;
    const cursor = this.sampleCursor;
    // Native: tail-call the reader with isMetadata=true baked in.
    return FFAVFQTMetadataCursor._readerCreateSampleBufferForReadRequest(
      reader,
      cursor,
      /* isMetadata */ true,
      arg1 | 0,
      mode,
      time,
      prerollBatch,
    );
  }

  /**
   * Trampoline for the tail-call target at @0xdfb49d.  This is the
   * frontier — FFAVFQTMediaReader::createSampleBufferForReadRequest is a
   * separate class whose body has not been transcribed yet.  Throwing
   * keeps the demand signal visible without hiding the address.
   *
   * @callee FFAVFQTMediaReader::createSampleBufferForReadRequest(
   *           AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
   *         @Flexo (not yet transcribed at any address in this port).
   */
  private static _readerCreateSampleBufferForReadRequest(
    _reader: FFAVFQTMediaReader | null,
    _cursor: AVSampleCursor | null,
    _isMetadata: boolean,
    _arg1: number,
    _mode: FFMediaReaderRequestMode,
    _time: CMTime,
    _prerollBatch: FFPrerollBatch | null,
  ): CMSampleBufferRef | null {
    throw new Error(
      "FFAVFQTMediaReader::createSampleBufferForReadRequest(AVSampleCursor*, bool, int, " +
      "FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const @Flexo 0xdfb49d (tail-called " +
      "from FFAVFQTMetadataCursor::createSampleBufferForReadRequest @0xdfb480) is not yet " +
      "transcribed."
    );
  }
}
