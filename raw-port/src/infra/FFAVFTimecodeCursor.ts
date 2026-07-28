// FFAVFTimecodeCursor.ts — Flexo FFAVFTimecodeCursor.
//
// Base timecode cursor for the FCP AVFoundation media-reader family. Holds
// three fields (vptr, FFAVFMediaReader*, retained AVSampleCursor*) and
// provides two virtual "get timestamp" queries that forward to the
// AVFoundation ObjC AVSampleCursor's `presentationTimeStamp` / `decodeTimeStamp`
// selectors — returning a CoreMedia CMTime by value (24-byte struct returned
// via the sret ABI).
//
// This class is the parent of FFAVFQTTimecodeCursor (see FFAVFQTTimecodeCursor.ts)
// which was previously ported and inlined this parent's body into its own
// ctor/dtor. This file now transcribes the parent as its own class.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.FFAVFTimecodeCursor.ctors_dtors.s
//               raw-port/re/disasm/Flexo.FFAVFTimecodeCursor.presentationTimeStamp.s
//               raw-port/re/disasm/Flexo.FFAVFTimecodeCursor.decodeTimeStamp.s
//
// Symbols (mangled → demangled):
//   __ZN19FFAVFTimecodeCursorC2EP16FFAVFMediaReaderP14AVSampleCursor  @0xdf6a00
//     FFAVFTimecodeCursor::FFAVFTimecodeCursor(FFAVFMediaReader*, AVSampleCursor*)   [C2]
//   __ZN19FFAVFTimecodeCursorD2Ev                                     @0xdf6a40
//     FFAVFTimecodeCursor::~FFAVFTimecodeCursor()                                     [D2]
//   __ZN19FFAVFTimecodeCursorD1Ev                                     @0x1488f50
//     FFAVFTimecodeCursor::~FFAVFTimecodeCursor()                                     [D1] — ud2 trap
//   __ZN19FFAVFTimecodeCursorD0Ev                                     @0x1488f60
//     FFAVFTimecodeCursor::~FFAVFTimecodeCursor()                                     [D0] — ud2 trap
//   __ZNK19FFAVFTimecodeCursor21presentationTimeStampEv               @0xdf6a80
//     FFAVFTimecodeCursor::presentationTimeStamp() const
//   __ZNK19FFAVFTimecodeCursor15decodeTimeStampEv                     @0xdf6ac0
//     FFAVFTimecodeCursor::decodeTimeStamp() const
//
// Vtable (installed at +0x00 by both C2 and D2):
//   _ZTV19FFAVFTimecodeCursor + 0x10 == @Flexo 0x19158c0.
//   Both C2 (@0xdf6a09 leaq 0xb1eeb0) and D2 (@0xdf6a49 leaq 0xb1ee70) write
//   the SAME address (0x19158c0) into (this): the ctor installs it as
//   part of normal object construction; the dtor re-installs it (in case a
//   derived-class dtor had overwritten it) before running teardown. This is
//   the classic Itanium "restore-vptr in dtor" convention.
//
// Struct layout (recovered):
//
//   +0x00  vptr                   — installed by C2 @0xdf6a10 with 0x19158c0.
//   +0x08  FFAVFMediaReader*      mediaReader  — the reader that vends the
//                                                cursor; retained via
//                                                FFMediaReaderService::retainMediaReader
//                                                in the ctor (tail-jmp @0xdf6a2e),
//                                                released via releaseMediaReader
//                                                in the dtor (@0xdf6a61).
//   +0x10  AVSampleCursor*        sampleCursor — the AV wire cursor;
//                                                _objc_retain'd (@0xdf6a1a) in
//                                                the ctor, _objc_release'd
//                                                (@0xdf6a57) in the dtor.
//   Total: 0x18 bytes.
//
// Un-ported callees (throw-stubs cited by @addr):
//   _objc_retain                                        Flexo indirect fixup @0xdf6a1a
//   _objc_release                                       Flexo indirect fixup @0xdf6a57
//   _objc_msgSend_stret                                 Flexo stub 0x1497986
//   FFMediaReaderService::retainMediaReader             Flexo tail-call @0xdf6a2e
//   FFMediaReaderService::releaseMediaReader            Flexo direct call @0xdf6a61
//   ___clang_call_terminate                             Flexo unwind pad @0xdf6a70
//
// Selectors sent by the two virtual timestamp methods:
//   @Flexo 0x1bf35d0  __objc_selrefs slot → cstring @0x17dfe97
//                                        = "presentationTimeStamp"
//                     Loaded by presentationTimeStamp @0xdf6a8f.
//   @Flexo 0x1bf35d8  __objc_selrefs slot → cstring @0x16c113b
//                                        = "decodeTimeStamp"
//                     Loaded by decodeTimeStamp @0xdf6acf.
//
// The two timestamp methods share the exact same body structure:
//
//   ret = ({0,0,0,0,0} as CMTime);           ; static zero-cleared 24-byte fallback
//   if (this.sampleCursor == null) {         ; @0xdf6a84 testq %rsi,%rsi
//     // zero-clear the 24-byte return slot (movq $0 + xorps/movups)
//     memset(returnSlot, 0, 24);             ; @0xdf6aa8-@0xdf6aae
//     return returnSlot;
//   }
//   sel = @sel(presentationTimeStamp)        ; @0xdf6a8f / @0xdf6acf
//   _objc_msgSend_stret(returnSlot, cursor, sel);
//   return returnSlot;                       ; @0xdf6a9e
//
// The sret ABI is unusual: the compiler passes the address of the CMTime
// return slot in %rdi (before this even gets to %rsi). So @0xdf6a80 reads
// `this` from %rsi (the *second* register), not %rdi. In TS we return the
// CMTime value directly (JS's return-by-value model is equivalent for
// plain-object types).

import { CMTime, kCMTimeZero } from "./CMTime";
import type { FFAVFMediaReader, AVSampleCursor } from "./FFAVFQTTimecodeCursor";

/** Flexo @0x19158c0 — the vptr this class installs at *(this+0x00) in
 *  both C2 (@0xdf6a10) and D2 (@0xdf6a50). Cited for documentation; the
 *  actual vtable content is not decoded here (the two virtual methods
 *  presentationTimeStamp and decodeTimeStamp live at fixed offsets in
 *  the FFAVFTimecodeCursor vtable, but the ordering is not needed for
 *  this port because we dispatch through JS methods). */
const FFAVF_TIMECODE_CURSOR_VPTR = 0x19158c0;

/**
 * FFMediaReaderService::retainMediaReader(FFMediaReader*) — Flexo external
 * tail-call at @0xdf6a2e. Not yet transcribed.
 */
function FFMediaReaderService_retainMediaReader(_reader: FFAVFMediaReader): void {
  // Refcounting is unobservable in JS — no-op body preserves the pair.
  // Callee cited via @0xdf6a2e above; we do NOT throw so the ctor is
  // usable at the TS level (matches how FFAVFQTTimecodeCursor.ts already
  // handles this same callee).
}

/**
 * FFMediaReaderService::releaseMediaReader(FFMediaReader*) — Flexo external
 * direct call at @0xdf6a61 in D2. Not yet transcribed.
 */
function FFMediaReaderService_releaseMediaReader(_reader: FFAVFMediaReader): void {
  // Same reasoning as retainMediaReader — no-op.
}

/**
 * _objc_msgSend_stret(returnSlot, receiver, selector) — Flexo stub
 * @0x1497986. Sends `selector` to `receiver` and stores the returned
 * struct (here, CMTime) at `returnSlot`. Cannot be transcribed here
 * because the receiver's ObjC implementation lives outside Flexo.
 */
function objc_msgSend_stret_CMTime(_receiver: AVSampleCursor, _selector: string): CMTime {
  throw new Error(
    "_objc_msgSend_stret @Flexo stub 0x1497986 (called from FFAVFTimecodeCursor::presentationTimeStamp @0xdf6a99 and ::decodeTimeStamp @0xdf6ad9) — external ObjC-runtime frontier, not yet transcribed",
  );
}

/**
 * FFAVFTimecodeCursor — base timecode cursor.
 *
 * @class Flexo FFAVFTimecodeCursor
 * @provenance Flexo @0xdf6a00 (C2), @0xdf6a40 (D2), @0x1488f50 (D1),
 *             @0x1488f60 (D0), @0xdf6a80 (presentationTimeStamp),
 *             @0xdf6ac0 (decodeTimeStamp).
 */
export class FFAVFTimecodeCursor {
  /**
   * +0x08 — FFAVFMediaReader* mediaReader. Retained via
   * FFMediaReaderService::retainMediaReader in the ctor tail-jmp @0xdf6a2e.
   */
  mediaReader: FFAVFMediaReader | null = null;

  /**
   * +0x10 — AVSampleCursor* sampleCursor. Retained via _objc_retain in the
   * ctor @0xdf6a1a; released via _objc_release in the dtor @0xdf6a57.
   */
  sampleCursor: AVSampleCursor | null = null;

  /**
   * @@0xdf6a00  FFAVFTimecodeCursor::FFAVFTimecodeCursor(
   *              FFAVFMediaReader* reader, AVSampleCursor* cursor)  [C2]
   *
   * Body (15 lines):
   *   pushq %rbp; movq %rsp,%rbp                        ; @0xdf6a00
   *   pushq %rbx; pushq %rax                            ; @0xdf6a04-@0xdf6a05
   *   movq  %rdi, %rbx                                  ; @0xdf6a06 (save this)
   *   leaq  0xb1eeb0(%rip), %rax                        ; @0xdf6a09
   *   movq  %rax, (%rdi)                                ; @0xdf6a10 — vptr = 0x19158c0
   *   movq  %rsi, 0x8(%rdi)                             ; @0xdf6a13 — mediaReader = reader
   *   movq  %rdx, %rdi                                  ; @0xdf6a17 — 1st arg = cursor
   *   callq *_objc_retain                               ; @0xdf6a1a
   *   movq  %rax, 0x10(%rbx)                            ; @0xdf6a20 — sampleCursor = retained
   *   movq  0x8(%rbx), %rdi                             ; @0xdf6a24 — 1st arg = mediaReader
   *   addq  $0x8, %rsp; popq %rbx; popq %rbp            ; @0xdf6a28-@0xdf6a2d
   *   jmp   FFMediaReaderService::retainMediaReader     ; @0xdf6a2e — tail call
   *
   * There is NO C1 alias emitted separately — only the C2 (base) constructor
   * is exported. Derived-class C1 constructors chain to this same body.
   *
   * @callee _objc_retain @Flexo indirect fixup @0xdf6a1a — undecoded ObjC frontier.
   * @callee FFMediaReaderService::retainMediaReader @Flexo tail-call @0xdf6a2e —
   *         external (see stub above).
   * @vtable _ZTV19FFAVFTimecodeCursor + 0x10 = @Flexo 0x19158c0 (installed by @0xdf6a10).
   */
  constructor(reader: FFAVFMediaReader | null, cursor: AVSampleCursor | null) {
    // @0xdf6a13: this.mediaReader = reader
    this.mediaReader = reader;
    // @0xdf6a1a: _objc_retain(cursor). Refcounting unobservable in JS —
    // just hold the reference.
    this.sampleCursor = cursor;
    // @0xdf6a2e: FFMediaReaderService::retainMediaReader(reader)
    if (reader !== null) {
      FFMediaReaderService_retainMediaReader(reader);
    }
    // Native: vptr install (`movq %rax, (%rbx)` @0xdf6a10, %rax = 0x19158c0)
    // is a no-op in JS — the prototype chain handles method dispatch.
  }

  /**
   * @@0xdf6a40  FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  [D2 base dtor]
   *
   * Body (15 lines):
   *   pushq %rbp; movq %rsp,%rbp                        ; @0xdf6a40
   *   pushq %rbx; pushq %rax                            ; @0xdf6a44-@0xdf6a45
   *   movq  %rdi, %rbx                                  ; @0xdf6a46
   *   leaq  0xb1ee70(%rip), %rax                        ; @0xdf6a49
   *   movq  %rax, (%rdi)                                ; @0xdf6a50 — restore vptr = 0x19158c0
   *   movq  0x10(%rdi), %rdi                            ; @0xdf6a53 — sampleCursor
   *   callq *_objc_release                              ; @0xdf6a57
   *   movq  0x8(%rbx), %rdi                             ; @0xdf6a5d — mediaReader
   *   callq FFMediaReaderService::releaseMediaReader    ; @0xdf6a61
   *   addq  $0x8, %rsp; popq %rbx; popq %rbp; retq      ; @0xdf6a66-@0xdf6a6c
   *   movq  %rax, %rdi                                  ; @0xdf6a6d (cold: unwind pad)
   *   callq ___clang_call_terminate                     ; @0xdf6a70
   *
   * The vptr restore at @0xdf6a50 writes the SAME address (0x19158c0) that
   * the ctor installed — this is the standard "restore-parent-vptr" step
   * in the Itanium destructor sequence (relevant when a derived-class dtor
   * had overwritten it earlier in the destruction chain).
   *
   * The final `___clang_call_terminate` unwinding pad handles the case
   * where either objc_release or releaseMediaReader throws; libcxxabi's
   * behavior on an unwind during a destructor is to abort via terminate.
   *
   * @callee _objc_release @Flexo indirect fixup @0xdf6a57 — undecoded ObjC frontier.
   * @callee FFMediaReaderService::releaseMediaReader @Flexo direct @0xdf6a61 —
   *         external (see stub above).
   */
  destroy(): void {
    // @0xdf6a53-@0xdf6a57: _objc_release(sampleCursor). Drop reference.
    this.sampleCursor = null;
    // @0xdf6a5d-@0xdf6a61: FFMediaReaderService::releaseMediaReader(mediaReader).
    if (this.mediaReader !== null) {
      FFMediaReaderService_releaseMediaReader(this.mediaReader);
      this.mediaReader = null;
    }
    // Vptr restore at @0xdf6a50 is a no-op in JS.
  }

  /**
   * @@0x1488f50  FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  [D1 complete-object dtor]
   *
   * Body (4 lines):
   *   pushq %rbp; movq %rsp,%rbp                        ; @0x1488f50
   *   ud2                                               ; @0x1488f54 — trap
   *
   * The D1 (complete-object) destructor is a UD2 trap — the C++ ABI emits
   * this pattern for classes whose D1 is never called at runtime (because
   * all destruction paths go through either D2 for base subobjects or D0
   * for delete-expressions). Any invocation is a hard error.
   */
  destroyComplete(): never {
    throw new Error(
      "FFAVFTimecodeCursor::~FFAVFTimecodeCursor D1 @Flexo 0x1488f50 — asm body is `ud2` (undefined-instruction trap); this symbol exists only for ABI completeness and should never be called at runtime",
    );
  }

  /**
   * @@0x1488f60  FFAVFTimecodeCursor::~FFAVFTimecodeCursor()  [D0 deleting dtor]
   *
   * Body (4 lines):
   *   pushq %rbp; movq %rsp,%rbp                        ; @0x1488f60
   *   ud2                                               ; @0x1488f64 — trap
   *
   * The D0 (deleting) destructor is a UD2 trap — no callers of this symbol
   * exist at runtime because the class is never destroyed via a
   * delete-expression. Same reasoning as D1.
   */
  destroyAndFree(): never {
    throw new Error(
      "FFAVFTimecodeCursor::~FFAVFTimecodeCursor D0 @Flexo 0x1488f60 — asm body is `ud2` (undefined-instruction trap); this symbol exists only for ABI completeness and should never be called at runtime",
    );
  }

  /**
   * @@0xdf6a80  FFAVFTimecodeCursor::presentationTimeStamp() const
   *
   * Body (22 lines):
   *   movq  0x10(%rsi), %rsi                            ; @0xdf6a80 — rsi = this.sampleCursor
   *   testq %rsi, %rsi                                  ; @0xdf6a84
   *   je    0xdf6aa8                                    ; @0xdf6a87 (jump if cursor==NULL)
   *   pushq %rbp; movq %rsp,%rbp                        ; @0xdf6a89-@0xdf6a8a
   *   pushq %rbx; pushq %rax                            ; @0xdf6a8d-@0xdf6a8e
   *   movq  @sel_ref(0x1bf35d0), %rdx                   ; @0xdf6a8f — sel = "presentationTimeStamp"
   *   movq  %rdi, %rbx                                  ; @0xdf6a96 — save return slot
   *   callq _objc_msgSend_stret                         ; @0xdf6a99
   *   movq  %rbx, %rax                                  ; @0xdf6a9e — return the (now-filled) slot
   *   addq  $0x8, %rsp; popq %rbx; popq %rbp; retq      ; @0xdf6aa1-@0xdf6aa7
   *   xorps %xmm0, %xmm0                                ; @0xdf6aa8 (NULL-cursor path)
   *   movups %xmm0, (%rdi)                              ; @0xdf6aab — zero bytes [0..0x10)
   *   movq   $0x0, 0x10(%rdi)                           ; @0xdf6aae — zero bytes [0x10..0x18)
   *   movq   %rdi, %rax                                 ; @0xdf6ab6
   *   retq                                              ; @0xdf6ab9
   *
   * NULL-cursor return semantics: a zero-filled 24-byte CMTime is
   * {value=0, timescale=0, flags=0, epoch=0}. Note this is DIFFERENT from
   * `kCMTimeZero` = {value=0, timescale=1, flags=Valid, epoch=0} — the
   * NULL-cursor return is NOT a valid CMTime (no timescale, no Valid flag).
   * This is a "kCMTimeInvalid"-ish value, deliberately: callers can
   * distinguish "no cursor" from "cursor at t=0" by inspecting `flags`.
   *
   * The non-NULL path invokes the AVSampleCursor's ObjC method
   * `-presentationTimeStamp` via _objc_msgSend_stret. Its return value is
   * the CMTime for the current sample.
   *
   * @callee _objc_msgSend_stret @Flexo stub 0x1497986 (@0xdf6a99) —
   *         external ObjC-runtime frontier.
   * @selref @Flexo 0x1bf35d0 → @0x17dfe97 = "presentationTimeStamp".
   */
  presentationTimeStamp(): CMTime {
    // @0xdf6a80/@0xdf6a84: if (this.sampleCursor == null) → zero-CMTime path.
    if (this.sampleCursor === null) {
      // @0xdf6aa8-@0xdf6ab6: zero-filled 24-byte return (NOT kCMTimeZero;
      // this has flags=0, timescale=0 — an "invalid" CMTime).
      return { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    }
    // @0xdf6a99: _objc_msgSend_stret(cursor, "presentationTimeStamp") → CMTime.
    return objc_msgSend_stret_CMTime(this.sampleCursor, "presentationTimeStamp");
  }

  /**
   * @@0xdf6ac0  FFAVFTimecodeCursor::decodeTimeStamp() const
   *
   * Body (22 lines) — structurally identical to presentationTimeStamp,
   * differing only in the selector reference:
   *   movq  0x10(%rsi), %rsi                            ; @0xdf6ac0
   *   testq %rsi, %rsi                                  ; @0xdf6ac4
   *   je    0xdf6ae8                                    ; @0xdf6ac7
   *   ...
   *   movq  @sel_ref(0x1bf35d8), %rdx                   ; @0xdf6acf — sel = "decodeTimeStamp"
   *   ...
   *   callq _objc_msgSend_stret                         ; @0xdf6ad9
   *   ...
   *   xorps %xmm0,%xmm0; movups %xmm0,(%rdi); movq $0,0x10(%rdi); movq %rdi,%rax; retq
   *
   * Same NULL-cursor semantics: returns a zero-filled (flags=0) invalid
   * CMTime, distinguishable from kCMTimeZero.
   *
   * @callee _objc_msgSend_stret @Flexo stub 0x1497986 (@0xdf6ad9) —
   *         external ObjC-runtime frontier.
   * @selref @Flexo 0x1bf35d8 → @0x16c113b = "decodeTimeStamp".
   */
  decodeTimeStamp(): CMTime {
    // @0xdf6ac0/@0xdf6ac4: if (this.sampleCursor == null) → invalid-CMTime path.
    if (this.sampleCursor === null) {
      // @0xdf6ae8-@0xdf6af6: zero-filled 24-byte return.
      return { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    }
    // @0xdf6ad9: _objc_msgSend_stret(cursor, "decodeTimeStamp") → CMTime.
    return objc_msgSend_stret_CMTime(this.sampleCursor, "decodeTimeStamp");
  }
}

// Suppress unused-import warning for `kCMTimeZero` — cited above as the
// contrast case for the NULL-cursor return semantics but not directly
// referenced in code (the NULL path uses `{...,timescale:0,flags:0}` which
// deliberately differs from kCMTimeZero's `{...,timescale:1,flags:Valid}`).
// Keeping the import so the doc-cite is greppable and future decoders can
// swap the fallback if the asm ever changes.
void kCMTimeZero;
// Suppress unused-const warning for the vptr address (documentation-only).
void FFAVF_TIMECODE_CURSOR_VPTR;

